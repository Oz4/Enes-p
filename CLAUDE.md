# CLAUDE.md — Project instructions for Claude Code

## What this project is
A portfolio/CV website for Enes Sahin, Senior Unity Engineer (systems, multiplayer, VR).
Concept V2: "Night Delivery Network" — a fast, scrollable CV over a cinematic three.js
night-city scene with long-exposure delivery light trails; clicking the background
dispatches a delivery through the route network. (V1's Canvas-2D sim, sandbox mode, and
profiler bar are REMOVED; a footer net-line reports live scene stats.) Full spec lives in **PLAN.md — read it before
making changes.** Follow it exactly; ask before deviating.

## Non-negotiable rules
1. **The document comes first.** The site must be fully readable and usable with
   JavaScript disabled. The simulation is decoration (`aria-hidden`), never a gate.
2. **Performance budget is a hard limit:** scene bundle ≤ 250kb gzipped INCLUDING
   three.js (three.js is the only allowed heavy dependency), LCP < 2s, Lighthouse ≥ 90
   mobile, zero layout shift from the canvas. The scene lazy-loads on first user
   interaction — never on the critical path. Check bundle size after any dependency change.
3. **Design tokens only.** All colors/type come from `src/styles/tokens.css` (defined
   in PLAN.md §1). Never hardcode hex values in components. `--trail-amber` is for light
   trails and primary CTAs; `--neon-cyan` for live readouts; `--trail-crimson` is a rare
   accent. Body text stays high-contrast and glow-free.
4. **Respect `prefers-reduced-motion`** in every animation and in the scene
   (serve the static gradient poster instead; no WebGL init).
5. **Copy tone:** plain, specific, engineer-to-engineer. Numbers over adjectives.
   No emoji in site copy. Content facts come from PLAN.md / the CV — never invent
   projects, metrics, or dates.
6. Work in the phase order defined in PLAN.md §6. One phase per session where possible.
   Commit with clear messages at each working milestone. Never let a later phase break
   Phase 1's plain-document behavior.

## Stack
Astro + TypeScript, plain CSS with custom properties, three.js scene in `src/scene/`
(lazy-loaded on first interaction), content collections for case studies rendered into
the bottom sheet (no per-project routes — old `/projects/*` URLs redirect), Vercel.

## Conventions
- Components in `src/components/`, scene modules in `src/scene/`, case studies as
  markdown in `src/content/projects/` (rendered in-flow for no-JS, cloned into the sheet).
- Semantic HTML (header/main/section/article), visible focus states, alt text on all media.
- Mobile-first CSS; test at 380px, 768px, 1280px widths.
- No CSS frameworks, no UI kits, no icon mega-packs (inline SVG icons only).

## When unsure
If a request conflicts with PLAN.md or these rules (e.g., "add a heavy 3D library"),
flag the conflict and propose the lighter alternative before implementing.
