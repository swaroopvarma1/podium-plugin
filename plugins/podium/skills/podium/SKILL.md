---
name: podium
description: Build a presentation deck, or a web page people scroll, and publish it to Podium — run on your machine, or on Podium itself with the build tool when you have no shell (claude.ai chat). Use when asked to make or design a deck, presentation, slides, pitch or talk — or a page, one-pager, microsite, web report or landing page. Your first reply is questions, not a deck — and always first among them, something to point at (a Pinterest pin or board, a Behance or Dribbble shot, a screenshot, a deck or site they like), then the audience, the one claim, and — when image generation is off for them — whether to get access or go without. The reference question carries Pinterest, Behance and Dribbble links already searched for their subject, so they can click, pick two and paste screenshots back — or say "you pick". Then show two or three covers as pictures and let them pick before you build. There are no templates and no layouts: you invent the design language and arrange every slide yourself.
---

# Podium

Podium renders and hosts decks and pages. **It does not design them**: no templates, no
layouts. You write a **program** that emits the deck, publish it, look at the picture, and
change the program.

This file is the procedure, in order. Each step's detail is a file in `references/`, named at
the step that needs it. **Open that file at that step**; this summary does not replace it.

| When | Read |
|---|---|
| Before the first publish | `references/vocabulary.md`: every field, role and default |
| Before you write the questions | `references/asking.md` |
| It carries weight: a pitch, a board deck, a launch | `references/brief.md` (the thorough brief) |
| Setting up the program; no shell; eyes; a poster; a PDF | `references/setup.md` |
| Before you choose a colour | `references/inventing-a-design-language.md` |
| Presented to a room / read closely | `references/cinematic.md` / `references/editorial.md` |
| Laying out slides; the floor in full; motion | `references/slides.md` |
| Before the first `generate_image`, or placing any picture | `references/pictures.md` |
| A page people scroll, not slides | `references/pages.md` |
| The tools; comments on a deck; what will bite you | `references/tools.md` |
| Before you hand it over | `references/review.md`, then `references/judge.md` |
| They have their own deck skill | `references/personal-skills.md` |
| They name a preset (never otherwise) | `references/presets.md` |

**Deck or page?** Presented, or paged slide by slide → a **deck** (blocks on a 1920×1080
plane). Read by scrolling → a **page** (one HTML document; `references/pages.md` first). The
brief, the critic and the judge are the same for both.

**Their own deck skill comes first.** If one of your skills is for how this person builds
decks, load it now as part of the brief: its rules beat this skill's defaults; the floor still
holds. Several? Ask which (`node lib/personal-skill.mjs list`). When a deck turns out well, offer
to save it (`… new <name> --from <project>/<deck>`); a standing "always/never" goes in with
`… add <name> --always "…"`.

## 1. The first ten minutes

A one-line request — *"make me a deck about Q3"* — settles neither of the two things that
decide whether the deck is any good: what it is for, and how it looks. So the first ten
minutes always run the same way, and the person's first deck depends on them:

1. **Questions, one batch** (step 2), and **the reference question always
   first, with the links already in it**:

   > **First, something to point at.** Paste screenshots of a deck, site or brand guide
   > whose look you like — two is better than one. Nothing to hand? Open one of these,
   > already searched for your subject, and paste back two you like:
   >
   > 📌 Pinterest — board report editorial: [click here](…)
   > 🎨 Behance — board report editorial: [click here](…)
   > 🏀 Dribbble — board report editorial: [click here](…)
   >
   > Or say **"you pick"** and I'll show you three covers in different looks.

   Make the links from what they asked for, before you ask:
   `node lib/references.mjs --ask "<query>"` prints them ready to paste (no shell: write
   them yourself, in the form below). They go in the message text, not in `AskUserQuestion`'s
   options, which cannot take a picture back; there the reference question's options are
   *"I'll paste screenshots next"* (the default) and *"You pick"*. A reference is the one
   answer that most improves the deck, and asking it first gives them time to find one
   while they answer the rest. Then the decision and the one person; how
   it reaches the room and on what screen; what must not be on it and where the numbers
   come from. A default marked on each. Call
   `generate_image({ check: true })` first: if it is off, the batch offers the choice
   (step 2). With no shell, write the three lines by hand, the query URL-encoded:


   ```
   📌 Pinterest — <query>: [click here](https://www.pinterest.com/search/pins/?q=<query>)
   🎨 Behance — <query>: [click here](https://www.behance.net/search/projects/<query>)
   🏀 Dribbble — <query>: [click here](https://dribbble.com/search/<query>)
   ```
2. **Covers, as pictures** (step 3): two or three covers in looks that disagree, each
   with one crafted object on it — generated, when generation is on
   (`references/pictures.md`) — as one small deck. They pick from the pictures, not from your
   descriptions.
3. **The argument**, as slide titles that are claims. Approve, or say what moves.
4. **Then build** — the program, looking at every slide — and run the critic and the judge
   before anybody else sees it.

