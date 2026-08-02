/** Frame-time measurer used by the diagnostics overlays and tier adaptor. */
export class FpsMeter {
  private frameAccum = 0;
  private frameCount = 0;
  private lastSample = 0;
  fps = 60;
  frameMs = 16.7;
  private readonly windowSec: number;

  constructor(windowSec = 0.5) {
    this.windowSec = windowSec;
    this.lastSample = performance.now();
  }

  /** Call once per rendered frame with an actual dt. */
  sample(dt: number): void {
    this.frameAccum += dt;
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastSample >= this.windowSec * 1000) {
      const realDt = (now - this.lastSample) / 1000;
      this.fps = this.frameCount / realDt;
      this.frameMs = (this.frameAccum / this.frameCount) * 1000;
      this.frameAccum = 0;
      this.frameCount = 0;
      this.lastSample = now;
    }
  }
}
