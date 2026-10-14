// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── modules/navbar.js ───────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Event Listener
// Sets [data-scrolled] on <header> once the page is scrolled past THRESHOLD.

const header = document.querySelector("main > header") || document.querySelector("header");
const THRESHOLD = 40;
let ticking = false;

if (header) {
  const update = () => {
    const isScrolled = (window.scrollY || document.documentElement.scrollTop || 0) > THRESHOLD;
    header.toggleAttribute("data-scrolled", isScrolled);
    ticking = false;
  };

  addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}
