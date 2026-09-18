#!/usr/bin/env node
'use strict';

/**
 * hf-result.cjs — parser defensivo da saida JSON do Higgsfield CLI.
 *
 * O `higgsfield generate create/get/wait --json` imprime o objeto do job. O shape
 * exato pode variar entre releases do CLI, entao em vez de depender de um campo
 * fixo, este walker percorre a arvore inteira e acha:
 *   - job_id : primeiro valor de chave explicita de job; `id` generico so como fallback
 *   - status : primeiro valor de chave ~ /status|state/
 *   - url    : a URL do asset gerado (prefere extensao de midia; senao chave ~ url)
 *
 * Uso:
 *   higgsfield generate create nano_banana_2 ... --wait --json | node hf-result.cjs
 *   node hf-result.cjs < job.json
 *
 * Imprime JSON { job_id, status, url, all_urls } no stdout. exit 0 sempre que
 * conseguir parsear; exit 1 se a entrada nao for JSON valido.
 */

const MEDIA_EXT = /\.(png|jpe?g|webp|gif|mp4|mov|webm|m4v)(\?|#|$)/i;
const URL_KEY = /url|uri|link|raw|result|output|media|video|image|download|asset/i;
const JOB_ID_KEY = /^(job_?id|job_?set_?id|set_id)$/i;
const GENERIC_ID_KEY = /^id$/i;
const STATUS_KEY = /status|state/i;
const UUIDISH = /^[0-9a-f]{6,}(-[0-9a-f]+)*$/i;

function walk(node, visit, seen) {
  if (node === null || node === undefined) return;
  if (typeof node !== 'object') return;
  if (seen.has(node)) return;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const item of node) walk(item, visit, seen);
    return;
  }
  for (const [key, val] of Object.entries(node)) {
    if (typeof val === 'string') visit(key, val);
    else if (typeof val === 'object') walk(val, visit, seen);
  }
}

function extract(json) {
  const explicitJobIds = [];
  const genericIds = [];
  let status = null;
  const urls = [];
  walk(
    json,
    (key, val) => {
      if (JOB_ID_KEY.test(key) && UUIDISH.test(val) && val.length >= 8) explicitJobIds.push(val);
      else if (GENERIC_ID_KEY.test(key) && UUIDISH.test(val) && val.length >= 8) genericIds.push(val);
      if (!status && STATUS_KEY.test(key)) status = val;
      if (/^https?:\/\//i.test(val)) urls.push({ key, val });
    },
    new Set()
  );

  // melhor candidato de URL do asset:
  // 1) URLs com extensao de midia (a ultima costuma ser o resultado final, nao thumb)
  // 2) senao, URL cuja chave parece de asset
  // 3) senao, a primeira URL qualquer
  const assets = urls.filter((u) => MEDIA_EXT.test(u.val));
  let best = null;
  if (assets.length) best = assets[assets.length - 1].val;
  else {
    const byKey = urls.find((u) => URL_KEY.test(u.key));
    best = byKey ? byKey.val : urls.length ? urls[0].val : null;
  }

  return {
    job_id: explicitJobIds[0] || genericIds[0] || null,
    status,
    url: best,
    all_urls: urls.map((u) => u.val),
  };
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    if (process.stdin.isTTY) return resolve('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

if (require.main === module) {
  readStdin().then((raw) => {
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      process.stderr.write(`hf-result: entrada nao e JSON valido (${e.message})\n`);
      process.exit(1);
      return;
    }
    process.stdout.write(JSON.stringify(extract(json), null, 2) + '\n');
    process.exit(0);
  });
}

module.exports = { extract };