Skip step 2 only when the look is already decided: a reference they handed you, a house
style that binds, a preset they named, the next instalment of a series. "Quick" is not a
reason to skip it — a deck whose look nobody chose is the deck people reject.

## 2. Ask: one batch, before `build.mjs` exists

**Open `references/asking.md` before you write the batch**: each kind of reference, "you
pick", what they hate, their own deck, brand guides, nobody answering.

- **One round** of up to four questions, a default marked on each, options that disagree and
  read as consequences ("near-black ground, which makes the charts quieter"), never a menu of
  ready-made looks. **Name the line of `build.mjs` each answer changes, or drop the question.**
  More than four apply? The rest go in the message text, one line each, default marked.
- **Slot one is always the reference question**, first, with the links. Ask for two: what they
  share is the brief. Read a reference for its decisions (sample the ground and ink from the
  pixels, measure the type ratio and the margin), say back in two lines what you took and what
  you left, and when it is a deck, match one slide before you build forty. A reference sets the
  register, never the recipe: the palette and faces still come from the subject.
- **Then, in order, the first that apply:** what the room must *do*, and the one person whose
  mind must change (a name and a job); presented, read alone, or presented by somebody else (then
  `notes` are full sentences, and they never reach a share link); the screen and the network;
  whether a house style binds; what must **not** be on it; where each number comes from and
  whether it may leave the room (illustrative figures are labelled on the slide). When they
  apply: the script the words are in, and whether it is an instalment (then `decks` gives you
  the last theme).
- **Presets:** one line inside the reference question, default **no**. Never pick, suggest or
  browse one yourself.
- **Image generation:** `generate_image({ check: true })` before you ask. Off → it goes in the
  batch: "<admin named in the check> can turn image generation on for you — get access, or go
  without?" Default: without. On or off, ask whether generated imagery is allowed at all and
  whether real photography exists.
- **Thorough brief** (`references/brief.md`): offer it in the first question when the deck
  carries weight; take no for an answer.
- **Record the brief:** `publish({ brief })`, or `deck.brief` in a program: the answers, the
  references and what you took from each, the direction picked, what you assumed. Read it at the
  start of every later session and never re-ask what it answers.
- **Only the argument and a binding house style block.** Assume the rest and say so. Never
  ask what you can find out: open the URL, read the folder, call `decks`.
- **Nobody answering?** Write the three guesses (audience, length, the design language as a noun
  phrase) at the top of `build.mjs`, publish unlisted, look, and show the pictures. The first
  version is a better question than any question.

## 3. Directions, then the outline

