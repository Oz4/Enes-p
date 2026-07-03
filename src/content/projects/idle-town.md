---
title: 'Idle Town'
studio: 'Solo project'
period: '2017'
summary: 'Asynchronous multiplayer Telegram game — 400K registered users, built solo before graduation.'
tech:
  engine: '— (no game engine)'
  language: 'PHP'
  networking: 'Telegram Bot API, webhooks'
  keyLibs: 'MySQL, cron jobs'
  platform: 'Telegram'
  teamSize: '1'
  role: 'Everything — design, code, ops'
---

<!-- REVIEW(Enes): drafted from PLAN.md seeds — verify all specifics
     and add real numbers (peak load, infra details). -->

## What it is

An asynchronous multiplayer idle game played entirely inside Telegram, built
solo while still a university student. It grew to 400K registered users with
1K playing concurrently.

## What I built

### Backend

- **The entire game server** in PHP + MySQL: game state, economy, and player
  progression for hundreds of thousands of accounts.
- **Asynchronous multiplayer** — players interact with each other's towns
  without needing to be online together.

### Infrastructure

- **Webhook-driven input**: every player action arrives as a Telegram webhook.
- **Cron-driven simulation**: idle progression computed on schedule rather than
  per-request, keeping the game "alive" cheaply.

## The hard part

**Problem.** 400K registered users and 1K concurrent players hitting a game
that had no game servers in any traditional sense — just PHP, MySQL, cron jobs,
and webhooks.

**Constraint.** One student, a student's budget, and a stack chosen for being
cheap to run rather than easy to scale.

**Solution.** Lean on the idle genre's shape: state changes are either explicit
player actions (webhooks, cheap to process one at a time) or time-based
progression (computed in scheduled batches by cron instead of simulated
continuously). The database does the multiplayer; nothing needs a persistent
connection.

**Result.** The game served 400K registered users as a solo, pre-graduation
project — and taught the systems thinking the rest of this portfolio is built
on.
