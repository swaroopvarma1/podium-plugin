#!/usr/bin/env tsx
/**
 * generate-image — make slide art that already belongs to the deck's design language.
 *
 *   npx tsx ${CLAUDE_SKILL_DIR}/scripts/generate-image.ts --name last-mile \
 *     --palette "#F4F4F4,#0B0B0B,#B0B7B0" --register "calm corporate" \
 *     --prompt "a handoff of control between two parties"
 *
 * Writes a PNG and prints its path on stdout. Hand that path to the `upload_media` MCP
 * tool, which returns the `/m/<id>` to put in a slide's `image` field.
 *
 * The palette is the style anchor and comes from the deck's own theme — normally
 * `--ground`, `--ink`, `--accent`. Art generated per-slide from a free-text prompt
 * drifts; art generated against one anchor reads as a set. Lettering is banned outright.
 *
 * Credentials: ~/.claude/.deck-secrets.env, or the environment. Any OpenAI-compatible
 * images endpoint works — Azure OpenAI, OpenAI itself, or a gateway in front of either:
 *
 *   IMAGE_ENDPOINT + IMAGE_API_KEY           anything that speaks the images API
 *   AZURE_IMAGE_ENDPOINT + AZURE_IMAGE_KEY   an Azure deployment (model is in the path)
 *   OPENAI_API_KEY [+ --model]               OpenAI directly
 *
 * With none of those, it uses your Podium's own image model: PODIUM_TOKEN (and PODIUM_URL
 * for a Podium other than podium.breezelabs.app), if the admin has turned image generation
 * on for your account. The picture is then already in Podium — the `/m/<id>` it prints goes
 * straight on a slide, no upload. `--via podium` picks this route even with a key of your
 * own; `--project <slug>` says which project files it.
 *
 * Without any of them the script stops with a named error and the deck is unaffected —
 * pictures are optional, and which design language you pick should account for that.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { homedir } from 'node:os';
import { imagePrompt, ANCHOR_KINDS, HEX } from '../lib/image-anchors.mjs';
import { call } from '../lib/podium.mjs';

/* Output lands beside whoever ran it, not beside the script — this ships inside the skill
   and is run from wherever the deck is being built. */
const ROOT = process.cwd();
const SECRETS = join(homedir(), '.claude', '.deck-secrets.env');

const argv = process.argv.slice(2);
const arg = (k: string, d?: string): string | undefined => {
  const i = argv.indexOf(`--${k}`);
  return i === -1 ? d : argv[i + 1];
};

const name = arg('name');
const subject = arg('prompt');
const palette = arg('palette');
const register = arg('register', '')!;
const size = arg('size', '1536x1024')!;
const quality = arg('quality', 'high')!;
const outDir = arg('out', join(ROOT, '.media', 'generated'))!;

/**
 * `--transparent` asks for a cut-out: the subject alone with an alpha channel, so it sits
 * on a gradient or a glow instead of in a box. Our deployment returns real alpha since
 * 2026-09-30 (it refused it before); a model that still refuses says so in its error.
 */
const transparent = argv.includes('--transparent');
const apiVersion = arg('api-version');
const viaPodium = arg('via') === 'podium';
const project = arg('project');

if (!name || !subject || !palette) {
  console.error(
    'usage: --name <file> --prompt "<subject>" --palette "#RRGGBB,#RRGGBB,#RRGGBB"\n' +
    '       [--anchor art|render|photo|logo] [--register "night launch"] [--size WxH] [--out <dir>]\n' +
    '       [--quality high|xhigh|medium|low]\n' +
    '       [--model <id>] [--transparent] [--api-version 2025-04-01-preview]\n' +
    '       [--via podium] [--project <slug>]\n\n' +
    'Take the palette from the deck theme: --ground, --ink, --accent.'
  );
  process.exit(1);
}

const colours = palette.split(',').map((c) => c.trim()).filter(Boolean);
if (!colours.every((c) => HEX.test(c))) {
  console.error(`--palette must be comma-separated hex colours, got: ${palette}`);
  process.exit(1);
}

/**
 * Whatever image model this machine has, if it has one.
 *
 * Deliberately not Azure-only. The wire format every serious image endpoint now speaks is
 * the same — POST `{prompt, n, size, quality}`, read `data[0].b64_json` back — so the only
 * things that actually vary are the header the key goes in and whether the model is named
 * in the URL (Azure puts it in the deployment path) or in the body (everyone else). Both
 * are detected rather than configured, because a second config knob is a second thing to
 * get wrong.
 *
 * Precedence: explicit generic names, then Azure's, then a bare OpenAI key. Environment
 * beats the secrets file so a one-off run can point somewhere else without editing it.
 *
 * AN ENDPOINT AND ITS KEY ARE A PAIR, and they are resolved as one. Resolving them one
 * variable at a time could send an `OPENAI_API_KEY` — exported in the shell for something
 * else entirely — to whatever host `IMAGE_ENDPOINT` named. A key only ever goes to the
 * endpoint it was issued with: the generic pair, the Azure pair, or OpenAI's own host.
 */
