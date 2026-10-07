# The tools, comments, and what will bite you

Every tool in one table, how to read what they return, how comments steer a deck, and the mistakes that cost a rebuild.

## Contents

- The tools
- Comments: the person steering
- Things that will bite you

## The tools

| | |
|---|---|
| `publish` | the whole deck, every time. Returns `warnings[]` and a preview URL. `visibility: "unlisted"` puts it behind a link; `embed: "example.org"` lets that website show it, and returns the code to paste. A page is `{ kind: "page", id, title, html }`, and later edits can be `patch: [{ find, replace }]` (references/pages.md) |
| `build` | the program instead of the deck: Podium runs it offline and publishes what it writes, and keeps it with the deck. For when you have no shell |
| `look` | Podium renders the deck and returns the slides as pictures with the measurements — eyes, for when you have no machine |
| `preview` | a signed, account-free URL showing every slide on one page, animations frozen |
| `add_pictures` | the person's own pictures: opens a drop zone, then returns each one's `/m/<id>` and shows it to you |
| `upload_media` | base64 in, `/m/<id>` out — for a file your program already holds, like the poster screenshot |
| `generate_image` | slide art from Podium's own image model, in the deck's palette, straight into the project's media. Only for accounts the admin has turned it on for; `check: true` asks first |
| `decks` | the library; with an `id`, the deck as JSON, and its open comments |
| `presets` | the shelf of published design languages. **Only on the user's instruction** — `references/presets.md`. With `from`, saves one of yours. |

And eyes on your own machine: `node lib/eyes.mjs "<url>"` takes the URL any of the others
returned and gives you the pictures; Podium's own `look` takes the deck's `id`.

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
- **Publishing from your program needs Podium's token.** `lib/podium.mjs` reads
  `PODIUM_TOKEN`, or Claude Code's own `podium` entry. With none — the Claude plugin signs
  in without one — send the program to `build`. An invalid token: make a new one at
  `<podium>/settings` → Connect an agent → Claude Code. Retrying will not start working.
- **The deck is 1920×1080 and scales to fit.** Long headlines wrap; the report counts the
  lines for you.
- **A slide with no blocks is refused.** So is any leftover field from the old model —
  the error says where that thing went now.
- **Speaker `notes` never leave the account.** They are stripped from every public link,
  so that is where the caveat, the anticipated question and the transition go.
- **Never invent a number.** If a figure is illustrative, say so on the slide. A
  fabricated statistic in a pitch deck is a fireable error.
