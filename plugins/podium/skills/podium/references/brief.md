# The thorough brief

For a deck that carries weight: a pitch, a board deck, a launch, anything a customer will
see, anything longer than about ten slides. The quick round (`SKILL.md` step 2, in full in
`references/asking.md`: one batch of four) is still the default. Offer this one when the stakes call for it, in the first
question of that round: *"This one matters — do you want the thorough brief? Three short
rounds, about two minutes."* Default: no.

## Contents

- Round 1 — the room, and something to point at
- Round 2 — what goes in, and what must not
- Round 3 — the look, and the length
- Recording it

It is three rounds of `AskUserQuestion`, four questions each, asked one round at a time.
The rule from `SKILL.md` and `asking.md` still holds inside every round:

- Each question changes a line of `build.mjs`. If it changes nothing, drop it.
- Every question has a default, marked, so somebody who does not care taps once.
- The options disagree with each other, and are written as consequences.
- Never ask what the folder, the repo or an earlier deck already answers. Read first.

Skip any question the conversation has already answered, and say that you did: *"You said
it's for the board on Thursday, so I haven't asked about the audience."*

## Round 1 — the room, and something to point at

1. **Is there anything you can point at?** First, every time: a Pinterest pin or board, a
   Behance or Dribbble shot, a screenshot, a deck, a poster, a site. Two is better than
   one. Put the Pinterest, Behance and Dribbble links in the question, already searched
   for their subject (`node lib/references.mjs --ask "<query>"`), so having nothing to hand
   is a click and two pasted screenshots, not a no. Offer *"You pick"* as the other option,
   which runs *When they have nothing to point at* in `SKILL.md`, and a preset as one line
   inside the question (default: no). Asked first so they can go and find one while they
   answer the rest.
   *Changes:* the register — how loud, how dense, how much air — and whether the deck
   lands or drifts to the generic look.
2. **What should the room do when it ends, and who has to be convinced?** A name and a
   job, not a segment. The one free-text answer worth waiting for.
   *Changes:* the cutting rule. Every slide that does not move that person goes.
3. **Presented live, read alone, or presented by somebody who is not you?**
   *Changes:* words per slide, the type scale, and whether `notes` are cues or sentences.
4. **Where is it seen?** A projector in a lit room, a shared screen on a call, a phone, a
   recording. Ask about the network in the same breath.
   *Changes:* the ground (deep grounds go grey on projectors), the smallest size, hairlines.

## Round 2 — what goes in, and what must not

5. **Where does the content come from?** Documents in the folder, pasted in, drafted by you
   from what they tell you, or a mix. Then go and read what they point at.
   *Changes:* whether you are editing an argument or writing one.
6. **Where do the numbers come from, and can they leave the room?** Published, internal
   only, or illustrative.
   *Changes:* what can sit on a share link; illustrative figures are labelled on the slide.
7. **What must not be in this deck?** Ask it in those words, and offer the usual landmines as
   options: a competitor named, a customer's logo not cleared, headcount, a date that moved.
   *Changes:* the list you check every slide against before handing it over.
8. **Anything about language, series or sign-off?** The script the words are in, whether
   this is one of a series, the deadline, and who approves it.
   *Changes:* the faces (a Latin display face has no Devanagari), whether to redesign at
   all, and how much time the review pass gets.

## Round 3 — the look, and the length

9. **Does a house style bind this?** Match it, break from it, keep the shell but not the
   inside, or no house style.
   *Changes:* whether the design language is yours to invent.
10. **How long?** Five minutes, twenty, an hour; or as long as it needs, if it is read.
    *Changes:* slide count, and how much each slide carries.
11. **What do you hate?** Offer objects to reject, not adjectives: a gradient ground, a stock
    photo of people round a laptop, three columns of icon-heading-paragraph, thin grey type
    on white.
    *Changes:* the moves you rule out before you start.
12. **Pictures?** Generated (check `generate_image({ check: true })` before you offer it),
    real photographs only, or none.
    *Changes:* whether the design is built around plates or around type and drawing.

## Recording it

Once it is answered, put the brief on the deck: `publish` takes `brief`, keeps it beside the
deck (never on a share link), and `decks({ id })` hands it back to the next session and to
anyone else's agent that picks the deck up. Send it once; a later publish that leaves it
out does not erase it.

Write what they said and what you decided for them, and keep the two apart:

```js
brief: {
  depth: 'thorough',                          // or 'quick'
  asked: '2026-09-30',
  answers: {
    outcome: 'CFO approves the Q3 migration budget',
    delivery: 'presented live, by Priya',
    screen: 'projector in a lit room; guest wifi',
    length: '15 minutes',
    content: 'docs/migration-plan.md, numbers from finance',
    numbers: 'internal only — share link stays private',
    mustNot: ['vendor name', 'the April date'],
    houseStyle: 'keep the shell: logo and brand red, the rest is free',
    hate: ['gradient grounds', 'icon grids'],
    pictures: 'none'
  },
  references: [
    { from: 'pinterest.com/pin/…', took: 'near-empty covers, one accent on numerals', left: 'the serif' }
  ],
  assumed: ['16:9', 'English only'],
  direction: '<the picked direction, as its noun phrase>',   // after they pick
  skill: 'juspay-decks',                      // their own deck skill, when one was used
  outline: 'approved 2026-09-30'
}
```

Read it back at the start of every later session, before you ask anything.
