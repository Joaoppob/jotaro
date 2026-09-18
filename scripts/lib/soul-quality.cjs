#!/usr/bin/env node
'use strict';

/**
 * soul-quality.cjs — gate deterministico do brief de alma (Portao 0).
 *
 * Recebe o caminho de um alma-brief.json (schemas/alma.schema.json) e valida:
 *  - arco emocional completo (desejo/obstaculo/virada/respiro nao-vazios);
 *  - produto/marca AUSENTE da locucao (o sentido vai pra VOZ, nunca a marca);
 *  - sem desfecho funcional regulado na voz nem na virada/respiro;
 *  - guarda regulatoria toda true;
 *  - o gancho (beat de numero mais baixo) e SEMPRE "movimento" -- acao fisica + fala,
 *    nunca still (RAG/prompts/hooks-de-movimento.md);
 *  - disciplina de render nos beats restantes: movimento e minoria motivada
 *    (<= floor(total_sem_o_gancho/2)).
 *
 * Saida: { ok, erros:[], avisos:[] } no stdout. Exit 0 ok / 1 reprova / 2 uso.
 */

const fs = require('fs');

// Tokens de produto/marca proibidos na voz (case-insensitive). O sentido vai
// pra VOZ, nunca a marca: a locucao jamais nomeia o produto.
const PRODUTO_TOKENS = ['example brand', 'fitbar'];

// Termos funcionais regulados — nao podem aparecer na voz nem na virada/respiro
// (promessa funcional = desfecho regulado). Lista case-insensitive.
const FUNCIONAL_TOKENS = [
  'desempenho', 'confianca', 'confiança', 'energia', 'ansiedade', 'foco',
  'sono', 'imunidade', 'emagrec', 'cura',
];

const GUARDA_KEYS = [
  'produto_nao_inicia', 'sem_pack_shot', 'produto_nao_a_camera',
  'sem_desfecho_funcional', 'produto_como_aliado',
];

function findToken(texto, tokens) {
  const low = String(texto || '').toLowerCase();
  for (const t of tokens) {
    if (low.includes(t)) return t;
  }
  return null;
}

function evaluateAlma(alma, artifacto = 'inline') {
  const erros = [];
  const avisos = [];

  const ve = (alma && alma.verdade_emocional) || {};
  const locucao = Array.isArray(alma && alma.locucao) ? alma.locucao : [];
  const render = Array.isArray(alma && alma.estrategia_render) ? alma.estrategia_render : [];
  const guarda = (alma && alma.guarda_regulatoria) || {};

  // 1. Arco completo: os 4 campos nao-vazios.
  for (const campo of ['desejo', 'obstaculo', 'virada', 'respiro']) {
    if (!ve[campo] || String(ve[campo]).trim().length === 0) {
      erros.push(`verdade_emocional.${campo}: vazio — o arco precisa de desejo, obstaculo, virada e respiro completos`);
    }
  }

  // 2. Produto/marca ausente da locucao. Mensagem EXATA exigida.
  for (let i = 0; i < locucao.length; i++) {
    const token = findToken(locucao[i] && locucao[i].texto, PRODUTO_TOKENS);
    if (token) {
      erros.push(`locucao[${i}]: o produto nao pode ser nomeado na voz (token "${token}"); o sentido vai pra VOZ, nunca a marca`);
    }
  }

  // 3. Sem desfecho funcional na voz nem na virada/respiro.
  for (let i = 0; i < locucao.length; i++) {
    const token = findToken(locucao[i] && locucao[i].texto, FUNCIONAL_TOKENS);
    if (token) {
      erros.push(`locucao[${i}]: termo funcional regulado na voz (token "${token}"); sem desfecho funcional — o sentido e emocional, nao uma promessa`);
    }
  }
  for (const campo of ['virada', 'respiro']) {
    const token = findToken(ve[campo], FUNCIONAL_TOKENS);
    if (token) {
      erros.push(`verdade_emocional.${campo}: termo funcional regulado (token "${token}"); a virada e interna da personagem, nao um desfecho funcional`);
    }
  }

  // 4. Guarda regulatoria toda true.
  for (const k of GUARDA_KEYS) {
    if (guarda[k] !== true) {
      erros.push(`guarda_regulatoria.${k}: deve ser true (esta ${JSON.stringify(guarda[k])})`);
    }
  }

  // 5. O gancho (beat de numero mais baixo) e SEMPRE movimento -- acao fisica +
  // fala, nunca frame parado e mudo (RAG/prompts/hooks-de-movimento.md). Ele fica
  // FORA da conta de disciplina de still: entre os beats restantes, movimento
  // continua minoria motivada (<= metade).
  if (render.length > 0) {
    const beatsNumericos = render
      .map((r) => (r && Number.isFinite(r.beat) ? r.beat : null))
      .filter((b) => b !== null);
    const beatGancho = beatsNumericos.length > 0 ? Math.min(...beatsNumericos) : null;
    const gancho = beatGancho !== null ? render.find((r) => r && r.beat === beatGancho) : null;

    if (gancho && gancho.modo !== 'movimento') {
      erros.push(`estrategia_render: o beat do gancho (beat ${beatGancho}) tem que ser "movimento" -- o gancho e sempre acao fisica + fala, nunca still (RAG/prompts/hooks-de-movimento.md)`);
    }

    const resto = beatGancho !== null ? render.filter((r) => r && r.beat !== beatGancho) : render;
    const totalResto = resto.length;
    const movimentoResto = resto.filter((r) => r && r.modo === 'movimento').length;
    if (totalResto > 0 && movimentoResto > Math.floor(totalResto / 2)) {
      erros.push(`estrategia_render: movimento (${movimentoResto}) nao pode exceder metade dos beats depois do gancho (${totalResto}); movimento e minoria motivada`);
    }
  }

  return {
    artifacto,
    ok: erros.length === 0,
    erros,
    avisos,
  };
}

module.exports = { evaluateAlma };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/soul-quality.cjs <alma-brief.json>');
    process.exit(2);
  }
  let alma;
  try {
    alma = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`[soul-quality] nao consegui ler/parsear ${file}: ${e.message}`);
    process.exit(2);
  }
  const result = evaluateAlma(alma, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
