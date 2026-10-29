// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────── resources/js/modules/image-loading.js ─────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Image Loading Utility
// Manages smooth loading states, skeleton placeholders, and error fallbacks for images.

import { getPaths, resolvePath } from "./paths.js";

const states = new WeakMap();
const containers = new WeakMap();

const fallbackReady = getPaths()
  .then(async (paths) => {
    const response = await fetch(paths.placeholders);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} fetching placeholders`);
    }
    const placeholders = await response.json();
    const fallback = resolvePath(placeholders?.project);
    if (!fallback) throw new Error("Missing project image placeholder");
    return fallback;
  })
  .catch((error) => {
    console.error("Failed to load image fallback:", error);
    return null;
  });

function updateIndicator(image, loading) {
  const state = states.get(image);
  if (!state || state.loading === loading) return;

  state.loading = loading;
  const container = image.parentElement;
  if (!container) return;

  let containerState = containers.get(container);
  if (!containerState && loading) {
    const indicator = document.createElement("span");
    indicator.className = "image-loading-indicator";
    indicator.setAttribute("aria-hidden", "true");
    container.classList.add("image-loading-container");
    container.append(indicator);
    containerState = { count: 0, indicator };
    containers.set(container, containerState);
  }
  if (!containerState) return;

  containerState.count += loading ? 1 : -1;
  if (containerState.count <= 0) {
    containerState.indicator.remove();
    container.classList.remove("image-loading-container");
    containers.delete(container);
  }
}

function beginLoading(image) {
  image.removeAttribute("data-image-ready");
  image.dataset.imageLoading = "true";
  updateIndicator(image, true);
}

function finishLoading(image) {
  image.removeAttribute("data-image-loading");
  image.dataset.imageReady = "true";
  updateIndicator(image, false);
}

function watchImage(image) {
  let state = states.get(image);
  if (!state) {
    state = {
      source: image.getAttribute("src"),
      fallbackSource: null,
      fallbackUsed: false,
      loading: false,
    };
    states.set(image, state);

    image.addEventListener("load", () => {
      if (image.getAttribute("src") !== state.source) watchImage(image);
      if (image.complete && image.naturalWidth > 0) finishLoading(image);
    });
    image.addEventListener("error", async () => {
      const failedSource = image.currentSrc || image.src;
      const fallback = image.dataset.fallback || (await fallbackReady);
      const resolvedFallback = fallback
        ? new URL(fallback, document.baseURI).href
        : "";

      if (
        !state.fallbackUsed &&
        resolvedFallback &&
        failedSource !== resolvedFallback
      ) {
        state.fallbackUsed = true;
        state.fallbackSource = resolvedFallback;
        beginLoading(image);
        image.setAttribute("src", resolvedFallback);
        return;
      }

      finishLoading(image);
      image.dataset.imageFailed = "true";
    });
  }

  const source = image.getAttribute("src");
  if (source !== state.source) {
    const resolvedSource = source ? new URL(source, document.baseURI).href : null;
    if (resolvedSource !== state.fallbackSource) {
      state.fallbackUsed = false;
      state.fallbackSource = null;
    }
    state.source = source;
    beginLoading(image);
  }

  if (!source) {
    finishLoading(image);
    return;
  }

  image.removeAttribute("data-image-failed");
  beginLoading(image);
  if (image.complete) {
    if (image.naturalWidth > 0) {
      finishLoading(image);
    } else {
      image.dispatchEvent(new Event("error"));
    }
  }
}

export function setDebugImageLoading(image, loading) {
  watchImage(image);
  if (loading) {
    beginLoading(image);
  } else {
    finishLoading(image);
  }
}

function watchImages(node) {
  if (node instanceof HTMLImageElement) watchImage(node);
  node.querySelectorAll?.("img").forEach(watchImage);
}

watchImages(document);

new MutationObserver((records) => {
  records.forEach((record) => {
    if (record.type === "attributes") {
      watchImage(record.target);
      return;
    }
    record.addedNodes.forEach((node) => {
      if (node instanceof Element) watchImages(node);
    });
  });
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["src"],
  childList: true,
  subtree: true,
});
