#!/usr/bin/env node
'use strict';

/**
 * editing-quality.cjs — gate deterministico do ritmo de corte (editing-director).
 *
 * Recebe o caminho de um edicao.json (schemas/edicao.schema.json) e valida o
 * Editing style do reel:
 *   1. estilo_corte nao-vazio E concreto — termo-vago sozinho reprova (o corte
 *      precisa de um estilo nomeado, nao de um adjetivo);
 *   2. transicoes >= 1, todas de um vocabulario fechado de edicao (sem termo solto);
 *   3. ritmo_por_secao >= 1; cada secao com pacing nao-vazio e planos_distintos >= 1;
 *   4. variedade: num reel multi-secao o ritmo nao pode ser monotono — ou ha
 *      planos distintos somando >= 2, ou o pacing varia entre as secoes (eco do
 *      angle-variety; variedade e sobre nao-monotonia, nao numero de planos);
 *   5. justificativa nao-vazia (por que esse ritmo serve a alma/o mood).
 *
 * Saida: { ok, erros:[], avisos:[] } no stdout. Exit 0 ok / 1 reprova / 2 uso.
 */

const fs = require('fs');

// Termos-vagos que NAO podem ser o estilo de corte sozinhos. Se o estilo_corte,
// depois de tirar pontuacao, e SO um desses (ou uma combinacao deles), reprova:
// o estilo precisa nomear um corte concreto (ex.: "fast-cut TikTok").
const VAGUE_TERMS = ['dinamico', 'dinâmico', 'bom', 'legal', 'moderno'];

// Vocabulario fechado de transicoes de edicao. Toda transicao do artefato precisa
// casar (case-insensitive, hifen/espaco tolerados) com um destes.
const TRANSICAO_VOCAB = [
  'match-cut', 'jump-cut', 'hard-cut', 'cross-dissolve', 'whip-pan',
  'smash-cut', 'l-cut', 'j-cut', 'hold',
];

function normTransicao(t) {
  return String(t || '').toLowerCase().trim().replace(/\s+/g, '-');
}

function isVagueOnly(estilo) {
  // remove pontuacao, separa em palavras; se TODAS as palavras forem termos-vagos
  // (ou conectivos triviais), o estilo e vago. Um "fast-cut TikTok" tem palavras
  // que nao estao na lista vaga, entao passa.
  const palavras = String(estilo || '')
    .toLowerCase()
    .replace(/[^a-zà-ú\s-]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w !== 'e' && w !== 'mas' && w !== 'muito');
  if (palavras.length === 0) return false; // vazio e tratado a parte
  return palavras.every((w) => VAGUE_TERMS.includes(w));
}

function evaluateEdicao(edicao, artifacto = 'inline') {
  const erros = [];
  const avisos = [];

  const estilo = String((edicao && edicao.estilo_corte) || '').trim();
  const transicoes = Array.isArray(edicao && edicao.transicoes) ? edicao.transicoes : [];
  const secoes = Array.isArray(edicao && edicao.ritmo_por_secao) ? edicao.ritmo_por_secao : [];
  const justificativa = String((edicao && edicao.justificativa) || '').trim();

  // 1. estilo_corte nao-vazio e concreto.
  if (estilo.length === 0) {
    erros.push('estilo_corte: vazio; nomeie um estilo de corte concreto (ex.: "fast-cut TikTok" ou "corte contemplativo lento")');
  } else if (isVagueOnly(estilo)) {
    erros.push(`estilo_corte: estilo de corte vago ("${estilo}"); nomeie um estilo concreto, nao um adjetivo solto como dinamico/bom/legal/moderno`);
  }

  // 2. transicoes >= 1, do vocabulario.
  if (transicoes.length === 0) {
    erros.push('transicoes: vazio; o reel precisa de ao menos uma transicao do vocabulario (match-cut, jump-cut, hard-cut, cross-dissolve, whip-pan, smash-cut, l-cut, j-cut, hold)');
  } else {
    for (let i = 0; i < transicoes.length; i++) {
      const t = normTransicao(transicoes[i]);
      if (!TRANSICAO_VOCAB.includes(t)) {
        erros.push(`transicoes[${i}]: transicao desconhecida ("${transicoes[i]}"); use o vocabulario (match-cut, jump-cut, hard-cut, cross-dissolve, whip-pan, smash-cut, l-cut, j-cut, hold)`);
      }
    }
  }

  // 3. ritmo_por_secao >= 1; cada secao com pacing e planos_distintos validos.
  if (secoes.length === 0) {
    erros.push('ritmo_por_secao: vazio; defina ao menos uma secao com pacing e planos_distintos');
  }
  let somaPlanos = 0;
  for (let i = 0; i < secoes.length; i++) {
    const s = secoes[i] || {};
    const pacing = String(s.pacing || '').trim();
    const planos = s.planos_distintos;
    if (pacing.length === 0) {
      erros.push(`ritmo_por_secao[${i}]: pacing vazio; descreva o ritmo da secao em linguagem de editor`);
    }
    if (!Number.isInteger(planos) || planos < 1) {
      erros.push(`ritmo_por_secao[${i}]: planos_distintos deve ser inteiro >= 1 (esta ${JSON.stringify(planos)})`);
    } else {
      somaPlanos += planos;
    }
  }

  // 4. variedade (eco do angle-variety): num reel multi-secao o ritmo nao pode ser
  // monotono. Variedade e sobre NAO-MONOTONIA: aceita ou planos somando >= 2, ou
  // pacing variado entre as secoes. Um reel calmo (1 plano por secao) passa se o
  // pacing varia. So reprova quem repete o MESMO pacing E nao distingue planos.
  if (secoes.length > 1) {
    const pacingsDistintos = new Set(
      secoes.map((s) => String((s && s.pacing) || '').trim().toLowerCase()).filter(Boolean)
    ).size;
    const temVariedadePacing = pacingsDistintos > 1;
    const temVariedadePlanos = somaPlanos >= 2;
    if (!temVariedadePacing && !temVariedadePlanos) {
      erros.push('ritmo_por_secao: reel monotono — o mesmo pacing se repete em todas as secoes e nao ha planos distintos; varie o ritmo entre as secoes (eco do angle-variety)');
    }
  }

  // 5. justificativa nao-vazia.
  if (justificativa.length === 0) {
    erros.push('justificativa: vazia; explique por que esse ritmo de corte serve a alma/o mood do reel');
  }

  return {
    artifacto,
    ok: erros.length === 0,
    erros,
    avisos,
  };
}

module.exports = { evaluateEdicao, TRANSICAO_VOCAB, VAGUE_TERMS };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/editing-quality.cjs <edicao.json>');
    process.exit(2);
  }
  let edicao;
  try {
    edicao = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`[editing-quality] nao consegui ler/parsear ${file}: ${e.message}`);
    process.exit(2);
  }
  const result = evaluateEdicao(edicao, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
