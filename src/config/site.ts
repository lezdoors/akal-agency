/**
 * Single source of truth for copy + media asset paths.
 *
 * Every section receives its text and its media paths as PROPS — nothing is
 * hardcoded inside a component. To swap the reel clip or a capability film,
 * edit this file (and drop the file in /public/media) and the whole page
 * follows. Copy here is placeholder — replace wording freely.
 */

export interface LandscapeMedia {
  /** exact first frame (desktop) */
  poster: string;
  /** exact first frame (mobile) — provide when mobileClip is set */
  mobilePoster: string;
  clip: string;
  mobileClip: string;
}

export interface PlateFigure {
  plate: string;
  fig: string;
  title: string;
  copy: string;
  /** antique ink-wash plate — image URL passed as a prop */
  img: string;
  ink: string;
  paper: string;
  size: string;
}

export interface NavLink {
  label: string;
  /** CSS id of the target section */
  href: string;
}

export const site = {
  brand: "AKAL",

  nav: [
    { label: "Craft", href: "#craft" },
    { label: "Capabilities", href: "#capabilities" },
    { label: "Manifesto", href: "#manifesto" },
    { label: "Process", href: "#process" },
    { label: "Who it's for", href: "#who" },
    { label: "Contact", href: "#contact" },
  ] as NavLink[],

  heroScenes: [
    {
      id: "scene-01",
      kicker: "AKAL",
      label: "The system",
      title: "Four capabilities. One system.",
      body: "One accountable team running your entire marketing operation — websites, creative, ads, and ongoing optimisation, built and managed as a single system.",
      tags: ["Websites", "Creative & Video", "Paid Media", "Analytics & Optimisation"],
      poster: "/media/hero/scene-01-poster.png",
      mobilePoster: "/media/hero/scene-01-mobile-poster.png",
      clip: "/media/hero/scene-01.mp4",
      mobileClip: "/media/hero/scene-01-mobile.mp4",
    },
  ],

  heroTheme: {
    background: "#edeae3",
    ink: "#1a1c1e",
    muted: "#756f63",
    accent: "#a86b3f",
  },

  reel: {
    kicker: "Craft",
    title: "Drag the film to play it back.",
    hint: "Creative production — cut it yourself. Move your cursor to scrub the frame, forward and back.",
    media: {
      poster: "/media/reel/reel-poster.png",
      mobilePoster: "/media/reel/reel-poster.png",
      clip: "/media/reel/reel.mp4",
      mobileClip: "/media/reel/reel.mp4", // 16:9 file cover-cropped on mobile (no broken placeholder)
    } as LandscapeMedia,
  },

  plates: {
    kicker: "Plate index — four figures",
    title: "Four figures,\nof craft.",
    colophon: "Four capabilities, registered — a modern agency pressed in antique stock.",
    figures: [
      {
        plate: "PL. I",
        fig: "FIG. 01",
        title: "Build",
        copy: "Websites that assemble themselves — page by page, section by section.",
        img: "https://d8j0ntlcm91z4.cloudfront.net/user_3CsXJ5KGzuB3zpzVHAcuSGHKbW9/hf_20260801_211520_1fec4104-1700-456f-8b50-9b3751207148.png",
        ink: "Sepia 01 / Charcoal 02",
        paper: "Cotton rag, 100%",
        size: "0342 × 0224 mm",
      },
      {
        plate: "PL. II",
        fig: "FIG. 02",
        title: "Ignite",
        copy: "Creative that catches — the frame lights up, not just the headline.",
        img: "https://d8j0ntlcm91z4.cloudfront.net/user_3CsXJ5KGzuB3zpzVHAcuSGHKbW9/hf_20260801_211238_e0ed7b9d-0d13-4e95-87e9-873e2061081f.png",
        ink: "Sepia 02 / Charcoal 03",
        paper: "Cotton rag, 100%",
        size: "0210 × 0168 mm",
      },
      {
        plate: "PL. III",
        fig: "FIG. 03",
        title: "Spread",
        copy: "Signal that spreads — one placement feeds the next.",
        img: "https://d8j0ntlcm91z4.cloudfront.net/user_3CsXJ5KGzuB3zpzVHAcuSGHKbW9/hf_20260801_211237_ab039b3c-246c-4223-8359-333a35604d25.png",
        ink: "Sepia 03 / Charcoal 01",
        paper: "Cotton rag, 100%",
        size: "0296 × 0192 mm",
      },
      {
        plate: "PL. IV",
        fig: "FIG. 04",
        title: "Run",
        copy: "A system that runs — improving every month, automatically.",
        img: "https://d8j0ntlcm91z4.cloudfront.net/user_3CsXJ5KGzuB3zpzVHAcuSGHKbW9/hf_20260801_211238_c3dd87ab-afd4-4a9e-addb-b6adeb1eac60.png",
        ink: "Sepia 01 / Charcoal 02",
        paper: "Cotton rag, 100%",
        size: "0224 × 0148 mm",
      },
    ] as PlateFigure[],
  },

  manifesto: {
    intro: "We build marketing that feels like it lives.",
    words: [
      "Built",
      "not",
      "bought.",
      "Accountable,",
      "not",
      "anonymous.",
      "A",
      "system,",
      "not",
      "a",
      "sprint.",
    ],
  },

  process: [
    {
      step: "01",
      title: "Define",
      copy: "We learn your business, your goals, and the gaps in your current setup. One conversation, one diagnosis.",
    },
    {
      step: "02",
      title: "Align",
      copy: "We build the plan across all four capabilities — site, creative, media, optimisation — so nothing works in isolation.",
    },
    {
      step: "03",
      title: "Optimise",
      copy: "We execute, measure and improve every month. One team, one report, one accountable partner.",
    },
  ],

  audience: {
    kicker: "Who it's for",
    title: "Built for the team you actually are.",
    columns: [
      {
        title: "Growing businesses",
        copy: "You need a marketing department, not another freelancer. One contract, one team, one person accountable.",
      },
      {
        title: "Established marketing teams",
        copy: "Your team is good and also at capacity. We take defined growth work off your plate without you adding headcount.",
      },
    ],
  },

  contact: {
    kicker: "Contact",
    title: "Tell us where you are — and where you want to be.",
    body: "One conversation is all it takes to start. No deck, no obligation, just a straight answer on whether we can help.",
  },

  footer: {
    tagline: "One accountable team, one operating system.",
    line: "© AKAL.",
  },
};

export default site;
