# Running the program: lib, eyes, no shell, posters, PDF

How the build loop in `SKILL.md` step 4 actually runs: copying `lib/`, publishing from a program, looking with eyes, the `build` and `look` tools when there is no shell, and the poster and PDF every shared deck needs.

## Contents

- The shape of the work
- No shell? The program runs on Podium
- Eyes: nothing to set up

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

Ask first (`references/asking.md`); find something to point at; show two or three
directions as one slide each and let them pick; agree the argument as a list of slide
titles; build; then review every slide against a written list before anybody else sees it.
Only a deck whose look and argument are already settled — by a reference, a house style,
a named preset, an instalment — skips straight from the brief to the build. Every other
deck does every step, because each one is minutes and each one it skips is a rebuild.

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

`node build.mjs` writes and publishes. It finds Podium's token by itself: `PODIUM_TOKEN`
when set, otherwise the token in Claude Code's own `podium` entry, which is where Settings'
command puts it. With no token on the machine — the Claude plugin signs in without one —
send the program to the `build` tool instead (*No shell? The program runs on Podium*, below); everything else holds.
Then **look**, with the `look` URL that `publish` returned:

```bash
node lib/eyes.mjs "<look-url>"              # every slide, twelve to a picture → shots/
node lib/eyes.mjs "<look-url>" --slides 3,7 # up to six slides full size      → shots/
```

It prints the measurements (faces that never loaded, text that overflows, blocks on top of
each other, pictures that 404) and writes the pictures to `shots/`. **Read the pictures.**
Every layout bug this project has ever had survived a clean build, a green test run and a
validator with nothing to say, and died the moment somebody looked at a picture.

## No shell? The program runs on Podium

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
  program: the person's own come in through `add_pictures` (`references/pictures.md`), generated
  ones from `generate_image`. `poster()` and `upload()` do not work there; skip the poster,
  since a chat has no screenshot file to make it from.
- A program that throws comes back as an error with its output. Fix the file, send it again.
- `decks({ id, program: true })` returns the kept program, so any later session, yours or
  a teammate's in Claude Code, picks the deck up from the program rather than from the JSON.

Everything else in this skill holds as written: ask first, look after every build, the
floor, the critic.

## Eyes: nothing to set up

`lib/eyes.mjs` ships in this skill and drives the Chrome already installed on this
machine. It needs Node 18+ and Chrome, and nothing else: no npm install, no registration,
no restart. If Chrome lives somewhere unusual, set `PODIUM_CHROME` to the browser's binary
(Chromium, Edge and Brave work too). If this skill is not on the machine, the file is also
at `https://podium.breezelabs.app/skill/lib/eyes.mjs`: one file, Node built-ins only.

No Chrome on the machine, or no machine: Podium's own `look` tool renders the deck and
returns the same pictures and measurements. Looking is not optional either way.

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

Podium's `look` shows you the slides but keeps no poster for you, so write the cover to a
file with eyes and attach it as above.

`node lib/pdf.mjs <share-url> deck.pdf` is the third one, because almost every deck gets
emailed in the end. It needs the SHARE link rather than the stage, which is behind the
account — an unauthenticated capture of the stage produces a login page with no slides on
it, and says so rather than writing a blank file.
