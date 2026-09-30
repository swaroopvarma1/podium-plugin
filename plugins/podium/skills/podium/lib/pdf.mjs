#!/usr/bin/env node
/**
 * The deck as a PDF, one slide per page.
 *
 *   node lib/pdf.mjs "<share-or-stage-url>" deck.pdf
 *
 * Almost every deck gets emailed eventually, so this is not a nicety. Two things about it
 * are easy to get wrong and silent when you do:
 *
 *   `preferCSSPageSize: true` is load-bearing. The stylesheet declares
 *   `@page { size: 1920px 1080px }`; pass an explicit width/height instead and Chrome
 *   overrides the page box, every slide lands on one sheet, and you get a ONE-PAGE PDF
 *   with the other thirty slides clipped off the bottom. It looks like a failed render
 *   rather than a wrong flag, which is why it wastes an afternoon.
 *
 *   `?still=1` freezes every reveal. Without it the capture lands mid-transition and
 *   half the blocks print at whatever opacity they had reached.
 *
 * Use a SHARE url (/d/<id>) unless the browser is signed in — the stage at /p/… is behind
 * the account, and an unauthenticated capture of it produces a login page with no slides
 * in the DOM at all.
 */
import { chromium } from 'playwright';

const [url, out = 'deck.pdf'] = process.argv.slice(2);
if (!url) {
  console.error('usage: node lib/pdf.mjs "<share-url>" [out.pdf]');
  process.exit(1);
}

const still = url.includes('?') ? `${url}&still=1` : `${url}?still=1`;

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const missing = [];
page.on('requestfailed', (r) => missing.push(r.url().slice(0, 90)));

await page.goto(still, { waitUntil: 'networkidle', timeout: 90_000 });
await page
  .waitForFunction(() => document.documentElement.hasAttribute('data-podium-ready'), null, { timeout: 60_000 })
  .catch(() => console.error('!! fonts never settled — the PDF may be set in a fallback face'));

const slides = await page.evaluate(() => document.querySelectorAll('.slide').length);
if (!slides) {
  console.error(
    'no slides in the page. If this is a /p/ stage URL, the browser is not signed in — ' +
    'publish with a visibility and use the /d/ share link instead.'
  );
  await browser.close();
  process.exit(1);
}

await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();

if (missing.length) console.error(`!! ${missing.length} assets failed to load:\n  ${[...new Set(missing)].slice(0, 5).join('\n  ')}`);
console.error(`${out} — ${slides} pages`);
console.error('If it is large, the images are the reason: compress the plates before upload_media.');
