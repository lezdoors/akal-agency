# AKAL — CAMERA STORY SPECIFICATION

*The screenplay for akal-agency. One continuous film, not a website.*
**Author:** AKAL Build · **Status:** Approved-for-execution (v1.0)
**Governing principle:** The camera is the director. Everything else — world, globe, arcs, particles, type, interaction, scroll — is a supporting actor. Nothing moves without narrative intent.

---

## 0. THE PRINCIPLE (read first)

### 0.1 One film, not pages
Stop thinking pages, sections, tiers of landing-page blocks. Think scenes in one continuous take. The visitor is not reading a site; they are being moved through a film where the camera decides what they see, in what order, and why.

### 0.2 The camera is the storyteller
- Sometimes the camera moves. Sometimes it stays completely still.
- Sometimes the world moves around the camera. Sometimes both move. Sometimes nothing moves except one tiny signal.
- That contrast is drama. Motion is a currency — spend it only where it buys understanding or feeling. Stillness is not an absence of work; it is a deliberate camera decision.

### 0.3 The two-question gate (every feature proposal)
Before anything is built, it must clear both:
1. **Does this make the world feel more alive?**
2. **Does this make the visitor feel more involved in the story?**
If the answer to either is no, it is not built. "Beautiful" is not a reason. Only *alive* and *involved*.

### 0.4 Borrow emotion, not layout
Do not ask how websites are normally built. Ask how films, games, museums, architecture, product design, and operating systems create emotion, curiosity, rhythm, anticipation, surprise, memory — then translate those into the browser.

### 0.5 Why this exists
The current build has a world, interaction systems, and text — actors, sets, lighting, props, camera equipment — but no film. This document is the screenplay that turns the CameraSystem into the director and the film into the product.

---

## 1. THE FILM

**Title:** The Living Atlas
**Logline:** A visitor enters a world of moving points; they qualify one; the world opens into its operating core; everything narrows to a single route; the visitor realizes they are that route.

**The spine (one sentence per scene):**
1. **The World** — You are standing before an operating system.
2. **The System** — This is what it runs today.
3. **The Instrument** — Watch how precisely it works.
4. **The Portal** — Look inside. (the emotional center)
5. **The Platform** — It is bigger than today.
6. **The Hidden Layer** — There is more beneath the surface.
7. **The Single Route** — All of it resolves to one connection.
8. **The Invitation** — That connection is you.

The Portal is the heart. Everything before it builds anticipation; everything after it is consequence. The ending must leave a feeling, not present a CTA.

---

## 2. THE CAMERA LANGUAGE

A small, strict grammar. Every frame uses these moves; nothing else.

| Move | Definition | Narrative use |
|---|---|---|
| **STILL** | Camera locked; only imperceptible "breath" (±0.5% scale). | Agreement; trust; gravity. Used at the most important moments. |
| **BREATHE** | Tiny steady push-pull (0.3–0.8 units over the scene). | Aliveness without demand. The world is running even when nothing happens. |
| **PUSH** | Slow, continuous dolly-in toward a subject. | Intimacy, building emphasis. |
| **PULL** | Slow dolly-out. | Reveal, release, letting the visitor breathe. |
| **CARRY** | Lateral dolly / crane following a line or point. | Journey, process, moving from "what" to "how." |
| **LIFT** | Crane-up on the subject. | Expansion of understanding; scale; hope. |
| **SETTLE** | Ease from any move into perfect STILL. | Closure; inevitability; emotional landing. |
| **PUNCH** | Fast, single, motivated dolly-in (sprung). Used **only** for the Portal ingress. | The one violent move in the whole film. It must mean something. |

Rules:
- The camera never moves "because the next section starts." Every move has a stated objective (see scenes).
- No move happens while nothing is being revealed; no still holds while something should be discovered.
- The world may move around a still camera, or the camera may move through a still world, or both, or neither — but never arbitrarily.

**Frames of reference (what can move):**
1. **Camera** (position/aim).
2. **The world frame** (the whole scene; used for global rotation / crane).
3. **The globe** (points, arcs, atmosphere — its *state* can change: densify, spawn arcs, freeze, open).
4. **The signal layer** (reticle, charge, a single route) — the smallest, most intimate motion.

Drama comes from *which* of these moves and *how many* — never all at once.

---

