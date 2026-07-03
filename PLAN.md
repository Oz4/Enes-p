# Enes Sahin — Portfolio Website: Full Plan & Spec

**Concept:** "The Systems Engineer" — a living simulation portfolio.
The site is a fast, clean, scrollable professional CV. Behind and around it runs a quiet, real simulation — procedural roads generating, delivery agents pathfinding, world chunks streaming in — a toy version of the systems Enes actually builds. The interactive layer *is* the proof of skill, never a barrier to information.

**One-line positioning (the spine of the whole site):**
> "I build the invisible systems that make games scale — from a 400K-player game written at university, to VR multiplayer physics, to a solo-shipped open-world simulator on Steam."

**Primary audiences:** (1) recruiters — 30-second scan, need role/proof/contact; (2) engineering leads — will read case studies and probe depth; (3) fellow devs — will share it if it's cool.

---

## 1. Design Direction

### Grounding
The visual world comes from Enes's actual subject matter: the Unity editor, logistics/cargo simulation, telemetry and profiling. Not "gamer neon," not fantasy — engineered, industrial, precise.

### Color tokens
Avoid pure black + single neon accent (an overused default). Two accents, each with a defined job:

| Token | Hex | Role |
|---|---|---|
| `--asphalt` | `#1A1C1E` | Base background (deep warm gray, not pure black) |
| `--panel` | `#26292C` | Cards, panels (Unity-editor gray family) |
| `--chunk-line` | `#3A4148` | Grid lines, borders, world-grid overlay |
| `--ink` | `#E8EAED` | Primary text |
| `--ink-dim` | `#9AA0A6` | Secondary text, labels |
| `--signal` | `#F5A623` | Primary accent: CTAs, active states, delivery agents, hazard-stripe details (cargo/logistics amber) |
| `--telemetry` | `#4ADE9C` | Secondary accent: profiler readouts, "live/running" indicators, success states only |

Rule: `--signal` is for actions and the simulation; `--telemetry` is exclusively for live data readouts. Never swap them.

### Typography
- **Display:** Archivo (Expanded, 700–900) — industrial, signage-adjacent, used only for section titles and the hero name.
- **Body:** Overpass — derived from U.S. Highway Gothic signage; a quiet thematic link to a cargo/delivery simulator. Highly readable.
- **Utility/mono:** JetBrains Mono — telemetry bar, tech-stack chips, code-ish labels, timestamps.
- Type scale: 1.25 ratio; hero name is the single oversized moment on the page.

### Signature element (the one memorable thing)
The **ambient simulation + live profiler bar** combo. Everything else stays disciplined and quiet. The profiler bar is a thin fixed strip (bottom edge, collapsible) showing *real* stats of the page itself: `FPS 60 · agents 14 · chunks 9/24 loaded · JS 82kb`. Honest, technical, quietly funny — and self-refuting if the site is slow, which is exactly the point: it forces us to keep it fast.

### Motion rules
- One orchestrated page-load moment: the hero grid draws in, roads generate, name types/settles. ≤ 1.2s, skippable, respects `prefers-reduced-motion` (static rendered frame instead).
- Scroll reveals: subtle, 150–250ms, no parallax circus.
- The simulation is ambient and slow — it should feel like a screensaver from a systems game, not a fireworks show.

### Tone of copy
Plain, specific, engineer-to-engineer. No "passionate ninja rockstar." Numbers over adjectives ("saved 2+ hours daily," "400K+ registered users," "eliminated latency-induced jitter").

---

## 2. The Simulation (spec)

**What it is:** A top-down 2D canvas simulation (Canvas 2D API, not Three.js — cheaper, sharper, sufficient) rendered behind the hero and persisting faintly behind section backgrounds.

**Behavior:**
1. A grid of "world chunks" — chunks near the viewport center render fully; distant ones show as faint outlines that "stream in" as the user scrolls (visualizing his Addressables chunk-streaming work).
2. A procedural road network generates across loaded chunks (visualizing procedural roads).
3. Small delivery agents (simple shapes, amber) pathfind along roads between depots (visualizing AI/FSM + navigation + the delivery loop of My Corp Cargo Simulator).
4. Everything reports to the profiler bar.

**Sandbox mode (the optional mini-game, v1.1):** A "Sandbox" toggle in the nav. When on, the simulation becomes interactive: click to place road segments, place a depot, spawn agents, watch them route; a small panel shows agent states (FSM: Idle → Pickup → Deliver). No score, no fail state — it's a toy demonstrating real systems. Prominent "Exit sandbox" returns to the CV. **The CV is never gated behind this.**

**Performance guardrails:** requestAnimationFrame with tab-visibility pause; agent cap scales with device (mobile ≈ 6, desktop ≈ 16); sim pauses when scrolled past hero on low-end devices; total sim code budget ≤ 25kb gzipped.

---

## 3. Sitemap & Page Structure

Single-page scroll site + separate case-study pages. Sticky minimal nav: `Projects · Skills · Timeline · Contact · [Sandbox] · [Download CV]`.

