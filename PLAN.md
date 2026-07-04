# Enes Sahin — Portfolio Website: Full Plan & Spec

**Concept:** "The Systems Engineer" — a living simulation portfolio.
The site is a fast, clean, scrollable professional CV. Behind and around it runs a quiet, real simulation — procedural roads generating, delivery agents pathfinding, world chunks streaming in — a toy version of the systems Enes actually builds. The interactive layer *is* the proof of skill, never a barrier to information.

**One-line positioning (the spine of the whole site):**
> "I build the invisible systems that make games scale — from a 400K-player game written at university, to VR multiplayer physics, to a solo-shipped open-world simulator on Steam."

**Primary audiences:** (1) recruiters — 30-second scan, need role/proof/contact; (2) engineering leads — will read case studies and probe depth; (3) fellow devs — will share it if it's cool.

---

## 1. Design Direction — V2 "Night Delivery Network"

> V2 (redesign-v2) supersedes the original flat gray/amber direction. Content,
> structure, accessibility, and recruiter-first rules are unchanged.

### Grounding
The site is an open-world city at night seen from above, with long-exposure
light trails of deliveries flowing through it — the subject matter of Enes's
systems work rendered cinematically. Dark, colorful, atmospheric; awwwards-level
polish, never at the cost of readability or the performance budget.

### Color tokens (src/styles/tokens.css)

| Token | Value | Role |
|---|---|---|
| `--void` | `#060608` | Base background (never pure black) |
| `--surface` | near-opaque near-black (≈3% white over void) | Glass panel fill — must mask the lit-edge gradient outside the 1px ring |
| `--edge` | `rgba(255,255,255,0.08)` | Hairline borders |
| `--ink` | `#F2F3F7` | Primary text — high contrast, glow-free |
| `--ink-dim` | `#8B90A0` | Secondary text, labels |
| `--trail-amber` | `#FFB454` | Light trails, primary CTA |
| `--neon-violet` | `#8B5CF6` | Flat accent (section numbers, prose labels) + scene rims |
| `--neon-cyan` | `#22D3EE` | Live readouts + the dispatch pulse ONLY |
| `--grad-identity` | violet → cyan | Hero name sheen ONLY |
| `--grad-edge` | white 0.38 → 0.06 @45% → violet 0.18 | The standard "lit edge" 1px border on all glass |

### Geometry — sharp
`--radius: 0`: every UI surface (chips, pills, buttons, cards, rail cards,
panels, sheet, video frames) has square corners; all radii route through the
token.

### Light system — "less color, more light"
Cinematic hierarchy: mostly darkness, few bright sources. The standard surface
is near-black glass with a 1px **lit edge** border (white catching light at the
top-left corner, dying to violet at the bottom-right) — the only gradients in
the UI are these borders and the hero name sheen. Hover = the lit corner
brightens (~0.55 white) plus one 600ms sheen sweep; no glow blobs. Soft radial
glows behind sections (3–6%), fine animated grain (~3%), vignette rendered
*under* the content so frame edges fall to black without dimming text. The
primary CTA is solid amber — the single saturated UI element; section numbers
are flat violet. Body text stays high-contrast (≥7:1) and glow-free.

### Scroll-fade scrim (scene recedes on scroll)
A solid `--void` scrim between the WebGL canvas and the content, driven by a
rAF-throttled scroll listener via `--scrim-o`: 0 over the hero (scene fully
visible), smoothstep to 0.8 by one viewport of scroll, held for the page, then
easing back to 0.5 behind Contact so the network resurfaces under the final
CTA. Scroll-linked (no tween) so reduced-motion needs no special case. While
scrim ≥ 0.75 the scene sheds work (half trail spawn rate, bloom skipped);
click-to-dispatch only accepts clicks while scrim < 0.2 — background clicks
elsewhere belong to the document.

### Typography (unchanged)
Archivo (Expanded 700–900) display · Overpass body · JetBrains Mono utility.
1.25 type scale; hero name is the single oversized moment, carrying the
identity-gradient sheen (one sweep on load, then a slow drift).

### Motion rules
- One orchestrated load moment: scene fades up, trails ignite, name sheen
  sweeps once. ≤ 1.5s, skippable, reduced-motion safe (static poster instead).
- Scroll reveals subtle (150–250ms); quest-log route line draws in on scroll.
- The scene is ambient and slow — long-exposure city, not a fireworks show.

### Tone of copy
Unchanged: plain, specific, engineer-to-engineer. Numbers over adjectives.

---

## 2. The Background Scene (spec) — three.js

**What it is:** A fixed full-viewport WebGL canvas behind all content
(`src/scene/`: `network.ts`, `trails.ts`, `dispatch.ts`, `postfx.ts`), subtly
visible through the page. Replaces the V1 Canvas-2D sim and sandbox mode
(both removed).

