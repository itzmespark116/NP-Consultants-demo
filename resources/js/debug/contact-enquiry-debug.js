// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────────────────── contact-enquiry-debug.js ──────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Debug (development only, remove before going live)
// Data      : paths.json -> contactForm (messages)
// Target    : <section class="enquiry"></section>  (load with <script type="module">, after contact-enquiry.js)
// Console   : enquiryDebug.show("success")  show one message (sending, success, error, missing)
//             enquiryDebug.all()            show all four stacked, to style them together
//             enquiryDebug.cycle(2000)      show each one after the other, every 2000 ms
//             enquiryDebug.clear()          remove the debug messages
//             enquiryDebug.help()           print this list

import { getPaths } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".enquiry");
  if (!section) return;

  const defaults = {
    sending: { text: "Sending…" },
    success: { text: "Thank you. Your message has been sent." },
    error: { text: "Could not send your message. Please try again." },
    missing: { text: "The contact form is not set up yet." },
  };

  let timer;

  // Same message rules as contact-enquiry-send.js: string or { text, icon }
  const load = async () => {
    const paths = await getPaths();
    const data = await fetch(paths.contactForm || paths["contact-form"]).then(
      (r) => r.json(),
    );
    const messages = {};
    for (const key of Object.keys(defaults)) {
      const custom = data?.messages?.[key];
      messages[key] = {
        ...defaults[key],
        ...(typeof custom === "string" ? { text: custom } : custom),
      };
    }
    return messages;
  };

  // Same markup as contact-enquiry-send.js, marked with data-debug so clear() can find it
  const build = (key, { text, icon }) => {
    const line = document.createElement("p");
    line.setAttribute("role", "status");
    line.dataset.debug = "";
    line.className = key;
    if (icon) {
      const ns = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("class", "icon");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", icon);
      svg.append(path);
      line.append(svg);
    }
    const span = document.createElement("span");
    span.textContent = text;
    line.append(span);
    return line;
  };

  const clear = () => {
    clearInterval(timer);
    section.querySelectorAll("[data-debug]").forEach((line) => line.remove());
  };

  const place = (keys, messages) => {
    const form = section.querySelector(".form");
    const anchor = form?.querySelector(".button-wrapper");
    if (!anchor) return console.warn("enquiryDebug: form is not rendered yet");
    clear();
    keys.forEach((key) => anchor.before(build(key, messages[key])));
  };

  const api = {
    async show(key) {
      const messages = await load();
      if (!messages[key])
        return console.warn(
          `enquiryDebug: use one of ${Object.keys(messages).join(", ")}`,
        );
      place([key], messages);
    },
    async all() {
      const messages = await load();
      place(Object.keys(messages), messages);
    },
    async cycle(ms = 2000) {
      const messages = await load();
      const keys = Object.keys(messages);
      let i = 0;
      place([keys[i]], messages);
      timer = setInterval(() => {
        i = (i + 1) % keys.length;
        place([keys[i]], messages);
      }, ms);
    },
    clear,
    help() {
      console.log(
        [
          'enquiryDebug.show("sending" | "success" | "error" | "missing")',
          "enquiryDebug.all()",
          "enquiryDebug.cycle(ms)",
          "enquiryDebug.clear()",
        ].join("\n"),
      );
    },
  };

  window.enquiryDebug = api;
  console.info("enquiryDebug ready. Type enquiryDebug.help()");
})();
