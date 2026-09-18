#!/usr/bin/env node
/**
 * pipeline-state.js — SAVE CRYSTAL do pipeline (P0.2).
 *
 * State de retomada em output/.pipeline-state.json. Cada imagem/clipe gerado
 * grava job_id + path. Credito NAO volta: perder um job_id custa dinheiro.
 * Se a cena ja tem job_id+path no state, NAO regera (idempotencia).
 *
 * CANONICO — unica copia ativa. As skills gera-imagem e gera-video
 * referenciam este arquivo via ``node scripts/pipeline-state.cjs ...``.
 *
 * Subcomandos:
 *   get    --root <repo> --cena <n> [--tipo imagem|video]
 *          -> { existe, registro } da cena (pra decidir regerar ou pular)
 *   set    --root <repo> --cena <n> --tipo imagem|video --job-id <id>
 *          --path <p> [--media-ids a,b,c] [--prompt-tag <tag>]
 *          -> grava/atualiza o registro da cena
 *   media  --root <repo> --key <chave-estavel-da-ref> --media-id <id>
 *          -> registra um media_id de referencia ja confirmado (reuso no run)
 *   media-get --root <repo> --key <chave-estavel-da-ref>
 *          -> { media_id } se ja confirmado nesse run
 *   dump   --root <repo>           -> imprime o state inteiro
 *
 * exit 0 sempre; resultado em JSON no stdout.
 */

const fs = require('fs');
const path = require('path');
const parseArgs = require('./lib/parse-args.cjs');
const generationPaths = require('./lib/generation-paths.cjs');

const LEGACY_STATE_REL = path.join('output', '.pipeline-state.json');

function normalizeRel(rootAbs, targetAbs) {
  return path.relative(rootAbs, targetAbs).replace(/\\/g, '/');
}

function resolveStateContext(root, opts) {
  const rootAbs = path.resolve(root || '.');
  const generationId = opts && opts.generation ? String(opts.generation) : null;
  if (!generationId) {
    return {
      mode: 'legacy',
      rootAbs,
      stateFile: path.resolve(rootAbs, LEGACY_STATE_REL),
    };
  }

  const projectRoot = opts.project
    ? generationPaths.resolveProjectRoot(rootAbs, String(opts.project))
    : rootAbs;
  const generationRoot = generationPaths.resolveGenerationRoot(projectRoot, generationId);
  return {
    mode: 'generation',
    rootAbs,
    projectRoot,
    generationRoot,
    stateFile: path.join(generationRoot, '.pipeline-state.json'),
    projectId: opts.project ? String(opts.project) : path.basename(projectRoot),
    generationId,
    generationRootRel: normalizeRel(rootAbs, generationRoot),
  };
}

function statePath(root, opts) {
  return resolveStateContext(root, opts).stateFile;
}

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}

function pathDentroDoProjeto(root, value, opts) {
  if (!value || typeof value !== 'string') return false;
  if (path.isAbsolute(value)) return false;
  if (value.split(/[\\/]+/).includes('..')) return false;
  const ctx = resolveStateContext(root, opts);
  const targetAbs = path.resolve(ctx.rootAbs, value);
  if (!isInside(ctx.rootAbs, targetAbs)) return false;
  if (ctx.mode === 'generation') {
    return isInside(ctx.generationRoot, targetAbs);
  }
  const outputAbs = path.resolve(ctx.rootAbs, 'output');
  return isInside(outputAbs, targetAbs);
}

function emptyState(ctx) {
  const state = {
    versao: 1,
    _v: 1, // lock otimista: incrementado a cada save; set/append comparam
    criado_em: new Date().toISOString(),
    atualizado_em: new Date().toISOString(),
    cenas: {}, // { "<n>": { imagem: {...}, video: {...} } }
    refs_media: {}, // { "<ref-key>": "<media_id>" } — media_ids de referencia reusaveis no run
  };
  if (ctx && ctx.mode === 'generation') {
    state.project_id = ctx.projectId;
    state.generation_id = ctx.generationId;
    state.generation_root = ctx.generationRootRel;
    state.stage = 'created';
    state.invalidated_after = null;
    state.history = [];
  }
  return state;
}

