import { hash2 } from './rng';
import { LOADED, chunkAt, type Chunk, type Grid } from './chunks';

export type Side = 0 | 1 | 2 | 3; // N E S W
const OPPOSITE: Side[] = [2, 3, 0, 1];
const P_OPEN = 0.72;

export interface Pt {
  x: number;
  y: number;
}

/**
 * A shared edge between two chunks is open (has a road crossing) based on a
 * deterministic hash of the edge coordinate — both chunks always agree.
 */
export function sideOpen(grid: Grid, cx: number, cy: number, side: Side): boolean {
  // Normalize to the edge's own coordinate: horizontal edges keyed by the
  // chunk above, vertical edges by the chunk to the left.
  let ex = cx;
  let ey = cy;
  let vertical = 0;
  if (side === 0) {
    ey = cy; // edge above chunk (cx,cy)
  } else if (side === 2) {
    ey = cy + 1;
  } else if (side === 3) {
    vertical = 1;
  } else {
    vertical = 1;
    ex = cx + 1;
  }
  // Border edges of the grid stay closed so roads don't dead-end off-screen.
  if (vertical === 0 && (ey === 0 || ey >= grid.rows)) return false;
  if (vertical === 1 && (ex === 0 || ex >= grid.cols)) return false;
  return hash2(ex * 2 + vertical, ey, grid.seed) < P_OPEN;
}

/** Jittered junction point near the chunk center — every block looks unique. */
export function center(grid: Grid, c: Chunk): Pt {
  const s = grid.size;
  return {
    x: c.x0 + s * (0.5 + (hash2(c.cx, c.cy, grid.seed ^ 0xc0ffee) - 0.5) * 0.36),
    y: c.y0 + s * (0.5 + (hash2(c.cx, c.cy, grid.seed ^ 0xbeef) - 0.5) * 0.36),
  };
}

export function sideMid(grid: Grid, c: Chunk, side: Side): Pt {
  const s = grid.size;
  if (side === 0) return { x: c.x0 + s / 2, y: c.y0 };
  if (side === 2) return { x: c.x0 + s / 2, y: c.y0 + s };
  if (side === 3) return { x: c.x0, y: c.y0 + s / 2 };
  return { x: c.x0 + s, y: c.y0 + s / 2 };
}

/** Road polyline from an open side midpoint to the chunk junction (an L). */
export function sidePolyline(grid: Grid, c: Chunk, side: Side): Pt[] {
  const m = sideMid(grid, c, side);
  const j = center(grid, c);
  // N/S roads run vertically first; E/W run horizontally first.
  const elbow: Pt = side === 0 || side === 2 ? { x: m.x, y: j.y } : { x: j.x, y: m.y };
  return [m, elbow, j];
}

export function openSides(grid: Grid, c: Chunk): Side[] {
  const out: Side[] = [];
  for (let s = 0; s < 4; s++) if (sideOpen(grid, c.cx, c.cy, s as Side)) out.push(s as Side);
  return out;
}

function neighbor(grid: Grid, c: Chunk, side: Side): Chunk | null {
  const dx = side === 1 ? 1 : side === 3 ? -1 : 0;
  const dy = side === 2 ? 1 : side === 0 ? -1 : 0;
  return chunkAt(grid, c.cx + dx, c.cy + dy);
}

/**
 * BFS over loaded chunks through open shared edges; returns the pixel
 * polyline from `from`'s junction to `to`'s junction, or null if no route.
 */
export function route(grid: Grid, from: Chunk, to: Chunk): { pts: Pt[]; chunks: string[] } | null {
  if (from === to) return null;
  const key = (c: Chunk) => c.cx + ',' + c.cy;
  const prev = new Map<string, { c: Chunk; side: Side } | null>();
  prev.set(key(from), null);
  const queue: Chunk[] = [from];
  let found = false;
  while (queue.length && !found) {
    const cur = queue.shift() as Chunk;
    for (const s of openSides(grid, cur)) {
      const n = neighbor(grid, cur, s);
      if (!n || n.state !== LOADED || prev.has(key(n))) continue;
      prev.set(key(n), { c: cur, side: s });
      if (n === to) {
        found = true;
        break;
      }
      queue.push(n);
    }
  }
  if (!found) return null;

  // Walk back to collect the chunk path, then stitch side polylines.
  const hops: { c: Chunk; side: Side }[] = [];
  let cursor: Chunk = to;
  while (cursor !== from) {
    const p = prev.get(key(cursor));
    if (!p) return null;
    hops.unshift(p);
    cursor = p.c;
  }
  const pts: Pt[] = [];
  const chunks: string[] = [key(from)];
  let at = from;
  for (const hop of hops) {
    const exit = sidePolyline(grid, at, hop.side); // junction ← mid, reversed below
    pts.push(exit[2] as Pt, exit[1] as Pt, exit[0] as Pt);
    const next = neighbor(grid, at, hop.side) as Chunk;
    const enter = sidePolyline(grid, next, OPPOSITE[hop.side] as Side);
    pts.push(enter[1] as Pt, enter[2] as Pt);
    chunks.push(key(next));
    at = next;
  }
  return { pts, chunks };
}