### 3.1 Hero (the 5-second test)
- Simulation running behind, dimmed.
- **Name:** Enes Sahin
- **Role line:** Senior Unity Engineer — Systems · Multiplayer · VR
- **Sub-line:** the positioning sentence above.
- **Proof chips (mono):** `Shipped on Steam` · `400K+ players served` · `VR multiplayer` · `10+ yrs building games`
- **CTAs:** `Download CV` (primary, amber) · `View projects` (secondary). Contact icons: email, GitHub.
- Tiny scroll cue.

### 3.2 Showreel
60–90s muted autoplay-on-hover video (click for sound), poster frame otherwise. **Content Enes must capture** (biggest current gap — see §7): IK hand placement, open-world streaming flythrough, VR grabbing/combat, agents pathfinding, editor tooling.

### 3.3 Featured Projects (4 cards)
Steam-capsule-style cards: key art/GIF, title, one-line role, 3 tech chips, "Read case study →".
1. **My Corp Cargo Simulator** (NocturnForge) — Lead / solo-shipped open-world sim, Steam.
2. **Highstreet Market** — VR multiplayer physics & combat systems.
3. **HG Idle Arcade Framework + HG Builder** — framework powering 10+ shipped mobile titles + CI/CD tooling.
4. **Idle Town** — 400K-user asynchronous multiplayer Telegram game (PHP/MySQL), built solo pre-graduation.

### 3.4 Case Study template (each project page)
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

### 3.5 Skills — "Systems Map" (RPG skill tree, engineered flavor)
Not fantasy constellations — a **node graph styled like an architecture diagram** (his Core → Systems → Gameplay layering). Branches: `Unity & Engine` (GameObject, DOTS/ECS, Jobs+Burst, Addressables, profiling) · `Architecture` (composition, DI — Zenject/VContainer, SOLID, modular assemblies) · `Multiplayer` (client-server, replication, prediction, packing/compression) · `VR & Physics` (IK, joints/constraints, interaction) · `AI & Procedural` (FSM, behavior trees, navmesh, procedural roads) · `Backend & Tools` (ASP.NET, MySQL/NoSQL, Firebase, CI/CD, Python). Hover a node → tooltip with 1-line proof ("Used in: Highstreet VR combat"). Every node links to evidence. No fake levels or percentages — proof instead of numbers.

### 3.6 Quest Log — experience timeline
Vertical timeline, terminal/log aesthetic (mono timestamps), newest first: NocturnForge (2025–2026, Lead) → Highstreet Market (2023–2025, Senior) → Hero Games (2021–2023, Senior) → University projects incl. VR combat + CPU ray tracer (2021) → Idle Fisher (2019) → Idle Town (2017). Each entry: role, 2–3 headline bullets, tech chips. Subtle "quest complete" checkmark styling — restrained, not cartoonish.

### 3.7 Achievements
6–8 real badges, amber-on-panel, mono captions. E.g.: `Solo-shipped on Steam` · `400K+ registered users` · `10+ titles to production` · `2h/day saved via CI/CD tooling` · `Shipped VR multiplayer` · `Built a CPU ray tracer from scratch` · `Trilingual: EN/AR/TR`. Each badge tooltip links to its source project.

### 3.8 Contact + CV
- Email (mailto), GitHub, LinkedIn (Enes to confirm URL).
- **Download CV** — direct PDF, one click, no gate. Filename: `Enes-Sahin-Unity-Engineer-CV.pdf`.
- "Open to" line: *Senior/Lead Unity roles — multiplayer, systems, VR. Remote (based in Ankara, TR).*
- Footer easter egg: profiler bar prints `-- simulation still running. thanks for scrolling. --`

---

## 4. Tech Stack (the site itself)

- **Framework:** Astro — content-first, ships ~zero JS by default, perfect Lighthouse scores achievable, case studies as markdown content collections.
- **Sim & interactivity:** Vanilla TypeScript + Canvas 2D as an Astro island (`client:idle`), so the document renders instantly and the sim hydrates after.
- **Styling:** Plain CSS with custom properties (design tokens above). No Tailwind needed at this scale; keeps output tiny.
- **Video:** Self-hosted compressed MP4/WebM (or Cloudflare Stream), poster images, `preload="none"`.
- **Hosting:** Vercel or Netlify (either fine), custom domain (e.g., `enessahin.dev`).
- **Analytics:** none or privacy-light (Plausible) — optional.

**Performance budget (hard limits):** LCP < 1.5s, total JS < 100kb gzipped, Lighthouse ≥ 95 across the board, sim ≤ 25kb. The profiler bar makes these promises public — we must keep them.

**Accessibility floor:** semantic HTML underneath everything, keyboard-navigable, visible focus states, `prefers-reduced-motion` respected, alt text on all media, sim is `aria-hidden` decoration.

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
│   ├── sim/              # engine.ts, chunks.ts, roads.ts, agents.ts, profiler.ts, sandbox.ts
│   ├── content/projects/ # cargo-simulator.md, highstreet.md, hero-games.md, idle-town.md
│   ├── layouts/
│   └── pages/            # index.astro, projects/[slug].astro
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

Rule: **never let Phase 2–4 break Phase 1.** The document always works with JS disabled.

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
