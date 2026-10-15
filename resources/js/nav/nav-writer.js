// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────── nav/nav-writer.js ──────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Awaits nav-header.js (so #navLinks exists), then fills it from paths.json → nav.json.
// Other modules that need the links must `await ready` first.

import { getPath } from "../modules/paths.js";
import { headerReady } from "./nav-header.js";

const escape = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const render = async () => {
  await headerReady;

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
