// Procedural night-city route network on the ground plane.
// Deterministic per-seed: hashed edges between jittered cell nodes,
// L-shaped elbows for the city-block look.

import * as THREE from 'three';

export const CELL = 14;
export const COLS = 22;
export const ROWS = 15;

function hash2(x: number, y: number, salt: number): number {
  let h = (salt ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export interface NetworkEdge {
  to: number;
  /** polyline from this node to `to`, including the elbow */
  poly: THREE.Vector3[];
}

export interface Network {
  nodes: THREE.Vector3[];
  adjacency: NetworkEdge[][];
  depots: number[];
  roadSegments: THREE.Vector3[]; // pairs for LineSegments
  seed: number;
}

export function buildNetwork(seed: number): Network {
  const nodes: THREE.Vector3[] = [];
  const idx = (cx: number, cy: number) => cy * COLS + cx;

  for (let cy = 0; cy < ROWS; cy++) {
    for (let cx = 0; cx < COLS; cx++) {
      const jx = (hash2(cx, cy, seed ^ 0xa11ce) - 0.5) * CELL * 0.4;
      const jz = (hash2(cx, cy, seed ^ 0xb0b) - 0.5) * CELL * 0.4;
      nodes.push(
        new THREE.Vector3(
          (cx - (COLS - 1) / 2) * CELL + jx,
          0,
          (cy - (ROWS - 1) / 2) * CELL + jz,
        ),
      );
    }
  }

  const adjacency: NetworkEdge[][] = nodes.map(() => []);
  const roadSegments: THREE.Vector3[] = [];

  const connect = (a: number, b: number, horizontal: boolean) => {
    const pa = nodes[a] as THREE.Vector3;
    const pb = nodes[b] as THREE.Vector3;
    // L-shape: horizontal edges run x first, vertical run z first
    const elbow = horizontal
      ? new THREE.Vector3(pb.x, 0, pa.z)
      : new THREE.Vector3(pa.x, 0, pb.z);
    adjacency[a]!.push({ to: b, poly: [pa.clone(), elbow.clone(), pb.clone()] });
    adjacency[b]!.push({ to: a, poly: [pb.clone(), elbow.clone(), pa.clone()] });
    roadSegments.push(pa.clone(), elbow.clone(), elbow.clone(), pb.clone());
  };

  for (let cy = 0; cy < ROWS; cy++) {
    for (let cx = 0; cx < COLS; cx++) {
      if (cx + 1 < COLS && hash2(cx * 2 + 1, cy, seed) < 0.7) {
        connect(idx(cx, cy), idx(cx + 1, cy), true);
      }
      if (cy + 1 < ROWS && hash2(cx * 2, cy + 1, seed) < 0.7) {
        connect(idx(cx, cy), idx(cx, cy + 1), false);
      }
    }
  }

  // Depots: greedy max-min spread over connected nodes.
  const connected = nodes.map((_, i) => i).filter((i) => adjacency[i]!.length >= 2);
  const depots: number[] = [];
  if (connected.length) {
    depots.push(connected[Math.floor(hash2(1, 2, seed) * connected.length)] as number);
    while (depots.length < 6 && depots.length < connected.length) {
      let best = connected[0] as number;
      let bestScore = -1;
      for (const c of connected) {
        if (depots.includes(c)) continue;
        let score = Infinity;
        for (const d of depots) {
          score = Math.min(score, nodes[c]!.distanceTo(nodes[d] as THREE.Vector3));
        }
        if (score > bestScore) {
          bestScore = score;
          best = c;
        }
      }
      depots.push(best);
    }
  }

  return { nodes, adjacency, depots, roadSegments, seed };
}

export function nearestNode(net: Network, point: THREE.Vector3): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < net.nodes.length; i++) {
    const d = net.nodes[i]!.distanceTo(point);
    if (d < bestDist && net.adjacency[i]!.length > 0) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/** BFS shortest hop route; returns the stitched polyline or null. */
export function routePolyline(net: Network, from: number, to: number): THREE.Vector3[] | null {
  if (from === to) return null;
  const prev = new Map<number, { node: number; edge: NetworkEdge }>();
  const seen = new Set<number>([from]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift() as number;
    for (const edge of net.adjacency[cur]!) {
      if (seen.has(edge.to)) continue;
      seen.add(edge.to);
      prev.set(edge.to, { node: cur, edge });
      if (edge.to === to) {
        const pts: THREE.Vector3[] = [];
        let walk = to;
        const legs: NetworkEdge[] = [];
        while (walk !== from) {
          const p = prev.get(walk)!;
          legs.unshift(p.edge);
          walk = p.node;
        }
        for (const leg of legs) {
          for (const p of leg.poly) {
            if (!pts.length || pts[pts.length - 1]!.distanceToSquared(p) > 0.001) {
              pts.push(p);
            }
          }
        }
        return pts;
      }
      queue.push(edge.to);
    }
  }
  return null;
}

/** Random walk polyline for ambient trails. */
export function wanderPolyline(net: Network, hops: number): THREE.Vector3[] | null {
  // Bias starts toward the center so the hero framing always has trails in it
  let start = Math.floor(Math.random() * net.nodes.length);
  const spanX = (COLS * CELL) / 2;
  const spanZ = (ROWS * CELL) / 2;
  for (let tries = 0; tries < 3; tries++) {
    const p = net.nodes[start] as THREE.Vector3;
    if (Math.abs(p.x) < spanX * 0.55 && Math.abs(p.z) < spanZ * 0.6) break;
    start = Math.floor(Math.random() * net.nodes.length);
  }
  if (!net.adjacency[start]!.length) return null;
  const pts: THREE.Vector3[] = [];
  let cur = start;
  let cameFrom = -1;
  for (let i = 0; i < hops; i++) {
    const options = net.adjacency[cur]!.filter((e) => e.to !== cameFrom);
    const pick = (options.length ? options : net.adjacency[cur]!)[
      Math.floor(Math.random() * (options.length || net.adjacency[cur]!.length))
    ];
    if (!pick) break;
    for (const p of pick.poly) {
      if (!pts.length || pts[pts.length - 1]!.distanceToSquared(p) > 0.001) pts.push(p);
    }
    cameFrom = cur;
    cur = pick.to;
  }
  return pts.length > 1 ? pts : null;
}
