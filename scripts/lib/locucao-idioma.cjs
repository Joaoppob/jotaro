#!/usr/bin/env node
'use strict';

/**
 * locucao-idioma.cjs — gate de idioma da LOCUCAO (Wave K).
 *
 * Regra forte do produto: todo conteudo que aparece/soa no video final (locucao, fala
 * da personagem, qualquer texto em tela) DEVE ser em PT-BR. A direcao tecnica do
 * prompt (camera, edicao, mood, avoid, descricao de cena) CONTINUA em ingles — os
 * modelos respondem melhor em ingles pra essas instrucoes. Este gate le SO os dois
 * campos que carregam conteudo audivel/visivel pro ESPECTADOR:
 *   - shots[].fala        (opcional por shot)
 *   - audio.locucao[].texto (obrigatorio por item, quando o array existe)
 *
 * Heuristica deterministica (sem LLM, sem lib externa):
 *   - Diacritico PT-BR (ã õ á é í ó ú â ê ô ç à) OU stopword PT-BR comum -> sinal PT,
 *     aprova.
 *   - Sem nenhum sinal PT E com stopword EN comum (the/and/you/is/this/with/for) ->
 *     sinal de ingles-puro-suspeito, reprova.
 *   - Texto curto (<=2 palavras, ex.: interjeicao "Oi!") sem sinal claro nem de um
 *     nem de outro -> nao reprova, so registra aviso (heuristica curta e ruido).
 *   - Texto mais longo sem sinal nenhum (nem PT nem EN) -> ambiguo, so aviso
 *     (heuristica deliberadamente estreita pra evitar falso-positivo).
 *   - Sem shots[].fala nem audio.locucao[] no prompt-forge (ex.: video mudo) ->
 *     no-op, ok:true.
 *
 * Uso: node scripts/lib/locucao-idioma.cjs <prompt-forge.json>   (exit 1 se reprova)
 */

const fs = require('fs');

const DIACRITIC_RE = /[ãõáéíóúâêôçà]/i;

const PT_STOP = new Set([
  'que', 'não', 'é', 'para', 'com', 'uma', 'um', 'de', 'da', 'do',
  'você', 'esse', 'essa', 'muito', 'bem', 'tá', 'né', 'pra',
]);

const EN_STOP = new Set(['the', 'and', 'you', 'is', 'this', 'with', 'for']);

const SHORT_TEXT_MAX_WORDS = 2;
const PENALTY_PER_ERROR = 35;

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-zçãáàâéêíóôõú]+/)
    .filter(Boolean);
}

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

// Avalia um unico trecho (fala ou locucao) e devolve o sinal detectado.
// signal: 'pt' | 'en-suspeito' | 'curto' | 'ambiguo' | 'vazio'
function evaluateText(text) {
  const raw = String(text || '').trim();
  if (raw.length === 0) return { signal: 'vazio', words: 0 };

  const hasDiacritic = DIACRITIC_RE.test(raw);
  const tokens = tokenize(raw);
  const ptHits = tokens.filter((t) => PT_STOP.has(t));
  const enHits = tokens.filter((t) => EN_STOP.has(t));
  const words = wordCount(raw);

  if (hasDiacritic || ptHits.length > 0) {
    return { signal: 'pt', hasDiacritic, ptHits, enHits, words };
  }
  if (words <= SHORT_TEXT_MAX_WORDS) {
    return { signal: 'curto', hasDiacritic, ptHits, enHits, words };
  }
  if (enHits.length > 0) {
    return { signal: 'en-suspeito', hasDiacritic, ptHits, enHits, words };
  }
  return { signal: 'ambiguo', hasDiacritic, ptHits, enHits, words };
}

function coletarFalas(promptForge) {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  return shots
    .map((s, idx) => ({ ref: `shots[n=${(s && s.n) != null ? s.n : idx + 1}].fala`, texto: s && s.fala }))
    .filter((f) => typeof f.texto === 'string' && f.texto.trim().length > 0);
}

function coletarLocucoes(promptForge) {
  const raw = promptForge && promptForge.audio && Array.isArray(promptForge.audio.locucao)
    ? promptForge.audio.locucao
    : [];
  return raw
    .map((l, idx) => ({ ref: `audio.locucao[${(l && l.beat) || idx}].texto`, texto: l && l.texto }))
    .filter((l) => typeof l.texto === 'string' && l.texto.trim().length > 0);
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  const errors = [];
  const warnings = [];

  const falas = coletarFalas(promptForge);
  const locucoes = coletarLocucoes(promptForge);

  if (falas.length === 0 && locucoes.length === 0) {
    return {
      artifacto,
      ok: true,
      score: 100,
      errors,
      warnings: ['prompt-forge sem shots[].fala e sem audio.locucao — gate no-op'],
      checked: 0,
    };
  }

  let score = 100;
  let checked = 0;
  const itens = falas.concat(locucoes);

  for (const item of itens) {
    checked += 1;
    const v = evaluateText(item.texto);
    if (v.signal === 'en-suspeito') {
      errors.push(
        `${item.ref} parece INGLES, nao PT-BR: "${item.texto}" — locucao/fala e SEMPRE em portugues ` +
        `(a direcao tecnica do prompt continua em ingles, isso nao muda)`
      );
      score -= PENALTY_PER_ERROR;
    } else if (v.signal === 'curto') {
      warnings.push(`${item.ref} curto demais pra avaliar com confianca (${v.words} palavra(s)): "${item.texto}"`);
    } else if (v.signal === 'ambiguo') {
      warnings.push(`${item.ref} sem sinal claro de PT-BR nem de ingles: "${item.texto}" — revise manualmente`);
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

module.exports = { evaluateShotlist, evaluateText };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/locucao-idioma.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
