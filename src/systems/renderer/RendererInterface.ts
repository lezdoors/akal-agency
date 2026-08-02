/**
 * RendererInterface.
 *
 * WebGL2 is the guaranteed rendering path; WebGPU is progressive enhancement
 * behind this interface. Nothing in the app should reach for a concrete
 * Three renderer directly (other than the adapters in this folder).
 */
import type * as THREE from "three";

export type PerfTier = "high" | "mid" | "low" | "reduced";

export interface RenderStats {
  fps: number;
  frameMs: number;
  calls: number;
  triangles: number;
  geometries: number;
  shaders: number;
  jsMemMb: number;
}

export interface RendererInterface {
  readonly domElement: HTMLElement;
  readonly kind: "webgl" | "webgpu";
  setSize(width: number, height: number): void;
  setPixelRatio(ratio: number): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  stats(): RenderStats;
  dispose(): void;
}
