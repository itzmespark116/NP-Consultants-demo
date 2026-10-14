// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────── modules/nav-toggle.js ─────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Event Listener
// Opens/closes the mobile menu. Keep the media query in sync with the CSS.

const header = document.querySelector("main > header") || document.querySelector("header");
const toggle = document.getElementById("navToggle");
const menu = document.getElementById("navLinks");
const mobile = matchMedia("(max-width: 720px)");

if (toggle && menu) {
  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
  const set = (open) => toggle.setAttribute("aria-expanded", String(open));

  toggle.addEventListener("click", () => set(!isOpen()));

  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) set(false);
  });

  document.addEventListener("click", (e) => {
    if (isOpen() && header && !header.contains(e.target)) {
      set(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      set(false);
      toggle.focus();
    }
  });

  mobile.addEventListener("change", () => {
    if (isOpen()) set(false);
  });
}
