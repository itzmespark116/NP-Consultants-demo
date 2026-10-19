# PROMPT: Structural Design Demonstration (scroll-built 3D steel building) · one self-contained module

You are building ONE website **module**. Read this whole prompt before writing any code. It describes everything: what to build, the exact files, the rules, the data formats, the animation behaviour, and how to verify. Do not ask me questions. Where something is not specified, pick the sensible option, and mention it in your final reply.

---

## 0. Plain-language summary

A visitor sees a full-screen section with a **black background**. As they scroll, the page **snaps** from stage to stage. In each stage a **crane lowers steel H-beams into place** (the beams hang from **two cables**), building a steel portal-frame industrial shed step by step: base plates, columns, rafters, purlins and rails, bracing. The camera **slowly rotates around the building** while it is erected, and the visitor can **drag to rotate**. When the frame is finished, **wall and roof panels fly in as if pulled by a magnet** (ease-in curve: slow start, strong acceleration, snap on contact). Then a sudden **white flash** hides a swap of the whole scene from a "blueprint" look to a **photorealistic real-life look** (real materials, sky, sun, shadows).

It is NOT a low-quality 3D toy. It must look detailed: real H-beam cross-sections (flanges + web), bolts, plates, stiffeners, soft shadows, sparks, dust, etc.

It is a **module**: it contains the section and nothing else. No navbar, no footer, no other sections, no page layout.

---

## 1. How the module is used (this is the most important rule)

The website page contains only these 3 lines for this module. **These are the only things I will ever add or link.**

```html
<section class="structural-demonstration"></section>
<script type="module" src="/resources/structure/js/structural-demonstration-linker.js"></script>
<script type="module" src="/resources/structure/js/structural-demonstration.js"></script>
```

- I do NOT link any CSS. I do NOT link any other JS. I do NOT edit any other site file.
- The **linker** file loads the CSS (by writing a `<link>` tag with `innerHTML`).
- The **writer** file fills the `<section>` with its markup (with `innerHTML`), loads the JSON data, and starts the 3D engine, which it imports itself.
- The two script tags may appear in any order on the page. Both must work either way, and both must wait for the DOM to be ready.
- Everything for this module lives in ONE folder: `/resources/structure/`. You deliver that folder.
- The page may be placed in a sub-folder (for example `/home/index.html`), so every path must go through the site's `paths.js` prefix system (explained in section 5). Never hardcode `../` or an absolute prefix yourself.

The section element must behave as `height: 100vh; height: 100dvh;` (the second line overrides the first in browsers that support `dvh`).

---

## 2. Absolute rules (never break these)

1. **Do not connect, import, link, or copy `root.css`.** This module is standalone. All design tokens (colours, spacing, fonts, timings) are declared at the top of this module's own CSS file, scoped to `.structural-demonstration { --structure-...: ...; }`.
2. **No hardcoded values in the CSS body.** Colours, sizes, radii, gaps, durations, easings, z-indexes must all be a token declared in the token block (use rem, not px, for sizes). The only literals allowed in the CSS body are media-query breakpoints and the numbers 0 and 1, `100%`, `auto`, `none`.
3. **Never alias a token from another token.** (Wrong: `--structure-title-color: var(--structure-color);`) Declare every token with its own literal value. Use tokens directly.
4. **Single-word class names, scoped.** Write `.structural-demonstration .hud .title`, never `.structural-demonstration-hud-title`. Do not mix the two styles.
5. **All visible text lives in JSON** (titles, descriptions, tooltips, button text, aria-labels, alt text). Never write visible words in JS or HTML. Escape every string with an `escapeHTML()` helper before putting it into `innerHTML`.
6. **All numbers used by JS** (dimensions, durations, easings, counts, speeds, colours of materials, camera values) live in `structure.json`. No magic numbers in the JS files except 0, 1, 2 and mathematical constants like `Math.PI`.
7. **Do NOT edit** `paths.js`, `paths.json`, `root.css`, or any other existing site file. The module must work with zero changes to the rest of the site.
8. **Everything is an ES module** (`import` / `export`). No global variables. The only thing exposed on `window` is `window.structuralDemonstration = { destroy }` for cleanup.
9. Wrap nothing in `try/catch` just to hide errors; do handle the real failure cases listed in section 13.
10. Write clear, simple, human-style code with short comments. Small functions. No clever one-liners that are hard to read.
11. **Every file starts with the banner header** described in section 6.
12. Keep the output tidy: delete any file you create and later replace. Do not leave old and new versions side by side.
13. Do not add any dependency that needs a build step. The folder must run as plain static files (served from any static server).

---

## 3. Folder structure to deliver

Everything below goes inside `/resources/structure/`. All paths are from the site root.

```
/resources/structure/
├── readme.md                                  file tree, config keys, how to edit stages/dimensions
├── structural-demonstration-section.html      the empty shell: only <section class="structural-demonstration"></section>
├── preview.html                               TEST PAGE ONLY (section + the 2 script tags). Not part of the module.
├── css/
│   └── structural-demonstration.css           token block + all styles
├── js/
│   ├── structural-demonstration-linker.js     (LINKED BY ME) injects the CSS via innerHTML
│   ├── structural-demonstration.js            (LINKED BY ME) writes the markup via innerHTML, loads JSON, starts engine
│   ├── engine/
│   │   ├── scene.js                           renderer, lights, ground, resize, render loop, visibility pausing
│   │   ├── materials.js                       blueprint material set + realistic (PBR) material set + swap function
│   │   ├── members.js                         builds H-beams, plates, stiffeners, bolts, bracing from config
│   │   ├── crane.js                           gantry crane, trolley, hook block, two-cable sling
│   │   ├── stages.js                          master timeline (time T), stage control, scroll → target stage
│   │   ├── panels.js                          roof/wall panels with the "magnetic" arrival
│   │   ├── camera.js                          auto-orbit + drag-to-orbit + idle return
│   │   ├── flash.js                           the flash overlay + the blueprint → real swap
│   │   ├── particles.js                       dust puffs and sparks (small pooled system)
│   │   └── helpers.js                         easing functions, escapeHTML, clamp, lerp, damped sine, etc.
│   └── vendor/                                local copy of Three.js (see section 7.1)
├── data/
│   ├── structural-demonstration.json          all text
│   └── structure.json                         all geometry + animation numbers
└── img/
    └── placeholder-structure.jpg              fallback image if WebGL is not available
```

