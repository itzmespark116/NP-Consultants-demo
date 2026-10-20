// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ─────────────────────────────────── team.js ────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : paths.json -> staff, placeholders  (/resources/data/staff.json)
// Target    : <section class="team" id="team"></section>  (load with <script type="module">)
// Placement : by roles. A person with several roles shows all of them and sits in the
//             highest row they qualify for (director > management > employees).

import { getPaths, resolvePath } from "../modules/paths.js";

(() => {
  const section = document.getElementById("team");
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

  const load = (url) =>
    url
      ? fetch(url)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      : Promise.resolve(null);

  // "roles": ["Director", "Manager"]  (a single "role" string also works)
  const rolesOf = (member) =>
    Array.isArray(member.roles)
      ? member.roles
      : member.role
        ? [member.role]
        : [];

  async function write() {
    try {
      const paths = await getPaths();
      const staffUrl =
        paths.staff ||
        paths.homepageTeam ||
        paths["homepage-team"] ||
        resolvePath("/resources/data/staff.json");

      const [data, placeholders] = await Promise.all([
        load(staffUrl),
        load(paths.placeholders),
      ]);
      if (!data) throw new Error("staff.json not found");

      const fallback = resolvePath(placeholders?.team);
      const groups = data.groups || {};
      const has = (member, key) =>
        rolesOf(member).some((role) =>
          (groups[key] || []).some(
            (g) => g.toLowerCase() === role.toLowerCase(),
          ),
        );

      // "group" on a member overrides the role-based placement
      const place = (member) =>
        member.group ||
        (has(member, "director")
          ? "director"
          : has(member, "management")
            ? "management"
            : "employee");

      const members = data.members || [];
      const pick = (group) =>
        members.filter((member) => place(member) === group);

      // cardClass is "director-card", "team-card", or "team-card management"
      // --n on each detail = its step in the hover ripple
      const card = (member, cardClass) => {
        const image = resolvePath(member.image || placeholders?.team);
        const details = (member.details || [])
          .map((item, n) => `<li style="--n:${n}">${escapeHTML(item)}</li>`)
          .join("");
        return `
                <div class="${cardClass}">
                    <div class="photo">
                        <img src="${escapeHTML(image)}" alt="${escapeHTML(member.name)}" loading="lazy">
                    </div>
                    <div class="info">
                        <h3>${escapeHTML(member.name)}</h3>
                        <h4>${escapeHTML(rolesOf(member).join(" & "))}</h4>
                        <ul>${details}</ul>
                    </div>
                </div>`;
      };

      let step = 0; // --i: one stagger step per card, in reading order

      const directors = pick("director")
        .map(
          (member) =>
            `<div class="item director" style="--i:${step++}">${card(member, "director-card")}</div>`,
        )
        .join("");

      const managers = pick("management")
        .map(
          (member) =>
            `<div class="item manager" style="--i:${step++}">${card(member, "team-card management")}</div>`,
        )
        .join("");

      const employees = pick("employee")
        .map(
          (member) =>
            `<div class="item" style="--i:${step++}">${card(member, "team-card")}</div>`,
        )
        .join("");

      section.innerHTML = `
            <div class="title" style="--i:1">
                <h2>${escapeHTML(data.title)}</h2>
            </div>
            <p class="description" style="--i:2">${escapeHTML(data.description)}</p>
            <div class="management">${directors}${managers}</div>
            <div class="grid">${employees}</div>`;

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
        { threshold: 0.1 },
      ).observe(section);
    } catch (err) {
      console.error("Failed to render team section:", err);
    }
  }

  write();
})();
