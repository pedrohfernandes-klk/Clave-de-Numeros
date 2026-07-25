# Homepage “From Complexity to Clarity” — Design Specification

- **Date:** 2026-07-25
- **Status:** Approved design; implementation not started
- **Scope:** Portuguese and English homepages, with future propagation of the approved system
- **Repository:** `pedrohfernandes-klk/Clave-de-Numeros`

## 1. Outcome

Elevate the Clave de Números homepage so it feels more premium and distinctive while remaining calm, professional, clear and appropriate for an accounting and consultancy firm.

The homepage will gain one memorable scroll-led hero transformation. It will then settle into a quieter editorial rhythm. The design must preserve the current brand, content, bilingual correspondence, usability and lightweight delivery.

The central experience is:

> Unstructured information becomes an intelligible system.

This makes the existing promise—“Contas claras. Decisões simples.” / “Clear accounts. Simple decisions.”—visible as an interaction rather than adding unrelated spectacle.

## 2. Approved Direction

The selected direction is **From Complexity to Clarity**:

- one moderate, memorable hero sequence;
- no page-long cinematic takeover;
- refined blue–teal–pink visual grammar;
- stronger section hierarchy and negative space;
- quieter motion after the hero;
- homepage first, followed only later by propagation of the approved system;
- rendered aesthetic approval before commit, merge, deployment or propagation.

## 3. Baseline

### 3.1 Current strengths

- Bespoke bilingual PT/EN website with a coherent editorial identity.
- Clear primary promise and navigation.
- Established ink-blue, blue, teal and pink palette.
- Lightweight static architecture with one small shared interaction script.
- Existing reduced-motion handling.
- Existing use of `IntersectionObserver` for reveals.
- Strong SVG-based illustration language.
- Complete service, audience, origin, guide, trust and contact content.
- Existing regression tests for bilingual navigation and About-page consistency.

### 3.2 Observed live homepage baseline

Audit conditions: production PT homepage at a 1264 × 625 browser viewport on 2026-07-25. Browser timing is a lab observation, not field Core Web Vitals data.

- Document scroll height: approximately 7,864 px.
- Hero height: approximately 726 px.
- Resource count observed after page load: 7.
- Transfer size observed for those resources: approximately 35 KB.
- Decoded size observed: approximately 85 KB.
- Shared scripts: `script.js` only.
- Main styles: `styles.css` and `visual-system.css`, plus hosted fonts.
- Hero artwork: lightweight SVG.
- Existing assets directory size: approximately 692 KB.
- Existing motion preference check: `prefers-reduced-motion` supported.

These figures establish a lightweight baseline. Implementation must remeasure under equivalent conditions and avoid trading the site’s current efficiency for decorative motion.

### 3.3 Current opportunities

- The homepage is long and visually consistent enough that major sections can feel uniform.
- The existing hero illustration is a flat asset and does not fully express the promise of clarity emerging from complexity.
- Nine services read as a long repeated sequence rather than a deliberately grouped overview.
- Existing motion is tasteful but mostly generic reveal behavior.
- Three independent document-level scroll listeners currently update method progress, page progress and header state; hero work must not add an uncontrolled fourth hot path.
- The existing identity can feel more authored through hierarchy and material detail without introducing a new palette or visual trend.

## 4. Goals

1. Make the first homepage interaction memorable and specific to Clave de Números.
2. Preserve immediate access to the headline, explanatory copy and primary actions.
3. Communicate organisation, validation and decision clarity through motion.
4. Improve the rhythm and hierarchy of the six homepage sections.
5. Retain the current brand palette while assigning colour more precise semantic roles.
6. Preserve or improve accessibility, mobile usability and performance.
7. Keep PT and EN structurally and behaviorally equivalent.
8. Isolate the first prototype so it can be removed without destabilising the rest of the site.
9. Establish a visual system that can be propagated after homepage approval.

## 5. Non-Goals