For `placeholder-structure.jpg`: generate a simple dark image with the blueprint outline of a portal frame (for example by rendering a screenshot of your own scene at the end of the build with a headless browser). Any decent dark image is acceptable.

`preview.html` is only for testing: a black page containing the `<section>` and the two script tags exactly as in section 1. Place it at `/resources/structure/preview.html`.

---

## 4. About the site's `paths.js` and `paths.json` (you must understand this)

The site already has a loader module and a JSON file. **Do not change them. Use them.**

### 4.1 `paths.json` (already exists at `/resources/data/paths.json`)
It begins with a `"prefix"` value. For this site it is `"../"`. It means: "the page that is loading things is one folder deep, so every absolute resource path must be prefixed with `../`". Example: `/resources/css/root.css` becomes `../resources/css/root.css`. The prefix may be changed later by me (for example to `""` or `"../../"`), so **no file of yours may hardcode it**.

### 4.2 `paths.js` (already exists; its location is most likely `/resources/js/modules/paths.js`; search the project to confirm the exact location before importing it)
It exports these functions:

- `getPaths()` (async): loads `/resources/data/paths.json`, stores the prefix, and returns the resolved paths object. **You must `await getPaths()` once before using `resolvePath`**, otherwise the prefix is not active yet.
- `resolvePath(path)`: takes an absolute path such as `"/resources/structure/css/structural-demonstration.css"` and returns it with the prefix added (for prefix `"../"` it returns `"../resources/structure/css/structural-demonstration.css"`). It leaves `#anchors`, `http(s):`, `//`, `data:`, `mailto:`, `tel:` URLs untouched. It will not add the prefix twice.
- `getPrefix()`: returns the active prefix string.
- `getPath(key)`: returns one resolved entry of `paths.json`.

### 4.3 How YOUR code must use it
Every one of your files that needs a URL (the CSS link, the JSON fetches, the placeholder image) does:

```js
import { getPaths, resolvePath } from "../../js/modules/paths.js"; // adjust the relative path to the real location of paths.js
await getPaths();                                                   // activates the prefix (cached, cheap to call again)
const cssUrl = resolvePath("/resources/structure/css/structural-demonstration.css");
```

The path from `/resources/structure/js/` to `paths.js` (if it is at `/resources/js/modules/paths.js`) is `../../js/modules/paths.js`. Verify this in the real project and fix it if needed.

**Relative `import` statements between your own JS files** (`./engine/scene.js`, `./vendor/three.module.js`) are resolved by the browser relative to the importing file, so they do NOT need `resolvePath` and are not affected by the prefix. Only things loaded with `fetch`, `<link href>`, `<img src>` need `resolvePath`.

You must NOT add keys to `paths.json`. Instead, define one constant object at the top of the writer file with the module's own absolute paths:

```js
const FILES = {
  css:         "/resources/structure/css/structural-demonstration.css",
  text:        "/resources/structure/data/structural-demonstration.json",
  config:      "/resources/structure/data/structure.json",
  placeholder: "/resources/structure/img/placeholder-structure.jpg"
};
```
and pass each through `resolvePath(...)` when used. (The linker has its own small constant with just the CSS path.)

---

## 5. How the two linked files work together

### 5.1 `structural-demonstration-linker.js` (File Type : Loader)
1. Wait for `DOMContentLoaded` (or run immediately if the document is already loaded).
2. `await getPaths()`.
3. Find `document.querySelector(".structural-demonstration")`. If it does not exist, `console.warn("structural-demonstration: section not found")` and stop.
4. If a `<link data-structure-css>` is not already on the page, create a wrapper `<div>` (not attached to the section), set `wrapper.innerHTML = '<link rel="stylesheet" href="' + escapeHTML(resolvePath(FILES.css)) + '" data-structure-css>'`, and append the created `<link>` element to `document.head`.
5. When the stylesheet finishes loading, set `data-structure-css="ready"` on the `<link>` and dispatch `document.dispatchEvent(new CustomEvent("structure:css-ready"))`. If it is already loaded, dispatch immediately.

### 5.2 `structural-demonstration.js` (File Type : Writer (InnerHTML))
1. Wait for the DOM. `await getPaths()`.
2. Find the section. If missing, warn and stop.
3. Wait until the CSS is ready (check `data-structure-css="ready"` on the link, otherwise wait for the `structure:css-ready` event, with a safety timeout from config). **This makes the load order of the two script tags irrelevant.**
4. Fetch `FILES.text` and `FILES.config` (both through `resolvePath`) in parallel (`Promise.all`). Handle HTTP errors.
5. Write the section markup (section 8) with `section.innerHTML = ...`, escaping every text value.
6. Check for WebGL support. If unavailable, show the fallback (section 13) and stop.
7. If the user prefers reduced motion, boot the engine directly in its **final realistic state** (section 14) and skip scroll-driven animation.
8. Otherwise `const { startEngine } = await import("./engine/scene.js")` (dynamic import, so Three.js only downloads when needed), then call `startEngine({ section, text, config })`.
9. Set `window.structuralDemonstration = { destroy }`. `destroy()` stops the loop, removes event listeners and observers, disposes all geometries/materials/textures/renderer, and empties the section.

---

## 6. Banner header (EVERY file, exactly this style)

Every code file starts with a 4-line banner. Each line is exactly 80 characters of content (the `─` character and the centred text), after the comment marker. The text is centred and padded with `─` on both sides with one space around the text. Line 1 and line 4 are 80 `─` characters.

JS example (also use for `.json`? NO: JSON files have no comments, so they get no banner):

```js
// ────────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────── NP Consultants ────────────────────────────────
// ──────────────── structure/js/structural-demonstration.js ─────────────────────
// ────────────────────────────────────────────────────────────────────────────────
// File Type : Writer (InnerHTML)
// Writes the section markup from JSON and starts the 3D engine.
```

