---
name: podium
description: Build a presentation deck, or a web page people scroll, and publish it to Podium — run on your machine, or on Podium itself with the build tool when you have no shell (claude.ai chat). Use when asked to make or design a deck, presentation, slides, pitch or talk — or a page, one-pager, microsite, web report or landing page. Ask the user about the audience, the one claim, any design or image references they can point at, and whether an image-generation endpoint is available — before building anything, with a thorough brief for decks that carry weight; when they have nothing to point at, search for references with them. There are no templates and no layouts: you invent the design language and arrange every slide yourself.
---

# Podium

Podium renders decks and hosts them. **It does not design them.** There are no templates,
no layouts, no flavours and no flags — there used to be, and every deck built on them came
out looking like the same deck with different words in it.

What you get instead is a plane, a type scale, paint — gradients, glass, glow, shadow,
grain — and a browser that will show you exactly what you made.

**Read [`references/vocabulary.md`](references/vocabulary.md) before the first publish.**
It is every field, value and default a deck can use — what each text role draws, every
style key, paint, how pictures load — generated from the code that renders it. The tool
descriptions are a summary: clients cut them short.

## Decks and pages

Podium hosts two kinds of document, at the same links, with the same comments, versions and
sharing:

- **A deck** — slides on a fixed plane, clicked through or presented. Everything below is
  about decks.
- **A page** — one web page people scroll, built once and holding on a phone and a desktop:
  a closing note, a launch page, a report. It is one HTML document, not blocks on a plane.
  **Read `references/pages.md` before you start one.**

The rule: presented, or paged slide by slide → a deck. Read by scrolling, on any screen →
a page. The brief, the references, the critic and the judge are the same for both.

## The shape of the work

You write a **program** that emits a deck, run it, publish it, look at the picture, and
change the program. Not JSON typed by hand — a script, next to the deck, in the repo.

```
build.mjs   →   deck.json   →   publish   →   look at it   →   change build.mjs
```

Around that loop sits the part that decides whether it was worth running:

```
brief  →  references  →  directions  →  outline  →  build ⟲ look  →  review  →  hand over
```

Ask first (*Ask before you build*); find something to point at; show two or three
directions as one slide each and let them pick; agree the argument as a list of slide
titles; build; then review every slide against a written list before anybody else sees it.
A quick deck whose look and argument are already settled skips straight from the brief to
the build. A deck that carries weight does every step, because each one is minutes and
each one it skips is a rebuild.

That loop is the whole method, and the program is not a convenience. It is the thing that
makes a deck possible to design: the grid becomes arithmetic instead of guesswork, a mark
becomes a function instead of a shape you typed, and re-running costs nothing so you can
afford to be wrong six times. A deck typed by hand stops at what a person is willing to
type, which is roughly four rectangles.

Copy `lib/` next to your deck and start. Copy it with node — `cp -R` stops for a
person's permission every time, and node does not:

```bash
node -e "require('fs').cpSync(process.argv[1] + '/lib', 'lib', { recursive: true })" <this skill's folder>
```

```js
import { Deck, text, svg, image, group, grid, publish, poster } from './lib/podium.mjs';
import { rng, noise, hatch, contours, stipple } from './lib/draw.mjs';
import { aurora, dusk, spotlight, glow, glass, stars } from './lib/atmosphere.mjs';  // light, in your colours
```

`node build.mjs` writes and publishes. Then **look**, with the `look` URL that `publish`
returned:

```bash
node lib/eyes.mjs "<look-url>"              # every slide, twelve to a picture → shots/
node lib/eyes.mjs "<look-url>" --slides 3,7 # up to six slides full size      → shots/
```

It prints the measurements (faces that never loaded, text that overflows, blocks on top of
each other, pictures that 404) and writes the pictures to `shots/`. **Read the pictures.**
Every layout bug this project has ever had survived a clean build, a green test run and a
validator with nothing to say, and died the moment somebody looked at a picture.

### No shell? The program runs on Podium

In claude.ai chat, the desktop app's chat or on a phone there is no machine to run
`build.mjs` on, so Podium runs it. The method is the same program and the same loop; the
program goes to the **`build`** tool as files instead of to `node`, and the pictures come
back from the **`look`** tool instead of `lib/eyes.mjs`:

```
build({ files: [{ path: "build.mjs", body }, { path: "marks.mjs", body }] })
look({ id })                         → the slides as pictures, with the measurements
build({ id, files: [one changed file] })  → the rest of the program is kept with the deck
look({ id, slides: [3, 7] })         → full size
```

- `build.mjs` imports from `./lib/podium.mjs`, `./lib/draw.mjs` and `./lib/atmosphere.mjs`
  exactly as above; Podium puts this skill's `lib/` next to it. End with
  `await publish(deck)`, which on Podium hands the deck back instead of calling the server.
- It runs **offline**, for up to 30 seconds. Pictures are `/m/…` paths written into the
  program: the person's own come in through `add_pictures` (below, *Pictures*), generated
  ones from `generate_image`. `poster()` and `upload()` do not work there; skip the poster,
  since a chat has no screenshot file to make it from.
- A program that throws comes back as an error with its output. Fix the file, send it again.
- `decks({ id, program: true })` returns the kept program, so any later session, yours or
  a teammate's in Claude Code, picks the deck up from the program rather than from the JSON.

