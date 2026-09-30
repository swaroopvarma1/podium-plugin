#!/usr/bin/env node
/**
 * Eyes: the agent looks at the deck it just published.
 *
 *   node lib/eyes.mjs "<look-url>"                  overview pictures → ./shots/
 *   node lib/eyes.mjs "<look-url>" --slides 3,7     full size         → ./shots/
 *   node lib/eyes.mjs "<look-url>" --slides 4.1     slide 4 after its first click (a build)
 *
 * Hand it the `look` URL that `publish` and `preview` return: it prints the measurements
 * from `window.podium.report()` and writes the slides as pictures. That needs nothing set
 * up, so it is the default. With no arguments the same file is a local MCP server with one
 * tool, `look`, which returns the pictures inside the tool result — optional, and the way
 * to look from a client with no shell:
 *
 *   claude mcp add --scope user podium-eyes -- node ${CLAUDE_SKILL_DIR}/lib/eyes.mjs
 *
 * Why it exists. Every layout bug this project has had survived a clean build and died the
 * moment somebody looked at a picture. Looking used to mean `npm i playwright`, a script,
 * and opening PNGs by hand, so an agent that was never set up for it published blind. The
 * agent that builds decks in Figma gets a screenshot back from every call. This is that,
 * without Podium's server ever running a browser: it drives the Chrome already on this
 * machine.
 *
 * Nothing to install. Chrome is driven over the DevTools protocol on a pipe
 * (`--remote-debugging-pipe`, the transport Puppeteer uses underneath), so there is no
 * Playwright, no WebSocket library and no npm step. Node 18+ and an installed Chrome
 * (or Chromium, Edge, Brave) are the whole list; PODIUM_CHROME names a binary explicitly.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { tmpdir, homedir } from 'node:os';
import { join, delimiter } from 'node:path';
import { createInterface } from 'node:readline';
import { pathToFileURL } from 'node:url';

const VERSION = '1.0.0';

/* Claude scales any image whose long edge is past ~1568px down to it, so a bigger capture
   costs transfer and buys nothing. Every picture here is sized to land at that edge. */
const EDGE = 1568;
/** Full-size views per call. Six slides at 1568px is about twelve thousand tokens. */
const MAX_SLIDES = 6;
const CALL_TIMEOUT = 120_000;
/* An encoded picture past this goes back as JPEG. Images in a tool result are capped at
   5MB, and a photographic slide at 1568px can pass that as PNG. */
const PNG_LIMIT = 4.5 * 1024 * 1024;

/* The contact sheet's side padding, from ContactSheet.svelte. The viewport is the picture's
   width plus this on both sides, so a re-tiled sheet lands exactly on EDGE. */
const SHEET_PAD = 32;
/* A margin kept round an overview picture, so a tile's shadow is not cut at the edge. The
   sheet is laid out this much narrower on each side, and the picture still lands on EDGE. */
const MARGIN = 6;
const SHEET_VIEWPORT = EDGE - 2 * MARGIN + 2 * SHEET_PAD;

/*
 * What the pictures need from the sheet that a person looking at it does not.
 *
 * - A neutral mid-grey board and light captions. The sheet paints its board and captions in
 *   the deck's own colours, so on a deck whose inverted ink is dark the captions — the slide
 *   numbers the agent is told to refer to — vanished into the board, and a dark slide on a
 *   dark board had no visible edge. Grey separates slides of any ground from each other.
 * - `min-width: 0` on a tile. A grid item is as wide as its longest unbreakable line unless
 *   told otherwise, so one long slide title in a caption widened its column and pushed the
 *   sheet past the picture's edge. ContactSheet.svelte has the same fix; it is repeated here
 *   so a look at a server from before that fix still comes back the right size.
 */
const SHEET_CSS = [
  '.contact { background: #3b3c42 !important; }',
  '.tiles > figure.cell { min-width: 0; }',
  '.tiles figcaption { color: #f4f4f6 !important; opacity: 1 !important; }'
].join(' ');

/* ─────────────────────────────  chrome  ───────────────────────────── */

const onPath = (name) => (process.env.PATH ?? '').split(delimiter).filter(Boolean).map((d) => join(d, name));