CSS: same, but each line is wrapped as a comment: `/* ──── ... ──── */`.

HTML: use `<!-- ... -->` per line.

Line 3 contains the file path relative to `/resources/`. Under the banner, write `File Type : <one of: Loader | Writer (InnerHTML) | Engine | Stylesheet | Shell | Test Page>` and a 1–3 line implementation note. Generate the banners with a tiny script (so the widths are exactly right), do not type them by hand.

---

## 7. Technology

### 7.1 Three.js (local, no CDN)
- Use **Three.js** (current stable release). Install it temporarily with `npm`, then **copy the needed files into `/resources/structure/js/vendor/`** and delete any `node_modules`/`package.json` you created. The module must run from plain static files.
- Copy `build/three.module.js` and, if that version has it, `build/three.core.js` (the module imports it). Copy only the extra helpers you use from `examples/jsm/` (for example `environments/RoomEnvironment.js`, and post-processing files only if you use bloom). **Rewrite any bare `import ... from "three"` inside the copied files to a relative import** such as `"./three.module.js"`, because there is no import map (I only link two script tags).
- Import it in the engine as `import * as THREE from "../vendor/three.module.js";`.
- Do not use any other 3D or animation library. Write easing and timeline code yourself (small helpers).

### 7.2 Units and coordinates
Use **metres**. Y is up. The building is centred on the origin: its length runs along the X axis, its span along the Z axis. Ground is at `y = 0`.

---

## 8. The section markup (written by the writer with innerHTML)

```html
<div class="canvas"><canvas></canvas></div>

<div class="scroller" tabindex="0" aria-label="[from JSON]">
  <div class="step" style="--i:0"></div>   <!-- one empty .step per stage (count from structure.json) -->
  <div class="step" style="--i:1"></div>
  ...
</div>

<div class="hud">
  <p class="counter">1 / 6</p>                 <!-- from stage index + count -->
  <h2 class="title">[stage title]</h2>        <!-- JSON -->
  <p class="description">[stage text]</p>     <!-- JSON -->
  <div class="progress"><span class="bar"></span></div>
</div>

<p class="hint">[scroll hint text]</p>        <!-- JSON; hidden after the first scroll -->
<div class="tooltip" role="tooltip"></div>     <!-- filled on member hover / tap -->
<button class="toggle" type="button" hidden>[Blueprint / Real label]</button>
<div class="flash"></div>
<div class="fallback" hidden><img alt="[JSON]"></div>
<div class="live" aria-live="polite"></div>    <!-- visually hidden; announces stage title -->
```

Notes:
- The `<section>` gets `role="region"` and `aria-label` from JSON.
- `.canvas` sits behind everything (absolute, full size). The WebGL canvas is NOT inside the scroller.
- `.scroller` is an absolutely positioned layer filling the section, scrollable vertically, with scroll snapping. It contains only empty `.step` blocks, each exactly 100% of the section height. It exists only to give the visitor something to scroll and snap on. It is transparent. The canvas must still receive pointer events for dragging (see section 11.3).
- `.hud` is text overlaid at the bottom-left (desktop) or bottom (phone), with a readable contrast over the 3D scene. `pointer-events: none` on the HUD except nothing inside it needs clicks.

---

## 9. Scroll behaviour (snap to each stage)

### 9.1 CSS
```css
.scroller { position: absolute; inset: 0; overflow-y: auto; scroll-snap-type: y mandatory;
            overscroll-behavior: auto; scrollbar-width: none; }
.step { height: 100%; scroll-snap-align: start; scroll-snap-stop: always; }
```
(Use tokens or `100%`; no hardcoded sizes. Hide the scrollbar visually but keep it scrollable.)

### 9.2 JS
- The current stage index = `Math.round(scroller.scrollTop / scroller.clientHeight)`. Listen to `scroll` (passive) and update on animation frames only (do not do heavy work inside the scroll event). Use `scrollend` when available, with a debounced fallback.
- When the stage index changes: update the HUD (counter, title, description, progress bar), update `.live`, hide `.hint` the first time, and call `stages.setTargetStage(index)`.
- Keyboard: the scroller is focusable. Arrow Up/Down, PageUp/PageDown, Home, End move between snap steps (the browser does this natively; make sure focus is possible and a visible focus ring is shown using a token).
- **Page continuity:** because the scroller has `overscroll-behavior: auto`, when the visitor is at the first step and scrolls up, or at the last step and scrolls down, the page itself continues to scroll normally. Do not trap the visitor. Do not use `preventDefault` on wheel or touch events anywhere.

---

## 10. The master timeline (this is how the animation is driven)

Write `stages.js` as a **time-based timeline whose whole visual state is a pure function of one number `T` (seconds)**. This is what makes reverse scrolling (dismantling) free and glitch-free.

- `config.timeline.stages` is an ordered list. Each stage has `id`, `startsAt` and `endsAt` in timeline seconds (computed in code from the durations in the config, back to back).
- State: `T` (current timeline time), `targetT` (where we want to be). When the visitor snaps to stage `k`, set `targetT = stage[k].endsAt` (for `k = 0` set `targetT = 0`, meaning an empty site with only the grid and foundation outlines).
- Every frame: move `T` toward `targetT`. Forward speed = `config.timeline.playbackSpeed` (1 = real time). Backward speed = `config.timeline.reverseSpeed`. Apply a short ease at the start and end of each move so changes of direction feel smooth. Never jump.
- Every frame call `applyTime(T)`, which sets the position, rotation, visibility, opacity and cable shape of everything (members, crane, panels, flash state, material set) from `T` alone. No state is stored on objects between frames (except particles, below).
- **One-shot effects** (dust, sparks, a spark ring on panel contact, the flash itself) are triggered when `T` **crosses** a member's/panel's contact time. When moving forward, emit them. When moving backward, do not emit them (or emit a subtle reverse puff, optional).
- If the visitor scrolls quickly through several stages, `T` just travels further and plays through everything quickly (increase the speed a bit when `|targetT - T|` is large, capped by `config.timeline.maxCatchUpSpeed`).

