---
title: 'Highstreet Market'
studio: 'Highstreet'
period: '2023–2025'
art: '/media/highstreet-key-art.svg'
summary: 'Multiplayer VR/PC physics interaction and combat systems as Senior Unity Engineer.'
order: 2
roleLine: 'Senior Unity Engineer · VR multiplayer physics'
chips: ['Unity', 'VR', 'Multiplayer']
trailer: 'O2W0N3uKXmo'
tech:
  engine: 'Unity'
  language: 'C#'
  networking: 'Client-server, replicated physics objects'
  keyLibs: 'DOTS/ECS, Jobs + Burst'
  platform: 'VR / PC'
  teamSize: 'Remote team — BC, Canada'
  role: 'Senior Unity Engineer — physics & combat systems'
---

## What it is

A released multiplayer VR/PC project where players grab, equip, and fight with
physics-simulated objects over the network. I owned physics-driven interaction
and combat as Senior Unity Engineer (Jul 2023 – Sep 2025, remote).

## What I built

### Physics & interaction

- **Full-body IK-based interaction systems**: grabbing, equipping, and
  wearable-to-weapon transformations for immersive VR gameplay.
- **Custom physics joint/constraint handling** that stabilizes handheld objects
  and eliminates the latency-induced jitter default physics produces.
- **Modular, component-driven combat system** built on physics-based interaction.

### Multiplayer & performance

- Developed and maintained **live multiplayer VR systems**; profiling, debugging,
  and performance optimization with Unity's tooling.
- Worked across **GameObject and ECS/DOTS**, using **Jobs + Burst** for
  performance-critical systems.

### Engineering practice

- Built **reusable ECS testing infrastructure** — automated world setup and
  system-level unit testing.
- **Mentored developers** on architecture and testing practices.

## The hard part

**Problem.** A handheld object in networked VR is fought over by three
authorities: the local player's hand, the physics engine, and the network state.
With latency in the loop, default physics makes held objects visibly jitter —
and in VR, jitter on something in your own hand is instantly nauseating and
breaks the entire illusion.

**Constraint.** The fix couldn't just be smoothing: combat needs held objects to
respond crisply, and multiplayer needs both players to agree about hits.

**Solution.** Custom joint and constraint handling for held objects, replacing
the default physics behavior so the hand-object relationship resolves locally
and stays stable while network corrections are absorbed where the player can't
perceive them.

**Result.** Latency-induced jitter on handheld objects was eliminated, keeping
VR combat physical and believable over the network on a live, shipped title.
