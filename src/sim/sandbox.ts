// Sandbox mode (PLAN.md §2, v1.1): the sim becomes an interactive toy —
// place roads, place depots, dispatch agents. No score, no fail state,
// and the CV is never gated behind it.

import { LOADED, chunkAt, type Chunk, type Grid } from './chunks';
import { spawnOne, type Fleet } from './agents';
import { edgeRef, sideMid, sideOpen, type Side } from './roads';

export type Tool = 'road' | 'depot' | 'agent';

export const SANDBOX_AGENT_CAP = 24;

function chunkUnder(grid: Grid, x: number, y: number): Chunk | null {
  const first = grid.chunks[0];
  if (!first) return null;
  const cx = Math.floor((x - first.x0) / grid.size);
  const cy = Math.floor((y - first.y0) / grid.size);
  return chunkAt(grid, cx, cy);
}

/** Toggle the road edge nearest to the click. Returns a hint for the panel. */
export function toggleRoad(grid: Grid, x: number, y: number): string {
  const c = chunkUnder(grid, x, y);
  if (!c) return 'no chunk there';
  let best: Side = 0;
  let bestDist = Infinity;
  for (let s = 0; s < 4; s++) {
    const m = sideMid(grid, c, s as Side);
    const d = Math.hypot(m.x - x, m.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = s as Side;
    }
  }
  const e = edgeRef(grid, c.cx, c.cy, best);
  if (e.border) return 'border edges stay closed';
  const open = !sideOpen(grid, c.cx, c.cy, best);
  grid.overrides.set(e.key, open);
  return open ? 'road segment placed' : 'road segment removed';
}

export function toggleDepot(grid: Grid, fleet: Fleet, x: number, y: number): string {
  const c = chunkUnder(grid, x, y);
  if (!c || c.state !== LOADED) return 'no loaded chunk there';
  const i = fleet.depots.indexOf(c);
  if (i >= 0) {
    fleet.depots.splice(i, 1);
    return 'depot removed';
  }
  fleet.depots.push(c);
  return 'depot placed';
}

export function spawnAgentAt(grid: Grid, fleet: Fleet, x: number, y: number): string {
  if (fleet.agents.length >= SANDBOX_AGENT_CAP) {
    return 'agent cap reached (' + SANDBOX_AGENT_CAP + ')';
  }
  if (fleet.depots.length === 0) return 'place a depot first';
  let home = fleet.depots[0] as Chunk;
  let bestDist = Infinity;
  for (const d of fleet.depots) {
    const dist = Math.hypot(d.x0 + grid.size / 2 - x, d.y0 + grid.size / 2 - y);
    if (dist < bestDist) {
      bestDist = dist;
      home = d;
    }
  }
  spawnOne(grid, fleet, home);
  return 'agent dispatched from nearest depot';
}
