import { hash2 } from './rng';

export const UNLOADED = 0;
export const LOADING = 1;
export const LOADED = 2;

export interface Chunk {
  cx: number;
  cy: number;
  x0: number;
  y0: number;
  state: 0 | 1 | 2;
  /** load animation progress 0..1 */
  t: number;
  /** seconds until this chunk starts loading (initial stream-in / reload) */
  loadAt: number;
}

export interface Grid {
  cols: number;
  rows: number;
  size: number;
  seed: number;
  chunks: Chunk[];
  churnTimer: number;
}

const CHUNK_SIZE = 120;
const LOAD_ANIM = 0.45; // seconds

export function createGrid(w: number, h: number, seed: number): Grid {
  const size = CHUNK_SIZE;
  const cols = Math.ceil(w / size) + 1;
  const rows = Math.ceil(h / size) + 1;
  const chunks: Chunk[] = [];
  const midX = (cols - 1) / 2;
  const midY = (rows - 1) / 2;
  const maxDist = Math.hypot(midX, midY) || 1;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      // Stream in from the center outward — the page-load moment (≤ ~1.2s).
      const dist = Math.hypot(cx - midX, cy - midY) / maxDist;
      chunks.push({
        cx,
        cy,
        x0: cx * size - (cols * size - w) / 2,
        y0: cy * size - (rows * size - h) / 2,
        state: UNLOADED,
        t: 0,
        loadAt: dist * 0.8 + hash2(cx, cy, seed ^ 0x5eed) * 0.35,
      });
    }
  }
  return { cols, rows, size, seed, chunks, churnTimer: 3 };
}

export function chunkAt(grid: Grid, cx: number, cy: number): Chunk | null {
  if (cx < 0 || cy < 0 || cx >= grid.cols || cy >= grid.rows) return null;
  return grid.chunks[cy * grid.cols + cx] ?? null;
}

export function loadedCount(grid: Grid): number {
  let n = 0;
  for (const c of grid.chunks) if (c.state === LOADED) n++;
  return n;
}

/**
 * Advance streaming: timed initial load, then ambient churn — a random
 * loaded chunk (not protected) unloads and later streams back in.
 */
export function updateChunks(grid: Grid, dt: number, isProtected: (c: Chunk) => boolean): void {
  for (const c of grid.chunks) {
    if (c.state === UNLOADED) {
      c.loadAt -= dt;
      if (c.loadAt <= 0) c.state = LOADING;
    } else if (c.state === LOADING) {
      c.t = Math.min(1, c.t + dt / LOAD_ANIM);
      if (c.t >= 1) c.state = LOADED;
    }
  }

  grid.churnTimer -= dt;
  if (grid.churnTimer <= 0) {
    grid.churnTimer = 2.5 + Math.random() * 2.5;
    const candidates = grid.chunks.filter((c) => c.state === LOADED && !isProtected(c));
    if (candidates.length > grid.chunks.length * 0.5) {
      const victim = candidates[Math.floor(Math.random() * candidates.length)];
      if (victim) {
        victim.state = UNLOADED;
        victim.t = 0;
        victim.loadAt = 3 + Math.random() * 6;
      }
    }
  }
}

/** Force the whole grid to a fully loaded, settled state (reduced motion). */
export function loadAll(grid: Grid): void {
  for (const c of grid.chunks) {
    c.state = LOADED;
    c.t = 1;
  }
}
