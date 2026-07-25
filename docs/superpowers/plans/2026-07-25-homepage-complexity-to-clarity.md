# Homepage “From Complexity to Clarity” Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, accessible, lightweight homepage whose dossier illustration moves from controlled complexity to an organised ledger during the first 60–80% of one viewport of native scroll, followed by a calmer premium editorial rhythm.

**Architecture:** Preserve the existing static HTML/CSS/JavaScript stack. Rebuild the shared dossier SVG into six semantic groups, embed it through a same-origin `<object>` so the final organised state works without JavaScript, and add one dependency-free homepage controller that maps scroll progress to group transforms through a requestAnimationFrame gate. Isolate all homepage-only presentation in `assets/homepage.css`; retain global navigation, content, forms and non-homepage behavior unchanged.

**Tech Stack:** Semantic HTML, SVG, CSS custom properties/media queries, dependency-free modern browser JavaScript, Node 22 built-in `node:test`, Python 3.11 `unittest`, GitHub Pages.

## Global Constraints

- PT remains the default language; PT and EN must have equivalent structure, behavior and visual hierarchy.
- Preserve all approved service names, descriptions, URLs, company facts, primary copy and contact details.
- Use one moderate hero sequence; no page-long cinematic takeover, scroll hijacking or prolonged pinning.
- Do not add WebGL, Three.js, video, frame sequences, generative runtime, page builders or third-party animation libraries.
- The final organised SVG state must render without JavaScript.
- Do not embed translatable words in the SVG; use localized HTML `aria-label` values for the artwork.
- Reduced motion must show the final organised state with no spatial transformation.
- Narrow mobile must use a shorter, simpler sequence with no pinning.
- Keep WCAG AA targets: 4.5:1 normal text, 3:1 large text and 3:1 meaningful UI/graphic boundaries.
- Keep LCP target at or below 2.5 seconds, INP target at or below 200 ms and CLS target at or below 0.1 under documented representative measurement.
- Preserve native scrolling and avoid un-gated work on every scroll event.
- Do not modify unrelated navigation, forms, About/team profiles, Contact mapping or non-homepage editorial content.
- The current production comparison baseline is approximately 7 resources, 35 KB transferred, 85 KB decoded, 7,864 px document height and 726 px hero height at 1264 × 625; treat these as dated lab observations, not field data.
- No implementation commit, push, pull request, merge or deployment is allowed before Pedro approves the rendered PT and EN homepage prototype.
- Propagation to non-homepage pages is a separate future phase.

---

## Planned File Structure

### Create

- `assets/homepage.css` — homepage-only tokens, hero layout, SVG object frame, service clusters, section rhythm, responsive rules and reduced-motion overrides.
- `assets/homepage-hero.js` — pure progress/interpolation helpers plus the DOM controller for the same-origin SVG object.
- `tests/test_homepage_experience.py` — static bilingual HTML/SVG/CSS contract tests.
- `tests/homepage-hero.test.js` — Node tests for clamping, progress, interpolation, layer state and reduced-motion capability decisions.

### Modify

- `assets/hero-dossier.svg` — canonical final organised artwork with exactly six semantic `data-hero-layer` groups.
- `pt/index.html` — localized hero object markup, homepage CSS/script includes and three service clusters; all existing factual/service copy remains unchanged.
- `en/index.html` — English-equivalent hero object markup, includes and service clusters; all existing factual/service copy remains unchanged.

### Do Not Modify

- `assets/script.js` — retain existing global behavior; the isolated hero controller may add one rAF-gated passive listener in its own file.
- `assets/styles.css` and `assets/visual-system.css` — retain global behavior to prevent visual regressions outside the homepage.
- All non-homepage HTML files.

---

### Task 1: Establish the Homepage Contract and Baseline

**Files:**
- Create: `tests/test_homepage_experience.py`
- Reference: `pt/index.html:35-67`
- Reference: `en/index.html` homepage hero and service grid
- Reference: `assets/hero-dossier.svg:1-28`

**Interfaces:**
- Consumes: existing PT/EN homepages and current SVG.
- Produces: `HomepageExperienceTests`, a structural contract used by Tasks 2, 4 and 5.

- [ ] **Step 1: Verify the execution branch and clean working tree**

Run:

```bash
git branch --show-current
git status --short
```

Expected:

```text
design/homepage-complexity-to-clarity
```

`git status --short` must be empty before implementation starts. At execution time, create an isolated worktree with `superpowers:using-git-worktrees` if the plan runner requires one.

- [ ] **Step 2: Record the immutable baseline**

Run:

```bash
git rev-parse HEAD
git merge-base --is-ancestor 0794b8f HEAD
git diff --check
wc -c assets/hero-dossier.svg assets/script.js assets/styles.css assets/visual-system.css
```

Expected: `0794b8f` (the approved specification commit) is an ancestor of the current plan commit, `git merge-base` and `git diff --check` exit 0. Copy the byte counts into the implementation session notes. Do not modify the specification or plan.

- [ ] **Step 3: Write the failing static contract test**

Create `tests/test_homepage_experience.py` with:

```python
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree
from urllib.parse import unquote, urlsplit
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]
HOME_PAGES = {
    "pt": ROOT / "pt" / "index.html",
    "en": ROOT / "en" / "index.html",
}
EXPECTED_LAYERS = {
    "documents",
    "frame",
    "rows",
    "connectors",
    "validation",
    "signals",
}
EXPECTED_CLUSTERS = {
    "pt": (
        "Serviços 01 a 03",
        "Serviços 04 a 06",
        "Serviços 07 a 09",
    ),
    "en": (
        "Services 01 to 03",
        "Services 04 to 06",
        "Services 07 to 09",
    ),
}
EXPECTED_HERO_LABELS = {
    "pt": "Registos contabilísticos que se organizam num sistema claro e validado.",
    "en": "Accounting records organising into a clear, validated system.",
}


class HomepageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.objects = []
        self.links = []
        self.hrefs = []
        self.ids = set()
        self.scripts = []
        self.service_cards = []
        self.cluster_labels = []
        self._service_depth = 0
        self._service_text = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if attributes.get("id"):
            self.ids.add(attributes["id"])
        if tag == "object" and "data-homepage-hero-art" in attributes:
            self.objects.append(attributes)
        if tag == "link" and attributes.get("rel") == "stylesheet":
            self.links.append(attributes.get("href", ""))
        if tag == "script" and attributes.get("src"):
            self.scripts.append(attributes["src"])
        if tag == "a" and attributes.get("href"):
            self.hrefs.append(attributes["href"])
        if "service-cluster" in attributes.get("class", "").split():
            self.cluster_labels.append(attributes.get("aria-label", ""))
        if tag == "a" and "service-card" in attributes.get("class", "").split():
            self._service_depth = 1
            self._service_text = []
        elif self._service_depth:
            self._service_depth += 1

    def handle_endtag(self, tag):
        if self._service_depth:
            self._service_depth -= 1
            if tag == "a" and self._service_depth == 0:
                self.service_cards.append(" ".join("".join(self._service_text).split()))

    def handle_data(self, data):
        if self._service_depth:
            self._service_text.append(data)


def parse_homepage(path):
    parser = HomepageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


class HomepageExperienceTests(unittest.TestCase):
    def test_bilingual_homepages_share_the_homepage_assets_and_localized_art_label(self):
        for language, page in HOME_PAGES.items():
            with self.subTest(language=language):
                parser = parse_homepage(page)
                self.assertEqual(parser.links.count("../assets/homepage.css"), 1)
                self.assertEqual(parser.scripts.count("../assets/homepage-hero.js"), 1)
                self.assertEqual(len(parser.objects), 1)
                art = parser.objects[0]
                self.assertEqual(art.get("data"), "../assets/hero-dossier.svg")
                self.assertEqual(art.get("type"), "image/svg+xml")
                self.assertEqual(art.get("width"), "560")
                self.assertEqual(art.get("height"), "440")
                self.assertEqual(art.get("role"), "img")
                self.assertEqual(art.get("aria-label"), EXPECTED_HERO_LABELS[language])

    def test_bilingual_homepages_keep_nine_services_in_three_ordered_clusters(self):
        for language, page in HOME_PAGES.items():
            with self.subTest(language=language):
                parser = parse_homepage(page)
                self.assertEqual(len(parser.service_cards), 9)
                self.assertEqual(tuple(parser.cluster_labels), EXPECTED_CLUSTERS[language])

    def test_svg_has_six_semantic_layers_and_no_embedded_text(self):
        svg_path = ROOT / "assets" / "hero-dossier.svg"
        root = ElementTree.fromstring(svg_path.read_text(encoding="utf-8"))
        animated_layers = [
            element for element in root.iter() if "data-hero-layer" in element.attrib
        ]
        layers = {element.attrib["data-hero-layer"] for element in animated_layers}
        text_nodes = [element for element in root.iter() if element.tag.endswith("text")]
        self.assertEqual(layers, EXPECTED_LAYERS)
        self.assertEqual(text_nodes, [])
        self.assertTrue(all("transform" not in element.attrib for element in animated_layers))
        self.assertEqual(root.attrib.get("viewBox"), "0 0 560 440")

    def test_every_local_homepage_link_and_fragment_resolves(self):
        for language, page in HOME_PAGES.items():
            parser = parse_homepage(page)
            for href in parser.hrefs:
                split = urlsplit(href)
                if split.scheme in {"http", "https", "mailto", "tel"} or split.netloc:
                    continue
                if split.path.startswith("/"):
                    destination = (ROOT / split.path.lstrip("/")).resolve()
                elif split.path:
                    destination = (page.parent / split.path).resolve()
                else:
                    destination = page.resolve()
                if destination.is_dir() or split.path.endswith("/"):
                    destination /= "index.html"
                with self.subTest(language=language, href=href):
                    destination.relative_to(ROOT)
                    self.assertTrue(destination.is_file(), destination)
                    if split.fragment:
                        target = parse_homepage(destination)
                        self.assertIn(unquote(split.fragment), target.ids)

    def test_homepage_css_contains_responsive_and_reduced_motion_modes(self):
        css = (ROOT / "assets" / "homepage.css").read_text(encoding="utf-8")
        self.assertIn("@media (max-width: 980px)", css)
        self.assertIn("@media (max-width: 760px)", css)
        self.assertIn("@media (prefers-reduced-motion: reduce)", css)
        self.assertIn("--home-surface-primary", css)
        self.assertNotRegex(css, re.compile(r"gold|glassmorphism|backdrop-filter", re.I))


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 4: Run the focused test and verify the expected failures**

Run:

```bash
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m unittest tests.test_homepage_experience -v
```

Expected: failures because `homepage.css`, `homepage-hero.js`, semantic SVG layers, `<object>` markup and service clusters do not exist yet. A missing `homepage.css` error is expected at this stage.

- [ ] **Step 5: Preserve the red state without committing**

Run:

```bash
git status --short
git diff -- tests/test_homepage_experience.py
```

Expected: only `tests/test_homepage_experience.py` is untracked. Do **not** commit; the approved specification forbids implementation commits before rendered approval.

---

### Task 2: Build the Canonical Static Hero and Bilingual Markup

**Files:**
- Modify: `assets/hero-dossier.svg:1-28`
- Modify: `pt/index.html:16,35-50,146`
- Modify: `en/index.html` corresponding stylesheet, hero and closing script markup
- Create: `assets/homepage.css` as an intentionally minimal file
- Create: `assets/homepage-hero.js` as an intentionally minimal file
- Test: `tests/test_homepage_experience.py`

**Interfaces:**
- Consumes: `EXPECTED_LAYERS`, `EXPECTED_HERO_LABELS` and asset paths from Task 1.
- Produces: a final-state SVG with selectors `[data-hero-layer]`, bilingual `[data-homepage-hero]` scenes and `[data-homepage-hero-art]` objects for Task 3.

- [ ] **Step 1: Rebuild the SVG in its final organised state**

Replace `assets/hero-dossier.svg` with a 560 × 440 illustration using this required skeleton and six groups. Keep the final geometry within the existing viewBox and retain the current blue/teal/pink identity:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 440" aria-hidden="true" focusable="false">
  <style>
    [data-hero-layer]{transform-box:fill-box;transform-origin:center;will-change:transform,opacity}
  </style>
  <g data-hero-layer="documents">
    <g transform="translate(40 90) rotate(-4 220 140)">
      <rect x="0" y="16" width="440" height="270" rx="14" fill="#e2f6f9" stroke="#2fb5c4"/>
      <rect x="28" width="82" height="24" rx="7" fill="#2fb5c4"/>
    </g>
    <g transform="translate(80 64) rotate(2.5 220 140)">
      <rect x="0" y="16" width="440" height="270" rx="14" fill="#fdeaf3" stroke="#e0508f"/>
      <rect x="170" width="82" height="24" rx="7" fill="#e0508f"/>
    </g>
  </g>
  <g data-hero-layer="frame">
    <g transform="translate(60 110)">
      <rect x="0" y="16" width="440" height="270" rx="14" fill="#fff" stroke="#e4eaf2" stroke-width="1.5"/>
      <rect x="310" width="96" height="26" rx="7" fill="#3569b8"/>
    </g>
  </g>
  <g data-hero-layer="rows">
    <g transform="translate(60 110)" fill="none" stroke-linecap="round">
      <circle cx="38" cy="56" r="4" fill="#e0508f" stroke="none"/>
      <line x1="66" y1="56" x2="330" y2="56" stroke="#e4eaf2" stroke-width="3"/>
      <circle cx="38" cy="96" r="4" fill="#3569b8" stroke="none"/>
      <line x1="66" y1="96" x2="390" y2="96" stroke="#e4eaf2" stroke-width="3"/>
      <circle cx="38" cy="136" r="4" fill="#2fb5c4" stroke="none"/>
      <line x1="66" y1="136" x2="280" y2="136" stroke="#e4eaf2" stroke-width="3"/>
      <line x1="66" y1="176" x2="350" y2="176" stroke="#eaf1fc" stroke-width="3"/>
      <line x1="32" y1="216" x2="408" y2="216" stroke="#e4eaf2"/>
    </g>
  </g>
  <g data-hero-layer="connectors">
    <g transform="translate(60 110)" fill="none" stroke="#c7d5e8" stroke-width="1.5" stroke-dasharray="4 6">
      <path d="M334 56 C370 56 372 88 392 96"/>
      <path d="M284 136 C330 136 330 170 354 176"/>
    </g>
  </g>
  <g data-hero-layer="validation">
    <g transform="translate(60 110)" fill="none" stroke="#2fb5c4" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="374" cy="246" r="14" stroke-width="2.5"/>
      <path d="m367 246 5 5 10-11" stroke-width="2.5"/>
    </g>
  </g>
  <g data-hero-layer="signals">
    <g transform="translate(60 110)">
      <rect x="32" y="240" width="94" height="12" rx="6" fill="#eaf1fc"/>
      <circle cx="146" cy="246" r="5" fill="#e0508f" opacity=".72"/>
      <circle cx="164" cy="246" r="5" fill="#3569b8" opacity=".72"/>
      <circle cx="182" cy="246" r="5" fill="#2fb5c4" opacity=".72"/>
    </g>
  </g>
</svg>
```