Everything else in this skill holds as written: ask first, look after every build, the
floor, the critic.

### Eyes: nothing to set up

`lib/eyes.mjs` ships in this skill and drives the Chrome already installed on this
machine. It needs Node 18+ and Chrome, and nothing else: no npm install, no registration,
no restart. If Chrome lives somewhere unusual, set `PODIUM_CHROME` to the browser's binary
(Chromium, Edge and Brave work too). If this skill is not on the machine, the file is also
at `https://podium.breezelabs.app/skill/lib/eyes.mjs`: one file, Node built-ins only.

The same file is also an MCP server with one tool, `look`, which returns the pictures
inside the tool result. That is optional, and it is the way to look from a client with no
shell, such as Claude Desktop (put the same command in its MCP config). In Claude Code it
is one command, and takes effect from the next session:

```bash
claude mcp add --scope user podium-eyes -- node ${CLAUDE_SKILL_DIR}/lib/eyes.mjs
```

Use `look` when you have it, and the command when you don't. Looking is not optional in
either case.

`lib/podium.mjs`, `lib/draw.mjs` and `lib/eyes.mjs` need nothing but Node (and, for eyes, the
Chrome). `lib/look.mjs` and `lib/pdf.mjs`
drive a browser, so they need two things the others do not: **`npm i playwright` in the
deck folder** (it is imported, not bundled), and **Google Chrome installed** on the machine.
They launch the installed Chrome (`channel: 'chrome'`), not Playwright's own Chromium, so a
bare `npx playwright install` does not help when Chrome is missing — install Chrome itself,
or run `npx playwright install chrome`, which does exactly that.

**When a deck is going behind a link, give it a poster.** A pasted share link with no
picture is a grey rectangle with a title on it, which is most of the reason people stop
pasting them. Write the cover to a file first, with `node lib/eyes.mjs "<look-url>" --slides 1`
(→ `shots/slide-01.png`) or `look.mjs` (→ `shots/s01.png`):

```js
deck.poster = await poster('shots/slide-01.png', deck);   // from lib/podium.mjs
await publish(deck, { visibility: 'unlisted' });
```

Podium cannot make that image itself and will not — there is no browser on the server,
which is the reason it costs nothing to run. Yours already has one open.

`node lib/pdf.mjs <share-url> deck.pdf` is the third one, because almost every deck gets
emailed in the end. It needs the SHARE link rather than the stage, which is behind the
account — an unauthenticated capture of the stage produces a login page with no slides on
it, and says so rather than writing a blank file.

## Their own deck skill — look for it first, offer it last

A person who makes decks often has a way they want every time: their brand, their
structure, the words they never use. That lives in **their own deck skill** — a plain skill
folder beside this one (`~/.claude/skills/<name>/`, or a team's in a repo's
`.claude/skills/`). **Read `references/personal-skills.md`.**

- **First:** if one of your skills says it is for how this person builds decks, load it now
  and treat it as part of the brief. Its rules win over this skill's defaults, its brand is
  asked-for continuity, and the craft floor still holds unless it says otherwise. Several?
  Ask which, with your other questions. `node lib/personal-skill.mjs list` shows them.
- **Last:** when a deck turns out well, offer in one line to save how you built it as their
  deck skill — `node lib/personal-skill.mjs new <name> --from <project>/<deck>`. When they
  state a standing preference mid-session ("always…", "never…"), add it
  (`… add <name> --always "…"`) and say so.

## Ask before you build

A deck is a commission, not a search result. Somebody is going to stand up in a room and
be judged on it, and everything you are about to build hangs off four or five facts you
do not have: what the room is being asked to decide, whether anyone talks over the
slides, whether a house style binds this, whether there are pictures in it. Guess one
wrong and it is not an edit, it is a rebuild — every slide was composed against the
ground, the scale and the move you chose in the first ten minutes.

The opposite failure is the one agents actually commit: eleven questions, one at a time,
each one blocking, half of them answerable by reading the folder. The user is on a
phone. They answer the first and put the phone down.

So: one batch, before `build.mjs` exists.

### Quick, or thorough

The one batch below is the **quick** brief, and it is the default. A deck that carries
weight — a pitch, a board deck, a launch, anything a customer sees — earns the **thorough**
one: three short rounds, twelve questions, in `references/brief.md`. Offer it as an option
in the first question when the stakes call for it, and take no for an answer.

Either way, **record the brief**: `publish` takes `brief` — what they answered, the
references and what you took from each, the direction they picked, and what you assumed —
and `decks({ id })` hands it back. It never reaches a share link. Read it at the start of
every later session and never re-ask what it answers; that is how a teammate's agent picks
the deck up without starting the conversation over.

### One round, four questions

`AskUserQuestion` takes up to four questions at once, two to four options each, and the
user can always type something you did not offer. Sixteen option-slots is the budget,
and the budget is the point.

**Before you ask, name the line of `build.mjs` the answer changes. If you cannot name
it, drop the question.** "What tone are you after?" changes nothing you can act on.
"Presented live, or sent as a link and read alone?" changes how much text sits on a
slide, which changes the type scale, which changes every slide.

