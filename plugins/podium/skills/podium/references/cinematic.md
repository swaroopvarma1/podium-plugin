# The cinematic register

For a deck that is **presented to a room that has to feel something**: an investor pitch, a
launch keynote, a vision talk, an all-hands. The bar is a real investor deck this team holds
up as its best, rebuilt in Podium slide by slide until the two were indistinguishable at a
glance. Everything below is what it took, measured — as proportions and roles, never as
that deck's colours. Its violet and orange are its brand; copying them is copying the deck.

The opposite register is `editorial.md`: a document that is read. Pick by what the room does
with the deck, not by what looks impressive.

## What makes it cinematic

1. **Statements and proof take turns.** A statement slide is one idea set enormous — a
   number, a phrase, two words — on a lit ground with nothing else on it. A proof slide
   follows with the evidence: a table on glass, a product screen, a chart. Never two proof
   slides without a statement between them for long; never a statement without the proof
   that earns it.
2. **Chapters have a ground each.** The sky for statements, a warm floor for chapter
   openers, near-black for the product. The ground tells the room where it is before a word
   is read.
3. **One hero object recurs.** An orb, a device, a shape — introduced once at hero size,
   then returning: cropped by the frame like a horizon, behind glass cards, small beside a
   claim. It is the deck's face.
4. **A named series gives the middle a beat.** "From consumption to curiosity", "From
   answers to action", "From plausibility to precision" — four chapters with one sentence
   shape. The shape is the rhythm; the words change.
5. **The product is shown, big.** A hand holding the phone, the dashboard floating in cards
   around the object, a real person's face. Never a screenshot in a box at a third of the
   width.
6. **One accent with one job.** Orange there was ONLY the key word in a statement and the
   figure that matters; violet was only ever atmosphere, never text. Choose your pair and
   hold the line on every slide.

## Grounds — light is a method, not a recipe

Light on a slide has a source, a falloff, a colour and a texture. Decide those four for
this deck. `lib/atmosphere.mjs` has three worked answers, each a function of YOUR hue — use
them to learn the method, or when they fit, but they are not the register: the aurora is
the investor deck's own move, and ten decks with an aurora are one deck ten times. Other
answers the same paint fields build: a single hard beam across the frame; a horizon line
with light below it; a mesh of two or three of the product's colours; a photograph as the
ground with a scrim; pure black and one light; a paper white lit from one corner.

The three worked answers:

- **`aurora({ glow })`** — the statement ground. A lit arch over a dark base: one family of
  ellipses centred LOW (arch 0.8), so the dark ring runs down both sides to the frame edge
  and across the top, open at the bottom. Inside, a bright core column, a deeper trough, a
  lit band; the ring is the BASE SHOWING THROUGH a wide, soft gap between the band's fade
  and the rim's (~300px at the sides — narrow it and it reads as a smudge, not depth); a
  warmer wash lightens the ring across the top; the arch's feet rise in the bottom corners.
  Grain 0.5. Six paint layers.
- **`dusk({ lights: [a, b, c] })`** — chapter openers. Near-black with warm light pooling
  along the floor from three radials centred below the frame; the statement sits in the
  upper half. Grain 0.4.
- **`spotlight({ color, at })`** — the product. Near-black with one radial where the
  product sits. Grain 0.2 — less on black, where grain turns to dust.
- **`stars({ n: 7 })`** — seven specks, a 3px point over a 7px halo. Seven is a sky;
  seventy is wallpaper. 35–45% opacity on warm grounds.

## Type

Two or three faces: one display face for statements AND interface, an alternate voice
for chapter titles, a mono for interface labels. (The original used seven; the rebuild
matched it with three. Its display face was a grotesk — a serif, a slab or a mono carries
this register just as well; choose by the subject.)

| Element | Size on 1920 | Weight · tracking · leading |
|---|---|---|
| Statement (a phrase) | 200–230px (≈11–12% of the width) | 700 · −0.01em · centred, cap top at ~43% of the height |
| Giant number | 330–370px | 700 · −0.03em · leading 0.8; a 55px label above, the split below at 64px |
| TAM-style claim | 280–290px, number in accent, noun in ink | 800 |
| Section title | 72–76px | 700 · −0.025em |
| Body statement (a sentence) | 40–42px | 600 · −0.045em · leading 1.26 · key words `==accent==` |
| Chapter heading | 64–92px, the alternate voice | 500 · leading 1.08–1.18 |
| Interface numerals | 28–74px in weight **300** | light numerals are the product's voice |
| Interface labels | 22px+ mono, tracked 0.06–0.1em, a mid grey | draw the interface at 1.3–1.5× life so its labels reach this; the original's 11–16px read as texture from the room |

Nothing is below 24px (22px inside a drawn interface) — draw it bigger. A statement slide has at most one other
line, and it is at least a third of the statement's size.

## Glass

- **On a lit sky:** `bg #FFFFFF0D`, `glass 24`, radius 30–34, a 1.5px `#FFFFFF33` edge, a
  shadow `{ y: 30, blur: 70, color: #00000055 }`. Dividers inside at the edge's colour.