This skeleton is the canonical final/static state. During rendered design review, geometry and spacing may be refined, but the six group names and absence of `<text>` must remain stable.

- [ ] **Step 2: Replace the PT hero image with the localized object scene**

In `pt/index.html`, keep the current hero copy unchanged, remove `reveal` from the existing `.hero-copy`, and replace the hero-media element with:

```html
<div class="hero-media visual-hero" data-homepage-hero>
  <object
    data-homepage-hero-art
    data="../assets/hero-dossier.svg"
    type="image/svg+xml"
    role="img"
    aria-label="Registos contabilísticos que se organizam num sistema claro e validado."
    width="560"
    height="440">
  </object>
  <span class="hero-resolution-line" aria-hidden="true"></span>
</div>
```

Add this stylesheet after `visual-system.css`:

```html
<link rel="stylesheet" href="../assets/homepage.css">
```

Add this script after the existing deferred `script.js`:

```html
<script src="../assets/homepage-hero.js" defer></script>
```

- [ ] **Step 3: Apply equivalent EN markup**

In `en/index.html`, also remove `reveal` from the existing `.hero-copy`, then use the identical structure and asset paths with this localized object label:

```html
<div class="hero-media visual-hero" data-homepage-hero>
  <object
    data-homepage-hero-art
    data="../assets/hero-dossier.svg"
    type="image/svg+xml"
    role="img"
    aria-label="Accounting records organising into a clear, validated system."
    width="560"
    height="440">
  </object>
  <span class="hero-resolution-line" aria-hidden="true"></span>
</div>
```

Add the same `homepage.css` and deferred `homepage-hero.js` includes exactly once. Preserve all English copy and URLs.

- [ ] **Step 4: Create minimal files so the structural contract can run**

Create `assets/homepage.css` with:

```css
.page-home {
  --home-surface-primary: #fbfcff;
}

@media (max-width: 980px) {}
@media (max-width: 760px) {}
@media (prefers-reduced-motion: reduce) {}
```

Create `assets/homepage-hero.js` with:

```js
(function () {
  'use strict';
}());
```

- [ ] **Step 5: Run the focused contract**

Run:

```bash
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m unittest tests.test_homepage_experience.HomepageExperienceTests.test_bilingual_homepages_share_the_homepage_assets_and_localized_art_label tests.test_homepage_experience.HomepageExperienceTests.test_svg_has_six_semantic_layers_and_no_embedded_text -v
```

Expected: both tests pass. The service-cluster test still fails until Task 5.

- [ ] **Step 6: Verify the no-JavaScript static state locally**

Serve the repository with:

```bash
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m http.server 4173 --bind 127.0.0.1
```

With JavaScript disabled in the browser’s site settings, reload and open:

```text
http://127.0.0.1:4173/pt/
http://127.0.0.1:4173/en/
```

For each URL, capture a browser accessibility snapshot and a viewport screenshot. The snapshot must contain the localized H1 and both CTA links, and the screenshot must visibly contain the final organised dossier. Also confirm no reserved-space collapse and no horizontal overflow. This is the browser-level no-JavaScript assertion; source inspection alone is not sufficient.

- [ ] **Step 7: Preserve the uncommitted checkpoint**

Run:

```bash
git diff --check
git status --short
```

Expected modified/untracked implementation files only. Do not commit.

---

### Task 3: Implement and Unit-Test the Scroll Model

**Files:**
- Create: `tests/homepage-hero.test.js`
- Replace: `assets/homepage-hero.js`
- Test: `tests/homepage-hero.test.js`

**Interfaces:**
- Consumes: `[data-homepage-hero]`, `[data-homepage-hero-art]` and six SVG layer names from Task 2.
- Produces: `ClaveHomepageHero.clamp01(number)`, `sceneProgress(rectTop, viewportHeight, distanceFactor)`, `layerFrame(name, progress, intensity)`, `activeLayerNames(width)`, `shouldEnhance(options)` and `init(document, window)`.

- [ ] **Step 1: Write failing Node tests for the pure motion model**

Create `tests/homepage-hero.test.js`:

```js
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const hero = require('../assets/homepage-hero.js');


test('clamp01 bounds progress', () => {
  assert.equal(hero.clamp01(-0.5), 0);
  assert.equal(hero.clamp01(0.4), 0.4);
  assert.equal(hero.clamp01(2), 1);
});


test('sceneProgress resolves within seventy-two percent of a viewport', () => {
  assert.equal(hero.sceneProgress(120, 1000, 0.72), 0);
  assert.equal(hero.sceneProgress(-600, 1000, 0.72), 1);
  assert.ok(Math.abs(hero.sceneProgress(-240, 1000, 0.72) - 0.5) < 0.001);
});


test('layerFrame returns controlled opening and exact final states', () => {
  const opening = hero.layerFrame('documents', 0, 1);
  const final = hero.layerFrame('documents', 1, 1);
  assert.deepEqual(opening, { x: -18, y: 12, rotate: -1.5, scale: 1, opacity: 0.88 });
  assert.deepEqual(final, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
});


test('layerFrame reduces mobile travel without changing the final state', () => {
  assert.equal(hero.layerFrame('rows', 0, 0.55).x, 7.7);
  assert.deepEqual(
    hero.layerFrame('rows', 1, 0.55),
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
  );
});


test('breakpoints reduce the independently animated layer set', () => {
  assert.deepEqual(hero.activeLayerNames(1440), ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals']);
  assert.deepEqual(hero.activeLayerNames(900), ['documents', 'rows', 'connectors', 'validation']);
  assert.deepEqual(hero.activeLayerNames(390), ['documents', 'rows', 'validation']);
});


test('every layer reaches the identical canonical final state at every intensity', () => {
  const names = ['documents', 'frame', 'rows', 'connectors', 'validation', 'signals'];
  for (const intensity of [1, 0.78, 0.55]) {
    for (const name of names) {
      assert.deepEqual(
        hero.layerFrame(name, 1, intensity),
        { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
      );
    }
  }
});


test('shouldEnhance rejects reduced motion and missing capabilities', () => {
  assert.equal(hero.shouldEnhance({ reducedMotion: true, hasRAF: true, hasObject: true }), false);
  assert.equal(hero.shouldEnhance({ reducedMotion: false, hasRAF: false, hasObject: true }), false);
  assert.equal(hero.shouldEnhance({ reducedMotion: false, hasRAF: true, hasObject: false }), false);
  assert.equal(hero.shouldEnhance({ reducedMotion: false, hasRAF: true, hasObject: true }), true);
});
```

- [ ] **Step 2: Run the Node test and verify it fails**

Run:

```bash
node --test tests/homepage-hero.test.js
```

Expected: FAIL because the current placeholder does not export the required API.

