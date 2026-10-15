// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────── modules/nav-writer.js ─────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Fills <ul id="navLinks"> from nav path in paths.json. Other modules
// that need the links must `await ready` first.

import { getPath } from "../modules/paths.js";

const escape = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const render = async () => {
  const menu = document.getElementById("navLinks");
  if (!menu) return;

  try {
    const navPath = await getPath("nav");
    const res = await fetch(navPath);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${navPath}`);
    const data = await res.json();
    const links = Array.isArray(data?.links) ? data.links : [];

    if (links.length) {
      menu.innerHTML = links
        .map((l) => `<li><a href="${escape(l.href)}">${escape(l.label)}</a></li>`)
        .join("");
    }
  } catch (err) {
    console.error("Failed to load navigation links:", err);
  }
};

export const ready = render();
