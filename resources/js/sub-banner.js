// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────────────────── sub-banner.js ────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML) + scroll behaviour
// Data      : paths.json -> banner data source from data-source (banner.title or title)
// Target    : <div class="banner"></div>  (load with <script type="module">)
// Adds the "scrolled" class to the banner once the page is scrolled past the threshold.

import { getPaths } from "./modules/paths.js";

(() => {
  const banner = document.querySelector(".banner");
  if (!banner) return;

  const THRESHOLD = 40; // px scrolled before the banner shrinks

  // Escape text before it goes into innerHTML
  const escapeHTML = (text) =>
    String(text ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const update = () =>
    banner.classList.toggle("scrolled", window.scrollY > THRESHOLD);

  async function write() {
    try {
      const paths = await getPaths();
      const source = banner.dataset.source;
      const url = paths[source];
      if (!url) throw new Error(`Missing banner data path for "${source}"`);

      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP ${response.status} fetching banner data`);
      const data = await response.json();
      const title = data?.banner?.title ?? data?.title;
      if (!title) throw new Error(`Missing banner title for "${source}"`);

      banner.innerHTML = `<h1>${escapeHTML(title)}</h1>`;
    } catch (err) {
      console.error("Failed to render sub-page banner:", err);
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
  write();
})();
