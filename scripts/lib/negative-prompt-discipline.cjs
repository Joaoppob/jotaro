#!/usr/bin/env node
'use strict';

const fs = require('fs');

const MAX_TOKENS = 15;

const BANNED_GENERIC = [
  'blurry',
  'low quality',
  'bad anatomy',
  'deformed',
  'disfigured',
  'worst quality',
  'jpeg artifacts',
  'poorly drawn',
  'extra limb',
  'missing limb',
  'mutated',
  'mutation',
  'ugly',
  'gross proportions',
  'poorly rendered',
  'clone',
  'duplicate',
  'out of frame',
  'cropped',
];

function lower(text) {
  return String(text || '').toLowerCase();
}

function tokenCount(text) {
  return String(text || '').split(/[\s,]+/).filter(Boolean).length;
}

// 0.7: o negative_prompt e um campo UNICO no topo do prompt-forge (nao mais por
// cena). Presente => valida disciplina (<=15 tokens, sem listas genericas SDXL).
// Ausente => ok (negative e opcional).
function evaluateNegative(negativeRaw, artifacto) {
  const errors = [];
  const warnings = [];
  const negative = String(negativeRaw || '').trim();

  if (negative.length === 0) {
    return { artifacto, ok: true, score: 100, errors, warnings, token_count: 0, generic_hits: 0, max_tokens: MAX_TOKENS };
  }

  let score = 100;
  const tokens = tokenCount(negative);
  if (tokens > MAX_TOKENS) {
    errors.push(`negative prompt com ${tokens} tokens (max ${MAX_TOKENS}) — para modelos Gemini-class, negatives longos degradam a saida`);
    score -= 30 + Math.min(20, (tokens - MAX_TOKENS) * 3);
  }

  const lc = lower(negative);
  const foundGeneric = [];
  for (const term of BANNED_GENERIC) {
    if (lc.includes(term)) foundGeneric.push(term);
  }
  if (foundGeneric.length > 0) {
    errors.push(`termos genericos SDXL no negative: ${foundGeneric.slice(0, 5).join(', ')} — remova e use so artefatos observados`);
    score -= Math.min(40, foundGeneric.length * 10);
  }

  if (tokens >= 5 && tokens <= MAX_TOKENS && foundGeneric.length === 0) {
    warnings.push(`negative curto (${tokens} tokens) — ok para Gemini-class se realmente observou esses artefatos`);
  }

  return {
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    token_count: tokens,
    generic_hits: foundGeneric.length,
    max_tokens: MAX_TOKENS,
  };
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  return evaluateNegative(promptForge && promptForge.negative_prompt, artifacto);
}

module.exports = { evaluateShotlist, evaluateNegative };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/negative-prompt-discipline.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