// Tenta extrair registros individuais de cenas de um state JSON corrompido.
// Cada bloco "cena N": { imagem: { job_id, path }, video: { job_id, path } }
// e recuperado via regex linha a linha — nao depende de parse completo.
function rescueCenas(raw) {
  if (typeof raw !== 'string') return null;
  const cenas = {};
  // procura blocos de cena dentro de "cenas": { ... }
  const cenaRe = /"(\d+)"\s*:\s*\{/g;
  let m;
  while ((m = cenaRe.exec(raw)) !== null) {
    const num = m[1];
    const start = m.index;
    // encontra o fechamento balanceado de chaves a partir da posicao
    let depth = 0;
    let end = start;
    let inString = false;
    let esc = false;
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    if (end <= start) continue;
    const block = raw.slice(start, end);
    // extrai job_id e path de cada sub-registro (imagem/video) do bloco
    const registro = {};
    for (const tipo of ['imagem', 'video']) {
      const sub = extractSubRecord(block, tipo);
      if (sub) registro[tipo] = sub;
    }
    if (Object.keys(registro).length > 0) cenas[num] = registro;
  }
  return Object.keys(cenas).length > 0 ? cenas : null;
}

function extractSubRecord(block, tipo) {
  // localiza o trecho "imagem": { ... } ou "video": { ... }
  const subRe = new RegExp('"' + tipo + '"\\s*:\\s*\\{');
  const m = subRe.exec(block);
  if (!m) return null;
  const start = m.index;
  let depth = 0;
  let end = start;
  let inString = false;
  let esc = false;
  for (let i = start; i < block.length; i++) {
    const ch = block[i];
    if (esc) { esc = false; continue; }
    if (ch === '\\') { esc = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end <= start) return null;
  const sub = block.slice(start, end);
  const jobId = extractString(sub, 'job_id');
  const pathVal = extractString(sub, 'path');
  if (!jobId && !pathVal) return null;
  return { job_id: jobId || null, path: pathVal || null };
}

function extractString(text, key) {
  const re = new RegExp('"' + key + '"\\s*:\\s*"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"');
  const m = re.exec(text);
  return m ? m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\') : null;
}

function hydrateGenerationMetadata(state, ctx) {
  if (!ctx || ctx.mode !== 'generation') return state;
  state.project_id = state.project_id || ctx.projectId;
  state.generation_id = state.generation_id || ctx.generationId;
  state.generation_root = state.generation_root || ctx.generationRootRel;
  state.stage = state.stage || 'created';
  if (!Object.prototype.hasOwnProperty.call(state, 'invalidated_after')) state.invalidated_after = null;
  if (!Array.isArray(state.history)) state.history = [];
  return state;
}

function load(root, opts) {
  const ctx = resolveStateContext(root, opts);
  const p = ctx.stateFile;
  if (!fs.existsSync(p)) return emptyState(ctx);
  let raw;
  try {
    raw = fs.readFileSync(p, 'utf8');
    const obj = JSON.parse(raw);
    if (!obj.cenas) obj.cenas = {};
    if (!obj.refs_media) obj.refs_media = {};
    return hydrateGenerationMetadata(obj, ctx);
  } catch (e) {
    // state corrompido: tenta salvar registros individuais de cenas antes de zerar.
    // Job_ids sao caros — perder um force regeracao com credito extra.
    if (!raw) {
      try { fs.copyFileSync(p, p + '.corrupt-' + Date.now()); } catch (_) { /* ignore */ }
      process.stderr.write(`[pipeline-state] state ilegivel em ${p}: nao foi possivel ler o arquivo.\n`);
      return emptyState(ctx);
    }
    const rescued = rescueCenas(raw);
    const recovered = rescued
      ? Object.keys(rescued).length
      : 0;
    try {
      fs.copyFileSync(p, p + '.corrupt-' + Date.now());
    } catch (_) {
      /* ignore */
    }
    if (recovered > 0) {
      const st = emptyState(ctx);
      st.cenas = rescued;
      const recoveryPath = p + '.recovered-' + Date.now();
      try {
        fs.writeFileSync(recoveryPath, JSON.stringify(st, null, 2) + '\n', 'utf8');
      } catch (_) {
        /* ignore */
      }
      process.stderr.write(
        `[pipeline-state] state corrompido em ${p}: ` +
        `${recovered} cena(s) recuperadas (salvas em ${recoveryPath}). ` +
        `Backup do original em ${p}.corrupt-*. Verifique antes de retomar.\n`
      );
      return emptyState(ctx);
    }
    process.stderr.write(
      `[pipeline-state] state corrompido em ${p}: ` +
      `nao foi possivel recuperar nenhuma cena. Backup em ${p}.corrupt-*.\n`
    );
    return emptyState(ctx);
  }
}

function save(root, state, opts) {
  const ctx = resolveStateContext(root, opts);
  const p = ctx.stateFile;
  const lockFile = p + '.lock';
  const maxRetries = (opts && opts.maxRetries) || 5;
  const retryMs = (opts && opts.retryMs) || 50;

  fs.mkdirSync(path.dirname(p), { recursive: true });
  state.atualizado_em = new Date().toISOString();
  if (typeof state._v !== 'number') state._v = 0;
  state._v += 1;

  // lock file com retry exponencial — evita corrupcao em concorrencia rara
  // (duas sessoes do Claude Code no mesmo projeto).
  let lockFd;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      lockFd = fs.openSync(lockFile, 'wx');
      break;
    } catch (e) {
      if (e.code === 'EEXIST' || e.code === 'EPERM') {
        if (attempt < maxRetries - 1) {
          const wait = retryMs * Math.pow(2, attempt);
          const waited = require('child_process').spawnSync
            ? (function spin(ms) { const t = Date.now(); while (Date.now() - t < ms) { /* spin */ } })(wait)
            : (function() { const t = Date.now(); while (Date.now() - t < wait) { /* spin */ } })();
        }
        continue;
      }
      throw e;
    }
  }
  if (!lockFd) {
    throw new Error(`nao foi possivel adquirir lock em ${lockFile} apos ${maxRetries} tentativas`);
  }

  try {
    // escrita atomica: tmp + rename (evita state truncado se cair no meio)
    const tmp = p + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(hydrateGenerationMetadata(state, ctx), null, 2) + '\n', 'utf8');
    try {
      fs.renameSync(tmp, p);
    } catch (e) {
      if (e.code === 'EXDEV') {
        fs.copyFileSync(tmp, p);
        fs.unlinkSync(tmp);
        process.stderr.write('[pipeline-state] EXDEV: fallback copy+unlink para ' + p + '\n');
      } else {
        throw e;
      }
    }
  } finally {
    try { fs.closeSync(lockFd); } catch (_) { /* ignore */ }
    try { fs.unlinkSync(lockFile); } catch (_) { /* ignore */ }
  }
}

