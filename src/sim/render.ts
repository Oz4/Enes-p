import { LOADED, UNLOADED, type Grid } from './chunks';
import { center, openSides, sidePolyline } from './roads';
import type { Fleet } from './agents';

// Colors are read from the design tokens at init — tokens.css stays the
// single source of truth even inside the canvas.
export interface Palette {
  line: string;
  signal: string;
}

export function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  return {
    line: style.getPropertyValue('--chunk-line').trim() || '#3a4148',
    signal: style.getPropertyValue('--signal').trim() || '#f5a623',
  };
}

export function draw(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  fleet: Fleet,
  pal: Palette,
  w: number,
  h: number,
): void {
  ctx.clearRect(0, 0, w, h);

  // Chunk outlines: unloaded = faint ghosts, loaded = settled grid.
  for (const c of grid.chunks) {
    const alpha = c.state === UNLOADED ? 0.14 : 0.14 + 0.22 * c.t;
    ctx.strokeStyle = pal.line;
    ctx.globalAlpha = alpha;
    ctx.strokeRect(c.x0 + 1.5, c.y0 + 1.5, grid.size - 3, grid.size - 3);
  }

  // Roads on loading/loaded chunks, revealed by load progress.
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  for (const c of grid.chunks) {
    if (c.state === UNLOADED || c.t <= 0) continue;
    ctx.strokeStyle = pal.line;
    ctx.globalAlpha = 0.85 * c.t;
    for (const side of openSides(grid, c)) {
      const pts = sidePolyline(grid, c, side);
      ctx.beginPath();
      ctx.moveTo((pts[0] as { x: number }).x, (pts[0] as { y: number }).y);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i] as { x: number; y: number };
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
  }

  // Depots: hollow amber squares at their junction.
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = pal.signal;
  ctx.lineWidth = 1.5;
  for (const d of fleet.depots) {
    if (d.state !== LOADED) continue;
    const p = center(grid, d);
    ctx.strokeRect(p.x - 5, p.y - 5, 10, 10);
  }

  // Agents: small amber rects oriented along their heading.
  ctx.fillStyle = pal.signal;
  for (const a of fleet.agents) {
    if (a.state === 'idle') continue;
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
}
