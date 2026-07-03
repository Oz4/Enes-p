---
title: 'My Corp Cargo Simulator'
studio: 'NocturnForge'
period: '2025–2026'
summary: 'Open-world cargo simulator, designed, built, and shipped solo on Steam.'
tech:
  engine: 'Unity'
  language: 'C#'
  networking: '—'
  keyLibs: 'Addressables'
  platform: 'PC (Steam)'
  teamSize: '1 — solo-shipped'
  role: 'Lead: all systems, tools, and release'
---

<!-- REVIEW(Enes): technical narrative below is drafted from PLAN.md seeds.
     Verify specifics — especially the precision/streaming solution details —
     and add real numbers where they exist. -->

## What it is

An open-world cargo simulator for PC, designed, built, and shipped solo on Steam
under NocturnForge. A streaming world with a procedurally generated road network,
where delivery vehicles pathfind between depots to keep cargo moving.

## What I built

### Architecture

- **ID-based entity system.** Gameplay entities are addressed by stable IDs rather
  than object references, decoupling simulation data from loaded GameObjects. The
  world stays consistent as chunks load and unload around the player.
- **Data-oriented gameplay layer** on top of that entity system, keeping game logic
  independent of Unity's scene lifecycle.

### World & performance

- **Chunked world streaming** built on Addressables: chunks near the player load
  fully, distant ones stream in and out on demand.
- **Floating-point precision management** so physics and rendering stay stable at
  open-world distances from the origin.

### Gameplay & AI

- **Procedural road network generation** across the streamed world.
- **Delivery agents** driven by finite state machines (Idle → Pickup → Deliver),
  pathfinding along the road network between depots.

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
Addressables and detach when it unloads. That same separation keeps positions
manageable at world scale instead of relying on raw world-space floats.

**Result.** The game shipped on Steam, built end-to-end by one engineer. The
ambient simulation on this site — chunk streaming, procedural roads, delivery
agents — is a toy version of these exact systems.
