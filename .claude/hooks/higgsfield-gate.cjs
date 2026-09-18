#!/usr/bin/env node
'use strict';

/*
 * higgsfield-gate.cjs — hook PreToolUse do Jotaro Generator (0.8).
 *
 * Interlock mecanico de dupla camada:
 *   1. Preflight gate (0.7): token deterministico de qualidade (todos os gates passaram).
 *   2. Approval gate (0.8): token de aprovacao humana escopado por geracao.
 *
 * Para gastar credito, AMBOS os tokens precisam estar validos:
 *   - preflight-gate.cjs.tokenValid() → qualidade mecanica passou
 *   - approval-token.cjs.validateGenerationMatch() → humano aprovou este prompt exato
 *
 * Subcomandos/tools gratuitos — balance, job_status, account status, upload, etc. —
 * passam livres em qualquer situacao.
 *
 * Contrato (PreToolUse):
 * - recebe JSON na stdin: { tool_name, tool_input:{ command } } (+ cwd opcional).
 * - libera: exit 0 + permissionDecision allow.
 * - bloqueia: exit 0 + permissionDecision deny + razao.
 * - falha aberto em erro interno do hook (bug nao trava o produto).
 */

const path = require('path');

const SPEND_RE = /\b(?:higgsfield|hf)\s+generate\s+create\b/i;

const MCP_SPEND_TOOLS = new Set([
  'generate_video',
  'generate_image',
  'generate_audio',
]);

function mcpSuffix(toolName) {
  const t = String(toolName || '');
  if (t.startsWith('mcp__')) {
    const parts = t.split('__');
    return parts[parts.length - 1] || '';
  }
  return t;
}

function isMcpSpend(toolName) {
  const t = String(toolName || '');
  if (t.startsWith('mcp__')) {
    if (!/^mcp__higgsfield__/i.test(t)) return false;
    return MCP_SPEND_TOOLS.has(mcpSuffix(t));
  }
  return MCP_SPEND_TOOLS.has(t);
}

function allow() {
  try {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow' },
    }));
  } catch (_) { /* noop */ }
  process.exit(0);
}

function deny(reason) {
  try {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }));
  } catch (_) { /* noop */ }
  process.exit(0);
}

function decide(toolName, command, repoRoot, nowMs) {
  let gasta = false;
  if (toolName === 'Bash') {
    gasta = SPEND_RE.test(String(command || ''));
  } else if (isMcpSpend(toolName)) {
    gasta = true;
  }
  if (!gasta) return { decision: 'allow', reason: 'nao gasta credito' };

  const now = nowMs || Date.now();

  // Camada 1 — preflight gate (0.7): qualidade mecanica.
  let gate;
  try {
    gate = require(path.join(repoRoot, 'scripts', 'preflight-gate.cjs'));
  } catch (e) {
    return { decision: 'allow', reason: `hook degradado (preflight nao encontrado): ${e && e.message}` };
  }
  const v = gate.tokenValid(repoRoot, now);
  if (!v.valid) {
    return {
      decision: 'deny',
      reason: `Geracao bloqueada pelo gate de qualidade: ${v.reason}. Rode \`node scripts/preflight-gate.cjs --root projects/<nome>\` e passe TODOS os criterios antes de gerar.`,
    };
  }

  // Camada 2 — approval gate (0.8): aprovacao humana por geracao.
  try {
    const approvalToken = require(path.join(repoRoot, 'scripts', 'lib', 'approval-token.cjs'));
    const gateResult = gate.tokenValid(repoRoot, now);
    // tokenValid() devolve o token lido em `.token`, nao `.tokenData` — nome errado
    // aqui fazia esta camada nunca achar generation_id/prompt_hash de verdade,
    // silenciosamente pulando o gate de aprovacao humana em qualquer run real.
    const tokenData = gateResult.token || {};
    if (tokenData.generation_id && tokenData.prompt_hash) {
      const approvalValid = approvalToken.validateGenerationMatch(
        tokenData.approval_token || '',
        tokenData.generation_id,
        tokenData.prompt_hash
      );
      if (!approvalValid.valid) {
        return {
          decision: 'deny',
          reason: `Geracao bloqueada pelo gate de aprovacao humana (0.8): ${approvalValid.reason}. O prompt precisa ser aprovado por um humano antes de gastar credito.`,
        };
      }
      // Escopo por ferramenta: a aprovacao humana lista quais tools ela cobre
      // (allowed_tools) — token valido para a geracao nao deve liberar QUALQUER
      // tool de gasto, so as que o humano de fato aprovou. So comparavel 1:1
      // via MCP (nome de tool exato); via Bash (CLI de fallback) o comando nao
      // distingue video/imagem/audio de forma parseavel com seguranca, entao a
      // checagem de escopo por tool so roda no caminho MCP.
      if (isMcpSpend(toolName)) {
        const allowed = (approvalValid.data && approvalValid.data.allowed_tools) || [];
        const wanted = mcpSuffix(toolName);
        const allowedSuffixes = allowed.map(mcpSuffix);
        if (!allowedSuffixes.includes(wanted)) {
          return {
            decision: 'deny',
            reason: `Geracao bloqueada: a aprovacao humana desta geracao nao cobre a ferramenta "${wanted}" (aprovado para: ${allowedSuffixes.join(', ') || 'nenhuma'}). Peca nova aprovacao (scripts/approve-generation.cjs) incluindo "${wanted}" em --tools.`,
          };
        }
      }
    }
  } catch (e) {
    // approval-token nao carregou — aceita o preflight sozinho (compat 0.7).
  }

  return { decision: 'allow', reason: 'gate armado (preflight + approval)' };
}

function readStdin() {
  return new Promise(function (resolve) {
    var data = '';
    var settled = false;
    function done() { if (!settled) { settled = true; resolve(data); } }
    try {
      if (process.stdin.isTTY) { done(); return; }
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', function (c) { data += c; });
      process.stdin.on('end', done);
      process.stdin.on('error', done);
      setTimeout(done, 1500);
    } catch (_) { done(); }
  });
}

async function main() {
  try {
    var raw = await readStdin();
    var payload;
    try { payload = raw && raw.trim() ? JSON.parse(raw) : {}; } catch (_) { allow(); return; }
    var toolName = payload.tool_name || payload.toolName;
    var command = payload.tool_input && (payload.tool_input.command || payload.tool_input.cmd);
    var repoRoot = process.env.CLAUDE_PROJECT_DIR || payload.cwd || process.cwd();
    var r = decide(toolName, command, repoRoot);
    if (r.decision === 'deny') { deny(r.reason); return; }
    allow();
  } catch (_) {
    allow();
  }
}

module.exports = { decide, SPEND_RE, isMcpSpend, mcpSuffix, MCP_SPEND_TOOLS };

if (require.main === module) {
  main();
  process.on('uncaughtException', function () { try { allow(); } catch (_) {} });
  process.on('unhandledRejection', function () { try { allow(); } catch (_) {} });
}