Give every question a default and mark it, so somebody who does not care can tap once. A
question with no default is a question handing your job back to the user. Make the
options positions that disagree with each other — two options that both mean "clean and
modern" produce a coin flip and tell you nothing. Write them as consequences: not
"darker ground" but "near-black ground, which makes the charts quieter and the cover
louder". Invent those options from the subject each time; there is no menu here and
offering the user three ready-made design languages is the flavours menu coming back
through the window.

One question can carry two decisions when the options are combinations — "twenty
minutes, presented" against "sent as a link" settles length and density in one slot.

### What to spend the four slots on

In rough order. Take the first four that apply to this deck.

1. **What do you want the room to *do* when it ends, and who is the one person whose
   mind has to change?** Ask for a name and a job, not a segment. This is the only
   question that usually needs a free-text line, because "approve the migration budget"
   is not something you can enumerate. Without it you have no cutting rule and every
   slide stays.
2. **Presented, read alone, or presented by somebody who is not you?** The third case is
   common and nobody offers it. A deck a stranger presents needs `notes` that are
   sentences rather than cues — and `notes` are stripped from every public link, so if
   they only ever get the share link, the script never reaches them and you owe them a
   second artefact. Ask who is standing up.
3. **Where is it on screen — projector in a lit room, laptop over a call, a phone, a
   recording?** Novices never ask this and it kills more decks than any palette choice.
   A deep ground goes to flat grey on a conference-room projector, hairlines dissolve in
   video compression, `--fs-micro` at 14 is unreadable on a phone, and a 4:3 projector
   letterboxes the fixed plane so anything bled off the bottom lands in a black band.
   Ask about the network in the same breath: the faces come from one `fonts.google` spec
   fetched at render time and the art is hosted media, so a locked-down guest network
   means the OS UI font and empty plates at the moment it matters.
4. **Does a house style bind this, or is it yours to invent?** If it goes to brand
   review and you invented a palette, the review kills the deck.
5. **Design references** — below, and worth a slot on almost every deck.
6. **A preset to start from** — below. One line inside the references question, not a
   slot of its own: *"is there a preset you want to start from? Browse `<podium>/presets`
   — or say no and I'll invent one."* The default is **no**.
7. **Image generation** — below, but only after you have checked whether it is already
   configured.
8. **What must not be in this deck?** Ask it in those words. People will spend ten
   minutes on what the deck should say and never mention that a competitor cannot be
   named, that a customer's logo is not cleared, that headcount is not shown, that a
   roadmap date was walked back last week, or that the person in the case study has
   left. None of it is secret and none of it is volunteered, because to them it is
   background and to you it is a landmine.
9. **Where does each number come from, and can it appear on a link that leaves the
   room?** Not whether the numbers are right — whether they are publishable. A figure
   can be true, sourced and still under NDA, and a share link is a link. Sort them into
   published, internal, and illustrative. Illustrative gets labelled on the slide, not
   in `notes` where the reader never sees it.

Two more that only matter sometimes, and cost a rebuild when they apply: **what script
are the words in** — a display face chosen for a Latin headline has no Devanagari,
Arabic or CJK, and a missing glyph falls through silently on exactly the slide carrying
a customer's name; right-to-left inverts the reading order, so a signature move anchored
to the left edge is on the wrong side of the deck. And **is this an instalment?** A
monthly review or episode four of a series is the exception to "recognisably unlike the
last deck" — the audience reads a redesign as a different meeting. If it is one, pull
the previous deck's theme with `decks` rather than describing it off a screenshot.

### References: ask for something to point at

Adjectives cannot start a design. Nobody has ever asked for a dirty, dated deck, so
"clean and modern" constrains nothing. Ask instead: **is there anything you can point
at?** — and list the forms, because people assume you mean a template and do not think
the paperback on their desk counts. It counts, and the physical one they picked up
themselves is usually the best of the lot.

Ask for two. One reference is ambiguous — you cannot tell which part they liked. Two
share something, and the shared thing is the brief.

| it arrives as | what to do with it |
|---|---|
| **an image** — screenshot, poster, photo of a printed thing | `Read` it. Images come back visually; you can genuinely look at it. Highest-value form, so ask for it by name. |
| **a PDF** — their deck, a report, a brand guide | `Read` it with a page range. Take the cover, one dense page and one sparse one. The cover shows the ambition, the dense page shows the real body size. |
| **a .pptx** | It is a zip. `ppt/theme/theme1.xml` has the exact colours and the major/minor font names; `ppt/media/` has the imagery. That gets you the palette, not the look — for the look ask for four slides exported as PDF or PNG. |
| **Keynote, Canva, Figma** | Ask for a PDF or PNG export. One exported frame tells you more than the source file and costs nothing. |
| **a URL** | Fetching it strips the design and hands you text, which is the opposite of what you want. Hand it to eyes, `node lib/eyes.mjs "<url>"` (or `look`): any URL that is not a deck comes back as a picture of the page. |
| **a name with no file** — "like the Economist" | Say back what you think they mean, in specifics: *near-black ground, one red, a serif at two sizes and nothing between them.* Half the time the correction is the brief. |
| **nothing** | Search with them — *When they have nothing to point at*, below. Or build the cover three ways (*Directions*, below) and let the pictures be the question. |

