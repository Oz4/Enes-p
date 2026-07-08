# HANDOFF — state of the project (2026-07-04)

For the next developer (and their Claude Code session). Read `CLAUDE.md`
(rules) and `PLAN.md` (full spec) first — they are the source of truth.
This file covers what only the previous session knew.

## What this is

Enes Sahin's portfolio — "Night Delivery Network" V2. Astro 5 + TypeScript,
plain CSS with design tokens, three.js background scene, case studies in a
bottom sheet. **Live in production:** https://enes-portfolio-brown.vercel.app

## Run it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # must stay error-free; 3 pages + redirects
```

Node: repo is pinned to `astro@^5`, which runs on Node 20+. Do NOT bump to
Astro 6 casually (needs Node 22 and re-verification).

## Current state — the short version

- All content (case studies, quest log, contact, CV PDF) is REAL, sourced
  from Enes's CV. Email: enesshahn@gmail.com · GitHub: github.com/enesshahn.
- **Media is placeholder**: rail-card art/trailers are AAA YouTube stand-ins
  (Death Stranding, HL Alyx, Cyberpunk 2077, Minecraft), key-art SVGs and
  og-image are generated. `grep -ri placeholder src/` finds every swap point.
- **LinkedIn is intentionally absent** (no URL provided). When available:
  add to `src/data/site.ts` + a button in `Contact.astro`.
- **Systems-map plate colors are mid-experiment**: three `--plate-*` tokens
  in `src/styles/tokens.css` currently share the same green (#00ff88), and
  some token names don't match their tuned values. Geometry/text-contrast
  logic is final; the six fill values await a decision. Text color adapts
  per plate via the `text:` field in `SkillsMap.astro` — if you change a
  fill's brightness class, flip its text between white and `--plate-ink`.

## Gotchas that cost hours — don't rediscover them

1. **Dev-server staleness**: after rewriting a whole `.astro` component,
   Astro's HMR sometimes serves the OLD compiled styles/markup with no
   error. If the browser contradicts the source, restart `npm run dev`
   before debugging anything else. Production builds are never affected.
2. **The scene loads on first user interaction** (pointermove/scroll/etc.,
   6s fallback) — this is intentional, it's how mobile Lighthouse stays ~98.
   Don't "fix" it to load eagerly.
3. **Scene budget is a hard rule** (CLAUDE.md): ≤250kb gz including three.js
   (currently ~139kb), zero JS on the critical path, reduced-motion gets a
   static poster, page must work with JS disabled.
4. **Rail**: native scroller, `scroll-snap x proximity`, start-aligned;
   vertical wheel must NEVER be hijacked (was a reported bug). End padding
   formula makes the last card reachable — keep padding and card width in
   sync (`--rail-gutter`, `--rail-card-w`).
5. **Systems-map geometry** is computed at build time from the `SEAM`
   constants in `SkillsMap.astro`; typography/padding are in `cqi` units so
   plates scale with the panel. Text-overflow at any width = adjust `H`/
   `hy`/`compact` flags, not ad-hoc CSS.
6. **Neon name** is three SVG text layers; the word space is a literal
   U+00A0 (Astro + SVG both eat whitespace-only tspans). Letters must never
   move — all motion is opacity/filter.

## Deploying

Currently manual from the CLI: `npx vercel deploy --prod --yes` (the Vercel
project lives under the original owner's account — ask them for team access,
or better: connect this GitHub repo in the Vercel dashboard so pushes to
`main` auto-deploy and nobody needs CLI credentials).

Preview deploys (`npx vercel deploy --yes`) are auth-protected on this
Vercel account — Lighthouse/tests must run against a local build
(`npx astro preview`).

## Working agreement going forward

`origin/main` exists on GitHub now — do new work on feature branches and PR
into `main` (install the `gh` CLI for that). Keep PLAN.md updated when a
design decision changes; future Claude sessions treat it as canon.