**Behavior:**
1. Dark ground plane, faint city grid, instanced dark blocks; a procedural
   route network generated from deterministic edge hashes (L-shaped blocks).
2. Glowing light trails flow along routes — amber only, the brightest element
   in the frame — rendered as additive shader sprites (head + fading tail).
   Buildings are near-black volumes with thin violet rim lines (top edges
   brighter); FogExp2 fades everything with distance; cyan appears only as
   the dispatch arrival pulse. Trail starts are biased toward the hero
   framing so 2–3 trails stay visible on first glance.
3. Slow ambient camera drift; mouse parallax capped at ~2°.
4. **Dispatch interaction:** clicking/tapping the background routes a bright
   streak from the click point through the network to a depot. No concurrency
   cap — a token bucket allows 2 dispatches/second (extra clicks drop silently);
   the cyan pulse fires at the click point instantly on accept, before routing;
   trails and pulses are object-pooled (oldest recycled) so rapid clicking never
   allocates. Only active while the hero is in view (scrim < 0.2). Clicks on
   real UI elements are never intercepted.
5. A single mono net-line in the footer reports live fps / trails / deliveries.

**Performance guardrails:** bloom postprocessing on desktop only (mobile gets
additive-sprite fake glow, no postFX); devicePixelRatio capped at 1.5; rAF
canceled on hidden tabs; the scene bundle lazy-loads on **first user
interaction** (fallback 6s timer) so it never competes with document paint.
Scene bundle budget: **≤ 250kb gzipped including three.js** (currently ~139kb).

**Fallbacks:** `prefers-reduced-motion`, no WebGL, or Save-Data → static CSS
gradient poster. The page is fully readable with JS disabled.

---

## 3. Sitemap & Page Structure

Single-page scroll site + separate case-study pages. Sticky minimal nav: `Projects · Skills · Timeline · Contact · [Download CV]`.

### 3.1 Hero (the 5-second test) — V2 iteration
Scene running behind (scrim 0). Content, top to bottom, nothing else:
- **Role eyebrow:** SENIOR UNITY ENGINEER — SYSTEMS · MULTIPLAYER · VR
- **Name:** Enes Sahin — a neon sign in three SVG text layers (sr-only span
  keeps the h1 accessible): base white 92%; tube glow (blur(14px) warm copy
  breathing ±6% on a 4s cycle); outline spark (60-unit amber dash traveling
  the glyph outlines once per 6s cycle, ~1s per trip). Power-on flicker once
  per visit (3 irregular snaps in 0.9s). Every 10–15s ONE random letter dips
  to 40% for 120ms (skipped during the spark window). Letters never move or
  change hue — all motion is opacity/filter. Reduced motion: static white +
  constant soft glow, with a console note during testing.
- **One line:** "I build game systems that ship and scale."
- **Proof chips (mono):** `Shipped on Steam` · `400K+ players served` · `VR multiplayer` · `10+ yrs building games`
- **CTAs:** `Download CV` (primary, amber) · `View projects` (secondary). Contact icons: email, GitHub.

### 3.2 Showreel — REMOVED (V2 iteration)
No standalone showreel section. Footage lives in the rail cards (muted video on
the active card) and the case-study sheet media strips. The capture checklist in
§7 still applies — it feeds those slots.

### 3.3 Featured Projects — PS5-style rail (V2)
Full-bleed horizontal rail with scroll-snap: tall 3:4 cards, large key art /
trailer video filling each card, bottom gradient scrim with title, one-line
role, tech chips. A REAL native scroller: flex row, overflow-x auto,
scroll-snap-type x PROXIMITY (mandatory made far cards unreachable),
scroll-padding matching the page gutter, and padding-inline-end reserving
100vw − gutter − card width so the LAST card can align to the start edge.
Card 1 sits at the container's left content edge on load (scroll pinned to 0
after fonts settle). The active (snapped) card scales to ~1.05 and plays its
video muted; neighbors dim to 60%. Drag maps pointer delta to scrollLeft (no
transforms, no clamps); trackpad horizontal gestures and arrow keys reach
every card. Vertical wheel is NEVER hijacked — it scrolls the page even when
the cursor is over the rail (standard rail convention). Same four projects:
1. **My Corp Cargo Simulator** (NocturnForge) — Lead / solo-shipped open-world sim, Steam.
2. **Highstreet Market** — VR multiplayer physics & combat systems.
3. **HG Idle Arcade Framework + HG Builder** — framework powering 10+ shipped mobile titles + CI/CD tooling.
4. **Idle Town** — 400K-user asynchronous multiplayer Telegram game (PHP/MySQL), built solo pre-graduation.