Read a reference for its decisions, not its surface. Sample the ground and the ink out
of the actual pixels rather than naming them by eye — "warm off-white" is four different
grounds, and one guessed from a screenshot lands two shades cool every time. Measure the
ratio between the largest and smallest type, and whether there is a gap in the middle.
Measure the margin as a fraction of the frame; most references are far emptier than they
feel. Note any device that repeats. Put the sampled values in `build.mjs` with a comment
naming which reference each came from.

**A reference tells you the register, not the recipe.** It tells you how loud, how
dense, how much air. The palette and the faces still come from the subject — the
physical thing, section 1 of `references/inventing-a-design-language.md`. Lift a
reference's actual colours and typeface and you have made a worse copy of it, and they
will feel the deck is second-hand in about two seconds.

Then say back, in two lines, what you took and what you deliberately left, before you
build forty slides on it. *"From the report I am taking the near-empty covers, the
margin at about a seventh of the width, and one accent used only on numerals. I am not
taking the blue or the serif."* This catches the expensive failure: they showed you that
deck for its photography and you came away with its typeface. A user who hands over a
reference and gets back something unrecognisable concludes you ignored it.

**Match one slide before you build forty.** When the reference is a deck, rebuild one or
two of its slides first — the densest and the loudest — at full size, and put your render
beside theirs (`node lib/eyes.mjs "<look-url>" --slides n`) until they match at a glance.
It is the fastest way to learn the reference's real numbers: the type sizes, how much of
the frame is empty, how the light is built, how thick a rule is. This is how the best decks
Podium has produced were made; an investor deck and two customer decks rebuilt this way
matched their originals within an afternoon. Then build the new deck at THAT level — in
your own palette unless it is their own brand.

A reference will name faces that are not on Google Fonts. Pick the nearest one you can
actually load and say which — a family that never loads does not error, it falls through
to the OS UI font and looks merely a bit off.

### When they have nothing to point at

Search with them. Turn the brief into two or three queries — the medium, the register and
the subject, never adjectives: *"annual report editorial layout"*, *"aurora gradient keynote"*,
*"swiss grid pitch deck"*, not *"clean modern deck"*. Then:

```bash
node lib/references.mjs "annual report editorial layout" "aurora gradient keynote"
```

It prints search links in two groups. **Look at the first group yourself** — Cosmos,
Are.na, Dribbble, Fonts In Use — with `node lib/eyes.mjs "<url>"`, which returns the top
two screens of the results. Pick four to six that pull in different directions and say
what each one shows in a line. **Give the person the second group** — Pinterest first, then
Behance, Savee, Unsplash — to open themselves: those sites put results behind a sign-in or
refuse automated browsers, and getting round that is not your job. Ask for two they like,
as a screenshot or the image's link, and read what comes back like any other reference.

If `generate_image({ check: true })` says generation is on, you can also make two or three
mood pictures in candidate palettes, to react to rather than to use.

**A reference sets the direction. Nothing found this way goes into the deck.** It is somebody
else's work. Pictures in a deck are the person's own, licensed (Unsplash's licence allows
it; note where each one came from), or generated.

### Starting from a preset — only if they ask for one

A **preset** is a design language somebody published: a theme, the program that draws its
marks, and a few slides as a sample. They live at `<podium>/presets` and the `presets`
tool reads them.

**You do not pick one. Ever.** Ask, in the same breath as the references question, and
take *no* as the good answer it usually is. This is not a style rule, it is the entire
reason the registry is allowed to exist: what got deleted from this product was a fixed
menu of built-in design languages handed to every agent, and two agents on two different
services both reached for the same entry and produced the same deck. A registry a
**person** browses is a shelf. A registry an **agent** browses is that menu again, with
more entries on it.

So the question is *"is there a preset you want to start from?"* — never *"I found these
three, which do you like?"* If you catch yourself calling `presets` with no id in order to
decide something, stop: that call is for showing the user what exists, and they are
already looking at the gallery.

When they do name one:

```
presets({ id: "riso" })        →  theme, sample, and files[{path, body}]
```

1. **Write the files next to your deck** and import them. They are the reason a preset is
   worth anything — a theme on its own gets copied as a palette, and a palette without its
   grid, its scale and its one signature move is a recolour.
2. **Read them before you run them.** This is somebody else's code, arriving over a wire,
   and you are about to execute it on your user's machine. Skim every file. If a build
   script reaches outside its own folder, touches the network, or reads anything it did not
   ship with, stop and tell the user what you found instead of running it. Podium checks
   the *paths* — no `..`, no absolute paths, no hidden files — and that is all it can check.
   The contents are your job. The presets Podium ships write `deck.json` and nothing else
   when run as `node build.mjs`; they publish only when you add `--publish`, so running
   one to look at it never puts a deck in the user's library.
3. **Then take it somewhere.** Inherit the scale and the grid; change the palette, the
   marks, the arrangement, or all three. The test is at the end of this file and it does
   not get relaxed because you started from something: if a person could tell your deck
   was built from that preset, you stopped too early. You are not filling in a form, you
   are borrowing a starting point that somebody else has already proved works.

Say back what you took, the same as with any reference: *"I am taking riso's stroked-box
furniture and its refusal of a third colour. I am not taking the two inks — this deck is
about water, so the second ink is a blue-green and the repeats are wave geometry rather
than 青海波."*

### Offer to save it, when it turns out well

At the end, if the language you invented is genuinely good and the user is likely to want
another deck in it, offer to publish it:

