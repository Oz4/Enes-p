import { createGrid, loadAll, loadedCount, updateChunks, type Grid } from './chunks';
import { chunkInUse, createFleet, ensureDepots, spawnAgents, updateAgents, type Fleet } from './agents';
import { draw, readPalette, type Palette } from './render';
import { Profiler } from './profiler';

// Device-scaled caps (PLAN.md §2 guardrails).
const MOBILE = () => window.innerWidth < 768;
const AGENT_CAP = () => (MOBILE() ? 6 : 16);
const DEPOTS = () => (MOBILE() ? 3 : 5);
const LOW_END = () => (navigator.hardwareConcurrency || 8) <= 4;

interface Sim {
  grid: Grid;
  fleet: Fleet;
}

export function initSim(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const pal: Palette = readPalette();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const barEl = document.getElementById('profiler');
  const barText = document.getElementById('profiler-text');
  const profiler = barEl && barText ? new Profiler(barEl, barText) : null;

  let w = 0;
  let h = 0;
  let sim: Sim = { grid: createGrid(1, 1, 1), fleet: createFleet(0) };

  function rebuild(): void {
    w = window.innerWidth;
    h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    sim = {
      grid: createGrid(w, h, ((Math.random() * 0xffffff) | 0) + 1),
      fleet: createFleet(AGENT_CAP()),
    };
  }

  rebuild();
  // Tell CSS the sim owns the background now (hero's static grid fades out).
  document.documentElement.classList.add('sim-on');
  profiler?.show();

  // Footer easter egg (PLAN.md §3.8).
  const footer = document.querySelector('footer');
  if (footer && profiler && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      profiler.setOverride(
        entries.some((e) => e.isIntersecting)
          ? '-- simulation still running. thanks for scrolling. --'
          : null,
      );
    }).observe(footer);
  }

  if (reduced) {
    // One static frame: full world, agents parked at depots. No loop.
    loadAll(sim.grid);
    ensureDepots(sim.grid, sim.fleet, DEPOTS());
    spawnAgents(sim.grid, sim.fleet);
    canvas.style.opacity = '0.4';
    draw(ctx, sim.grid, sim.fleet, pal, w, h);
    profiler?.renderStatic(sim.fleet.agents.length, loadedCount(sim.grid), sim.grid.chunks.length);
    return;
  }

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(rebuild, 250);
  });

  let last = performance.now();
  let ramp = 0; // fade-in seconds

  function frame(now: number): void {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden) return;

    // Low-end devices: pause the sim once scrolled well past the hero.
    const scroll = window.scrollY;
    if (LOW_END() && scroll > h * 1.5) return;

    ramp = Math.min(ramp + dt, 1);
    // Strong behind the hero, faint once scrolled into the document.
    const target = Math.max(0.16, 0.5 - (scroll / h) * 0.34);
    canvas.style.opacity = (target * ramp).toFixed(3);

    updateChunks(sim.grid, dt, (c) => chunkInUse(sim.fleet, c));
    ensureDepots(sim.grid, sim.fleet, DEPOTS());
    spawnAgents(sim.grid, sim.fleet);
    updateAgents(sim.grid, sim.fleet, dt);
    draw(ctx!, sim.grid, sim.fleet, pal, w, h);

    if (profiler) {
      profiler.tick(dt);
      profiler.render(sim.fleet.agents.length, loadedCount(sim.grid), sim.grid.chunks.length);
    }
  }
  requestAnimationFrame(frame);
}
