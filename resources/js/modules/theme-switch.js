/* ──────────────────────────────────────────────────────────────────────────────── */
/* ──────────────────────────────── NP Consultants ──────────────────────────────── */
/* ─────────────────────────── modules/theme-switch.js ──────────────────────────── */
/* ──────────────────────────────────────────────────────────────────────────────── */

/* File Type : Event Listener */
/* Toggle (#ThemeToggle), persistence, system sync, themed assets.            */
/* Themed asset: <img data-themed="dark=/a.svg; light=/b.svg"> (img or any    */
/* element, non-img elements get it as background-image).                     */
/* Load: <script type="module" src="/resources/js/modules/theme-switch.js">   */

const root = document.documentElement;
const button = document.getElementById("ThemeToggle");
const system = matchMedia("(prefers-color-scheme: dark)");
const KEY = "theme";

const saved = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const current = () => (root.classList.contains("dark") ? "dark" : "light");

const swapAssets = (theme) => {
  document.querySelectorAll("[data-themed]").forEach((el) => {
    const map = Object.fromEntries(
      el.dataset.themed.split(";").map((p) => p.split("=").map((x) => x.trim())),
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