```
presets({ from: "project/deck", name: "…", summary: "…", tags: [...],
          slides: ["cover", "…"], files: [{ path: "marks.mjs", body: … }] })
```

**Send the files.** Saving from the web UI cannot — the browser has never seen your
`build.mjs` — so a preset saved that way is a palette, and the tool will tell you so in
`next` rather than pretending it worked. Sending the program is the difference between a
design somebody can build on and a swatch they will misuse.

Offer; do not do it unasked. It is their design language and it goes on a shelf with their
name on it.

### Ask what they hate

Often the most productive question in the batch, because people describe what repels
them far more precisely than what attracts them. Offer objects to reject, not
adjectives: a gradient background, a stock photo of people round a laptop, a 2×2
consultancy matrix, three columns of icon-heading-paragraph, thin grey sans on white.
And ask whether the deck has an enemy — some decks exist specifically not to look like
the last twelve in the room. An inverted reference is still a reference.

### Their own deck: match it, break it, or keep the shell

"Here's our deck" is genuinely ambiguous. Half the time it means *make it look like
this* and half the time *please, anything but this*. Guessing wrong wastes the build, so
put the consequence inside each option:

- **Match it** — internal, recurring, or somebody senior will ask why it looks
  different. The house deck is a constraint and the work is the best possible deck
  inside it. Say out loud that you inherit its ceiling.
- **Break from it** — a pitch, a keynote, a launch. Then it is a reference for what to
  avoid, read for what not to repeat.
- **Keep the shell, break the inside** — logo, brand colours and cover stay; the scale,
  the layouts and the signature move are yours. This is usually the true answer and
  almost nobody offers it unprompted, so it has to be in the options.

A brand guide is the same question in a stricter form. It hands you a palette and two
faces and no scale, no gap and no device, so it is the boundary the design lives inside,
not the design. Where it genuinely fights the method here, follow the guide and spend
your invention on the signature move — but say so in one line, because you are trading
away "refuse the middle" and the user should know you did. An agent that treats a brand
guide as the brief produces the brand's website reformatted as slides.

### Image generation: check, then ask

Look before you ask. Generation may already be available in two ways:

- **Podium's own model.** `generate_image({ check: true })` answers whether the admin has
  turned it on for this account, and how many pictures are left in the next 24 hours. It
  makes nothing. If it is on, this is the route: no key, nothing to install, and the
  picture lands in Podium ready for a slide. If it says it is not enabled, do not retry:
  tell the person, who can ask the admin the message names, and design without.
- **A model of your own.** `IMAGE_ENDPOINT`, `AZURE_IMAGE_ENDPOINT` or `OPENAI_API_KEY` in
  the environment, or a `~/.claude/.deck-secrets.env`.

If either is there, the real question is whether this deck wants pictures at all — the
answer is often no, and a drawn or typographic deck is usually the stronger one.

If none of them is there, ask, because the answer decides the design language rather than
decorating it. A deck laid out around six plates and shipped with two is worse than a
typographic deck designed as one from the start, and discovering the gap at slide nine
means redesigning the ground, the crops and the grid.

Make it answerable. `scripts/generate-image.ts` posts `{prompt, n, size, quality}` and
reads `b64_json` back, so anything speaking the images API will do — set
`IMAGE_ENDPOINT` + `IMAGE_API_KEY` for a gateway, `AZURE_IMAGE_ENDPOINT` +
`AZURE_IMAGE_KEY` for an Azure deployment, or `OPENAI_API_KEY` on its own and pick a
model with `--model`. Each key is only ever sent to its own endpoint. So the question is
"is there an image endpoint your agents can reach, and a key for it", not "which model" —
though ask which, because it decides how literally you can specify a style. Without any of them the script stops with a named
error rather than failing quietly. Two lines in `~/.claude/.deck-secrets.env`, mode 600
— **never ask anyone to paste a key into the chat, and never write one into `build.mjs`
or the deck.**

Two more in the same breath. **Is generated imagery allowed here at all?** Plenty of
organisations forbid it in client-facing or regulated material, and the ban is invisible
until legal sees the deck. **Do you have real photography?** A real picture of their own
warehouse beats a generated one, and `add_pictures` brings it in.

If the answer is no, say in the same reply what you are doing instead, and design a deck
that does not want photographs rather than one with holes in it.

### What actually blocks

Almost nothing. `publish` sends the whole deck every time and the deck comes out of a
program, so most answers are one variable near the top of `build.mjs` and a re-run.
Slide count, order, whether the case study stays, the wording of the cover — none of
these are worth waiting for.

Two things block: **the argument**, because you cannot lay out a shape you have not got,
and **a binding house style**, because the design language is built first and everything
is composed against it. Wait for those. Assume the rest and say what you assumed.

Never ask what you can find out. Open the URL they gave you. Read the repo, the brand
guide in the folder, the previous deck sitting next to yours. If they said "like the
last one", call `decks` and go and look at it. Asking for something already in front of
you reads as not having read it, and it spends the one round of attention you were going
to get.

### When nobody answers

A queued run, a scheduled job, "just build it" — do not stall. State the guesses on the
record in three lines: audience, length, and the design language as a noun phrase
("stencilled crate: kraft ground, hazard orange, condensed gothic"). Keep those three
lines as a comment at the top of `build.mjs` and in the deck's `notes`, so a later
session can tell what was decided from what was guessed.