- No WordPress or back-office migration in this phase.
- No WebGL, Three.js, 3D model, video, image-sequence or generative runtime.
- No scroll hijacking or replacement of native scrolling.
- No change to the verified team, services, contact details or factual content.
- No new unverified photographs, testimonials or team members.
- No page-builder or framework migration.
- No redesign of every PT/EN page before homepage approval.
- No gold-and-black “luxury” rebrand, glassmorphism, neon glow or application-dashboard aesthetic.
- No text embedded into generated imagery or inaccessible SVG paths.
- No deployment during the prototype and visual-review stage.

## 6. Experience Design

### 6.1 Narrative spine

The visitor experiences a controlled transition from complexity to clarity:

1. **Arrival:** Records, lines and validation marks form a coherent but not fully resolved field.
2. **Organisation:** Scroll begins to align related entries and connections.
3. **Validation:** Selected signals and marks settle into their correct positions.
4. **Resolution:** The composition becomes a balanced, legible ledger.
5. **Continuation:** A structural line leads naturally into the Services section.

The metaphor must read as accounting information being organised, not as papers exploding or a system recovering from chaos.

### 6.2 Hero layout

The current message remains the visual and semantic anchor:

- eyebrow identifying the firm’s history and location;
- H1 promise;
- explanatory paragraph;
- primary Services action;
- secondary Contact action;
- compact proof statements;
- visual dossier composition.

The copy remains stable and readable. It may receive subtle depth or opacity refinement, but it must not fly, rotate, blur heavily or become dependent on scroll position.

### 6.3 Hero scene map

| Scene | Meaning | Visual behavior | Content behavior | Exit |
|---|---|---|---|---|
| Opening | Work contains many moving records and obligations | Layers are slightly offset but controlled | All copy and actions are immediately available | First meaningful scroll |
| Alignment | Information is organised | Rows, documents and connectors interpolate toward their places | Copy remains stable | Mid-scene |
| Validation | Rigor makes the system dependable | One or two marks and colour signals settle | Primary action gains quiet emphasis | Late scene |
| Resolution | Clear accounts enable clear decisions | Final ledger holds in a stable composition | Page resumes normal flow | Services section enters |

### 6.4 Scroll behavior

- Active over approximately 60–80% of one viewport of travel.
- Uses native scrolling.
- Supports forward, reverse and rapid scrolling.
- Does not trap the user in a prolonged pinned scene.
- Uses a normalized 0–1 scene progress value.
- Updates through one `requestAnimationFrame`-coordinated path.
- Stops work when the hero is outside its relevant range.
- The final state is stable and visually complete.

### 6.5 Desktop, tablet and mobile

**Desktop:** complete layered transition with the full meaningful set of SVG groups.

**Tablet:** reduced translation distances and fewer depth layers; no loss of content hierarchy.

**Narrow mobile:** shorter scene, fewer independently moving groups and no pinning. Copy leads, followed by the organised illustration. Touch scrolling remains direct and predictable.

**Reduced motion:** final organised composition appears immediately, optionally with the current gentle non-spatial reveal.

## 7. Visual System

### 7.1 Colour grammar

Retain the current identity while making its roles explicit:

- **Dominant field:** warm white and pale mineral surfaces.
- **Structural ink:** deep blue for primary type, rules and resolved systems.
- **Blue signal:** dependable classification and primary structure.
- **Teal signal:** validation, completion and supportive movement.
- **Pink signal:** scarce emphasis and human warmth.

Use 60–30–10 as an approximate attention hierarchy, not a literal pixel quota.

All colours must become semantic CSS custom properties. Existing token names may be retained or migrated carefully, but implementations must not introduce scattered one-off values when a semantic token applies.

### 7.2 Material language

Premium quality should come from precision and subtle physical cues:

- very light paper grain at low opacity;
- one-pixel rules;
- shallow document-layer shadows;
- translucent colour fields behind selected details;
- crisp alignment and deliberate negative space;
- restrained radii consistent with the current system.

Avoid heavy gloss, dramatic blur, glass panels, oversized pill components and persistent ambient animation.

### 7.3 Typography

Retain the current type families unless rendered comparison proves a material improvement from a change. Improve premium character first through:

