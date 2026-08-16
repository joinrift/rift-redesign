# Rift — Redefine Your Health

Scroll-driven website redesign for [joinrift.com](https://joinrift.com).

## Features
- Interactive 3D hero: real Rift vial (Higgsfield image-to-3D GLB) tilts toward the cursor,
  molecule field with pointer repulsion + parallax, rising bubbles, and a glass product
  carousel (Semaglutide / Tirzepatide / NAD+) that morphs the theme and spin-swaps the vial.
  Deep links: `#treat-sema`, `#treat-tirz`, `#treat-nad`.
- 151-frame GSAP ScrollTrigger animation (glass vial → product cascade)
- Treatment product cards with liquid-fill vial animations
- Pricing section with monthly/quarterly toggle
- FAQ accordion, testimonials, full footer

## Structure
```
index.html          — full single-file site
rift-frames/        — 151 JPG frames for the scroll animation
models/             — GLB 3D models for the hero (generated via Higgsfield image-to-3D)
vial-images/        — transparent product vial PNGs
```

## Run locally
Serve the folder (the 3D hero fetches GLB models, which `file://` blocks):
`python -m http.server 8000` then open http://localhost:8000