function findChrome() {
  const named = process.env.PODIUM_CHROME;
  if (named) {
    if (existsSync(named)) return named;
    throw new Error(`PODIUM_CHROME is ${named}, and there is nothing there.`);
  }
  const home = homedir();
  const winRoots = ['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].map((v) => process.env[v]).filter(Boolean);
  const candidates = {
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      `${home}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    ],
    win32: winRoots.flatMap((r) => [
      `${r}\\Google\\Chrome\\Application\\chrome.exe`,
      `${r}\\Microsoft\\Edge\\Application\\msedge.exe`
    ]),
    linux: ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge'].flatMap(onPath)
  }[process.platform] ?? [];
  const found = candidates.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      'No Chrome on this machine. Install Google Chrome, or set PODIUM_CHROME to the binary ' +
      'of any Chromium-based browser.'
    );
  }
  return found;
}

/**
 * One headless browser, spoken to over DevTools-protocol messages on fds 3 and 4: JSON,
 * each terminated by a NUL byte. Commands carry an id and resolve on the matching reply;
 * everything else is an event, handed to whoever is listening.
 */
class Chrome {
  /** `args` are extra switches: Podium's rendering service adds the ones a container needs. */
  static async launch({ args = [] } = {}) {
    const bin = findChrome();
    const dir = mkdtempSync(join(tmpdir(), 'podium-eyes-'));
    const proc = spawn(bin, [
      '--headless=new',
      '--remote-debugging-pipe',
      `--user-data-dir=${dir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--hide-scrollbars',
      '--mute-audio',
      /* Colours as authored. Without this a capture takes the display's colour profile,
         and a sampled ground comes back two shades off what the theme says. */
      '--force-color-profile=srgb',
      ...args,
      'about:blank'
    ], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
    const chrome = new Chrome(proc, dir, bin);
    await withTimeout(chrome.send('Browser.getVersion'), 20_000, `Chrome at ${bin} did not start`);
    return chrome;
  }

  constructor(proc, dir, bin) {
    this.proc = proc;
    this.dir = dir;
    this.bin = bin;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Set();
    this.stderr = '';
    this.dead = false;

    this.out = proc.stdio[3];
    const input = proc.stdio[4];
    input.setEncoding('utf8');
    let buf = '';
    input.on('data', (chunk) => {
      buf += chunk;
      let end;
      while ((end = buf.indexOf('\0')) >= 0) {
        const raw = buf.slice(0, end);
        buf = buf.slice(end + 1);
        try { this.receive(JSON.parse(raw)); } catch { /* a malformed frame is not ours to crash on */ }
      }
    });
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (d) => { this.stderr = (this.stderr + d).slice(-4000); });
    this.exited = new Promise((resolve) => {
      proc.on('exit', (code, signal) => {
        this.fail(new Error(
          `Chrome exited (${signal ?? code}). ${this.stderr.trim().split('\n').slice(-2).join(' ')}`.trim()
        ));
        /* Only now: Chrome writes to its profile until the moment it exits, so removing it
           any earlier leaves a half-deleted folder behind in the temp directory. */
        try { rmSync(this.dir, { recursive: true, force: true }); } catch { /* best effort */ }
        resolve();
      });
    });
    proc.on('error', (e) => this.fail(e));
    // A pipe that errors after exit would otherwise surface as an unhandled 'error' event.
    this.out.on('error', () => {});
    input.on('error', () => {});
  }

  fail(err) {
    if (this.dead) return;
    this.dead = true;
    for (const { reject } of this.pending.values()) reject(err);
    this.pending.clear();
  }

  send(method, params = {}, sessionId) {
    if (this.dead) return Promise.reject(new Error('Chrome is not running'));
    const id = ++this.seq;
    const frame = JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.out.write(frame + '\0');
    });
  }

  receive(msg) {
    if (msg.id !== undefined) {
      const call = this.pending.get(msg.id);
      if (!call) return;
      this.pending.delete(msg.id);
      if (msg.error) call.reject(new Error(`${call.method}: ${msg.error.message}`));
      else call.resolve(msg.result);
      return;
    }
    for (const fn of this.listeners) fn(msg);
  }

  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Ends the browser and resolves once it has exited and its profile is gone. */
  async close() {
    this.fail(new Error('closed'));
    if (this.proc.exitCode === null && this.proc.signalCode === null) {
      try { this.proc.kill(); } catch { /* already gone */ }
      const hard = setTimeout(() => { try { this.proc.kill('SIGKILL'); } catch { /* gone */ } }, 3000);
      await this.exited;
      clearTimeout(hard);
    }
  }
}