### 10.1 Stages (defaults, all editable in `structure.json`)
| # | id | What happens |
|---|----|--------------|
| 1 | `foundations` | Grid lines and blueprint bubbles (A, B, C… and 1, 2, 3…) fade in. Concrete footing outlines and base plates with anchor bolts drop in. |
| 2 | `columns` | Columns (H-beams) are lowered one by one onto the base plates. |
| 3 | `rafters` | Rafters (pitched H-beams) are lowered onto the columns, one portal frame at a time. Apex and eaves connection plates and bolt groups appear. |
| 4 | `secondary` | Eave struts, purlins on the roof, side rails on the walls. |
| 5 | `bracing` | Diagonal cross-bracing in the end bays, gable-end columns. Crane lifts away and fades out. |
| 6 | `cladding` | Panels fly in (section 12), then the flash and the real-life swap. |

Each stage has: `title` and `text` (these live in `structural-demonstration.json`, keyed by `id`), plus in `structure.json`: `duration`, `memberDuration`, `stagger`, `dropHeight`, `easing`.

---

## 11. The 3D engine

### 11.1 `scene.js`
- `startEngine({ section, text, config })` creates: renderer (antialias, `powerPreference: "high-performance"`), scene, camera, lights, ground, grid, the building (via `members.js`), the crane (via `crane.js`), the panels (via `panels.js`), particles, camera controller, stage controller, flash controller.
- Renderer: pixel ratio capped at `config.renderer.pixelRatioMax` (desktop) or `pixelRatioMaxMobile` (touch devices); `outputColorSpace = SRGBColorSpace`; `toneMapping = ACESFilmicToneMapping`; soft shadows (`PCFSoftShadowMap`), shadow map size from config (smaller on mobile).
- Resize: use a `ResizeObserver` on the section; update camera aspect and renderer size. Support the mobile browser bar changing the height.
- **Render loop:** `requestAnimationFrame`. Use a clock for delta time (clamp delta to a max from config so a background tab does not make a huge jump). Pause the loop when the section is off screen (`IntersectionObserver`) and when `document.hidden`. Resume correctly.
- Background before the flash is **pure black** (colour from the CSS token `--structure-background`, read with `getComputedStyle(section)`). Fog is optional, black.
- Lights, **blueprint mode:** low ambient, one cool directional light, subtle rim light, so the steel reads as clean grey-blue metal with a thin glowing accent edge.
- Lights, **real mode:** warm sun directional light with shadows, sky/ground hemisphere light, environment map (generate a small one at start with `PMREMGenerator` and `RoomEnvironment`, or a procedural gradient sky).
- Keep both light sets in the scene and cross-fade their intensities inside the flash (section 11.7).
- Ground: a large circle/plane. Blueprint mode: black with a faint grid (a `GridHelper` or shader grid, accent colour at low opacity, fading out with distance). Real mode: a concrete slab under the building plus a darker ground, receiving shadows.

### 11.2 `members.js` (the steel)
Build everything from `config.building` and `config.sections`. **All dimensions in metres.**

**Building parameters (defaults):**
```
bays: 8, bayWidth: 6, span: 24, eavesHeight: 8, ridgeHeight: 10.5,
purlinSpacing: 1.5, railSpacing: 1.8
```
- Frames: `bays + 1` portal frames, at `x = (i - bays/2) * bayWidth`.
- Each frame: left column, right column (at `z = ±span/2`), left rafter, right rafter meeting at the apex (`z = 0`, `y = ridgeHeight`). Rafter length = distance from eave `(z = ±span/2, y = eavesHeight)` to apex.
- Between frames: purlins (along X, on top of the rafters, spaced `purlinSpacing` along the slope), side rails (along X, on the columns, spaced `railSpacing`), eave struts (along X at eaves height).
- Gable ends: extra gable columns at both end walls, spaced across the span.
- Bracing: diagonal X rods (use thin cylinders/boxes) in the bays listed in `config.building.endBayBracing`, on the roof plane and on the side walls.

**H-beam geometry (must be a real I-section, not a box):**
- Build the I profile with `THREE.Shape` using `depth`, `flangeWidth`, `flangeThickness`, `webThickness` from the section config; extrude it along the member length with `ExtrudeGeometry` (small bevel from config for a real edge highlight). Cache geometry by `sectionName + length` so repeated members share it.
- Orient members correctly (columns vertical with the web along the span direction, rafters along the roof slope, purlins/rails along X, etc.).
- Sections in config (defaults, metres): `column`, `rafter`, `purlin`, `rail`, `eaveStrut`, `gableColumn`. Larger for columns/rafters (e.g. depth 0.40, flange width 0.20, flange thickness 0.016, web thickness 0.010), smaller for purlins/rails (e.g. depth 0.20).

**Detail (this is what makes it look real, do not skip):**
- Base plates (rectangular plate + 4 anchor bolts with nuts) under every column.
- Apex plate and eaves plate with bolt groups at rafter–rafter and rafter–column joints.
- Web stiffeners (thin plates) at the eaves joint and under the apex.
- Gusset plates where bracing meets members.
- Bolts as `InstancedMesh` (hex head + short shank), one instanced mesh for all bolts.
- Repeated identical members (purlins, rails) use `InstancedMesh` where possible, but each must still be individually animated in time, so keep per-instance matrices and update them each frame in `applyTime`.

**Each member object stores (static data only):** `id`, `type`, `name` (for the tooltip, e.g. "Rafter R3"), `section` name, final transform, `stage` id, `startsAt` and `endsAt` seconds in its stage (computed from `stagger` and `memberDuration`), `liftPoints` (two local points near each end of the member where the cable legs attach, at roughly ¼ and ¾ of its length).

**`applyTime(T)` for a member (pure function of T):**
- Before `startsAt`: hidden.
- Between `startsAt` and `endsAt`: it descends from `dropHeight` above its final position along Y, easing **in-out** (slow start, steady descent, slow near the seat). It also has a small damped sway: `sway = amplitude * exp(-decay * (T - startsAt)) * sin(frequency * (T - startsAt))` applied as a small rotation about the vertical axis and a tiny horizontal offset (values from `config.crane`). It is carried by the crane (see 11.3).
- At `endsAt`: it is seated; a tiny settle bounce (`settleBounce`, damped, ~0.3 s) is applied, then rest.
- After `endsAt`: seated and static.
- The member material is the blueprint material in the blueprint state and the realistic one afterwards (section 11.6).

