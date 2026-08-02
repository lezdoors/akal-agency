import { lazy, Suspense, useEffect } from "react";
import Lenis from "lenis";
import { Nav } from "@/sections/Nav/Nav";
import { Hero } from "@/sections/Hero/Hero";
import { Chapter } from "@/sections/Chapter/Chapter";
import { Invitation } from "@/sections/Invitation/Invitation";
import { Footer } from "@/sections/Footer/Footer";
import site from "@/config/site";
import { reducedMotion, time } from "@/session";

/**
 * The globe (and its three.js runtime) is code-split so the page shell paints
 * immediately and the procedural world mounts just after first paint — no
 * WebGL download blocks the content.
 */
const GlobeStage = lazy(() =>
  import("@/components/GlobeStage/GlobeStage").then((m) => ({
    default: m.GlobeStage,
  }))
);

/**
 * Smooth scroll drives the world: each frame Lenis advances the shared clock's
 * live progress so the globe turns as the visitor reads the chapters. Skip
 * entirely under reduced motion (native scroll only).
 */
function useScrollDriver() {
  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      time.setProgress(lenis.progress);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
}

export default function App() {
  useScrollDriver();

  return (
    <>
      {/* One living world, fixed behind everything. */}
      <Suspense fallback={null}>
        <GlobeStage />
      </Suspense>

      <div className="stage-content">
        <Nav />

        <main>
          <Hero />
          <Chapter block={site.system} id="system" />
          <Chapter block={site.instrument} id="instrument" />
          <Chapter block={site.platform} id="platform" />
          <Chapter block={site.route} id="route" />
          <Invitation />
        </main>

        <Footer />
      </div>
    </>
  );
}
