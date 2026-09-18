'use strict';

const fs = require('fs');
const path = require('path');
const CHAIN = require('./specialist-chain.cjs');

// Vocabulario real de campos por etapa: nomes usados nos exemplos de cada agente
// (current_draft.*, ver .claude/agents/<etapa>.md) e nomes do schema final
// (schemas/prompt-manifest.schema.json shots[].camera/montagem/realismo/audio).
// `cannot` de cada etapa e derivado automaticamente como a uniao dos `can` de
// todas as OUTRAS etapas — assim um campo novo adicionado ao vocabulario de uma
// etapa vira automaticamente proibido pra todas as demais, sem exigir manutencao
// manual de listas paralelas que podem divergir (a causa do bug original: um campo
// como "shot_size"/"angulo" nao continha a palavra solta "camera" e passava batido).
const STAGE_OWNED_FIELDS = {
  historia: ['historia', 'emocao', 'tensao', 'virada', 'respiro', 'intencao', 'verdade_emocional'],
  mundo: ['mundo', 'world', 'mundo_md', 'lugar', 'lugares', 'cena', 'geografia', 'props',
    'luz_ambiente', 'textura_mundo', 'continuidade', 'scene_block_canonico', 'som_do_lugar'],
  enredo: ['enredo', 'beats', 'beat', 'ordem', 'causalidade', 'payoff', 'cta', 'cta_flow', 'acontecimentos'],
  camera: ['camera', 'shot_size', 'angle', 'angulo', 'lente', 'lens_or_look',
    'movimento_camera', 'movimento', 'movement', 'enquadramento', 'look'],
  montagem: ['montagem', 'duracao', 'duration', 'corte', 'cut_style', 'pacing', 'transicao', 'ritmo'],
  realismo: ['realismo', 'realismo_global', 'textura', 'motion_blur', 'imperfeicao', 'imperfections', 'material', 'anti_ia'],
  audio: ['audio', 'musica', 'music', 'fala', 'dialogue', 'silencio', 'ambiente_som', 'ambience', 'legibilidade', 'ritmo_audio'],
};

const SCOPE_FILES = {
  historia: '04-historia.json',
  mundo: '05-mundo.json',
  enredo: '06-enredo.json',
  camera: '07-camera.json',
  montagem: '08-montagem.json',
  realismo: '09-realismo.json',
  audio: '10-audio.json',
};

const SCOPE_RULES = {};
for (const stage of Object.keys(STAGE_OWNED_FIELDS)) {
  const cannot = [];
  for (const other of Object.keys(STAGE_OWNED_FIELDS)) {
    if (other !== stage) cannot.push(...STAGE_OWNED_FIELDS[other]);
  }
  SCOPE_RULES[stage] = { can: STAGE_OWNED_FIELDS[stage], cannot, file: SCOPE_FILES[stage] };
}

function fieldSegments(field) {
  return String(field).toLowerCase().split(/[.[\]]+/).filter(Boolean);
}

function outOfScopeFields(stage, camposAlterados) {
  const rules = SCOPE_RULES[stage];
  if (!rules) return [];
  return (camposAlterados || []).filter((f) => {
    const segs = fieldSegments(f);
    const hitsCannot = segs.some((s) => rules.cannot.includes(s));
    const hitsCan = segs.some((s) => rules.can.includes(s));
    return hitsCannot && !hitsCan;
  });
}

function validateReview(review) {
  const errors = [];
  const warnings = [];
  if (!review) return { ok: false, errors: ['review ausente'], warnings: [] };
  if (!review.stage || !CHAIN.order().includes(review.stage)) {
    errors.push(`stage invalido ou ausente: ${review.stage}`);
    return { ok: false, errors, warnings };
  }
  if (!review.generation_id || review.generation_id.length < 10) {
    errors.push('generation_id ausente ou muito curto');
  }
  if (typeof review.ok !== 'boolean') {
    errors.push('campo ok deve ser booleano');
  }
  if (!review.motivo || review.motivo.length < 10) {
    errors.push('motivo ausente ou muito curto (min 10 chars)');
  }
  if (!review.draft_revisado || review.draft_revisado.length < 1) {
    errors.push('draft_revisado ausente');
  }
  if (review.ajuste_aplicado && !review.campos_alterados) {
    warnings.push('ajuste_aplicado=true mas campos_alterados vazio');
  }
  const scopeViolations = outOfScopeFields(review.stage, review.campos_alterados);
  if (scopeViolations.length > 0) {
    errors.push(`campos_alterados fora do escopo de ${review.stage}: ${scopeViolations.join(', ')}`);
  }
  if (!review.handoff || !review.handoff.proxima_etapa) {
    errors.push('handoff.proxima_etapa ausente');
  }
  return { ok: errors.length === 0, errors, warnings };
}

function validateChain(reviews) {
  if (!reviews || reviews.length === 0) return { ok: false, errors: ['nenhuma review na cadeia'] };
  const order = CHAIN.order();
  const stagesSeen = [];
  const errors = [];
  let interrupted = false;
  if (reviews[0].stage !== order[0]) {
    errors.push(`review[0] ${reviews[0].stage || '?'}: cadeia deve comecar em '${order[0]}', recebido '${reviews[0].stage || '?'}'`);
  }
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    const base = `review[${i}] ${r.stage || '?'}:`;
    if (!r.stage) { errors.push(`${base} stage ausente`); continue; }
    if (stagesSeen.includes(r.stage)) {
      errors.push(`${base} stage repetido`);
    }
    stagesSeen.push(r.stage);
    if (!r.ok) {
      errors.push(`${base} ok=false, cadeia interrompida`);
      interrupted = true;
      break;
    }
    if (i > 0) {
      const expected = CHAIN.nextStage(reviews[i - 1].stage);
      if (r.stage !== expected) {
        errors.push(`${base} esperado ${expected}, recebido ${r.stage}`);
      }
    }
    const result = validateReview(r);
    if (!result.ok) {
      result.errors.forEach((e) => errors.push(`${base} ${e}`));
    }
  }
  if (!interrupted) {
    const last = reviews[reviews.length - 1];
    const lastStage = order[order.length - 1];
    if (reviews.length !== order.length || (last && last.stage !== lastStage)) {
      errors.push(`cadeia incompleta: termina em '${last ? last.stage || '?' : '?'}' apos ${reviews.length} etapa(s), esperado terminar em '${lastStage}' apos ${order.length} etapa(s)`);
    }
  }
  return { ok: errors.length === 0, errors };
}

const SIGNOFF = { SCOPE_RULES, outOfScopeFields, validateReview, validateChain };
module.exports = SIGNOFF;