- **On black:** `bg #1A1A1FD9`, `glass 30`, radius 22, edge `#FFFFFF1A`; a tinted variant
  takes a vertical `fill` fading your hue in from the bottom.
- **On a warm floor:** `bg #FFFFFF0A`, edge `#FFFFFF24`, radius 10, and a `fill` that fades
  from transparent to white α0.16 at the bottom so the floor's colour comes through.
- `glass({ on: 'colour' | 'dark' })` builds the first two. Children FLOW inside the pane;
  give a child its own `at` and it leaves the pane's padding and alignment.
- A table on glass: `dividers: true`, `lineColor` = the edge colour, numbers `align: right`.

## Light

- **Glows** are blurred discs behind the thing that glows: `glow({ x, y, size, color })` —
  a group, `radius 999`, `blur 70–110`, `opacity 0.38–0.55`.
- **The hero object** is a `render` with `transparent: true` at ~700px. A cut-out comes back
  without its halo (those pixels are transparent) — put a glow behind it, always. `blur 9`
  on the object alone on the sky; `blur 2` when it sits behind cards.
- **Gradient numerals:** `textFill` with three stops along ~20° — accent → a warm bridge →
  your atmosphere hue — at 96px+, weight 600.
- **A headline in the light:** `textShadow { blur: 10, color: "current" }` — each run glows
  in its own colour; it reads as light, not as a drop shadow.

## Pictures

Four at most, each earning its place: the hero object (`render`, transparent), the product
in a hand (`photo`, transparent), a person (`photo`), and one more if a chapter needs it.
Palette = your ground, your accent, your atmosphere hue. Draw the interface on a
photographed phone yourself — measure the screen's rectangle, then place a group with the
phone's corner radius on it; the model's screens are gibberish.

## Motion

The original moves, and the motion is part of why it lands: the room is carried, not
clicked through. Typed, so it is in the JSON (the vocabulary's MOTION section):

- **Chapters dip.** The slide that opens a chapter takes `transition: { type: "dip",
  color: … }` — through white on a dark deck is a flash of light between acts; through the
  ground is a breath. The crossfade everywhere else. One kind of transition, used for one
  thing.
- **Stepped proof builds.** A table on glass that fills row by row, three claims that
  arrive on three clicks, a "before" that is replaced in place (`until`). Builds, not
  near-duplicate slides.
- **The hero object is alive.** One loop, on it: a moon that orbits the orb
  (`loop: { type: "orbit", around: [cx, cy], tilt: 0.3 }`), a glow that breathes
  (`{ ...glow({ … }), loop: "breathe" }`), a device that floats 12px. Slow — 9–20 s a
  cycle. Never a loop on a statement: words that move cannot be read.

## Drawn motion — one moment choreographed

Sometimes one slide deserves real choreography: a field of 1,400 stores where a light sweeps
across and lands on theirs; a route that draws itself; a counter that climbs. Write it as CSS
inside the svg block, choreographed by the program (the vocabulary's MOTION has the rules):

```js
const cells = grid.map(([x, y], i) => `<rect class='c${i === ours ? ' ours' : ''}' x='${x * 56}' y='${y * 56}'
  width='44' height='44' rx='8' style='animation-delay: calc(var(--enter, 0ms) + ${600 + (x + y) * 45}ms)'/>`);
svg(`<style>
  .c { fill: #fff; opacity: .12; animation: sweep 900ms ease-out both }
  .ours { animation: sweep 900ms ease-out both, land 700ms forwards; animation-delay: …, ${landAt}ms }
  @keyframes sweep { 35% { opacity: .9 } }
  @keyframes land { to { opacity: 1; fill: #FFB547 } }
</style>${cells.join('')}`, { viewBox, at })
```

The last frame is what every still shows — here, the field dim and theirs lit — so the
picture in the PDF is the point of the motion. One choreographed slide a chapter at most;
the rest of the deck should be still enough that this one is felt.

## The hero, on every slide

Measured on the evals: the slides a judge marked down were the ones where nothing was big —
a 76px sentence as the largest thing, the drawn phone at a twentieth of the frame, the
figure at 150px. Every slide gets one hero at hero scale (eyes: `no hero`, `figure under
hero scale`), and the hero changes form as the talk moves — a pink figure at 360px on
seven slides is wallpaper (eyes: `one hero, everywhere`). A dim room gets dark grounds — light paper
glares there. Dark proof slides need their own
light: a glow behind the proof object or a rim of light — a gradient alone on a dark ground
reads as flat (eyes: `flat grounds`).

## What breaks it

The original's own failures, so you do not repeat them:

- **The system breaks in the last third** — go-to-market and the appendix switched to white
  corporate slides with other faces. Every slide is in the language, the dull ones most.
- **Seven typefaces.** Three.
- **Dense small tables.** If a table needs 14px to fit, it is two slides, or an appendix.
- **Near-duplicate slides** where one idea builds. Build it (or say so in the notes).

Measure yourself against it: would this slide hold its own next to a statement set at 220px
on a lit sky? If it is a tidy page of 24px text on a flat ground, it is the other register.