Then be fast. Publish unlisted, run `node lib/eyes.mjs "<look-url>"`, and show
the pictures. Somebody who cannot answer "how bold do you want this" answers "not that"
in four seconds. **The first version is a better question than any question**, which is
why every remaining question waits for the preview — by then the options are concrete
and they are reacting rather than imagining. Do not re-ask a settled question in new
words. If they said fifteen minutes, it is fifteen minutes.

## Directions, then the outline

**Directions.** Before forty slides, show two or three ways the deck could look, each as
ONE finished slide: the cover, or the slide that carries the signature move. Make them
disagree on every axis you can — a lit ground against a paper one, a serif against a
grotesk, one family against a pair, loud against quiet — and name each as a noun phrase
from THIS subject (*"harbour at dawn: fog ground, one signal colour, a slab serif"* is the
shape of a name, not a suggestion). Build them as one small deck, `<id>-directions`, one slide per direction,
publish it unlisted, look at it with eyes, and put the pictures and the link in front of
the person. They pick with one question, or pin comments on the one they want changed.
Record the pick in the brief. A direction chosen from a picture is a decision; one chosen
from a description is a guess you will both revisit at slide twenty.

**The outline.** Then the argument, as a numbered list of slide titles, each one a claim:
*"3 — Churn halved after the move"*, not *"3 — Churn"*. Mark which slide carries which
number and where the ask is. One question: approve, or say what moves. Cutting a slide
here costs a line; cutting it after the build costs the layout around it.

Skip either one when it is already settled: a house style that binds leaves no direction
to choose, and an argument they handed you as a document needs no outline check.

## Review before you hand it over — the critic

**A clean eyes report is where the review starts, not where it ends.** Eyes measures what
can be measured; the rest is judgement, and the evals showed agents stopping at a clean
report while a judge holding decks to the person's best work still found the same faults on
every deck. So before you hand anything over, be that judge:

1. Open the overview picture. For every slide, write one line in `critique.md` next to the
   program: its hero (what, and how big), what a projector in a lit room does to it, and a
   grade from 1 to 5 against the bar — would it hold its own beside the best keynote you
   know (presented), or a page from the best annual report you know (read)? A 4 has one
   unmistakable hero, a ground and colour chosen rather than defaulted, nothing under 24px,
   and the proof reaching the lower third. A 3 is tidy and forgettable. (The scale is
   `references/judge.md`; it rewards craft, never a style.)
2. Take the three lowest slides and **rebuild** them — change the composition, not the
   font size: the number becomes the hero, the diagram takes two thirds of the frame, the
   ledger becomes four figures, the flat ground gets its light.
3. Publish, look, grade those slides again. Repeat until no slide is below 4, or three
   rounds have passed. Then `references/review.md` for the argument, the design language and
   the brief's must-not list.
4. **Then the judge — `references/judge.md`.** Hand the finished deck to fresh eyes: a
   subagent that gets only the pictures, eyes' measurements, one line about the room and the
   scale — never your program or your reasoning — and returns scores and the three changes
   that would raise it most. Make them, and judge again while it is under 4 (at most twice
   more). With no way to start a subagent, judge it yourself from the pictures alone.

5. **Then three checks of your own, every time:**
   - **The brief is current.** Every decision made during the build — a colour that
     changed, a rule broken on purpose (a three-line cover, a slide over the word budget),
     a direction dropped — goes into `brief` on the last publish. The next session reads the
     brief, not your memory, and a stale one sends it back to undo a deliberate choice.
   - **No warning you caused is left unexplained.** Read `warnings[]` on the last publish.
     Fix every one your build introduced; one you keep on purpose gets a line in the brief
     saying why. A deck is not handed over with a warning nobody has looked at.
   - **Claim only what you checked.** Say what the deck shows, not what you assume it does:
     a drawn barcode is "barcode-styled" unless you scanned it, a figure is "illustrative"
     unless the person gave it to you, a font "loaded" only if eyes said so.

Hand it over in three lines: what it is, what you assumed, and the link.

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
5. Light with range on every slide: a glow behind the subject — behind every hero figure
   and every drawn screen — a gradient whose far edge is 25–35% darker than its lit corner,
   or a photograph (`lib/atmosphere.mjs`). A 2–4% wash and a little grain read as flat; a
   flat field is fine only when the colour itself is the design. **The room decides how
   light the ground is:** a projector in a dim room wants a dark, lit ground (light paper
   glares there); a deck read on a laptop can be light. Variety between decks comes from
   hue and material, never from putting a dim-room talk on white. Eyes: `flat grounds`.
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

## Inventing the design language

This is the part that decides whether the deck is worth looking at, and it is the part
there is no menu for. **Read `references/inventing-a-design-language.md` before you choose
a colour.** The short version:

1. **Start from the subject as a physical thing.** Not "a deck about swords" — ink,
   steel, paper, a dark forge. Not "a deck about logistics" — a stencilled crate, a
   customs form, a barcode. The language comes out of what the subject is *made of*. A
   palette chosen because it looks nice is a palette; a palette chosen because it is the
   colour of the thing is a design language.
2. **Two inks. One accent with exactly one job.** The fastest way to destroy anything is
   a helpful third colour.