## 3. THE WORLD MODEL

The world is procedural and continuous (per Blueprint v2 + Phase 0):
- The globe is a field of instanced points (`GlobeSystem`/`FieldPoints`).
- `TimeSystem` is the master clock; `progress` maps to the film timeline; `world` is the living clock.
- `SeedSystem` guarantees: nothing repeats perfectly; a session is deterministic yet never twice the same.
- `WeightLayer` is the single physical policy (every spring reads one tune).
- `LayerDirector` owns hidden layer registers (depth beneath the visible globe).
- `PerformanceTierSystem` gates fidelity; `RendererInterface` is the only renderer contract.

The film is a pure function of **(scroll progress within scene, interaction state, idle time, seed)** for any session — so reverse scroll rewinds the film like rewinding tape.

---

## 4. GATING & TIME (how the film advances)

- **Scroll is time.** The timeline advances with scroll; scrolling back rewinds the film frame-locked. No "section" is a discrete stop — scenes are *ranges* on one continuous progress axis with authored overlaps (a bridge, not a boundary).
- **Interaction advances the film too.** A qualification *lock* is the one thing that can move the film forward independent of scroll (the Portal ingress is locked by qualification *or* by sustained idle in Scene 3).
- **Idle keeps the film alive.** Every scene has a "living idle" so the world never dies when the visitor is still (breathing points, an occasional route, a coy camera BREATHE).
- **Contrast schedule:** the film deliberately throttles motion — whole beats are STILL so the rare move lands.

---

## 5. THE SCENES

Each scene declares: **why it exists · emotional objective · technical objective · visual objective · transition objective · the shot · world state · interaction · living idle · reverse scroll · mobile adaptation.**

---

### SCENE 1 — THE WORLD
> *"You are standing before an operating system."*

**Why it exists:** establishes the thesis instantly and calmly — this is infrastructure, not a marketing page.
**Emotional objective:** quiet awe; composure; nothing is being sold yet.
**Technical objective:** boot the world; prove it is procedural (it assembles itself before your eyes); first breath.
**Visual objective:** the globe densifies and settles into a calm centerpiece; headline reads; the field is clearly *alive* (not a static render).

