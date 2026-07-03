---
title: 'Highstreet Market'
studio: 'Highstreet'
period: '2023–2025'
art: '/media/highstreet-key-art.svg'
summary: 'VR multiplayer physics and combat systems as Senior Engineer.'
order: 2
roleLine: 'Senior Engineer · VR multiplayer physics'
chips: ['Unity', 'VR', 'Multiplayer']
trailer: 'O2W0N3uKXmo'
tech:
  engine: 'Unity'
  language: 'C#'
  networking: 'Client-server, replicated physics objects'
  keyLibs: '[placeholder — networking stack]'
  platform: 'VR'
  teamSize: '[placeholder]'
  role: 'Senior Engineer — physics & combat systems'
---

<!-- REVIEW(Enes): drafted from PLAN.md seeds — verify all specifics,
     fill the [placeholder] fields, and add real numbers. -->

## What it is

A VR multiplayer title where players grab, carry, and fight with physically
simulated objects over the network. I owned the physics interaction and combat
systems as Senior Engineer.

## What I built

### Physics & interaction

- **Custom joint and constraint handling** for objects held in players' hands —
  the layer between the physics engine and what a player's hands are doing.
- **VR interaction systems**: grabbing, holding, and manipulating networked
  physics objects.

### Multiplayer

- **Replication of physically simulated objects** between clients in a
  client-server model.
- Combat interactions that stay believable for both the attacker and the
  defender despite network latency.

## The hard part

**Problem.** A handheld object in networked VR is fought over by three
authorities: the local player's hand, the physics engine, and the network state.
With latency in the loop, naive approaches make held objects visibly jitter —
and in VR, jitter on something in your own hand is instantly nauseating and
breaks the entire illusion.

**Constraint.** The fix couldn't just be smoothing: combat needs held objects to
respond crisply, and multiplayer needs both players to agree about hits.

**Solution.** Custom joint/constraint handling for held objects, tuned so the
hand-object relationship is resolved locally and stays stable while network
corrections are absorbed where the player can't perceive them.

**Result.** Latency-induced jitter on handheld objects was eliminated, keeping
VR combat physical and believable over the network.
