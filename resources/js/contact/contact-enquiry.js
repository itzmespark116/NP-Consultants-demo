// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── contact-enquiry.js ──────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json -> contact (heading, info), contactForm (fields, button, note)
// Target    : <section class="enquiry" id="enquiry"></section>  (load with <script type="module">)
// Info rows with the same title share one box. Sending is done by contact-enquiry-send.js.

import { getPaths, resolvePath } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".enquiry");
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

  // ` name="value"` or nothing when the value is missing
  const attr = (name, value) =>
    value === undefined || value === null
      ? ""
      : ` ${name}="${escapeHTML(value)}"`;

  async function write() {
    try {
      const paths = await getPaths();
      const [data, form] = await Promise.all([
        fetch(paths.contact).then((r) => r.json()),
        fetch(paths.contactForm || paths["contact-form"]).then((r) => r.json()),
      ]);

      // Rows with the same title share one box
      const groups = new Map();
      (data?.info || []).forEach((item) => {
        if (!groups.has(item.title)) groups.set(item.title, []);
        groups.get(item.title).push(item);
      });

      const boxes = [...groups]
        .map(([title, items]) => {
          const rows = items
            .map((item) => {
              if (!item.action) return `<p>${escapeHTML(item.text)}</p>`;
              const external = /^https?:/i.test(item.action)
                ? ' target="_blank" rel="noopener noreferrer"'
                : "";
              return `<a href="${escapeHTML(resolvePath(item.action))}"${external}>${escapeHTML(item.text)}</a>`;
            })
            .join("");
          const icon = items[0].icon
            ? `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${escapeHTML(items[0].icon)}"/></svg>`
            : "";
          return `
            <div class="box">
                ${icon}
                <h3>${escapeHTML(title)}</h3>
                ${rows}
            </div>`;
        })
        .join("");

      const fields = (form?.fields || [])
        .map((field) => {
          const id = `enquiry-${field.name}`;
          const area = field.type === "textarea";
          const shared = `id="${escapeHTML(id)}" name="${escapeHTML(field.name)}" placeholder=" "${field.required ? " required" : ""}${attr("maxlength", field.maxlength)}${attr("autocomplete", field.autocomplete)}`;
          const control = area
            ? `<textarea ${shared}></textarea>`
            : `<input type="${escapeHTML(field.inputType || "text")}" ${shared}${attr("inputmode", field.inputmode)}${attr("pattern", field.pattern)}>`;
          return `
            <div class="field${area ? " area" : ""}">
                ${control}
                <label class="label" for="${escapeHTML(id)}">${escapeHTML(field.label)}</label>
            </div>`;
        })
        .join("");

      // Submit button from JSON: "primary" is a plain .button, any other type is a modifier class
      const submit = form?.button || {};
      const type =
        submit.type && submit.type !== "primary" ? ` ${submit.type}` : "";
      const icon = submit.icon
        ? ` <span>${escapeHTML(submit.icon)}</span>`
        : "";

      // Optional text below the button wrapper (contactForm -> note)
      const note = form?.note
        ? `<p class="note">${escapeHTML(form.note)}</p>`
        : "";

      // --i = intro order
      section.innerHTML = `
            <div class="info" style="--i:1">${boxes}</div>
            <div class="form" style="--i:2">
                ${data?.heading ? `<h2>${escapeHTML(data.heading)}</h2>` : ""}
                ${fields}
                <div class="button-wrapper">
                  <button type="button" class="button${escapeHTML(type)}">${escapeHTML(submit.text || "Submit")}${icon}</button>
                </div>
                ${note}
            </div>`;

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
      console.error("Failed to render contact enquiry section:", err);
    }
  }

  write();
})();
