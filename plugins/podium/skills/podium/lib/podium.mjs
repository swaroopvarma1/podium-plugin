/**
 * The deck, as a program.
 *
 * Everything here is arithmetic and JSON. There are no layouts, no presets and no
 * defaults worth inheriting — what this gives you is the grid maths you would otherwise
 * do wrong by hand, block constructors that are shorter than the objects they build, and
 * one function that publishes.
 *
 *   import { Deck, slide, text, svg, image, group, chart, table, rule, grid } from './lib/podium.mjs';
 */
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * The default plane. A deck can carry its own — `new Deck({ frame: { w: 1080, h: 1350 } })`
 * — and then these two are not the numbers you want; pass the frame to `grid()` and read
 * the width off it.
 */
export const W = 1920;
export const H = 1080;

/* ── the grid ───────────────────────────────────────────────────────────────── */

/**
 * Twelve columns inside the margin. `at(col, span, y)` returns a frame; `x(n)` and
 * `w(span)` return the numbers, for the times you need to place something against a
 * column without being in one.
 *
 * Use `{col, span}` in a frame where you can: the renderer resolves it against the theme's
 * own `--margin` and `--gutter` at draw time, so the block survives a change of theme.
 * These numbers are for computing DRAWINGS, which have to be in absolute units anyway.
 *
 * One thing worth knowing before you place anything rotated: `at.rotate` turns the frame
 * about its own CENTRE, so a 640×120 block at x:1080 y:330 rotated 90° ends up occupying
 * x 1340–1460 and y 70–710. Work out the centre, not the corner.
 */
export function grid({ margin = 104, gutter = 28, columns = 12, frame } = {}) {
  const width = frame?.w ?? W;
  const col = (width - margin * 2 - gutter * (columns - 1)) / columns;
  const x = (n) => margin + (n - 1) * (col + gutter);
  const w = (span) => span * col + (span - 1) * gutter;
  return {
    margin, gutter, columns, col,
    /** The plane this grid was computed against, so a caller never re-derives it. */
    frame: { w: width, h: frame?.h ?? H },
    x, w,
    /** The right edge of column n. */
    r: (n) => x(n) + col,
    /** A frame on the grid. The renderer re-resolves col/span, so this survives a theme. */
    at: (c, span, y, extra = {}) => ({ col: c, span, ...(y === undefined ? {} : { y }), ...extra }),
    /** Absolute, for drawings: the same rectangle in px. */
    box: (c, span, y, h) => ({ x: x(c), w: w(span), ...(y === undefined ? {} : { y }), ...(h ? { h } : {}) })
  };
}

/* ── blocks ─────────────────────────────────────────────────────────────────── */

const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

/** `text('Nothing on it', 'title', { at, style })` */
export const text = (str, role, { at, style } = {}) =>
  clean({ type: 'text', text: str, role, at, style });

/**
 * `svg(fragment, { at, color, viewBox })`
 *
 * The frame is the coordinate space unless you give a viewBox, and preserveAspectRatio is
 * `meet` — so a viewBox whose aspect does not match the frame gets letterboxed, and a
 * one-pixel-wide rule with no viewBox scales away to nothing. Match them.
 */
export const svg = (source, { at, color, viewBox, style } = {}) =>
  clean({ type: 'svg', svg: source, at, color, viewBox, style });

export const image = (src, { at, alt, fit = 'contain', position, style } = {}) =>
  clean({ type: 'image', src, alt, fit, position, at, style });

export const group = (blocks, { at, style } = {}) =>
  clean({ type: 'group', blocks, at, style });

export const chart = (spec, { at, style } = {}) =>
  clean({ type: 'chart', chart: spec, at, style });

/**
 * `table(head, data, { at, style, cols, align, dividers, rows, headColors, lineColor,
 * rowFill, cell, rowHead })` — every table field passes through. It used to take only `at`
 * and `style`, so a program built with this library could not reach column widths, row
 * cards or dividers at all; see references/vocabulary.md for each.
 */
export const table = (head, data, { at, style, ...options } = {}) =>
  clean({ type: 'table', head, data, ...options, at, style });

/**
 * A hairline. The viewBox is matched to the frame because an unmatched one is the
 * commonest way a rule disappears without any error anywhere.
 */
export const rule = (x, y, w, h, color = 'hairline', z = 0) =>
  svg(`<rect x='0' y='0' width='${w}' height='${h}' fill='currentColor'/>`,
    { at: { x, y, w, h, z }, viewBox: `0 0 ${w} ${h}`, color });

export const slide = (props, blocks) => clean({ ...props, blocks });

/* ── the deck ───────────────────────────────────────────────────────────────── */

export class Deck {
  constructor({ id, project, title, subtitle, theme, poster, frame }) {
    Object.assign(this, { id, project, title, subtitle, theme, poster, frame, slides: [] });
  }
  add(props, blocks) {
    this.slides.push(slide(props, blocks));
    return this;
  }
  /**
   * A whitelist, not a spread — anything not named here never reaches the server. That is
   * deliberate (a stray field would be rejected as an unknown key), and it is also how
   * `poster` silently went missing the first time it was added. Add the field here too.
   */
  toJSON() {
    const { id, project, title, subtitle, theme, poster, frame, slides } = this;
    return clean({ id, project, title, subtitle, theme, poster, frame, slides });
  }
  write(path) {
    writeFileSync(path, JSON.stringify(this, null, 1));
    return this;
  }
}

/* ── publishing ─────────────────────────────────────────────────────────────── */