function withTimeout(promise, ms, what) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${what} (after ${Math.round(ms / 1000)}s)`)), ms); })
  ]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shortUrl = (u) => {
  if (!u) return '(unknown url)';
  try { const x = new URL(u); return `${x.pathname}${x.search ? '?…' : ''}`.slice(0, 90); } catch { return String(u).slice(0, 90); }
};

/* ─────────────────────────────  a page  ───────────────────────────── */

/**
 * A fresh tab for one look, with what went wrong while it loaded collected on the side —
 * a 404 on `/m/…` is a missing picture, and nothing in the measured report can see that.
 */
async function openTab(chrome) {
  const { targetId } = await chrome.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await chrome.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params) => chrome.send(method, params, sessionId);

  const problems = [];
  const urls = new Map();
  let onLoad = null;
  const off = chrome.on((e) => {
    if (e.sessionId !== sessionId) return;
    const p = e.params ?? {};
    switch (e.method) {
      case 'Page.loadEventFired':
        onLoad?.();
        break;
      case 'Runtime.exceptionThrown':
        problems.push(`page error: ${(p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text ?? '').split('\n')[0]}`);
        break;
      case 'Runtime.consoleAPICalled':
        if (p.type === 'error') {
          problems.push(`console error: ${(p.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 240)}`);
        }
        break;
      case 'Network.requestWillBeSent':
        urls.set(p.requestId, p.request?.url);
        break;
      case 'Network.responseReceived':
        if (p.response?.status >= 400) problems.push(`HTTP ${p.response.status} ${shortUrl(p.response.url)}`);
        break;
      case 'Network.loadingFailed':
        if (!p.canceled && p.blockedReason !== 'inspector') problems.push(`${p.errorText} ${shortUrl(urls.get(p.requestId))}`);
        break;
    }
  });

  await Promise.all([send('Page.enable'), send('Runtime.enable'), send('Network.enable')]);

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(`in the page: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
    }
    return r.result?.value;
  };

  const viewport = (width, height) =>
    send('Emulation.setDeviceMetricsOverride', { width: Math.round(width), height: Math.round(height), deviceScaleFactor: 1, mobile: false });

  const navigate = async (url) => {
    const loaded = new Promise((resolve) => { onLoad = resolve; });
    const nav = await send('Page.navigate', { url });
    if (nav.errorText) throw new Error(`could not open ${url}: ${nav.errorText}`);
    await withTimeout(loaded, 60_000, 'the page never finished loading');
  };

  /** Poll an expression until it is truthy. Resolves false on timeout rather than throwing. */
  const until = async (expression, ms) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      if (await evaluate(expression).catch(() => false)) return true;
      await sleep(150);
    }
    return false;
  };

  /** Two animation frames, then a beat: long enough for a ResizeObserver to rescale a tile. */
  const settle = () => evaluate('new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 120))))');

  /** Every picture on the page decoded, or given up on after `ms`. */
  const images = (ms = 15_000) => evaluate(`Promise.race([
    Promise.all([...document.images].filter((i) => i.getClientRects().length).map((i) =>
      i.complete ? null : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))),
    new Promise((r) => setTimeout(r, ${ms}))
  ]).then(() => true)`);

  /** A region in page coordinates, as encoded bytes. */
  const capture = async ([x, y, width, height]) => {
    await evaluate(`window.scrollTo(0, ${Math.max(0, Math.floor(y) - 16)})`);
    await settle();
    const clip = { x: Math.floor(x), y: Math.floor(y), width: Math.ceil(width), height: Math.ceil(height), scale: 1 };
    let shot = await send('Page.captureScreenshot', { format: 'png', clip, captureBeyondViewport: true });
    let mime = 'image/png';
    if (shot.data.length * 0.75 > PNG_LIMIT) {
      shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85, clip, captureBeyondViewport: true });
      mime = 'image/jpeg';
    }
    return { data: shot.data, mimeType: mime, width: clip.width, height: clip.height };
  };

  const close = async () => {
    off();
    await chrome.send('Target.closeTarget', { targetId }).catch(() => {});
  };

  return { evaluate, viewport, navigate, until, settle, images, capture, close, problems };
}

/* ─────────────────────────────  looking  ──────────────────────────── */

