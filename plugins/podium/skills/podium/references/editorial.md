# The editorial register

For a deck that is **read, or walked through closely**: an enterprise explainer, an
architecture review, a working document for an operator, a pilot plan, a quarterly review.

## Contents

- Keep — what those decks did well
- The bar — every slide
- Measures
- Motion
- What breaks it

This register was first distilled from real customer decks their own team rated "okay", and
the evals showed what that inherits: a judge holding decks to the team's best work capped
everything that still looked like them — flat pale paper, a 58–64px sentence as the
biggest thing on every slide, mono microcopy, dense tables. So a read deck is now held to
the same craft as a presented one — a hero on every slide, light with real range, drawings
that fill the frame — and simply allowed more words around it. Read closely is not a
licence to be quiet everywhere.

The opposite register is `cinematic.md`. Pick by what the room does with the deck.

## Keep — what those decks did well

1. **Every title is a claim**, one sentence with a full stop: *"The service slot that would
   have gone empty."* Read the titles alone and the argument is there.
2. **One signature diagram carries the argument and returns** — a drawing invented for this
   subject, with every pill, column and connector keyed to one of its parts by colour.
   Colour encodes a ROLE and nothing else. (Not the stacked isometric planes those decks
   used: that motif is theirs, and a judge who knows them reads it as borrowed.)
3. **The product is drawn, not screenshotted**: a phone mid-call, a payment page with the
   widget open, a console with numbered annotations — drawn in blocks and svg, so it is
   sharp, on-palette and editable.
   **And the deck's object can be generated** — an engraved telephone, a till roll, a
   cheque's rosette — as `art` on the paper's own colour, flat, big enough to recognise in
   a thumbnail (SKILL.md, *Making the hero object*).
4. **Chapter dividers are poster moments**: the chapter's title at cover size, or one
   object from the deck's world drawn big — on an inverted ground with a glow, or on the
   paper itself. Not a ghost numeral behind the title: that is the cliché people reject.

## The bar — every slide

- **One hero.** The thing the slide exists for is the biggest thing on it: the key figure
  at 280–360px with its label and its change small beside it, or the diagram across two
  thirds of the frame, or a statement at 180px+. The claim title sits above at 56–72px and
  is never the largest thing on a proof slide. A 58px sentence over a chart at a third of
  the frame is the pattern this register exists to leave. (Eyes: `no hero`, `figure under
  hero scale`.)
- **Paper stays flat and its colour clear.** Salmon, rose, cream, a printed blue — chosen
  for the subject and held flat. Lighting paper from a corner turns it khaki, sage or grey,
  and those decks were rejected. The depth on a read deck comes from the object drawn on
  the paper — the receipt, the engraving, the drawn screen — not from a vignette. Dark
  grounds in this register (a chapter divider, a deck read on a dark screen) get real light:
  a glow behind the subject (eyes: `flat grounds`).
- **Type for the room.** Nothing below 24px on the 1920 plane, footnotes, axis labels and
  mono labels included (22px inside a drawn interface); table text 24px+. Mono is for data — figures, ids, timings, code — not for
  furniture. (Eyes: `small type`.)
- **No ledgers.** More than about twenty-five pieces of text on one slide is a document
  page. Lead with the three or four figures that matter, at hero size, and move the rest to
  an appendix slide or the notes. (Eyes: `a ledger`.)
- **A diagram is the slide.** A diagram that carries the proof fills two thirds of the
  frame, labels 20px+, and reaches the lower third. Split the slide rather than shrink the
  drawing. (Eyes: `empty lower band`, `marks too fine`.)
- **Rhythm.** No more than three slides in a row with the same skeleton; after three light
  proof slides, a dark statement slide — the next section's claim at 180px+ on a lit deep
  ground. Light proof, dark statement, light proof.
- **The motif grows and the hero changes form.** Build the signature diagram part by part,
  change its size and angle, zoom into one part for its chapter. A hero figure in one colour and size
  on more than four slides is wallpaper — vary scale, position and form. (Eyes: `one hero,
  everywhere`, `one picture, everywhere`.)

## Measures

| Element | Setting on 1920×1080 |
|---|---|
| Margins | 120px left and right |
| Claim title | display 500, 56–72px, −0.035em; top ≈ 110; one sentence, a full stop |
| Hero figure | display 600–700, 280–360px, leading 0.85, a glow behind it; its label 26–30px beside or above it |
| Statement (dark beat) | display 500–600, 200–230px, on a lit deep ground, after every three or four proof slides |
| Lede | body 24–28px; one line, up to ~95ch (`maxWidth: "none"`) |
| Eyebrow | mono 24px, UPPERCASE, 0.06–0.08em — on section openers, not every slide |
| Folio | mono 24px, `"{{page:2}} / {{pages}}"` at the bottom right |
| Cover title | display 500, 140–180px |
| Chapter divider | the title at 180px+, or one object from the deck's world drawn big; inverted with a glow, or on the paper |
| Ground | paper flat, in one clear colour; on a dark ground, a glow (`glow()`) behind the subject |

**Pills** — three states, one meaning each: outlined 1.5px in the role colour = an event;
tinted fill with dark ink = a step; solid fill with white ink = the one in use. Mono 22px,
padding 6/16, `radius 999`, `whitespace: "nowrap"`.

**Row tables** — `rows: "cards"`, `headColors` = the role colour of each column,
`rowFill: "#FFFFFF"`, `cell: [18, 24]`, text at 24px+. Four columns and six rows is a
table; more is an appendix. A quote row: a white box with
`rule: ["box", { edge: "left", width: 5, color: "ink" }]`.

**Drawn interface** — at 1.3–1.5× life size, not 1:1: a console the room can read is
bigger than the console, and its labels reach 22px. Numbered annotation dots 34px in the
accent with a 3px ring in the ground colour, repeated down a side column with the
explanation.

## Motion

A read deck barely moves. In a walkthrough, the signature diagram can BUILD — one plane per
click (`step`), the annotation dots arriving with the part they explain — so the presenter
walks the room through it in order. No transitions beyond the crossfade, and no loops: a
page that moves is a page that cannot be read.

## What breaks it

A sentence as the biggest thing on every slide; grey carrying the hierarchy instead of size
(four greys at similar sizes give the eye nowhere to land); flat paper with a whisper of
gradient; a table of forty cells where four numbers were the point; a diagram so small it
needs its own caption to be read. If you would not print the slide at A4, pin it on a wall
and read it from across the room, it is not finished.
