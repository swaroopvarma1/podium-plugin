# Slides: the plane, the register, the floor

What a slide is made of, the two registers, the floor every slide meets (with the eyes finding for each rule), motion, and what made the decks people kept memorable. `SKILL.md` step 5 is the summary; the floor here is the full text.

## Contents

- A slide is blocks on a plane
- Pick the register, then meet the floor
- Make it memorable
- Do not make it consistent

## A slide is blocks on a plane

1920×1080. That is the entire model.

```js
slide({ tone: 'invert', notes: 'what you say out loud' }, [
  text('The steel never melts.', 'title', { at: g.at(1, 8, 186) }),
  svg(hamon(), { at: { x: 0, y: 0, w: 1920, h: 1080, z: 0 }, color: 'accent' }),
  image('/m/abc…', { at: { right: -80, y: 40, w: 900 }, fit: 'cover' })
])
```

- **`at`** — `x y w h right bottom z rotate opacity place`, or `col`/`span` against the
  deck's own twelve columns. Negatives and overflow **bleed**; the slide clips. Omit `at`
  entirely and the block flows down the margin-bound column.
- **`role`** on text — `cover title h2 h3 statement lede body label micro ordinal giant
  quote bignum pill eyebrow`. A role inherits the theme's own size for that thing, which
  is what keeps forty hand-built slides in one type scale.
- **`style.scale`** beats `style.size`: it is a multiple of the *role's* size, so the
  block stays hooked to the scale instead of freezing at one theme's numbers.
- **`style.ink`** (0–1) is how much ink the block **keeps**. 0.7 is quiet, 0.2 is nearly
  gone. It mixes against `currentColor`, so it reads on paper white and on a dark card
  alike, which a fixed grey does not.
- Slide-level: `bg {color image fit position opacity scrim}`, `tone: "invert"`, `anim`,
  `margin`, `notes`. There is nothing else, and there is no running furniture — if you
  want a page number, draw one.

A text block's `role` is its outline level as well as its size: `cover` renders as an
`h1`, `title` an `h2`, `h2` an `h3`, `h3` an `h4`. That is free structure for anyone
reading the deck with a screen reader, and it is why a headline should wear a role rather
than a hand-set `style.size`.

Drawn marks are hidden from assistive tech, because nearly all of them are decoration.
When one is not — a chart you computed, a diagram that carries the argument — put a
`<title>` as the first child of the svg and it becomes a described image instead:

```js
svg(`<title>Capital stack: senior debt 60%, mezzanine 25, equity 15</title>${bars}`,
    { at: g.box(1, 6, 300, 300) })
```

Rich text works in every string: `**bold**` `*italic*` `==accent==` `` `mono` `` `~alt~`,
and a real newline breaks the line where you want it rather than where the box wraps.
`~tildes~` switch to `--font-alt` mid-sentence, which is how you get two typefaces inside
one headline.

## Pick the register, then meet the floor

Two registers, and the brief's delivery answer picks one:

- **Cinematic** — presented to a room that has to feel something: a pitch, a launch, a
  vision talk. Statements set enormous on lit grounds, a hero object that recurs, proof on
  glass. **Read `references/cinematic.md`**; its grounds, glass, glow and stars are
  functions of YOUR colours in `lib/atmosphere.mjs`.
- **Editorial** — read, or walked through closely: an explainer, an architecture review, a
  working document. A claim per title, one signature diagram keyed by colour, the product
  drawn. **Read `references/editorial.md`**, including the lift — the fixes that make it
  good rather than okay are part of the register.

Say which in the brief (`direction`). Either way, the floor — every deck, every slide:

1. Nothing below 24px on the 1920 plane — not a caption, a kicker, a footnote, a source, an
   axis label or a label inside a drawing; 22px inside a drawn interface, drawn at 1.3–1.5×
   life. The judge that stands in for the room reads 20px as too small. Eyes reports
   anything under 22px, svg text included, as `small type`.
2. Two or three faces.
3. Every slide has one hero — the thing it exists for is the biggest thing on it: a figure
   at 280px+, a statement at 200–230px with almost nothing else, or a drawing across two
   thirds of the frame. A 60px sentence over a chart at a third of the frame is the "okay
   deck". Eyes: `no hero`, `statement under hero scale`.
4. On a slide that exists for a number, the number is the biggest thing on it, at 280px or
   more. Eyes: `figure under hero scale`.
5. **Dark grounds get light with range:** a glow behind the subject — behind every hero
   figure and every drawn screen — a gradient whose far edge is 25–35% darker than its lit
   corner, or a photograph (`lib/atmosphere.mjs`). A 2–4% wash and a little grain read as
   flat. **Paper stays flat and its colour clear** — salmon, rose, cream, a printed blue —
   never lit from a corner, which turns it khaki, sage or grey; the depth on paper comes
   from the object drawn on it. **The room decides how light the ground is:** a projector
   in a dim room wants a dark, lit ground (light paper glares there); a deck read on a
   laptop can be light. Variety between decks comes from hue and material, never from
   putting a dim-room talk on white. Eyes: `flat grounds` (dark grounds only).
6. No more than three slides in a row with the same skeleton, and a statement slide —
   200px+, almost nothing else — after every three or four proof slides. Eyes: `proof run`.
