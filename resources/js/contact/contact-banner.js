// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── contact-banner.js ───────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML) + scroll behaviour
// Data      : paths.json -> contactPage (banner.title)
// Target    : <div class="banner"></div>  (load with <script type="module">)
// Adds the "scrolled" class to the banner once the page is scrolled past the threshold.

import { getPaths } from "../modules/paths.js";

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
      const data = await fetch(paths.contactPage || paths["contact-page"]).then(
        (r) => r.json(),
      );

      banner.innerHTML = `<h1>${escapeHTML(data?.banner?.title)}</h1>`;
    } catch (err) {
      console.error("Failed to render contact banner:", err);
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
  write();
})();
