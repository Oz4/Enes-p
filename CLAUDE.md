# CLAUDE.md — Project instructions for Claude Code

## What this project is
A portfolio/CV website for Enes Sahin, Senior Unity Engineer (systems, multiplayer, VR).
Concept: "The Systems Engineer" — a fast, clean, scrollable CV with an ambient canvas
simulation (chunk streaming, procedural roads, pathfinding delivery agents) and a live
profiler bar as the signature element. Full spec lives in **PLAN.md — read it before
making changes.** Follow it exactly; ask before deviating.

## Non-negotiable rules
1. **The document comes first.** The site must be fully readable and usable with
   JavaScript disabled. The simulation is decoration (`aria-hidden`), never a gate.
2. **Performance budget is a hard limit:** total JS < 100kb gzipped, sim code < 25kb,
   LCP < 1.5s, Lighthouse ≥ 95. Check bundle size after adding any dependency.
   Prefer zero dependencies for the sim — vanilla TS + Canvas 2D only.
3. **Design tokens only.** All colors/type come from `src/styles/tokens.css` (defined
   in PLAN.md §1). Never hardcode hex values in components. `--signal` (amber) is for
   actions and simulation entities; `--telemetry` (green) is only for live data readouts.
4. **Respect `prefers-reduced-motion`** in every animation and in the simulation
   (render one static frame instead).
5. **Copy tone:** plain, specific, engineer-to-engineer. Numbers over adjectives.
   No emoji in site copy. Content facts come from PLAN.md / the CV — never invent
   projects, metrics, or dates.
6. Work in the phase order defined in PLAN.md §6. One phase per session where possible.
   Commit with clear messages at each working milestone. Never let a later phase break
   Phase 1's plain-document behavior.

## Stack
Astro + TypeScript, plain CSS with custom properties, Canvas 2D island for the sim
(`client:idle`), content collections for case studies, deployed on Vercel.

## Conventions
- Components in `src/components/`, sim modules in `src/sim/`, case studies as markdown
  in `src/content/projects/`.
- Semantic HTML (header/main/section/article), visible focus states, alt text on all media.
- Mobile-first CSS; test at 380px, 768px, 1280px widths.
- No CSS frameworks, no UI kits, no icon mega-packs (inline SVG icons only).

## When unsure
If a request conflicts with PLAN.md or these rules (e.g., "add a heavy 3D library"),
flag the conflict and propose the lighter alternative before implementing.
