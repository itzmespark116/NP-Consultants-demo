// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────────────── projects-grid.js ───────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json keys "projects" and "placeholders" (kind "project")
// Target    : <section class="projects-grid"></section>
// Order     : category groups as listed in JSON; inside a group featured first, then ongoing, then newest year.
// Cards swap their images at random (timing from JSON "settings"); a missing image shows the placeholder.

import { getPaths, resolvePath } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".projects-grid");
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

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  // featured first, then ongoing, then newest year
  const compare = (a, b) =>
    (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
    (b.ongoing ? 1 : 0) - (a.ongoing ? 1 : 0) ||
    (Number(b.year) || 0) - (Number(a.year) || 0);

  async function write() {
    try {
      const paths = await getPaths();
      const [data, placeholders] = await Promise.all([
        fetch(
          paths.projects || resolvePath("/resources/data/projects.json"),
        ).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status} fetching projects.json`);
          return r.json();
        }),
        fetch(
          paths.placeholders ||
            resolvePath("/resources/data/placeholders.json"),
        ).then((r) => {
          if (!r.ok)
            throw new Error(`HTTP ${r.status} fetching placeholders.json`);
          return r.json();
        }),
      ]);

      const labels = data?.labels || {};
      const settings = data?.settings || {};
      const fallback = resolvePath(placeholders?.project);

      // one-time placeholder swap for broken images
      const guard = (img) =>
        img.addEventListener(
          "error",
          () => {
            img.src = fallback;
          },
          { once: true },
        );

      // group by category, keep the JSON order, unknown categories go last
      const groups = (data.categories || []).map((category) => ({
        ...category,
        projects: [],
      }));
      const other = {
        id: "other",
        label: labels.other || "Other",
        projects: [],
      };
      (data.projects || []).forEach((project, index) => {
        const entry = { ...project, id: project.id || `project-${index}` };
        (
          groups.find((group) => group.id === entry.category) || other
        ).projects.push(entry);
      });
      groups.push(other);
      const filled = groups.filter((group) => group.projects.length);
      filled.forEach((group) => group.projects.sort(compare));

      const projectById = new Map();
      const status = (project) =>
        project.ongoing
          ? labels.ongoing || "Ongoing"
          : labels.finished || "Completed";

      const card = (project, group) => {
        projectById.set(project.id, project);
        const images =
          project.images && project.images.length
            ? project.images
            : [placeholders?.project];
        const text = [
          project.name,
          project.type,
          project.year,
          group.label,
          status(project),
        ]
          .join(" ")
          .toLowerCase();
        const leftTags = project.ongoing
          ? `<span class="tags tags-left"><span class="status"><span class="dot"></span>${escapeHTML(labels.ongoing || "Ongoing")}</span></span>`
          : "";
        const rightTags = project.featured
          ? `<span class="tags tags-right"><span class="badge">${escapeHTML(labels.featured)}</span></span>`
          : "";
        return `
                  <div class="item" data-category="${escapeHTML(group.id)}" data-search="${escapeHTML(text)}">
                      <button type="button" class="card${project.featured ? " featured" : ""}${project.ongoing ? " ongoing" : ""}" data-id="${escapeHTML(project.id)}"
                          aria-label="${escapeHTML(`${project.name}, ${project.type}, ${project.year}, ${status(project)}`)}">
                          ${leftTags}
                          ${rightTags}
                          <span class="slides">${images.map((src) => `<img data-src="${escapeHTML(resolvePath(src))}" alt="" loading="lazy" decoding="async">`).join("")}</span>
                          <span class="info" data-arrow="${escapeHTML(data.arrow ?? "→")}">
                              <span class="name">${escapeHTML(project.name)}</span>
                              <span class="meta">${escapeHTML(project.type)} · ${escapeHTML(project.year)}</span>
                          </span>
                      </button>
                  </div>`;
      };

      // --i = intro order
      const groupHTML = filled
        .map(
          (group, index) => `
              <div class="group" data-category="${escapeHTML(group.id)}" style="--i:${index + 2}">
                  <h3 class="label">${escapeHTML(group.label)}</h3>
                  <div class="grid">${group.projects.map((project) => card(project, group)).join("")}</div>
              </div>`,
        )
        .join("");

      const chips = [{ id: "all", label: labels.all }, ...filled]
        .map(
          (group, index) =>
            `<button type="button" class="chip" data-filter="${escapeHTML(group.id)}" aria-pressed="${index === 0}">${escapeHTML(group.label)}</button>`,
        )
        .join("");

      section.innerHTML = `
              <div class="controls" style="--i:1">
                  <div class="filters" role="group" aria-label="${escapeHTML(labels.filter)}">${chips}</div>
                  <label class="search-field">
                      <svg class="search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" stroke="currentColor" stroke-width="1.8"></circle><path d="m15.5 15.5 4.2 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>
                      <input class="search" type="search" placeholder="${escapeHTML(labels.search)}" aria-label="${escapeHTML(labels.search)}" autocomplete="off">
                  </label>
              </div>
              <div class="groups">${groupHTML}</div>
              <p class="empty" hidden>${escapeHTML(labels.empty)}</p>
              <dialog class="popup" aria-labelledby="projects-grid-popup-title">
                  <button type="button" class="close" aria-label="${escapeHTML(labels.close)}">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"></path></svg>
                  </button>
                  <div class="sheet"></div>
              </dialog>`;

      section.querySelectorAll(".slides img").forEach(guard);

      // ───────────── filter + search (cards stay in the DOM, so image timers keep running) ─────────────
      const empty = section.querySelector(".empty");
      let active = "all";
      let query = "";

      const apply = () => {
        let shown = 0;
        section.querySelectorAll(".group").forEach((group) => {
          let count = 0;
          group.querySelectorAll(".item").forEach((item) => {
            const match =
              (active === "all" || item.dataset.category === active) &&
              (!query || item.dataset.search.includes(query));
            item.hidden = !match;
            if (match) count += 1;
          });
          group.hidden = !count;
          shown += count;
        });
        empty.hidden = shown > 0;
      };

      section.querySelector(".filters").addEventListener("click", (event) => {
        const chip = event.target.closest(".chip");
        if (!chip) return;
        active = chip.dataset.filter;
        section
          .querySelectorAll(".chip")
          .forEach((el) =>
            el.setAttribute("aria-pressed", String(el === chip)),
          );
        apply();
      });

      section.querySelector(".search").addEventListener("input", (event) => {
        query = event.target.value.trim().toLowerCase();
        apply();
      });

      // ───────────── random image swap per card ─────────────
      const interval = settings.interval ?? 4500;
      const jitter = settings.jitter ?? 2500;
      const cardStates = new Map();

      const loadSlide = (img) => {
        if (!img.hasAttribute("data-src")) return;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      };

      const schedule = (state) => {
        clearTimeout(state.timer);
        if (
          state.next &&
          state.visible &&
          !document.hidden &&
          !state.card.closest(".item").hidden &&
          !state.card.closest(".group").hidden
        ) {
          state.timer = setTimeout(state.next, interval + Math.random() * jitter);
        }
      };

      const slidesObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const state = cardStates.get(entry.target);
          if (!state) return;
          state.visible = entry.isIntersecting;
          if (state.visible) loadSlide(state.slides[state.current]);
          schedule(state);
        });
      });

      section.querySelectorAll(".card").forEach((cardEl) => {
        const slides = [...cardEl.querySelectorAll(".slides img")];
        if (!slides.length) return;
        let current = Math.floor(Math.random() * slides.length);
        slides[current]?.classList.add("on");
        const state = {
          card: cardEl,
          slides,
          current,
          timer: 0,
          visible: false,
          next: null,
        };

        if (slides.length > 1 && !reduced.matches) {
          state.next = () => {
            let pick;
            do {
              pick = Math.floor(Math.random() * slides.length);
            } while (pick === state.current);
            loadSlide(slides[pick]);
            slides[state.current].classList.remove("on");
            slides[pick].classList.add("on");
            state.current = pick;
            schedule(state);
          };
        }

        cardStates.set(cardEl, state);
        slidesObserver.observe(cardEl);
      });

      document.addEventListener("visibilitychange", () => {
        cardStates.forEach(schedule);
      });

      // ───────────── popup ─────────────
      const popup = section.querySelector(".popup");
      const sheet = popup.querySelector(".sheet");

      section.querySelector(".groups").addEventListener("click", (event) => {
        const cardEl = event.target.closest(".card");
        if (!cardEl) return;
        const project = projectById.get(cardEl.dataset.id);
        if (!project) return;
        const images =
          project.images && project.images.length
            ? project.images
            : [placeholders?.project];
        sheet.className = `sheet${project.ongoing ? " ongoing" : ""}`;
        sheet.innerHTML = `
                  <h3 id="projects-grid-popup-title">${escapeHTML(project.name)}</h3>
                  <p>${escapeHTML(project.type)} · ${escapeHTML(project.year)} <span class="state">${escapeHTML(status(project))}</span></p>
                  <div class="gallery">${images.map((src) => `<img src="${escapeHTML(resolvePath(src))}" alt="${escapeHTML(project.name)}" loading="lazy" decoding="async">`).join("")}</div>`;
        sheet.querySelectorAll("img").forEach(guard);
        sheet.scrollTop = 0;
        popup.showModal();
      });

      popup
        .querySelector(".close")
        .addEventListener("click", () => popup.close());
      // a click on the backdrop lands on the dialog itself
      popup.addEventListener("click", (event) => {
        if (event.target === popup) popup.close();
      });

      // Play the entrance animation once, when the section scrolls into view
      new IntersectionObserver((entries, observer) => {
        if (entries[0].isIntersecting) {
          section.classList.add("animate");
          observer.disconnect();
        }
      }).observe(section);
    } catch (err) {
      console.error("Failed to render projects grid:", err);
    }
  }

  write();
})();