7. Headlines break where the sense breaks: a real newline, never "sign- / ups".
8. The accent has one job.
9. The proof on a proof slide — a diagram, a drawn screen, a chart — fills two thirds of the
   frame and reaches its lower third, labels 20px+. A headline and some cards in the top
   half over an empty bottom is the "okay deck"; eyes reports it as `empty lower band`, and a
   proof under 55% of the frame as `proof too small`.
10. The hero move varies. The same device on more than four slides — one colour of hero
    number, one crop of the orb, one shape of divider — is wallpaper by the fifth; change
    its scale, position or form as the argument moves. Eyes: `one hero, everywhere`,
    `one picture, everywhere`.
11. Marks a room can see. A field of hundreds of tiny dots or a dense grid reads as a grey
    slab from the back row: marks of 8px or more, or fewer of them. Eyes: `marks too fine`.
12. No ledgers: past about twenty-five pieces of text a slide is a document page. Lead with
    the three or four figures that matter. Eyes: `a ledger`.

**Motion belongs to the register.** A presented deck moves like one directed: a
`transition` (a dip, a push) on the slides that open a chapter and the crossfade on the
rest; `step`/`until` builds where one slide's argument unfolds click by click — a build,
not three near-duplicate slides; and at most one `loop` a slide, on the hero object or a
live signal (an orbit, a breathing glow, a ping), never on words. A read deck barely moves:
builds in a walkthrough, nothing else. Every field is in the vocabulary's MOTION section.
Eyes and every still show the final build with loops at rest; look at an earlier build
with `node lib/eyes.mjs "<look-url>" --slides 4.1` (slide 4 after its first click).

**Warm paper, a serif and a red or orange accent is where every model drifts** when
nothing pushes it elsewhere — the evals measured four decks in eight landing on it. Go
there only when the brief asks for it.

## Make it memorable

The judge's numbers and a person's taste are not the same thing. When twenty-seven finished
decks were sorted by hand, the ones kept had character and the ones rejected were correct
and generic — including decks the judge scored over 4 and eyes had nothing to say about.
What the kept decks shared:

- **The cover carries one crafted object** — a glass tile lit from inside, an engraved
  rosette, a till receipt, a drawn service bay, a matchbox. A cover that is a title over a
  progress rail, an arc or a row of boxes was rejected every time.
- **The idea shows at thumbnail size.** If the metaphor lives only in the theme's name
  ("isolux", "drafting film") and on the slide it is faint rings or a grey vignette, it is
  not there. Pick a physical artefact the audience knows and draw it big enough to
  recognise in a thumbnail.
- **Paper stays flat and its colour clear** (the floor, rule 5). Corner-lit paper went
  khaki, sage and grey, and was rejected.
- **A read-closely deck still has poster moments:** a type or picture hero at poster scale
  every three or four slides, or it becomes table after table.
- **Leave out the clichés:** ghost chapter numerals behind the content, tall condensed
  all-caps headlines, one joke repeated on every slide.
- **For a B2B explainer, borrow print craft** — engraving, guilloche, a docket, a receipt, a
  form — rather than a software kit of pills, rails and rounded cards.

With generation on, that object is usually a render made for this deck (*Making the hero object*, `references/pictures.md`). None of this is a style. Dark and light, violet and paper, an orb and a drawing
all passed.
What failed was the absence of an object and an idea you can see. The objects above are
what passed, not a menu: this deck's object comes from this deck's subject, the way its
palette does (`references/inventing-a-design-language.md`).

## Do not make it consistent

The instinct this tool most needs you to fight is the one that makes every deck safe.

- **A deck should be recognisably unlike the last deck you made.** If you cannot say in
  one sentence what is different about this one, you have not designed it yet.
- **Unlike their last decks.** Before you choose, call `decks()`: it returns each recent
  deck's swatch — ground, accent, display face, the language's name. Pick a ground hue, an
  accent hue and a display face that none of the last five used — but how LIGHT the ground
  is belongs to the room (a dim room is dark), not to variety — unless the brief asks
  for continuity (a series, their brand, a deck that must match one they have). Every
  recipe and number in this skill is a way of working, not a look; ten agents following
  it should make ten decks that share nothing but their quality.
- **Nothing here is a default worth keeping.** Podium ships a neutral fallback theme so a
  themeless deck is not broken. It is not a starting point; it is a smoke alarm.
- **Nothing ships a design to lean on.** The published design languages live on the
  presets shelf, where a person chooses one; an agent never opens one unasked, to borrow
  from or to learn from. `lib/draw.mjs` and `lib/atmosphere.mjs` are the toolkit; the
  look comes from the subject.
- **A preset the person named does not relax any of this.** It moves where you start, not
  where you stop. The test is the same one at the top of this list: say in one sentence
  what is different. "It is that preset with our copy in it" is not a sentence that
  passes.
- **The slide that scares you is usually the right one.** A slide that is ninety per cent
  empty, a headline cropped by the frame, a diagram with no words on it — those are the
  slides people remember. Build one per deck and keep it.
- **If a mark could be drawn by hand in five minutes, it is not worth drawing.** Compute
  it: a curve from a real function, a field whose density is the data, a seeded wobble, a
  pattern tiled from geometry, lettering on a path. `lib/draw.mjs` is the toolkit;
  `svg` blocks render exactly as written, so anything SVG can do, a slide can do.