3. **Build a scale, and refuse the middle.** Set `--fs-cover` for the biggest thing and
   `--fs-body` for the smallest, then leave a gap nothing lives in. The gap is where the
   drama comes from. Sizes do not derive from each other — move one and set the rest.
4. **Two or three faces.** `--font-display` and `--font-body` carry the deck; add
   `--font-alt` (a voice reached mid-sentence with `~tildes~`) or `--font-mono` (figures)
   only when a job needs it. The four slots are not a quota — four faces is usually a
   mess. Pick each *against* the others; same-but-lighter is not a voice.
5. **Name one signature move, then build it on three slides.** Not a colour — a device. A
   vertical rail. A number bled off the corner. A rule that grows one slide at a time.
   `theme.signature` is checked against what you actually drew: name a move you never
   build and the publish warns you.

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
- **Copy a preset to learn the moves, never the look.** Nothing in this skill ships a
  design any more — the worked ones live in the registry at `<podium>/presets`, next to
  everyone else's, where they are something a person chooses rather than something the
  product hands you. Read one for what a computed mark and a real grid look like in code.
  If your deck comes out looking like it, you have used it wrong.
- **Starting from a preset does not relax any of this.** It moves where you start, not
  where you stop. The test is the same one at the top of this list: say in one sentence
  what is different. "It is the riso preset with our copy in it" is not a sentence that
  passes.
- **The slide that scares you is usually the right one.** A slide that is ninety per cent
  empty, a headline cropped by the frame, a diagram with no words on it — those are the
  slides people remember. Build one per deck and keep it.
- **If a mark could be drawn by hand in five minutes, it is not worth drawing.** Compute
  it: a curve from a real function, a field whose density is the data, a seeded wobble, a
  pattern tiled from geometry, lettering on a path. `lib/draw.mjs` is the toolkit;
  `svg` blocks render exactly as written, so anything SVG can do, a slide can do.

## Pictures

A deck needs none. The strongest languages here are typographic or drawn, and an `svg`
block is sharper at every size, takes the theme's colours through `color: "accent"`, and
needs nothing installed.

Where a picture genuinely beats a drawing — and only once you have established that
generation is available, which is a question you asked before you chose a design
language — make art that already belongs to the deck. Through Podium, one call:

```js
generate_image({ prompt: "an iridescent glass orb, lit from inside", anchor: "render",
                 transparent: true, palette: ["#0E0A1F", "#7B4DFF", "#FF8A3D"],
                 register: "night launch, light on violet", project: "…" })
```

It returns `src: "/m/<id>"`, which goes straight into an image block or `bg.image`, and the
picture itself, so you can see what you got. `anchor` is the kind: `art` (flat
illustration), `render` (a lit 3D object — glass, chrome, glow: the hero object a deck
returns to), `photo`, `logo`. `transparent: true` makes a cut-out with no box around it,
to sit on a gradient or a glow. There is no default mood: `register` is this deck's. Or run `scripts/generate-image.ts`: it uses a
model of your own when there is one, and otherwise Podium's, through `PODIUM_TOKEN`
(`--via podium` picks Podium even when you have a key):

```bash
npx tsx ${CLAUDE_SKILL_DIR}/scripts/generate-image.ts --name orb \
  --anchor render --transparent --palette "#0E0A1F,#7B4DFF,#FF8A3D" \
  --register "night launch, light on violet" --prompt "an iridescent glass orb, lit from inside"
```

That is where `/skill.zip` unpacks; if the skill lives somewhere else, it is
`scripts/generate-image.ts` inside that folder. Run it from the deck folder: the PNG lands
in `./.media/generated/` unless you pass `--out`. Through Podium it is also already in
Podium, and the script prints its `/m/<id>`, so there is nothing to upload.

Either way the style anchor is the same one (`lib/image-anchors.mjs`), so pictures made on
the server and on a laptop belong to one set.

Pass the deck's own `--ground,--ink,--accent`, and `--model` if the endpoint needs one.
The style anchor is prepended verbatim to every prompt so only the subject clause varies — generate the whole set, then review them
**as a set** and regenerate the outliers. Reviewing one at a time is how you end up with
five styles in one deck.

Two things worth knowing before you spend a call:

- **Ban lettering.** Generated text looks right at a glance and is garbled up close. Set
  every label as a text block over the image instead — then it is selectable, crisp and
  translatable.
- **The first colour is the ground the art is painted on, and it must be the colour of the
  SURFACE the picture will land on** — which is not always the theme's `--ground`. A deck
  whose `--ground` is a lilac board but whose pages are white plates needs white here, or
  every picture arrives as a visible grey rectangle floating on a white page. This is the
  single difference between "a deck with images in it" and "an illustrated deck".

### Where a picture goes

Art improves a deck when it is **rare, small and in a hole the composition already left**.
It ruins one when it is the composition. The rules, in the order they bite:

- **One or two in a deck, not one a slide.** Every shipped preset that carries art carries
  two, except `riso`, which carries three. Nothing enforces a ceiling; the restraint is
  the design, and past three is where a language turns into a brochure.
- **Into the space the argument does not need.** A statement slide with a short sentence
  has an empty half; put it there. Never behind the copy, never as a full-bleed background
  with a headline over it unless the language is built for that.