### 11.3 `crane.js` (the crane and the two-cable sling — this is the hero of the animation)
Do not make beams "draw" themselves line by line. **Every member is physically lowered by a crane on two wires.**

**Crane model (detailed, built from primitives):**
- An overhead **gantry crane**: two tall legs/rails on either side (outside the building footprint), a long girder spanning across the building along the Z axis (or X, your choice), able to travel along the other axis, plus a **trolley** that moves along the girder, a **hoist drum**, a **hook block** hanging from the trolley, and a **spreader bar** under the hook block.
- Detail: lattice texture or beams for the girder, small cab/motor box, rail tracks on the ground, warning stripes, small lights. Materials: dark steel with an accent-coloured stripe in blueprint mode; yellow/orange paint in real mode.
- In the blueprint state the crane is drawn with the same style as the steel (so it feels part of the same drawing).

**Two-cable sling (focus on this):**
- From the spreader bar (or hook block) two cable "legs" go down to the **two lift points** of the member being lowered. Draw each cable as a thin cylinder mesh (radius `config.crane.cableRadius`) with a faint highlight, re-positioned and re-oriented **every frame** between its two end points (write a small `placeCable(mesh, pointA, pointB)` helper using `quaternion.setFromUnitVectors`). Also show a small shackle/hook at the member end.
- Also draw 2 thin cables going from the trolley's hoist drum to the hook block, so the whole chain trolley → hoist cables → hook block → sling → member is visible.
- **Sequence for each member, as a function of T between `startsAt` and `endsAt`:**
  1. *Positioning* (first part): the trolley and girder travel so the hook is above the member's target position (the member is hanging at `dropHeight`). The sling cables are taut and the load is rising/hanging.
  2. *Lowering* (main part): the hoist cables lengthen; the member descends; sling cables stay taut with a tiny sway (as in 11.2).
  3. *Seating* (end): the member touches down; the cables briefly go slack (the hook block drops slightly towards the member and the legs bow), a dust puff + sparks emit at the connection (particles).
  4. *Release and return* (after `endsAt`, for a short `releaseDuration`): the sling cables detach (they swing free and rise), the hook block rises, the trolley travels toward the next member's position. This overlaps with the next member's *positioning* phase so the crane works continuously.
- Everything above is computed from `T`; do not keep per-frame state on the crane.
- After the last member of stage 5, the crane retracts and fades out (or slides away) over `config.crane.exitDuration`. In reverse it returns.
- The camera orbit must never be blocked by the crane: the crane is allowed to pass between the camera and the building; keep its materials slightly transparent in blueprint mode if needed (config `crane.opacity`).

### 11.4 `camera.js` (interactive + rotating while it builds)
- A perspective camera (FOV from config) orbiting a target point (config) at a distance and height from config.
- **Auto-orbit:** the azimuth increases continuously at `config.camera.autoSpeed` radians per second **while `T` is changing**, and drifts at a reduced rate otherwise. At each stage the camera also eases toward a stage-specific distance/height defined in `config.timeline.stages[k].camera` (so that, for example, stage 1 looks down at the foundations and stage 6 pulls back to show the whole building).
- **Drag to orbit:** pointer events on the canvas (mouse and touch). Dragging adds an azimuth/polar offset (`dragSensitivity`), clamped between `polarMin` and `polarMax`. While dragging, auto-orbit pauses; after `idleResume` seconds without input, the offset eases back to zero and auto-orbit resumes. Use damping (`damping` factor).
- **No wheel zoom and no pinch zoom** (it would fight with page scrolling). Use `touch-action: pan-y` on the canvas wrapper so vertical swipes still scroll the section/page, while horizontal drags rotate. Implement the drag with `pointerdown/move/up` and `setPointerCapture`; ignore the drag if the movement is mostly vertical on touch devices.
- Never use `preventDefault` on wheel/touch.

### 11.5 `particles.js`
A small pooled system (fixed-size `Points` or instanced quads), used for:
- **Dust puff** at each seating (soft grey-brown sprites that expand and fade, 0.6–1 s).
- **Sparks** (tiny bright accent-coloured points flying out and falling with gravity).
- **Magnetic spark ring** at each panel contact (section 12).
Counts and lifetimes come from config. Lower counts on mobile. When `T` moves backward, do not emit.

### 11.6 `materials.js` (blueprint and real)
Two complete material sets for each category (steel, plates, bolts, crane, panels, ground, grid), built from config colours and PBR values:
- **Blueprint set:** dark cool-grey `MeshStandardMaterial` with low roughness, plus an additive "edge glow" (use `EdgesGeometry` lines in the accent colour at low opacity, or a fresnel-style emissive), everything slightly emissive so it reads on black.
- **Real set:** `MeshStandardMaterial`/`MeshPhysicalMaterial` with believable values: galvanised steel (metalness ~0.8, roughness ~0.35), painted columns (colour from config), corrugated roof/wall panels (generate a corrugation normal map or bump map procedurally on a canvas texture, no image files), concrete slab (procedural noise texture), ground.
- `setMode(mode)` with `"blueprint" | "real"`: swaps every mesh's material from the right set (keep references; do not create new materials every swap), and also swaps lights, background, grid/ground visibility, dimension labels visibility.
- Dispose of procedural textures in `destroy()`.

### 11.7 `flash.js` (the sudden "become real" effect)
- The `.flash` overlay is an absolutely positioned white layer, `opacity: 0`, `pointer-events: none`.
- When `T` crosses `config.flash.at` (in stage 6, just after the last panel contacts the frame) moving **forward**:
  1. Overlay opacity rises quickly to 1 in `config.flash.rise` seconds (`ease-in`).
  2. **At the peak** (opacity 1), call `materials.setMode("real")`, switch lights/background/ground, hide the grid and dimension labels, show the `.toggle` button.
  3. Optionally a quick camera push/FOV punch (`config.flash.punch`) and a subtle bloom if you included it and the device is not mobile.
  4. Hold for `config.flash.hold`, then fade the overlay out over `config.flash.fall` seconds (`ease-out`).
