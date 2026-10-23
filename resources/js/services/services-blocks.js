// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────────────── services-blocks.js ────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json key "services"
// Target    : <section class="services" id="services"></section>
// One text-only card per service, stacked on the y-axis.

import { getPaths, resolvePath } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".services");
  if (!section) return;

  // Escape text before it goes into innerHTML
  const escapeHTML = (text) =>
    String(text).replace(
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
      const servicesPath =
        paths.services || resolvePath("/resources/data/services.json");
      const fetchJSON = async (url, name) => {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`HTTP ${response.status} fetching ${name}`);
        return response.json();
      };
      const data = await fetchJSON(servicesPath, "services.json");
      if (!Array.isArray(data?.services)) {
        throw new Error("services.json must contain a services array");
      }

      const blocks = data.services
        .map((service, index) => {
          const descriptions = Array.isArray(service.description)
            ? service.description
            : [service.description];
          const paragraphs = descriptions
            .filter(Boolean)
            .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
            .join("");
          const bullets = (service.bullets || [])
            .map((bullet) => `<li>${escapeHTML(bullet)}</li>`)
            .join("");
          return `
            <div class="item" style="--i:${index + 2}">
                <article class="block">
                    <h3>${escapeHTML(service.title)}</h3>
                    <div class="text">
                        ${paragraphs}
                        ${bullets ? `<ul>${bullets}</ul>` : ""}
                    </div>
                </article>
            </div>`;
        })
        .join("");

      section.innerHTML = `<div class="list">${blocks}</div>`;

      // Each element plays its entrance once, when it scrolls into view
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 },
      );
      section
        .querySelectorAll(".item")
        .forEach((el) => observer.observe(el));
    } catch (error) {
      console.error("Failed to render services:", error);
    }
  }

  write();
})();
