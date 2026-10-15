// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ────────────────────────────── homepage-about.js ───────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Data      : /resources/data/homepage-about.json, /resources/data/placeholders.json
// Target    : <section class="about"></section>
// A missing or broken card image shows the "project" placeholder.

(() => {
  const about = document.querySelector(".about");

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
      fetch("../resources/data/about.json").then((r) => r.json()),
      fetch("../resources/data/placeholders.json").then((r) => r.json()),
    ]);

    // --i = stagger order: title 1, text 2, cards 3 onwards
    const items = data.cards
      .map(
        (card, index) => `
            <div class="item" style="--i:${index + 3}">
                <a class="card" href="${escapeHTML(card.link)}">
                    <img src="${escapeHTML(card.image || placeholders.project)}" alt="${escapeHTML(card.title)}" loading="lazy">
                    <div class="overlay">
                        <h3>${escapeHTML(card.title)}</h3>
                        <p>${escapeHTML(card.text)}</p>
                    </div>
                </a>
            </div>`,
      )
      .join("");

    about.innerHTML = `
            <div class="title" style="--i:1">
                <h2>${escapeHTML(data.title)}</h2>
            </div>
            <div class="content">
                <div class="text" style="--i:2">
                    <p>${escapeHTML(data.text)}</p>
                </div>
                <div class="grid">${items}</div>
            </div>`;

    // Broken image -> placeholder (once, so a missing placeholder can't loop)
    about.querySelectorAll(".card img").forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          image.src = placeholders.project;
        },
        { once: true },
      );
    });

    // Play the entrance animation once, when the section scrolls into view
    new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting) {
          about.classList.add("animate");
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    ).observe(about);
  }

  write();
})();