- [ ] **Step 3: Implement the dependency-free pure model and DOM controller**

Replace `assets/homepage-hero.js` with this structure and exact public API:

```js
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.ClaveHomepageHero = api;
    const start = () => api.init(document, window);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const OPENING = Object.freeze({
    documents: { x: -18, y: 12, rotate: -1.5, scale: 1, opacity: 0.88 },
    frame: { x: 0, y: 6, rotate: 0, scale: 0.992, opacity: 0.96 },
    rows: { x: 14, y: 0, rotate: 0, scale: 1, opacity: 0.58 },
    connectors: { x: 12, y: 0, rotate: 0, scale: 0.72, opacity: 0.22 },
    validation: { x: 0, y: 12, rotate: 0, scale: 0.82, opacity: 0.12 },
    signals: { x: 8, y: -6, rotate: 0, scale: 0.94, opacity: 0.4 }
  });

  const FINAL = Object.freeze({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
  const LAYERS = Object.freeze(['documents', 'frame', 'rows', 'connectors', 'validation', 'signals']);
  const clamp01 = value => Math.min(1, Math.max(0, value));
  const mix = (from, to, progress) => from + (to - from) * progress;
  const round = value => Math.round(value * 1000) / 1000;

  function sceneProgress(rectTop, viewportHeight, distanceFactor) {
    const start = viewportHeight * 0.12;
    const distance = viewportHeight * distanceFactor;
    return clamp01((start - rectTop) / distance);
  }

  function layerFrame(name, progress, intensity) {
    const from = OPENING[name] || FINAL;
    const p = clamp01(progress);
    const strength = Math.max(0, Math.min(1, intensity));
    return {
      x: round(mix(from.x * strength, FINAL.x, p)),
      y: round(mix(from.y * strength, FINAL.y, p)),
      rotate: round(mix(from.rotate * strength, FINAL.rotate, p)),
      scale: round(mix(1 + (from.scale - 1) * strength, FINAL.scale, p)),
      opacity: round(mix(1 + (from.opacity - 1) * strength, FINAL.opacity, p))
    };
  }

  function shouldEnhance(options) {
    return !options.reducedMotion && options.hasRAF && options.hasObject;
  }

  function activeLayerNames(width) {
    if (width <= 760) return ['documents', 'rows', 'validation'];
    if (width <= 980) return ['documents', 'rows', 'connectors', 'validation'];
    return [...LAYERS];
  }

  function applyFrame(layer, frame) {
    layer.style.transform = `translate3d(${frame.x}px, ${frame.y}px, 0) rotate(${frame.rotate}deg) scale(${frame.scale})`;
    layer.style.opacity = String(frame.opacity);
  }

  function resetLayer(layer) {
    layer.style.removeProperty('transform');
    layer.style.removeProperty('opacity');
  }

  function init(rootDocument, rootWindow) {
    const scene = rootDocument.querySelector('[data-homepage-hero]');
    const art = scene && scene.querySelector('[data-homepage-hero-art]');
    const heroRoot = scene && (scene.closest('.hero') || scene);
    const reducedMotion = rootWindow.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!shouldEnhance({
      reducedMotion,
      hasRAF: typeof rootWindow.requestAnimationFrame === 'function',
      hasObject: Boolean(scene && art)
    })) return null;

    let layers = null;
    let framePending = false;
    let visible = true;

    const intensity = () => rootWindow.innerWidth <= 760 ? 0.55 : rootWindow.innerWidth <= 980 ? 0.78 : 1;
    const distanceFactor = () => rootWindow.innerWidth <= 760 ? 0.58 : 0.72;

    const draw = () => {
      framePending = false;
      if (!visible || !layers) return;
      const progress = sceneProgress(scene.getBoundingClientRect().top, rootWindow.innerHeight, distanceFactor());
      heroRoot.style.setProperty('--hero-progress', progress.toFixed(3));
      const activeLayers = new Set(activeLayerNames(rootWindow.innerWidth));
      Object.entries(layers).forEach(([name, layer]) => {
        if (activeLayers.has(name)) applyFrame(layer, layerFrame(name, progress, intensity()));
        else resetLayer(layer);
      });
      scene.classList.toggle('is-resolved', progress >= 0.98);
      heroRoot.classList.toggle('is-hero-resolved', progress >= 0.98);
    };

    const schedule = () => {
      if (!framePending) {
        framePending = true;
        rootWindow.requestAnimationFrame(draw);
      }
    };

    const mount = () => {
      const svgDocument = art.contentDocument;
      if (!svgDocument) return;
      layers = Object.fromEntries(
        [...svgDocument.querySelectorAll('[data-hero-layer]')]
          .map(layer => [layer.getAttribute('data-hero-layer'), layer])
      );
      if (Object.keys(layers).length !== Object.keys(OPENING).length) return;
      scene.classList.add('is-motion-ready');
      draw();
    };

    if (art.contentDocument && art.contentDocument.documentElement) mount();
    else art.addEventListener('load', mount, { once: true });

    const observer = 'IntersectionObserver' in rootWindow
      ? new rootWindow.IntersectionObserver(entries => {
          visible = entries.some(entry => entry.isIntersecting);
          if (visible) schedule();
        }, { rootMargin: '20% 0px' })
      : null;

    if (observer) observer.observe(scene);
    rootWindow.addEventListener('scroll', schedule, { passive: true });
    rootWindow.addEventListener('resize', schedule, { passive: true });
    schedule();

    return {
      destroy() {
        if (observer) observer.disconnect();
        rootWindow.removeEventListener('scroll', schedule);
        rootWindow.removeEventListener('resize', schedule);
      }
    };
  }

  return { clamp01, sceneProgress, layerFrame, activeLayerNames, shouldEnhance, init };
}));
```

- [ ] **Step 4: Run the Node tests**

Run:

```bash
node --test tests/homepage-hero.test.js
```

Expected: 7 tests pass, 0 fail.

- [ ] **Step 5: Check the controller budget and syntax**

Run:

```bash
node --check assets/homepage-hero.js
wc -c assets/homepage-hero.js
```

Expected: syntax check exits 0. Keep the uncompressed controller below 8,500 bytes; if it exceeds that value, remove duplication before proceeding rather than minifying source.

- [ ] **Step 6: Preserve the uncommitted checkpoint**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors. Do not commit.

---

### Task 4: Implement the Premium Hero Surface and Responsive Modes

**Files:**
- Replace: `assets/homepage.css`
- Test: `tests/test_homepage_experience.py`
- Test: `tests/homepage-hero.test.js`

**Interfaces:**
- Consumes: `.page-home`, `[data-homepage-hero]`, `[data-homepage-hero-art]`, `.hero-resolution-line`, `.is-motion-ready`, `.is-resolved` and `--hero-progress`.
- Produces: semantic homepage tokens and responsive visual behavior used by Task 5.

- [ ] **Step 1: Replace the placeholder stylesheet with semantic tokens**

Start `assets/homepage.css` with:

```css
.page-home {
  --home-surface-primary: #fbfcff;
  --home-surface-mineral: #f4f7fb;
  --home-surface-paper: rgba(255, 255, 255, .82);
  --home-ink-structural: #14213d;
  --home-ink-secondary: #526078;
  --home-signal-blue: #3569b8;
  --home-signal-teal: #2fb5c4;
  --home-signal-pink: #e0508f;
  --home-rule: rgba(20, 33, 61, .14);
  --home-rule-soft: rgba(20, 33, 61, .075);
  --home-paper-shadow: 0 18px 44px rgba(20, 33, 61, .09);
}
```

