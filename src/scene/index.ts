// "Night Delivery Network" — the V2 background scene.
// An open-world city at night from above; long-exposure delivery trails.
// Decoration only: aria-hidden container, lazy-loaded, never gates content.

import * as THREE from 'three';
import { buildNetwork, wanderPolyline, CELL, COLS, ROWS } from './network';
import { TrailSystem, type TrailPalette } from './trails';
import { Dispatcher } from './dispatch';
import type { PostFX } from './postfx';

const DPR_CAP = 1.5;

function cssColor(name: string, fallback: string): THREE.Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

export function initScene(root: HTMLElement): void {
  const isMobile = matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false });
  renderer.setClearColor(new THREE.Color('#060608'), 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
  renderer.setSize(window.innerWidth, window.innerHeight);
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(new THREE.Color('#060608'), 0.0105);

  // Camera rig: drift + mouse parallax (≤ ~2°) applied to the rig, not the camera
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 1, 400);
  const rig = new THREE.Group();
  camera.position.set(0, 74, 52);
  camera.lookAt(0, 0, -6);
  rig.add(camera);
  scene.add(rig);

  const palette: TrailPalette = {
    amber: cssColor('--trail-amber', '#ffb454'),
    cyan: cssColor('--neon-cyan', '#22d3ee'),
  };
  const violet = cssColor('--neon-violet', '#8b5cf6');

  // --- City ---
  const net = buildNetwork(((Math.random() * 0xffff) | 0) + 1);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(COLS * CELL * 1.6, ROWS * CELL * 1.8),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#08080d') }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  scene.add(ground);

  const grid = new THREE.GridHelper(COLS * CELL * 1.5, Math.round(COLS * 1.5), violet, violet);
  (grid.material as THREE.Material & { opacity: number }).opacity = 0.06;
  (grid.material as THREE.Material).transparent = true;
  grid.position.y = -0.1;
  scene.add(grid);

  const roadGeo = new THREE.BufferGeometry().setFromPoints(net.roadSegments);
  const roads = new THREE.LineSegments(
    roadGeo,
    new THREE.LineBasicMaterial({ color: violet, transparent: true, opacity: 0.12 }),
  );
  roads.position.y = 0.05;
  scene.add(roads);

  // Dark blocks between roads — silhouette skyline for parallax depth
  const blockCount = isMobile ? 90 : 220;
  const blocks = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: new THREE.Color('#0a0a10') }),
    blockCount,
  );
  const m = new THREE.Matrix4();
  // One merged line buffer for every block's rim: dark volumes with thin
  // emissive edges. Vertex colors make the top rectangle read brighter.
  const edgePos: number[] = [];
  const edgeCol: number[] = [];
  const rimLo = violet.clone().multiplyScalar(0.45);
  const rimHi = violet.clone();
  const pushEdge = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, c: THREE.Color) => {
    edgePos.push(ax, ay, az, bx, by, bz);
    edgeCol.push(c.r, c.g, c.b, c.r, c.g, c.b);
  };
  for (let i = 0; i < blockCount; i++) {
    const cx = Math.random() * COLS * CELL - (COLS * CELL) / 2;
    const cz = Math.random() * ROWS * CELL - (ROWS * CELL) / 2;
    const w = 2.5 + Math.random() * 5;
    const h = 1 + Math.random() * Math.random() * 9;
    const d = 2.5 + Math.random() * 5;
    m.makeScale(w, h, d);
    m.setPosition(cx, h / 2 - 0.2, cz);
    blocks.setMatrixAt(i, m);
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const z0 = cz - d / 2;
    const z1 = cz + d / 2;
    const yTop = h - 0.2;
    // top rectangle — the lit rim
    pushEdge(x0, yTop, z0, x1, yTop, z0, rimHi);
    pushEdge(x1, yTop, z0, x1, yTop, z1, rimHi);
    pushEdge(x1, yTop, z1, x0, yTop, z1, rimHi);
    pushEdge(x0, yTop, z1, x0, yTop, z0, rimHi);
    // vertical corners — dimmer
    pushEdge(x0, -0.2, z0, x0, yTop, z0, rimLo);
    pushEdge(x1, -0.2, z0, x1, yTop, z0, rimLo);
    pushEdge(x1, -0.2, z1, x1, yTop, z1, rimLo);
    pushEdge(x0, -0.2, z1, x0, yTop, z1, rimLo);
  }
  scene.add(blocks);
  const rimGeo = new THREE.BufferGeometry();
  rimGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePos, 3));
  rimGeo.setAttribute('color', new THREE.Float32BufferAttribute(edgeCol, 3));
  const rims = new THREE.LineSegments(
    rimGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.11 }),
  );
  scene.add(rims);

  // Depot markers: small glowing rings
  const depotGeo = new THREE.RingGeometry(1.1, 1.5, 32);
  const depotMat = new THREE.MeshBasicMaterial({
    color: violet,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const d of net.depots) {
    const ring = new THREE.Mesh(depotGeo, depotMat);
    ring.position.copy(net.nodes[d] as THREE.Vector3).setY(0.3);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
  }

  // --- Trails ---
  const ambientCount = isMobile ? 10 : 22;
  const trails = new TrailSystem(ambientCount + 5);
  scene.add(trails.points);
  const dispatcher = new Dispatcher(scene, net, trails, palette);

  function launchAmbient(): void {
    const poly = wanderPolyline(net, 6 + ((Math.random() * 8) | 0));
    if (!poly) return;
    trails.launch(poly, {
      speed: 9 + Math.random() * 10,
      color: palette.amber,
      intensity: 0.7 + Math.random() * 0.4,
      headSize: 1.1 + Math.random() * 0.6,
    });
  }
  for (let i = 0; i < ambientCount; i++) launchAmbient();

  // --- Post FX (desktop only) ---
  let post: PostFX | null = null;
  if (!isMobile) {
    import('./postfx').then(({ createPostFX }) => {
      post = createPostFX(renderer, scene, camera, innerWidth, innerHeight);
    });
  }

  // --- Scrim coupling: the page dims the scene on scroll; the scene sheds
  // work while hidden and only accepts dispatch clicks over the hero. ---
  let scrimO = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--scrim-o'),
  ) || 0;
  window.addEventListener('scrimchange', (e) => {
    scrimO = (e as CustomEvent<number>).detail;
  });

  // --- Interaction ---
  const raycaster = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();

  window.addEventListener('pointerdown', (e) => {
    // Dispatch is a hero-moment interaction: once the scrim is up, background
    // clicks belong to the document, not the scene.
    if (scrimO >= 0.2) return;
    // Never steal clicks meant for real UI
    const el = e.target instanceof Element ? e.target : null;
    if (el?.closest('a, button, input, textarea, select, video, iframe, [role="dialog"], nav, summary')) {
      return;
    }
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(groundPlane, hit)) dispatcher.dispatch(hit);
  });

  let mx = 0;
  let my = 0;
  if (matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => {
      mx = (e.clientX / innerWidth) * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
    });
  }

  // --- Lifecycle ---
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      post?.resize(innerWidth, innerHeight);
    }, 200);
  });

  const netLine = document.getElementById('net-line');
  let fps = 60;
  let netLineTimer = 0;

  const clock = new THREE.Clock();
  let raf = 0;

  function frame(): void {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // ambient drift + parallax (2° max, eased)
    rig.rotation.y += (mx * 0.035 + Math.sin(t * 0.05) * 0.02 - rig.rotation.y) * 0.04;
    rig.rotation.x += (-my * 0.02 + Math.cos(t * 0.04) * 0.012 - rig.rotation.x) * 0.04;

    // keep the network busy — at half tempo (and no bloom) while the scrim
    // has the scene mostly hidden
    const dimmed = scrimO >= 0.75;
    if (trails.activeCount() < ambientCount && Math.random() < (dimmed ? 0.03 : 0.06)) {
      launchAmbient();
    }

    trails.update(dt);
    dispatcher.update(dt);
    if (post && !dimmed) post.render();
    else renderer.render(scene, camera);

    fps += (1 / Math.max(dt, 0.001) - fps) * 0.05;
    netLineTimer += dt;
    if (netLine && netLineTimer > 1) {
      netLineTimer = 0;
      netLine.textContent = `network online · ${Math.round(fps)} fps · trails ${trails.activeCount()} · deliveries ${dispatcher.total}`;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      clock.stop();
    } else {
      clock.start();
      frame();
    }
  });

  document.documentElement.classList.add('scene-on');
  frame();
}