function credentials(): { endpoint: string; key: string; model?: string } | null {
  const fromFile = existsSync(SECRETS) ? readFileSync(SECRETS, 'utf8') : '';
  const grab = (n: string) =>
    process.env[n] || fromFile.match(new RegExp(`^${n}\\s*=\\s*"?([^"\\n]+)"?`, 'm'))?.[1]?.trim() || undefined;

  const model = arg('model') ?? grab('IMAGE_MODEL');
  const openai = grab('OPENAI_API_KEY');
  const pairs: Array<[endpoint: string | undefined, key: string | undefined, names: string]> = [
    [grab('IMAGE_ENDPOINT'), grab('IMAGE_API_KEY'), 'IMAGE_ENDPOINT + IMAGE_API_KEY'],
    [grab('AZURE_IMAGE_ENDPOINT'), grab('AZURE_IMAGE_KEY'), 'AZURE_IMAGE_ENDPOINT + AZURE_IMAGE_KEY'],
    /* A bare OpenAI key needs no endpoint — there is only one, and it is the only host
       that key is ever sent to. `sk-` because a key under that name that is not OpenAI's
       belongs to some proxy, and OpenAI is the one place it must not go. */
    [openai?.startsWith('sk-') ? 'https://api.openai.com/v1/images/generations' : undefined, openai, 'OPENAI_API_KEY']
  ];
  const found = pairs.find(([e, k]) => e && k);
  if (found) return { endpoint: found[0]!, key: found[1]!, model };
  if (process.env.PODIUM_TOKEN) return null;

  /* Half a pair is almost always a typo, so say which half is missing rather than
     "nothing configured", which sends people looking in the wrong file. */
  const half = [
    ...pairs.slice(0, 2).filter(([e, k]) => Boolean(e) !== Boolean(k))
      .map(([e, , n]) => `${n}: ${e ? 'the key' : 'the endpoint'} is missing, and a key is only sent to its own endpoint`),
    ...(openai && !openai.startsWith('sk-')
      ? ['OPENAI_API_KEY: not an OpenAI key (no `sk-`), so it is not sent to api.openai.com — set IMAGE_ENDPOINT + IMAGE_API_KEY for a gateway']
      : [])
  ];
  console.error(
    (half.length ? `half-configured:\n  ${half.join('\n  ')}\n\n` : '') +
    'no image model configured, so there is nothing to generate with.\n\n' +
    'Set ONE of these, in the environment or in ' + SECRETS + ' (chmod 600):\n' +
    '  IMAGE_ENDPOINT + IMAGE_API_KEY   any OpenAI-compatible images endpoint\n' +
    '  AZURE_IMAGE_ENDPOINT + AZURE_IMAGE_KEY   an Azure OpenAI image deployment\n' +
    '  OPENAI_API_KEY                   OpenAI directly; add --model to pick one\n' +
    'or PODIUM_TOKEN, to use your Podium\'s own model if the admin turned it on for you.\n\n' +
    'This is optional. A deck needs no pictures at all — but it changes which design\n' +
    'language to pick, so decide it before you choose one rather than after.'
  );
  process.exit(1);
}

// The anchor lives in lib/image-anchors.mjs, shared with Podium's own `generate_image`,
// so a picture made here and one made on the server belong to the same set.
const anchorName = arg('anchor', 'art')!;
if (!ANCHOR_KINDS.includes(anchorName)) {
  console.error(`--anchor must be one of: ${ANCHOR_KINDS.join(', ')}`);
  process.exit(1);
}

const creds = viaPodium ? null : credentials();
if (!creds) {
  await throughPodium();
  process.exit(0);
}

const { endpoint, key, model } = creds;
const url = apiVersion
  ? endpoint.replace(/([?&]api-version=)[^&]*/, `$1${apiVersion}`)
  : endpoint;

/* Azure names the model in the deployment path and takes the key in `api-key`; everyone
   else names it in the body and takes a bearer token. Detected from the URL, because the
   URL is the thing the user actually pasted. */
const azure = /\/openai\/deployments\//.test(url);
const deployed = /deployments\/([^/?]+)/.exec(url)?.[1];

