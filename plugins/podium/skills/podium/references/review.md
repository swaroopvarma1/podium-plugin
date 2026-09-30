# The review pass

Before you hand a deck over, look at every slide as the person will, and check it against
this list. Do it with pictures, not with the JSON: the overview from
`node lib/eyes.mjs "<look-url>"`, then full size (`--slides n,…`) for anything the
overview makes you doubt.

Write down what fails, slide by slide. Fix it **in the program**, publish, and look again.
Hand over only when the list comes back clean, or when what is left is a judgement you
name to the person.

## The argument

- Every slide title is a claim, not a label. "Churn halved after the move", not "Churn".
- One idea per slide. A slide making two points is two slides, or one point and a cut.
- Every slide moves the person named in the brief's outcome. The rest go.
- The last slide asks for the thing the brief says the room should do.

## What eyes measured

- No findings: nothing overflows, nothing sits on top of something it should not, every
  face loaded, no picture 404s.
- And the craft ones are clear too: `no hero`, `figure under hero scale`, `a ledger`,
  `flat grounds`, `statement under hero scale`, `proof run`, `proof too small`, `one hero, everywhere`, `one picture, everywhere`, `small type`, `empty
  lower band`, `marks too fine`. They are the judge's most common notes, measured — each one
  names the slides and what to do.
- Then the critic pass (SKILL.md): `critique.md` graded slide by slide, the three lowest
  rebuilt, until none is below 4.
- If a finding is deliberate (a bleed, an overlap that is the design), say so in the notes.

## Reading it where it will be seen

- The smallest text is readable on the screen the brief names. A phone or a lit
  projector needs more than a laptop on a call does.
- Every slide has one element the eye lands on first, and it is the claim.
- Contrast holds on the ground you chose, including over pictures.

## Impact — would it stand next to the best deck you know?

The argument can be flawless and the deck still a tidy page of text. These are the checks
that separated decks rated "okay" from the one held up as the standard:

- **Scale.** Each chapter has one hero slide — a statement at 180px+ (cinematic 200px+) or
  a number at 300px+, with almost nothing else on it, or one drawing filling the frame.
  Nothing is below 24px (22px inside a drawn interface).
- **Diagrams at room size.** A diagram carrying proof fills two thirds of the frame, labels
  20px+. Smaller, and it is a slide split waiting to happen.
- **The number is the biggest thing.** On a slide that exists for a number, that number is
  the largest element after nothing.
- **Light on every slide.** One lit treatment held across the deck — a tonal gradient with
  grain, a glow, depth under cards. Flat on purpose is allowed only when the system is so
  striking it is its own signature; say so in the notes.
- **Rhythm.** No more than three slides in a row with the same skeleton. Statements between
  runs of proof.
- **Faces.** Two or three. Count them from eyes' Faces line.
- **Headlines break on sense.** A real newline where the phrase turns — never "sign- / ups"
  or a lone word on the last line.
- **The default look.** If the deck is warm paper with a serif and a red or orange accent
  and the brief did not ask for that, it is the look every model drifts to. Change it.
- **Proof reaches the bottom.** On every proof slide, the proof fills two thirds of the frame
  and reaches its lower third — no top-half cluster over an empty band (eyes: `empty lower
  band`). Nothing under 24px (22px in a drawn interface; eyes: `small type`).
- **The hero move varies.** Count the slides using your hero device; past four, change its
  scale, position or form. And any dense field of marks: can the back row see the marks?
- **Motion, directed.** One transition kind for chapter changes, the crossfade elsewhere.
  Every click shows something (lint names an empty one). Each build reads on its own — look
  at the steps before the last with eyes, `--slides 4.1` (slide 4 after one click). No loop on words, and no
  more than one moving thing a slide.

## The design language

- The signature move is there, and it is not on every slide. A move on every slide is
  wallpaper.
- The accent has one job and does only that job.
- Only the theme's colours and faces appear; nothing slipped in from a reference.
- Pictures read as one set: the same palette, the same light, no lettering.

## What must not be there

- Nothing from the brief's `mustNot` list, anywhere, notes included.
- Every number is sourced. Illustrative ones are labelled on the slide itself.
- Nothing internal-only if the deck is going behind a share link.
- Every picture is theirs, licensed, or generated. No image found as a reference is in it.

## Handing over

- `notes` are sentences if somebody else presents it.
- A deck going behind a link has a poster.
- Every comment you acted on is resolved, with a reply saying what changed.
- Then hand it over in three lines: what it is, what you assumed, and the link.
