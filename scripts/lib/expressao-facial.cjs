#!/usr/bin/env node
'use strict';

/**
 * expressao-facial.cjs — gate de expressao facial proibida (Wave N).
 *
 * Regra do produto (run real de producao, 2026-07-01): nenhum beat deste sistema pede uma expressao
 * de nojo/repulsa/desprezo na personagem -- nem tensao, nem frustracao, nem desanimo justificam
 * essa leitura. Aconteceu de verdade: uma `descricao` de tensao ("cara de 'essa take nao
 * prestou'", queixo tenso, olhos estreitos) rendeu, no video real, uma expressao de nojo. A
 * disciplina certa para tensao/frustracao e corpo parado, queixo tenso, olhar fixo/cansado --
 * nunca careta de repulsa.
 *
 * Este gate le `shots[].descricao`, `shots[].mood` e o campo `prompt` (top-level) do
 * prompt-forge, e reprova se qualquer um contiver um termo de nojo/repulsa/desprezo (PT ou EN).
 * Termos literais, baixo risco de falso-positivo -- nenhum prompt bem formado deste sistema
 * precisa dessas palavras.
 *
 * Uso: node scripts/lib/expressao-facial.cjs <prompt-forge.json>   (exit 1 se reprova)
 */

const fs = require('fs');

const BANNED_TERMS = [
  'nojo',
  'repulsa',
  'repugnancia',
  'repugnância',
  'desprezo',
  'careta de nojo',
  'cara de nojo',
  'enjoada',
  'enjoado',
  'nauseada',
  'nauseado',
  'disgust',
  'disgusted',
  'disgusting',
  'grimace',
  'grimacing',
  'sneer',
  'sneering',
  'contempt',
  'contemptuous',
  'revulsion',
  'repulsion',
  'repulsed',
];

function lower(text) {
  return String(text || '').toLowerCase();
}

function collectFields(promptForge) {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  const fields = [];
  shots.forEach((s, idx) => {
    const ref = `shots[n=${(s && s.n) != null ? s.n : idx + 1}]`;
    if (s && s.descricao) fields.push({ ref: `${ref}.descricao`, texto: s.descricao });
    if (s && s.mood) fields.push({ ref: `${ref}.mood`, texto: s.mood });
  });
  if (promptForge && promptForge.prompt) fields.push({ ref: 'prompt', texto: promptForge.prompt });
  return fields;
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  const errors = [];
  const warnings = [];
  const fields = collectFields(promptForge);

  if (fields.length === 0) {
    return { artifacto, ok: true, score: 100, errors, warnings: ['prompt-forge sem campos de texto avaliaveis -- gate no-op'], checked: 0 };
  }

  let score = 100;
  let checked = 0;
  for (const field of fields) {
    checked += 1;
    const lc = lower(field.texto);
    const hit = BANNED_TERMS.find((term) => lc.includes(term));
    if (hit) {
      errors.push(
        `${field.ref} sugere expressao de nojo/repulsa ("${hit}") -- nenhum beat deste sistema ` +
        `pede essa leitura; tensao/frustracao vira corpo parado e olhar fixo, nunca careta de repulsa`
      );
      score -= 40;
    }
  }

  return {
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    checked,
  };
}

module.exports = { evaluateShotlist };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/expressao-facial.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
