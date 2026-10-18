// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────────── footer.js ───────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json -> footer { title, subtitle, navigation, copyright }, contact (info), brand
// Target    : <footer class="footer"></footer>  (load with <script type="module">)

import { getPaths, resolvePath } from "./modules/paths.js";

(() => {
  const footer = document.querySelector(".footer");
  if (!footer) return;

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
      const footerPath =
        paths.footer || resolvePath("/resources/data/footer.json");
      const contactPath =
        paths.contact || resolvePath("/resources/data/contact.json");

      const [content, data] = await Promise.all([
        fetch(footerPath).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status} fetching ${footerPath}`);
          return r.json();
        }),
        fetch(contactPath).then((r) => {
          if (!r.ok)
            throw new Error(`HTTP ${r.status} fetching ${contactPath}`);
          return r.json();
        }),
      ]);

      const year = new Date().getFullYear();

      // Brand logo paths
      const brandLight =
        paths.brand?.light ||
        resolvePath("/resources/img/brand/icon_light.png");
      const brandDark =
        paths.brand?.dark || resolvePath("/resources/img/brand/icon_dark.png");
      const isLight = document.documentElement.classList.contains("light");
      const initialLogo = isLight ? brandLight : brandDark;
      const homeHref = resolvePath(paths.home || "/home/");

      // Rows open their action (link, mail, phone); web links open in a new tab
      const contact = (data?.info || [])
        .map((item) => {
          const action = resolvePath(item.action);
          const external = /^https?:/i.test(action);
          const target = external ? ' target="_blank" rel="noopener"' : "";
          const icon = item.icon
            ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${escapeHTML(item.icon)}"/></svg>`
            : "";
          return `<p>${icon}<a href="${escapeHTML(action)}"${target}>${escapeHTML(item.text)}</a></p>`;
        })
        .join("");

      const nav = (content?.navigation || [])
        .map(
          (item) =>
            `<li><a href="${escapeHTML(resolvePath(item.url))}">${escapeHTML(item.label)}</a></li>`,
        )
        .join("");

      footer.innerHTML = `
            <div class="main">
                <div class="logo">
                    <a href="${escapeHTML(homeHref)}" aria-label="${escapeHTML(content?.title || "NP Consultants home")}">
                        <img
                            src="${escapeHTML(initialLogo)}"
                            data-themed="dark=${escapeHTML(brandDark)}; light=${escapeHTML(brandLight)}"
                            alt="${escapeHTML(content?.title || "NP Consultants")}">
                    </a>
                </div>
                <div class="info">
                    <div class="title">
                        <h2>${escapeHTML(content?.title)}</h2>
                        <p>${escapeHTML(content?.subtitle)}</p>
                    </div>
                    <div class="contact">${contact}</div>
                </div>
                <div class="links"><ul>${nav}</ul></div>
            </div>
            <div class="copyright"><p>${escapeHTML(String(content?.copyright ?? "").replace("{year}", year))}</p></div>`;

      // Keep logo in sync with theme changes
      const logo = footer.querySelector(".logo img");
      const setLogo = () => {
        if (!logo) return;
        const light = document.documentElement.classList.contains("light");
        logo.src = light ? brandLight : brandDark;
      };

      new MutationObserver(setLogo).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      // Allow clicking anywhere on contact row to trigger its link
      footer.querySelectorAll(".contact p").forEach((p) => {
        p.addEventListener("click", (e) => {
          if (!e.target.closest("a")) {
            p.querySelector("a")?.click();
          }
        });
      });
    } catch (err) {
      console.error("Failed to render footer:", err);
    }
  }

  write();
})();
