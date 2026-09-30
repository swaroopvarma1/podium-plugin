/**
 * Computed marks.
 *
 * A drawn mark is worth putting on a slide when it could not have been typed. These are
 * the primitives that make that cheap: a seeded random you can trust to letter the same
 * way forever, one-dimensional noise, hatching, stipple, contours, arcs with dimensions,
 * and a tiler for repeating patterns.
 *
 * Everything returns a bare SVG fragment. Use `currentColor` and the theme paints it;
 * pass the fragment to `svg()` with a viewBox that matches the frame's aspect.
 *
 * These are primitives, NOT a house style. The mark that belongs on your deck is one you
 * derive from the subject — a curve from the real function, a field whose density is the
 * data, a pattern out of the culture the deck is about. Compose these into that.
 */

/* ── randomness you can rely on ─────────────────────────────────────────────── */

/** Seeded PRNG. The same seed letters identically on every render, forever. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Smooth 1-D noise on [0,1] → [-1,1]: a few sine components at random phase, each half
 * the amplitude of the last. Deterministic, cheap, and enough for any natural-looking
 * boundary — a coastline, a temper line, a torn edge, a hand-drawn rule.
 */
export function noise(seed, octaves = 5) {
  const r = rng(seed);
  const parts = Array.from({ length: octaves }, (_, i) => ({
    f: 2 ** i * (0.7 + r() * 0.6),
    p: r() * Math.PI * 2,
    a: 1 / 2 ** i
  }));
  const norm = parts.reduce((s, p) => s + p.a, 0);
  return (t) => parts.reduce((s, p) => s + p.a * Math.sin(t * p.f * Math.PI * 2 + p.p), 0) / norm;
}

/* Coordinates are rounded on the way out. A slide is 1920 units wide and the deck ships
   as JSON over the wire, so a third decimal place is tens of kilobytes of nothing. */
export const n1 = (v) => Math.round(v * 10) / 10;
export const n0 = (v) => Math.round(v);

/**
 * A default id for a `<defs>` entry, derived from everything that shapes it.
 *
 * Every svg block on every slide is inlined into ONE document, so an id is global to the
 * deck: two hatches that both called their clip `hatchclip` both clipped to whichever rect
 * the browser met first. Random ids would fix that and break the other promise — a deck is
 * rebuilt by program and diffed, so the same call has to print the same bytes every time.
 * A hash of the arguments gives both: identical calls agree, different calls do not meet.
 */
const uid = (kind, ...parts) => {
  let h = 0x811c9dc5;
  for (const ch of parts.map((p) => (typeof p === 'function' ? p.toString() : JSON.stringify(p))).join('|')) {
    h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
  }
  return `${kind}-${(h >>> 0).toString(36)}`;
};

/** Points → a polyline `d`. */
export const poly = (pts, close = false) =>
  `M ${pts.map(([x, y]) => `${n1(x)} ${n1(y)}`).join(' L ')}${close ? ' Z' : ''}`;

/* ── boundaries ─────────────────────────────────────────────────────────────── */

/**
 * A wobbling horizontal boundary sampled from noise.
 *
 * `shape` bends the signal before it becomes a height, which is where the character of a
 * line lives: the default is symmetric, `x => Math.sign(x) * Math.abs(x) ** 0.6` makes
 * peaks round and troughs tight, and the reverse makes spikes.
 */
export function boundary({ w = 1920, y = 0, amp = 100, seed = 1, samples = 480, freq = 3, shape } = {}) {
  const s = noise(seed, 6);
  const at = (t) => {
    const v = s(t * freq);
    return y - (shape ? shape(v) : v) * amp;
  };
  const pts = Array.from({ length: samples }, (_, i) => {
    const t = i / (samples - 1);
    return [t * w, at(t)];
  });
  return { at, path: poly(pts) };
}

/**
 * Hand-drawn wobble: the same polyline, displaced by low-frequency noise, so corners
 * overshoot and sides stop being parallel. A filter applied over true geometry gives
 * uniform amplitude and corners that still meet, which is exactly what a drawn line
 * does not do — so this displaces the points instead.
 */
export function wobble(pts, { amp = 4, seed = 3, close = false } = {}) {
  const nx = noise(seed, 3);
  const ny = noise(seed + 977, 3);
  return poly(pts.map(([x, y], i) => {
    const t = i / Math.max(1, pts.length - 1);
    return [x + nx(t) * amp, y + ny(t) * amp];
  }), close);
}

