# English office subsection alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the English Office subsection match the Portuguese H subsection’s compact split-grid composition.

**Architecture:** Change only the Office section in `en/about.html`. Move the existing cache-busted office image into the existing `.split` grid and replace the English-only oversized figure with the direct English counterpart of the PT H content. The existing responsive CSS handles desktop and narrow screens; no shared CSS changes are needed.

**Tech Stack:** Static HTML, existing shared CSS, Python `unittest`, browser DOM inspection.

## Global Constraints

- Use `../assets/fachada.jpeg?v=20260721`.
- Use the existing `.split` layout and `escritorio-foto reveal` figure class.
- Use image dimensions `width="400" height="300"`.
- Modify only `en/about.html`; do not alter Portuguese content, shared CSS, scripts, navigation, team data or assets.
- Remove the English-only `.storefront-figure`, caption and “How to find us” link.

---

### Task 1: Align the English Office markup with PT H

**Files:**
- Modify: `en/about.html` — Office section, from `<section class="section soft" id="office">` to its closing `</section>`.
- Test: `tests/test_navigation.py` — existing regression suite remains green.

**Interfaces:**
- Consumes: existing `.split` and `.escritorio-foto` styles in `assets/styles.css`; asset `assets/fachada.jpeg`.
- Produces: compact English Office subsection with the same grid hierarchy and image dimensions as PT H.

- [ ] **Step 1: Add a focused temporary failing verification**

Create `C:\Users\Utilizador\AppData\Local\Temp\hermes-verify-office-layout.py`:

```python
from pathlib import Path

root = Path(r"C:\Users\Utilizador\Clave-de-Numeros")
html = (root / "en" / "about.html").read_text(encoding="utf-8")
assert '<figure class="escritorio-foto reveal">' in html
assert 'src="../assets/fachada.jpeg?v=20260721"' in html
assert 'width="400" height="300"' in html
assert 'storefront-figure' not in html
assert 'Our space in Montijo.' in html
assert (root / "assets" / "fachada.jpeg").is_file()
```

- [ ] **Step 2: Run the temporary verification before editing**

Run:

```bash
python 'C:/Users/Utilizador/AppData/Local/Temp/hermes-verify-office-layout.py'
```

Expected: failure because the current English page still uses `.storefront-figure` outside the split grid.

- [ ] **Step 3: Replace only the English Office section**

Use this Office body inside the existing `<section id="office">` container:

```html
<div class="split reveal">
  <h2 class="display">Our space in Montijo.</h2>
  <div>
    <p>We are at Rua Cidade de Ponta Delgada, Loja 136, in Montijo.</p>
    <p>Our space was designed to be accessible, with ample parking and a central location in the municipality.</p>
  </div>
  <figure class="escritorio-foto reveal">
    <img src="../assets/fachada.jpeg?v=20260721" alt="Frontage of the Clave de Números office in Montijo" width="400" height="300">
  </figure>
</div>
```

Keep the existing section tab and modular rule. Remove the current oversized figure, caption and text link.

- [ ] **Step 4: Run focused and regression checks**

Run:

```bash
python 'C:/Users/Utilizador/AppData/Local/Temp/hermes-verify-office-layout.py'
python -m unittest discover -s tests -v
git diff --check
```

Expected: temporary verification passes, the two navigation tests pass, and `git diff --check` produces no output.

- [ ] **Step 5: Verify the rendered image locally**

Open `http://127.0.0.1:4173/en/about.html`, scroll to the Office subsection, and inspect the image:

```javascript
(function () {
  var image = document.querySelector('.escritorio-foto img');
  return {
    source: image.getAttribute('src'),
    width: image.naturalWidth,
    height: image.naturalHeight,
    renderedWidth: image.getBoundingClientRect().width
  };
})()
```

Expected: cache-busted JPEG source, natural dimensions `2040 × 1530`, and a compact rendered width governed by the split grid rather than `storefront-figure`.

- [ ] **Step 6: Clean temporary files and commit**

Run:

```bash
rm -f 'C:/Users/Utilizador/AppData/Local/Temp/hermes-verify-office-layout.py'
rm -rf tests/__pycache__
git add en/about.html
git commit -m "fix: align English office section with Portuguese layout"
```