- line length;
- scale relationships;
- section spacing;
- weight hierarchy;
- alignment;
- calmer secondary text colour.

No typography change should make Portuguese text feel cramped or force EN/PT structures to diverge.

## 8. Homepage Rhythm

The existing six-part structure remains, but each section receives a distinct role.

### 8.1 Hero

Highest visual intensity. Contains the signature transformation and clear dual action.

### 8.2 Services

Group the nine services into a more intentional overview. Grouping must be derived from verified service meaning, not invented categories. Potential grouping is a design tool only and must not change service names or scope without content approval.

Cards should not all compete equally on initial view. Establish clear scanning, consistent destination cues and a path for visitors who do not yet know which service applies.

### 8.3 For whom

Present the four profiles as decision paths. Profile differentiation may use semantic signal colours, but labels and descriptions remain the primary identifiers.

### 8.4 Origin

Create a quieter editorial interval. Increase typographic presence, reduce adjacent graphic noise and foreground the firm’s real history and word-of-mouth growth.

### 8.5 Guides and trust evidence

Use practical knowledge as proof of competence. Guide cards retain their topic-specific illustration language. Testimonials or other trust evidence must remain complete and verified.

### 8.6 Contact resolution

End with one confident invitation and clear contact routes. Avoid repeated competing CTAs. The final composition should feel like the resolved decision promised in the hero.

## 9. Motion Hierarchy

1. **Dominant event:** hero organisation sequence.
2. **Supporting transition:** resolved hero line continues into Services.
3. **Section motion:** small reveals, line draws and state changes.
4. **Micro-interactions:** card edge, button and navigation feedback.
5. **Quiet zones:** Origin, longer prose and contact information remain still enough to read comfortably.

No secondary effect may visually compete with the hero transformation.

## 10. Technical Architecture

### 10.1 SVG asset

Rebuild `hero-dossier.svg` as semantic groups, for example:

- `data-hero-layer="documents"`
- `data-hero-layer="rows"`
- `data-hero-layer="connectors"`
- `data-hero-layer="validation"`
- `data-hero-layer="signals"`
- `data-hero-layer="frame"`

The exact group count follows the approved artwork. Groups must be meaningful and limited; do not animate dozens of arbitrary path fragments individually.

The final organised state is the canonical static SVG state.

### 10.2 Motion controller

Create a small homepage-specific controller with these responsibilities:

- feature and preference detection;
- scene bounds measurement;
- normalized progress calculation;
- batched transform/opacity updates;
- offscreen suspension;
- resize recalculation;
- deterministic final/static state.

Do not add a large animation dependency unless a prototype proves that the required interpolation cannot be implemented clearly and reliably with the existing stack.

### 10.3 Integration boundaries

The implementation may modify:

- PT and EN homepage hero markup;
- the hero SVG asset or language-neutral replacement asset;
- homepage-specific CSS;
- a dedicated hero-motion module;
- the existing script entry only as needed to initialise that module;
- focused tests.

It must not rewrite unrelated navigation, forms, About/team profiles, Contact mapping or global content.

### 10.4 Failure behavior

- No JavaScript: final organised hero remains visible.
- Reduced motion: no spatial transformation.
- Unsupported feature: final organised hero remains visible.
- Asset load failure: headline, copy and actions remain complete; reserve dimensions to prevent layout shift.
- Runtime exception: no hidden content or blocked navigation.
- Narrow viewport: simplified static or short transition rather than compressed desktop choreography.

## 11. Accessibility Requirements

- WCAG AA contrast targets: 4.5:1 normal text, 3:1 large text and 3:1 meaningful UI/graphic boundaries.
- Colour never carries essential information alone.
- The hero illustration remains decorative or receives concise equivalent text according to its final semantic role.
- Focus order follows reading order.
- Skip link, navigation and CTAs remain usable throughout the scene.
- `prefers-reduced-motion: reduce` produces a deliberately designed static mode.
- No flashing, rapid oscillation or disorienting zoom.
- 200% zoom and text resize must preserve content and actions.
- Keyboard operation does not depend on scroll-specific pointer behavior.
- Hierarchy must survive grayscale review.

