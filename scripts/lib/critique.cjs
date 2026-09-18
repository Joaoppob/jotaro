#!/usr/bin/env node
'use strict';

const fs = require('fs');

const ANTI_IA_IDS = new Set(['C8', 'C9', 'C10', 'C11']);
const GATE_LIMIAR = 20;

const GROUP_WEIGHTS = {
  anti_ia: 0.30,
  luz_cor: 0.25,
  composicao_camera: 0.15,
  ad_vertical: 0.15,
  arte_sujeito_coerencia: 0.15,
};

const QUALITY_WORDS = [
  '8k',
  'ultra realistic',
  'ultra-realistic',
  'photoreal',
  'photorealistic',
  'masterpiece',
  'best quality',
  'award-winning',
  'cinematic',
  'supersaturated',
];

const STOPLIST = new Set([
  'same', 'from', 'the', 'with', 'and', 'character', 'reference', 'images',
  'image', 'style', 'colors', 'color', 'frame', 'vertical', 'mobile',
  'premium', 'lifestyle', 'product', 'photography', 'modern', 'clean',
  'brand', 'identity', 'warm', 'cool', 'palette',
]);

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function lower(s) {
  return String(s || '').toLowerCase();
}

function sceneText(cena) {
  return [
    cena.tag,
    cena.intencao,
    cena.prompt,
    JSON.stringify(cena.cinematografia || {}),
    JSON.stringify(cena.anti_ia || {}),
  ].join(' ');
}

function scenePenaltyText(cena) {
  return [
    cena.tag,
    cena.intencao,
    cena.prompt,
    JSON.stringify(cena.cinematografia || {}),
  ].join(' ');
}

function hasAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

// Movimentos de camera nomeados (eco do dp-quality) — usado para checar se cada shot
// declara movimento em shots[].movimento_camera.
const CAMERA_MOVES = [
  'static', 'locked-off', 'locked off', 'push-in', 'push in', 'dolly', 'track',
  'tracking', 'pan', 'tilt', 'orbit', 'arc', 'crane', 'pullback', 'handheld',
  'gimbal', 'whip pan', 'whip-pan', 'zoom', 'drift', 'hold',
];

function cameraMoveHits(text) {
  const t = lower(text);
  return CAMERA_MOVES.filter((move) => t.includes(move));
}

function countQualityWords(text) {
  const t = lower(text);
  return QUALITY_WORDS.filter((w) => t.includes(w)).length;
}

function distinctiveTokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => /^[a-z]+$/.test(w) && w.length >= 4 && !STOPLIST.has(w));
}

function ratioScore(cenas, predicate, emptyScore = 0) {
  if (!Array.isArray(cenas) || cenas.length === 0) return emptyScore;
  const hits = cenas.filter(predicate).length;
  return clamp((hits / cenas.length) * 100);
}

function scoreWithPenalty(base, penalty) {
  return clamp(base - penalty);
}

function criterio(id, grupo, score, evidencia, acao) {
  return {
    id,
    grupo,
    score: clamp(score),
    evidencia,
    acao,
  };
}

function parseTempo(tempo) {
  const m = String(tempo || '').match(/^([0-9]+)-([0-9]+)$/);
  if (!m) return null;
  return { start: Number(m[1]), end: Number(m[2]) };
}