Do not add gold, black takeover surfaces, glass blur or new font families.

- [ ] **Step 2: Add the desktop hero composition**

Add:

```css
.page-home .hero {
  --hero-progress: 1;
  position: relative;
  overflow: clip;
  background:
    radial-gradient(circle at 82% 18%, rgba(53, 105, 184, .10), transparent 34%),
    linear-gradient(180deg, var(--home-surface-primary), var(--home-surface-mineral));
}

.page-home .hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .16;
  background-image: radial-gradient(rgba(20, 33, 61, .32) .55px, transparent .65px);
  background-size: 5px 5px;
  mix-blend-mode: multiply;
}

.page-home .hero-grid {
  position: relative;
  z-index: 1;
  align-items: center;
}

.page-home .hero-copy {
  position: relative;
  z-index: 2;
}

.page-home [data-homepage-hero] {
  min-height: 440px;
  align-self: stretch;
  contain: layout;
}

.page-home [data-homepage-hero-art] {
  display: block;
  width: min(100%, 560px);
  aspect-ratio: 14 / 11;
  border: 0;
  filter: drop-shadow(0 24px 44px rgba(20, 33, 61, .10));
}

.page-home .hero-resolution-line {
  position: absolute;
  left: 50%;
  bottom: -28px;
  width: min(42vw, 480px);
  height: 1px;
  transform: scaleX(var(--hero-progress));
  transform-origin: left;
  opacity: calc(.18 + var(--hero-progress) * .34);
  background: linear-gradient(90deg, var(--home-signal-blue), var(--home-signal-teal), transparent);
  pointer-events: none;
}

.page-home [data-homepage-hero].is-motion-ready .hero-resolution-line {
  transition: opacity .18s linear;
}

.page-home [data-homepage-hero].is-resolved [data-homepage-hero-art] {
  filter: drop-shadow(0 20px 38px rgba(20, 33, 61, .08));
}
```

The object remains fully visible before JavaScript initializes. Do not gate its opacity on a `.has-js` class.

- [ ] **Step 3: Refine copy hierarchy without changing copy**

Add:

```css
.page-home .hero-copy .display {
  max-width: 12ch;
  letter-spacing: -.035em;
}

.page-home .hero-copy .lede {
  max-width: 61ch;
  color: var(--home-ink-secondary);
}

.page-home .hero-copy .actions {
  margin-top: 28px;
}

.page-home .hero.is-hero-resolved .hero-copy .cta:not(.ghost) {
  box-shadow: 0 12px 28px rgba(20, 33, 61, .16);
}

.page-home .hero-copy .micro-proof {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--home-rule-soft);
}
```

Do not animate the headline position, rotation, scale or blur.

- [ ] **Step 4: Add tablet, mobile and reduced-motion rules**

Add exactly these media-query boundaries so they match the contract:

```css
@media (max-width: 980px) {
  .page-home [data-homepage-hero] {
    min-height: 360px;
  }

  .page-home .hero-resolution-line {
    width: 54vw;
  }
}

@media (max-width: 760px) {
  .page-home .hero {
    overflow: hidden;
  }

  .page-home .hero-grid {
    gap: 30px;
  }

  .page-home [data-homepage-hero] {
    min-height: 250px;
    align-self: auto;
  }

  .page-home [data-homepage-hero-art] {
    width: min(94vw, 430px);
    margin-inline: auto;
  }

  .page-home .hero-resolution-line {
    left: 8%;
    bottom: -12px;
    width: 84%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page-home [data-homepage-hero-art],
  .page-home .hero-resolution-line {
    animation: none !important;
    transition: none !important;
  }

  .page-home .hero-resolution-line {
    transform: scaleX(1);
    opacity: .42;
  }
}
```

- [ ] **Step 5: Run static, JS and global regression tests**

Run:

```bash
node --test tests/homepage-hero.test.js
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m unittest discover -s tests -v
```

Expected at this point: Node tests pass; existing navigation/About tests pass; only the service-cluster homepage assertion remains failing.

- [ ] **Step 6: Browser-check the hero before section work**

Open PT and EN locally at desktop width. Use browser console to verify:

```js
(() => {
  const scene = document.querySelector('[data-homepage-hero]');
  const art = scene.querySelector('[data-homepage-hero-art]');
  return {
    ready: scene.classList.contains('is-motion-ready'),
    progress: getComputedStyle(scene).getPropertyValue('--hero-progress').trim(),
    svgLayers: art.contentDocument.querySelectorAll('[data-hero-layer]').length,
    label: art.getAttribute('aria-label'),
    objectSize: [
      Math.round(art.getBoundingClientRect().width),
      Math.round(art.getBoundingClientRect().height)
    ]
  };
})()
```

Expected: `ready: true`, `svgLayers: 6`, correct localized label, nonzero object size and progress changing from near 0 toward 1 during the first hero scroll.

- [ ] **Step 7: Preserve the uncommitted checkpoint**

Run `git diff --check`; do not commit.

---

### Task 5: Create the Quieter Editorial Homepage Rhythm

**Files:**
- Modify: `pt/index.html:52-133`
- Modify: `en/index.html` corresponding Services through Guides markup
- Modify: `assets/homepage.css`
- Test: `tests/test_homepage_experience.py`

**Interfaces:**
- Consumes: existing nine service links in their current numeric order.
- Produces: `.service-clusters`, three `.service-cluster` regions with localized `aria-label`, and homepage-only section rhythm styles.

- [ ] **Step 1: Write a deterministic one-use grouping helper**

Create `C:\Users\Utilizador\AppData\Local\Temp\group_homepage_services.py` with the following complete code. It preserves every existing service-card anchor as captured source, requires exactly nine cards, and adds structural wrappers with numeric range markers only. It deliberately introduces no unapproved visible taxonomy:

```python
from pathlib import Path
import re


ROOT = Path.cwd()
GRID = re.compile(r'<div class="service-grid">(?P<body>.*?)</div>', re.DOTALL)
CARD = re.compile(r'<a class="service-card reveal".*?</a>', re.DOTALL)
PAGES = {
    ROOT / "pt" / "index.html": (
        ("01–03", "Serviços 01 a 03"),
        ("04–06", "Serviços 04 a 06"),
        ("07–09", "Serviços 07 a 09"),
    ),
    ROOT / "en" / "index.html": (
        ("01–03", "Services 01 to 03"),
        ("04–06", "Services 04 to 06"),
        ("07–09", "Services 07 to 09"),
    ),
}


def group_services(path, labels):
    with path.open("r", encoding="utf-8", newline="") as source:
        html = source.read()
    newline = "\r\n" if "\r\n" in html else "\n"
    match = GRID.search(html)
    if not match:
        raise RuntimeError(f"Service grid not found in {path}")
    cards = CARD.findall(match.group("body"))
    if len(cards) != 9:
        raise RuntimeError(f"Expected 9 service cards in {path}, found {len(cards)}")

    chunks = ['<div class="service-clusters">']
    for index, (number_range, label) in enumerate(labels):
        chunks.extend([
            f'  <section class="service-cluster" aria-label="{label}">',
            f'    <p class="service-cluster-label" aria-hidden="true"><span>{number_range}</span></p>',
            '    <div class="service-grid">',
        ])
        chunks.extend(cards[index * 3:(index + 1) * 3])
        chunks.extend(['    </div>', '  </section>'])
    chunks.append('</div>')
    replacement = newline.join(chunks)
    updated = html[:match.start()] + replacement + html[match.end():]
    with path.open("w", encoding="utf-8", newline="") as target:
        target.write(updated)


for homepage, cluster_labels in PAGES.items():
    group_services(homepage, cluster_labels)
```

