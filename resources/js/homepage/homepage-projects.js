// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ───────────────────────────── homepage-projects.js ─────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json -> homepageProjects, projects (featured: true), placeholders
// Target    : <section class="projects"></section>  (load with <script type="module">)

import { getPaths, resolvePath } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".projects");
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
      const homepageProjectsUrl =
        paths.homepageProjects || paths["homepage-projects"];
      const placeholdersUrl = paths.placeholders;
      const projectsUrl = paths.projects;

      const [data, placeholders, projects] = await Promise.all([
        fetch(homepageProjectsUrl).then((r) => r.json()),
        fetch(placeholdersUrl).then((r) => r.json()),
        fetch(projectsUrl).then((r) => r.json()),
      ]);

      const fallback = resolvePath(placeholders?.project);
      const featured = (
        Array.isArray(projects) ? projects : projects?.projects || []
      ).filter((p) => p.featured === true);

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

      // --i = intro order (cards beyond the first row share the last delay)
      const items = featured
        .map((project, index) => {
          const tag = project.link ? "a" : "div";
          const href = project.link
            ? ` href="${escapeHTML(resolvePath(project.link))}"`
            : "";
          const image = resolvePath(project.image || placeholders?.project);
          return `
            <div class="item" style="--i:${Math.min(index, 2) + 4}">
                <${tag} class="card"${href}>
                    <div class="image"><img src="${escapeHTML(image)}" alt="${escapeHTML(project.title)}" loading="lazy"></div>
                    <div class="info">
                        <h3>${escapeHTML(project.title)}</h3>
                        <p>${escapeHTML(project.description || project.text)}</p>
                    </div>
                </${tag}>
            </div>`;
        })
        .join("");

      section.innerHTML = `
            <div class="title" style="--i:1"><h2>${escapeHTML(data?.title)}</h2></div>
            <p class="description" style="--i:2">${escapeHTML(data?.description)}</p>
            ${buttons ? `<div class="actions" style="--i:3">${buttons}</div>` : ""}
            <div class="grid">${items}</div>`;

      // Broken image -> placeholder, once
      section.querySelectorAll("img").forEach((img) =>
        img.addEventListener(
          "error",
          () => {
            img.src = fallback;
          },
          { once: true },
        ),
      );

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
      console.error("Failed to render homepage projects section:", err);
    }
  }

  write();
})();
