/**
 * Single source of truth for AKAL copy + brand media paths.
 *
 * The page is driven from here — nothing is hardcoded inside a component.
 * Copy follows the approved Blueprint v2 message (see PLAN.md).
 */

export interface NavLink {
  label: string;
  /** CSS id of the target section */
  href: string;
}

export interface CopyBlock {
  kicker: string;
  title: string;
  body: string;
}

export interface ListBlock extends CopyBlock {
  /** bullets / capabilities, shown as a two-column register */
  points: string[];
}

export const site = {
  brand: "AKAL",

  media: {
    monogram: "/brand/akal-monogram.svg",
    ogImage: "/brand/og-cover.jpg",
    favicon: "/brand/favicon.svg",
  },

  nav: [
    { label: "The System", href: "#system" },
    { label: "The Instrument", href: "#instrument" },
    { label: "The Platform", href: "#platform" },
    { label: "The Single Route", href: "#route" },
  ] as NavLink[],

  headline: "The infrastructure for customer acquisition.",
  hero: {
    sub: "Opportunity is a field of moving points. AKAL is the operating system that qualifies, routes, and delivers it.",
    cta: "Talk to us",
    ctaHref: "#contact",
  },

  system: {
    kicker: "// The System — today",
    title: "Premium lead generation, delivered live.",
    body: "One system that qualifies, routes, and delivers opportunity in real time — built with the precision of infrastructure, not a vendor.",
    points: [
      "Exclusive qualified leads",
      "Shared lead programs",
      "Real-time delivery",
      "Industry targeting",
      "Geographic targeting",
      "AI-assisted qualification",
      "Lead routing",
      "Campaign optimization",
      "CRM integrations",
      "Acquisition consulting",
    ],
  } as ListBlock,

  instrument: {
    kicker: "// The Instrument",
    title: "Qualify. Route. Deliver.",
    body: "Every point in the field is weighed, routed along the best path, and delivered where it converts. Precision is the product.",
    points: [
      "Dwell-based qualification",
      "Best-route selection",
      "Instant delivery",
      "Full traceability",
    ],
  } as ListBlock,

  platform: {
    kicker: "// The Platform — what comes next",
    title: "Lead generation is the first layer.",
    body: "The same operating system that qualifies and routes today is being built to run the whole acquisition stack — quietly, never overpromised.",
    points: [
      "AI sales agents",
      "Voice agents",
      "Lead verification",
      "Predictive qualification",
      "Autonomous optimization",
      "Marketing intelligence",
      "Workflow orchestration",
      "The acquisition operating system",
    ],
  } as ListBlock,

  route: {
    kicker: "// The Single Route",
    title: "The world resolves to one connection.",
    body: "Every route, every point, every qualified lead — it all ends in a single conversation. Yours.",
  } as CopyBlock,

  invitation: {
    kicker: "// The Invitation",
    line: "We build experiences like this.",
    cta: "Talk to us",
    ctaHref: "#contact",
  },

  footer: {
    line: "© AKAL.",
    note: "The infrastructure for customer acquisition.",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "X", href: "#" },
      { label: "Email", href: "#" },
    ],
  },
};

export default site;
