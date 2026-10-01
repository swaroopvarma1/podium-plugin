# Presets

A preset is a published design language. This file is what to do when the person names
one, and how to save one of yours. SKILL.md's rule stands over all of it: **you never pick
a preset**; you ask, and *no* is the usual answer.

## Starting from a preset — only if they ask for one

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

## Offer to save it, when it turns out well

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

