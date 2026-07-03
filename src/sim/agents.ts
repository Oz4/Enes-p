import { LOADED, type Chunk, type Grid } from './chunks';
import { center, openSides, route, type Pt } from './roads';

// FSM: idle (at depot) → pickup (routing to a depot) → deliver (routing to
// another) → idle. Pickup and deliver are the same movement with different
// labels — the loop is what matters visually.
export type AgentState = 'idle' | 'pickup' | 'deliver';

export interface Agent {
  x: number;
  y: number;
  angle: number;
  speed: number;
  state: AgentState;
  wait: number;
  path: Pt[];
  seg: number;
  segT: number;
  pathChunks: Set<string>;
  at: Chunk;
}

export interface Fleet {
  agents: Agent[];
  depots: Chunk[];
  cap: number;
}

export function createFleet(cap: number): Fleet {
  return { agents: [], depots: [], cap };
}

/** Pick depot chunks spread apart (greedy max-min) among loaded chunks. */
export function ensureDepots(grid: Grid, fleet: Fleet, want: number): void {
  fleet.depots = fleet.depots.filter((d) => d.state === LOADED);
  const eligible = grid.chunks.filter(
    (c) => c.state === LOADED && openSides(grid, c).length >= 2 && !fleet.depots.includes(c),
  );
  while (fleet.depots.length < want && eligible.length) {
    let best = 0;
    let bestScore = -1;
    for (let i = 0; i < eligible.length; i++) {
      const e = eligible[i] as Chunk;
      let score = Number.MAX_VALUE;
      for (const d of fleet.depots) {
        score = Math.min(score, Math.hypot(e.cx - d.cx, e.cy - d.cy));
      }
      if (fleet.depots.length === 0) score = Math.random();
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    fleet.depots.push(...eligible.splice(best, 1));
  }
}

function dispatch(grid: Grid, fleet: Fleet, agent: Agent): boolean {
  const targets = fleet.depots.filter((d) => d !== agent.at && d.state === LOADED);
  if (!targets.length) return false;
  const to = targets[Math.floor(Math.random() * targets.length)] as Chunk;
  const r = route(grid, agent.at, to);
  if (!r) return false;
  agent.path = r.pts;
  agent.pathChunks = new Set(r.chunks);
  agent.seg = 0;
  agent.segT = 0;
  agent.at = to;
  agent.state = agent.state === 'pickup' ? 'deliver' : 'pickup';
  return true;
}

export function spawnAgents(grid: Grid, fleet: Fleet): void {
  while (fleet.agents.length < fleet.cap && fleet.depots.length >= 2) {
    const home = fleet.depots[Math.floor(Math.random() * fleet.depots.length)] as Chunk;
    const p = center(grid, home);
    fleet.agents.push({
      x: p.x,
      y: p.y,
      angle: 0,
      speed: 32 + Math.random() * 26,
      state: 'idle',
      wait: Math.random() * 3,
      path: [],
      seg: 0,
      segT: 0,
      pathChunks: new Set(),
      at: home,
    });
  }
}

export function updateAgents(grid: Grid, fleet: Fleet, dt: number): void {
  for (const agent of fleet.agents) {
    if (agent.state === 'idle') {
      agent.wait -= dt;
      if (agent.wait <= 0 && !dispatch(grid, fleet, agent)) {
        agent.wait = 1 + Math.random() * 2; // no route yet — try again later
      }
      continue;
    }

    // Advance along the path; if the road under us streamed out, re-route.
    let travel = agent.speed * dt;
    while (travel > 0 && agent.seg < agent.path.length - 1) {
      const a = agent.path[agent.seg] as Pt;
      const b = agent.path[agent.seg + 1] as Pt;
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 0.001;
      const remain = (1 - agent.segT) * len;
      if (travel < remain) {
        agent.segT += travel / len;
        travel = 0;
      } else {
        travel -= remain;
        agent.seg++;
        agent.segT = 0;
      }
      agent.x = a.x + (b.x - a.x) * Math.min(agent.segT, 1);
      agent.y = a.y + (b.y - a.y) * Math.min(agent.segT, 1);
      if (len > 1) agent.angle = Math.atan2(b.y - a.y, b.x - a.x);
    }
    if (agent.seg >= agent.path.length - 1) {
      agent.state = 'idle';
      agent.wait = 0.8 + Math.random() * 2.2;
      agent.path = [];
      agent.pathChunks.clear();
    }
  }
}

/** Is this chunk part of any agent's active route (or a depot)? */
export function chunkInUse(fleet: Fleet, c: Chunk): boolean {
  if (fleet.depots.includes(c)) return true;
  const key = c.cx + ',' + c.cy;
  for (const a of fleet.agents) if (a.pathChunks.has(key)) return true;
  return false;
}
