import { createFileRoute } from "@tanstack/react-router";

import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
  component: Index,
});

const services = [
  {
    icon: "◇",
    title: "Websites & Landing Pages",
    description: "High-performance sites built to convert. From one-page launches to multi-section platforms, designed and developed in-house.",
  },
  {
    icon: "▽",
    title: "Creative & Video",
    description: "Advertising creative, brand films, and motion content that cuts through. Produced by a team that understands performance, not just aesthetics.",
  },
  {
    icon: "◎",
    title: "Google & Microsoft Ads",
    description: "Paid search, shopping, and social campaigns managed for measurable ROI. Every pound of spend has a clear job to do.",
  },
  {
    icon: "◈",
    title: "Ongoing Optimisation",
    description: "Analytics, conversion rate work, site care, and reporting. The system doesn't sit still — it improves every month.",
  },
];

function Index() {
  return (
    <main>
      {/* Scroll-Scrub Hero */}
      <ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme} />

      {/* Services Section — off-white ground */}
      <section className="bg-[#F5F3EE] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm tracking-[0.15em] uppercase text-[#787C82] mb-4">Capabilities</p>
          <h2 className="font-['Cabinet_Grotesk'] text-4xl md:text-5xl tracking-tighter leading-none text-[#1A1C1E] mb-16 max-w-2xl">
            Four capabilities that belong together.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {services.map((s) => (
              <div key={s.title} className="border-t border-[#D4CFC8] pt-6">
                <span className="text-[#B7E34A] text-xl block mb-3">{s.icon}</span>
                <h3 className="font-['Cabinet_Grotesk'] text-xl font-bold text-[#1A1C1E] mb-2">{s.title}</h3>
                <p className="font-['Inter_Tight'] text-base leading-relaxed text-[#4A4C50] max-w-md">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — near-black ground */}
      <section className="bg-[#1A1C1E] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm tracking-[0.15em] uppercase text-[#787C82] mb-4">Process</p>
          <h2 className="font-['Cabinet_Grotesk'] text-4xl md:text-5xl tracking-tighter leading-none text-[#F5F3EE] mb-16 max-w-2xl">
            How it works.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="border-t border-[#3A3C3E] pt-6">
              <span className="font-['Cabinet_Grotesk'] text-[#B7E34A] text-3xl font-bold block mb-4">01</span>
              <h3 className="font-['Cabinet_Grotesk'] text-xl font-bold text-[#F5F3EE] mb-3">Define</h3>
              <p className="font-['Inter_Tight'] text-base leading-relaxed text-[#A0A2A6]">We learn your business, your goals, and the gaps in your current setup. One conversation, one diagnosis.</p>
            </div>
            <div className="border-t border-[#3A3C3E] pt-6">
              <span className="font-['Cabinet_Grotesk'] text-[#B7E34A] text-3xl font-bold block mb-4">02</span>
              <h3 className="font-['Cabinet_Grotesk'] text-xl font-bold text-[#F5F3EE] mb-3">Align</h3>
              <p className="font-['Inter_Tight'] text-base leading-relaxed text-[#A0A2A6]">We build the plan across all four capabilities — site, creative, media, optimisation — so nothing works in isolation.</p>
            </div>
            <div className="border-t border-[#3A3C3E] pt-6">
              <span className="font-['Cabinet_Grotesk'] text-[#B7E34A] text-3xl font-bold block mb-4">03</span>
              <h3 className="font-['Cabinet_Grotesk'] text-xl font-bold text-[#F5F3EE] mb-3">Optimise</h3>
              <p className="font-['Inter_Tight'] text-base leading-relaxed text-[#A0A2A6]">We execute, measure, and improve every month. You get one team, one report, one accountable partner.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section — off-white */}
      <section className="bg-[#F5F3EE] px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-['Cabinet_Grotesk'] text-4xl md:text-6xl tracking-tighter leading-none text-[#1A1C1E] mb-6">
            Ready to close the gaps?
          </h2>
          <p className="font-['Inter_Tight'] text-lg text-[#4A4C50] mb-10 max-w-lg mx-auto leading-relaxed">
            One conversation is all it takes to start. Tell us where you are and where you want to be.
          </p>
          <a
            href="#"
            className="inline-block rounded-full bg-[#B7E34A] px-8 py-4 font-['Cabinet_Grotesk'] font-bold text-[#1A1C1E] text-base hover:bg-[#A0D030] transition-colors"
          >
            Request a growth plan
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1C1E] px-6 py-12 md:px-12 lg:px-24">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <span className="font-['Cabinet_Grotesk'] text-xl font-bold text-[#F5F3EE]">AKAL</span>
          <p className="font-['Inter_Tight'] text-sm text-[#787C82]">
            One accountable team, one operating system.
          </p>
        </div>
      </footer>
    </main>
  );
}