/**
 * The URL a look should open. A preview link (`/x/…`) or a share link (`/d/…`) is turned
 * into its contact sheet, whatever mode it was minted in — `preview` with `slide` hands
 * back a `?still=1#n` stage link, and the sheet is where every slide can be measured.
 */
function sheetUrl(raw, comments = false) {
  let u;
  try { u = new URL(String(raw ?? '').trim()); } catch { throw new Error(`"${raw}" is not a URL. Pass the \`look\` URL that publish or preview returned.`); }
  if (!/^https?:$/.test(u.protocol)) throw new Error(`Only http and https URLs can be looked at, not ${u.protocol}`);
  const deckLink = /^\/(x|d)\/[^/]+\/?$/.test(u.pathname);
  if (deckLink) {
    u.searchParams.delete('still');
    u.searchParams.set('contact', '1');
    // Numbered pins for the open comments — a preview link draws them; a share link does not.
    if (comments) u.searchParams.set('comments', '1');
    else u.searchParams.delete('comments');
    u.hash = '';
  }
  return { url: u.toString(), deckLink, stage: /^\/p\//.test(u.pathname) };
}

/**
 * Builds asked for as "slide.step" — "2.1" is slide 2 after its first click — mapped
 * slide → step. Strings, so "2.10" is not read as 2.1.
 */
function parseBuilds(v) {
  const parts = v === undefined || v === null || v === '' ? [] : Array.isArray(v) ? v : String(v).split(',');
  const out = new Map();
  for (const part of parts) {
    const m = /^\s*(\d+)\.(\d+)\s*$/.exec(String(part));
    if (!m) continue;
    const [n, step] = [Number(m[1]), Number(m[2])];
    if (out.has(n) && out.get(n) !== step) throw new Error(`Slide ${n} twice, at builds ${out.get(n)} and ${step} — one build of a slide per look.`);
    out.set(n, step);
  }
  return out;
}

/** 1-based slide numbers from an array, a number, or "3,7" / "2-4" — and "2.1" for a build. */
function parseSlides(v) {
  if (v === undefined || v === null || v === '') return [];
  const parts = Array.isArray(v) ? v : String(v).split(',');
  const out = [];
  for (const part of parts) {
    const m = /^\s*(\d+)(?:\.\d+)?\s*(?:-\s*(\d+))?\s*$/.exec(String(part));
    if (!m) throw new Error(`"${part}" is not a slide number. Use numbers from 1, e.g. [3, 7], or "2.1" for slide 2 after its first click.`);
    const a = Number(m[1]);
    const b = m[2] ? Number(m[2]) : a;
    for (let n = Math.min(a, b); n <= Math.max(a, b); n++) out.push(n);
  }
  return [...new Set(out)];
}

/**
 * How many tiles across and down one overview picture holds, for this deck's shape. The
 * sheet's width is fixed at EDGE, so the columns decide the tile size: four across puts a
 * 16:9 slide at ~375px, where a headline reads and body copy does not — which is what the
 * full-size look is for.
 */
function sheetGrid(frame) {
  const portrait = frame.w < frame.h;
  return { cols: portrait ? 6 : 4, rows: portrait ? 2 : 3 };
}

/**
 * The arguments, checked before any browser starts: a mistyped URL or a request for twenty
 * slides is an answer in milliseconds, not after Chrome has spent two seconds launching.
 */
function plan({ url, slides, comments } = {}) {
  const target = sheetUrl(url, comments === true || comments === 'true');
  const asked = parseSlides(slides);
  const builds = parseBuilds(slides);
  if (builds.size && target.deckLink) {
    const u = new URL(target.url);
    u.searchParams.set('build', [...builds].map(([n, step]) => `${n}.${step}`).join(','));
    target.url = u.toString();
  }
  if (asked.length > MAX_SLIDES) {
    throw new Error(`Up to ${MAX_SLIDES} slides at full size per look — you asked for ${asked.length}. Look at the overview first and pick the ones that need it.`);
  }
  return { target, asked, builds };
}

async function lookAt(chrome, { target, asked, builds = new Map() }) {
  const tab = await openTab(chrome);
  try {
    await tab.viewport(SHEET_VIEWPORT, 1000);
    await tab.navigate(target.url);

    /* The sheet announces itself once it has hydrated. Anything that never does is not a
       Podium deck — a site somebody pointed at as a reference — and is screenshotted as a
       page instead of failing. */
    const isDeck = await tab.until('Boolean(window.podium && window.podium.report && document.querySelector(".tiles figure.cell"))', target.deckLink ? 20_000 : 4_000);
    if (!isDeck) {
      if (target.stage) {
        throw new Error(
          'That is the stage (/p/…), which needs your login, so a fresh browser sees the sign-in ' +
          'page. Pass the `look` URL that publish or preview returned (/x/…), or a share link (/d/…).'
        );
      }
      return await lookAtPage(tab, target.url);
    }

    await tab.evaluate(`document.head.insertAdjacentHTML('beforeend', '<style>${SHEET_CSS}</style>')`);

    const fontsSettled = await tab.until('document.documentElement.hasAttribute("data-podium-ready")', 60_000);
    const meta = await tab.evaluate(`(() => {
      const d = window.podium.deck();
      return {
        title: d.title,
        frame: d.frame || { w: 1920, h: 1080 },
        labels: [...document.querySelectorAll('.tiles > figure.cell figcaption span')].map((s) => s.textContent.trim())
      };
    })()`);
    const report = await tab.evaluate('window.podium.report()');
    const total = meta.labels.length;

    const outOfRange = asked.filter((n) => n < 1 || n > total);
    if (outOfRange.length) {
      throw new Error(`This deck has ${total} slide${total === 1 ? '' : 's'}; there is no slide ${outOfRange.join(', ')}.`);
    }

    const pictures = asked.length
      ? await fullSize(tab, meta.frame, asked, builds)
      : await overview(tab, meta.frame, total);

    return {
      text: summary({ ...meta, total, report, problems: tab.problems, fontsSettled, asked, pictures }),
      pictures
    };
  } finally {
    await tab.close();
  }
}

/**
 * Overview pictures: the sheet re-tiled so each picture holds `cols × rows` slides at the
 * long-edge budget, numbered by the sheet's own captions.
 */
async function overview(tab, frame, total) {
  const { cols, rows } = sheetGrid(frame);
  await tab.evaluate(`(() => {
    const tiles = document.querySelector('.tiles');
    tiles.style.setProperty('--cols', '${cols}');
    for (const c of tiles.querySelectorAll(':scope > figure.cell')) c.style.display = '';
  })()`);
  await tab.settle();
  await tab.images();
  const rects = await cellRects(tab);

  const per = cols * rows;
  const groups = [];
  for (let i = 0; i < total; i += per) groups.push(rects.slice(i, i + per).filter(Boolean));

  const tallest = Math.max(...groups.map((g) => span(g.map((r) => r.cell))[3]));
  await tab.viewport(SHEET_VIEWPORT, tallest + 80);
  await tab.settle();

  const pictures = [];
  for (let g = 0; g < groups.length; g++) {
    // Re-measured per group: resizing the viewport can move the page by a pixel or two.
    const fresh = (await cellRects(tab)).slice(g * per, g * per + per).filter(Boolean);
    const box = span(fresh.map((r) => r.cell));
    const first = g * per + 1;
    const last = Math.min(total, first + per - 1);
    pictures.push({ ...(await tab.capture(pad(box, MARGIN))), label: first === last ? `slide ${first}` : `slides ${first}–${last}`, kind: 'sheet' });
  }
  return pictures;
}

/** Full-size pictures: one slide per picture, the sheet re-tiled to a single column. */
async function fullSize(tab, frame, asked, builds = new Map()) {
  const tileW = frame.w >= frame.h ? EDGE : Math.round(EDGE * (frame.w / frame.h));
  const tileH = Math.round(tileW * (frame.h / frame.w));
  const keep = JSON.stringify(asked.map((n) => n - 1));
  await tab.viewport(tileW + 2 * SHEET_PAD, tileH + 120);
  await tab.evaluate(`(() => {
    const keep = new Set(${keep});
    const tiles = document.querySelector('.tiles');
    tiles.style.setProperty('--cols', '1');
    [...tiles.querySelectorAll(':scope > figure.cell')].forEach((c, i) => { c.style.display = keep.has(i) ? '' : 'none'; });
  })()`);
  await tab.settle();
  await tab.images();

  const rects = await cellRects(tab);
  const pictures = [];
  for (const n of asked) {
    const r = rects[n - 1];
    if (!r) continue;
    pictures.push({ ...(await tab.capture(r.frame)), label: builds.has(n) ? `slide ${n} · build ${builds.get(n)}` : `slide ${n}`, kind: 'slide' });
  }
  return pictures;
}

/** Page-coordinate boxes for every tile (null where hidden): the whole cell, and the slide. */
const cellRects = (tab) => tab.evaluate(`[...document.querySelectorAll('.tiles > figure.cell')].map((c) => {
  if (c.style.display === 'none') return null;
  const box = (el) => { const r = el.getBoundingClientRect(); return [r.left + scrollX, r.top + scrollY, r.width, r.height]; };
  return { cell: box(c), frame: box(c.querySelector('.frame')) };
})`);

const span = (boxes) => {
  const x0 = Math.min(...boxes.map((b) => b[0]));
  const y0 = Math.min(...boxes.map((b) => b[1]));
  const x1 = Math.max(...boxes.map((b) => b[0] + b[2]));
  const y1 = Math.max(...boxes.map((b) => b[1] + b[3]));
  return [x0, y0, x1 - x0, y1 - y0];
};
const pad = ([x, y, w, h], p) => [Math.max(0, x - p), Math.max(0, y - p), w + 2 * p, h + 2 * p];

/** A page that is not a deck: its top, at a desktop width, as a reference picture. */
async function lookAtPage(tab, url) {
  const width = 1440;
  const screen = 900;
  await tab.viewport(width, screen);
  await tab.settle();
  await tab.images(8_000);
  const height = await tab.evaluate('document.documentElement.scrollHeight');
  const pictures = [{ ...(await tab.capture([0, 0, width, Math.min(height, screen)])), label: 'page, top' }];

  /* A results page — a search on a reference site — keeps most of what is worth seeing
     below the fold, and loads its pictures only as they scroll in. So a second screen,
     scrolled to first, when there is one worth the name. */
  if (height > screen + 200) {
    await tab.evaluate(`window.scrollTo(0, ${screen})`);
    await tab.settle();
    await tab.images(6_000);
    pictures.push({ ...(await tab.capture([0, screen, width, Math.min(height - screen, screen)])), label: 'page, next screen' });
  }

  const text = [
    `${url} is not a Podium deck, so ${pictures.length === 1 ? 'this is a picture of the page' : 'these are its top two screens'}, ` +
    `at ${width}px wide — for reading a reference, not for checking a deck.`,
    tab.problems.length ? `\nWhile loading:\n${[...new Set(tab.problems)].slice(0, 12).map((p) => `  ${p}`).join('\n')}` : ''
  ].join('');
  return { text, pictures };
}

/** What the pictures cannot say, in the order worth reading it. */
function summary({ title, frame, total, labels, report, problems, fontsSettled, asked, pictures }) {
  const lines = [];
  lines.push(`"${title}" — ${total} slide${total === 1 ? '' : 's'} on a ${frame.w}×${frame.h} plane.`);
  lines.push(asked.length
    ? `Full size: ${pictures.map((p) => p.label).join(', ')}.`
    : `Overview: ${pictures.length} picture${pictures.length === 1 ? '' : 's'} — ${pictures.map((p, i) => `${i + 1}) ${p.label}`).join(', ')}. Each tile is captioned with its number.`);

  if (!fontsSettled) lines.push('\n!! The fonts never settled within 60s — the pictures may show fallback faces.');

  const fonts = report?.fonts ?? [];
  /* `used === false` is a slot nothing on any slide is set in: not loading it is correct.
     (Older servers do not send `used`; treat that as used, as before.) */
  const missing = fonts.filter((f) => f.family && !f.loaded && !f.generic && f.used !== false);
  if (fonts.length) {
    lines.push(`\nFaces: ${fonts.map((f) => `${f.slot} ${f.family || '—'}${f.generic ? '' : f.loaded ? ' ✓' : f.used === false ? ' (unused)' : ' ✗'}`).join(' · ')}`);
    if (missing.length) lines.push(`!! Never loaded: ${missing.map((f) => `${f.slot} "${f.family}"`).join(', ')} — everything set in them is a fallback face. Check fonts.google names them, spelled exactly.`);
  }

  const smallest = report?.smallest ?? [];
  if (smallest.length) lines.push(`\nSmallest type, measured (px on the ${frame.w}-wide plane): ${smallest.map((v, i) => `${i + 1}·${v || '—'}`).join('  ')}`);

  const findings = report?.findings ?? [];
  if (findings.length) {
    lines.push(`\nFindings (${findings.length}), measured in the browser:`);
    for (const f of findings.slice(0, 40)) {
      lines.push(`  ${f.slide ? `slide ${f.slide}` : 'deck'} — ${f.what}: ${f.detail}`);
    }
    if (findings.length > 40) lines.push(`  … and ${findings.length - 40} more`);
  } else {
    lines.push('\nNothing measurable is wrong. What is left is a judgement about how it looks.');
  }

  const seen = [...new Set(problems)];
  if (seen.length) {
    lines.push('\nWhile loading (a 404 on /m/… is a picture that will not show):');
    for (const p of seen.slice(0, 12)) lines.push(`  ${p}`);
  }

  if (!asked.length) {
    const flagged = [...new Set(findings.map((f) => f.slide).filter(Boolean))].slice(0, MAX_SLIDES);
    lines.push(flagged.length
      ? `\nNext: look again with slides: [${flagged.join(', ')}] to see the flagged slides full size, then fix the program and publish.`
      : `\nNext: look again with slides: [n, …] (up to ${MAX_SLIDES}) for any slide whose type, alignment or detail you need to check at full size.`);
  }
  if (labels?.length && !asked.length && total <= 60) {
    lines.push(`\nSlides: ${labels.map((l, i) => `${i + 1} ${l}`).join(' · ')}`);
  }
  return lines.join('\n');
}

