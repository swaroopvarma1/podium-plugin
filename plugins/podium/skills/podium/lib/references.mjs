#!/usr/bin/env node
/**
 * Where to look for design references, for a person who has none to hand.
 *
 *   node lib/references.mjs "annual report editorial layout" "sumi ink poster"
 *   node lib/references.mjs --json "swiss grid presentation"
 *   node lib/references.mjs --ask "board report editorial"     → links to paste into the question
 *
 * Prints search links for each query, in two groups:
 *
 *   - sites you, the agent, can look at: hand the link to eyes
 *     (`node lib/eyes.mjs "<url>"`) and read the pictures;
 *   - sites the PERSON opens: they block automated browsers, or put everything behind a
 *     sign-in, so the person opens the link, picks two they like, and brings back a
 *     screenshot or the image's own link. Pinterest is the one people know.
 *
 * Which site is in which group was checked by pointing eyes at each on 2026-09-30, and
 * can change. When a site in the first group comes back as a wall — a sign-in, "verify
 * you are human", an error — move it to the second rather than trying to get past it.
 *
 * A reference sets the DIRECTION. Nothing found through these links goes into a deck: it
 * is somebody else's work. Pictures in a deck are the person's own, licensed (Unsplash's
 * licence allows it; say where each came from), or generated.
 */

import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const enc = (q) => encodeURIComponent(q.trim().replace(/\s+/g, ' '));
const hyphen = (q) => encodeURIComponent(q.trim().toLowerCase().replace(/\s+/g, '-'));
const plus = (q) => encodeURIComponent(q.trim()).replace(/%20/g, '+');

/** Every source, in the order worth trying. `who` is who can open it. */
export const SOURCES = [
  {
    source: 'Cosmos', who: 'agent', url: (q) => `https://www.cosmos.so/search/elements/${enc(q)}`,
    goodFor: 'curated editorial and graphic design; the closest thing to a designer\'s own moodboard'
  },
  {
    source: 'Are.na', who: 'agent', url: (q) => `https://www.are.na/search/${enc(q)}`,
    goodFor: 'collections kept by designers — typographic, editorial, odd; shows channels, open one for its pictures'
  },
  {
    source: 'Dribbble', who: 'agent', url: (q) => `https://dribbble.com/search/${enc(q)}`,
    goodFor: 'slide and interface shots; polished and on-trend, so read it for layout, not for taste'
  },
  {
    source: 'Fonts In Use', who: 'agent', url: (q) => `https://fontsinuse.com/search?terms=${plus(q)}`,
    goodFor: 'type in real use — which faces carry which kind of document'
  },
  {
    source: 'Pinterest', who: 'person', url: (q) => `https://www.pinterest.com/search/pins/?q=${enc(q)}`,
    goodFor: 'the widest net: slides, posters, moodboards. Behind a sign-in for a browser like yours'
  },
  {
    source: 'Behance', who: 'person', url: (q) => `https://www.behance.net/search/projects/${enc(q)}`,
    goodFor: 'whole case studies, so a deck\'s complete system rather than one slide'
  },
  {
    source: 'Savee', who: 'person', url: (q) => `https://savee.com/search/?q=${enc(q)}`,
    goodFor: 'curated visual inspiration; needs a free account'
  },
  {
    source: 'Unsplash', who: 'person', url: (q) => `https://unsplash.com/s/photos/${hyphen(q)}`,
    goodFor: 'photographs you may actually put in the deck, under the Unsplash licence'
  }
];

/** The three the person is given in the first question, before they say they have nothing. */
export const ASK = [
  { source: 'Pinterest', icon: '📌' },
  { source: 'Behance', icon: '🎨' },
  { source: 'Dribbble', icon: '🏀' }
];

/** The links for one query. */
export function referenceLinks(query) {
  const q = String(query ?? '').trim();
  if (!q) throw new Error('a query is a few words: the medium, the register and the subject');
  return SOURCES.map(({ source, who, url, goodFor }) => ({ source, who, url: url(q), goodFor }));
}

/**
 * The first question's links, one line per site and query, each ending in "click here": in
 * a terminal that draws a link as plain text, the words still say it is one, and the person
 * never reads an encoded URL.
 */
export function askLinks(queries) {
  return queries.flatMap((q) => {
    const links = referenceLinks(q);
    const label = q.trim().replace(/\s+/g, ' ');
    return ASK.map(({ source, icon }) => `${icon} ${source} — ${label}: [click here](${links.find((l) => l.source === source).url})`);
  }).join('\n');
}

function print(queries) {
  const out = [];
  for (const q of queries) {
    const links = referenceLinks(q);
    const width = Math.max(...links.map((l) => l.source.length));
    const row = (l) => `    ${l.source.padEnd(width)}  ${l.url}\n    ${' '.repeat(width)}  ${l.goodFor}`;
    out.push(`For "${q}":`);
    out.push('  Look at these yourself — node lib/eyes.mjs "<url>":');
    out.push(...links.filter((l) => l.who === 'agent').map(row));
    out.push('  Give these to the person to open. Ask for two they like, as a screenshot or the image\'s link:');
    out.push(...links.filter((l) => l.who === 'person').map(row));
    out.push('');
  }
  out.push('References set the direction. Nothing found here goes into the deck itself.');
  console.log(out.join('\n'));
}

/* Run as a command, as opposed to imported: compared as real paths, because the skill is
   often reached through a symlink (~/.claude/skills/podium) and Node resolves the module's
   own URL through it. */
const isMain = (() => {
  try { return realpathSync(process.argv[1] ?? '') === realpathSync(fileURLToPath(import.meta.url)); }
  catch { return false; }
})();
if (isMain) {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const ask = args.includes('--ask');
  const queries = args.filter((a) => a !== '--json' && a !== '--ask');
  if (!queries.length || args.includes('--help') || args.includes('-h')) {
    console.error('usage: node lib/references.mjs [--json | --ask] "<query>" ["<query>" …]\n\n' +
      'A query is the medium, the register and the subject, from the brief: "annual report\n' +
      'editorial layout", "sumi ink poster", "swiss grid presentation" — not "clean modern deck".');
    process.exit(queries.length ? 0 : 1);
  }
  if (ask) console.log(askLinks(queries));
  else if (json) console.log(JSON.stringify(queries.map((q) => ({ query: q, links: referenceLinks(q) })), null, 2));
  else print(queries);
}