const prompt = imagePrompt({ kind: anchorName, colours, register, subject, transparent });
const body: Record<string, unknown> = { prompt, n: 1, size, quality };
if (!azure) body.model = model ?? 'gpt-image-1';
if (transparent) {
  body.background = 'transparent';
  body.output_format = 'png';
}

console.error(`model    ${deployed ?? body.model ?? 'unknown'} @ ${new URL(url).host}` +
  ` · ${size} · ${quality}${transparent ? ' · transparent' : ''}`);
console.error(`palette  ${colours.join(' ')}`);
console.error(`subject  ${subject}`);

const res = await fetch(url, {
  method: 'POST',
  headers: azure
    ? { 'api-key': key, 'content-type': 'application/json' }
    : { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
  body: JSON.stringify(body)
}).catch((e: Error) => {
  // The endpoint is sometimes blackholed by a corporate/ISP boundary, and a bare
  // "fetch failed" sends you hunting for a bug in the request that is not there.
  const cause = (e as Error & { cause?: { code?: string } }).cause;
  console.error(
    `could not reach the image endpoint (${cause?.code ?? e.message}).\n` +
    `Check network egress to ${new URL(url).host} — the request itself is fine.`
  );
  process.exit(1);
});
if (!res.ok) {
  console.error(`image API returned ${res.status}: ${(await res.text()).slice(0, 400)}`);
  process.exit(1);
}

const payload = (await res.json()) as { error?: unknown; data?: Array<{ b64_json?: string }> };
if (payload.error) {
  console.error(`image API error: ${JSON.stringify(payload.error).slice(0, 400)}`);
  process.exit(1);
}
/* A content filter, or an endpoint that answers with a URL instead of bytes, returns 200
   with no image in it — which used to surface as a TypeError on `data[0]`. */
const b64 = payload.data?.[0]?.b64_json;
if (!b64) {
  console.error(`image API returned no image: ${JSON.stringify(payload).slice(0, 400)}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
/* `--name` names a file, not a path: `../x` lands in --out as `x.png`, never beside it. */
const file = join(outDir, `${basename(name)}.png`);
const bytes = Buffer.from(b64, 'base64');
writeFileSync(file, bytes);

console.error(`wrote ${file} (${Math.round(bytes.length / 1024)} KB)`);
console.error('next: upload_media with this path, then put the returned /m/<id> on a slide.');
console.log(file);

/**
 * The same picture, made by your Podium with its own model and filed in its media.
 *
 * Refusals come back in words a person can act on — "not enabled, ask <admin>", "you have
 * used your 50 for today" — and are printed as they are.
 */
async function throughPodium(): Promise<void> {
  const base = (process.env.PODIUM_URL ?? 'https://podium.breezelabs.app').replace(/\/$/, '');
  if (!process.env.PODIUM_TOKEN) {
    console.error('--via podium needs PODIUM_TOKEN (make one at <podium>/settings → API tokens)');
    process.exit(1);
  }
  for (const [flag, on] of [['--model', arg('model')], ['--api-version', apiVersion]] as const) {
    if (on) console.error(`note: ${flag} applies to a model of your own, and is ignored through Podium`);
  }
  const quality = arg('quality', 'high')!;
  console.error(`model    Podium's own @ ${new URL(base).host} · ${size} · ${quality}`);
  console.error(`palette  ${colours.join(' ')}`);
  console.error(`subject  ${subject}`);

  let made: { src: string; project: string; used: number; limit: number; remaining: number };
  try {
    made = await call('generate_image', {
      prompt: subject, palette: colours, anchor: anchorName, register, size, quality, project, transparent,
      alt: arg('alt')
    });
  } catch (e) {
    console.error(String((e as Error).message ?? e).replace(/^Error:\s*/, ''));
    process.exit(1);
  }

  /* Owner-only until a deck using it is published, so it is fetched as you. */
  const res = await fetch(`${base}${made.src}`, { headers: { authorization: `Bearer ${process.env.PODIUM_TOKEN}` } });
  if (!res.ok) {
    console.error(`made ${made.src}, but downloading it answered ${res.status} — it is in Podium; use ${made.src} on a slide`);
    console.log(made.src);
    return;
  }
  mkdirSync(outDir, { recursive: true });
  const file = join(outDir, `${basename(name!)}.png`);
  const bytes = Buffer.from(await res.arrayBuffer());
  writeFileSync(file, bytes);
  console.error(`wrote ${file} (${Math.round(bytes.length / 1024)} KB) — look at it`);
  console.error(`already in Podium as ${made.src} (project ${made.project}): put that in the image block's src, no upload needed.`);
  console.error(`${made.remaining} of ${made.limit} left in the last 24 hours.`);
  console.log(file);
}
