#!/usr/bin/env node
'use strict';

/**
 * ledger.cjs — trilha de auditoria de credito (append-only JSONL).
 *
 * Credito = dinheiro, e o free tier tem teto diario. O save-crystal
 * (pipeline-state.cjs) guarda ESTADO de retomada (idempotente, reescrito); este
 * ledger guarda HISTORICO (append-only, nunca reescrito) — cada disparo que
 * gastou credito vira uma linha imutavel. Responde "quanto este run custou,
 * quando, em que" sem inferir do estado.
 *
 * Arquivo: output/.credit-ledger.jsonl (uma entrada JSON por linha).
 * Cada linha: { ts(UTC ISO), tipo, job_id, creditos, cena?, marca, nota }.
 * O credito e REAL, vindo do MCP (get_cost) e passado em --creditos — a trilha
 * reflete o que o Higgsfield de fato cobrou naquele job, self-contained. O 0.7
 * forja UM prompt -> UM job, entao a unidade de registro e o JOB, nao a cena.
 * (--cena continua aceito como opcional, retrocompat/anotacao.)
 *
 * IMPORTANTE: so registre quando GEROU DE FATO (gastou credito). Nunca em
 * retomada/skip (idempotencia do save-crystal) — la nao houve gasto.
 *
 * Uso:
 *   node scripts/lib/ledger.cjs append --root . --tipo imagem|video \
 *        --job <id> --creditos <n do get_cost do MCP> [--cena <n>] [--marca <m>] [--nota <s>]
 *   node scripts/lib/ledger.cjs summary --root . [--dia YYYY-MM-DD]
 *   node scripts/lib/ledger.cjs dump    --root .
 *
 * exit 0 normal; exit 1 so em erro de uso. Resultado em JSON no stdout.
 * Dep-free: fs + path + libs locais (parse-args, custos).
 */

const fs = require('fs');
const path = require('path');
const parseArgs = require('./parse-args.cjs');
const custos = require('./custos.cjs');

const LEDGER_REL = path.join('output', '.credit-ledger.jsonl');

function ledgerPath(root) {
  return path.resolve(root || '.', LEDGER_REL);
}

// creditos por tipo — fallback derivado de custos.cjs quando --creditos nao vem.
// No 0.7 o custo REAL vem do get_cost do MCP (--creditos); isto e so um piso
// retrocompat para tipo conhecido, nunca a fonte primaria.
function creditosPara(tipo) {
  if (tipo === 'imagem') return custos.IMAGEM;
  if (tipo === 'video') return custos.VIDEO;
  return null;
}

function cmdAppend(root, args) {
  const tipo = args.tipo;
  // job id: aceita --job (0.7) e --job-id (retrocompat).
  const jobId = args.job || args['job-id'];
  if (!jobId) {
    return { ok: false, erro: 'job obrigatorio para registrar gasto (--job <id>)' };
  }
  // credito REAL do MCP (get_cost) via --creditos; se ausente, cai no fallback
  // por tipo (custos.cjs). Nao ha custo hardcoded 2/4 no caminho principal.
  let creditos;
  if (args.creditos !== undefined && args.creditos !== true) {
    const c = Number(args.creditos);
    if (!Number.isFinite(c) || c < 0) {
      return { ok: false, erro: 'creditos deve ser um numero >= 0' };
    }
    creditos = c;
  } else {
    creditos = creditosPara(tipo);
    if (creditos === null) {
      return {
        ok: false,
        erro: 'informe --creditos <n> (custo real do get_cost do MCP) ou um --tipo imagem|video conhecido',
      };
    }
  }
  const entry = {
    ts: new Date().toISOString(), // UTC (ISO 8601 termina em Z)
    tipo: tipo || null,
    job_id: jobId,
    creditos,
  };
  // cena virou opcional (0.7 e job-scoped); registra so quando informada.
  if (args.cena !== undefined && args.cena !== true) {
    const cenaNum = Number(args.cena);
    if (!Number.isInteger(cenaNum) || cenaNum < 1) {
      return { ok: false, erro: 'cena, quando informada, deve ser um inteiro positivo' };
    }
    entry.cena = cenaNum;
  }
  if (args.marca) entry.marca = args.marca;
  if (args.nota) entry.nota = args.nota;
  const p = ledgerPath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  // append atomico-o-suficiente: uma linha por disparo, nunca reescreve o passado.
  fs.appendFileSync(p, JSON.stringify(entry) + '\n', 'utf8');
  return { ok: true, entry, arquivo: p };
}

function readEntries(root) {
  const p = ledgerPath(root);
  if (!fs.existsSync(p)) return [];
  const raw = fs.readFileSync(p, 'utf8');
  const lines = raw.split('\n').filter(Boolean);
  const entries = [];
  let skipped = 0;
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch (_) {
      skipped++;
    }
  }
  if (skipped > 0) {
    process.stderr.write(
      `[ledger] ${skipped} linha(s) corrompida(s) ignoradas em ${p} — ` +
      `o total reportado pode estar abaixo do gasto real.\n`
    );
  }
  return entries;
}

function cmdSummary(root, dia) {
  const all = readEntries(root);
  const entries = dia ? all.filter((e) => String(e.ts || '').slice(0, 10) === dia) : all;
  let total = 0;
  const por_dia = {};
  const por_tipo = {};
  for (const e of entries) {
    const c = Number(e.creditos) || 0;
    total += c;
    const d = String(e.ts || '').slice(0, 10) || 'sem-data';
    por_dia[d] = (por_dia[d] || 0) + c;
    por_tipo[e.tipo] = (por_tipo[e.tipo] || 0) + c;
  }
  // alerta de teto: dia que passou do free cap (custos.TETO_DIA).
  const alertas = [];
  for (const [d, c] of Object.entries(por_dia)) {
    if (c > custos.TETO_DIA) {
      alertas.push(`${d}: ${c} creditos (acima do teto free ${custos.TETO_DIA}/dia)`);
    }
  }
  return {
    ok: true,
    n_entries: entries.length,
    total_creditos: total,
    teto_dia: custos.TETO_DIA,
    por_dia,
    por_tipo,
    alertas,
  };
}

function cmdDump(root) {
  return { ok: true, entries: readEntries(root) };
}

if (require.main === module) {
  const sub = process.argv[2];
  const args = parseArgs(process.argv, 3);
  const root = args.root || '.';
  let result;
  switch (sub) {
    case 'append':
      result = cmdAppend(root, args);
      break;
    case 'summary':
      result = cmdSummary(root, args.dia);
      break;
    case 'dump':
      result = cmdDump(root);
      break;
    default:
      result = { ok: false, erro: 'subcomando desconhecido', uso: 'append|summary|dump' };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result && result.ok === false ? 1 : 0);
}

module.exports = { cmdAppend, cmdSummary, cmdDump, readEntries, ledgerPath, creditosPara };