/* ─────────────────────────────  the server  ──────────────────────── */

const TOOL = {
  name: 'look',
  title: 'Look at a Podium deck',
  description:
    'SEE THE DECK YOU PUBLISHED. Pass the `look` URL that publish or preview returned (a /x/… ' +
    'link), or a share link (/d/…). Without `slides` you get overview pictures — twelve slides ' +
    'to a picture, each captioned with its number — and the findings measured in a real ' +
    'browser: faces that never loaded, text that overflows its box, blocks sitting on top of ' +
    'each other, headlines that wrapped, pictures that 404. With `slides: [n, …]` (up to six) ' +
    'you get those slides full size, to check type, alignment and detail. Look after EVERY ' +
    'publish: read the findings, look at the pictures, change the program, publish again. A ' +
    'deck that saves clean is not a deck that renders right. Any other URL comes back as a ' +
    'picture of the page, for reading a reference someone pointed you at.',
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'The `look` URL from publish or preview, or a share link.' },
      slides: {
        type: 'array',
        items: { type: ['integer', 'string'] },
        maxItems: MAX_SLIDES,
        description: `1-based slide numbers to see full size (up to ${MAX_SLIDES}); "2.1" is slide 2 after its first click, for a build before the last. Omit for the overview.`
      },
      comments: {
        type: 'boolean',
        description: 'Draw the open comments as numbered pins, numbered as decks({ id }) numbers them — so "pin 3" is thread n: 3. Preview links only.'
      }
    },
    required: ['url']
  },
  annotations: { readOnlyHint: true, openWorldHint: true }
};

