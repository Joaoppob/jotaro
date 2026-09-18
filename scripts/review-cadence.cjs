#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const parseArgs = require('./lib/parse-args.cjs');
const config = require('./lib/config.cjs');

const STATE_REL = path.join('.claude', 'state', '.review-cadence.json');
// CONFIG editavel (lib/config.cjs), nao FATO ancorado: quem redistribui o
// produto pode mudar a cadencia sem quebrar nenhum check do verify.
const SUGGEST_AFTER = config.REVIEW_SUGGEST_AFTER;

function statePath(root) {
  return path.resolve(root || '.', STATE_REL);
}

function emptyState() {
  return {
    versao: 1,
    total_fluxos: 0,
    fluxos_desde_revisao: 0,
    revisao_obrigatoria_antes_do_proximo_fluxo: false,
    ultima_revisao_em: null,
    atualizado_em: new Date().toISOString(),
    historico: [],
  };
}

function load(root) {
  const p = statePath(root);
  if (!fs.existsSync(p)) return emptyState();
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Object.assign(emptyState(), obj, {
      historico: Array.isArray(obj.historico) ? obj.historico : [],
    });
  } catch (_) {
    try {
      fs.copyFileSync(p, p + '.corrupt-' + Date.now());
    } catch (_) {
      // ignore
    }
    return emptyState();
  }
}

function save(root, state) {
  const p = statePath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  state.atualizado_em = new Date().toISOString();
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8');
  // fallback copy+unlink NAO e atomico (aceitavel: state single-agent sequencial)
  try {
    fs.renameSync(tmp, p);
  } catch (e) {
    if (e.code === 'EXDEV') {
      fs.copyFileSync(tmp, p);
      fs.unlinkSync(tmp);
      process.stderr.write('[review-cadence] EXDEV: fallback copy+unlink para ' + p + '\n');
    } else {
      throw e;
    }
  }
}

function decision(state) {
  const n = Number(state.fluxos_desde_revisao) || 0;
  const required = n >= SUGGEST_AFTER;
  return {
    total_fluxos: state.total_fluxos,
    fluxos_desde_revisao: n,
    revisao_sugerida: n >= SUGGEST_AFTER,
    revisao_obrigatoria_antes_do_proximo_fluxo: required,
    pode_iniciar_fluxo: !required,
    mensagem: required
      ? `Revisao obrigatoria antes do proximo fluxo: ja existem ${n} fluxo(s) desde a ultima revisao. Rode node scripts/verify.cjs e registre a revisao antes de gerar de novo.`
      : n === SUGGEST_AFTER - 1
        ? `OK para iniciar. Depois deste fluxo, sugira a revisao se ela ainda nao tiver sido executada.`
        : `OK para iniciar. Fluxos desde a ultima revisao: ${n}.`,
  };
}

function status(root) {
  return decision(load(root));
}

function recordFlow(root, args) {
  const state = load(root);
  state.total_fluxos += 1;
  state.fluxos_desde_revisao += 1;
  state.revisao_obrigatoria_antes_do_proximo_fluxo = state.fluxos_desde_revisao >= SUGGEST_AFTER;
  state.historico.push({
    tipo: 'fluxo',
    kind: args.kind || 'desconhecido',
    label: args.label || null,
    em: new Date().toISOString(),
  });
  state.historico = state.historico.slice(-30);
  save(root, state);
  const out = decision(state);
  out.registrado = true;
  out.acao_pos_fluxo = out.revisao_sugerida
    ? 'sugerir_revisao_agora; se o usuario nao executar, revisar obrigatoriamente antes do proximo fluxo'
    : 'seguir_normalmente';
  return out;
}

function markReview(root, args) {
  const state = load(root);
  state.fluxos_desde_revisao = 0;
  state.revisao_obrigatoria_antes_do_proximo_fluxo = false;
  state.ultima_revisao_em = new Date().toISOString();
  state.historico.push({
    tipo: 'revisao',
    resultado: args.resultado || 'ok',
    em: state.ultima_revisao_em,
  });
  state.historico = state.historico.slice(-30);
  save(root, state);
  const out = decision(state);
  out.revisao_registrada = true;
  return out;
}

function reset(root) {
  const state = emptyState();
  save(root, state);
  return decision(state);
}

if (require.main === module) {
  const sub = process.argv[2] || 'status';
  const args = parseArgs(process.argv, 3);
  const root = args.root || '.';
  let result;
  switch (sub) {
    case 'status':
      result = status(root);
      break;
    case 'record-flow':
      result = recordFlow(root, args);
      break;
    case 'mark-review':
      result = markReview(root, args);
      break;
    case 'reset':
      result = reset(root);
      break;
    default:
      result = { erro: 'subcomando desconhecido', uso: 'status|record-flow|mark-review|reset' };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(0);
}

module.exports = {
  STATE_REL,
  SUGGEST_AFTER,
  statePath,
  load,
  status,
  recordFlow,
  markReview,
  reset,
};
