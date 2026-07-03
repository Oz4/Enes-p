// The profiler bar reports REAL page stats — it is honest by design
// (and self-refuting if the site is ever slow).

export class Profiler {
  private el: HTMLElement;
  private textEl: HTMLElement;
  private fps = 60;
  private acc = 0;
  private jsKb = 0;
  private override: string | null = null;

  constructor(el: HTMLElement, textEl: HTMLElement) {
    this.el = el;
    this.textEl = textEl;
    this.measureJs();
  }

  private measureJs(): void {
    try {
      let bytes = 0;
      for (const entry of performance.getEntriesByType('resource') as PerformanceResourceTiming[]) {
        if (entry.name.endsWith('.js') || entry.initiatorType === 'script') {
          bytes += entry.transferSize || entry.encodedBodySize || 0;
        }
      }
      this.jsKb = bytes / 1024;
    } catch {
      this.jsKb = 0;
    }
  }

  show(): void {
    this.el.hidden = false;
  }

  setOverride(text: string | null): void {
    this.override = text;
    if (text) this.textEl.textContent = text;
  }

  tick(dt: number): void {
    this.fps += (1 / Math.max(dt, 0.001) - this.fps) * 0.05;
    this.acc += dt;
    if (this.acc < 0.5) return;
    this.acc = 0;
    if (this.jsKb === 0) this.measureJs();
  }

  render(agents: number, loaded: number, total: number): void {
    if (this.override) return;
    const kb = this.jsKb > 0 ? this.jsKb.toFixed(1) + 'kb' : '—';
    this.textEl.textContent =
      'FPS ' + Math.round(this.fps) + ' · agents ' + agents + ' · chunks ' + loaded + '/' + total + ' · JS ' + kb;
  }

  renderStatic(agents: number, loaded: number, total: number): void {
    this.textEl.textContent =
      'paused (reduced motion) · agents ' + agents + ' · chunks ' + loaded + '/' + total;
  }
}