/* ── fills ──────────────────────────────────────────────────────────────────── */

/**
 * Hatching. Grey made of line density rather than opacity, which is what survives a
 * projector, a photocopier and a two-ink press.
 *
 * `id` names the clip path. Leave it out and one is derived from the arguments, so two
 * different hatches in one deck never clip to each other's rectangle.
 */
export function hatch({ w, h, angle = 45, gap = 8, seed, id } = {}) {
  const clip = id ?? uid('hatch', w, h, angle, gap, seed);
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a), dy = Math.sin(a);
  const span = Math.abs(w * dy) + Math.abs(h * dx);
  const jitter = seed === undefined ? null : rng(seed);
  const d = [];
  for (let s = -span; s <= span; s += gap) {
    const j = jitter ? (jitter() - 0.5) * gap * 0.35 : 0;
    const px = -dy * (s + j), py = dx * (s + j);
    d.push(`M${n0(px - dx * span)} ${n0(py - dy * span)}L${n0(px + dx * span)} ${n0(py + dy * span)}`);
  }
  return `<g clip-path='url(#${clip})'><path d='${d.join('')}' fill='none' stroke='currentColor'/></g>` +
    `<defs><clipPath id='${clip}'><rect width='${w}' height='${h}'/></clipPath></defs>`;
}

/**
 * A stipple field whose density is a function you supply — so the mark can BE the data
 * rather than illustrate it. `density(x, y)` returns 0–1.
 *
 * Bucketed into a handful of `<use>` references rather than fully-specified circles: the
 * same picture, a fifth of the bytes, and the bytes are the difference between a deck
 * that publishes and one that times out.
 *
 * `id` prefixes the dot definitions (`${id}0`, `${id}1`…). Leave it out and one is derived
 * from the arguments, so two stipples with different dot sizes never share each other's.
 */
export function stipple({ w, h, count = 1500, seed = 7, density = () => 1, sizes = [0.8, 1.4, 2.2, 3], id } = {}) {
  id ??= `${uid('stipple', w, h, count, seed, density, sizes)}-`;
  const r = rng(seed);
  const bins = new Map();
  for (let i = 0; i < count; i++) {
    const x = r() * w, y = r() * h;
    const d = Math.max(0, Math.min(1, density(x, y)));
    if (r() > d) continue;
    const si = Math.min(sizes.length - 1, Math.floor(r() * d * sizes.length * 1.15));
    const oi = Math.min(4, Math.floor(d * 5));
    const key = si * 5 + oi;
    if (!bins.has(key)) bins.set(key, []);
    bins.get(key).push(`<use href='#${id}${si}' x='${n0(x)}' y='${n0(y)}'/>`);
  }
  const defs = sizes.map((s, i) => `<circle id='${id}${i}' r='${s}'/>`).join('');
  const groups = [...bins.entries()]
    .map(([k, u]) => `<g opacity='${n1(0.14 + 0.62 * ((k % 5) + 0.5) / 5)}'>${u.join('')}</g>`)
    .join('');
  return `<defs>${defs}</defs><g fill='currentColor'>${groups}</g>`;
}

/**
 * Nested closed contours around scattered centres — a topographic field. Wood grain,
 * pressure, elevation, a crowd. The wobble is capped well under the ring spacing: rings
 * that cross each other stop reading as contours and start reading as steel wool.
 */
export function contours({
  w, h, centres = 6, rings = 6, r0 = 30, step = 32, squash = 0.36, seed = 5, stroke = 1.1
} = {}) {
  const r = rng(seed);
  const paths = [];
  for (let c = 0; c < centres; c++) {
    const cx = (c + 0.5 + (r() - 0.5) * 0.5) * (w / centres);
    const cy = h * (0.3 + r() * 0.4);
    const wob = noise(seed * 31 + c * 7, 4);
    const sq = squash * (0.7 + r() * 0.6);
    const tilt = (r() - 0.5) * 0.5;
    const gap = step * (0.72 + r() * 0.6);
    const n = 3 + Math.floor(r() * (rings - 2));
    for (let k = 1; k <= n; k++) {
      const base = r0 + k * gap;
      const amp = Math.min(gap * 0.44, base * 0.26);
      const pts = [];
      for (let i = 0; i <= 56; i++) {
        const th = (i / 56) * Math.PI * 2;
        const rad = base + wob(i / 56 + k * 0.13) * amp;
        const px = Math.cos(th) * rad, py = Math.sin(th) * rad * sq;
        pts.push([cx + px - py * tilt, cy + py + px * tilt * 0.14]);
      }
      paths.push(`<path d='${poly(pts, true)}'/>`);
    }
  }
  return `<g fill='none' stroke='currentColor' stroke-width='${stroke}'>${paths.join('')}</g>`;
}

