// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────────── contact-enquiry-send.js ────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Behaviour (no markup of its own except a status line)
// Data      : paths.json -> contactForm (messages?), Web3Forms settings
// Target    : <section class="enquiry"></section>  (load with <script type="module">, after contact-enquiry.js)
// Works with the form written by contact-enquiry.js. Events are delegated on the section,
// so load order and render timing do not matter. POSTs the form as JSON to Web3Forms.
// Each message key (sending, success, error, missing) becomes the class of the status line:
// .form .sending, .form .success, .form .error, .form .missing. Icon (SVG path) is optional.

import { getPaths } from "../modules/paths.js";

(() => {
  const section = document.querySelector(".enquiry");
  if (!section) return;

  const TIMEOUT = 15000; // ms before a send is given up
  let sending = false;

  const defaults = {
    sending: { text: "Sending…" },
    success: { text: "Thank you. Your message has been sent." },
    error: { text: "Could not send your message. Please try again." },
    missing: { text: "The contact form is not set up yet." },
  };

  // Web3Forms settings from paths.json, messages from contact-form.json
  // (string or { text, icon })
  const ready = (async () => {
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
    return {
      endpoint: paths.contactSubmit || paths["contact-submit"] || "",
      accessKey: paths.contactAccessKey || "",
      subject: paths.contactSubject || "",
      fromName: paths.contactFromName || "",
      messages,
    };
  })();

  // One status line above the button wrapper. Its class is the message key.
  const setStatus = (form, key, messages) => {
    const { text, icon } = messages[key];
    let line = form.querySelector('[role="status"]');
    if (!line) {
      line = document.createElement("p");
      line.setAttribute("role", "status");
      form.querySelector(".button-wrapper").before(line);
    }
    line.className = key;
    line.replaceChildren();
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
  };

  async function send(form) {
    if (sending) return;

    const controls = [...form.querySelectorAll("input, textarea")];
    const invalid = controls.find((control) => !control.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return;
    }

    try {
      const { endpoint, accessKey, subject, fromName, messages } = await ready;
      if (!endpoint) {
        console.warn("contactSubmit is empty in paths.json");
        setStatus(form, "missing", messages);
        return;
      }

      const button = form.querySelector(".button");
      sending = true;
      button.disabled = true;
      setStatus(form, "sending", messages);

      try {
        const body = Object.fromEntries(
          controls.map((control) => [control.name, control.value.trim()]),
        );
        body.access_key = accessKey;
        body.subject = subject;
        body.from_name = fromName;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(TIMEOUT),
        });
        const result = await res.json();
        if (!res.ok || result?.success !== true) {
          throw new Error(result?.message || `HTTP ${res.status}`);
        }

        controls.forEach((control) => (control.value = ""));
        setStatus(form, "success", messages);
      } catch (err) {
        console.error("Failed to send contact enquiry:", err);
        setStatus(form, "error", messages);
      } finally {
        sending = false;
        button.disabled = false;
      }
    } catch (err) {
      console.error("Failed to load contact enquiry settings:", err);
    }
  }

  section.addEventListener("click", (event) => {
    const button = event.target.closest(".form .button");
    if (button) send(button.closest(".form"));
  });

  // Enter inside a single-line field sends too (textarea keeps its new line)
  section.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.matches(".form input")) {
      event.preventDefault();
      send(event.target.closest(".form"));
    }
  });
})();