function cmdGet(root, cena, tipo, args) {
  const state = load(root, args);
  const reg = state.cenas[String(cena)] || {};
  if (tipo) {
    const sub = reg[tipo] || null;
    return { cena: Number(cena), tipo, existe: !!(sub && sub.job_id && sub.path), registro: sub };
  }
  return { cena: Number(cena), existe: Object.keys(reg).length > 0, registro: reg };
}

function cmdSet(root, args) {
  const state = load(root, args);
  const key = String(args.cena);
  const tipo = args.tipo;
  const cenaNum = Number(args.cena);
  if (!Number.isInteger(cenaNum) || cenaNum < 1) {
    return { erro: 'cena deve ser um inteiro positivo' };
  }
  if (!tipo || (tipo !== 'imagem' && tipo !== 'video')) {
    return { erro: 'tipo deve ser "imagem" ou "video"' };
  }
  if (!args['job-id']) {
    return { erro: 'job-id obrigatorio para gravar state' };
  }
  if (!args.path) {
    return { erro: 'path obrigatorio para gravar state' };
  }
  if (!pathDentroDoProjeto(root, args.path, args)) {
    return { erro: args.generation ? 'path deve ser relativo e ficar dentro da generation' : 'path deve ser relativo e ficar dentro de output/ do projeto' };
  }
  if (!state.cenas[key]) state.cenas[key] = {};
  const registro = {
    job_id: args['job-id'] || null,
    path: args.path || null,
    media_ids: args['media-ids'] ? String(args['media-ids']).split(',').filter(Boolean) : [],
    prompt_tag: args['prompt-tag'] || null,
    gravado_em: new Date().toISOString(),
  };
  state.cenas[key][tipo] = registro;
  if (args.generation && Array.isArray(state.history)) {
    state.history.push({
      event: 'artifact_set',
      cena: cenaNum,
      tipo,
      at: registro.gravado_em,
    });
  }
  save(root, state, args);
  return { ok: true, cena: cenaNum, tipo, registro };
}

function cmdMedia(root, hashKey, mediaId, args) {
  if (!hashKey) {
    return { erro: 'key obrigatoria para registrar media_id' };
  }
  if (!mediaId) {
    return { erro: 'media-id obrigatorio para registrar referencia' };
  }
  const state = load(root, args);
  state.refs_media[hashKey] = mediaId;
  save(root, state, args);
  return { ok: true, key: hashKey, media_id: mediaId };
}

function cmdMediaGet(root, hashKey, args) {
  const state = load(root, args);
  const id = state.refs_media[hashKey] || null;
  return { key: hashKey, media_id: id, existe: !!id };
}

function cmdDump(root, args) {
  return load(root, args);
}

if (require.main === module) {
  const sub = process.argv[2];
  const args = parseArgs(process.argv, 3);
  const root = args.root || '.';
  let result;
  switch (sub) {
    case 'get':
      result = cmdGet(root, args.cena, args.tipo, args);
      break;
    case 'set':
      result = cmdSet(root, args);
      break;
    case 'media':
      result = cmdMedia(root, args.key, args['media-id'], args);
      break;
    case 'media-get':
      result = cmdMediaGet(root, args.key, args);
      break;
    case 'dump':
      result = cmdDump(root, args);
      break;
    default:
      result = {
        erro: 'subcomando desconhecido',
        uso: 'get|set|media|media-get|dump',
      };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result && result.erro ? 1 : 0);
}

module.exports = {
  load,
  save,
  cmdGet,
  cmdSet,
  cmdMedia,
  cmdMediaGet,
  cmdDump,
  statePath,
  pathDentroDoProjeto,
  resolveStateContext,
};