const INSTRUCTIONS =
  'Eyes for Podium decks. After every `publish`, call `look` with the `look` URL it returned: ' +
  'read the measured findings first, then look at the pictures, then change the build ' +
  'program and publish again. Ask for full-size slides only where the overview shows ' +
  'something worth checking. Nothing here changes a deck; it only looks.';

const PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

let chrome = null;
let idle = null;
/* A browser is a few hundred MB; one that has not been asked for anything in ten minutes
   is closed, and the next look starts another. */
const IDLE_MS = 10 * 60_000;

async function browser() {
  clearTimeout(idle);
  if (!chrome || chrome.dead) chrome = await Chrome.launch();
  return chrome;
}
function releaseLater() {
  clearTimeout(idle);
  idle = setTimeout(() => { chrome?.close(); chrome = null; }, IDLE_MS);
  idle.unref?.();
}

async function callLook(args) {
  const checked = plan(args ?? {});
  const c = await browser();
  try {
    return await withTimeout(lookAt(c, checked), CALL_TIMEOUT, 'looking took too long');
  } finally {
    releaseLater();
  }
}

function serve() {
  const write = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
  const ok = (id, result) => write({ jsonrpc: '2.0', id, result });
  const bad = (id, code, message) => write({ jsonrpc: '2.0', id, error: { code, message } });

  /* One look at a time: they share a browser, and a second tab resizing the viewport
     under the first would move what it is capturing. Everything else answers at once. */
  let queue = Promise.resolve();

  const handle = (msg) => {
    const { id, method, params } = msg;
    const isRequest = id !== undefined && id !== null;
    switch (method) {
      case 'initialize': {
        const asked = params?.protocolVersion;
        return ok(id, {
          protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'podium-eyes', title: 'Podium eyes', version: VERSION },
          instructions: INSTRUCTIONS
        });
      }
      case 'ping':
        return ok(id, {});
      case 'tools/list':
        return ok(id, { tools: [TOOL] });
      case 'tools/call': {
        if (params?.name !== TOOL.name) return bad(id, -32602, `unknown tool: ${params?.name}`);
        queue = queue.then(async () => {
          try {
            const { text, pictures } = await callLook(params.arguments);
            ok(id, {
              content: [
                { type: 'text', text },
                ...pictures.map((p) => ({ type: 'image', data: p.data, mimeType: p.mimeType }))
              ],
              isError: false
            });
          } catch (e) {
            ok(id, { content: [{ type: 'text', text: `Could not look: ${e?.message ?? e}` }], isError: true });
          }
        });
        return;
      }
      default:
        if (isRequest) bad(id, -32601, `method not found: ${method}`);
    }
  };

  createInterface({ input: process.stdin, crlfDelay: Infinity })
    .on('line', (line) => {
      if (!line.trim()) return;
      let msg;
      try { msg = JSON.parse(line); } catch { return bad(null, -32700, 'parse error'); }
      for (const m of Array.isArray(msg) ? msg : [msg]) handle(m);
    })
    .on('close', () => queue.finally(shutdown));
}

