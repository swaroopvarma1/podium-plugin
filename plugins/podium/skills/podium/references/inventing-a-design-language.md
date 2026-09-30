# Inventing a design language

There is no menu here, and there used to be. Seven named flavours shipped with this skill
for a while — worked palettes, type pairings, signature moves, the lot. Agents picked one
every time, applied about a third of it, and produced decks that read as a template with
the colours changed. The menu was the problem: given a list, the job becomes choosing, and
choosing is not designing.

So this is a method instead. It takes about ten minutes and it is the difference between a
deck somebody remembers and a deck somebody sits through.

---

## 1. Find the physical thing

Before any colour, answer this: **what is this deck made of?**

Not the topic — the material. A deck about Japanese swords is not "about swords", it is
*ink, steel, paper, and a dark forge*. A deck about warehouse logistics is *stencilled
crates, customs carbon paper, a barcode, fluorescent light*. A deck about a fintech
migration is *ledger rules, a stamped receipt, the green of a terminal*.

That noun phrase is your whole design language in compressed form. Everything below is
just unpacking it:

| the material | the ground | the ink | the accent | the face |
|---|---|---|---|---|
| a launch at night | near-black violet, a grainy glow | white | one hot orange | one grotesk, very large |
| stencilled crate | kraft brown | stencil black | hazard orange | condensed gothic |
| customs carbon | pale blue-grey | typewriter grey | rubber-stamp red | monospace |
| terminal ledger | near-black | phosphor green | amber | mono, one weight |
| a bank's cheque stock | rose-tinted security paper | intaglio indigo | one UV violet | a sharp slab serif |
| a botanical field guide | cream plate | sepia | one pressed-leaf green | a high-contrast serif, italic for names |

If you cannot name the material, you do not understand the subject well enough to design
for it yet. Go and read about the subject; the language falls out.

**A palette chosen because it looks nice is a palette. A palette chosen because it is the
colour of the thing is a design language.**

## 2. Ground first, and it does not have to be white

The ground decides more than anything else, and it is the decision most often made by
default. Three of the seven retired flavours shipped a near-white ground, which tells you
how strong the pull is.

A genuinely dark deck reads completely differently in a dim room. A saturated ground reads
as a brand asserting itself. A warm off-white reads as paper and lets ink behave like ink.
Pure `#FFFFFF` and pure `#000000` almost never do what you want: black kills a warm ink,
white kills a paper feel.

Then the ink, and it is not black either. `#191510` is sumi. `#0C0D10` is a screen.
`#1A1A1A` is what a printer gives you. They are different decks.

## 3. One accent, one job

Name the job out loud before you use it: *"the accent is the eyebrow and nothing else"*,
*"the accent is the one number per slide"*, *"the accent appears exactly twice in the
deck"*.

Two accents is a brand system, not a deck. The fastest way to destroy anything you have
built is a helpful third colour introduced "for hierarchy" on slide seven.

If you need a second non-ink colour for drawings, make it clearly *not* an accent — a cold
steel grey, a paper shadow — and forbid it from ever touching type.

## 4. Two or three faces, and pick them against each other

`--font-display` for headings and `--font-body` for copy carry the deck. Add a third only
when a job needs it: `--font-mono` for figures that line up, or `--font-alt` — a voice
reached mid-sentence with `~tildes~`: the serif inside a grotesk headline, the brush inside
a Latin sentence, the handwriting annotating a printed line. Pick it *against* the other
two; same-but-lighter is not a voice. The four slots are not a quota — a fourth face is
usually a mess. One family at several weights, a display face with a text face, a grotesk
with a serif, a mono that leads: each is a system, none is the answer. Choose by the
subject, and not by what you chose last time.

**Choose the class before the family.** Serif, slab, condensed gothic, wide display, mono,
script, grotesk: the material names one (intaglio print is a slab or a serif, a customs form
is typewriter mono, a race bib is condensed gothic), and only then do you pick a family in
it. The evals caught the next drift in the act: once decks stopped defaulting to a serif on
warm paper, eight of eight set their display in a sans. A grotesk is a choice when the
material asks for it, not the neutral answer — if the last decks all used one, this one
probably should not.

Two tricks worth knowing:

