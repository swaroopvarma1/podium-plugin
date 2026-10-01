#!/usr/bin/env node
/**
 * Publish a page — one HTML document — to Podium, and print where to look at it.
 *
 *   node lib/page.mjs page.html --id closing-note --project fasttrack [--title "…"]
 *                     [--subtitle "…"] [--visibility unlisted]
 *
 * The title defaults to the document's own <title>. Pictures in it are /m/… paths from
 * add_pictures or generate_image. Then look: `node lib/eyes.mjs "<look>"` shows the page at
 * a desktop and a phone width, top to bottom, with the measurements. See
 * references/pages.md.
 */
import { readFileSync } from 'node:fs';
import { call } from './podium.mjs';

const [file, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : undefined; };

if (!file || file.startsWith('--')) {
  console.error('usage: node lib/page.mjs page.html --id <id> --project <project> [--title "…"] [--subtitle "…"] [--visibility unlisted]');
  process.exit(1);
}

const html = readFileSync(file, 'utf8');
const id = flag('--id');
const title = flag('--title') ?? /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim();
if (!id) { console.error('page.mjs: --id is required (the page\'s slug, kept across publishes)'); process.exit(1); }
if (!title) { console.error('page.mjs: give the page a <title>, or pass --title'); process.exit(1); }

const result = await call('publish', {
  kind: 'page', id, title, html,
  project: flag('--project'),
  subtitle: flag('--subtitle'),
  visibility: flag('--visibility')
});

console.error(`published page ${result.published} v${result.version} — ${(Buffer.byteLength(html) / 1024).toFixed(0)}KB`);
for (const w of result.warnings ?? []) console.error(`  ${w.level.padEnd(5)} ${w.at} — ${w.says}${w.fix ? `\n        fix: ${w.fix}` : ''}`);
if (!result.warnings?.length) console.error('  no warnings');
console.error(`\n  look   ${result.look}\n  stage  ${result.stage}\n  share  ${result.share}\n`);
console.log(result.look);