- [ ] **Step 2: Run the helper once, validate its output and remove it**

From the repository root, run:

```bash
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' '/c/Users/Utilizador/AppData/Local/Temp/group_homepage_services.py'
rm '/c/Users/Utilizador/AppData/Local/Temp/group_homepage_services.py'
```

Then run:

```bash
git diff --word-diff=porcelain -- pt/index.html en/index.html
```

Expected: all nine existing anchors remain in numeric order in each language. The only new visible markers are `01–03`, `04–06` and `07–09`; the generic localized range labels are accessibility names, not a new service taxonomy. No helper script remains in the repository or temporary directory.

- [ ] **Step 3: Add service-cluster styling**

Append to `assets/homepage.css`:

```css
.page-home .service-clusters {
  display: grid;
  gap: clamp(28px, 4vw, 48px);
}

.page-home .service-cluster {
  position: relative;
  padding-top: 18px;
  border-top: 1px solid var(--home-rule);
}

.page-home .service-cluster-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  color: var(--home-ink-secondary);
  font-family: var(--font-mono);
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .09em;
  text-transform: uppercase;
}

.page-home .service-cluster-label span {
  color: var(--home-signal-blue);
}

.page-home .service-cluster:nth-child(2) .service-cluster-label span {
  color: var(--home-signal-teal);
}

.page-home .service-cluster:nth-child(3) .service-cluster-label span {
  color: var(--home-signal-pink);
}

.page-home .service-cluster .service-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

At `max-width: 980px`, use two columns; at `max-width: 760px`, use one column. Add those declarations inside the existing homepage media-query blocks rather than creating duplicate queries.

- [ ] **Step 4: Add the approved section intensity hierarchy**

Append:

```css
.page-home #servicos,
.page-home #services {
  padding-top: clamp(88px, 11vw, 132px);
}

.page-home #para-quem .post-grid,
.page-home #who-we-serve .post-grid {
  gap: clamp(18px, 2.2vw, 28px);
}

.page-home #origem .split,
.page-home #origins .split {
  align-items: start;
}

.page-home #origem .display,
.page-home #origins .display {
  max-width: 14ch;
}

.page-home #origem blockquote,
.page-home #origins blockquote {
  margin-top: 24px;
  padding: 18px 0 18px 22px;
  border-left: 2px solid var(--home-signal-pink);
  color: var(--home-ink-structural);
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2vw, 1.45rem);
  line-height: 1.35;
}

.page-home #metodo,
.page-home #method,
.page-home #guias,
.page-home #guides {
  background: var(--home-surface-primary);
}

.page-home #razoes,
.page-home #reasons {
  background:
    linear-gradient(180deg, rgba(234, 241, 252, .54), rgba(255, 255, 255, .82)),
    var(--home-surface-mineral);
}

.page-home .closing {
  border-top: 1px solid var(--home-rule-soft);
}
```

Do not add persistent ambient animation. Existing small reveal behavior remains sufficient after the hero.

- [ ] **Step 5: Run the complete structural contract**

Run:

```bash
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m unittest tests.test_homepage_experience -v
```

Expected: all five homepage contract tests pass.

- [ ] **Step 6: Verify service content was not changed**

Use `git diff --word-diff=porcelain -- pt/index.html en/index.html` and inspect every changed service line. The only additions within Services are cluster wrappers and localized cluster labels. All nine existing links, numbers, names and descriptions remain intact in both languages.

- [ ] **Step 7: Preserve the uncommitted checkpoint**

Run `git diff --check`; do not commit.

---

### Task 6: Harden Accessibility, Fallbacks and Runtime Lifecycle

**Files:**
- Modify: `assets/homepage-hero.js`
- Modify: `assets/homepage.css`
- Modify: `tests/homepage-hero.test.js`
- Modify: `tests/test_homepage_experience.py`

**Interfaces:**
- Consumes: Task 3 controller and Task 4/5 styles.
- Produces: deterministic reduced-motion/no-JS behavior, offscreen suspension and explicit accessibility/runtime assertions.

- [ ] **Step 1: Add a failing test for unknown layers and exact final fallback**

Append to `tests/homepage-hero.test.js`:

```js
test('unknown layers remain in the final state', () => {
  assert.deepEqual(
    hero.layerFrame('unknown', 0, 1),
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
  );
});
```

Run `node --test tests/homepage-hero.test.js`. Expected: PASS if Task 3 implemented the documented fallback; if it fails, correct `layerFrame` rather than loosening the test.

- [ ] **Step 2: Add static assertions for preserved actions and no hidden copy**

Append this method to `HomepageExperienceTests`:

```python
def test_hero_progressive_enhancement_never_hides_copy_or_actions(self):
    expected_copy = {
        "pt": ("Contas claras.", "Conhecer os serviços", "Fale-nos da sua atividade"),
        "en": ("Clear accounts.", "Explore our services", "Tell us about your activity"),
    }
    for language, page in HOME_PAGES.items():
        html = page.read_text(encoding="utf-8")
        for text in expected_copy[language]:
            self.assertIn(text, html)
        hero = re.search(r'<section class="hero".*?</section>', html, re.DOTALL)
        self.assertIsNotNone(hero)
        self.assertNotRegex(hero.group(0), r'class="[^"]*\breveal\b')
        self.assertNotIn("data-hero-copy-hidden", html)
        self.assertNotIn("aria-hidden=\"true\" class=\"hero-copy", html)
