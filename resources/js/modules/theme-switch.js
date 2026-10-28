// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────── resources/js/modules/theme-switch.js ─────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────── modules/theme-switch.js ───────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Event Listener
// Awaits header render (so #ThemeToggle exists), then manages theme toggle,
// persistence, system sync, and data-themed asset swapping.

import { headerReady } from "../nav/nav-header.js";

await headerReady;

const root   = document.documentElement;
const button = document.getElementById("ThemeToggle");
const system = matchMedia("(prefers-color-scheme: dark)");
const KEY    = "theme";

const saved   = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const current = () => (root.classList.contains("dark") ? "dark" : "light");

const swapAssets = (theme) => {
  document.querySelectorAll("[data-themed]").forEach((el) => {
    // Format: "dark=/path/a.png; light=/path/b.png"
    const map = Object.fromEntries(
      el.dataset.themed.split(";").map((p) => p.trim().split("=").map((x) => x.trim())),
    );
    if (!map[theme]) return;
    if ("src" in el) el.src = map[theme];
    else el.style.backgroundImage = `url("${map[theme]}")`;
  });
};

const apply = (theme) => {
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  swapAssets(theme);
  button?.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
};

apply(current());

button?.addEventListener("click", () => {
  const next = current() === "dark" ? "light" : "dark";
  try { localStorage.setItem(KEY, next); } catch {}
  apply(next);
});

system.addEventListener("change", () => { if (!saved()) apply(system.matches ? "dark" : "light"); });