### 3.4 Case Study template — bottom sheet (V2)
Case studies open in an 85vh glass bottom sheet over the dimmed page (no
separate routes; old `/projects/*` URLs redirect). Deep-linkable via
`#/project/<slug>`; back button closes; X / ESC / swipe-down / backdrop click;
focus trapped inside; body scroll locked. Without JS, the same articles render
in normal document flow below the rail. Each sheet:
Three-part structure, in this order:
1. **What it is** — 2 sentences + video/GIF strip.
2. **What I built** — his exact contributions, verbatim-level specificity from the CV, grouped (Architecture / Gameplay / Performance / Tools).
3. **The hard part** — one hardest technical problem, told as problem → constraint → solution → result. Pre-answers senior interview questions.
Plus a **Tech box** (Steam "system requirements" style, reskinned): engine, language, networking, key libs, platform, team size, his role.

**"The hard part" seeds per project:**
- Cargo Simulator: floating-point precision + chunked streaming in an open world; ID-based entity system for decoupled data-oriented gameplay.
- Highstreet: custom physics joint/constraint handling to kill latency-induced jitter on handheld objects in networked VR.
- HG: designing one framework flexible enough to ship 10+ different games; build automation saving 2+ hrs/day.
- Idle Town: serving 400K registered / 1K concurrent users on PHP + CronJobs + webhooks as a student.

### 3.5 Skills — "Systems Map" (shared-seam mosaic)
The one deliberately loud moment on the page. ONE master panel (976×520
reference, aspect-locked) sliced into six plates by SHARED seam lines: two
vertical seams tilted +6°/−7° (opposite directions), one horizontal seam at
2.5°, outer boundary at 1.7° — no axis-aligned edge, no 90° corner anywhere;
adjacent edges are exactly parallel because neighbors share seams (honeycomb
logic). All geometry derives at build time from one named SEAM constants
block in `SkillsMap.astro` (positions, tilts, 8px centroid inset for even
gutters, 28px text-safety) — tune the composition by editing those numbers.
Per-plate clip-aware padding (worst-case edge recession + safety) keeps text
clear of every angled edge, and plate typography + padding use container-
query units so the whole system scales as one at any width ≥768px.
Fills come from the hand-tunable scoped `--plate-*` tokens; text color
adapts per plate (white on dark fills, `--plate-ink` near-black on bright
fills) to hold ≥4.5:1. No borders, no glow; hover lifts 4px and brightens
5%. Mobile (<768px) stacks full-width parallelograms (±2° alternating).
Plate colors appear NOWHERE else — the rest of the site stays dark
monochrome + amber. Branches: `Unity & Engine` (GameObject, DOTS/ECS, Jobs+Burst, Addressables, profiling) · `Architecture` (composition, DI — Zenject/VContainer, SOLID, modular assemblies) · `Multiplayer` (client-server, replication, prediction, packing/compression) · `VR & Physics` (IK, joints/constraints, interaction) · `AI & Procedural` (FSM, behavior trees, navmesh, procedural roads) · `Backend & Tools` (ASP.NET, MySQL/NoSQL, Firebase, CI/CD, Python). Hover a node → tooltip with 1-line proof ("Used in: Highstreet VR combat"). Every node links to evidence. No fake levels or percentages — proof instead of numbers.

### 3.6 Quest Log — experience timeline (boxless, V2 iteration)
No panels: text sits directly on the page. The glowing route-line spine with
small sharp square nodes, mono timestamps, role headings, ink-dim bullets, and
wide entry spacing carry the structure. Newest first: NocturnForge (2025–2026, Lead) → Highstreet Market (2023–2025, Senior) → Hero Games (2021–2023, Senior) → University projects incl. VR combat + CPU ray tracer (2021) → Idle Fisher (2019) → Idle Town (2017). Each entry: role, 2–3 headline bullets, tech chips. Subtle "quest complete" checkmark styling — restrained, not cartoonish.

### 3.7 Achievements
6–8 real badges, amber-on-panel, mono captions. E.g.: `Solo-shipped on Steam` · `400K+ registered users` · `10+ titles to production` · `2h/day saved via CI/CD tooling` · `Shipped VR multiplayer` · `Built a CPU ray tracer from scratch` · `Trilingual: EN/AR/TR`. Each badge tooltip links to its source project.

### 3.8 Contact + CV
- Email (mailto), GitHub, LinkedIn (Enes to confirm URL).
- **Download CV** — direct PDF, one click, no gate. Filename: `Enes-Sahin-Unity-Engineer-CV.pdf`.
- "Open to" line: *Senior/Lead Unity roles — multiplayer, systems, VR. Remote (based in Ankara, TR).*
- Footer: a single mono net-line reports live scene stats (`network online · 60 fps · trails 22 · deliveries N`).

---

## 4. Tech Stack (the site itself)

