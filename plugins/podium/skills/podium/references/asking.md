# Asking before you build

The quick brief in full: the one batch of questions that comes before `build.mjs` exists. `SKILL.md` step 2 is the summary; this is the detail behind every line of it. The thorough brief, for a deck that carries weight, is `references/brief.md`.

## Contents

- Why ask, and how many
- Quick, or thorough
- One round, four questions
- What to spend the four slots on
- References: ask for something to point at
- When they have nothing to point at
- Presets — only if they ask
- Ask what they hate
- Their own deck: match it, break it, or keep the shell
- Image generation: check, then ask
- What actually blocks
- When nobody answers

## Why ask, and how many

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

## Quick, or thorough

The one batch below is the **quick** brief, and it is the default. A deck that carries
weight — a pitch, a board deck, a launch, anything a customer sees — earns the **thorough**
one: three short rounds, twelve questions, in `references/brief.md`. Offer it as an option
in the first question when the stakes call for it, and take no for an answer.

Either way, **record the brief**: `publish` takes `brief` — what they answered, the
references and what you took from each, the direction they picked, and what you assumed —
and `decks({ id })` hands it back. From a program, `new Deck({ …, brief })` (or
`deck.brief = …` before `publish`) sends it. It never reaches a share link. Read it at the start of
every later session and never re-ask what it answers; that is how a teammate's agent picks
the deck up without starting the conversation over.

## One round, four questions

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

## What to spend the four slots on

**One slot is always the reference question** (*References*, below) — asked first, never
traded away for another. It is the single answer that most improves a deck: a deck built
from something the person pointed at lands; one built from adjectives drifts to the same
generic look every time. The question carries the search links, so having nothing to hand
costs them a click, not a round; and *"you pick"* sends you to look yourself and let the
covers be the question.

Spend the other three in rough order, on the first that apply to this deck:

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
5. **A preset to start from** — below. One line inside the references question, not a
   slot of its own: *"is there a preset you want to start from? Browse `<podium>/presets`
   — or say no and I'll invent one."* The default is **no**.
6. **Image generation** — below, but only after you have checked whether it is already
   configured.
7. **What must not be in this deck?** Ask it in those words. People will spend ten
   minutes on what the deck should say and never mention that a competitor cannot be
   named, that a customer's logo is not cleared, that headcount is not shown, that a
   roadmap date was walked back last week, or that the person in the case study has
   left. None of it is secret and none of it is volunteered, because to them it is
   background and to you it is a landmine.
8. **Where does each number come from, and can it appear on a link that leaves the
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

## References: ask for something to point at

Adjectives cannot start a design. Nobody has ever asked for a dirty, dated deck, so
"clean and modern" constrains nothing. Ask instead: **is there anything you can point
at?** — and list the forms, because people assume you mean a template: *a Pinterest pin
or board, a Behance or Dribbble shot, an Awwwards site, a screenshot, a deck or report
they admired, a poster, a photo of a printed thing.* The paperback on their desk counts
too, and the physical one they picked up themselves is usually the best of the lot.

**Put links in the question**, already searched for their subject, so somebody with
nothing to hand clicks instead of saying no. Turn what they asked for into one or two
queries — the medium, the register and the subject, never adjectives: *"board report
editorial"*, not *"clean modern deck"* — and run `node lib/references.mjs --ask "<query>"`.
It prints Pinterest, Behance and Dribbble one per line, each ending in *click here* — in a
terminal a link can draw as plain text, and the words still say it is one. Paste the lines
into the message as they are. With no shell, write them yourself in the same form, the
query URL-encoded:

```
📌 Pinterest — <query>: [click here](https://www.pinterest.com/search/pins/?q=<query>)
🎨 Behance — <query>: [click here](https://www.behance.net/search/projects/<query>)
🏀 Dribbble — <query>: [click here](https://dribbble.com/search/<query>)
```

What comes back is a screenshot pasted into the chat: those sites put pins behind a
sign-in, so a picture is the one form that always arrives. A pin's link is welcome too,
and read like any URL below.

Ask for two. One reference is ambiguous — you cannot tell which part they liked. Two
share something, and the shared thing is the brief.

