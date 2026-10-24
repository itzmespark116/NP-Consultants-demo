// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────────── contact-map.js ────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json -> contact (map: latitude, longitude, zoom, place)
// Target    : <section class="map"></section>  (load with <script type="module">)

import { getPaths } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".map");
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
      const data = await fetch(paths.contact).then((r) => r.json());

      const latitude = Number(data?.map?.latitude);
      const longitude = Number(data?.map?.longitude);
      const zoom = Number(data?.map?.zoom) || 15;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("contact.json map needs latitude and longitude");
      }

      const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`;

      const mapLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      section.innerHTML = `
        <div class="map-frame is-loading">
          <span class="map-spinner" role="status" aria-label="Loading map"></span>
          <iframe data-map-src="${escapeHTML(src)}" title="${escapeHTML(data.map.place || "Map")}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
          <a class="map-fallback" href="${escapeHTML(mapLink)}" target="_blank" rel="noopener noreferrer">
            View ${escapeHTML(data.map.place || "this location")} in Google Maps
          </a>
        </div>`;

      const frame = section.querySelector(".map-frame");
      const iframe = frame.querySelector("iframe");
      iframe.addEventListener("load", () => frame.classList.remove("is-loading"), {
        once: true,
      });
      iframe.addEventListener(
        "error",
        () => {
          frame.classList.remove("is-loading");
          frame.classList.add("map-error");
          iframe.hidden = true;
        },
        { once: true },
      );
      iframe.src = iframe.dataset.mapSrc;
    } catch (err) {
      console.error("Failed to render contact map:", err);
    }
  }

  write();
})();
