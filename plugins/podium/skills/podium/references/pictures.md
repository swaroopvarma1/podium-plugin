# Pictures: generating, the hero object, placing

Read before the first `generate_image`, and before you place any picture. `SKILL.md` step 6 is the summary.

## Contents

- When to use pictures
- Making the hero object
- Where a picture goes
- The person's own pictures

## When to use pictures

When image generation is on, it is usually what makes the cover. In hand-sorted decks the
covers people kept were mostly **one generated object made for that deck** — a single glass
tile for a company called tessel, an orb with a light inside for a product sold as a
"sidekick" — and the generated pictures people rejected were stock: frosted cubes, a glass
kiosk, a running shoe. A good generation is the cheapest way to a deck people keep; a
generic one is the fastest way to a deck they reject.

A deck can also be excellent with none — typographic, or drawn in `svg`, which is sharp at
every size and takes the theme's colours through `color: "accent"`. Decide that on purpose,
not because generating felt like effort. Through Podium, one call:

```js
generate_image({ prompt: "an iridescent glass orb, lit from inside", anchor: "render",
                 transparent: true, palette: ["#0E0A1F", "#7B4DFF", "#FF8A3D"],
                 register: "night launch, light on violet", project: "…" })
```

It returns `src: "/m/<id>"`, which goes straight into an image block or `bg.image`, and the
picture itself, so you can see what you got. `anchor` is the kind: `art` (flat
illustration), `render` (a lit 3D object — glass, chrome, glow: the hero object a deck
returns to), `photo`, `logo`. `transparent: true` makes a cut-out with no box around it,
to sit on a gradient or a glow. There is no default mood: `register` is this deck's.

The style anchor is prepended verbatim to every prompt, so only the subject clause varies —
generate the whole set, then review them **as a set** and regenerate the outliers.
Reviewing one at a time is how you end up with five styles in one deck.

## Making the hero object

1. **Name the object before you prompt.** One thing this deck owns, from its subject — the
   company's name, the product's metaphor, the thing the argument is about: a tile, an orb,
   a till roll, a matchbox. If it could sit on any company's deck, it is stock: people round
   a laptop, a cube, a kiosk, a city at night, a handshake.
2. **Prompt the object, not the mood.** Material, form, the one detail that makes it yours,
   and where the light comes from — *"a single rounded glass tile, thick and bevelled, lit
   from inside, one corner catching the light"*, not *"a futuristic abstract shape"*. The
   anchor carries the style and `register` the mood. For a cut-out, put the light ON the
   object — *a hard highlight along its top edge* — never a spotlight, beam or glow in the
   air: the model paints that as translucent grey haze round the subject.
3. **The hero is `render` with `transparent: true`.** A cut-out sits on your ground with a
   glow behind it (`lib/atmosphere.mjs`). `art` for a drawn set — a read
   deck's engraved telephone, a docket — on the paper's own colour; `photo` only for
   something real.
4. **Make three at `quality: "medium"`, pick by looking, then make the keeper at `"xhigh"`.**
   The first is rarely the one. Each takes about half a minute; medium costs a quarter of
   `high` and `xhigh` about twice it, so explore at medium and spend on the one you keep. Check what is left with `check: true`, put the three side
   by side, keep the one with presence, and say which and why in the brief. In the directions round each cover can carry a
   different candidate, so the person picks the object too.
5. **Place it big, and let it recur.** 600–800px on the 1920 plane on the cover, never a
   thumbnail in a corner; then back on two or three slides — cropped by the frame, smaller
   beside a figure, behind glass — changing as the argument moves (the floor, rule 10, `references/slides.md`).
6. **Reject what is broken.** Garbled marks, an extra part, a halo or a box round a
   cut-out, a shape that reads as something else at thumbnail size: regenerate, never ship.
   A haze is invisible on the white you are shown the picture on and a grey fog on a dark
   slide, so `generate_image` measures it and says so in `warning` — make that one again.

Two things worth knowing before you spend a call:

- **Ban lettering.** Generated text looks right at a glance and is garbled up close. Set
  every label as a text block over the image instead — then it is selectable, crisp and
  translatable.
- **The first colour is the ground the art is painted on, and it must be the colour of the
  SURFACE the picture will land on** — which is not always the theme's `--ground`. A deck
  whose `--ground` is a lilac board but whose pages are white plates needs white here, or
  every picture arrives as a visible grey rectangle floating on a white page. This is the
  single difference between "a deck with images in it" and "an illustrated deck".

## Where a picture goes

Beyond the hero object, art improves a deck when it is **rare, small and in a hole the
composition already left**. It ruins one when it is the composition. The rules, in the
order they bite:

- **The hero object, and one or two more — not one a slide.** Nothing enforces a ceiling;
  the restraint is the design, and past three is where a language turns into a brochure.
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
  computed mark when it is absent. Art is optional; a program that only works on the machine that generated it is not a program
  somebody can download.

## The person's own pictures

**They come in through `add_pictures`**, in every client:

1. `add_pictures({ project })` opens a drop zone: a panel in the chat, and a link. Tell the
   person what the result's `tell` says. Ask even when they already attached the pictures
   to a message: an attachment reaches you, never Podium, and you cannot send it on.
2. When they say they are done, `add_pictures({ session })` returns each picture's `src`
   and shows you the pictures, so you can place them and write their alt text.

Put the `src` on `bg.image` or an image block. A picture from `generate_image` is already
there; use its `src`.
