import { lazy, Suspense, useEffect } from "react";
import Lenis from "lenis";
import { SceneText } from "@/sections/Film/SceneText";
import { QualificationForm } from "@/sections/Contact/QualificationForm";
import { reducedMotion, time } from "@/session";

const GlobeStageLazy = lazy(() =>
  import("@/components/GlobeStage/GlobeStage").then((m) => ({ default: m.GlobeStage }))
);

/** Smooth scroll drives film progress (scroll = time). */
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

const NAV = [
  { label: "The System", at: 0.185 },
  { label: "The Instrument", at: 0.38 },
  { label: "The Platform", at: 0.66 },
  { label: "The Single Route", at: 0.88 },
];

function goTo(p: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: Math.max(0, p * max), behavior: "smooth" });
}

export default function App() {
  useScrollDriver();

  return (
    <>
      <Suspense fallback={null}>
        <GlobeStageLazy />
      </Suspense>

      {/* Top nav — one label throughout. */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-6 px-6 md:px-10 h-[var(--nav-h)] border-b border-akal-hairline/40 bg-akal-ground/40 backdrop-blur-md">
        <button onClick={() => goTo(0)} className="flex items-center gap-3">
          <span className="font-display font-semibold tracking-tight">AKAL</span>
        </button>
        <nav className="hidden md:flex items-center gap-6 mono text-akal-muted">
          {NAV.map((n) => (
            <button key={n.label} onClick={() => goTo(n.at)} className="hover:text-akal-ink">
              {n.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => goTo(0.97)}
          className="mono inline-flex items-center gap-2 rounded-full border border-akal-hairline px-4 py-2 text-akal-accent hover:border-akal-accent/60 hover:text-akal-ink"
        >
          Talk to us
        </button>
      </header>

      {/* The film — one tall track the camera travels; copy anchors to scene beats. */}
      <div className="film-track relative" style={{ height: "1000vh" }}>
        {/* The World */}
        <SceneText at={0.025}>
          <p className="mono mb-5 text-akal-accent">AKAL — the acquisition operating system</p>
          <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.03em] md:text-7xl">
            The infrastructure for<br />customer acquisition.
          </h1>
          <p className="mt-6 max-w-md text-lg text-akal-muted">
            Opportunity is a field of moving points. AKAL qualifies, routes, and delivers it.
          </p>
        </SceneText>

        {/* The System */}
        <SceneText at={0.185} align="right">
          <p className="mono mb-3 text-akal-muted">// The System — today</p>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-5xl max-w-xl">
            Premium lead generation, delivered live.
          </h2>
        </SceneText>

        {/* The Instrument */}
        <SceneText at={0.38}>
          <p className="mono mb-3 text-akal-muted">// The Instrument</p>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-5xl">Qualify. Route. Deliver.</h2>
          <p className="mt-4 max-w-sm text-akal-muted">
            Precision is the product. Dwell on a lead — it qualifies, forks into its futures, and routes.
          </p>
        </SceneText>

        {/* The Portal */}
        <SceneText at={0.525} align="center" maxW="40rem">
          <h2 className="text-4xl font-semibold tracking-[-0.03em] md:text-6xl">Inside the operating core.</h2>
        </SceneText>

        {/* The Platform */}
        <SceneText at={0.66} align="right">
          <p className="mono mb-3 text-akal-muted">// The Platform — what comes next</p>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-5xl max-w-xl">
            Lead generation is the first layer.
          </h2>
        </SceneText>

        {/* The Hidden Layer */}
        <SceneText at={0.775}>
          <p className="mono mb-3 text-akal-muted">// The Hidden Layer</p>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-5xl">There is more beneath the surface.</h2>
        </SceneText>

        {/* The Single Route */}
        <SceneText at={0.88} align="center" maxW="38rem">
          <h2 className="text-4xl font-semibold tracking-[-0.03em] md:text-6xl">
            Everything resolves to<br />one connection.
          </h2>
        </SceneText>

        {/* The Invitation */}
        <SceneText at={0.955} align="left" maxW="34rem">
          <p className="mono mb-3 text-akal-muted">// The Invitation</p>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] md:text-5xl">We build experiences like this.</h2>
          <p className="mt-3 text-akal-muted">The world has resolved to one route — yours.</p>
          <div className="mt-10">
            <QualificationForm />
          </div>
        </SceneText>

        {/* Footer */}
        <div className="absolute bottom-8 inset-x-0 px-6 md:px-10 flex items-center justify-between mono text-akal-muted/70 text-xs">
          <span>AKAL · the acquisition operating system</span>
          <span>© AKAL.</span>
        </div>
      </div>
    </>
  );
}
