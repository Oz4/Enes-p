---
title: 'Idle Town'
studio: 'Solo project'
period: '2017'
art: '/media/idle-town-key-art.svg'
summary: 'Asynchronous multiplayer Telegram game — 400K+ registered users, built solo as a student.'
order: 4
roleLine: 'Solo · built as a student'
chips: ['PHP', 'MySQL', 'Webhooks']
trailer: 'MmB9b5njVbA'
tech:
  engine: '— (no game engine)'
  language: 'PHP'
  networking: 'Telegram Bot API, webhooks'
  keyLibs: 'MySQL, cron jobs, Xsolla'
  platform: 'Telegram'
  teamSize: '1'
  role: 'Everything — design, code, ops'
---

## What it is

An asynchronous multiplayer idle game played entirely inside Telegram, built
solo while still a university student. It reached 400K+ registered users with
1K+ active players.

## What I built

### Backend

- **The entire game server** in PHP + MySQL, driven by webhooks and cron jobs.
- **Resource, building, and progression systems** with upgrade pipelines and
  time-based mechanics.

### Gameplay

- **PvE, PvP, and boss combat** with player progression and scaling.
- **Clan system** with shared progression and role-based management.
- **Hero system** with equipment-based upgrades and power scaling.
- **Leaderboards and rankings** across multiple progression metrics.

### Live game

- **In-game payments via Xsolla** — a real economy, run solo.

## The hard part

**Problem.** 400K+ registered users and 1K+ active players hitting a game
that had no game servers in any traditional sense — just PHP, MySQL, cron jobs,
and webhooks.

**Constraint.** One student, a student's budget, and a stack chosen for being
cheap to run rather than easy to scale.

**Solution.** Lean on the idle genre's shape: state changes are either explicit
player actions (webhooks, cheap to process one at a time) or time-based
progression (computed in scheduled batches by cron instead of simulated
continuously). The database does the multiplayer; nothing needs a persistent
connection.

**Result.** The game served 400K+ registered users as a solo, pre-graduation
project — and taught the systems thinking the rest of this portfolio is built
on.