- **The frame must carry the picture's own aspect ratio.** The generator returns 3:2, so a
  block at `{ w: 780, h: 660 }` letterboxes under `fit: "contain"` and the bands it leaves
  are the picture's ground showing as a rectangle. Match the shape, or use `cover` and
  accept the crop.
- **In a language that computes its marks, put the picture inside something drawn** — a
  window, a card, a panel. Loose on the page a generated image reads as a foreign object;
  framed, it reads as a screen, which is what the eye expects a picture to be.
- **If the mark has to stay true, generate the blank and draw the mark yourself.** Ask for
  the surface — a blank card, an empty sign — and put your own `svg` on top. A brand page
  whose logo is baked into the photograph starts lying the day the logo moves.
- **The deck must render without them.** Read the ids from a file and fall back to the
  computed mark when it is absent, the way `presets/riso` and `presets/brandbook` do. Art
  is optional; a program that only works on the machine that generated it is not a program
  somebody can download.

**The person's own pictures come in through `add_pictures`**, in every client:

1. `add_pictures({ project })` opens a drop zone: a panel in the chat, and a link. Tell the
   person what the result's `tell` says. Ask even when they already attached the pictures
   to a message: an attachment reaches you, never Podium, and you cannot send it on.
2. When they say they are done, `add_pictures({ session })` returns each picture's `src`
   and shows you the pictures, so you can place them and write their alt text.

Put the `src` on `bg.image` or an image block. A picture from `generate_image` is already
there; use its `src`.

## The tools

| | |
|---|---|
| `publish` | the whole deck, every time. Returns `warnings[]` and a preview URL. `visibility: "unlisted"` puts it behind a link. A page is `{ kind: "page", id, title, html }`, and later edits can be `patch: [{ find, replace }]` (references/pages.md) |
| `build` | the program instead of the deck: Podium runs it offline and publishes what it writes, and keeps it with the deck. For when you have no shell |
| `look` | Podium renders the deck and returns the slides as pictures with the measurements — eyes, for when you have no machine |
| `preview` | a signed, account-free URL showing every slide on one page, animations frozen |
| `add_pictures` | the person's own pictures: opens a drop zone, then returns each one's `/m/<id>` and shows it to you |
| `upload_media` | base64 in, `/m/<id>` out — for a file your program already holds, like the poster screenshot |
| `generate_image` | slide art from Podium's own image model, in the deck's palette, straight into the project's media. Only for accounts the admin has turned it on for; `check: true` asks first |
| `decks` | the library; with an `id`, the deck as JSON, and its open comments |
| `presets` | the shelf of published design languages. **Only on the user's instruction** — see above. With `from`, saves one of yours. |

And eyes on your own machine: `node lib/eyes.mjs "<url>"`, or the `look` tool of the
optional local podium-eyes server (above). Either takes the URL any of the others returned
and gives you the pictures; Podium's own `look` takes the deck's `id`.

**Read the warnings before you look at the picture.** They name the failures a screenshot
cannot show: a `fonts.google` spec that returned HTTP 400 and left the whole deck in a
fallback face, a scale you never set, a chart encoding you destroyed. A deck that saves
clean is not a deck that renders right.

Then look: eyes on the preview URL. They print what `window.podium.report()` measured (any
real browser that opens the URL can call it too): which faces actually loaded, which
headlines wrapped to three lines, what sits outside the frame, and **what is sitting on top
of what**, measured rather than estimated.

## Comments: the person steering

People comment on a deck from its stage: they press **C**, click a spot on a slide, and
say what should change. That pin, not a new prompt from scratch, is how somebody steers a
deck you built, so **read the comments before you rebuild a deck anybody has looked at.**

- `decks({ id })` returns `comments`: the open threads, each with the slide (`slide`,
  `slideNumber`, `slideLabel`), the `block` id under the pin, the pin itself (`at`), what
  they `says`, and any replies. Each has a number `n`.
- A preview link with `?comments=1` draws those numbers as pins on the sheet, and
  eyes do it for you with `--comments` (or `look({ url, comments: true })`), so "pin 3"
  in the picture is thread `n: 3`.
- Fix what they ask **in the program**, then publish with the fix and
  `resolve: [{ comment, reply }]`. The reply is one line saying what you changed. It
  appears on the thread, and the thread closes at the new version.
- **Never resolve a comment you did not act on.** If it is a question, or you are unsure the
  fix is what they meant, reply with `open: true` and leave it for them.
- Give every slide an authored `id`. A comment remembers the slide by its id, and a
  positional one (`s3`) moves when slides are reordered.
- `publish` tells you how many threads are still open, in `comments`.

## Things that will bite you

- **`publish` replaces the whole deck.** That is correct: the deck comes out of your
  program, so resend it. There is no patch operation and you do not want one.
- **Everything needs `PODIUM_TOKEN`.** If a tool reports an invalid token, make a new one
  at `<podium>/settings` → API tokens. Retrying will not start working.
- **The deck is 1920×1080 and scales to fit.** Long headlines wrap; the report counts the
  lines for you.
- **A slide with no blocks is refused.** So is any leftover field from the old model —
  the error says where that thing went now.
- **Speaker `notes` never leave the account.** They are stripped from every public link,
  so that is where the caveat, the anticipated question and the transition go.
- **Never invent a number.** If a figure is illustrative, say so on the slide. A
  fabricated statistic in a pitch deck is a fireable error.