- **A font stack can be two scripts.** `"Cormorant Garamond", "Hina Mincho", serif` puts
  every Latin glyph in Cormorant and every Japanese glyph in Hina Mincho, in one string,
  with no markup — because Cormorant has no CJK and the browser falls through per glyph.
  Two scripts, each in the face built for it, in the same headline.
- **Weight is a design language, not a detail.** `--w-display: 300` and `--w-display: 700`
  in the same family are two different decks. Hairline at 180px is a completely different
  argument from heavy at 180px.

Every family you name in `vars` must appear in the one `fonts.google` spec, at every
weight you use, joined with `&family=`. A family that never loads does not error — it
falls through to the OS UI font and looks merely a bit off.

## 5. Build a scale, then refuse the middle

This is the step that separates a design language from a recolour, and it is the one most
often skipped, because the defaults are fine and fine is the enemy.

```
--fs-cover   150–220    the biggest thing in the deck
--fs-title    70–100    a slide heading
--fs-h2      ~title/2   --fs-h3  ~title/3
--fs-giant   300–420    a numeral or a character bled off the frame
--fs-lede     26–34     one supporting sentence
--fs-body     16–20     paragraphs
--fs-micro    13–16     furniture
--margin      88–140    --gutter  24–48
```

Sizes do **not** derive from each other. Move `--fs-title` and set `--fs-h2` and
`--fs-h3` yourself, or they stay at 46 and 30 against whatever scale you just chose.

Then the actual move: **decide on a gap and let nothing live in it.** Nothing between 34
and 84. Nothing between 28 and 60. Big or tiny, no middle. The gap is where the drama
comes from — it is why the headline lands, and a deck with a smooth ramp of eleven sizes
has no drama anywhere in it.

## 6. Name one signature move, then build it

A signature move is a **device**, not a colour: a vertical rail down one edge, a numeral
bled off the corner, a rule that grows one column per slide, a hairline that only ever
appears under the claim, a figure cropped by the frame on every third slide.

Put it in `theme.signature` in words. Then build it on at least three slides. `publish`
compares the two — a move that is named and never drawn produces a warning, because a deck
that claims an idea it does not have is worse than one that claims nothing.

The test of a good one: **remove it, and the deck should get noticeably worse.** If
nothing changes, it was decoration.

## 7. Compute the marks

If a mark could be drawn by hand in five minutes, it is not worth drawing. What is worth
drawing is what only a program can do:

- a curve from the **real function** — an arc with its sag dimensioned, a decay, an orbit
- a field whose **density is the data**
- a **seeded** wobble, so a hand-drawn line letters identically forever
- a **pattern tiled from geometry** — most traditional repeats are a half-drop, not a
  square lattice, and that offset is the whole difference between a fabric and a grid
- a diagram of the actual **object** — a cross-section, a cutaway, an exploded view. Real
  proportions. Nobody puts these in decks and they are the most memorable thing you can
  put on a slide.
- **loss of resolution as the point** — a stack of lines that goes solid is an honest way
  to say "past here, nobody can see the difference"

`lib/draw.mjs` has the primitives. `svg` blocks render exactly as written — `<defs>`,
`<pattern>`, `<clipPath>`, `<mask>`, gradients, text on a path. Anything SVG can do, a
slide can do.

## 8. Look at it, then break the safest thing

Publish, read the warnings, open the preview in a real browser, and look at the pictures.
Then ask the question that actually improves a deck: **which slide is the safest?** Find
the one that could be in anybody's deck, and replace it with the one that scares you a
little — the slide that is ninety per cent empty, the headline cropped by the frame, the
diagram with no words on it.

Build one of those per deck and keep it. It is the slide people photograph.

---

## The failure modes, in the order they happen

1. **A palette with slides in it.** Colour and a typeface, no scale, no move. Test: could
   you swap the three colours and have a different-looking deck? Then it is a recolour.
2. **A named move that was never built.** Free to write, so it gets written.
3. **The helpful third colour**, added on slide seven for hierarchy.
4. **A smooth type ramp** with no gap, so no size means anything.
5. **The middle-sized slide**, repeated: a heading, three columns, a caption. Individually
   fine, collectively a template.
6. **`--font-alt` unset**, so `~tildes~` are a silent no-op and one voice does everything.
7. **The last deck, again.** The strongest pull of all. If you cannot say in one sentence
   what is different about this one, you have not designed it — you have reused it.
