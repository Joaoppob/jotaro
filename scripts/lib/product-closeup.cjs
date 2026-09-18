#!/usr/bin/env node
'use strict';

/**
 * product-closeup.cjs — gate do fechamento com produto (Wave M).
 *
 * Regra do produto (run real de producao, 2026-07-01): quando o fechamento do anuncio mostra o
 * produto, a camera tem que ASSENTAR PERTO dele -- close-up ou push-in -- nunca ABRIR o plano
 * (zoom-out/pull-back/reveal do ambiente) POR ACIDENTE. Um zoom-out no fechamento rouba
 * exatamente o momento que devia dar peso ao produto: a ultima coisa que o espectador ve
 * encolhe na tela em vez de ganhar destaque. Aconteceu de verdade:
 * `movimento_camera: "...slow zoom-out settling into a held wide frame..."` com
 * `tamanho_plano: "wide"` no shot final de um prompt-forge real, sem nenhuma intencao narrativa
 * por tras -- so um plano que abriu.
 *
 * Este gate SO ativa quando a ULTIMA shot do prompt-forge menciona produto na sua propria
 * `descricao` (heuristica por palavra-chave PT/EN: produto, pote, jar, package, embalagem,
 * goma, gummy, gummies, frasco). Projetos sem produto fisico no fechamento (ex.: ExampleHero,
 * personagem pura) ficam no-op, sem falso-positivo.
 *
 * EXCECAO — bookend intencional (2026-07-03): um roteiro pode terminar largo DE PROPOSITO,
 * espelhando a abertura (ex.: "camera se afasta, termina com world building" quando o shot 1
 * tambem abriu num plano largo estabelecendo o cenario). Isso nao e o bug original -- e uma
 * estrutura narrativa valida (o video "fecha o circulo" visualmente). O gate agora distingue os
 * dois casos: se o PRIMEIRO shot tambem e um plano aberto, o fechamento aberto e tratado como
 * bookend (warning, nao erro) em vez de reprovar de cara. Se o primeiro shot NAO e aberto (o
 * caso comum -- o video comecou fechado/medio), um fechamento aberto com produto continua
 * reprovando: sem plano largo na abertura pra justificar, um zoom-out no fim e o bug original,
 * nao uma escolha.
 *
 * Quando ativo, reprova (fora do caso bookend) se:
 *   - `movimento_camera` contem um padrao de "abrir o plano" (zoom out, pull back, dolly out,
 *     reveal do ambiente, widen, steps/backs away); OU
 *   - `tamanho_plano` e um plano aberto (wide, full, establishing, extreme-wide) -- mesmo sem
 *     zoom-out explicito no texto, terminar aberto no produto ja falha o proposito.
 *
 * Uso: node scripts/lib/product-closeup.cjs <prompt-forge.json>   (exit 1 se reprova)
 */

const fs = require('fs');

const PRODUCT_HINT_RE = /produto|\bpote\b|\bjar\b|package|embalagem|\bgoma\b|gummy|gummies|\bfrasco\b/i;

const OPEN_CAMERA_RE = /zoom[\s-]?out|zooms?\s+out|zooming out|pull(?:s|ing)?\s+back|pulling away|dolly(?:s|ing)?\s+out|widen(?:s|ing)?|reveal(?:s|ing)?\s+(?:the |a |her )?(?:full |whole |entire )?room|reveals? the (?:full |whole )?(?:room|space)|steps?\s+back|backs?\s+away/i;

const OPEN_FRAME_SIZES = new Set(['wide', 'full', 'establishing', 'extreme-wide', 'extreme wide', 'wide shot']);

function lower(text) {
  return String(text || '').toLowerCase();
}

function lastShot(promptForge) {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  if (shots.length === 0) return null;
  return shots[shots.length - 1];
}

function firstShot(promptForge) {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  if (shots.length === 0) return null;
  return shots[0];
}

function isOpenFrame(tamanho) {
  return OPEN_FRAME_SIZES.has(lower(tamanho));
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  const errors = [];
  const warnings = [];
  const shot = lastShot(promptForge);

  if (!shot) {
    return { artifacto, ok: true, score: 100, errors, warnings: ['prompt-forge sem shots -- gate no-op'], applicable: false };
  }

  const descricao = lower(shot.descricao);
  const hasProduct = PRODUCT_HINT_RE.test(descricao);

  if (!hasProduct) {
    return {
      artifacto,
      ok: true,
      score: 100,
      errors,
      warnings: [`shot final (n=${shot.n}) nao menciona produto na descricao -- gate no-op`],
      applicable: false,
    };
  }

  // Bookend: o video abriu largo tambem? So conta como intencional se ha mais de um shot
  // (senao "abertura" e "fechamento" sao o mesmo shot, o que nao e um bookend de verdade).
  const first = firstShot(promptForge);
  const opensWide = shot !== first && first && isOpenFrame(first.tamanho_plano);

  let score = 100;
  const movimento = lower(shot.movimento_camera);
  const tamanho = lower(shot.tamanho_plano);
  const opensCamera = OPEN_CAMERA_RE.test(movimento);
  const opensFrame = OPEN_FRAME_SIZES.has(tamanho);

  if (opensCamera || opensFrame) {
    if (opensWide) {
      warnings.push(
        `shots[n=${shot.n}] fecha aberto com produto ("${shot.movimento_camera}", ` +
        `"${shot.tamanho_plano}"), mas o shot 1 ("${first.tamanho_plano}") tambem abriu largo -- ` +
        `tratado como bookend intencional (a camera "fecha o circulo" visualmente), nao como o ` +
        `bug de zoom-out acidental. Confirme que essa e mesmo a intencao antes de aprovar.`
      );
      score -= 10;
    } else {
      if (opensCamera) {
        errors.push(
          `shots[n=${shot.n}].movimento_camera abre o plano no fechamento do produto ` +
          `("${shot.movimento_camera}") -- o fechamento tem que ASSENTAR perto do produto ` +
          `(close-up/push-in), nunca zoom-out/pull-back/reveal do ambiente. Se isso for um ` +
          `bookend intencional, o shot 1 precisa abrir largo tambem (hoje: ` +
          `"${first ? first.tamanho_plano : 'sem shot 1'}") -- senao nao ha circulo pra fechar.`
        );
        score -= 45;
      }
      if (opensFrame) {
        errors.push(
          `shots[n=${shot.n}].tamanho_plano="${shot.tamanho_plano}" e um plano aberto no fechamento ` +
          `do produto -- termine em close/medium-close/extreme-close, nao wide/full/establishing. ` +
          `Se isso for um bookend intencional, o shot 1 precisa abrir largo tambem (hoje: ` +
          `"${first ? first.tamanho_plano : 'sem shot 1'}") -- senao nao ha circulo pra fechar.`
        );
        score -= 45;
      }
    }
  }

  return {
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    applicable: true,
    bookend: opensWide && (opensCamera || opensFrame),
    shot_n: shot.n,
  };
}

module.exports = { evaluateShotlist };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/product-closeup.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
