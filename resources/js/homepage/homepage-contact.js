// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────────────── homepage-contact.js ──────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json -> homepageContact
// Target    : <section class="cta"></section>  (load with <script type="module">)

import { getPaths, resolvePath } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".cta");
  if (!section) return;

  // Escape text before it goes into innerHTML
  const escapeHTML = (text) =>
    String(text ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  async function write() {
    try {
      const paths = await getPaths();
      const url = paths.homepageContact || paths["homepage-contact"];
      const data = await fetch(url).then((r) => r.json());

      const buttons = (data?.buttons || [])
        .map((button) => {
          const type =
            button.type && button.type !== "primary" ? ` ${button.type}` : "";
          const icon = button.icon
            ? ` <span>${escapeHTML(button.icon)}</span>`
            : "";
          return `<a href="${escapeHTML(resolvePath(button.href))}" class="button${escapeHTML(type)}">${escapeHTML(button.text)}${icon}</a>`;
        })
        .join("");

      // --i = intro order
      section.innerHTML = `
            <div class="title" style="--i:1"><h2>${escapeHTML(data?.title)}</h2></div>
            <p class="description" style="--i:2">${escapeHTML(data?.description)}</p>
            ${buttons ? `<div class="actions" style="--i:3">${buttons}</div>` : ""}`;

      // Play the entrance animation once, when the section scrolls into view
      new IntersectionObserver(
        (entries, observer) => {
          if (entries[0].isIntersecting) {
            section.classList.add("animate");
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      ).observe(section);
    } catch (err) {
      console.error("Failed to render homepage contact section:", err);
    }
  }

  write();
})();
