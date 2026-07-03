// Long-exposure light trails: one shared additive Points buffer, each trail
// a moving head with a fading history tail. Additive blending gives fake
// glow even without bloom (that's the whole mobile strategy).

import * as THREE from 'three';

const TAIL = 14;

export interface TrailPalette {
  amber: THREE.Color;
  cyan: THREE.Color;
}

interface Trail {
  path: THREE.Vector3[];
  lengths: number[];
  total: number;
  dist: number;
  speed: number;
  color: THREE.Color;
  intensity: number;
  headSize: number;
  history: THREE.Vector3[];
  active: boolean;
  onArrive: (() => void) | null;
  /** launch order — lets the pool recycle the oldest when exhausted */
  seq: number;
}

export class TrailSystem {
  readonly points: THREE.Points;
  private trails: Trail[] = [];
  private capacity: number;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private alphas: Float32Array;
  private geometry: THREE.BufferGeometry;

  constructor(capacity: number) {
    this.capacity = capacity;
    const n = capacity * TAIL;
    this.positions = new Float32Array(n * 3);
    this.colors = new Float32Array(n * 3);
    this.sizes = new Float32Array(n);
    this.alphas = new Float32Array(n);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = aColor;
          vAlpha = aAlpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (240.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlpha;
          if (a < 0.003) discard;
          gl_FragColor = vec4(vColor * a, a);
        }
      `,
    });

    this.points = new THREE.Points(this.geometry, material);
    this.points.frustumCulled = false;

    for (let i = 0; i < capacity; i++) {
      this.trails.push({
        path: [],
        lengths: [],
        total: 0,
        dist: 0,
        speed: 1,
        color: new THREE.Color(),
        intensity: 1,
        headSize: 1,
        history: Array.from({ length: TAIL }, () => new THREE.Vector3(0, -50, 0)),
        active: false,
        onArrive: null,
        seq: 0,
      });
    }
  }

  private seqCounter = 0;

  /**
   * Returns false when no slot is free — unless `steal` is set, in which
   * case the oldest active trail is recycled (its arrival callback is
   * dropped). Never allocates.
   */
  launch(
    path: THREE.Vector3[],
    opts: {
      speed: number;
      color: THREE.Color;
      intensity?: number;
      headSize?: number;
      onArrive?: () => void;
      steal?: boolean;
    },
  ): boolean {
    let trail = this.trails.find((t) => !t.active);
    if (!trail && opts.steal) {
      for (const t of this.trails) {
        if (!trail || t.seq < trail.seq) trail = t;
      }
      if (trail) trail.onArrive = null;
    }
    if (!trail || path.length < 2) return false;
    trail.path = path;
    trail.lengths = [];
    trail.total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const l = path[i]!.distanceTo(path[i + 1] as THREE.Vector3);
      trail.lengths.push(l);
      trail.total += l;
    }
    trail.dist = 0;
    trail.speed = opts.speed;
    trail.color.copy(opts.color);
    trail.intensity = opts.intensity ?? 1;
    trail.headSize = opts.headSize ?? 1;
    trail.onArrive = opts.onArrive ?? null;
    const start = path[0] as THREE.Vector3;
    for (const h of trail.history) h.copy(start).setY(0.5);
    trail.seq = ++this.seqCounter;
    trail.active = true;
    return true;
  }

  activeCount(): number {
    return this.trails.reduce((n, t) => n + (t.active ? 1 : 0), 0);
  }

  update(dt: number): void {
    const head = new THREE.Vector3();
    for (let ti = 0; ti < this.trails.length; ti++) {
      const trail = this.trails[ti] as Trail;
      if (trail.active) {
        trail.dist += trail.speed * dt;
        if (trail.dist >= trail.total) {
          trail.active = false;
          trail.onArrive?.();
          trail.onArrive = null;
        } else {
          // locate head on the polyline
          let d = trail.dist;
          let seg = 0;
          while (seg < trail.lengths.length - 1 && d > (trail.lengths[seg] as number)) {
            d -= trail.lengths[seg] as number;
            seg++;
          }
          const a = trail.path[seg] as THREE.Vector3;
          const b = trail.path[seg + 1] as THREE.Vector3;
          const t = Math.min(d / ((trail.lengths[seg] as number) || 0.001), 1);
          head.lerpVectors(a, b, t).setY(0.5);
          // shift history ring
          const last = trail.history.pop() as THREE.Vector3;
          last.copy(head);
          trail.history.unshift(last);
        }
      }

      // write buffers (fade out inactive trails by sinking alpha)
      for (let k = 0; k < TAIL; k++) {
        const i = ti * TAIL + k;
        const p = trail.history[k] as THREE.Vector3;
        this.positions[i * 3] = p.x;
        this.positions[i * 3 + 1] = p.y;
        this.positions[i * 3 + 2] = p.z;
        const fade = 1 - k / TAIL;
        const alpha = trail.active ? fade * fade * 0.85 * trail.intensity : 0;
        this.alphas[i] = alpha;
        this.sizes[i] = trail.headSize * (0.55 + 0.45 * fade);
        this.colors[i * 3] = trail.color.r;
        this.colors[i * 3 + 1] = trail.color.g;
        this.colors[i * 3 + 2] = trail.color.b;
      }
    }
    this.geometry.attributes.position!.needsUpdate = true;
    this.geometry.attributes.aColor!.needsUpdate = true;
    this.geometry.attributes.aSize!.needsUpdate = true;
    this.geometry.attributes.aAlpha!.needsUpdate = true;
  }
}