**The shot:** Open wide and slightly high. Camera begins a slow BREATHE. During the first ~2s the world *boots* — points converge from a fine haze into the full globe (boot-order reveal). Then the camera holds an extended STILL while the headline completes. Nothing else moves.
**World state:** field densifying → steady; no arcs yet (restraint); the first single arc traces once at the very end (a promise).
**Interaction:** CursorField is live — the reticle is the visitor's first handhold, but gently.
**Living idle:** points breathe; an occasional point brightens and fades (the system is always at work).
**Why the camera moves (or doesn't):** The only motion is the boot + one lingering BREATHE. Stillness here = "this world is certain."
**Reverse scroll:** rewinds the boot — the world unassembles and reassembles, proving it's procedural.
**Mobile:** narrow field density; boot plays on entry; headline stacked above the globe.

**Transition → Scene 2 (why, not "next section"):** As the headline completes, the camera imperceptibly begins a CARRY to the right — the visitor's understanding is complete, so we offer them a path along the surface.

---

### SCENE 2 — THE SYSTEM
> *"This is what it runs today."*

**Why it exists:** names the offering, but through the world (tagged points + a routing signal), not a bullet list.
**Emotional objective:** competence; precision; confidence without hype.
**Technical objective:** render the ten offerings as *live readouts* tied to points; first taste of the qualification ring.
**Visual objective:** the globe's limb sweeps past; mono labels sit on points; the router pulses among them.

**The shot:** a slow CARRY along the globe's surface (lateral dolly). Copy enters with the motion — the world and text move as one. Nearing the end, the camera slows and leans to BREATHE.
**World state:** offerings appear as tagged points; one accent point is the "currently routing" lead; the reticle is more inviting.
**Interaction:** dwelling on a lead begins a charge ring (gentle, optional).
**Living idle:** the router continues drifting between tagged points when the visitor is still.
**Reverse scroll:** the CARRY reverses; tags recede.
**Mobile:** CARRY angle adjusted for portrait; tags compress; readouts remain legible.

**Transition → Scene 3 (why):** The camera decelerates and closes to near-tight on the current routing lead — from "what the system does" to "watch it work." Motion slows because the next scene's drama *is* slowness.

---

### SCENE 3 — THE INSTRUMENT
> *"Watch how precisely it works."*

**Why it exists:** the visitor experiences qualification as a physical act. This scene proves the mechanism needs no copy.
**Emotional objective:** intimacy; focus; the pleasure of a precise instrument.
**Technical objective:** the dwell-charge → lock pipeline is the entire scene; prove it reads without explanatory text.
**Visual objective:** near-total stillness so the small signals own the frame. Only the reticle ring, the charge arc, and a single route arc move.

**The shot:** camera near-tight, essentially **STILL** (the most still moment so far). The world holds. The *signal layer* does all the work: reticle tracks, charge fills, and on completion the reticle **spring-loads onto the lead** (lockSnap) while the camera gives one tiny confirming PUSH (no more than 0.6 units).
**World state:** points resolved and quiet; one lead is bright and targetable.
**Interaction:** dwell = fill charge; move away = drain; full = **LOCK**. On lock, the Chord of Futures triggers.
**Living idle:** a slow, seeded idle-qualify so a still visitor still sees the chord happen (cadence ~5–9s, tier-gated).
**Reverse scroll:** rewinds the charge and the chord; the lock un-snaps. Clean and reversible.
**Mobile (touch):** no hover → dwell becomes **touch-and-hold**; the idle cadence becomes the primary demo on mobile.

**Transition → Scene 4 — THE PORTAL INGRESS (why):** The lock is not just a mechanic. The **instant the lead locks, the camera commits** — it begins the single PUNCH toward that lead. The visitor does not click a portal; they *cause* one. This is the film's hinge.

---

### SCENE 4 — THE PORTAL
> *"Look inside."* — the emotional center.

**Why it exists:** this is the one thing a visitor remembers, records, replays, pauses, and shows a friend. Everything prior is anticipation; everything after is consequence.
**Emotional objective:** awe; intimacy; the world opening.
**Technical objective:** port Spike 1 (freeze-and-zoom) — a **continuous, physical, sprung dolly-in** (never a crossfade) from the locked lead through the globe surface into a second, interior procedural environment.
**Visual objective:** the outer field **freezes** (uTime halts — the world holds its breath); the camera passes the surface; the interior is *denser and finer* — the operating core, with its own inner routes.

**The shot (the money shot):**
1. **Anticipation frame:** everything still, one bright lead, the camera already aimed.
2. **PUNCH:** a fast, sprung, physically damped dolly straight into the lead. Outer points freeze as you pass.
3. **Reveal:** the interior — a fine, luminous micro-world. Camera settles, BREATHES.
4. Visitor is now *inside* the operating system. They can linger.

**World state:** outer field frozen → interior field (denser, finer, inner arcs); outer points resume only on exit.
**Interaction:** inside, the visitor may dwell again — second-order qualification (future-capability preview), kept subtle.
**Living idle:** interior routes drift slowly; this is the most alive stillness in the film.
**Reverse scroll:** camera pulls back **through the same physical path** — outer world unfreezes. The interior rewind is the exact reverse shot.
**Mobile:** the Portal still PUNCHES on touch-hold + idle; interior scaled for portrait; the frozen-outer contrast preserved.
**Quality/tier:** Portal is mandatory on all tiers — on reduced it becomes a single authored still-to-still transition (freeze + cut), never a skipped beat.

**Transition → Scene 5 (why):** Having seen the core, the camera **LIFTS** inside the interior — the visitor's understanding expands from "today" to "what the core can become." The lift is the emotional consequence of having been let inside.

---

### SCENE 5 — THE PLATFORM
> *"It is bigger than today."*

**Why it exists:** quietly expands the world's ambition — "lead generation is the first layer" — without overpromising.
**Emotional objective:** scale; quiet ambition; respect for restraint.
**Technical objective:** render interior future-capability lines as a far, faint field; seeded ghost futures.
**Visual objective:** a slow LIFT (crane-up) inside the interior makes it feel vast; future routes exist as faint, unreachable distances.

**The shot:** continuous LIFT, slow and even. The interior rotates gently under a camera that rises above it. Then the camera reaches apex and begins a long, slow SETTLE forward.
**World state:** interior routes multiply; future layer is faint and distant (never loud).
**Interaction:** minimal — the visitor is being carried; light parallax only.
**Living idle:** inner field slowly orbits.
**Reverse scroll:** the LIFT reverses; the interior descends.
**Mobile:** LIFT shortened; the "first layer" idea carried by a single resolving line rather than many.

**Transition → Scene 6 (why):** As the camera settles, the interior's surface begins to *shear* — a depth layer the visitor hadn't noticed slips into view. Curiosity pulls the camera sideways.

---

### SCENE 6 — THE HIDDEN LAYER
> *"There is more beneath the surface."*

**Why it exists:** the LayerDirector pays off — the world has hidden registers; the OS is deeper than it looks. Intrigue, not explanation.
**Emotional objective:** mystery; the pleasure of unexpected depth.
**Technical objective:** a layer-peel (layerPeel tune) — a parallel plane of fine arcs unseams beneath the visible globe.
**Visual objective:** a controlled lateral parallax + peel (the world moves around a nearly-still camera) revealing a second, quieter tone of the system.

**The shot:** camera mostly **STILL**; the *world* peels. One hidden layer slides beneath/behind, its arcs brighter and finer than the main field. The contrast (main field vs hidden layer) is the reveal.
**World state:** `LayerDirector` registers come visible; hidden-layer arcs + their faint packets.
**Interaction:** the visitor can dwell on a hidden-layer lead — an even slower, more precious qualification.
**Living idle:** the hidden layer breathes beneath; occasionally a hidden packet crosses it.
**Reverse scroll:** the peel reverses; the layer re-seams seamlessly.
**Mobile:** peel simplified; depth conveyed by tone shift and a single shearing line.

**Transition → Scene 7 (why):** The visitor has now seen the breadth (Platform) and the depth (Hidden Layer). The film has said all it needs to say *about* the world. Now it says what the world is *for* — the camera holds still and the world itself begins to resolve.

---

### SCENE 7 — THE SINGLE ROUTE
> *"All of it resolves to one connection."*

**Why it exists:** the emotional close — many routes collapse to one. This is what the whole film has been moving toward.
**Emotional objective:** inevitability; stillness before the ending; closure.
**Technical objective:** a **long, slow, monotonic resolution** — every visible arc/packet collapses inward to a single surviving point; frame-perfect symmetric ending.
**Visual objective:** maximal world motion for the *last time* (the collapse), which then hands off to maximal stillness.

**The shot:** camera **STILL** (dead-center, symmetric). The world does the moving: arcs and packets pull inward to a single point over a slow, even ~4s. When everything has resolved, the camera does not move — the point remains, faintly pulsing. Nothing else moves. This silence is the emotional beat.
**World state:** multi-route → single route → one surviving point (accent). 
**Interaction:** none needed — the visitor is being moved. The reticle retreats.
**Living idle:** only the survivor point pulses (the smallest possible motion; supreme contrast).
**Reverse scroll:** the resolution reverses — the single point blooms back into the many. Satisfying and hypnotic.
**Mobile:** the collapse plays large; the survivor point is the focal anchor near the viewer.

**Transition → Scene 8 (why):** The world has fully resolved *into the visitor*. There is nowhere else for the film to go except the only connection left — the invitation.

---

### SCENE 8 — THE INVITATION
> *"The connection is you."*

**Why it exists:** completes the journey with a feeling, not a promo. The CTA is inevitable.
**Emotional objective:** resolution; calm completion; the CTA feels earned, not asked for.
**Technical objective:** the most still frame of the entire film.
**Visual objective:** the single pulsing point + a warm, quiet field; "We build experiences like this." reads as the end of a sentence, not a headline.

**The shot:** camera **STILL**, perfectly framed, symmetric. The sole motion is the survivor point's faint pulse and an imperceptible BREATHE. The "Talk to us" element appears because the film ended — it is the natural next thing, not a banner. (This scene's appearance is a *consequence* of Scene 7, not a new pitch.)
**World state:** resolved single point; quiet field.
**Interaction:** the CTA is a single label; selecting it proceeds to the **qualification entry flow** (see §7) — the visitor's own Single Route.
**Living idle:** the pulse; occasional single tiny route appears and returns (the world is always available).
**Reverse scroll:** if the visitor scrolls back, the resolution unwinds into Scene 7 — but the feeling persists by design.
**Mobile:** the ending is portrait-frame; the survivor point + CTA share the bottom third.

