---
title: 'HG Idle Arcade Framework + HG Builder'
studio: 'Hero Games'
period: '2021–2023'
art: '/media/hero-games-key-art.svg'
summary: 'One framework behind 10+ mobile titles, plus Python CI/CD tooling that saved 2+ hours daily.'
order: 3
roleLine: 'Hero Games · Senior Game Developer'
chips: ['Unity', 'C#', 'CI/CD']
trailer: '8X2kIfS6fb8'
tech:
  engine: 'Unity'
  language: 'C#, Python'
  networking: '—'
  keyLibs: 'Fastlane, ads/analytics/IAP SDKs'
  platform: 'Mobile (iOS / Android)'
  teamSize: 'Remote team — Istanbul'
  role: 'Senior Game Developer — framework & build tooling'
---

## What it is

A reusable Unity idle-arcade framework plus HG Builder, a Python-based CI/CD
tool — together they carried 10+ arcade/idle games to production or soft launch
at Hero Games (Nov 2021 – Jun 2023, remote).

## What I built

### Framework architecture

- **The Idle Arcade Framework**: a reusable Unity foundation for rapid mobile
  game development.
- **Modular systems**: save/load, economy & progression, inventory, upgrades,
  and offline/idle progression.
- **Core gameplay loops** — rewards, timers, missions/events — with
  config-driven balancing.
- **Ads, analytics, and IAP-ready monetization**, supporting live ops and
  A/B testing across the portfolio.

### Tools

- **HG Builder**: Python-based CI/CD integrating Fastlane and Slack for
  automated build & deployment workflows — saving 2+ hours daily and enabling
  scalable multi-project releases.

### R&D

- Led development of an **AI-driven 3D conversational character**, integrating
  OpenAI GPT models and Google Text-to-Speech.

## The hard part

**Problem.** One framework had to serve 10+ games that were each different on
purpose — different mechanics, different economies, different art. Too rigid and
every new game fights the framework; too loose and it's not a framework at all,
just a folder of snippets.

**Constraint.** Games kept shipping while the framework evolved underneath
them — breaking changes had a real cost multiplied across every live title.

**Solution.** A composition-first architecture: small, replaceable systems
behind stable interfaces with config-driven balancing. Games override behavior
by swapping parts, not by patching shared code — and HG Builder made releasing
the whole portfolio a push-button operation.

**Result.** 10+ titles reached production or soft launch on the framework, and
the build automation saved the team 2+ hours every day.
