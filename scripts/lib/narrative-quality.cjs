#!/usr/bin/env node
'use strict';

const fs = require('fs');

const BAD_HOOK_TERMS = /\b(logo|fade|black|title card|introducing|welcome|corporate intro)\b/i;
const HOOK_TERMS = /\b(hook|gancho|interrupt|reveal|pattern|opener|mid-action)\b/i;
const CLIMAX_TAGS = /\b(climax|payoff|reveal|pico|transformacao|resultado|twist|virada)\b/i;
const CTA_TAGS = /\b(cta|fechamento|closing|end|final|call.to.action|encerramento)\b/i;

// 0.7: le o prompt-forge (schemas/prompt-forge.schema.json). Cada shot traz `beat`
// (funcao narrativa: gancho/desenvolvimento/climax/cta) e `descricao`; a duracao alvo
// vem de `duracao_seg` no topo. Como os shots nao carregam janela de tempo propria,
// derivamos a posicao de cada shot dividindo a duracao igualmente entre eles — o
// suficiente para posicionar o climax (~70%) sem inventar timing por shot.
function evaluateShotlist(promptForge, artifacto = 'inline') {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];

  const errors = [];
  const warnings = [];
  const totalDuration = (promptForge && promptForge.duracao_seg) || 0;

  if (shots.length === 0) {
    return {
      artifacto,
      ok: true,
      score: 100,
      errors,
      warnings: ['prompt-forge sem shots para avaliar narrativa'],
      scenes: [],
    };
  }

  let score = 100;

  // beat + descricao formam o texto avaliavel de cada shot.
  const beatText = (s) => (String(s.beat || '') + ' ' + String(s.descricao || '')).toLowerCase();

  // 1. Hook check: primeiro shot nao pode abrir com logo/fade
  const first = shots[0];
  const firstText = beatText(first);
  if (BAD_HOOK_TERMS.test(firstText)) {
    errors.push(`shot ${first.n}: abertura com logo/fade/black/title card — troque por hook visual (interrupt/reveal/mid-action no frame 1)`);
    score -= 25;
  }
  if (!HOOK_TERMS.test(String(first.beat || '').toLowerCase()) && !CLIMAX_TAGS.test(firstText)) {
    warnings.push(`shot ${first.n}: primeiro shot nao tem marcacao explicita de hook/gancho no beat`);
    score -= 8;
  }

  // 2. Beat variety: minimo 2 beats distintos para ter arco
  const allBeats = shots.map((s) => String(s.beat || '').toLowerCase()).filter(Boolean);
  const uniqueBeats = new Set(allBeats);
  if (uniqueBeats.size < 2 && shots.length >= 2) {
    errors.push('prompt-forge sem arco narrativo: todos os shots tem o mesmo beat');
    score -= 20;
  }
  if (uniqueBeats.size === 1) {
    warnings.push('prompt-forge de shot unico/beat unico — narrativa minima, ok para ads ultra-curtos');
    score -= 5;
  }

  // 3. Climax positioning: climax/payoff deve cair a ~70% da duracao. Posicao do
  // shot i = (i / n) da timeline (inicio da janela igualmente dividida).
  const n = shots.length;
  let climaxIdx = -1;
  for (let i = 0; i < n; i++) {
    if (CLIMAX_TAGS.test(String(shots[i].beat || '').toLowerCase())) { climaxIdx = i; break; }
  }
  if (climaxIdx >= 0) {
    const ratio = climaxIdx / n; // fracao da timeline onde o climax comeca
    if (ratio >= 0.80) {
      errors.push(`climax no shot ${shots[climaxIdx].n} cai a ~${Math.round(ratio * 100)}% da timeline (ideal ~70%); tarde demais, viewer ja abandonou`);
      score -= 25;
    } else if (ratio < 0.20 && n >= 3) {
      warnings.push(`climax muito cedo (~${Math.round(ratio * 100)}%); considere adiar para ~70% com mais construcao`);
      score -= 10;
    }
  } else if (n >= 4) {
    warnings.push('prompt-forge com 4+ shots sem beat de climax/payoff/virada explicito');
    score -= 8;
  }

  // 4. CTA: deve existir (ultimo shot ou algum beat de fechamento). Excecao: quando
  // este prompt-forge e uma parte NAO-FINAL de um video dividido (continuidade.parte
  // < continuidade.total_partes), o job termina de proposito em suspenso — o CTA real
  // so vive na ultima parte. Cobrar CTA aqui puniria exatamente o comportamento certo
  // (ver RAG/prompts/producao-higgsfield-mcp.md §2b).
  const continuidade = promptForge && promptForge.continuidade;
  const isNonFinalPart = !!(continuidade && Number(continuidade.parte) < Number(continuidade.total_partes));
  const last = shots[n - 1];
  const hasCta = CTA_TAGS.test(String(last.beat || '').toLowerCase())
    || shots.some((s) => CTA_TAGS.test(String(s.beat || '').toLowerCase()));
  if (!hasCta && n >= 2 && !isNonFinalPart) {
    errors.push('prompt-forge sem shot de CTA/fechamento — todo reel precisa de um beat de call-to-action no fim');
    score -= 20;
  } else if (!hasCta && isNonFinalPart) {
    warnings.push(`parte ${continuidade.parte}/${continuidade.total_partes} de video dividido, termina suspensa de proposito — CTA fica pra parte final, gate nao cobra aqui`);
  }

  // 5. Shot count sanity
  if (n > 10) {
    warnings.push(`prompt-forge com ${n} shots — muitos para ad curto; considere condensar`);
    score -= 5;
  }

  // 6. Duracao coherence: media por shot deve ficar em short-form (2-6s)
  if (totalDuration > 0) {
    const avg = totalDuration / n;
    if (avg < 1) {
      warnings.push(`media de ${avg.toFixed(1)}s por shot — cortes curtos demais para ${totalDuration}s em ${n} shots`);
      score -= 5;
    } else if (avg > 8) {
      warnings.push(`media de ${avg.toFixed(1)}s por shot — longa para short-form; considere mais shots ou clipe mais curto`);
      score -= 5;
    }
  }

  return {
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    scenes: shots.map((s) => ({ n: s.n, beat: s.beat })),
    generation_scenes: n,
    total_duration: totalDuration,
  };
}

module.exports = { evaluateShotlist };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/narrative-quality.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