**Why the CTA is not promotional:** by this point the visitor has been inside the system, watched it resolve, and become its route. "Talk to us" is the closing line of a sentence, and it points at the qualification flow — the beginning of *their* film.

---

## 6. REVERSE-SCROLL RULE (global)

- The film is a pure function of **(progress within scene, interaction, idle, seed)**. Scrolling back anywhere scrubs the film in reverse with zero discontinuity — camera, world, arcs, locks all rewind.
- The Portal interior has its own rewind: pulling back exits through the same physical sprung path and unfreezes the outer field.
- Exception (deliberate): the **emotional landing** (Scene 7 survivor point) rewinds smoothly, but the *feeling* is designed not to rewind — that's a piece of editing, not code.

---

## 7. THE QUALIFICATION ENTRY (the visitor's own Single Route)

After the journey, "Talk to us" opens a **qualification form** (not mailto). It is the invitation's counterpart: the visitor becomes a lead entering the system they just watched. Collects:
- name · company · email · industry · target geography · approximate monthly lead volume · current acquisition challenge · optional phone.
Kept as the single page-wide CTA label: **"Talk to us."**
(Design deferred until the screenplay is approved and Phase 3 is executing; spec captured here so the ending is built around it.)

---

## 8. MOBILE & REDUCED-MOTION ADAPTATION (global)

