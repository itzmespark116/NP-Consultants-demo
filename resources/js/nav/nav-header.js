// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── nav/nav-header.js ───────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Writes the full <header> markup into <header id="mainHeader">.
// All asset paths come from paths.json via paths.js.
// Must run before nav-writer.js, nav-links.js, nav-toggle.js, theme-switch.js.

import { getPaths } from "../modules/paths.js";

const escape = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const headerReady = (async () => {
  const header = document.getElementById("mainHeader");
  if (!header) return;

  const paths = await getPaths();

  const brandDark  = escape(paths.brand?.dark  ?? "");
  const brandLight = escape(paths.brand?.light ?? "");
  const iconLight  = escape(paths.icons?.lightMode ?? "");
  const iconDark   = escape(paths.icons?.darkMode  ?? "");
  const homeHref   = escape(paths.home ?? "/home/");

  // Inline placeholder SVG as default src (replaced immediately by theme-switch after load)
  const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%234077ee'/%3E%3C/svg%3E";

  header.innerHTML = `
    <nav aria-label="Main navigation">
      <a href="${homeHref}" aria-label="NP Consultants home">
        <img
          src="${placeholder}"
          data-themed="dark=${brandDark}; light=${brandLight}"
          alt="NP Consultants">
      </a>

      <button id="ThemeToggle" type="button" aria-label="Switch theme">
        <img
          data-themed="dark=${iconLight}; light=${iconDark}"
          alt="">
      </button>

      <button id="navToggle" type="button"
        aria-label="Toggle navigation menu"
        aria-expanded="false"
        aria-controls="navLinks">
        <span></span>
      </button>

      <ul id="navLinks"></ul>
    </nav>`;
})();

