// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────────────────── intro.js ───────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Init
// Reads --intro-duration from root.css, then adds .intro-done to <html> when it ends.
// Skipped when the user prefers reduced motion (intro.css already shows <main>).

const root = document.documentElement;
const duration = getComputedStyle(root)
  .getPropertyValue("--intro-duration")
  .trim();
const ms = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduced) setTimeout(() => root.classList.add("intro-done"), ms);
