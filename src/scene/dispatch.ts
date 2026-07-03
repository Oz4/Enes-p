// Click-to-dispatch: a bright streak routes from the click point through the
// network to a depot and pulses on arrival. Max 5 concurrent.

import * as THREE from 'three';
import { nearestNode, routePolyline, type Network } from './network';
import type { TrailSystem, TrailPalette } from './trails';

const MAX_CONCURRENT = 5;

interface Pulse {
  mesh: THREE.Mesh;
  age: number;
}

export class Dispatcher {
  private net: Network;
  private trails: TrailSystem;
  private palette: TrailPalette;
  private scene: THREE.Scene;
  private pulses: Pulse[] = [];
  private pulseGeo = new THREE.RingGeometry(0.9, 1.15, 40);
  private inFlight = 0;
  total = 0;

  constructor(scene: THREE.Scene, net: Network, trails: TrailSystem, palette: TrailPalette) {
    this.scene = scene;
    this.net = net;
    this.trails = trails;
    this.palette = palette;
  }

  /** Dispatch from a world-space ground point. Returns true if launched. */
  dispatch(point: THREE.Vector3): boolean {
    if (this.inFlight >= MAX_CONCURRENT || !this.net.depots.length) return false;
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
      const launched = this.trails.launch(poly, {
        speed: 46,
        color: this.palette.amber,
        intensity: 1.9,
        headSize: 2.6,
        onArrive: () => {
          this.inFlight--;
          this.spawnPulse(arriveAt);
        },
      });
      if (launched) {
        this.inFlight++;
        this.total++;
        return true;
      }
      return false;
    }
    return false;
  }

  private spawnPulse(at: THREE.Vector3): void {
    const mat = new THREE.MeshBasicMaterial({
      color: this.palette.amber,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(this.pulseGeo, mat);
    mesh.position.copy(at).setY(0.4);
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this.pulses.push({ mesh, age: 0 });
  }

  update(dt: number): void {
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const p = this.pulses[i] as Pulse;
      p.age += dt;
      const t = p.age / 0.9;
      if (t >= 1) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.pulses.splice(i, 1);
      } else {
        const s = 1 + t * 7;
        p.mesh.scale.setScalar(s);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - t) * (1 - t);
      }
    }
  }
}
