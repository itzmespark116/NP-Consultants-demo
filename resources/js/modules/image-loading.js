import { getPaths, resolvePath } from "./paths.js";

const states = new WeakMap();

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

function finishLoading(image) {
  image.removeAttribute("data-image-loading");
}

function watchImage(image) {
  let state = states.get(image);
  if (!state) {
    state = {
      source: image.getAttribute("src"),
      fallbackSource: null,
      fallbackUsed: false,
    };
    states.set(image, state);

    image.addEventListener("load", () => finishLoading(image));
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
        image.setAttribute("src", resolvedFallback);
        image.dataset.imageLoading = "true";
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
  }

  if (!source) {
    finishLoading(image);
    return;
  }

  image.removeAttribute("data-image-failed");
  image.dataset.imageLoading = "true";
  if (image.complete) {
    if (image.naturalWidth > 0) {
      finishLoading(image);
    } else {
      image.dispatchEvent(new Event("error"));
    }
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