- **Portrait framing:** the same camera language, re-framed — scenes play vertically; copy sits above/below the world rather than beside it. The film is *the same film*, not a reflowed page.
- **Touch (no hover):** dwell → **touch-and-hold**; the idle cadence becomes the primary demo; Portal ingress via hold or sustained idle.
- **Reduced motion:** the film becomes a **storyboard** — each scene is an authored still composition; the only allowed transitions are slow, intentional geometry states (freeze/cut) at a reduced cadence; the Portal becomes a single freeze + interior cut. The story is fully preserved without motion — because the screenplay, not the motion, carries the meaning.
- **Performance tiers:** fidelity scales (`PerformanceTierSystem`), but **no scene is removed** at any tier. The director adapts, never deletes.

---

## 9. THE TWO-QUESTION GATE (applied to this screenplay)

Each scene was retained only if it cleared both:
1. Does it make the world feel more alive? — every scene either densifies, breathes, freezes/resolves, or peels — the world is a living thing.
2. Does it make the visitor feel more involved? — they steer the reticle, cause the lock, are carried by the camera, and *become* the route.

Proposed-but-rejected (to be explicit about the gate): decorative audio stings, extra bloom, particle-count vanity, sidebars — none add life or involvement, so none are in the film.

---

## 10. EXECUTION PLAN (from this screenplay — explicit, uncontroversial)

Implemented strictly from this document, like a film production:

1. **Camera Director system** — the film's brain: a scene timeline keyed to (progress ∩ interaction ∩ idle); it issues camera and world-frame moves per the language in §2.
2. **Scene rigs** — one director task per scene (§5), with STILL/BREATHE/PUSH/PULL/CARRY/LIFT/SETTLE/PUNCH primitives mapped to WeightLayer tunes.
3. **Signal layer** — reticle, charge arc, surviving point; the smallest, most intentional motion (§3, §5.3, §5.7).
4. **Portal rig** — the frozen-outer + sprung interior ingress and its exact-reverse exit (§5.4).
5. **LayerDirector in production** — hidden-layer register + peel (§5.6).
6. **Reverse-scroll scrubber** — frame-locked rewind across all scenes (§6).
7. **Ending + qualification entry** (§5.8, §7) built around the resolved film.
8. Port the remaining Phase 0 systems (CoAgent, SoundSystem, arc shader) as *supporting actors* only where they serve a scene's objective.

**Production order (film-first):** Shoot the film in dependency order — Scene 1 (establish the director + world) → Scene 4 Portal rig (the heart, highest risk, film on it early) → Scene 3 lock→Portal hinge → reverse-scroll scrubber → Scenes 5–7 → Scene 8 + qualification entry → mobile/reduced adaptation → Phase 4 grade (atmosphere, sound) only after the film reads.

---

*This document is the source of truth for the experience. All production code proceeds from it. When in doubt, ask the two questions.*
