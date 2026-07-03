---
title: 'HG Idle Arcade Framework + HG Builder'
studio: 'Hero Games'
period: '2021–2023'
art: '/media/hero-games-key-art.svg'
summary: 'One framework powering 10+ shipped mobile titles, plus CI/CD tooling that saved 2+ hours daily.'
tech:
  engine: 'Unity'
  language: 'C#'
  networking: '—'
  keyLibs: '[placeholder — DI container, key packages]'
  platform: 'Mobile (iOS / Android)'
  teamSize: '[placeholder]'
  role: 'Senior Engineer — framework & build tooling'
---

<!-- REVIEW(Enes): drafted from PLAN.md seeds — verify all specifics,
     fill the [placeholder] fields, and add real numbers. -->

## What it is

An internal Unity framework for idle-arcade mobile games, plus HG Builder, the
CI/CD tooling around it. Together they took Hero Games from building each title
from scratch to shipping 10+ different games on one foundation.

## What I built

### Framework architecture

- **The HG Idle Arcade Framework**: shared core systems — game loop, economy,
  progression, common gameplay building blocks — assembled per title through
  composition rather than inheritance.
- **Modular assemblies** so each game pulls in only what it uses.

### Tools

- **HG Builder**: build automation and CI/CD for the whole portfolio —
  one-command builds instead of hand-maintained per-title pipelines.

## The hard part

**Problem.** One framework had to serve 10+ games that were each different on
purpose — different mechanics, different economies, different art. Too rigid and
every new game fights the framework; too loose and it's not a framework at all,
just a folder of snippets.

**Constraint.** Games kept shipping while the framework evolved underneath
them — breaking changes had a real cost multiplied across every live title.

**Solution.** A composition-first architecture: small, replaceable systems
behind stable interfaces, wired per-title with dependency injection. Games
override behavior by swapping parts, not by patching shared code.

**Result.** 10+ titles shipped to production on the framework, and HG Builder's
automation saved the team 2+ hours every day.
