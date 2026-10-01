# The judge — fresh eyes on a finished deck

You made the deck, so you are its most generous reader: you know what every slide was meant
to say. A judge does not. It sees only what the room will see, holds it to a bar, and says
what to change. In Podium's own evals, decks whose authors had graded every slide 4 or more
were scored 3.6–3.9 by a reader who had only the pictures — and that reader's notes named
the same few faults on almost every deck, which is what makes them worth acting on.

## When

After the critic pass (SKILL.md), before you hand the deck over. Once for a quick deck;
until it scores 4 or more — at most twice more — for one that carries weight.

## How

**With a subagent** (Claude Code's Agent tool, or any way you have to start a second model
with a clean context): give it only this —

1. the overview picture(s) from `node lib/eyes.mjs "<look-url>"`, and three to six slides
   full size (`--slides`): the cover, the ask, and the slides your critique graded lowest;
2. the eyes text, including the line **Smallest type, measured** — judge legibility from
   those numbers, never from how small text looks in a scaled-down overview;
3. who the room is and how the deck reaches it (presented in a dim room, read on a laptop,
   opened on a phone) — one line from the brief;
4. this file.

Never your program, your reasoning or your critique: the point is a reader who has not been
told what the slides mean. Ask it for ONLY this JSON:

```json
{ "scores": { "argument": 0, "hierarchy": 0, "typography": 0, "composition": 0,
              "colour": 0, "imagery": 0, "system": 0, "finish": 0, "memorable": 0 },
  "overall": 0, "presentTomorrow": false,
  "worst": "slide n: why", "fix": ["the three changes that would raise it most"] }
```

Then make those three changes in the program — as rebuilds, not nudges — publish, look, and
judge again if it is still under 4.

**Without one** (claude.ai, a client with no way to start a second model): score it yourself
against the scale below from the pictures alone, as if someone else had made it, before you
re-read your program. Say in the hand-over that the judge was you.

## The scale

Nine dimensions, 1–5, half points allowed. Overall is their mean with **memorable counted
twice** — when people sorted finished decks by hand, it was the one that decided which they
kept: correct, generic decks the other eight scored over 4 were rejected. **The scale rewards craft
and deliberateness, never a style:** dark or light, photographic, drawn or purely
typographic, lit or flat, quiet or loud — any of them can score 5. What is scored is whether
every choice was made for this subject and this room, and whether the room can read it.

- **5** — a deck the room remembers: every slide's point unmistakable at a scale the back
  row cannot miss; a design language invented for this subject — its ground, colour, type
  and one signature move — held from the first slide to the last and developing as the
  argument moves; proof made for this deck, readable at room distance; emphasis and
  evidence taking turns. Rare.
- **4** — presentable tomorrow: each slide has one hero at hero scale, nothing is under
  24px, the proof fills the frame, the ground and colour were chosen rather than defaulted,
  and there is a beat between emphasis and evidence.
- **3** — tidy and forgettable: a 60–70px sentence as the biggest thing on content slides,
  a ground and colour that do no work, small labels as furniture, diagrams at a third of the
  frame, one move repeated slide after slide. Correct, consistent, and nobody will remember
  it.
- **2** — a default: the look you get without choosing — a template's look with this deck's
  words in it, or the palette any model reaches for unasked.
- **1** — broken: overflowing, overlapping, unreadable, missing pictures.

**Caps — apply before anything else.** A deck that trips one cannot score above it on that
dimension, however clean it is:

- Reads as tidy-and-forgettable (as described under 3, on most slides) → typography,
  composition and colour at most **3**.
- The look any model reaches for unasked — warm paper or off-white, a serif display, a red
  or orange accent — when the brief did not ask for it → colour at most **2.5**. (This caps
  a default, not a style: the same choices, made on purpose for a subject that wants them,
  are scored like any other.)
- Hierarchy **4+** needs hero slides: statements at 200px+ or figures at 280px+ with little
  else on the slide.
- Colour **4+** needs the colour to do work: a ground and an accent chosen for this subject,
  the accent with one job, and depth or atmosphere wherever the language calls for it. A
  flat system can score 5 when it is deliberate and striking; arbitrary or defaulted colour,
  however clean, is 3.
- Imagery **4+** needs the proof carried by visuals made for the deck, at a size the room
  can read.
- Measured type under 20px outside a drawn interface → typography at most **3**; under 14px
  → at most 2.
- **No crafted object on the cover** — a title over a rail, an arc or a row of boxes — or an
  idea that lives only in the theme's name → memorable at most **2.5**, and overall at most
  **3.5** whatever the rest scores.
- Paper lit from a corner until it reads khaki, sage or grey → colour at most **3**. Paper
  is meant to stay flat and its colour clear.
- Ghost numerals behind content, condensed all-caps headlines, or one joke repeated on
  every slide → memorable at most **3**.
- **Present tomorrow** only when the overall is 4 or more and nothing in Finish is visible.

## The dimensions

1. **Argument.** Every title a claim; one idea a slide; it builds to the ask. Read only the
   titles and the case holds.
2. **Hierarchy.** On every slide the eye lands first on the one thing that matters. Scale
   contrast is real.
3. **Typography.** A scale with real contrast; two or three faces; emphasis that means
   something; nothing too small for the screen in the brief; headlines that break on sense.
4. **Composition.** A grid you can feel, deliberate space, layouts that vary with the
   content and belong to one system; the proof reaching the lower third.
5. **Colour and atmosphere.** A ground and an accent chosen for this subject, the accent
   with one job, and a mood a person would remember — whether that comes from light, from a
   photograph, or from a flat field used with conviction.
6. **Imagery and data.** Charts, diagrams, screens and pictures made for this deck, carrying
   the proof at a size the room reads, reading as one set.
7. **System and rhythm.** One language from first slide to last; statements alternate with
   proof; the signature recurs and changes rather than repeating.
8. **Finish.** Nothing overflows, overlaps by accident or sits outside the frame; no
   placeholder, no missing picture; numbers and units consistent.
9. **Memorable.** The cover carries one crafted object you could name from a thumbnail; the
   idea shows on the slides, not just in the theme's name; a read deck still has poster
   moments; nothing a hundred other decks have. Would a person keep this one over a
   correct, generic version of the same deck? Any style can score 5 here.
