// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────────────── homepage-services.js ─────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.homepageServices, paths.placeholders from paths.json
// Target    : <section class="services"></section>
// A missing or broken image shows the "services" placeholder.
// Buttons come from JSON: "type" is "primary" or a modifier class (e.g. "secondary").

import { getPaths, resolvePath } from "../modules/paths.js";

const section = document.querySelector(".services");

// Escape text before it goes into innerHTML
const escapeHTML = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

async function writeServices() {
  if (!section) return;

  const paths = await getPaths();
  const servicesPath = paths.homepageServices || paths["homepage-services"];
  const [data, placeholders] = await Promise.all([
    fetch(servicesPath).then((r) => r.json()),
    fetch(paths.placeholders).then((r) => r.json()),
  ]);
  const services = data.services;
  const half = Math.ceil(services.length / 2);

  // First half sits left of the image, second half right. --i = stagger step, --dir = slide side
  const panels = services
    .map(
      (service, index) => `
        <div class="item" style="--i:${index % half};--dir:${index < half ? -1 : 1}">
            <article class="panel">
                <h3>${escapeHTML(service.title)}</h3>
                <p>${escapeHTML(service.text)}</p>
            </article>
        </div>`,
    )
    .join("");

  // Buttons: "primary" is a plain .button, any other type is added as a modifier class
  const buttons = (data.buttons || [])
    .map((button) => {
      const type =
        button.type && button.type !== "primary" ? ` ${button.type}` : "";
      const icon = button.icon
        ? ` <span>${escapeHTML(button.icon)}</span>`
        : "";
      return `<a href="${escapeHTML(resolvePath(button.href))}" class="button${escapeHTML(type)}">${escapeHTML(button.text)}${icon}</a>`;
    })
    .join("");

  const imageSrc = resolvePath(data.image?.src || placeholders?.services);
  const fallbackSrc = resolvePath(placeholders?.services);

  section.innerHTML = `
        <div class="title">
            <h2>${escapeHTML(data.title)}</h2>
        </div>
        <p class="description">${escapeHTML(data.description)}</p>
        ${buttons ? `<div class="actions">${buttons}</div>` : ""}
        <div class="grid" style="--rows:${half};--count:${services.length}">
            <figure class="image">
                <img src="${escapeHTML(imageSrc)}" data-fallback="${escapeHTML(fallbackSrc)}" alt="${escapeHTML(data.image?.alt || "")}" loading="lazy">
            </figure>
            ${panels}
        </div>`;

  // Play the entrance animation once, when the section scrolls into view
  new IntersectionObserver(
    (entries, observer) => {
      if (entries[0].isIntersecting) {
        section.classList.add("animate");
        observer.disconnect();
      }
    },
    { threshold: 0.3 },
  ).observe(section);
}

writeServices();