```

Run the focused method and confirm it passes with the exact current EN CTA wording. If the current English strings differ, use the verified existing strings from `en/index.html`; do not rewrite English copy to satisfy an assumption.

- [ ] **Step 3: Verify reduced motion in a real browser**

Emulate `prefers-reduced-motion: reduce`, reload PT and EN, and evaluate:

```js
(() => {
  const scene = document.querySelector('[data-homepage-hero]');
  const art = scene.querySelector('[data-homepage-hero-art]');
  return {
    media: matchMedia('(prefers-reduced-motion: reduce)').matches,
    motionReady: scene.classList.contains('is-motion-ready'),
    layerTransforms: [...art.contentDocument.querySelectorAll('[data-hero-layer]')]
      .map(layer => getComputedStyle(layer).transform)
  };
})()
```

Expected: `media: true`, `motionReady: false`; layers remain in their canonical SVG state with no controller-applied spatial animation.

- [ ] **Step 4: Verify keyboard and zoom behavior**

At 200% browser zoom in both languages:

1. Tab to the skip link and activate it.
2. Tab through language links, menu links and both hero CTAs.
3. Confirm focus rings remain visible.
4. Confirm no focusable element is covered by the SVG/object.
5. Confirm no horizontal page scrolling at a 360 CSS-pixel viewport.

Expected: DOM focus order follows visual reading order; hero animation never captures focus.

- [ ] **Step 5: Verify offscreen suspension through SVG-write instrumentation**

Do not reload after installing instrumentation. From the loaded homepage, evaluate this asynchronous browser expression:

```js
(async () => {
  const scene = document.querySelector('[data-homepage-hero]');
  const art = scene.querySelector('[data-homepage-hero-art]');
  const layers = [...art.contentDocument.querySelectorAll('[data-hero-layer]')];
  const belowHero = document.querySelector('#metodo, #method, #razoes, #reasons');
  belowHero.scrollIntoView({ block: 'start' });
  await new Promise(resolve => setTimeout(resolve, 500));

  let styleMutations = 0;
  const observer = new MutationObserver(records => {
    styleMutations += records.filter(record => record.attributeName === 'style').length;
  });
  layers.forEach(layer => observer.observe(layer, { attributes: true, attributeFilter: ['style'] }));

  for (const delta of [120, -80, 160, -60]) {
    window.scrollBy(0, delta);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  await new Promise(resolve => setTimeout(resolve, 250));
  observer.disconnect();
  return { styleMutations, scrollY, heroBottom: scene.getBoundingClientRect().bottom };
})()
```

Expected: `heroBottom` remains well above the viewport and `styleMutations` is exactly `0`. This verifies that below-hero scroll events do not write SVG layer styles after the `IntersectionObserver` has settled, rather than merely proving that no continuous animation loop exists.

- [ ] **Step 6: Run all automated checks**

Run:

```bash
node --check assets/homepage-hero.js
node --test tests/homepage-hero.test.js
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m unittest discover -s tests -v
git diff --check
```

Expected: every command exits 0.

- [ ] **Step 7: Preserve the uncommitted checkpoint**

Do not commit.

---

### Task 7: Render and Review the Prototype

**Files:**
- Review: all modified implementation files
- Do not create production artifacts from screenshots

**Interfaces:**
- Consumes: complete uncommitted Tasks 1–6 prototype.
- Produces: rendered evidence and Pedro’s aesthetic decision; no commit.

- [ ] **Step 1: Start the local server as a tracked background process**

Run with the terminal tool in background mode:

```bash
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m http.server 4173 --bind 127.0.0.1
```

Verify readiness by navigating to `http://127.0.0.1:4173/pt/`; do not rely on a blind sleep.

- [ ] **Step 2: Inspect the required visual matrix**

Review PT and EN at:

- desktop: 1440 × 900;
- intermediate/tablet: 980 × 900;
- narrow mobile: 390 × 844;
- narrow mobile: 360 × 800;
- desktop reduced motion;
- narrow mobile reduced motion.

For each, inspect the top, mid-transition, resolved hero, Services, Origin and closing invitation.

- [ ] **Step 3: Exercise motion edge cases**

In both languages:

1. scroll slowly forward through the hero;
2. reverse to the top;
3. scroll rapidly past the hero;
4. resize while half progressed;
5. reload at the top;
6. reload after restoring a scrolled position;
7. switch languages and repeat.

Expected: no jump, trapped scroll, stale transform, flash of hidden copy or divergence between PT and EN.

- [ ] **Step 4: Inspect runtime failures**

Read the browser console and network state. Expected:

- no uncaught exceptions;
- no failed local requests;
- `homepage.css`, `homepage-hero.js` and `hero-dossier.svg` return 200;
- exactly six SVG layers are present;
- no duplicate homepage assets are loaded.

Also evaluate this local-link HTTP probe in PT and EN:

```js
(async () => {
  const urls = [...new Set([...document.querySelectorAll('a[href]')]
    .map(link => new URL(link.getAttribute('href'), location.href))
    .filter(url => url.origin === location.origin)
    .map(url => `${url.origin}${url.pathname}${url.search}`))];
  return Promise.all(urls.map(async url => {
    const response = await fetch(url, { cache: 'no-store' });
    return { url, status: response.status, ok: response.ok };
  }));
})()
```

Expected: every local destination returns HTTP 200. Any non-200 result blocks approval even if the static path test passes.

- [ ] **Step 5: Capture Core Web Vitals, long tasks and resource measurements**

On a fresh desktop navigation, immediately evaluate this instrumentation. Buffered observers recover entries emitted before installation:

```js
(() => {
  const metrics = window.__homeMetrics = {
    lcp: 0,
    cls: 0,
    events: [],
    longTasks: [],
    supported: PerformanceObserver.supportedEntryTypes
  };
  const observe = (type, callback, options = {}) => {
    if (!metrics.supported.includes(type)) return;
    const observer = new PerformanceObserver(list => callback(list.getEntries()));
    observer.observe({ type, buffered: true, ...options });
  };
  observe('largest-contentful-paint', entries => {
    const latest = entries.at(-1);
    if (latest) metrics.lcp = Math.round(latest.renderTime || latest.loadTime || latest.startTime);
  });
  observe('layout-shift', entries => {
    metrics.cls += entries.filter(entry => !entry.hadRecentInput)
      .reduce((sum, entry) => sum + entry.value, 0);
  });
  observe('event', entries => {
    metrics.events.push(...entries
      .filter(entry => entry.interactionId)
      .map(entry => ({ name: entry.name, duration: entry.duration, interactionId: entry.interactionId })));
  }, { durationThreshold: 16 });
  observe('longtask', entries => {
    metrics.longTasks.push(...entries.map(entry => ({ start: entry.startTime, duration: entry.duration })));
  });
  const cta = document.querySelector('.hero-copy .cta:not(.ghost)');
  cta.addEventListener('click', event => event.preventDefault(), { once: true, capture: true });
  return metrics.supported;
})()
```

After installation:

1. Evaluate `window.__homeMetrics.transitionStart = performance.now()`, then scroll slowly through the full hero transition and reverse once.
2. Use a real browser click on the primary hero CTA; the temporary capturing handler prevents navigation while preserving a trusted interaction.
3. Wait at least 500 ms for observer delivery.
4. Evaluate:

```js
(() => {
  const resources = performance.getEntriesByType('resource').map(resource => ({
    name: resource.name.split('/').pop(),
    transfer: resource.transferSize,
    decoded: resource.decodedBodySize,
    duration: Math.round(resource.duration)
  }));
  const navigation = performance.getEntriesByType('navigation')[0];
  const metrics = window.__homeMetrics;
  const interactionDurations = metrics.events.map(event => event.duration);
  return {
    conditions: {
      url: location.href,
      viewport: [innerWidth, innerHeight],
      userAgent: navigator.userAgent,
      cache: 'record cold/warm state explicitly',
      network: 'record browser throttling explicitly',
      cpu: 'record browser throttling explicitly'
    },
    lcp: metrics.lcp,
    inpLabUpperBound: interactionDurations.length ? Math.max(...interactionDurations) : null,
    cls: Math.round(metrics.cls * 10000) / 10000,
    transitionLongTasks: metrics.longTasks.filter(task => task.start >= metrics.transitionStart),
    domInteractive: Math.round(navigation.domInteractive),
    domComplete: Math.round(navigation.domComplete),
    resourceCount: resources.length,
    transfer: resources.reduce((sum, resource) => sum + resource.transfer, 0),
    decoded: resources.reduce((sum, resource) => sum + resource.decoded, 0),
    resources,
    scrollHeight: document.documentElement.scrollHeight,
    heroHeight: Math.round(document.querySelector('.hero').getBoundingClientRect().height)
  };
})()
```

Repeat under the documented representative mobile viewport and throttling conditions. Record browser/device, viewport, cache state, network and CPU throttling every time. Do not compare localhost transfer values directly to production-compressed values. Report uncompressed `wc -c` values for `homepage.css`, `homepage-hero.js` and `hero-dossier.svg` separately.

This is a blocking gate: LCP must be ≤ 2,500 ms, the measured interaction upper bound must be ≤ 200 ms, CLS must be ≤ 0.1, and the hero transition must produce no long task over 50 ms. If Event Timing is unsupported or no trusted interaction entry is captured, report INP as unverified and rerun in a supported Chromium browser rather than claiming a pass.

- [ ] **Step 6: Perform the visual acceptance review**

Present rendered PT and EN desktop and narrow-mobile evidence to Pedro. Ask specifically whether:

- opening state reads as controlled complexity rather than chaos;
- final state reads as an organised, trustworthy system;
- headline and CTAs remain dominant;
- colour feels premium but familiar;
- service clusters improve scanning;
- later sections feel calmer than the hero.

If rejected, revise the uncommitted prototype and rerun Tasks 6–7. Do not commit merely because automated tests pass.

- [ ] **Step 7: Stop and wait for explicit rendered approval**

This is a hard gate. No commit, push, PR or deployment before approval.

---

### Task 8: Final Verification and Approved Implementation Commit

**Files:**
- Stage only the approved implementation files listed in Planned File Structure

**Interfaces:**
- Consumes: explicit rendered aesthetic approval from Task 7.
- Produces: one reviewable implementation commit on the design branch.

- [ ] **Step 1: Confirm approval and clean temporary artifacts**

Run:

```bash
git status --short
```

Remove `tests/__pycache__`, temporary screenshots, local evidence scripts and server artifacts. Do not remove the approved design specification or plan.

- [ ] **Step 2: Run the full final verification**

Run:

```bash
node --check assets/homepage-hero.js
node --test tests/homepage-hero.test.js
'/c/Users/Utilizador/AppData/Roaming/uv/python/cpython-3.11-windows-x86_64-none/python.exe' -m unittest discover -s tests -v
git diff --check
```

Expected: all Node and Python tests pass; syntax and whitespace checks exit 0.

- [ ] **Step 3: Review scope**

Run:

```bash
git diff --stat
git diff --name-only
```

Expected implementation scope:

```text
assets/hero-dossier.svg
assets/homepage-hero.js
assets/homepage.css
en/index.html
pt/index.html
tests/homepage-hero.test.js
tests/test_homepage_experience.py
```

The already committed specification and plan are separate documentation commits. No other site file may appear without a documented reason and renewed review.

- [ ] **Step 4: Stage and inspect the exact implementation**

Run:

```bash
git add assets/hero-dossier.svg assets/homepage-hero.js assets/homepage.css pt/index.html en/index.html tests/homepage-hero.test.js tests/test_homepage_experience.py
git diff --cached --check
git diff --cached --stat
git diff --cached --name-only
```

Expected: only the seven approved implementation files are staged.

- [ ] **Step 5: Commit only after rendered approval**

Run:

```bash
git commit -m "feat: organize homepage into a clarity-led experience"
```

Expected: one implementation commit is created. Immediately rerun `git status --short`; it must be empty.

- [ ] **Step 6: Verify the committed tree**

Run the full final verification again from the committed tree. Expected: identical green results and clean status.

---

### Task 9: Pull Request and Deployment Gate

**Files:**
- No additional source changes expected

**Interfaces:**
- Consumes: approved implementation commit and green final verification.
- Produces: reviewable GitHub pull request; deployment only after separate explicit authorization.

- [ ] **Step 1: Push the feature branch only after approval**

Run:

```bash
git push -u origin design/homepage-complexity-to-clarity
```

Expected: branch push succeeds without modifying `main`.

- [ ] **Step 2: Open the pull request**

Use:

```bash
gh pr create \
  --base main \
  --head design/homepage-complexity-to-clarity \
  --title "feat: organize homepage into a clarity-led experience" \
  --body "Implements the approved From Complexity to Clarity homepage design for PT and EN. Adds a semantic SVG hero, dependency-free rAF-gated scroll transition, restrained homepage rhythm, responsive/reduced-motion fallbacks, and focused tests. No non-homepage propagation is included. Rendered aesthetic approval and local verification completed before commit."
```

Expected: GitHub returns a PR URL. Do not merge it automatically.

- [ ] **Step 3: Verify PR scope and checks**

Run:

```bash
gh pr view --json number,title,state,baseRefName,headRefName,files,commits,url
gh pr checks --watch
```

Expected: base `main`, head `design/homepage-complexity-to-clarity`, expected files only, checks successful.

- [ ] **Step 4: Request explicit merge/deployment authorization**

Present the PR URL, rendered evidence summary, test results, measured conditions and any remaining limitations. Wait for Pedro’s explicit authorization. A successful PR or workflow is not authorization to deploy.

- [ ] **Step 5: Merge only when authorized**

After explicit authorization, squash-merge through GitHub and verify the resulting `main` commit. Do not reuse this authorization for future non-homepage propagation.

- [ ] **Step 6: Verify GitHub Pages deployment**

Watch the Pages workflow to completion, then inspect the public PT and EN homepages. Confirm:

- correct new commit deployed;
- homepage assets return HTTP 200;
- six semantic SVG layers load;
- PT/EN labels and service clusters are correct;
- hero motion, mobile and reduced motion match approval;
- console/network clean;
- primary copy and CTAs unchanged;
- public resource and layout measurements recorded accurately.

If deployment differs from the approved render, stop and report the discrepancy rather than declaring completion.

---

## Plan Self-Review

### Spec coverage

- Baseline and constraints: Tasks 1 and 7.
- Semantic final/static SVG: Task 2.
- Bilingual markup and localized accessible names: Task 2.
- Scroll model, reverse/rapid scroll and rAF gating: Tasks 3 and 7.
- Semantic colour/material system: Task 4.
- Mobile, tablet and reduced motion: Tasks 4, 6 and 7.
- Homepage rhythm and service grouping: Task 5.
- Accessibility and failure modes: Task 6.
- Performance and offscreen suspension: Tasks 3, 6 and 7.
- Rendered approval before commit: Task 7 hard gate.
- Regression, scope and commit verification: Task 8.
- PR, explicit deployment authorization and public verification: Task 9.
- Non-homepage propagation excluded: Global Constraints and Task 9.

### Interface consistency

The plan uses these names consistently:

- HTML: `[data-homepage-hero]`, `[data-homepage-hero-art]`, `.hero-resolution-line`.
- SVG: `documents`, `frame`, `rows`, `connectors`, `validation`, `signals`.
- Runtime: `ClaveHomepageHero`, `clamp01`, `sceneProgress`, `layerFrame`, `activeLayerNames`, `shouldEnhance`, `init`.
- Runtime classes/properties: `.is-motion-ready`, `.is-resolved`, `--hero-progress`.
- Editorial wrappers: `.service-clusters`, `.service-cluster`, `.service-cluster-label`.

### Intentional deviation from generic frequent-commit guidance

Tasks 1–7 remain uncommitted because the approved design specification and Pedro’s standing workflow require rendered aesthetic approval before implementation is committed. Task 8 creates the first implementation commit only after that approval. This requirement overrides the normal frequent-commit cadence for this visual prototype.
