/**
 * Light, as recipes. Each returns plain Podium JSON — a slide `bg`, or a block — built from
 * YOUR deck's colours, so the craft comes with the call and the palette does not.
 *
 * Measured off the decks people hold up as the standard (a cinematic investor deck,
 * rebuilt slide by slide until it matched), then made palette-free: every colour role is
 * derived from the one hue you pass, at the lightness offsets the original used. Pass a
 * violet and you get that deck's sky; pass a teal, an ember or a cold blue and you get a
 * sky nobody has seen. Copying the original's colours is copying the deck — don't.
 *
 *   import { aurora, dusk, spotlight, glow, glass, stars } from './lib/atmosphere.mjs';
 *   slide({ bg: aurora({ glow: '#2FB8A6' }) }, [ stars(), glass({ x: 120, y: 300, w: 760, h: 420 }, [ … ]) ])
 *
 * Grounds: aurora (a lit arch — the statement slides), dusk (a warm floor — chapters),
 * spotlight (one light in the dark — product). Blocks: glow, glass, stars.
 *
 * Worked answers, not the look: every deck that reaches for aurora() is the same sky in
 * another colour. Vary the parameters (where the arch sits, how many lights, which corner),
 * or build your own ground from the same paint fields — cinematic.md lists others.
 */

/* ── colour, in HSL, because the recipes speak in "lighter", "deeper", "warmer" ── */

const hex2rgb = (hex) => {
  const h = String(hex).replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16) / 255);
};
const rgb2hex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