const env = (k, fallback) => process.env[k] ?? fallback;

/**
 * Set when this program is running on Podium's build service — the `build` tool, for
 * clients with no machine of their own (claude.ai chat). There is no network there and no
 * token: `publish` writes the deck to this file and Podium publishes it once the program
 * exits, and pictures are `/m/…` paths from the `add_pictures` and `generate_image` tools.
 */
const BUILD_OUT = env('PODIUM_BUILD_OUT');

async function call(name, args) {
  if (BUILD_OUT) {
    throw new Error(
      `${name}: this program is running on Podium's build service, which has no network. ` +
      (name === 'upload_media'
        ? "Bring the person's pictures in with the add_pictures tool (generated ones with generate_image), and put the /m/… path it returns in the program."
        : 'Call the tool itself; the program only builds the deck.'));
  }
  const url = env('PODIUM_URL', 'https://podium.breezelabs.app');
  const token = env('PODIUM_TOKEN');
  if (!token) throw new Error('set PODIUM_TOKEN (make one at <podium>/settings → API tokens)');

  const payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } });
  const res = await fetch(`${url}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: payload
  });

  /* Read as text, THEN parse. A revoked token answers 401 with a JSON error and no
     `result`, and a proxy in front of the server answers with an HTML page — the first
     used to come back as `published undefined vundefined` with exit code 0, and the
     second as a bare "Unexpected token <". Both are now an error that says who refused
     the call and why. */
  const raw = await res.text();
  let body = null;
  try { body = JSON.parse(raw); } catch { /* not JSON — reported below */ }
  if (!res.ok || !body || typeof body !== 'object' || body.error) {
    const said =
      body?.error_description ?? body?.error?.message ??
      (typeof body?.error === 'string' ? body.error : undefined) ?? body?.message ??
      (raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) || 'an empty response');
    const kb = Math.round(Buffer.byteLength(payload) / 1024);
    const size = kb > 512 && (res.status === 400 || res.status === 413)
      ? ` (the request was ${kb}KB — a server whose BODY_SIZE_LIMIT is smaller refuses it unread)`
      : '';
    const auth = res.status === 401 ? ' — make a new token at <podium>/settings → API tokens' : '';
    throw new Error(`${name}: ${url}/mcp answered ${res.status}${res.statusText ? ` ${res.statusText}` : ''}: ${said}${auth}${size}`);
  }
  const out = body.result?.content?.[0]?.text ?? JSON.stringify(body);
  if (body.result?.isError) throw new Error(out);
  try { return JSON.parse(out); } catch { return out; }
}

/**
 * Publish, and print what came back.
 *
 * The warnings are printed rather than returned quietly, because they name the failures a
 * screenshot cannot show and the whole point of this call is that somebody reads them.
 */
export async function publish(deck, { visibility } = {}) {
  if (BUILD_OUT) {
    const json = JSON.parse(JSON.stringify(deck));
    writeFileSync(BUILD_OUT, JSON.stringify(visibility ? { ...json, visibility } : json));
    console.error(`built ${json.id ?? '(no id)'} — ${json.slides?.length ?? 0} slides; Podium publishes it when the program exits`);
    return { published: json.id, version: null, slides: json.slides?.length ?? 0, warnings: [] };
  }
  const result = await call('publish', { ...JSON.parse(JSON.stringify(deck)), visibility });
  /* `call` returns the tool's text when it is not JSON. A publish that answered with
     something other than the deck it saved is not a publish, whatever the status said. */
  if (!result || typeof result !== 'object' || result.published === undefined) {
    throw new Error(`publish: the server did not return a published deck — it said: ${String(typeof result === 'string' ? result : JSON.stringify(result)).slice(0, 300)}`);
  }
  const size = (JSON.stringify(deck).length / 1024).toFixed(0);
  console.error(`published ${result.published} v${result.version} — ${result.slides} slides, ${size}KB`);
  for (const w of result.warnings ?? []) {
    console.error(`  ${w.level.padEnd(5)} ${w.at} — ${w.says}${w.fix ? `\n        fix: ${w.fix}` : ''}`);
  }
  if (!result.warnings?.length) console.error('  no warnings');
  console.error(`\n  look   ${result.look}\n  stage  ${result.stage}\n  share  ${result.share}\n`);
  return result;
}

/**
 * An image on disk → the `/m/<id>` to put on a slide.
 *
 * Pass the deck's own project. Without it the picture lands in whichever project the
 * account happens to list first, which works right up until you look for it.
 */
/**
 * Slide one, uploaded, as the picture a share link shows.
 *
 * Run AFTER `lib/look.mjs` has written its screenshots — `shots/s01.png` is the file. Then
 * set it on the deck and publish once more:
 *
 *   deck.poster = await poster('shots/s01.png', deck);
 *   await publish(deck, { visibility: 'unlisted' });
 *
 * Podium cannot make this itself and will not: there is no browser on the server, which
 * is the reason it costs nothing to run. Your machine already has one open.
 */
export async function poster(path, deck) {
  return upload(path, `${deck?.title ?? 'Deck'} — cover`, deck?.project);
}

export async function upload(path, alt, project) {
  if (BUILD_OUT) return call('upload_media');
  const out = await call('upload_media', { data: readFileSync(path).toString('base64'), alt, project });
  console.error(`uploaded ${path} → ${out.url} (${(out.bytes / 1024).toFixed(0)}KB, ${out.width}×${out.height})`);
  return out.url;
}

export { call };
