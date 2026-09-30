#!/usr/bin/env node
/**
 * A person's own deck skill — a plain Claude Code skill folder — made and kept by their
 * agent, so the way they build decks is not re-explained every time. See
 * references/personal-skills.md.
 *
 *   node lib/personal-skill.mjs list
 *   node lib/personal-skill.mjs new <name> [--from <project>/<deck>] [--who "<person or team>"]
 *                                          [--for "<when it applies>"] [--team <repo>]
 *   node lib/personal-skill.mjs add <name> --always "<rule>" | --never "<rule>" [--team <repo>]
 *
 * `new` writes ~/.claude/skills/<name>/ — or <repo>/.claude/skills/<name>/ with --team, which
 * everyone working in that repo gets: SKILL.md (frontmatter, and sections filled from the
 * deck's recorded brief), theme.json from the deck's theme, and an empty assets/. It never
 * overwrites an existing SKILL.md. `--from` reads the deck through Podium with PODIUM_URL /
 * PODIUM_TOKEN, as publishing does. Node only — no `cp`, nothing for a person to approve.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const NAME = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** Where a deck skill lives: the person's own skills, or a repo's (shared with its team). */
export const skillDir = (name, team) =>
  team ? join(resolve(team), '.claude', 'skills', name) : join(homedir(), '.claude', 'skills', name);

/** Whether a SKILL.md is a deck skill: its description says to use it with the podium skill. */
export function isDeckSkill(md) {
  const head = /^---\n([\s\S]*?)\n---/.exec(String(md))?.[1] ?? '';
  return /description:.*podium skill/i.test(head);
}

const list = (xs) => (Array.isArray(xs) ? xs : xs ? [xs] : []).map((x) => String(x).trim()).filter(Boolean);

/**
 * The SKILL.md for a new deck skill. Only what a brief genuinely knows is filled in — the
 * must-nots and hates are "never" rules, the house style and direction are the look; the
 * "always" list starts empty on purpose, because the person says what they do every time.
 */
export function skillMarkdown({ name, who = 'this person', when = '', brief = null, theme = false }) {
  const a = brief?.answers ?? {};
  const never = [...list(a.mustNot), ...list(a.hate).map((h) => `${h} (they dislike it)`)];
  const sentence = (t) => `${String(t).trim().replace(/[.\s]+$/, '')}.`;
  const look = [
    a.houseStyle ? `House style: ${sentence(a.houseStyle)}` : '',
    brief?.direction ? `The direction they picked: ${sentence(brief.direction)}` : '',
    theme ? 'Keep `theme.json` — it is the design language to reuse, not to reinvent.' : ''
  ].filter(Boolean);
  const refs = (brief?.references ?? []).map((r) => `${r.from ?? 'a reference'} — took ${r.took ?? '?'}${r.left ? `; not ${r.left}` : ''}`);
  const section = (title, items, empty) => `## ${title}\n${items.length ? items.map((i) => `- ${i}`).join('\n') : empty}\n`;
  return [
    '---',
    `name: ${name}`,
    `description: How ${who} builds decks — rules, look and assets. Use together with the podium skill whenever making a deck, pitch or presentation${when ? ` ${when}` : ''}.`,
    '---',
    '',
    `# ${name}`,
    '',
    `The standing way ${who} wants decks made. Load it with the podium skill; its rules win over`,
    'podium\'s defaults, and the craft floor still holds unless a rule here says otherwise.',
    '',
    section('Always', [], '- (what they want on every deck — add with `node lib/personal-skill.mjs add ' + name + ' --always "…"`)'),
    section('Never', never, '- (add with `--never "…"`)'),
    section('The look', look, '- Invent one per deck, unless a rule above says otherwise.'),
    section('Numbers', list(a.numbers), '- (how figures are written, and where they may appear)'),
    section('Pictures', list(a.pictures), '- (generated, their own, or none)'),
    section('References', refs, '- (decks or images to start from — put them in assets/)'),
    '## Assets',
    '- `assets/` — their logo, screenshots, reference slides. Name each by what it is.',
    ''
  ].join('\n');
}