function toHsl(hex) {
  const [r, g, b] = hex2rgb(hex);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function fromHsl([h, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return rgb2hex([r + m, g + m, b + m]);
}
/** The same hue at another lightness (0–1), optionally turned `dh` degrees and saturated `ds`. */
/** @param {string} hex @param {number} [lightness] @param {{ dh?: number, ds?: number }} [opts] */
export function tone(hex, lightness, { dh = 0, ds = 0 } = {}) {
  const [h, s, l] = toHsl(hex);
  return fromHsl([(h + dh + 360) % 360, Math.max(0, Math.min(1, s + ds)), Math.max(0, Math.min(1, lightness ?? l))]);
}
/** The lightness of a colour, 0–1. */
export const lightness = (hex) => toHsl(hex)[2];

const fade = (color, at = 1) => ({ color, at, alpha: 0 });

/* ── grounds ─────────────────────────────────────────────────────────────── */

/**
 * The aurora: a lit arch over a dark ground. One family of ellipses centred LOW, so the
 * dark ring is an ARCH — down both sides to the frame edge, across the top, open at the
 * bottom — not a halo. Inside: a bright core column, a deep trough, a lit band. The ring
 * itself is the base showing through a wide, soft gap between the band's fade and the
 * rim's; that gap is what reads as depth (narrow it and it reads as a smudge). A warmer
 * wash lightens the ring across the top; the arch's feet rise in both bottom corners.
 *
 * `glow`  the light — the one hue everything is derived from
 * `base`  the night behind it (default: the glow's hue at 8% lightness)
 * `arch`  how low the arch is centred, 0.7–0.9 (default 0.8)
 * `grain` 0.5 reads as film on a sky this dark; 0.3 is cleaner
 */
/** @param {{ glow: string, base?: string, arch?: number, grain?: number }} opts */
export function aurora({ glow, base, arch = 0.8, grain = 0.5 } = /** @type {any} */ ({})) {
  if (!glow) throw new Error('aurora({ glow }): the light\'s hue, e.g. "#7449CC" — the deck\'s own');
  const L = lightness(glow);
  const night = base ?? tone(glow, 0.08, { ds: -0.25 });
  const ring = { at: [0.5, arch], size: [0.6, 0.82] };
  const core = tone(glow, Math.min(0.72, L + 0.1));
  const trough = tone(glow, Math.max(0.2, L - 0.1), { ds: 0.05 });
  const wash = tone(glow, Math.min(0.78, L + 0.12), { dh: 14 });
  /* The rim goes deeper and a little cooler than the light — indigo under a violet sky,
     not a second violet; that coolness is what keeps the top corners from glowing. */
  const rim = tone(glow, Math.max(0.1, L - 0.25), { dh: -10 });
  const rim2 = tone(glow, Math.max(0.14, L - 0.19), { dh: -12 });
  const feet = tone(glow, Math.max(0.18, L - 0.08));
  return {
    color: night, grain, fill: [
      { kind: 'radial', at: [0.5, -0.06], size: [0.46, 0.34], stops: [{ color: wash, alpha: 0.95, at: 0 }, { color: wash, alpha: 0.45, at: 0.5 }, fade(wash)] },
      { kind: 'radial', at: [0.5, arch + 0.04], size: [0.17, 0.8], stops: [{ color: core, at: 0 }, { color: core, alpha: 0.85, at: 0.45 }, fade(core)] },
      { kind: 'radial', ...ring, stops: [[tone(glow, L + 0.02), 0], [trough, 0.32], [tone(glow, L - 0.04), 0.44], [glow, 0.54], { color: glow, alpha: 0.75, at: 0.62 }, fade(trough, 0.78)] },
      { kind: 'radial', ...ring, stops: [fade(rim, 0.86), [rim, 1], [rim2, 1.14]] },
      { kind: 'radial', at: [0.12, 1.08], size: [0.32, 0.5], stops: [{ color: feet, alpha: 0.8, at: 0 }, fade(feet)] },
      { kind: 'radial', at: [0.88, 1.08], size: [0.32, 0.5], stops: [{ color: feet, alpha: 0.8, at: 0 }, fade(feet)] }
    ]
  };
}

/**
 * Dusk: a dark ground with warm light pooling along the floor — the chapter slides, where
 * the statement sits in the upper half and the floor carries the colour. `lights` are one
 * to three hues, left to right.
 */
/** @param {{ lights: string[], base?: string, grain?: number }} opts */
export function dusk({ lights, base = '#1C1A21', grain = 0.4 } = /** @type {any} */ ({})) {
  if (!Array.isArray(lights) || !lights.length) throw new Error('dusk({ lights: ["#…", …] }): one to three hues for the floor');
  const xs = lights.length === 1 ? [0.5] : lights.length === 2 ? [0.2, 0.8] : [0.08, 0.52, 0.95];
  return {
    color: base, grain,
    fill: lights.slice(0, 3).map((c, i) => ({
      kind: 'radial', at: [xs[i], 1.1], size: i === 1 ? 0.6 : 0.48, stops: [{ color: c, alpha: 0.95, at: 0 }, { color: c, alpha: 0.35, at: 0.5 }, fade(c)]
    }))
  };
}

/** One light in the dark, behind the product: `at` is where it falls. */
/** @param {{ color: string, base?: string, at?: [number, number], size?: number, grain?: number }} opts */
export function spotlight({ color, base = '#0C0B0E', at = [0.72, 0.5], size = 0.55, grain = 0.2 } = /** @type {any} */ ({})) {
  if (!color) throw new Error('spotlight({ color }): the light\'s hue');
  return { color: base, grain, fill: [{ kind: 'radial', at, size, stops: [{ color, alpha: 0.9, at: 0 }, { color, alpha: 0.3, at: 0.5 }, fade(color)] }] };
}

/* ── blocks ──────────────────────────────────────────────────────────────── */

/**
 * A glow: a blurred disc behind the thing that glows. A generated cut-out comes back with
 * its own glow gone (the halo's pixels are transparent), so every hero object needs one.
 */
/** @param {{ x: number, y: number, color: string, size?: number, blur?: number, opacity?: number, z?: number }} opts */
export function glow({ x, y, size = 520, color, blur = 90, opacity = 0.5, z = 0 } = /** @type {any} */ ({})) {
  if (!color) throw new Error('glow({ color }): the light\'s hue');
  return { type: 'group', blocks: [], at: { x: Math.round(x - size / 2), y: Math.round(y - size / 2), w: size, h: size, z },
    style: { bg: color, radius: 999, blur, opacity } };
}

/**
 * Frosted glass: a translucent pane, a hairline edge, blur behind, depth under. `on` is what
 * it floats over — "colour" (a lit sky: whiter, fainter) or "dark" (a black ground: denser).
 * Its children FLOW, so the pane's own padding and gap lay them out; a child with its own
 * `at` opts out of that.
 */
/** @param {{ x: number, y: number, w: number, h: number, on?: 'colour' | 'dark', radius?: number, pad?: number, gap?: number, z?: number, tint?: string }} opts @param {object[]} [blocks] */
export function glass({ x, y, w, h, on = 'colour', radius, pad = 40, gap = 16, z = 2, tint } = /** @type {any} */ ({}), blocks = []) {
  const dark = on === 'dark';
  return {
    type: 'group', blocks,
    at: { x, y, w, h, z },
    style: {
      bg: tint ?? (dark ? '#1A1A1FD9' : '#FFFFFF0D'), glass: dark ? 30 : 24, radius: radius ?? (dark ? 22 : 32),
      rule: 'box', ruleWidth: 1.5, ruleColor: dark ? '#FFFFFF1A' : '#FFFFFF33',
      shadow: [{ y: 30, blur: 70, color: '#00000055' }], pad, gap
    }
  };
}

/**
 * Star specks: a few points, each with its own soft halo — seven on a slide is a sky,
 * seventy is wallpaper. Seeded, so a deck's sky is the same every build.
 */
/** @param {{ n?: number, seed?: number, w?: number, h?: number, r?: number, halo?: number, opacity?: number, color?: string, margin?: number, z?: number }} [opts] */
export function stars({ n = 7, seed = 1, w = 1920, h = 1080, r = 3, halo = 7, opacity = 1, color = '#FFFFFF', margin = 60, z = 0 } = {}) {
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = Array.from({ length: n }, () => [Math.round(margin + rand() * (w - 2 * margin)), Math.round(margin + rand() * (h - 2 * margin))]);
  const svg =
    `<defs><filter id='halo' x='-3' y='-3' width='7' height='7'><feGaussianBlur stdDeviation='${halo / 2}'/></filter></defs>` +
    pts.map(([x, y]) => `<circle cx='${x}' cy='${y}' r='${halo}' fill='${color}' opacity='${+(0.55 * opacity).toFixed(3)}' filter='url(#halo)'/>` +
      `<circle cx='${x}' cy='${y}' r='${r}' fill='${color}' opacity='${opacity}'/>`).join('');
  return { type: 'svg', svg, viewBox: `0 0 ${w} ${h}`, at: { x: 0, y: 0, w, h, z } };
}
