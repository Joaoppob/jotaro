#!/usr/bin/env node
'use strict';

/**
 * preflight-gate.cjs — runner unico dos gates pre-credito + "arma" o token de geracao.
 *
 * PROBLEMA QUE RESOLVE: ate aqui os 12 gates de qualidade viviam como INSTRUCAO no
 * CLAUDE.md — o Jotaro so os rodava se escolhesse. A skill `gera-imagem` (que gasta
 * credito) nao rodava critique nenhum. Logo "se gate_aprovado:false, nao gaste" era
 * honra, nao trava. Foi o modo de falha de um run de producao real.
 *
 * COMO RESOLVE: este runner roda TODOS os gates de texto pre-credito contra o
 * prompt-forge do projeto (o PROMPT UNICO do 0.7). So se TODOS passam, ele grava
 * um TOKEN assinado com o sha256 do prompt-forge em `.claude/state/.gate-pass.json`.
 * O hook PreToolUse `higgsfield-gate.cjs` recusa qualquer geracao (via MCP
 * `generate_*` ou CLI `higgsfield generate create`) sem token fresco cujo hash
 * bata no prompt-forge atual. Editou o prompt-forge depois de armar? o hash
 * diverge e o hook bloqueia de novo. Esse e o interlock mecanico.
 *
 * Uso:
 *   node scripts/preflight-gate.cjs --root projects/<nome>
 *   # le projects/<nome>/output/prompt-forge.json, roda os gates,
 *   # arma o token e sai 0 se tudo passa; imprime as falhas e sai 1 se nao.
 *   node scripts/preflight-gate.cjs --root projects/<nome> --shotlist <outro.json>
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const TOKEN_REL = path.join('.claude', 'state', '.gate-pass.json');
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6h: cobre um run de reel inteiro sem rearmar.

// Os gates de texto pre-credito. Cada um tem o argv exato do seu CLI. critique nao
// sai com exit!=0 (so imprime gate_aprovado), entao tem leitura especial de stdout.
const GATES = [
  { name: 'identity-quality', args: ['scripts/lib/identity-quality.cjs', 'shotlist'] },
  { name: 'dp-quality', args: ['scripts/lib/dp-quality.cjs', 'shotlist'] },
  { name: 'prompt-structure', args: ['scripts/lib/prompt-structure.cjs'] },
  { name: 'narrative-quality', args: ['scripts/lib/narrative-quality.cjs'] },
  { name: 'angle-variety', args: ['scripts/lib/angle-variety.cjs'] },
  { name: 'persona-carry', args: ['scripts/lib/persona-carry.cjs'] },
  { name: 'negative-prompt-discipline', args: ['scripts/lib/negative-prompt-discipline.cjs'] },
  { name: 'locucao-idioma', args: ['scripts/lib/locucao-idioma.cjs'] },
  { name: 'product-closeup', args: ['scripts/lib/product-closeup.cjs'] },
  { name: 'expressao-facial', args: ['scripts/lib/expressao-facial.cjs'] },
  { name: 'critique', args: ['scripts/lib/critique.cjs'], stdoutGate: true },
];

// Gate de alma (Portao 0) — SEPARADO do array GATES. Roda contra o brief de
// alma (schemas/alma.schema.json), nao contra o prompt-forge. So entra em runGates
// quando um almaPath e fornecido; as chamadas prompt-forge-only NAO o disparam.
const SOUL_GATE = { name: 'soul-quality', args: ['scripts/lib/soul-quality.cjs'] };

// Gate de edicao (ritmo de corte) — SEPARADO do array GATES. Roda contra o
// artefato de edicao (schemas/edicao.schema.json), nao contra o prompt-forge. So
// entra em runGates quando um edicaoPath e fornecido E o arquivo existe; ausencia
// num preflight de imagem NAO falha (nao e applicable).
const EDITING_GATE = { name: 'editing-quality', args: ['scripts/lib/editing-quality.cjs'] };

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function runGate(gate, shotlistPath, repoRoot) {
  const argv = gate.args.concat([shotlistPath]);
  try {
    const out = execFileSync('node', argv, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    if (gate.stdoutGate) {
      // critique: exit 0 sempre; o veredito esta em gate_aprovado no stdout.
      let parsed = null;
      try { parsed = JSON.parse(out); } catch (_) { parsed = null; }
      const ok = !!(parsed && parsed.gate_aprovado === true);
      return { name: gate.name, ok, detail: ok ? 'gate_aprovado' : (parsed && parsed.parecer) || 'gate_aprovado:false' };
    }
    return { name: gate.name, ok: true, detail: 'ok' };
  } catch (e) {
    // exit!=0 => gate reprovou (ou erro de execucao). Captura o motivo do stdout.
    let detail = (e && e.stdout) ? String(e.stdout).trim().split('\n').slice(-3).join(' ') : (e && e.message) || 'falha';
    if (gate.stdoutGate) {
      // critique nao deveria cair aqui; se cair, trata como reprovado.
      return { name: gate.name, ok: false, detail: detail || 'critique falhou' };
    }
    return { name: gate.name, ok: false, detail };
  }
}

// runGates roda os gates de texto pre-credito contra o prompt-forge. Os parametros
// `almaPath` e `edicaoPath` sao OPCIONAIS: cada gate so roda quando o seu caminho
// e fornecido. As chamadas prompt-forge-only (sem alma/edicao) mantem EXATAMENTE a
// contagem de gates do array GATES — Portao 0 (alma) e o gate de edicao sao
// aditivos e nunca alteram o numero de gates de prompt-forge.
function runGates(shotlistPath, repoRoot, almaPath, edicaoPath) {
  const abs = path.isAbsolute(shotlistPath) ? shotlistPath : path.join(repoRoot, shotlistPath);
  if (!fs.existsSync(abs)) {
    return { ok: false, gates: [], shotlist_sha256: null, error: `prompt-forge ausente: ${shotlistPath}` };
  }
  const gates = GATES.map((g) => runGate(g, shotlistPath, repoRoot));

  // Portao 0 (alma): so roda quando almaPath e fornecido. Fica em campo proprio
  // (soul_gate), fora do array `gates`, para nao mudar a contagem prompt-forge-only.
  let soul_gate = null;
  if (almaPath) {
    soul_gate = runGate(SOUL_GATE, almaPath, repoRoot);
  }

  // Gate de edicao (ritmo de corte): so roda quando edicaoPath e fornecido E o
  // arquivo existe. Ausencia num preflight de imagem NAO falha — nao e applicable.
  let editing_gate = null;
  if (edicaoPath) {
    const edicaoAbs = path.isAbsolute(edicaoPath) ? edicaoPath : path.join(repoRoot, edicaoPath);
    if (fs.existsSync(edicaoAbs)) {
      editing_gate = runGate(EDITING_GATE, edicaoPath, repoRoot);
    }
  }

  const ok = gates.every((g) => g.ok)
    && (soul_gate ? soul_gate.ok : true)
    && (editing_gate ? editing_gate.ok : true);
  const result = { ok, gates, shotlist_sha256: sha256File(abs) };
  if (soul_gate) result.soul_gate = soul_gate;
  if (editing_gate) result.editing_gate = editing_gate;
  return result;
}

function tokenPath(repoRoot) {
  return path.join(repoRoot, TOKEN_REL);
}

// `extra` e opcional (usado pelo runner 0.8, scripts/preflight-gate-0.8.cjs) para
// carregar generation_id/project_id/prompt_hash/gates_snapshot_hash/mode no MESMO
// arquivo de token que este modulo ja escreve — o hook (higgsfield-gate.cjs) le
// esses campos de `tokenValid().token` para a camada de aprovacao humana (0.8).
// Chamadas 0.7 existentes (sem `extra`) continuam gravando exatamente o mesmo
// formato de sempre.
function armToken(repoRoot, project, shotlistRel, sha, gateNames, nowIso, extra) {
  const token = {
    ok: true,
    project,
    shotlist: shotlistRel,
    shotlist_sha256: sha,
    armed_at: nowIso || new Date().toISOString(),
    gates: gateNames,
    ...(extra && typeof extra === 'object' ? extra : {}),
  };
  const tp = tokenPath(repoRoot);
  fs.mkdirSync(path.dirname(tp), { recursive: true });
  fs.writeFileSync(tp, JSON.stringify(token, null, 2) + '\n');
  return tp;
}

function clearToken(repoRoot) {
  const tp = tokenPath(repoRoot);
  try { if (fs.existsSync(tp)) fs.unlinkSync(tp); } catch (_) { /* noop */ }
}