- When `T` crosses it **backward**, run the same flash in reverse order (flash up, swap to blueprint at the peak, fade out).
- After the flash, the `.toggle` lets the visitor switch between Blueprint and Real freely (calls `setMode`; no flash needed, just a quick cross-fade of 0.3 s via the overlay at a low peak opacity from config).
- The flash is driven by `T` crossings plus a small time-based animation; make sure scrolling back and forth quickly never leaves the overlay stuck or the wrong material mode applied (the mode must always match whether `T` is before or after the flash time, unless the visitor used the toggle).

---

## 12. Panels (the "magnetic" arrival)

`panels.js` builds all cladding from config:
- **Roof sheets:** a grid of rectangular corrugated sheets covering both roof slopes. **Wall panels:** sheets covering both long walls and both gable ends, with openings left for a big roller door and a pedestrian door on one gable (optional but nice; sizes in config). Slightly different tint per panel (±3%) for realism in real mode.
- Each panel has: final transform, and a **random start transform** far from the building: distance between `flyDistanceMin` and `flyDistanceMax` in a random direction (use a seeded random so the layout is the same every time), random rotation.
- Timing: `startsAt` per panel from `config.panels.stagger` in a **wave** ordered by `config.panels.waveDirection` (`"bottom-up"` by default: lowest panels first). Each panel travels for `config.panels.travelDuration`.
- **Motion curve: ease-in** (slow start, strong acceleration, as if magnetically attracted). Use a cubic or quartic ease-in for the position (`t^3` / `t^4`) and align the rotation with a slightly faster ease so the panel is already flat when it arrives. Add a tiny overshoot-and-settle (`snapOvershoot`) at contact, 0.15 s.
- **Magnetic look:** while travelling, each panel has an emissive accent glow that intensifies with the ease-in curve, and a short trailing streak (a few stretched, fading copies or a line) pointing toward the frame. At contact: one **spark ring** + a few sparks (particles), the emissive glow flashes and decays in 0.3 s.
- Panels are hidden before `startsAt`. In reverse they fly back out (same curve reversed).
- The frame must be fully visible before the first panel arrives, and the panel stage starts only after stage 5 is complete.

---

## 13. Fallbacks, errors, performance

- **No WebGL / context creation fails:** show `.fallback` (the placeholder image, `hidden` attribute removed), show the stage titles as a plain list in the HUD, and do not load Three.js. Never leave a blank black section.
- **WebGL context lost:** pause, show the fallback; if `webglcontextrestored` fires, rebuild.
- **Fetch/JSON errors:** `console.error` a clear message, then show the fallback.
- **Performance targets:** 60 fps on a laptop with integrated graphics; 30+ fps on a mid phone. Use instancing, shared geometries/materials, capped pixel ratio, small shadow maps on mobile, no per-frame allocations (reuse `Vector3`/`Matrix4`/`Quaternion` temporaries), pause when off-screen or hidden.
- **Cleanup:** `destroy()` disposes everything and removes all listeners (`scroll`, `resize`, `pointer*`, `visibilitychange`, observers).

---

## 14. Reduced motion and accessibility

- If `window.matchMedia("(prefers-reduced-motion: reduce)").matches`: do not run the scroll-driven build. Render the **finished, realistic** building once (set `T` to the end of the timeline, mode `real`), keep gentle manual drag-to-orbit only (no auto-orbit), hide `.scroller`, `.hint`, and the flash. The HUD shows the final title/description.
- In CSS, all hide-and-offset start states (anything that begins invisible or shifted) are inside `@media (prefers-reduced-motion: no-preference)`, so reduced-motion users simply see content.
- The section has `role="region"` with an `aria-label`. Stage changes are announced in `.live`. The toggle is a real `<button>` with `aria-pressed`. Visible focus rings on `.scroller` and `.toggle` (token-based).
- Colour contrast of HUD text over the scene: add a soft dark gradient behind the HUD (built with `color-mix` from existing tokens, no new hardcoded colours).

---

## 15. CSS file (`css/structural-demonstration.css`)

### 15.1 Token block (all declared on `.structural-demonstration`, each with its own literal value; no aliasing)
Create tokens for at least these groups (names are suggestions; keep the `--structure-` prefix):

```
Colours      --structure-background (black), --structure-color (near white text), --structure-color-mute (grey text),
             --structure-accent (a bright blueprint cyan or steel-blue), --structure-flash (white),
             --structure-glass (semi-transparent dark), --structure-border (faint line)
Fonts        --structure-font-large, --structure-font-medium, --structure-font-small (rem), --structure-font-family (system stack),
             --structure-weight-bold, --structure-weight-regular, --structure-line
Radius       --structure-radius-small, --structure-radius-medium, --structure-radius-large
Spacing      --structure-gap-small/medium/large, --structure-padding-small/medium/large, --structure-margin-small/medium/large
Layers       --structure-layer-canvas, --structure-layer-scroller, --structure-layer-hud, --structure-layer-tooltip, --structure-layer-flash
Motion       --structure-transition-small/medium/large (seconds), --structure-ease, --structure-ease-out, --structure-stagger,
             --structure-offset-small/large (rem), --structure-enter-scale, --structure-hover-lift
Layout       --structure-hud-width, --structure-progress-height, --structure-toggle-size, --structure-tooltip-width
Focus        --structure-focus-width, --structure-focus-color
```
After the token block, list every token in the final reply so I can copy them elsewhere.

