#!/usr/bin/env node
'use strict';

/**
 * persona-carry.cjs — gate de fidelidade de PERSONA (nivel-100).
 *
 * No 0.7 a identidade VISUAL (rosto/corpo) vem do Element (referencia), nao do texto
 * — por isso este gate ficou mais LEVE: ele nao guarda tracos fisicos, guarda a
 * PERSONA como COMPORTAMENTO/VOZ (personalidade, mood, jeito). Sem persona coerente,
 * o reel fica "bonito mas morto".
 *
 * 0.7: le o prompt-forge. O sinal de persona vem de `shots[].mood` (+ `descricao`);
 * o gate confere que esses cues de mood NAO somem — que ao menos parte deles reaparece
 * na PROSA `prompt` (a persona precisa estar no texto que efetivamente vai pro modelo).
 * Se nenhum shot declara mood, o gate e NO-OP (ok:true).
 *
 * Uso: node scripts/lib/persona-carry.cjs <prompt-forge.json>   (exit 1 se reprova)
 */

const fs = require('fs');

const MIN_TOKEN_LEN = 4;
// Cobertura minima: fracao dos cues de mood distintos que precisa reaparecer na prosa.
const MIN_COVERAGE = 0.4;

// Stopwords PT/EN comuns — nao contam como cue distintivo de persona.
const STOP = new Set([
  'same', 'from', 'with', 'character', 'reference', 'image', 'images', 'style', 'frame',
  'mage', 'wizard', 'personagem', 'persona', 'cena', 'prompt', 'vertical', 'mobile',
  'uma', 'um', 'que', 'com', 'sem', 'dos', 'das', 'para', 'pela', 'pelo', 'como', 'mais',
  'muito', 'sempre', 'tem', 'ser', 'sua', 'seu', 'and', 'the', 'her', 'his', 'they',
  'this', 'that', 'into', 'over', 'when', 'while', 'their', 'each', 'very', 'cartoon',
  'saturated', 'colors', 'color', 'bold', 'outlines', 'soft', 'shadows', 'scene',
]);

function lower(v) { return String(v || '').toLowerCase(); }

// Extrai tokens distintivos de persona de um texto (mood/descricao).
function personaTokens(text) {
  const seen = new Set();
  const out = [];
  for (const w of lower(text).split(/[^a-zçãáàâéêíóôõú]+/)) {
    if (w.length >= MIN_TOKEN_LEN && !STOP.has(w) && !seen.has(w)) { seen.add(w); out.push(w); }
  }
  return out;
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  const prompt = lower((promptForge && promptForge.prompt) || '');

  const errors = [];
  const warnings = [];

  // cues de persona = union dos tokens de MOOD de todos os shots. Persona aqui e
  // comportamento/voz (mood), nao a descricao concreta da acao (essa varia por shot e
  // nao precisa recorrer). Assim medimos se o CLIMA da personagem sobrevive na prosa.
  const moodText = shots.map((s) => String(s.mood || '')).join(' ');
  const declaredMoods = shots.map((s) => String(s.mood || '').trim()).filter(Boolean);
  const cues = personaTokens(moodText);

  if (declaredMoods.length === 0 || cues.length === 0) {
    return { artifacto, ok: true, score: 100, errors, warnings: ['prompt-forge sem mood declarado nos shots — persona no-op'], scenes: [] };
  }

  const hits = cues.filter((t) => prompt.includes(t));
  const coverage = hits.length / cues.length;

  let score = 100;
  if (prompt.trim().length === 0) {
    errors.push('prompt-forge tem mood nos shots mas prosa vazia — a persona nao viaja pro modelo');
    score = 0;
  } else if (coverage < MIN_COVERAGE) {
    errors.push(`persona sumiu na prosa: so ${hits.length}/${cues.length} cue(s) de mood (${Math.round(coverage * 100)}%, minimo ${Math.round(MIN_COVERAGE * 100)}%) reaparecem no prompt — reforce personalidade/mood/comportamento na prosa`);
    score -= 30;
  }

  return {
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    scenes: shots.map((s) => ({ n: s.n, mood: s.mood })),
    persona_cues: cues,
    persona_cues_na_prosa: hits,
    coverage: Math.round(coverage * 100),
  };
}

module.exports = { evaluateShotlist, MIN_COVERAGE, personaTokens };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/persona-carry.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