let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  await chrome?.close();
  process.exit(0);
}

/* ─────────────────────────────  the command  ──────────────────────── */

async function cli(argv) {
  const url = argv[0];
  const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const outdir = flag('--out') ?? 'shots';
  const slides = flag('--slides');
  const comments = argv.includes('--comments');
  mkdirSync(outdir, { recursive: true });

  const checked = plan({ url, slides, comments });
  const c = await Chrome.launch();
  try {
    const { text, pictures } = await withTimeout(lookAt(c, checked), CALL_TIMEOUT, 'looking took too long');
    pictures.forEach((p, i) => {
      const ext = p.mimeType === 'image/jpeg' ? 'jpg' : 'png';
      /* By kind, not label: the last overview sheet can hold one slide and be labelled like one. */
      const m = p.kind === 'slide' ? /^slide (\d+)(?: · build (\d+))?$/.exec(p.label) : null;
      const name = m ? `slide-${m[1].padStart(2, '0')}${m[2] !== undefined ? `-build${m[2]}` : ''}.${ext}` : `${p.label.startsWith('page') ? 'page' : 'sheet'}-${i + 1}.${ext}`;
      writeFileSync(join(outdir, name), Buffer.from(p.data, 'base64'));
    });
    console.log(text);
    console.error(`\nwrote ${pictures.length} picture${pictures.length === 1 ? '' : 's'} to ${outdir}/ — now look at them`);
  } finally {
    await c.close();
  }
}

/* No arguments: speak MCP on stdio. A URL: look once and write the pictures. Imported —
   by Podium's rendering service, which looks for clients with no machine of their own —
   nothing runs, and the service drives the same functions. */
const invoked = (() => {
  try { return import.meta.url === pathToFileURL(realpathSync(process.argv[1] ?? '')).href; } catch { return false; }
})();
if (invoked) {
  const args = process.argv.slice(2);
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  if (args[0] === '--help' || args[0] === '-h') {
    console.log('usage: node lib/eyes.mjs                         (an MCP server on stdio)\n' +
      '       node lib/eyes.mjs "<look-url>" [--slides 3,7] [--comments] [--out shots]');
  } else if (args.length) {
    cli(args).catch((e) => { console.error(`eyes: ${e?.message ?? e}`); process.exit(1); });
  } else {
    serve();
  }
}

/* What Podium's rendering service drives. Everything else in this file stays private. */
export { Chrome, plan, lookAt, withTimeout, CALL_TIMEOUT, MAX_SLIDES };
