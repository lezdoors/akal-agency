import site from "./config/site";
import { Nav } from "./sections/Nav/Nav";
import { Hero } from "./sections/Hero/Hero";
import { About } from "./sections/About/About";
import { Reel } from "./sections/Reel/Reel";
import { PlateIndex } from "./sections/PlateIndex/PlateIndex";
import { Manifesto } from "./sections/Manifesto/Manifesto";
import { Process } from "./sections/Process/Process";
import { Audience } from "./sections/Audience/Audience";
import { Contact } from "./sections/Contact/Contact";
import { Footer } from "./sections/Footer/Footer";
import { GroundField } from "./components/GroundField/GroundField";
import { ShapeCarry } from "./components/ShapeCarry/ShapeCarry";
import { ClosingStroke } from "./components/ClosingStroke/ClosingStroke";

/**
 * AKAL — a marketing agency selling one accountable team. Register: paper is
 * home (ink-wash), dark is where lime lives. Ground rhythm paper→dark→paper→
 * dark→paper→dark, linked by the non-fade GroundField + the carried ink arc.
 * The ClosingStroke closes at the footer.
 */
export default function App() {
  return (
    <>
      <ClosingStroke />
      <Nav
        brand={site.brand}
        links={site.nav}
        cta={{ label: "Request a growth plan", href: "#contact" }}
      />

      <Hero scenes={site.heroScenes} theme={site.heroTheme} />

      <About
        kicker={site.about.kicker}
        title={site.about.title}
        body={site.about.body}
        plate={site.about.plate}
      />

      <ShapeCarry />

      <Reel
        kicker={site.reel.kicker}
        title={site.reel.title}
        hint={site.reel.hint}
        media={site.reel.media}
      />

      <GroundField />

      <PlateIndex
        kicker={site.plates.kicker}
        title={site.plates.title}
        colophon={site.plates.colophon}
        figures={site.plates.figures}
      />

      <ShapeCarry />

      <Manifesto intro={site.manifesto.intro} words={site.manifesto.words} />

      <GroundField />

      <Process steps={site.process} />

      <Audience
        kicker={site.audience.kicker}
        title={site.audience.title}
        columns={site.audience.columns}
      />

      <ShapeCarry />

      <Contact
        kicker={site.contact.kicker}
        title={site.contact.title}
        body={site.contact.body}
      />

      <Footer
        brand={site.brand}
        tagline={site.footer.tagline}
        line={site.footer.line}
        links={site.nav}
      />
    </>
  );
}