### 15.2 Styles
- `.structural-demonstration { position: relative; height: 100vh; height: 100dvh; overflow: hidden; background: var(--structure-background); color: var(--structure-color); font-family: var(--structure-font-family); }`
- Style `.canvas`, `.scroller`, `.step`, `.hud` (counter, title, description, progress bar), `.hint` (small animated "scroll" cue), `.tooltip`, `.toggle`, `.flash`, `.fallback`, `.live` (visually hidden), focus states.
- Custom, themed scrollbar is NOT needed (the scroller's scrollbar is hidden).
- No per-item `nth-child` rules. JS sets `--i` where stagger is needed, CSS uses `calc(var(--structure-stagger) * var(--i))`.
- Intro animations (HUD text fading in per stage) go on **wrappers** (`.hud .title`, `.hud .description`), hover transforms (the toggle) on the inner element, so an animation fill never blocks a hover transform.
- Adaptive breakpoints (min/max-width in rem): `68.75rem`, `43.75rem`, `25rem`, plus `@media (max-height: 37.5rem)` for landscape phones. Rules:
  - Desktop: HUD at bottom-left, max width from token.
  - ≤ `43.75rem`: HUD at bottom, full width, smaller type; toggle top-right.
  - ≤ `25rem`: smaller type again; description clamped to 3 lines (`line-clamp`) if too long, never hidden.
  - Landscape phone: HUD compact, description hidden only if it genuinely cannot fit; the title and counter always remain.
  - Respect `env(safe-area-inset-*)` for padding.
- Do not use `100vw`. Use `100%`.

---

## 16. JSON files

### 16.1 `data/structural-demonstration.json` (all text)
```json
{
  "label": "Structural design demonstration",
  "scrollHint": "Scroll to build",
  "dragHint": "Drag to rotate",
  "counter": "{current} / {total}",
  "stages": {
    "foundations": { "title": "Foundations",         "text": "Grid lines are set out and base plates are anchored to the footings." },
    "columns":     { "title": "Columns",             "text": "Steel H-columns are lifted by crane and lowered onto their base plates." },
    "rafters":     { "title": "Portal frames",       "text": "Rafters are hoisted into place and bolted at the eaves and the apex." },
    "secondary":   { "title": "Purlins and rails",   "text": "Secondary members tie the frames together and carry the cladding." },
    "bracing":     { "title": "Bracing",             "text": "Diagonal bracing makes the whole structure stable against wind." },
    "cladding":    { "title": "Cladding",            "text": "Roof and wall panels lock onto the frame and complete the building." }
  },
  "toggle": { "blueprint": "Blueprint", "real": "Real", "label": "Switch between blueprint and real view" },
  "members": {
    "column":   "Column {id} · {section}",
    "rafter":   "Rafter {id} · {section}",
    "purlin":   "Purlin {id} · {section}",
    "rail":     "Side rail {id} · {section}",
    "eaveStrut":"Eave strut {id} · {section}",
    "brace":    "Bracing {id}",
    "baseplate":"Base plate {id}",
    "panel":    "Panel {id}"
  },
  "sections": {
    "column": "UB 406×178", "rafter": "UB 406×178", "purlin": "UB 203×133",
    "rail": "UB 203×133", "eaveStrut": "UB 203×133", "gableColumn": "UB 305×165"
  },
  "fallback": { "alt": "Blueprint of a steel portal-frame building" },
  "aria": { "scroller": "Scroll to move between construction stages", "stage": "Stage {current} of {total}: {title}" }
}
```
The writer replaces `{placeholders}` with values, escaping them. You may extend this file as needed, but **no visible text may exist anywhere else**.

### 16.2 `data/structure.json` (all numbers)
Create this file with complete, sensible values for every key used by the code. At minimum:

```json
{
  "renderer": { "pixelRatioMax": 2, "pixelRatioMaxMobile": 1.5, "shadowMapSize": 2048, "shadowMapSizeMobile": 1024,
                "toneMappingExposure": 1.0, "maxDelta": 0.05, "cssReadyTimeout": 4000 },
  "colors": { "steelBlueprint": "#8fa3b8", "steelReal": "#c4ccd4", "columnPaint": "#2f5d8a", "craneBlueprint": "#6f8296",
              "craneReal": "#f2a900", "panelReal": "#d9dde2", "concrete": "#9a9a96", "ground": "#4a4d45",
              "skyTop": "#6fa8dc", "skyBottom": "#f6d9b8", "sun": "#fff1d6" },
  "building": { "bays": 8, "bayWidth": 6, "span": 24, "eavesHeight": 8, "ridgeHeight": 10.5,
                "purlinSpacing": 1.5, "railSpacing": 1.8, "endBayBracing": [0, 7], "gableColumns": 3 },
  "sections": {
    "column":      { "depth": 0.40, "flangeWidth": 0.20, "flangeThickness": 0.016, "webThickness": 0.010, "bevel": 0.004 },
    "rafter":      { "depth": 0.40, "flangeWidth": 0.20, "flangeThickness": 0.016, "webThickness": 0.010, "bevel": 0.004 },
    "purlin":      { "depth": 0.20, "flangeWidth": 0.10, "flangeThickness": 0.010, "webThickness": 0.006, "bevel": 0.002 },
    "rail":        { "depth": 0.20, "flangeWidth": 0.10, "flangeThickness": 0.010, "webThickness": 0.006, "bevel": 0.002 },
    "eaveStrut":   { "depth": 0.20, "flangeWidth": 0.10, "flangeThickness": 0.010, "webThickness": 0.006, "bevel": 0.002 },
    "gableColumn": { "depth": 0.30, "flangeWidth": 0.15, "flangeThickness": 0.012, "webThickness": 0.008, "bevel": 0.003 }
  },
  "plates": { "base": { "width": 0.6, "depth": 0.5, "thickness": 0.03 }, "eaves": { "thickness": 0.02 },
              "apex": { "thickness": 0.02 }, "gusset": { "thickness": 0.012 }, "stiffener": { "thickness": 0.01 } },
  "bolts": { "radius": 0.012, "headHeight": 0.01, "length": 0.05, "perBasePlate": 4, "perEavesJoint": 6, "perApexJoint": 8 },
  "crane": { "railHeight": 13, "girderDepth": 0.7, "legSpacing": 34, "trolleySpeed": 6, "cableRadius": 0.012,
             "hoistCableRadius": 0.02, "liftHeight": 5, "swayAmplitude": 0.12, "swayDecay": 2.2, "swayFrequency": 3.0,
             "settleBounce": 0.04, "releaseDuration": 0.8, "exitDuration": 2.5, "opacity": 0.85 },
  "particles": { "dustCount": 24, "sparkCount": 16, "lifetime": 0.8, "gravity": 9.8, "countMobileFactor": 0.5 },
  "panels": { "roofSize": [3.0, 1.5], "wallSize": [3.0, 1.8], "flyDistanceMin": 14, "flyDistanceMax": 34,
              "travelDuration": 1.4, "stagger": 0.05, "waveDirection": "bottom-up", "snapOvershoot": 0.03,
              "glowPeak": 2.0, "seed": 7, "doors": { "roller": [4, 4.5], "pedestrian": [1, 2.1] } },
  "camera": { "fov": 40, "distance": 46, "height": 17, "target": [0, 4.5, 0], "autoSpeed": 0.12, "idleSpeedFactor": 0.4,
              "dragSensitivity": 0.005, "polarMin": 0.9, "polarMax": 1.45, "damping": 0.08, "idleResume": 2.5 },
  "flash": { "at": 0.97, "rise": 0.22, "hold": 0.08, "fall": 0.9, "punch": 4, "toggleFade": 0.3, "toggleFadePeak": 0.35 },
  "timeline": { "playbackSpeed": 1, "reverseSpeed": 1.6, "maxCatchUpSpeed": 4, "ease": 0.4,
    "stages": [
      { "id": "foundations", "duration": 4,  "memberDuration": 1.4, "stagger": 0.25, "dropHeight": 6, "camera": { "distance": 38, "height": 22 } },
      { "id": "columns",     "duration": 8,  "memberDuration": 2.0, "stagger": 0.6,  "dropHeight": 9, "camera": { "distance": 44, "height": 14 } },
      { "id": "rafters",     "duration": 9,  "memberDuration": 2.2, "stagger": 0.9,  "dropHeight": 8, "camera": { "distance": 48, "height": 17 } },
      { "id": "secondary",   "duration": 7,  "memberDuration": 0.9, "stagger": 0.1,  "dropHeight": 5, "camera": { "distance": 46, "height": 20 } },
      { "id": "bracing",     "duration": 4,  "memberDuration": 1.2, "stagger": 0.35, "dropHeight": 4, "camera": { "distance": 50, "height": 16 } },
      { "id": "cladding",    "duration": 9,  "memberDuration": 0,   "stagger": 0,    "dropHeight": 0, "camera": { "distance": 56, "height": 15 } }
    ] }
}
```
`flash.at` is a fraction (0–1) of the cladding stage's duration at which the flash fires. Tune all numbers while testing so the animation feels right; keep every tunable number in this file.

---

## 17. Interaction details

- **Hover / tap a member:** use a `Raycaster` (throttled to once per animation frame, skipped while dragging or on touch-move). The hovered member gets an accent outline/emissive boost; the `.tooltip` shows its name (from the JSON `members` templates, filled with `id` and `section`), positioned near the pointer, kept inside the section.
- On touch devices: tap shows the tooltip for 2 seconds.
- The `.toggle` button appears after the flash (remove `hidden`), and reappears correctly when scrolling back through the flash.
- The `.hint` ("Scroll to build" + "Drag to rotate") shows at the start, fades out after the first scroll or drag.

---

## 18. Build order (follow this to avoid a mess)

1. Create the folder structure and the banner generator script.
2. Write `structural-demonstration.json` and `structure.json`.
3. Write the CSS (tokens + styles) and the shell HTML + `preview.html`.
4. Write the linker and the writer (markup, fetching, CSS-ready logic, fallback). Test: the section appears with the HUD and the scroll snap works, even before the 3D exists.
5. Vendor Three.js. Write `scene.js`, `materials.js`, `helpers.js`. Test: a black scene with grid and a rotating camera.
6. Write `members.js`: build the whole finished frame, check proportions against the real shape (portal frame with pitched roof, 9 frames, purlins, rails, bracing).
7. Write `stages.js` (timeline) and `applyTime` for members. Test with a temporary slider that sets `T`.
8. Write `crane.js` and the two-cable sling. Tune until the lowering looks believable.
9. Write `particles.js`, `camera.js`.
10. Write `panels.js` (magnetic ease-in arrival).
11. Write `flash.js` and the real-life materials/lighting.
12. Connect the real scroll snapping to `setTargetStage`. Remove the temporary slider.
13. Reduced motion, fallback, accessibility, cleanup (`destroy`), performance pass.
14. Write `readme.md`, generate the placeholder image, run verification.

---

## 19. Verify before you reply (do it, do not skip)

Use a real browser (Playwright/Chromium if available):
- Open `preview.html` at **desktop (1440×900)**, **phone (390×844)** and **landscape phone (844×390)**.
- Take a screenshot **at every stage**, plus one just before and one just after the flash. View them. Fix anything ugly (floating members, wrong orientation, cables not touching the member, crane in the way, unreadable HUD).
- Check: no console errors or warnings; no horizontal overflow; no undefined CSS variables; scroll snap lands exactly on each stage; scrolling back dismantles smoothly; fast scrolling through all stages never leaves things half-built; drag-orbit works with mouse and touch; hover tooltip works; the toggle works; the page scrolls on past the section at the first/last stage.
- Test that paths resolve: put a copy of `preview.html` one folder deep (for example `/test/index.html`) and confirm everything loads with the `"../"` prefix from `paths.json`, and that it also works when the prefix is changed to `""` for a page at the site root.
- Test reduced motion (emulate `prefers-reduced-motion: reduce`) and a forced "no WebGL" case (fallback visible).
- Check the order of the two script tags does not matter.
- Report anything you could not verify.

---

## 20. `readme.md` (inside `/resources/structure/`)
Write a short, clear readme: what the module is, the 3 lines to add to a page, the file tree with one-line purposes, the list of config keys in `structure.json` (what they change), how to add or reorder a stage, how to change the building size, how to change text, how paths and the prefix work, and a short troubleshooting list (blank section, no CSS, wrong paths, WebGL fallback).

---

## 21. Your final reply (keep it short, no recap of this prompt)

One line each:
1. What was built.
2. The exact 3 lines to paste in the page.
3. Every CSS token declared (code block).
4. Choices you made that I did not specify (library version, dimensions, crane type, etc.).
5. What you could not verify.
6. Reminder: keep `/resources/structure/readme.md` up to date when files are added.