**Directions.** Before forty slides, show two or three ways the deck could look, each as ONE
finished slide: the cover, carrying its one crafted object (step 5). Make them disagree on
every axis — a lit ground against a paper one, a serif against a grotesk, loud against quiet —
and name each as a noun phrase from THIS subject (*"harbour at dawn: fog ground, one signal
colour, a slab serif"* is the shape of a name, not a suggestion). Build them as one small deck, `<id>-directions`, publish it unlisted,
look at it, and put the pictures and the link in front of the person. They pick with one
question, or pin comments on the one to change. Record the pick in the brief: a direction chosen
from a picture is a decision; one chosen from a description is a guess.

**The outline.** Then the argument as numbered slide titles, each a claim: *"3 — Churn halved
after the move"*, not *"3 — Churn"*. Mark which slide carries which number and where the ask
is. One question: approve, or say what moves.

Skip the directions only when the look is already decided (step 1), and the outline only when
they handed you the argument as a document.

## 4. Build: the program, then look

```
brief  →  references  →  directions  →  outline  →  build ⟲ look  →  review  →  hand over
build.mjs   →   deck.json   →   publish   →   look at it   →   change build.mjs
```

Copy `lib/` next to the deck with node (`cp -R` stops for permission every time):

```bash
node -e "require('fs').cpSync(process.argv[1] + '/lib', 'lib', { recursive: true })" <this skill's folder>
```

```js
import { Deck, text, svg, image, group, grid, publish, poster } from './lib/podium.mjs';
import { rng, noise, hatch, contours, stipple } from './lib/draw.mjs';
import { aurora, dusk, spotlight, glow, glass, stars } from './lib/atmosphere.mjs';  // light, in your colours
```

`node build.mjs` publishes (token: `PODIUM_TOKEN`, else Claude Code's `podium` entry). **No
token or no shell:** send the program to the `build` tool; look with `look({ id })`. Then,
after every publish:

1. **Read `warnings[]` before the picture.** They name what a screenshot cannot show: a
   `fonts.google` spec that failed, a scale you never set, a chart encoding you destroyed.
2. **Look.** `node lib/eyes.mjs "<look-url>"` writes every slide to `shots/` (`--slides 3,7`
   full size) and prints what it measured: faces, overflow, overlaps, broken pictures. **Read
   the pictures**: every layout bug here survived a clean build and died when somebody looked.
3. **Change the program**, never the JSON. `publish` replaces the whole deck: resend it.

A shared deck gets a poster; an emailed one, `node lib/pdf.mjs <share-url>`. How:
`references/setup.md`.

## 5. The design language and the floor

**Open `references/inventing-a-design-language.md` before you choose a colour.** In short: the
language comes from what the subject is *made of*; two inks and one accent with one job; a
scale that refuses the middle; two or three faces picked against each other; one signature
move, named in `theme.signature` and built on three slides.

- **Unlike their last decks:** `decks()` shows them; pick a ground hue, accent hue and
  display face none of the last five used, unless the brief asks for continuity. How light the
  ground is belongs to the room. Warm paper + serif + red/orange is where models drift: only
  when asked.
- **The register:** presented to a room → `references/cinematic.md`; read closely →
  `references/editorial.md`. Say which in the brief.
- **Memorable:** the cover carries one crafted object from this subject, recognisable at
  thumbnail size; a read deck still gets a poster moment every three or four slides; no ghost
  chapter numerals, no tall condensed capitals, no joke repeated on every slide.

**The floor: every deck, every slide.** Eyes flags each; the full text is in `references/slides.md`.

1. Nothing under 24px on the 1920 plane (22px inside a drawn interface).
2. Two or three faces.
3. One hero per slide: a figure at 280px+, a statement at 200–230px with almost nothing else,
   or a drawing across two thirds of the frame.
4. A slide that exists for a number: the number is the biggest thing on it, 280px+.
5. Dark grounds get light with range (a glow behind the hero; a gradient 25–35% darker at its
   far edge). Paper stays flat and its colour clear.
6. No more than three slides in a row on one skeleton; a statement slide after every three or
   four proof slides.
7. Headlines break where the sense breaks, with a real newline.
8. The accent has one job.
9. The proof fills two thirds of the frame and reaches its lower third.
10. The hero move varies: one device on more than four slides is wallpaper.
11. Marks a room can see: 8px or more.
12. No ledgers: past about twenty-five pieces of text, lead with the three or four figures.

Slide mechanics (`at`, roles, `style.scale`, `style.ink`, rich text, motion):
`references/slides.md`.

## 6. Pictures

With generation on, the cover is usually one object generated for this deck, never stock.
Name the object before you prompt; prompt the object, not the mood; make three at medium, pick
by looking, and remake the keeper at xhigh; ban lettering; the palette's first colour is the
surface the picture lands on. Art goes in a hole the composition already left, one to three
pictures a deck, never behind the copy. The person's own come in through `add_pictures`.
**Open `references/pictures.md` before the first `generate_image`**, including *Making the hero
object*.

## 7. Review before you hand it over — the critic

**A clean eyes report is where the review starts, not where it ends.** Eyes measures; the rest
is judgement, and agents that stopped at a clean report shipped the same faults on every deck.

1. Open the overview picture. For every slide, one line in `critique.md` next to the program:
   its hero (what, how big), what a projector in a lit room does to it, and a grade from 1 to 5
   against the best keynote you know (presented) or the best annual report page (read). A 4 has
   one unmistakable hero, a ground and colour chosen rather than defaulted, nothing under 24px,
   and the proof reaching the lower third. A 3 is tidy and forgettable. Grade the cover twice:
   one crafted object? the idea visible at thumbnail size? (The scale: `references/judge.md`.)
2. **Rebuild** the three lowest slides — the composition, not the font size: the number becomes
   the hero, the diagram takes two thirds of the frame, the ledger becomes four figures, the flat
   ground gets its light.
3. Publish, look, grade them again, until no slide is below 4 or three rounds have passed. Then
   `references/review.md`: the argument, the design language, the brief's must-not list.
4. **The judge, `references/judge.md`:** a subagent that gets only the pictures, eyes'
   measurements, one line about the room and the scale — never your program or reasoning — and
   returns scores and the three changes that would raise it most. Make them; judge again while
   it is under 4 (at most twice more). No subagent? Judge it yourself from the pictures alone.
5. **Three checks, every time.** *The brief is current*: every decision made during the build (a
   changed colour, a rule broken on purpose, a dropped direction) goes into `brief` on the last
   publish. *No warning you caused is unexplained*: fix each, or say in the brief why it stays.
   *Claim only what you checked*: a drawn barcode is "barcode-styled" unless you scanned it, a
   figure is "illustrative" unless the person gave it, a font "loaded" only if eyes said so.

Hand it over in three lines: what it is, what you assumed, and the link.

## 8. After hand-over

- **Comments steer the deck.** Read the comments in `decks({ id })` before you rebuild a deck
  anybody has looked at. Fix in the program, publish with `resolve: [{ comment, reply }]`, and
  never resolve a comment you did not act on. Give every slide an authored `id`.
  (`references/tools.md`)
- **Never invent a number.** If a figure is illustrative, say so on the slide.
- **Speaker `notes` never leave the account**: the caveat and the anticipated question go there.
