// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────── resources/js/modules/intro.js ─────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────────── modules/intro.js ───────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Init
// Sets the intro splash image from paths.json, then adds .intro-done to <html>
// after --intro-duration. Skipped when the user prefers reduced motion.

import { getPaths } from "./paths.js";

const root    = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Set intro image src from paths.json (brand dark is the default)
(async () => {
  const paths  = await getPaths();
  const img    = document.querySelector(".intro img");
  const theme  = root.classList.contains("dark") ? "dark" : "light";
  const src    = paths.brand?.[theme] ?? paths.brand?.dark ?? "";

  if (img && src) {
    img.src = src;
    img.setAttribute("data-themed",
      `dark=${paths.brand?.dark ?? ""}; light=${paths.brand?.light ?? ""}`);
  }
})();

// Timer: add .intro-done after CSS --intro-duration
if (!reduced) {
  const duration = getComputedStyle(root).getPropertyValue("--intro-duration").trim();
  const ms = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
  setTimeout(() => root.classList.add("intro-done"), ms);
} else {
  root.classList.add("intro-done");
}
