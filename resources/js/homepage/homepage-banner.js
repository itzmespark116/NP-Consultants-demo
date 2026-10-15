// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── homepage-banner.js ──────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : /resources/data/homepage-banner.json, /resources/data/placeholders.json
// Target    : <section class="banner"></section>
// Button look comes from JSON: "type" is "primary" or a modifier class (e.g. "secondary").

(() => {
  const banner = document.querySelector(".banner");

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
    const [data, placeholders] = await Promise.all([
      fetch("../resources/data/homepage-banner.json").then((r) => r.json()),
      fetch("../resources/data/placeholders.json").then((r) => r.json()),
    ]);

    const buttons = data.buttons
      .map((button) => {
        const type =
          button.type && button.type !== "primary" ? ` ${button.type}` : "";
        const icon = button.icon
          ? ` <span>${escapeHTML(button.icon)}</span>`
          : "";
        return `<a href="${escapeHTML(button.href)}" class="button${escapeHTML(type)}">${escapeHTML(button.text)}${icon}</a>`;
      })
      .join("");

    // --i = intro order: panel 1, then label, heading, description, buttons
    banner.innerHTML = `
            <video autoplay muted loop playsinline preload="metadata" poster="${escapeHTML(data.video.poster || placeholders.banner)}">
                <source src="${escapeHTML(data.video.src)}" type="video/mp4">
            </video>
            <div class="tint"></div>
            <div class="fade"></div>
            <div class="content" style="--i:1">
                <p class="label" style="--i:2">${escapeHTML(data.label)}</p>
                <h1 style="--i:3">${escapeHTML(data.heading)}<br><span>${escapeHTML(data.subheading)}</span></h1>
                <p class="description" style="--i:4">${escapeHTML(data.description)}</p>
                <div class="actions" style="--i:5">${buttons}</div>
            </div>`;

    // Browsers can ignore the muted attribute set through innerHTML, so set it and start playback
    const video = banner.querySelector("video");
    video.muted = true;
    video.play().catch(() => {});
    video.addEventListener("contextmenu", (event) => event.preventDefault());

    banner.classList.add("animate");
  }

  write();
})();