function weightedScore(criterios) {
  let total = 0;
  for (const [grupo, peso] of Object.entries(GROUP_WEIGHTS)) {
    const subset = criterios.filter((c) => c.grupo === grupo);
    if (subset.length === 0) continue;
    const avg = subset.reduce((sum, c) => sum + c.score, 0) / subset.length;
    total += avg * peso;
  }
  return clamp(total);
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  // 0.7: o artefato e o prompt-forge. Os proxies da rubrica nivel-100 rodam sobre a
  // PROSA UNICA (`prompt`) + a estrutura `shots[]` (beat/mood/movimento_camera). A
  // REGRA DE GATE e preservada: se qualquer anti-IA (C8-C11) <= GATE_LIMIAR, reprova.
  const prompt = String((promptForge && promptForge.prompt) || '');
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  if (prompt.trim().length === 0) {
    return {
      artifacto,
      etapa: 'pre-credito',
      score_ponderado: 0,
      gate_aprovado: false,
      criterios: [],
      gate_anti_ia: { limiar: GATE_LIMIAR, criterios: ['C8', 'C9', 'C10', 'C11'], reprovado_por: ['C8', 'C9', 'C10', 'C11'] },
      parecer: 'prompt-forge sem prosa (campo prompt): nada a criticar, mas nao ha o que gerar — reprovado.',
    };
  }

  const allText = lower([prompt, JSON.stringify(shots)].join(' '));
  const penaltyText = allText;
  const qualityHits = countQualityWords(allText);
  const hasElement = !!(promptForge && promptForge.element_id && String(promptForge.element_id).trim());
  const hasPersonagem = !!(promptForge && promptForge.personagem && String(promptForge.personagem).trim());
  const distinct = distinctiveTokens(prompt);

  // score binario por proxy: presente => alto, ausente => baixo. Sobre prosa unica.
  const proxy = (patterns, hi = 85, lo = 30) => (hasAny(allText, patterns) ? hi : lo);

  const c1 = proxy([
    /\bside key\b/, /\bkey light\b/, /\bwindow light\b/, /\bnatural light\b/, /\bnatural daylight\b/,
    /\bframe left\b/, /\bframe right\b/, /\bgolden hour\b/, /\bpractical light\b/, /\bindoor gym light\b/,
    /\bsoft natural light/,
  ]);

  const c2 = scoreWithPenalty(proxy([
    /\bside\b/, /\blateral\b/, /\bbacklight\b/, /\brim\b/, /\bshadow\b/,
    /\bcontact shadows\b/, /\bseparation\b/, /\bchiaroscuro\b/, /\bsoft\b/, /\bmirror reflection/,
  ]), /\bflat frontal\b/.test(allText) ? 40 : 0);

  const c3 = proxy([
    /\bcontrast\b/, /\bshadow\b/, /\blow-key\b/, /\bhigh-key\b/,
    /\bdark\b/, /\bbright\b/, /\bhighlight\b/, /\bsoft\b/,
  ], 80, 40);

  const c4 = scoreWithPenalty(proxy([
    /\bpalette\b/, /\bpaleta\b/, /\bamber\b/, /\bviolet\b/, /\bwarm\b/,
    /\bcool\b/, /\bgrading\b/, /\bgrade\b/, /\bsaturation\b/, /\bpink accents?\b/,
    /\bskin tones?\b/, /\btones?\b/,
  ], 80, 30), allText.includes('supersaturated') ? 30 : 0);

  const c5 = proxy([
    /\bdepth\b/, /\bforeground\b/, /\bbackground\b/, /\blayered\b/,
    /\blayers\b/, /\bparallax\b/, /\bshallow\b/, /\bdeep\b/, /\bmacro\b/, /\bclose-?up\b/,
  ], 80, 35);

  const c6 = proxy([
    /\bcentral\b/, /\bcentered\b/, /\bnegative space\b/, /\bsafe\b/,
    /\bvertical\b/, /9:16/, /\bleading\b/, /\bframing\b/, /\bcomposition\b/,
  ], 80, 35);

  // movimento de camera: presente na prosa OU declarado em todos os shots
  const shotsComMov = shots.filter((s) => cameraMoveHits(s.movimento_camera).length > 0).length;
  const cameraDeclared = (hasAny(allText, [
    /\bpush-?in\b/, /\breveal\b/, /\bhandheld\b/, /\bmotivated\b/, /\btracking\b/,
    /\bpan\b/, /\bzoom\b/, /\bstatic\b/, /\bgimbal\b/, /\bcamera\b/,
  ]) || (shots.length > 0 && shotsComMov === shots.length)) ? 85 : 40;
  const c7 = scoreWithPenalty(cameraDeclared, /\brandom (camera )?(drift|motion)\b/.test(penaltyText) ? 55 : 0);

  let c8 = proxy([
    /\bgrounded\b/, /\bcontact shadows\b/, /\bphysical weight\b/, /\bweight\b/,
    /\binertia\b/, /\brealistic\b/, /\bnatural\b/, /\bnatural movement\b/, /\brealistic movement\b/,
  ], 70, 40);
  // Tells reais de fisica quebrada. NAO penalizamos "unrealistic movement" — no 0.7
  // esse termo aparece justamente no bloco AVOID (o prompt PROIBINDO o tell), o que e
  // bom. Penalizamos so afirmacoes de flutuacao/movimento aleatorio nao-negadas.
  if (/\bfloating\b|\bfloats\b|\brandom motion\b|\bphysics breaking\b/.test(penaltyText)
      && !/\b(avoid|evitar|no|sem)\b[^.]*\b(floating|float|random motion|physics)\b/.test(penaltyText)) {
    c8 = Math.min(c8, 15);
  }

  let c9 = proxy([
    /\btexture\b/, /\bmatte\b/, /\bfabric\b/, /\bpores\b/, /\bfibers?\b/,
    /\bmaterial\b/, /\bsurface\b/, /\bgrain\b/, /\bscuff\b/, /\brealistic textures?\b/, /\bfresh skin/,
  ], 70, 35);
  // idem c8: so penaliza plastic/waxy quando NAO esta num bloco de avoid/no.
  if (/\bplastic\b|\bwaxy\b|\bover-smoothed\b/.test(penaltyText)
      && !/\b(avoid|evitar|no|sem)\b[^.]*\b(plastic|waxy|over-smoothed)\b/.test(penaltyText)) {
    c9 = Math.min(c9, 15);
  }
  if (qualityHits >= 3) c9 = Math.min(c9, 20);

  // Identidade pela referencia (Element), nao por trait-carry textual.
  let c10 = (hasElement || !hasPersonagem) ? 80 : 40;
  if (/\bmorph|garbled|wrong hands|floating hands|flicker\b/.test(penaltyText)
      && !/\b(avoid|evitar|no|sem)\b[^.]*\b(morph|garbled|wrong hands|floating hands|flicker)\b/.test(penaltyText)) {
    c10 = Math.min(c10, 15);
  }
  if (qualityHits >= 3 && !hasElement) c10 = Math.min(c10, 20);

  // Continuidade: geracao UNICA (um job) => coerencia temporal e inerente ao modelo,
  // reforcada pelo Element. So cai se a prosa admitir incoerencia explicita.
  let c11 = hasElement || !hasPersonagem ? 75 : 55;
  if (/\beach cut.*other world\b|\binconsistent\b|\bmorph\b/.test(allText)) c11 = Math.min(c11, 25);

  // Hook no primeiro shot / primeiro frame.
  const first = shots[0] || {};
  const firstBeat = lower(first.beat || '');
  const firstText = lower((first.beat || '') + ' ' + (first.descricao || ''));
  let c12 = /hook|gancho/.test(firstBeat) ? 80 : 45;
  if (/\blogo intro|slow logo|fade|black frame|title card/.test(firstText)) c12 = 15;
  if (/\bframe 1\b|\bfirst frame\b|\breveal\b|\bmid-action\b|0-4 seconds/.test(allText)) c12 = Math.max(c12, 85);

  // Micro-pacing: variedade de beats entre shots + numero de shots.
  const variedBeats = new Set(shots.map((s) => s.beat).filter(Boolean)).size;
  const c13 = clamp(35 + Math.min(45, variedBeats * 15) + (shots.length >= 2 ? 10 : 0));

  let c14 = 60;
  if (/\bclean\b|\buncluttered\b|\bempty space\b|\brestrict|\bclean gym\b|\bclean top\b/.test(allText)) c14 += 20;
  if (/\brandom props\b|\bcluttered\b|\btoo many\b|\bmessy background\b/.test(allText) && !/\bavoid\b|\bno messy\b/.test(allText)) c14 -= 35;
  c14 = clamp(c14);

  let c15 = 45;
  if (distinct.length >= 10) c15 += 25;
  if (/\bemotion|nuance|presence|confident|energetic|candid|relaxed|spontaneous|friendly|aspirational\b/.test(allText)) c15 += 20;
  if (/\bgeneric character\b|\bsoulless\b|\buncanny\b/.test(allText)) c15 -= 35;
  c15 = clamp(c15);

  const c16 = scoreWithPenalty((c1 + c4 + c6 + c10 + c12 + c13 + c14) / 7, qualityHits * 5);
  const cenas = shots; // manter compat com os nomes usados abaixo (evidencias)

  const criterios = [
    criterio('C1', 'luz_cor', c1, 'Proxy textual: fonte e direcao de luz declaradas por cena.', c1 >= 70 ? 'manter' : 'nomear fonte de luz'),
    criterio('C2', 'luz_cor', c2, 'Proxy textual: luz modela o sujeito com sombra, side/back/rim ou separacao.', c2 >= 70 ? 'manter' : 'evitar luz frontal chapada'),
    criterio('C3', 'luz_cor', c3, 'Proxy textual: contraste e relacao highlight/shadow aparecem no plano.', c3 >= 70 ? 'manter' : 'declarar contraste'),
    criterio('C4', 'luz_cor', c4, 'Proxy textual: paleta ou grade de cor aparece sem saturacao plastica.', c4 >= 70 ? 'manter' : 'nomear paleta/grade'),
    criterio('C5', 'composicao_camera', c5, 'Proxy textual: profundidade, camadas, foreground/background ou DoF foram declarados.', c5 >= 70 ? 'manter' : 'declarar profundidade'),
    criterio('C6', 'composicao_camera', c6, 'Proxy textual: composicao vertical, safe area ou negative space foram declarados.', c6 >= 70 ? 'manter' : 'declarar composicao'),
    criterio('C7', 'composicao_camera', c7, 'Proxy textual: movimento de camera e motivacao aparecem sem drift aleatorio.', c7 >= 70 ? 'manter' : 'usar um movimento motivado'),
    criterio('C8', 'anti_ia', c8, 'Proxy textual: peso fisico, sombras de contato e groundedness defendem fisica.', c8 > GATE_LIMIAR ? 'ver pos-render' : 'reprovar antes do credito'),
    criterio('C9', 'anti_ia', c9, 'Proxy textual: textura/materialidade aparece e quality-words nao dominam.', c9 > GATE_LIMIAR ? 'ver pos-render' : 'reprovar antes do credito'),
    criterio('C10', 'anti_ia', c10, 'Proxy textual: refs e anchor com tracos defendem estabilidade temporal.', c10 > GATE_LIMIAR ? 'ver pos-render' : 'reprovar antes do credito'),
    criterio('C11', 'anti_ia', c11, 'Proxy textual: continuidade depende de refs, anchor e carry entre cenas.', c11 > GATE_LIMIAR ? 'ver pos-render' : 'reprovar antes do credito'),
    criterio('C12', 'ad_vertical', c12, 'Proxy textual: primeira cena carrega hook no frame 1 sem logo/fade lento.', c12 >= 70 ? 'manter' : 'abrir com interrupt/reveal'),
    criterio('C13', 'ad_vertical', c13, 'Proxy textual: timing curto e tags variadas indicam micro-pacing.', c13 >= 70 ? 'manter' : 'apertar cortes'),
    criterio('C14', 'arte_sujeito_coerencia', c14, 'Proxy textual: direcao de arte evita ruido e preserva espaco limpo.', c14 >= 70 ? 'manter' : 'restringir props'),
    criterio('C15', 'arte_sujeito_coerencia', c15, 'Proxy textual: casting/sujeito tem tracos e presenca, nao generico.', c15 >= 70 ? 'manter' : 'dar nuance ao sujeito'),
    criterio('C16', 'arte_sujeito_coerencia', c16, 'Proxy textual: coerencia global agrega luz, cor, composicao, anchor e hook.', c16 >= 70 ? 'manter' : 'reduzir incoerencias'),
  ];

  const reprovadoPor = criterios
    .filter((c) => ANTI_IA_IDS.has(c.id) && c.score <= GATE_LIMIAR)
    .map((c) => c.id);
  const score = weightedScore(criterios);

  return {
    artifacto,
    etapa: 'plano',
    score_ponderado: score,
    gate_aprovado: reprovadoPor.length === 0,
    criterios,
    gate_anti_ia: {
      limiar: GATE_LIMIAR,
      criterios: ['C8', 'C9', 'C10', 'C11'],
      reprovado_por: reprovadoPor,
    },
    parecer: reprovadoPor.length
      ? `Reprovado antes de gastar credito: tells textuais em ${reprovadoPor.join(', ')}.`
      : `Aprovado como plano textual com score ${score}; gate anti-IA real ainda depende do render.`,
  };
}

module.exports = { evaluateShotlist };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/critique.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  process.stdout.write(`${JSON.stringify(evaluateShotlist(promptForge, file), null, 2)}\n`);
}
