# Full-Bleed Spatial World & Cosmic Companions for ILMS Landing Page

- **Date:** 2026-11-16
- **Plan Summary:** Transform the ILMS Landing Page (`/`) from boxed `max-w-7xl` containers on a flat background into a continuous `100vw × 100vh` Full-Bleed Spatial World ("Luminous Socratic Observatory") inspired by `englishcoach.io.vn`'s atmospheric depth and scroll choreography, enriched with 3 new 3D RGBA Cosmic Companions (`companion-astro-owl.png`, `companion-planet-robot.png`, `companion-astronaut-explorer.png`).

```text
STATUS: COMPLETE
SUMMARY: Studied https://englishcoach.io.vn's live CSS/JS spatial architecture and rebuilt the ILMS Landing Page (/) into an edge-to-edge full-bleed world with volumetric light rays, scroll-driven depth (--horizon-depth, --e, --s), 3D unfolding Socratic book, orbital Bloom portholes, left-edge 1px whisper gauge, and 3 new 3D RGBA cosmic companions (Astro-Owl, Planet-Robot, Astronaut Explorer).
FILES:
  created:
    - public/images/landing/companion-astro-owl.png
    - public/images/landing/companion-planet-robot.png
    - public/images/landing/companion-astronaut-explorer.png
    - src/features/landing/hooks/useSceneScrollVars.ts
    - src/features/landing/components/shared/AtmosphericHorizonBackdrop.tsx
  modified:
    - src/app/globals.css
    - src/features/landing/index.ts
    - src/features/landing/components/LandingPageView.tsx
    - src/features/landing/components/LandingHeader.tsx
    - src/features/landing/components/LandingFooter.tsx
    - src/features/landing/components/3d/KnowledgeParticleField.tsx
    - src/features/landing/components/shared/ScrollConstellationRail.tsx
    - src/features/landing/components/shared/TiltCard.tsx
    - src/features/landing/components/mascot/FloatingSocraticMascot.tsx
    - src/features/landing/components/mascot/SocraticSpeechBubble.tsx
    - src/features/landing/components/sections/LandingHeroSection.tsx
    - src/features/landing/components/sections/SocraticDialecticSection.tsx
    - src/features/landing/components/sections/SmartClassroomSection.tsx
    - src/features/landing/components/sections/BloomMasterySection.tsx
    - src/features/landing/components/sections/ConversionFaqSection.tsx
    - src/messages/vi.json
    - src/messages/en.json
    - TASKS.md
CHECKS: lint not run (no lint script in package.json) · typecheck ✔ · tests not run · build ✔
ASSUMPTIONS: Retained both Light Mode ("Daylight Academic Sky") and Dark Mode ("Starlit Socratic Observatory") so theme switching transitions the entire full-bleed atmosphere seamlessly.
RISKS / LIMITATIONS: [NOT VERIFIED] Live browser DevTools visual capture could not run automatically because Chrome Remote Debugging is currently disabled on the host machine; RGBA alpha matting was verified via side-by-side Light/Dark composite sheets.
DOCS: updated TASKS.md | not needed for architecture/api-spec (no route or API contract change)
DEPLOYMENT: not deployed
NEXT: Commit and push the new spatial landing world, Login/Register 3D showcase images, and /classes lifecycle fix onto branch feat/landing-ui-and-api-sync.
```

## Review

```text
## Verdict: ✅ Approve

## Automated checks
lint: not configured in package.json · typecheck: ✔ 0 errors (npx tsc --noEmit) · i18n parity: ✔ 1793/1793 leaf keys match between en.json and vi.json · build: ✔ 29/29 routes compiled

## 🔴 Blockers
None.

## 🟠 Should fix
None (hardcoded comparison notes in SocraticDialecticSection.tsx were caught during self-review and moved to landing.story.socratic.* in vi.json and en.json).

## 🟡 Nits (optional)
None.

## ✅ Good
- Zero React re-renders during scroll choreography (`useSceneScrollVars` writes `--e` and `--s` directly to DOM style inside a single `requestAnimationFrame` callback).
- Full `prefers-reduced-motion: reduce` support across CSS keyframes, 3D book perspective, and WebGL particle canvas.
- All 3 new cosmic companion 3D assets (`companion-astro-owl.png`, `companion-planet-robot.png`, `companion-astronaut-explorer.png`) were verified on both Light (#E2EEFF) and Dark (#062258) composite sheets with clean RGBA alpha edges and accurate anatomy.
```