| it arrives as | what to do with it |
|---|---|
| **an image** — screenshot, poster, photo of a printed thing | `Read` it. Images come back visually; you can genuinely look at it. Highest-value form, so ask for it by name. |
| **a PDF** — their deck, a report, a brand guide | `Read` it with a page range. Take the cover, one dense page and one sparse one. The cover shows the ambition, the dense page shows the real body size. |
| **a .pptx** | It is a zip. `ppt/theme/theme1.xml` has the exact colours and the major/minor font names; `ppt/media/` has the imagery. That gets you the palette, not the look — for the look ask for four slides exported as PDF or PNG. |
| **Keynote, Canva, Figma** | Ask for a PDF or PNG export. One exported frame tells you more than the source file and costs nothing. |
| **a URL** | Fetching it strips the design and hands you text, which is the opposite of what you want. Hand it to eyes, `node lib/eyes.mjs "<url>"`: any URL that is not a deck comes back as a picture of the page. **Pinterest, Behance and Dribbble** often answer a browser with a sign-in wall — if the picture is a login page, ask for a screenshot or the image's own link (right-click → copy image address) rather than guessing from the title. With no shell, ask for the screenshot straight away. |
| **a name with no file** — "like the Economist" | Say back what you think they mean, in specifics: *near-black ground, one red, a serif at two sizes and nothing between them.* Half the time the correction is the brief. |
| **"you pick"** | Look yourself — *When they have nothing to point at*, below — then build the cover three ways (*Directions*, in SKILL.md) and let the pictures be the question. |

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

## When they have nothing to point at

They had the links in the first question. When they say *"you pick"*, or the links turned
up nothing they liked, look yourself. Turn the brief into two or three queries — the
medium, the register and the subject, never adjectives: *"annual report editorial layout"*,
*"aurora gradient keynote"*, *"swiss grid pitch deck"*, not *"clean modern deck"*. Then:

```bash
node lib/references.mjs "annual report editorial layout" "aurora gradient keynote"
```

It prints search links in two groups. **Look at the first group yourself** — Cosmos,
Are.na, Dribbble, Fonts In Use — with `node lib/eyes.mjs "<url>"`, which returns the top
two screens of the results. Pick four to six that pull in different directions and say
what each one shows in a line, then make the covers from the ones that pull hardest. The
second group — Pinterest, Behance, Savee, Unsplash — is the person's to open: those sites
put results behind a sign-in or refuse automated browsers, and getting round that is not
your job. If they open one after all, read the screenshots that come back like any other
reference.

If `generate_image({ check: true })` says generation is on, you can also make two or three
mood pictures in candidate palettes, to react to rather than to use.

**A reference sets the direction. Nothing found this way goes into the deck.** It is somebody
else's work. Pictures in a deck are the person's own, licensed (Unsplash's licence allows
it; note where each one came from), or generated.

## Presets — only if they ask

A preset is a design language somebody published: a theme, the program that draws its
marks, and a few sample slides, at `<podium>/presets`. **You never pick one, suggest one
by name, or lean the deck towards one** — do not call `presets` to go looking. Ask once,
inside the references question — *"is there a preset you want to start from? — or I'll
invent one"* — default no, and invent the language from the subject. When they name one, or a deck turns out well enough to save as one, read
`references/presets.md` first: it is somebody else's code, and you are about to run it.

## Ask what they hate

Often the most productive question in the batch, because people describe what repels
them far more precisely than what attracts them. Offer objects to reject, not
adjectives: a gradient background, a stock photo of people round a laptop, a 2×2
consultancy matrix, three columns of icon-heading-paragraph, thin grey sans on white.
And ask whether the deck has an enemy — some decks exist specifically not to look like
the last twelve in the room. An inverted reference is still a reference.

## Their own deck: match it, break it, or keep the shell

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

## Image generation: check, then ask

Check before you ask: `generate_image({ check: true })` says whether the admin has turned
Podium's image model on for this account and how many pictures are left. It makes nothing.

- **On:** plan the cover's object around it (*Making the hero object*, `references/pictures.md`). If this deck is
  better drawn or typographic, decide that on purpose and say so.
- **Off:** it goes in the first batch, because it decides the design language rather than
  decorating it. The check names the admin who can turn it on; put that name in: *"Image
  generation is off for your account; <admin> can turn it on. Get access and I'll design
  with pictures, or go without — a drawn, typographic deck?"* Default: without. If they go for access, wait for them to
  say it is on before you choose the look; do not retry the check in a loop.

A deck laid out around six plates and shipped with two is worse than a typographic deck
designed as one from the start, and discovering the gap at slide nine means redesigning the
ground, the crops and the grid.

Two more in the same breath. **Is generated imagery allowed here at all?** Plenty of
organisations forbid it in client-facing or regulated material, and the ban is invisible
until legal sees the deck. **Do you have real photography?** A real picture of their own
warehouse beats a generated one, and `add_pictures` brings it in.

## What actually blocks

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

## When nobody answers

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