## 12. Performance Requirements

Use the current production homepage as the comparison baseline.

Targets:

- preserve a good LCP target of 2.5 seconds or less under representative measurement;
- INP target of 200 ms or less;
- CLS target of 0.1 or less;
- no continuous work after the hero is out of range;
- no raw high-cost work on every scroll event;
- no WebGL, video or image-sequence payload;
- explicit image/SVG dimensions;
- no unnecessary third-party runtime dependency;
- new hero asset and code budget documented during implementation planning.

Any regression must be reported with measured conditions. Localhost and cached-resource timings must not be presented as production field data.

## 13. Bilingual Requirements

- PT remains the default language.
- PT and EN use equivalent hero structure, animation behavior and visual hierarchy.
- Each language keeps natural, complete copy.
- No text is embedded in the SVG.
- Longer translations must not overlap the animated artwork or actions.
- Visual review must include both languages at every representative viewport.
- Shared assets and controllers should be language-neutral.

## 14. Prototype and Approval Process

1. Create an isolated homepage prototype on the feature branch.
2. Build the final/static hero state first.
3. Add desktop motion.
4. Add tablet, mobile and reduced-motion modes.
5. Apply the approved homepage rhythm refinements.
6. Run focused checks.
7. Render PT and EN at desktop and narrow-mobile sizes.
8. Present the rendered result for aesthetic review.
9. Revise until approved.
10. Only after approval: commit implementation, open/update a pull request and request explicit merge/deployment authorization.
11. Propagation to other pages is a separate approved phase.

## 15. Verification Matrix

### Automated

- Existing navigation and About consistency tests.
- Focused tests for PT/EN hero structural equivalence.
- Static checks for required final SVG state and reduced-motion rule.
- `git diff --check`.
- No missing local assets or broken internal paths.

### Browser runtime

- Desktop, tablet and narrow-mobile viewports.
- PT and EN.
- Forward, reverse and rapid scroll.
- Resize and orientation change.
- Refresh at top and after scrolling.
- Keyboard navigation and skip link.
- Reduced-motion mode.
- JavaScript-disabled fallback where practical.
- Console exceptions and failed network requests.

### Visual

- Opening state communicates controlled complexity, not chaos.
- Final state is visibly ordered and balanced.
- Headline and CTAs remain the primary content.
- No later section competes with the hero.
- Service grouping improves scanning without changing meaning.
- Colour hierarchy survives grayscale.
- PT and EN feel like the same design.

### Performance

- Compare resource counts and transfer sizes against the recorded baseline.
- Check LCP candidate and layout shifts.
- Inspect long tasks during the hero transition.
- Confirm no hero updates after it leaves the active range.
- Confirm smooth behavior on representative mid-range mobile hardware when available.

## 16. Acceptance Criteria

The design is complete when all of the following are true:

- The hero visibly transforms controlled complexity into a resolved accounting system.
- The transformation lasts less than one viewport of normal scroll travel and never hijacks scrolling.
- Core copy and actions remain readable and usable before, during and after motion.
- The final SVG state works without JavaScript.
- Reduced-motion and narrow-mobile modes are deliberately designed.
- Existing blue, teal and pink identity is refined rather than replaced.
- The homepage has a clearer six-section rhythm with quiet reading zones.
- PT and EN implementations are equivalent and individually reviewed.
- Existing regression tests pass and focused hero checks are added.
- Accessibility and performance gates pass under documented conditions.
- No unrelated site content or functionality changes.
- Pedro approves the rendered homepage before implementation is committed, merged or deployed.

## 17. Future Propagation

After the homepage is visually approved and deployed, a separate design/implementation phase may propagate:

- semantic colour tokens;
- material rules;
- section rhythm;
- typography refinements;
- quiet micro-interactions;
- responsive and reduced-motion conventions.

The signature hero transformation remains homepage-specific unless a later page has a distinct, content-derived reason for its own narrative interaction.
