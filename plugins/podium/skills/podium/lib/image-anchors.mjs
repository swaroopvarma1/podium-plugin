/**
 * The style anchor every generated picture is made against, in one place.
 *
 * Used by `scripts/generate-image.ts` (a model on this machine) and by Podium's own
 * `generate_image` tool (the server's model), so a picture made either way belongs to the
 * same set. Art generated per slide from a free-text prompt drifts; art generated against
 * one anchor, with only the subject clause varying, reads as a set.
 *
 * The palette is the anchor. Its first colour is the ground the art is painted on, and it
 * must be the colour of the SURFACE the picture lands on — unless the picture is a
 * transparent cut-out, which has no ground at all. Lettering is banned outright:
 * generated text looks right at a glance and is garbled up close.
 */

/**
 * What kind of picture. The kind decides the whole preamble, because a flat illustration,
 * a lit 3D object and a photograph are not the same instruction with different words:
 *   `art`     flat illustration — shapes, no light, no texture
 *   `render`  a 3D object or scene — glass, metal, light, depth: the hero object a deck
 *             recurs to (an iridescent orb, a product floating in its own glow)
 *   `photo`   a photograph — real light, real materials, a lens
 *   `logo`    one reducible mark
 * Until 2026-09-30 there was only `art`, and it banned gradients, shadows and photographic
 * texture outright — so the lit objects and photographs the decks people point at as the
 * standard were not something this could make at all.
 */
export const ANCHOR_KINDS = ['art', 'render', 'photo', 'logo'];

/** Hex colours only: `#abc`, `#aabbcc`, `#aabbccdd`. */
export const HEX = /^#[0-9a-fA-F]{3,8}$/;

const NO_LETTERS = 'ABSOLUTELY NO text, letters, numbers, labels, logos or lettering anywhere in the image.';

/**
 * The style preamble for one kind. `register` is the deck's own mood in a few words; with
 * none, the picture is described only by its kind and palette — there is no house style to
 * fall back to, because a default mood is how every deck came out the same.
 * `transparent` asks for a cut-out: the object alone, no ground, so it sits on whatever
 * the slide is painted with.
 */
export function styleAnchor(kind, { colours, register = '', transparent = false }) {
  const mood = register ? ` The mood: ${register}.` : '';
  if (kind === 'logo') {
    return [
      'A vector logo mark for a software brand. Not an illustration, not a scene, not an icon set.',
      `Use ONLY these colours: ${colours.join(', ')}. No other hue may appear.`,
      'ONE single mark, centred, filling most of the frame, with a clear margin of empty ground.',
      'Built from a small number of bold geometric shapes that could be redrawn by hand in a vector tool.',
      'Flat solid fills only. No gradients, no shadows, no texture, no 3D, no perspective realism, no mockup.',
      'It must stay legible when shrunk to 16 pixels, so no thin lines, no fine detail, no clutter.',
      'ABSOLUTELY NO text, letters, numbers, wordmark or lettering of any kind.'
    ].join(' ');
  }
  const cutout = transparent
    ? 'The subject ALONE on a fully transparent background: no ground, no floor, no backdrop, no shadow plane, no frame.'
    : null;
  if (kind === 'render') {
    return [
      `A high-end 3D render: the key visual of a presentation deck.${mood}`,
      `The colours are ${colours.join(', ')}; light and reflections may run between them, and no other hue may appear.`,
      'Physically real materials — glass, chrome, soft plastic, light itself — with studio lighting, depth, refraction and glow.',
      'One subject, with presence; nothing incidental around it.',
      cutout ?? `Set on a plain ${colours[0]} ground that the render fades into.`,
      NO_LETTERS
    ].join(' ');
  }
  if (kind === 'photo') {
    return [
      `A photograph for a presentation deck.${mood}`,
      `Its colour is graded toward ${colours.join(', ')}, so it sits in the deck; natural skin and material tones stay natural.`,
      'Real light, real materials, a real lens: shallow depth of field, no illustration, no CGI look.',
      'One clear subject, composed with room around it for type.',
      cutout ?? '',
      NO_LETTERS
    ].filter(Boolean).join(' ');
  }
  return [
    `A flat illustration for a presentation deck.${mood}`,
    `Use ONLY these colours: ${colours.join(', ')}. No other hue may appear.`,
    'Flat shapes, generous negative space, the subject on a plain ground.',
    'No gradients, no drop shadows, no photographic texture.',
    cutout ?? '',
    NO_LETTERS
  ].filter(Boolean).join(' ');
}

/** The whole prompt: the anchor verbatim, then the one clause that varies. */
export function imagePrompt({ kind = 'art', colours, register, subject, transparent = false }) {
  return `STYLE (follow exactly, do not vary): ${styleAnchor(kind, { colours, register, transparent })}\n\nSUBJECT: ${subject}`;
}
