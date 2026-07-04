---
title: 'My Corp Cargo Simulator'
studio: 'NocturnForge'
period: '2025–2026'
art: '/media/cargo-key-art.svg'
summary: 'Open-world cargo simulator, founded, built, and shipped solo on Steam.'
order: 1
roleLine: 'NocturnForge · Founder & Lead, solo-shipped on Steam'
chips: ['Unity', 'C#', 'Addressables']
trailer: 'tCI396HyhbQ'
tech:
  engine: 'Unity'
  language: 'C#'
  networking: '—'
  keyLibs: 'Addressables, custom DI container'
  platform: 'PC (Steam)'
  teamSize: '1 — solo-shipped'
  role: 'Founder & Lead: all systems, tools, and release'
---

## What it is

An open-world cargo simulation game for PC, founded, built, and shipped solo on
Steam under NocturnForge. A grid-based streaming world with procedural roads,
where the delivery loop — packages, inventory, vehicles, characters — runs on
fully data-driven systems.

## What I built

### Architecture

- **Core → Systems → Gameplay layering** with composition-based design, and a
  modular codebase structured with assembly definitions for long-term scalability.
- **ID-based entity system** enabling decoupled, data-oriented gameplay: entities
  are addressed by stable IDs rather than object references, so simulation state
  stays consistent as the world streams in and out.
- **Custom DI container**, logging, and data-driven configuration systems.

### World & performance

- **Grid-based open-world streaming** built on Addressables, with floating-point
  precision handling and chunking.
- **CPU and rendering optimization**: batching, SetPass reduction, LODs,
  lighting, and continuous profiling.

### Gameplay & AI

- Core gameplay systems: **inventory, packages, delivery, character customization**.
- **IK-driven interaction system** for dynamic hand placement and interaction.
- **AI with FSM and Behavior Trees**, procedural roads, and navigation systems.

### Tools

- Editor tooling and config pipelines built for solo-scale iteration speed.

## The hard part

**Problem.** An open world breaks two assumptions Unity makes: that positions are
world-space floats (precision degrades with distance from the origin) and that a
gameplay entity is a loaded GameObject (streaming means most of the world isn't
loaded at any given moment).

**Constraint.** Team size: one. There was no budget to fight the engine — every
system had to work with Unity's lifecycle, not against it, and still ship.

**Solution.** The ID-based entity system separates simulation state from the loaded
representation. Entities exist as data whether or not their chunk is resident;
GameObjects become disposable views that attach when a chunk streams in via
Addressables and detach when it unloads, with precision handled at the chunking
layer instead of raw world-space floats.

**Result.** The game shipped on Steam, built end-to-end by one engineer. The
ambient scene on this site — routes, streaming, deliveries — is a toy version of
these exact systems.
