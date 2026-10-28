// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────────── image-loading-debug.js ──────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Debug (development only, remove before going live)
// Console   : imageLoadingDebug.show("selector")  show the loader on loaded images or map frames
//             imageLoadingDebug.all()             show all available image and map loaders
//             imageLoadingDebug.clear()            restore the normal loaded state
//             imageLoadingDebug.help()             print this list

import { setDebugImageLoading } from "../modules/image-loading.js";

(() => {
  const activeImages = new Set();
  const activeMaps = new Set();

  const show = (selector = "img") => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) {
      console.warn(`imageLoadingDebug: no elements matched "${selector}"`);
      return;
    }

    elements.forEach((element) => {
      if (element instanceof HTMLImageElement) {
        if (activeImages.has(element)) return;
        if (element.dataset.imageLoading === "true") {
          console.warn("imageLoadingDebug: image is already loading", element);
          return;
        }
        if (!element.complete || element.naturalWidth === 0) {
          console.warn("imageLoadingDebug: image is not fully loaded", element);
          return;
        }

        setDebugImageLoading(element, true);
        activeImages.add(element);
        return;
      }

      if (element.matches(".map-frame")) {
        if (!element.classList.contains("is-loading")) {
          element.classList.add("is-loading");
          activeMaps.add(element);
        }
        return;
      }

      console.warn("imageLoadingDebug: select an image or .map-frame", element);
    });
  };

  const clear = () => {
    activeImages.forEach((image) => {
      if (image.isConnected) setDebugImageLoading(image, false);
    });
    activeImages.clear();

    activeMaps.forEach((frame) => {
      if (frame.isConnected) frame.classList.remove("is-loading");
    });
    activeMaps.clear();
  };

  const api = {
    show,
    all() {
      show("img, .map-frame");
    },
    clear,
    help() {
      console.log(
        [
          'imageLoadingDebug.show("selector")',
          "imageLoadingDebug.all()",
          "imageLoadingDebug.clear()",
        ].join("\n"),
      );
    },
  };

  window.imageLoadingDebug = api;
  console.info("imageLoadingDebug ready. Type imageLoadingDebug.help()");
})();
