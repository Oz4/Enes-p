// Click-to-dispatch: a bright streak routes from the click point through the
// network to a depot and pulses on arrival. No concurrency cap — a token
// bucket allows 2 dispatches/second (extra clicks drop silently) and every
// object involved is pooled, so rapid clicking never allocates.

import * as THREE from 'three';
import { nearestNode, routePolyline, type Network } from './network';
import type { TrailSystem, TrailPalette } from './trails';

const RATE_PER_SECOND = 2;
const BUCKET_CAP = 2;
const PULSE_POOL = 12;
const PULSE_LIFE = 0.9;

interface Pulse {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  age: number;
  active: boolean;
}

export class Dispatcher {
  private net: Network;
  private trails: TrailSystem;
  private palette: TrailPalette;
  private pulses: Pulse[] = [];
  private tokens = BUCKET_CAP;
  total = 0;

  constructor(scene: THREE.Scene, net: Network, trails: TrailSystem, palette: TrailPalette) {
    this.net = net;
    this.trails = trails;
    this.palette = palette;
    // Pre-allocate the pulse pool: shared geometry, per-pulse material
    // (opacity animates independently), all parked invisible in the scene.
    const geo = new THREE.RingGeometry(0.9, 1.15, 40);
    for (let i = 0; i < PULSE_POOL; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: palette.cyan,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;
      scene.add(mesh);
      this.pulses.push({ mesh, material, age: 0, active: false });
    }
  }

  /**
   * Dispatch from a world-space ground point. Rate-limited to 2/s; within
   * budget the cyan pulse fires at the click point immediately, before the
   * streak departs. Returns true when the click was accepted.
   */
  dispatch(point: THREE.Vector3): boolean {
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    this.total++;
    this.spawnPulse(point); // instant feedback, no waiting on routing

    const from = nearestNode(this.net, point);
    // farthest depots make the better show — pick among the top half
    const ranked = [...this.net.depots]
      .filter((d) => d !== from)
      .sort(
        (a, b) =>
          this.net.nodes[b]!.distanceTo(this.net.nodes[from]!) -
          this.net.nodes[a]!.distanceTo(this.net.nodes[from]!),
      );
    for (const depot of ranked.slice(0, Math.max(1, ranked.length >> 1))) {
      const poly = routePolyline(this.net, from, depot);
      if (!poly) continue;
      const arriveAt = poly[poly.length - 1]!.clone();
      this.trails.launch(poly, {
        speed: 46,
        color: this.palette.amber,
        intensity: 1.9,
        headSize: 2.6,
        steal: true,
        onArrive: () => this.spawnPulse(arriveAt),
      });
      return true;
    }
    return true; // no route found, but the click was accepted and pulsed
  }

  private spawnPulse(at: THREE.Vector3): void {
    let pulse = this.pulses.find((p) => !p.active);
    if (!pulse) {
      // pool exhausted: recycle the oldest
      pulse = this.pulses[0] as Pulse;
      for (const p of this.pulses) if (p.age > pulse.age) pulse = p;
    }
    pulse.active = true;
    pulse.age = 0;
    pulse.mesh.position.copy(at).setY(0.4);
    pulse.mesh.scale.setScalar(1);
    pulse.mesh.visible = true;
    pulse.material.opacity = 0.9;
  }

  update(dt: number): void {
    this.tokens = Math.min(BUCKET_CAP, this.tokens + dt * RATE_PER_SECOND);
    for (const p of this.pulses) {
      if (!p.active) continue;
      p.age += dt;
      const t = p.age / PULSE_LIFE;
      if (t >= 1) {
        p.active = false;
        p.mesh.visible = false;
      } else {
        p.mesh.scale.setScalar(1 + t * 7);
        p.material.opacity = 0.9 * (1 - t) * (1 - t);
      }
    }
  }
}