function readToken(repoRoot) {
  try {
    return JSON.parse(fs.readFileSync(tokenPath(repoRoot), 'utf8'));
  } catch (_) {
    return null;
  }
}

// O hook usa isto: o token so vale se existe, esta ok, fresco e o hash da shotlist
// referenciada ainda bate (ninguem editou a shotlist depois de armar).
function tokenValid(repoRoot, nowMs) {
  const token = readToken(repoRoot);
  if (!token || token.ok !== true) return { valid: false, reason: 'gate de qualidade nao armado' };
  const armed = Date.parse(token.armed_at);
  const now = typeof nowMs === 'number' ? nowMs : Date.now();
  if (!Number.isFinite(armed) || now - armed > MAX_AGE_MS) {
    return { valid: false, reason: 'token de gate expirado — rearme com preflight-gate' };
  }
  const abs = path.isAbsolute(token.shotlist) ? token.shotlist : path.join(repoRoot, token.shotlist);
  let sha;
  try { sha = sha256File(abs); } catch (_) {
    return { valid: false, reason: 'shotlist do token nao encontrada' };
  }
  if (sha !== token.shotlist_sha256) {
    return { valid: false, reason: 'shotlist mudou apos o gate — rearme com preflight-gate' };
  }
  return { valid: true, reason: 'ok', token };
}