- **Framework:** Astro — content-first, ships ~zero JS by default, perfect Lighthouse scores achievable, case studies as markdown content collections.
- **Scene & interactivity:** three.js WebGL scene in `src/scene/`, lazy-loaded on first interaction so the document renders and paints first.
- **Styling:** Plain CSS with custom properties (design tokens above). No Tailwind needed at this scale; keeps output tiny.
- **Video:** Self-hosted compressed MP4/WebM (or Cloudflare Stream), poster images, `preload="none"`.
- **Hosting:** Vercel or Netlify (either fine), custom domain (e.g., `enessahin.dev`).
- **Analytics:** none or privacy-light (Plausible) — optional.

**Performance budget (hard limits):** LCP < 2s, Lighthouse ≥ 90 mobile (currently 98 mobile / 100 desktop), scene bundle ≤ 250kb gzipped including three.js, zero layout shift from the canvas. The footer net-line makes the scene's honesty public.

**Accessibility floor:** semantic HTML underneath everything, keyboard-navigable, visible focus states, `prefers-reduced-motion` respected, alt text on all media, scene is `aria-hidden` decoration; rail and sheet fully keyboard-navigable (focus trap in the sheet).

---

## 5. Folder Structure

```
enes-portfolio/
├── CLAUDE.md              # instructions for Claude Code (see companion file)
├── PLAN.md                # this file
├── astro.config.mjs
├── public/
│   ├── cv/Enes-Sahin-Unity-Engineer-CV.pdf
│   ├── media/            # videos, gifs, posters (compressed)
│   └── og-image.png      # cinematic link-share card
├── src/
│   ├── styles/tokens.css
│   ├── components/       # Hero, ProjectCard, TechBox, ProfilerBar, QuestLog, SkillsMap, Achievements, Contact
│   ├── scene/            # index.ts, network.ts, trails.ts, dispatch.ts, postfx.ts
│   ├── content/projects/ # cargo-simulator.md, highstreet.md, hero-games.md, idle-town.md
│   ├── layouts/
│   └── pages/            # index.astro, 404.astro (case studies live in the sheet)
└── package.json
```

---

## 6. Build Phases (each = one Claude Code session/commit milestone)

**Phase 0 — Setup.** Init Astro + TS, tokens.css, fonts, base layout, deploy pipeline to Vercel with a "hello" page. *Deploy from day one.*

**Phase 1 — The document.** Entire site as clean semantic HTML/CSS with real content, **no simulation yet**: hero (static grid background), project cards, one full case study, skills map (static SVG), quest log, achievements, contact, CV download. Ship it — at this point it's already a strong portfolio.

**Phase 2 — The simulation.** Canvas island: chunk grid → streaming visual → procedural roads → agents + pathfinding → profiler bar. Performance guardrails. Reduced-motion fallback.

**Phase 3 — Polish.** Load orchestration, scroll reveals, hover micro-interactions, remaining case studies, OG card, favicon, 404 page (a "lost delivery agent" — one allowed joke).

**Phase 4 (v1.1) — Sandbox mode.** Interactive road placement, agent spawning, FSM state panel.

**Phase 5 — Hardening.** Lighthouse audit, real-device mobile pass, cross-browser, copy edit, Enes review.

Rule: **never let later phases break Phase 1.** The document always works with JS disabled.

**V2 — "Night Delivery Network" redesign (branch `redesign-v2`, supersedes V1 visuals):**
1. Relight — new tokens, light system, glass panels; V1 sim/sandbox/profiler removed.
2. three.js background scene with click-to-dispatch.
3. PS5-style project rail + bottom-sheet case studies (project routes removed, redirects in place).
4. Quality: Lighthouse 98 mobile / 100 desktop, keyboard pass, doc updates.
Sandbox mode was removed in V2 — the dispatch interaction replaces it.

---

## 7. What Enes must provide (content checklist)

1. **Showreel footage** — the single highest-leverage asset. 60–90s: IK hands, streaming flythrough, VR interaction/combat, agents, tooling. Even rough capture > nothing.
2. Per project: 1 key art image + 2–4 GIFs/clips + link (Steam page URL for Cargo Simulator!).
3. Final CV PDF (we can rebuild it to match site branding later).
4. LinkedIn URL, preferred contact email, confirmation of "open to" line.
5. GitHub: pin repos that back up the site's claims; add profile README linking to the site.
6. Approval of the positioning sentence.

---

## 8. Definition of "done" for v1

- A recruiter understands who/what/proof/contact within 5 seconds without scrolling.
- An engineering lead can reach "the hard part" of any project in ≤ 2 clicks.
- Lighthouse ≥ 95, LCP < 1.5s on mid-range mobile.
- Site is fully usable with JS off, on mobile, and with reduced motion.
- The link unfurls beautifully on LinkedIn/Discord (OG card).
- Enes says "this feels like me."
