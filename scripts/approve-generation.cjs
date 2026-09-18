#!/usr/bin/env node
'use strict';

/**
 * approve-generation.cjs — aprovacao humana real da Camada 2 (0.8).
 *
 * PROBLEMA QUE RESOLVE: o token de qualidade (Camada 1, preflight-gate-0.8.cjs) prova
 * que o prompt passou nos gates mecanicos, mas producao real exige TAMBEM um humano
 * dizer "sim, pode gastar credito nesta geracao exata". Este script e o unico lugar
 * que gera o approval_token de verdade (approval-token.cjs.generateToken) e o grava
 * tanto no artefato auditavel (generations/<id>/approval/approval-record.yaml,
 * schemas/approval-record.schema.json) quanto no token mecanico que o hook
 * higgsfield-gate.cjs le (.claude/state/.gate-pass.json).
 *
 * Uso:
 *   node scripts/approve-generation.cjs --root . --project <project_id> \
 *     --generation <generation-id> --approved-by "<nome>" \
 *     --tools "generate_video,generate_image" [--ttl-hours 24]
 *
 * Pre-requisito: rodar scripts/preflight-gate-0.8.cjs primeiro para ESTE generation_id
 * exato (o token em .claude/state/.gate-pass.json precisa ter mode:'0.8' e bater
 * generation_id/project_id).
 */

const fs = require('fs');
const path = require('path');

const genPaths = require('./lib/generation-paths.cjs');
const preflightGate = require('./preflight-gate.cjs');
const approvalToken = require('./lib/approval-token.cjs');
const { escapeYamlDoubleQuoted } = require('./lib/yaml-escape.cjs');

function parseArgs(argv) {
  const opts = { ttlHours: 24 };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--root': opts.root = argv[++i]; break;
      case '--project': opts.project = argv[++i]; break;
      case '--generation': opts.generation = argv[++i]; break;
      case '--approved-by': opts.approvedBy = argv[++i]; break;
      case '--tools': opts.tools = argv[++i]; break;
      case '--ttl-hours': opts.ttlHours = parseFloat(argv[++i]); break;
      case '--notes': opts.notes = argv[++i]; break;
      default: break;
    }
  }
  return opts;
}

function toYamlApprovalRecord(record) {
  const esc = escapeYamlDoubleQuoted;
  const lines = [];
  lines.push('approval:');
  lines.push(`  project_id: "${esc(record.project_id)}"`);
  lines.push(`  generation_id: "${esc(record.generation_id)}"`);
  lines.push(`  prompt_version: "${esc(record.prompt_version)}"`);
  lines.push(`  prompt_hash: "${esc(record.prompt_hash)}"`);
  lines.push(`  gates_snapshot_hash: "${esc(record.gates_snapshot_hash)}"`);
  lines.push(`  approved_by: "${esc(record.approved_by)}"`);
  lines.push(`  approved_at: "${esc(record.approved_at)}"`);
  lines.push(`  decision: "${esc(record.decision)}"`);
  lines.push(`  production_token: "${esc(record.production_token)}"`);
  lines.push(`  expires_at: "${esc(record.expires_at)}"`);
  if (record.allowed_tools && record.allowed_tools.length > 0) {
    lines.push('  allowed_tools:');
    for (const t of record.allowed_tools) {
      lines.push(`    - "${esc(t)}"`);
    }
  }
  if (record.notes) {
    lines.push(`  notes: "${esc(record.notes)}"`);
  }
  return lines.join('\n') + '\n';
}

function approveGeneration(opts) {
  const { root, project, generation, approvedBy, tools, ttlHours, notes } = opts;
  if (!root || !project || !generation || !approvedBy || !tools) {
    return { ok: false, error: 'parametros obrigatorios ausentes: --root --project --generation --approved-by --tools' };
  }

  const repoRoot = path.resolve(root);

  const currentToken = preflightGate.readToken(repoRoot);
  if (!currentToken || currentToken.mode !== '0.8') {
    return {
      ok: false,
      error: `Nao ha token 0.8 armado. Rode preflight-gate-0.8.cjs primeiro pra este generation_id exato (${generation}).`,
    };
  }
  if (currentToken.generation_id !== generation) {
    return {
      ok: false,
      error: `Token armado e para generation_id=${currentToken.generation_id}, nao ${generation}. Rode preflight-gate-0.8.cjs primeiro pra este generation_id exato.`,
    };
  }
  if (currentToken.project_id !== project) {
    return {
      ok: false,
      error: `Token armado e para project_id=${currentToken.project_id}, nao ${project}. Rode preflight-gate-0.8.cjs primeiro pra este generation_id exato.`,
    };
  }

  const allowedToolsList = String(tools).split(',').map((t) => t.trim()).filter(Boolean);
  if (allowedToolsList.length === 0) {
    return { ok: false, error: '--tools nao pode resultar em lista vazia' };
  }

  const ttl = Number.isFinite(ttlHours) ? ttlHours : 24;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttl * 60 * 60 * 1000).toISOString();

  const productionToken = approvalToken.generateToken({
    project_id: project,
    generation_id: generation,
    prompt_hash: currentToken.prompt_hash,
    gate_results_hash: currentToken.gates_snapshot_hash,
    approved_by: approvedBy,
    allowed_tools: allowedToolsList,
    expires_at: expiresAt,
  });

  let projectRoot;
  let generationRoot;
  try {
    projectRoot = genPaths.resolveProjectRoot(repoRoot, project);
    generationRoot = genPaths.resolveGenerationRoot(projectRoot, generation);
  } catch (e) {
    return { ok: false, error: `path invalido: ${e && e.message}` };
  }

  const approvedAt = now.toISOString();
  const record = {
    project_id: project,
    generation_id: generation,
    prompt_version: 'v1.0',
    prompt_hash: currentToken.prompt_hash,
    gates_snapshot_hash: currentToken.gates_snapshot_hash,
    approved_by: approvedBy,
    approved_at: approvedAt,
    decision: 'approved',
    production_token: productionToken,
    expires_at: expiresAt,
    allowed_tools: allowedToolsList,
    notes: notes || undefined,
  };

  const approvalDir = path.join(generationRoot, 'approval');
  fs.mkdirSync(approvalDir, { recursive: true });
  const approvalRecordPath = path.join(approvalDir, 'approval-record.yaml');
  fs.writeFileSync(approvalRecordPath, toYamlApprovalRecord(record));

  const updatedToken = { ...currentToken, approval_token: productionToken };
  const tp = preflightGate.tokenPath(repoRoot);
  fs.mkdirSync(path.dirname(tp), { recursive: true });
  fs.writeFileSync(tp, JSON.stringify(updatedToken, null, 2) + '\n');

  return {
    ok: true,
    approvalRecordPath,
    tokenPath: tp,
    productionToken,
    expiresAt,
  };
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const result = approveGeneration(opts);
  if (!result.ok) {
    console.error(`[approve-generation] ${result.error}`);
    process.exit(1);
  }
  console.log(`Aprovacao registrada para generation_id=${opts.generation}. Token de producao valido ate ${result.expiresAt}. Producao liberada.`);
  process.exit(0);
}

module.exports = { approveGeneration, toYamlApprovalRecord, parseArgs };

if (require.main === module) {
  main();
}