module.exports = {
  GATES, SOUL_GATE, EDITING_GATE, MAX_AGE_MS, TOKEN_REL,
  sha256File, runGates, armToken, clearToken, readToken, tokenValid, tokenPath,
};

if (require.main === module) {
  const argv = process.argv.slice(2);
  let root = null;
  let shotlistOverride = null;
  let almaOverride = null;
  let edicaoOverride = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') root = argv[++i];
    else if (argv[i] === '--shotlist') shotlistOverride = argv[++i];
    else if (argv[i] === '--alma') almaOverride = argv[++i];
    else if (argv[i] === '--edicao') edicaoOverride = argv[++i];
  }
  if (!root) {
    console.error('Uso: node scripts/preflight-gate.cjs --root projects/<nome> [--shotlist <arquivo.json>] [--alma <arquivo.json>] [--edicao <arquivo.json>]');
    process.exit(2);
  }
  const repoRoot = process.cwd();
  // O artefato hasheado do 0.7 e o PROMPT UNICO (prompt-forge.json). O flag
  // --shotlist ainda serve de override de arquivo (nome legado, mesmo canal).
  const shotlistRel = shotlistOverride || path.join(root, 'output', 'prompt-forge.json');

  // Portao 0 (alma): o brief de alma e OBRIGATORIO no preflight de geracao. Resolve
  // <root>/output/alma-brief.json e EXIGE que exista — a alma vem antes da shotlist.
  const almaRel = almaOverride || path.join(root, 'output', 'alma-brief.json');
  const almaAbs = path.isAbsolute(almaRel) ? almaRel : path.join(repoRoot, almaRel);
  if (!fs.existsSync(almaAbs)) {
    console.error('[preflight-gate] brief de alma ausente — rode o soul-strategist e aprove a alma (Portao 0) antes de gerar');
    clearToken(repoRoot);
    process.exit(1);
  }

  // Edicao (ritmo de corte): opcional. So roda se --edicao for passado e o arquivo existir.
  const edicaoRel = edicaoOverride || null;

  const result = runGates(shotlistRel, repoRoot, almaRel, edicaoRel);

  if (result.error) {
    console.error(`[preflight-gate] ${result.error}`);
    clearToken(repoRoot);
    process.exit(1);
  }

  if (result.soul_gate) {
    const g = result.soul_gate;
    console.log(`${g.ok ? 'PASS' : 'FAIL'} ${g.name}${g.ok ? '' : ` :: ${g.detail}`}`);
  }
  for (const g of result.gates) {
    console.log(`${g.ok ? 'PASS' : 'FAIL'} ${g.name}${g.ok ? '' : ` :: ${g.detail}`}`);
  }
  if (result.editing_gate) {
    const g = result.editing_gate;
    console.log(`${g.ok ? 'PASS' : 'FAIL'} ${g.name}${g.ok ? '' : ` :: ${g.detail}`}`);
  }

  if (!result.ok) {
    clearToken(repoRoot);
    console.error('\nGate de qualidade REPROVOU. Nao gere: volte ao prompt-smith/storyboard-director, conserte os criterios acima e rode de novo.');
    process.exit(1);
  }

  const armedNames = result.gates.map((g) => g.name);
  if (result.soul_gate) armedNames.unshift(result.soul_gate.name);
  if (result.editing_gate) armedNames.push(result.editing_gate.name);
  const tp = armToken(repoRoot, root, shotlistRel, result.shotlist_sha256, armedNames);
  console.log(`\nGate ARMADO: ${armedNames.length} gates verdes (alma + prompt-forge${result.editing_gate ? ' + edicao' : ''}). Token em ${path.relative(repoRoot, tp)}. Geracao liberada para este prompt-forge.`);
  process.exit(0);
}
