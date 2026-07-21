# English office section — design

## Purpose
Make the English **About us** office subsection match the final Portuguese page’s visual hierarchy, while retaining the same office photograph.

## Cause
The Portuguese markup places `fachada.jpeg` inside the existing `.split` grid at `400 × 300`. The English page places it after that grid in `.storefront-figure`, whose width can reach `900px`; this creates the oversized treatment.

## Chosen design
1. Keep the section identifier, tab and existing responsive `.split` layout.
2. Use the English equivalent of the Portuguese content:
   - **Our space in Montijo.**
   - Address paragraph.
   - Accessibility, parking and central-location paragraph.
3. Move the image into the `.split` grid as `<figure class="escritorio-foto reveal">`.
4. Retain `fachada.jpeg?v=20260721` so browsers request the image afresh.
5. Set its HTML dimensions to `400 × 300`, matching PT.
6. Remove the English-only oversized figure, its caption and the separate “How to find us” link.

## Behaviour and validation
- Desktop: image sits in the same grid as the heading and copy, matching PT’s scale.
- Narrow screens: the existing grid stacks naturally; no CSS change is required.
- Check the final DOM for the cache-busted `fachada.jpeg` source, `400 × 300` dimensions, absence of `.storefront-figure`, and a successful image load.

## Scope
Only `en/about.html` changes. No shared CSS, scripts, Portuguese content, navigation, team details or image assets are modified.