/** Adds one rule under ## Always or ## Never, replacing the placeholder if it is still there. */
export function addRule(md, kind, rule) {
  const title = kind === 'never' ? 'Never' : 'Always';
  const lines = String(md).split('\n');
  const at = lines.findIndex((l) => l.trim() === `## ${title}`);
  if (at < 0) return `${String(md).trimEnd()}\n\n## ${title}\n- ${rule}\n`;
  let end = at + 1;
  while (end < lines.length && !lines[end].startsWith('## ')) end++;
  const body = lines.slice(at + 1, end).filter((l) => l.trim() && !/^- \(/.test(l.trim()));
  const next = [...body, `- ${rule}`, ''];
  return [...lines.slice(0, at + 1), ...next, ...lines.slice(end)].join('\n');
}

/* ── the command line ───────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flag = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };

async function main() {
  const [cmd, name] = argv;
  if (cmd === 'list') {
    const roots = [join(homedir(), '.claude', 'skills'), join(process.cwd(), '.claude', 'skills')];
    const found = roots.flatMap((root) => (existsSync(root) ? readdirSync(root) : [])
      .map((n) => ({ n, path: join(root, n, 'SKILL.md') }))
      .filter((s) => existsSync(s.path) && isDeckSkill(readFileSync(s.path, 'utf8'))));
    if (!found.length) console.log('No deck skills yet. `new <name> --from <project>/<deck>` starts one.');
    for (const s of found) {
      const desc = /description:\s*(.*)/.exec(readFileSync(s.path, 'utf8'))?.[1] ?? '';
      console.log(`${s.n}\n  ${s.path}\n  ${desc}`);
    }
    return;
  }
  if (!name || !NAME.test(name)) throw new Error('a skill name is 2–41 characters of a-z, 0-9 and -, e.g. "juspay-decks"');
  const dir = skillDir(name, flag('team'));

  if (cmd === 'new') {
    if (existsSync(join(dir, 'SKILL.md'))) throw new Error(`${join(dir, 'SKILL.md')} already exists — edit it, or use \`add\``);
    let brief = null, theme = null;
    const from = flag('from');
    if (from) {
      const [project, id] = from.includes('/') ? from.split('/') : [undefined, from];
      const { call } = await import('./podium.mjs');
      const deck = await call('decks', { id, ...(project ? { project } : {}) });
      brief = deck.brief ?? null;
      theme = deck.theme ?? null;
    }
    mkdirSync(join(dir, 'assets'), { recursive: true });
    writeFileSync(join(dir, 'SKILL.md'), skillMarkdown({ name, who: flag('who'), when: flag('for'), brief, theme: Boolean(theme) }));
    if (theme) writeFileSync(join(dir, 'theme.json'), JSON.stringify(theme, null, 2) + '\n');
    console.log(`wrote ${join(dir, 'SKILL.md')}${theme ? ' and theme.json' : ''} — show it to them, fill in what they always do, then put their logo in assets/`);
    return;
  }
  if (cmd === 'add') {
    const kind = flag('never') !== undefined ? 'never' : 'always';
    const rule = flag(kind);
    if (!rule) throw new Error('add needs --always "<rule>" or --never "<rule>"');
    const path = join(dir, 'SKILL.md');
    if (!existsSync(path)) throw new Error(`${path} does not exist — \`new ${name}\` first`);
    writeFileSync(path, addRule(readFileSync(path, 'utf8'), kind, rule));
    console.log(`added to ${kind}: ${rule}`);
    return;
  }
  throw new Error('usage: list | new <name> [--from <project>/<deck>] [--who …] [--for …] [--team <repo>] | add <name> --always|--never "…"');
}

/* Run as a command, not when imported. By REAL path: the installed skill is a symlink
   (~/.claude/skills/podium → a checkout), so comparing the paths as written said "imported"
   and every command silently did nothing. */
const invoked = (() => {
  try { return realpathSync(process.argv[1] ?? '') === realpathSync(fileURLToPath(import.meta.url)); }
  catch { return false; }
})();
if (invoked) main().catch((e) => { console.error(e.message); process.exit(1); });
