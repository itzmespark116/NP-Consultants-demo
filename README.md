# NP Consultants · Website

A modern, high-performance, responsive corporate website for **NP Consultants** (Chartered Structural Engineers & Architects).

The project is engineered with pure vanilla web standards—**semantic HTML5**, **modular CSS3** with a comprehensive design token system, and **modular ES6+ JavaScript**. It requires **zero build steps**, no node/npm bundlers, and no runtime frameworks. Content and presentation are decoupled through structured JSON data files, allowing content updates without modifying UI logic.

---

## Table of Contents

- [Updating](#updating)
  - [1. Content Architecture Overview](#1-content-architecture-overview)
  - [2. Updating Navigation (`nav.json`)](#2-updating-navigation-navjson)
  - [3. Updating the Hero Banner (`homepage-banner.json`)](#3-updating-the-hero-banner-homepage-bannerjson)
  - [4. Updating the About Section (`about.json`)](#4-updating-the-about-section-aboutjson)
  - [5. Updating Services (`homepage-services.json`)](#5-updating-services-homepage-servicesjson)
  - [6. Configuring Placeholder Fallbacks (`placeholders.json`)](#6-configuring-placeholder-fallbacks-placeholdersjson)
  - [7. Centralized Path Routing & Prefix (`paths.json`)](#7-centralized-path-routing--prefix-pathsjson)
  - [8. Managing Media Assets](#8-managing-media-assets)
    - [Folder Organization](#folder-organization)
    - [Themed Assets (`data-themed`)](#themed-assets-data-themed)
    - [Image Specs & Optimization](#image-specs--optimization)
    - [Hero Video Specs](#hero-video-specs)
  - [9. Content Update Checklist](#9-content-update-checklist)
  - [10. Local JSON Editor](#10-local-json-editor)
  - [11. Website Statistics](#11-website-statistics)
- [Development](#development)
  - [1. Architecture & Design Principles](#1-architecture--design-principles)
  - [2. Project Directory Structure](#2-project-directory-structure)
  - [3. Local Development Setup](#3-local-development-setup)
  - [4. CSS Architecture & Design Tokens](#4-css-architecture--design-tokens)
    - [Token System (`root.css`)](#token-system-rootcss)
    - [Dark & Light Theming](#dark--light-theming)
    - [Fluid Typography & Spacing (`clamp`)](#fluid-typography--spacing-clamp)
    - [Glassmorphism Surfaces](#glassmorphism-surfaces)
    - [Button System (`button.css`)](#button-system-buttoncss)
    - [Responsive Breakpoints](#responsive-breakpoints)
    - [Accessibility & Motion](#accessibility--motion)
  - [5. JavaScript Architecture & Execution Flow](#5-javascript-architecture--execution-flow)
    - [Lifecycle & Script Loading](#lifecycle--script-loading)
    - [Theme Engine (`theme-init.js` & `theme-switch.js`)](#theme-engine-theme-initjs--theme-switchjs)
    - [Intro Screen Controller (`intro.js`)](#intro-screen-controller-introjs)
    - [Navigation Suite (`nav-*.js`)](#navigation-suite-nav-js)
    - [Homepage Section Writers (`homepage-*.js`)](#homepage-section-writers-homepage-js)
    - [Staggered Animations Pipeline](#staggered-animations-pipeline)
    - [Safety & Error Handling](#safety--error-handling)
  - [6. How to Add a New Section or Page](#6-how-to-add-a-new-section-or-page)
    - [Adding a New Homepage Section](#adding-a-new-homepage-section)
    - [Creating a New Sub-Page](#creating-a-new-sub-page)
  - [7. Code Standards & Contribution Rules](#7-code-standards--contribution-rules)

---

## Updating

This section is a practical guide for content editors, project managers, and clients who want to update text, links, cards, photos, or videos across the website without touching HTML layout or JavaScript logic.

### 1. Content Architecture Overview

All text and structural content on the website is decoupled from code into JSON (JavaScript Object Notation) files stored inside:

```
resources/data/
├── about.json               # About Us story and showcase project cards
├── homepage-banner.json     # Hero banner headline, text, buttons, and video
├── homepage-services.json   # Services section title, description, and service panels
├── nav.json                 # Header navigation bar links
├── placeholders.json        # Fallback images used when any image fails to load
└── paths.json               # Centralized path routing registry with prefix support
```

When modifying any JSON file:
> [!IMPORTANT]
> 1. Keep valid JSON syntax: keys and string values must use double quotes (`"`), never single quotes (`'`).
> 2. Do not leave a trailing comma after the last item in a list or object.
> 3. Escape double quotes inside text with `\"` if needed.

---

### 2. Updating Navigation (`nav.json`)

**File:** `resources/data/nav.json`

Controls the links rendered in the primary navigation menu on desktop and within the mobile hamburger drawer.

```json
{
  "links": [
    { "label": "Home", "href": "/home/" },
    { "label": "Services", "href": "/services/" },
    { "label": "Projects", "href": "/projects/" },
    { "label": "Contact Us", "href": "/contact/" }
  ]
}
```

#### How to update:
- **Change a link name:** Modify `"label"`.
- **Change the destination:** Modify `"href"`.
- **Add a new menu link:** Add a new object inside the `"links"` array:
  ```json
  { "label": "About", "href": "/about/" }
  ```
- **Reorder links:** Simply cut and paste the lines in the desired sequence.
- **Active state detection:** The navigation script (`nav-links.js`) automatically detects the current page URL and highlights the matching link with an underline on desktop and a background pill on mobile.

---

### 3. Updating the Hero Banner (`homepage-banner.json`)

**File:** `resources/data/homepage-banner.json`

Controls the full-screen hero banner, including the backdrop video, headline, text description, and call-to-action buttons.

```json
{
  "label": "NP Consultants",
  "heading": "Structural",
  "subheading": "Engineers",
  "description": "Chartered Engineers & Architects with years of experience",
  "buttons": [
    { "text": "Discover Our Story", "href": "#about-us", "type": "secondary", "icon": "↗" }
  ],
  "video": {
    "src": "/resources/vid/banner-vid.mp4",
    "poster": "/resources/img/posters/banner-poster.jpg"
  }
}
```

#### Field Explanations:
| Field | Purpose | Notes |
| :--- | :--- | :--- |
| `label` | Small uppercase badge above the heading | Colored with the accent tint |
| `heading` | First line of the hero title | Styled large and bold |
| `subheading` | Second line rendered underneath `heading` | Wrapped in `<span>` for semantic emphasis |
| `description` | Subtitle / summary paragraph | Automatically hidden on ultra-short landscape phones |
| `buttons[].text` | Button label | E.g., `"Discover Our Story"` |
| `buttons[].href` | Destination link or page anchor | E.g., `"#about-us"` or `"/services/"` |
| `buttons[].type` | Button visual variant | `"primary"` (accent filled) or `"secondary"` (glass outline) |
| `buttons[].icon` | Optional glyph or arrow | Set to `""` if no icon is desired |
| `video.src` | Path to the background MP4 video | Must be compressed for web streaming |
| `video.poster` | Fallback image loaded before video plays | Displayed on low-power devices and slow networks |

---

### 4. Updating the About Section (`about.json`)

**File:** `resources/data/about.json`

Powers the About Us section, containing the company summary paragraph and a 3-column interactive project grid.

```json
{
  "title": "About Us",
  "text": "NP Consultants is a structural design and engineering consultancy established in 2010...",
  "cards": [
    { 
      "title": "Structural Design", 
      "text": "Innovative structural solutions focused on strength, safety, and precision.", 
      "image": "/resources/img/placeholders/placeholder-project.jpg", 
      "link": "/projects/" 
    }
  ]
}
```

#### How to update:
- **Heading & Paragraph:** Edit `"title"` and `"text"`.
- **Card Title & Description:** Edit `"title"` and `"text"` on each card.
- **Card Destination:** Set `"link"` to the relevant project or sub-page (e.g. `"/projects/#structural-design"`).
- **Card Photo:** Set `"image"` to your image path (e.g. `"/resources/img/projects/project-1.jpg"`).
  > [!TIP]
  > If a card's image is missing or broken, the website automatically catches the error and displays the fallback defined in `placeholders.json`.

---

### 5. Updating Services (`homepage-services.json`)

**File:** `resources/data/homepage-services.json`

Drives the interactive 3-column services grid featuring dynamic sliding panels flanking a central project photograph.

```json
{
  "title": "Our Services",
  "description": "We Provide Various Engineering Services from the Initial Planning Stage to the Full Completion",
  "buttons": [
    {
      "text": "Read More",
      "href": "/services/",
      "type": "primary",
      "icon": "↗"
    }
  ],
  "image": {
    "src": "/resources/img/placeholders/placeholder-project.jpg",
    "alt": "Our engineering services"
  },
  "services": [
    {
      "title": "Structural Designing",
      "text": "Cost-effective, space-saving, future-proof building structures..."
    },
    {
      "title": "Steel Structural Detailing",
      "text": "Detailed drawings, for steel fabrication and steel erections..."
    }
  ]
}
```

#### Layout Distribution:
The JavaScript writer automatically calculates the layout:
- The **first half** of the `services` array is rendered in the **left column** (sliding inward to the right on hover).
- The `image` sits in the **center column** (on desktop).
- The **second half** is rendered in the **right column** (sliding inward to the left on hover).
- On mobile devices, the central image becomes a subtle blurred background and the service panels stack vertically.

---

### 6. Configuring Placeholder Fallbacks (`placeholders.json`)

**File:** `resources/data/placeholders.json`

Guarantees the site never shows ugly broken-image icons if an asset fails to load or hasn't been photographed yet.

```json
{
  "project": "/resources/img/placeholders/placeholder-project.jpg",
  "services": "/resources/img/placeholders/placeholder-project.jpg",
  "banner": "/resources/img/posters/banner-poster.jpg"
}
```

---

### 7. Centralized Path Routing & Prefix (`paths.json`)

**File:** `resources/data/paths.json`

Every JavaScript file loading a JSON data file obtains its path dynamically through `paths.json` instead of hardcoding paths in code.

```json
{
  "prefix": "./",
  "nav": "/resources/data/nav.json",
  "placeholders": "/resources/data/placeholders.json",
  "about": "/resources/data/about.json",
  "homepageBanner": "/resources/data/homepage-banner.json",
  "homepageServices": "/resources/data/homepage-services.json"
}
```

#### How the `"prefix"` works:
- Every path in `paths.json` is written starting from `/resources/...`.
- Each HTML page uses the base script from `404.html`. Its `prefix = 1` setting accounts for the repository path segment; set it to `0` in every HTML page when deploying at the domain root.
- Keep `"prefix": "./"` so registry paths resolve relative to that base (for example, `/resources/data/nav.json` becomes `./resources/data/nav.json`).
- Do not add `../` prefixes for nested pages; the HTML base handles the deployment depth consistently.
- **Subdirectory deployment:** If hosted at a subpath like `/frontend`, set:
  ```json
  "prefix": "/frontend"
  ```

---

### 8. Managing Media Assets

#### Folder Organization

All static media is structured inside `resources/`:

```
resources/
├── icons/                 # SVG vector icons (lightMode.svg, darkMode.svg)
├── img/
│   ├── brand/             # Company logos (icon_dark.png, icon_light.png)
│   ├── our-team/          # Staff portrait photos
│   ├── placeholders/      # Universal fallbacks (placeholder-project.jpg, etc.)
│   └── posters/           # Video poster snapshots (banner-poster.jpg)
└── vid/
    └── banner-vid.mp4     # Hero background looping video
```

#### Themed Assets (`data-themed`)

The website includes a dynamic theme-switching engine. Any image or logo that has distinct light and dark variants uses the custom HTML attribute `data-themed`:

```html
<img src="/resources/img/brand/icon_dark.png"
     data-themed="dark=/resources/img/brand/icon_dark.png; light=/resources/img/brand/icon_light.png"
     alt="NP Consultants">
```

- When the user selects **Dark theme**, the script swaps `src` to the `dark` path.
- When the user selects **Light theme**, it swaps `src` to the `light` path.
- Non-`<img>` elements (such as `<div>` cards) receive the path as a CSS `background-image`.

#### Image Specs & Optimization

To ensure optimal page load speed and crisp display on high-DPI (Retina) screens:

| Asset Type | Recommended Dimensions | Format | Max File Size |
| :--- | :--- | :--- | :--- |
| **Brand Logo** | 80 × 80 px (displayed at 40-42px) | Transparent PNG or SVG | < 50 KB |
| **Project Cards (About)** | 800 × 600 px (4:3 aspect ratio) | WebP or JPG (85% quality) | < 150 KB |
| **Services Centerpiece** | 900 × 1200 px (3:4 aspect ratio) | WebP or JPG (85% quality) | < 250 KB |
| **Banner Poster Fallback** | 1920 × 1080 px (16:9 ratio) | JPG (75% quality) | < 200 KB |
| **Icons** | 24 × 24 px | Vector SVG | < 5 KB |

#### Hero Video Specs

- **Path:** `resources/vid/banner-vid.mp4`
- **Format:** MP4 (H.264 video codec, AAC audio or muted).
- **Resolution:** 1080p (1920 × 1080) or 720p (1280 × 720).
- **Framerate:** 24 or 30 fps.
- **Audio:** Must be muted (the browser requires muted playback for autoplay without user interaction).
- **Target Size:** Under **5 MB** (use tools like HandBrake or ffmpeg to optimize bitrate).

---

### 9. Content Update Checklist

Before publishing changes to production:

- [ ] Validate all edited JSON files with a JSON linter (no missing quotes or trailing commas).
- [ ] Check file paths: ensure paths are root-relative (`/resources/...`) or relative to the document.
- [ ] Verify image filenames match exactly (case-sensitive on Linux/Unix hosting servers).
- [ ] Check both **Dark** and **Light** modes using the theme toggle in the header.
- [ ] Resize browser window or test on a mobile phone to confirm text wrapping and responsiveness.

### 10. Local JSON Editor

Open [`admin/`](admin/) from a local web server for the admin overview, or [`admin/webeditor/`](admin/webeditor/) to edit the JSON files in `resources/data/`. The admin login accepts any account in [`admin/credentials.json`](admin/credentials.json), configured as an `accounts` array of `{ "username": "...", "password": "..." }` objects. This client-side login is only a deterrent: the credentials file and admin content are publicly downloadable on a static host, so do not use sensitive credentials or rely on it for security. Drafts are saved in the current browser and do not modify website files.

Use **Copy JSON** or **Download file** to export the edited content. To publish it, replace the matching JSON file in `resources/data/` with the downloaded version. A local server is required because the editor loads data with `fetch()`; opening it directly as a `file://` URL is blocked by browser security.

### 11. Website Statistics

Open [`admin/statistics/`](admin/statistics/) to view CounterAPI page views, daily and weekly totals, activity by hour/weekday/quarter, and page totals. CounterAPI's stats endpoint supplies the activity breakdowns; the dashboard uses Chart.js and does not iframe CounterAPI because its site blocks framing.

CounterAPI settings are in `resources/data/analytics.json`. Create the total counter, the admin counter, and one counter for each configured public page in the configured workspace before publishing; their slugs are listed in that file. The website increments the total and matching page counter only for Home, Services, Projects, and Contact. Every `/admin/` page increments only the exclusive admin counter, not the public total. The dashboard shows the count of each page and the separate admin count. Missing counters are reported as errors instead of being shown as zero. The existing total counter retains its history; dedicated page and admin counters start from their creation date and cannot recover historical counts. Historical daily values are not exposed by CounterAPI's stats response, so the dashboard shows the API's supported today/this-week totals and activity distributions rather than synthesizing a daily trend from missing counters. Counts represent page loads, not verified unique people. Use public CounterAPI counters because this static site has no server to protect an API token. Never add a secret token to the JSON or client-side code.

---

## Development

This section documents the underlying architecture, design system, CSS token hierarchy, JavaScript lifecycle, and step-by-step instructions for extending the codebase.

---

### 1. Architecture & Design Principles

The site is built according to modern Web Standards principles:

1. **Zero Build Dependency:** No Webpack, Vite, Gulp, or Babel. Files run directly in modern browsers via native ES Modules (`type="module"`).
2. **Token-Driven Styling:** Every color, spacing increment, blur, transition duration, and font property is centralized in [root.css](file:///c:/Users/oshan/OneDrive/Desktop/NP%20Consultants/frontend/resources/css/root.css). Hardcoded pixel values or raw hex codes inside component stylesheets are strictly avoided.
3. **Progressive Enhancement & Semantic HTML:** All layouts rely on `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, and `<button type="button">`.
4. **Resilient Data Binding:** Data is injected via DOM writers (`resources/js/homepage/*.js`, `resources/js/nav/*.js`) using `escapeHTML()` to prevent XSS injection, coupled with `IntersectionObserver` to trigger entrance animations only when elements enter the viewport.
5. **No Flash of Unstyled Theme (FOUT):** A lightweight synchronous initialization script (`theme-init.js`) executes in `<head>` before the DOM renders to ensure the correct theme class (`light` or `dark`) is applied immediately.

---

### 2. Project Directory Structure

```
frontend/
├── index.html                           # Root document: redirects to /home/
├── README.md                            # Documentation and developer tutorial
├── admin/
│   ├── index.html                        # Admin workspace overview
│   ├── webeditor/index.html             # Local JSON content editor
│   └── resources/
│       ├── css/dashboard.css             # Admin overview styles and design tokens
│       ├── css/webeditor.css            # Editor-only styles and design tokens
│       └── js/webeditor.js              # Editor-only data loading and interactions
├── home/
│   └── index.html                       # Primary homepage entry document
└── resources/
    ├── css/
    │   ├── root.css                     # Global design tokens, palettes & variables
    │   ├── body.css                     # Base document reset & container styles
    │   ├── scrollbar.css                # Custom glassmorphic scrollbar styling
    │   ├── intro.css                    # Splash screen intro overlay styling
    │   ├── nav.css                      # Fixed header & scroll-shrink pill navbar
    │   ├── nav-links.css                # Underline indicator (desktop) & dropdown (mobile)
    │   ├── nav-toggle.css               # Hamburger button morphing animation
    │   ├── buttons/
    │   │   ├── button.css               # Reusable pill buttons (.button, .secondary)
    │   │   └── button-theme-toggle.css  # Header theme switcher button styles
    │   └── sections/
    │       ├── homepage-banner.css      # Hero video & floating glass panel styles
    │       ├── homepage-about.css       # About Us grid & 3D hover project cards
    │       ├── homepage-services.css    # Interactive services grid & sliding panels
    │       └── homepage-projects.css    # Dedicated projects showcase styles
    ├── data/
    │   ├── about.json                   # About section data
    │   ├── homepage-banner.json         # Hero banner data
    │   ├── homepage-services.json       # Services section data
    │   ├── nav.json                     # Main navigation links
    │   ├── paths.json                   # Centralized routing registry with prefix
    │   └── placeholders.json            # Fallback placeholder images
    ├── icons/                           # SVG icons (lightMode.svg, darkMode.svg)
    ├── img/                             # Logos, team photos, placeholders, posters
    ├── js/
    │   ├── theme-init.js                # Pre-render theme blocker (in <head>)
    │   ├── modules/
    │   │   ├── intro.js                 # Splash screen timer controller
    │   │   ├── paths.js                 # Centralized path loader & prefix resolver
    │   │   └── theme-switch.js          # Theme toggling & persistence engine
    │   ├── nav/
    │   │   ├── nav-writer.js            # Injects nav links via paths.json
    │   │   ├── navbar.js                # Scroll listener (adds [data-scrolled])
    │   │   ├── nav-links.js             # Active page matcher & sliding underline
    │   │   └── nav-toggle.js            # Mobile hamburger drawer accessibility
    │   └── homepage/
    │       ├── homepage-banner.js       # Hero video & content renderer (via paths.json)
    │       ├── homepage-about.js        # About Us card grid renderer (via paths.json)
    │       └── homepage-services.js     # Services grid & interaction renderer (via paths.json)
    └── vid/
        └── banner-vid.mp4               # Background looping video
```

---

### 3. Local Development Setup

Because the site uses standard **ES Modules** (`import` / `export`) and `fetch()` to load JSON data, browsers will block requests if opened directly via the filesystem (`file://`) due to CORS security restrictions.

#### Running a Local Server:

Choose any of the following methods from the `frontend/` directory:

1. **VS Code Live Server (Recommended):**
   - Open the `frontend` folder in VS Code.
   - Right-click `home/index.html` and select **"Open with Live Server"**.

2. **Python:**
   ```bash
   # Python 3.x
   python -m http.server 8000
   # Open: http://localhost:8000/home/
   ```

3. **Node.js (`npx serve`):**
   ```bash
   npx serve .
   # Open the URL shown in terminal (e.g. http://localhost:3000/home/)
   ```

---

### 4. CSS Architecture & Design Tokens

#### Token System (`root.css`)

All visual tokens are defined on `:root` and `:root.dark`. Modifiers for the light theme override only the necessary variables inside `:root.light`.

```css
/* Palettes */
--base: #000000;
--color: #f4f5f8;
--color-mute: #9ca3af;
--accent: #4077ee;
--border: rgba(255, 255, 255, 0.12);

/* Glass tokens */
--glass: rgba(255, 255, 255, 0.06);
--glass-strong: rgba(24, 24, 28, 0.82);
--glass-blur: blur(14px) saturate(140%);
--glass-rim: 0 0 8px rgba(0, 0, 0, .015), ...;

/* Fluid Typography */
--font-small: 0.9rem;
--font-medium: clamp(1rem, 1.2vw, 1.15rem);
--font-large: clamp(1rem, 1.5vw, 1.3rem);
--font-xlarge: clamp(2rem, 4vw, 3.2rem);

/* Spacing Steps */
--gap-xsmall: 0.5rem;
--gap-small: clamp(0.875rem, 1.8vw, 1.5rem);
--gap-medium: clamp(1.75rem, 5vw, 3rem);
--gap-large: clamp(2rem, 4vw, 4rem);

/* Transitions */
--ease: cubic-bezier(0.4, 0, 0.2, 1);
--transition: 0.25s;
--transition-small: 0.35s;
--transition-large: 0.8s;
--stagger: 0.1s;
```

#### Dark & Light Theming

The site implements modern CSS color-mix syntax (`color-mix(in srgb, ...)`) to generate derived tints dynamically:

```css
/* Example: Background tints derived automatically from current --accent and --base */
--homepage-about-background:
    radial-gradient(circle at right, color-mix(in srgb, var(--accent) 25%, var(--base)), var(--base) 70%);
```

When `:root.light` is toggled:
- `--base` changes to `#ffffff`
- `--color` changes to `#0f172a`
- All `color-mix()` gradients recalculate automatically without duplicating complex background rules.

#### Fluid Typography & Spacing (`clamp`)

To prevent abrupt layout jumps across viewports, font sizes, gaps, and padding use CSS `clamp(min, preferred, max)`:
```css
/* Scales smoothly from 14px on small viewports up to 20px on 4K displays */
--homepage-services-title-padding: clamp(14px, 2vw, 20px);
```

#### Glassmorphism Surfaces

The navbar and floating cards use hardware-accelerated glass effects:
- `-webkit-backdrop-filter: var(--glass-blur);`
- `backdrop-filter: var(--glass-blur);`
- `box-shadow: var(--glass-rim);` (a multi-stop inset shadow mimicking refractive glass bevels).

#### Button System (`button.css`)

Buttons use a base class `.button` with an optional modifier `.secondary`:
- **Primary:** Filled with `--accent-soft`, lifting upward by `--lift` (`-0.1rem`) with an accent glow (`--glow`) on hover.
- **Secondary:** Transparent background with an accent border on hover.
- **Hit-area preservation:** `.button::after` extends the hover zone downward by `--lift` so fast cursor movements do not cause hover flicker.

#### Responsive Breakpoints

The project uses consistent, standard breakpoints:
- `68.75rem` (1100px): Desktop grid switches to tablet/stacked layout.
- `43.75rem` (720px): Tablet switches to mobile portrait (navigation collapses to hamburger menu).
- `25rem` (400px): Small mobile phones (compact padding).
- `max-height: 37.5rem` (600px): Landscape mobile phones (compact banner, hidden subtitles).

#### Accessibility & Motion

The site honors accessibility settings natively:
```css
@media (prefers-reduced-motion: reduce) {
    /* Disables all intro/slide/zoom animations for sensitive users */
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

---

### 5. JavaScript Architecture & Execution Flow

#### Lifecycle & Script Loading

In [home/index.html](file:///c:/Users/oshan/OneDrive/Desktop/NP%20Consultants/frontend/home/index.html), scripts are loaded in a specific lifecycle sequence:

```html
<!-- 1. HEAD (Synchronous blocker) -->
<script src="/resources/js/theme-init.js"></script>

<!-- 2. BODY END (Modules & Execution) -->
<!-- Theme & Intro -->
<script type="module" src="/resources/js/modules/theme-switch.js"></script>
<script src="/resources/js/modules/intro.js"></script>

<!-- Centralized Path Engine & Modules -->
<script type="module" src="../resources/js/modules/paths.js"></script>

<!-- Navigation Engine -->
<script type="module" src="../resources/js/nav/nav-writer.js"></script>
<script type="module" src="../resources/js/nav/navbar.js"></script>
<script type="module" src="../resources/js/nav/nav-links.js"></script>
<script type="module" src="../resources/js/nav/nav-toggle.js"></script>

<!-- Dynamic Section Writers (ES Modules) -->
<script type="module" src="../resources/js/homepage/homepage-banner.js"></script>
<script type="module" src="../resources/js/homepage/homepage-about.js"></script>
<script type="module" src="../resources/js/homepage/homepage-services.js"></script>
```

#### Centralized Path Engine (`paths.js`)

Centralizes all JSON data and asset fetching through `paths.json`:
- **`getPaths()`**: Resolves and returns all routes with the active `prefix` applied. Caches the initial promise to prevent redundant network round-trips.
- **`getPath(key)`**: Retrieves a single resolved path (e.g. `await getPath("about")`).
- **`resolvePath(path, prefix)`**: Universal helper that prepends the configured `prefix` to any path (e.g. `/resources/...` becomes `../resources/...`).

#### Theme Engine (`theme-init.js` & `theme-switch.js`)

1. **`theme-init.js`:** Runs in `<head>`. Checks `localStorage.getItem("theme")`. If absent, checks `window.matchMedia("(prefers-color-scheme: dark)")`. Adds `"light"` or `"dark"` to `document.documentElement` before the browser paints the first frame.
2. **`theme-switch.js`:** Listens for `#ThemeToggle` clicks, toggles the class, saves the choice to `localStorage`, and updates `data-themed` image sources.

#### Intro Screen Controller (`intro.js`)

Reads the `--intro-duration` token directly from CSS:
```javascript
const duration = getComputedStyle(document.documentElement).getPropertyValue("--intro-duration").trim();
const ms = parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000);
setTimeout(() => document.documentElement.classList.add("intro-done"), ms);
```
When `--intro-duration` expires, `intro-done` is added to `<html>`, causing `.intro` to fade out and `<main>` to appear.

#### Image Loading (`image-loading.js`)

The shared image loader keeps each image hidden while it loads and places a spinner over its image container. The image is revealed only after its `load` event; if the requested image fails, the same loading state stays in place while the configured fallback is fetched. The contact map similarly keeps its iframe hidden behind its spinner until the iframe's `load` event.

On public pages, the development helper `imageLoadingDebug` can be used from the browser console: call `imageLoadingDebug.all()` to show the loaders on fully loaded images and map frames, then `imageLoadingDebug.clear()` to restore them. Use `imageLoadingDebug.show("selector")` to target specific elements.

#### Navigation Suite (`nav-*.js`)

- **`nav-writer.js`:** Fetches the navigation path from `paths.json` via `getPath("nav")` and renders `<li><a href="...">...</a></li>` into `<ul id="navLinks">`. Exports a Promise `ready` so dependent modules can await DOM injection.
- **`navbar.js`:** Passive scroll listener using `requestAnimationFrame`. When scroll exceeds `THRESHOLD = 40`, toggles `[data-scrolled]` on `<header>`. CSS shrinks the nav into a centered, rounded glass pill.
- **`nav-links.js`:**
  - Awaits `ready` from `nav-writer.js`.
  - Normalizes `location.pathname` and matches the current active `<a>`.
  - Sets `aria-current="page"`.
  - Measures element dimensions via `getBoundingClientRect()` and animates a sliding underline (`--w`, `--x`, `--o`) beneath the active/hovered link.
  - Accounts for `menu.clientLeft` border offset and prevents focusout jitter during keyboard Tab navigation.
- **`nav-toggle.js`:** Controls mobile menu opening/closing with `aria-expanded`. Includes keyboard navigation safety (Escape key only triggers if the drawer is open).

#### Homepage Section Writers (`homepage-*.js`)

Sections follow a structured writer pattern:
```javascript
(() => {
  const section = document.querySelector(".section-name");
  const escapeHTML = (text) => ...;

  async function write() {
    const data = await fetch("/resources/data/...json").then(r => r.json());
    // 1. Template string injection into section.innerHTML
    // 2. Attach broken-image fallbacks with { once: true }
    // 3. Trigger animations via IntersectionObserver
  }
  write();
})();
```

#### Staggered Animations Pipeline

When a section enters the viewport, `IntersectionObserver` adds the class `.animate`. CSS animations then cascade across children using CSS custom property `--i`:

```css
.section.animate :is(.title, .text, .item) {
    animation: entrance-in var(--transition-large) var(--ease) calc(var(--stagger) * var(--i)) both;
}
```
Child elements with `--i: 1`, `--i: 2`, `--i: 3` smoothly fade and slide in sequence.

#### Safety & Error Handling

- **XSS Prevention:** All user-supplied strings from JSON files pass through `escapeHTML()` before being written to `innerHTML`.
- **Image Fallbacks:** Every dynamic image element registers an `error` listener:
  ```javascript
  image.addEventListener("error", () => { image.src = placeholders.project; }, { once: true });
  ```
  The `{ once: true }` parameter prevents infinite loops if the placeholder itself is unreachable.

---

### 6. How to Add a New Section or Page

#### Adding a New Homepage Section

Suppose you want to add a new **"Client Testimonials"** section to the homepage:

1. **Create the data file:** `resources/data/homepage-testimonials.json`
   ```json
   {
     "title": "Client Testimonials",
     "items": [
       { "client": "Apex Towers", "quote": "Exceptional structural precision." }
     ]
   }
   ```
2. **Add design tokens in [root.css](file:///c:/Users/oshan/OneDrive/Desktop/NP%20Consultants/frontend/resources/css/root.css):**
   ```css
   --homepage-testimonials-background: var(--base);
   --homepage-testimonials-gap: clamp(1rem, 2vw, 2rem);
   ```
3. **Create the stylesheet:** `resources/css/sections/homepage-testimonials.css`
   - Scope all rules under `.testimonials`.
4. **Create the JS writer:** `resources/js/homepage/homepage-testimonials.js`
   - Fetch `homepage-testimonials.json`, inject into `.testimonials`, and register an `IntersectionObserver`.
5. **Register in [home/index.html](file:///c:/Users/oshan/OneDrive/Desktop/NP%20Consultants/frontend/home/index.html):**
   - Add `<link rel="stylesheet" href="/resources/css/sections/homepage-testimonials.css">` in `<head>`.
   - Add `<section class="testimonials"></section>` inside `<main>`.
   - Add `<script src="/resources/js/homepage/homepage-testimonials.js"></script>` before `</body>`.

#### Creating a New Sub-Page

To build a dedicated page (e.g. `services/index.html`):

1. **Create the folder and document:** `services/index.html`
2. **Copy the shared `<head>` assets:**
   ```html
   <link rel="stylesheet" href="/resources/css/root.css">
   <link rel="stylesheet" href="/resources/css/body.css">
   <link rel="stylesheet" href="/resources/css/nav.css">
   <link rel="stylesheet" href="/resources/css/nav-links.css">
   <link rel="stylesheet" href="/resources/css/nav-toggle.css">
   <script src="/resources/js/theme-init.js"></script>
   ```
3. **Add the standard header & navigation markup:**
   ```html
   <header>
       <nav aria-label="Main navigation">
           <a href="/home/"><img src="..." alt="NP Consultants"></a>
           <button id="ThemeToggle" type="button"><img data-themed="..." alt=""></button>
           <button id="navToggle" type="button" aria-expanded="false" aria-controls="navLinks"><span></span></button>
           <ul id="navLinks"></ul>
       </nav>
   </header>
   ```
4. **Include the navigation scripts at the end:**
   ```html
   <script type="module" src="/resources/js/modules/theme-switch.js"></script>
   <script type="module" src="/resources/js/nav/nav-writer.js"></script>
   <script type="module" src="/resources/js/nav/navbar.js"></script>
   <script type="module" src="/resources/js/nav/nav-links.js"></script>
   <script type="module" src="/resources/js/nav/nav-toggle.js"></script>
   ```
   > [!NOTE]
   > The navigation engine will automatically detect that the user is at `/services/` and highlight the **Services** link in the navbar!

---

### 7. Code Standards & Contribution Rules

To preserve codebase consistency:

1. **Header Block:** Every new CSS and JS file must include the standardized project comment header:
   ```javascript
   // ────────────────────────────────────────────────────────────────────────────────
   // ──────────────────────────────── NP Consultants ────────────────────────────────
   // ────────────────────────────── filename.js ─────────────────────────────────────
   // ────────────────────────────────────────────────────────────────────────────────
   // File Type : Writer | Event Listener | Init
   ```
2. **Token Integrity:** Never hardcode pixel colors or fixed font sizes in section CSS. Add a token to `root.css` and reference it via `var(--token-name)`.
3. **Defensive DOM Operations:** Always verify elements exist before querying or attaching listeners (`if (!element) return;`).
4. **HTML Escaping:** Never insert raw unescaped JSON text directly into `innerHTML`. Always use `escapeHTML()`.
5. **No Frameworks:** Keep dependencies at zero. All features must run on native web platform APIs.
