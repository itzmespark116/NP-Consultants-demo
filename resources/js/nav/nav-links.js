// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────────────── modules/nav-links.js ─────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Event Listener
// Marks the current page and slides the underline (--w --x --o) on hover/focus.

import { ready } from "./nav-writer.js";
await ready;

const menu = document.getElementById("navLinks");
if (menu) {
  const links = [...menu.querySelectorAll("a")];
  const mobile = matchMedia("(max-width: 720px)");
  const norm = (p) => p.replace(/\/+$/, "").toLowerCase() || "/";

  const path = norm(location.pathname);
  const current = links.find((a) => {
    const href = norm(new URL(a.href, location.origin).pathname);
    if (href === "/") return path === "/" || path.endsWith("/index.html");
    return path === href || path.startsWith(href + "/") || path.endsWith(href) || path.includes(href + "/");
  });

  links.forEach((a) =>
    a === current ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"),
  );

  const moveTo = (el) => {
    if (!el || mobile.matches) return menu.style.setProperty("--o", "0");
    const m = menu.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    menu.style.setProperty("--w", `${r.width}px`);
    menu.style.setProperty("--x", `${r.left - m.left - menu.clientLeft}px`);
    menu.style.setProperty("--o", "1");
  };

  const reset = () => {
    const active = links.find((a) => a.matches(":hover, :focus"));
    moveTo(active || current);
  };

  links.forEach((a) => {
    a.addEventListener("mouseenter", () => moveTo(a));
    a.addEventListener("focus", () => moveTo(a));
  });

  menu.addEventListener("mouseleave", reset);
  menu.addEventListener("focusout", (e) => {
    if (!menu.contains(e.relatedTarget)) reset();
  });

  mobile.addEventListener("change", reset);
  addEventListener("resize", reset);
  document.fonts?.ready.then(reset);

  reset();
}