/* ── measured geometry ──────────────────────────────────────────────────────── */

/**
 * A circular arc described by its chord and its sag, optionally dimensioned like an
 * engineering drawing — which is how you say "this curve is a measurement, not a gesture".
 */
export function arc({ x0 = 0, x1 = 1000, y = 300, sag = 120, dim = false, stroke = 2.4 } = {}) {
  const L = x1 - x0;
  const R = (L * L) / 4 / (2 * sag) + sag / 2;
  const curve = `<path d='M ${x0} ${y} A ${n1(R)} ${n1(R)} 0 0 1 ${x1} ${y}' fill='none' stroke='currentColor' stroke-width='${stroke}'/>`;
  if (!dim) return { R, svg: curve };
  const mx = (x0 + x1) / 2;
  return {
    R,
    svg:
      `<path d='M ${x0} ${y} H ${x1}' stroke='currentColor' stroke-width='1.2' stroke-dasharray='3 10' opacity='.6'/>` +
      curve +
      `<path d='M ${mx} ${y} V ${n0(y - sag)}' stroke='currentColor' stroke-width='1.4' opacity='.85'/>` +
      `<path d='M ${mx - 9} ${n0(y - sag + 12)} L ${mx} ${n0(y - sag)} L ${mx + 9} ${n0(y - sag + 12)}' fill='none' stroke='currentColor' stroke-width='1.4'/>` +
      `<path d='M ${mx - 9} ${y - 12} L ${mx} ${y} L ${mx + 9} ${y - 12}' fill='none' stroke='currentColor' stroke-width='1.4'/>` +
      `<circle cx='${x0}' cy='${y}' r='5.5' fill='currentColor'/><circle cx='${x1}' cy='${y}' r='5.5' fill='currentColor'/>`
  };
}

/** A dated rule. Tick height carries the weight, so the eye finds the year that matters. */
export function axis({ w = 1200, stops = [], h = 130 } = {}) {
  const span = stops[stops.length - 1].t - stops[0].t;
  const x = (t) => ((t - stops[0].t) / span) * w;
  const marks = stops.map((s) => {
    const big = (s.weight ?? 0.4) > 0.8;
    return `<path d='M ${n0(x(s.t))} 0 V ${n0(-h * (s.weight ?? 0.4))}' stroke='currentColor' ` +
      `stroke-width='${big ? 3.5 : 1.5}' opacity='${big ? 1 : 0.7}'/>` +
      `<circle cx='${n0(x(s.t))}' cy='0' r='${big ? 7 : 4}' fill='currentColor'/>`;
  }).join('');
  return { x, svg: `<path d='M 0 0 H ${w}' stroke='currentColor' stroke-width='1.6' opacity='.6'/>${marks}` };
}

/* ── repetition ─────────────────────────────────────────────────────────────── */

/**
 * Tile a motif across a rectangle, as a real SVG `<pattern>`.
 *
 * `motif` is a fragment drawn in a `size`×`size` cell. Offsetting alternate rows by half
 * a cell is what turns a grid of circles into a fabric — most traditional repeats are a
 * brick or a half-drop, not a square lattice.
 *
 * `id` names the pattern. Leave it out and one is derived from the arguments, so two
 * different tiles in one deck never paint with each other's motif.
 */
export function tile({ w, h, size = 60, motif, id, offset = 0, stroke = 1.4, fill = 'none' } = {}) {
  id ??= uid('tile', w, h, size, motif, offset, stroke, fill);
  const cell = offset
    ? `<g>${motif}</g><g transform='translate(${n1(size * offset)},${n1(size / 2)})'>${motif}</g>` +
      `<g transform='translate(${n1(-size * offset)},${n1(size / 2)})'>${motif}</g>`
    : motif;
  return (
    `<defs><pattern id='${id}' width='${size}' height='${size}' patternUnits='userSpaceOnUse'>` +
    `<g fill='${fill}' stroke='currentColor' stroke-width='${stroke}'>${cell}</g></pattern></defs>` +
    `<rect width='${w}' height='${h}' fill='url(#${id})'/>`
  );
}
