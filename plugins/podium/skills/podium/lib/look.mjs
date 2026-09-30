#!/usr/bin/env node
/**
 * Look at the deck.
 *
 *   node lib/look.mjs "<preview-url>" shots/
 *
 * Opens the contact sheet in the Chrome already installed on this machine, waits for the
 * fonts to settle, prints `window.podium.report()` as JSON, and writes one PNG per slide
 * plus the whole sheet.
 *
 * It borrows the system Chrome rather than a bundled build on purpose: the bundled
 * revision drifts every playwright release and then nothing renders at all, which is the
 * one failure that stops you looking — and not looking is how every layout bug in this
 * project's history got shipped.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const [url, outdir = 'shots'] = process.argv.slice(2);
if (!url) {
  console.error('usage: node lib/look.mjs "<preview-url>" [outdir]');
  process.exit(1);
}
mkdirSync(outdir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });

const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', (e) => errs.push(String(e)));
page.on('requestfailed', (r) => errs.push(`${r.failure()?.errorText} ${r.url().slice(0, 90)}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });

/* Point this at anything, not just a preview link. A reference somebody sent you is a
   URL, and fetching a URL strips exactly the thing you wanted to see — so screenshot it
   instead. A page that is not a Podium deck has no readiness flag and no report, and
   waiting sixty seconds to discover that is the reason nobody would use this twice. */
const isDeck = await page.evaluate(() => Boolean(window.podium?.report));
if (isDeck) {
  await page
    .waitForFunction(() => document.documentElement.hasAttribute('data-podium-ready'), null, { timeout: 60_000 })
    .catch(() => console.error('!! data-podium-ready never set — the fonts never settled'));
  console.log(JSON.stringify(await page.evaluate(() => window.podium.report()), null, 1));
} else {
  await page.waitForLoadState('load').catch(() => {});
  console.error(`not a Podium deck — screenshotting ${new URL(url).host} as a reference`);
}

/* A 404 on /m/… is the failure this script exists to surface: the picture is missing and
   the report, which measures type, has nothing to say about it. */
if (errs.length) console.log('\nCONSOLE / NETWORK:\n' + [...new Set(errs)].slice(0, 20).join('\n'));

const cells = await page.$$('figure.cell');
let i = 0;
for (const cell of cells) {
  i++;
  await cell.screenshot({ path: `${outdir}/s${String(i).padStart(2, '0')}.png` }).catch(() => {});
}
await page.screenshot({ path: `${outdir}/_sheet.png`, fullPage: true });
await browser.close();
console.error(`\nwrote ${i} slides + _sheet.png to ${outdir}/ — now look at them`);
