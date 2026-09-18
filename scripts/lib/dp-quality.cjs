#!/usr/bin/env node
'use strict';

const fs = require('fs');

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
  'beautiful',
  'premium colors',
];

const CAMERA_MOVES = [
  'static',
  'locked-off',
  'locked off',
  'push-in',
  'push in',
  'dolly',
  'track',
  'tracking',
  'pan',
  'tilt',
  'orbit',
  'arc',
  'crane',
  'pullback',
  'handheld',
  'gimbal',
  'whip pan',
  'zoom',
];

function lower(value) {
  return String(value || '').toLowerCase();
}

function hasAny(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function countHits(text, patterns) {
  return patterns.filter((p) => p.test(text)).length;
}

function qualityHits(text) {
  const t = lower(text);
  return QUALITY_WORDS.filter((w) => t.includes(w));
}

function cameraMoveHits(text) {
  const t = lower(text);
  return CAMERA_MOVES.filter((move) => t.includes(move));
}

function sceneText(scene) {
  return [
    scene && scene.objetivo_visual,
    scene && scene.frame_1,
    scene && scene.luz,
    scene && scene.composicao,
    scene && scene.camera,
    scene && scene.cor,
    JSON.stringify((scene && scene.anti_ia) || {}),
  ].join(' ');
}

function scoreResult(artifacto, score, errors, warnings, extra) {
  return Object.assign({
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
  }, extra || {});
}

function evaluateDpScene(scene, label) {
  const errors = [];
  const warnings = [];
  let score = 100;

  const text = lower(sceneText(scene));
  const light = lower(scene && scene.luz);
  const composition = lower(scene && scene.composicao);
  const camera = lower(scene && scene.camera);
  const color = lower(scene && scene.cor);
  const frame1 = lower(scene && scene.frame_1);
  const antiAvoid = Array.isArray(scene && scene.anti_ia && scene.anti_ia.evitar)
    ? scene.anti_ia.evitar.join(' ')
    : '';
  const antiFocus = Array.isArray(scene && scene.anti_ia && scene.anti_ia.foco)
    ? scene.anti_ia.foco.join(' ')
    : '';

  const lightHits = countHits(light, [
    /\bmotivated\b|\bmotivada\b|\bpractical\b|\bwindow\b|\bjanela\b|\btungsten\b|\bdaylight\b|\bgolden hour\b|\bneon\b/,
    /\bcamera-left\b|\bcamera right\b|\bframe left\b|\bframe right\b|\blateral\b|\bside\b|\bbacklight\b|\brim\b/,
    /\b[0-9]{4}k\b|\b3200k\b|\b5600k\b|\b6500k\b|\bcontrast\b|\bcontraste\b|\b4:1\b|\b8:1\b/,
    /\bshadow\b|\bsombra\b|\bfalloff\b|\bkey\b|\bfill\b|\brim\b/,
  ]);
  if (lightHits < 3) {
    errors.push(`${label}: luz generica; declare fonte motivada, direcao e contraste/Kelvin`);
    score -= 30;
  }
  if (/\bbeautiful\b|\bgood lighting\b|\bcinematic lighting\b|\bluz bonita\b/.test(light)) {
    errors.push(`${label}: luz usa adjetivo vazio em vez de fonte/direcao`);
    score -= 20;
  }

  const safeComposition = hasAny(composition + ' ' + frame1, [
    /\by=220-1440\b/,
    /\bsafe[- ]?zone\b/,
    /\bmiddle 60%\b/,
    /\bcentral safe\b/,
    /\bfaixa central\b/,
    /\btop and bottom thirds\b/,
    /\btopo\/base\b/,
  ]);
  if (!/9:16/.test(composition + ' ' + frame1) || !safeComposition) {
    errors.push(`${label}: composicao 9:16 sem safe-zone central (ex.: Y=220-1440 ou middle 60%)`);
    score -= 25;
  }

  const moves = cameraMoveHits(camera);
  if (moves.length === 0) {
    errors.push(`${label}: camera sem movimento/estado nomeado`);
    score -= 20;
  }
  const uniqueMoves = new Set(moves);
  if (uniqueMoves.size > 2 && !/\bthen\b|\bdepois\b|\bstart\b/.test(camera)) {
    errors.push(`${label}: camera mistura movimentos demais; use um movimento por shot ou beats sequenciais`);
    score -= 20;
  }
  const forbidsDrift = /\bno random\b.*\bdrift\b|\bno\b.*\bdrift\b|\bsem\b.*\bdrift\b|\bsem\b.*\bflutu/.test(camera);
  if (!forbidsDrift && (/\brandom\b|\baleator/i.test(camera) || /\bdrift\b|\bflutu/.test(camera))) {
    errors.push(`${label}: camera admite drift/flutuacao`);
    score -= 20;
  }

  const colorHits = countHits(color, [
    /\bgrade\b|\bgrading\b|\bemulation\b|\bfilm\b|\banalog\b|\bbleach\b|\bteal\b|\bamber\b|\bcyan\b|\bmagenta\b/,
    /\blifted blacks\b|\b3-8%\b|\bcontrolled highlights\b|\bsaturation controlled\b|\bdessaturad/,
    /\bpalette\b|\bpaleta\b|\bwarm\b|\bcool\b|\bshadows\b|\bhighlights\b/,
  ]);
  if (colorHits < 2) {
    errors.push(`${label}: cor/grading generico; nomeie grade, hierarquia de cor e controle de highlights`);
    score -= 20;
  }

  const antiText = lower(`${antiAvoid} ${antiFocus}`);
  if (!hasAny(antiText, [
    /\bflat\b|\bfrontal\b|\bplastic\b|\bplastica\b|\bplastica\b|\bwaxy\b|\bdrift\b|\bflicker\b|\bmorph\b/,
  ]) || !hasAny(antiText, [
    /\bcontact shadows\b|\bsombras de contato\b|\btexture\b|\btextura\b|\bphysical\b|\bpeso\b|\bstable\b|\bestavel\b/,
  ])) {
    errors.push(`${label}: anti_ia precisa evitar tells concretos e focar fisica/textura/estabilidade`);
    score -= 20;
  }

  const qHits = qualityHits(text);
  if (qHits.length) {
    warnings.push(`${label}: quality-words encontradas: ${qHits.join(', ')}`);
    score -= Math.min(20, qHits.length * 5);
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    moves: Array.from(uniqueMoves),
  };
}

function evaluateCinematography(plan, artifacto = 'cinematografia') {
  const errors = [];
  const warnings = [];
  const cenas = Array.isArray(plan && plan.cenas) ? plan.cenas : [];
  if (!cenas.length) {
    errors.push('cinematografia sem cenas');
    return scoreResult(artifacto, 0, errors, warnings, { scenes: [] });
  }

  const sceneResults = cenas.map((scene) => {
    const label = `cena ${scene && scene.n !== undefined ? scene.n : '?'}`;
    return Object.assign({ n: scene && scene.n }, evaluateDpScene(scene, label));
  });
  for (const result of sceneResults) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }
  const avg = sceneResults.reduce((sum, result) => sum + result.score, 0) / sceneResults.length;
  const global = lower(plan && plan.diretriz_global);
  const hasStyleBlock = /style block|bloco|travado|repetid|coerencia|coerência/.test(global);
  const score = avg - (hasStyleBlock ? 0 : 8);
  if (!hasStyleBlock) warnings.push('diretriz_global nao explicita style block travado para a serie');

  return scoreResult(artifacto, score, errors, warnings, { scenes: sceneResults });
}

// 0.7: o artefato e o prompt-forge. Nao ha mais um bloco `cinematografia` por cena;
// o passe DP agora avalia a PROSA UNICA (`prompt`) somada aos `shots[].movimento_camera`.
// Reprova prosa vaga sem: luz motivada nomeada, composicao/enquadramento (9:16 +
// safe-zone/framing), movimento de camera por shot, cor/grading nomeado, e anti-IA
// concreto (avoid explicito, sem quality-words vazias dominando).
function evaluatePromptDp(promptText, shots, artifacto) {
  const errors = [];
  const warnings = [];
  let score = 100;

  const prompt = lower(promptText);

  // 1. Luz motivada nomeada: fonte/direcao/temperatura, nao "beautiful lighting".
  const lightHits = countHits(prompt, [
    /\bmotivated\b|\bpractical\b|\bwindow light\b|\bnatural light\b|\bnatural daylight\b|\btungsten\b|\bdaylight\b|\bgolden hour\b|\bneon\b|\bindoor gym light\b|\bsoft natural light/,
    /\bcamera-left\b|\bcamera right\b|\bframe left\b|\bframe right\b|\bside light\b|\bbacklight\b|\brim light\b|\bkey light\b|\bfill light\b|\btop light\b/,
    /\b[0-9]{4}k\b|\bcontrast\b|\bsoft\b|\bhard light\b|\bdiffused\b|\bshadow/,
  ]);
  if (lightHits < 2) {
    errors.push('prosa sem luz motivada nomeada: declare fonte (window/practical/daylight), direcao ou qualidade (soft/hard, sombras)');
    score -= 25;
  }
  if (/\bbeautiful lighting\b|\bgood lighting\b|\bcinematic lighting\b|\bluz bonita\b/.test(prompt)) {
    errors.push('luz descrita por adjetivo vazio ("beautiful/cinematic lighting") em vez de fonte/direcao');
    score -= 15;
  }

  // 2. Composicao / enquadramento: 9:16 + framing declarado.
  if (!/9:16|vertical/.test(prompt)) {
    errors.push('prosa sem enquadramento vertical 9:16 declarado');
    score -= 20;
  }
  const framingHits = countHits(prompt, [
    /\bclose-?up\b|\bmedium shot\b|\bwide shot\b|\bframing\b|\benquadramento\b|\bmirror (shot|angle|reflection)\b/,
    /\bover-the-shoulder\b|\bcentered\b|\bsafe[- ]?zone\b|\bnegative space\b|\bcomposition\b/,
  ]);
  if (framingHits < 1) {
    errors.push('prosa sem composicao/enquadramento concreto (close-up, medium, framing, mirror, over-the-shoulder)');
    score -= 15;
  }

  // 3. Movimento de camera por shot: cada shot precisa de movimento_camera nomeado.
  const shotList = Array.isArray(shots) ? shots : [];
  const shotsSemMov = shotList.filter((s) => cameraMoveHits(s.movimento_camera).length === 0);
  if (shotList.length === 0) {
    // prosa deve ao menos citar movimento de camera
    if (cameraMoveHits(prompt).length === 0) {
      errors.push('prosa sem movimento de camera nomeado (push-in, handheld, pan, static...)');
      score -= 20;
    }
  } else if (shotsSemMov.length > 0) {
    errors.push(`${shotsSemMov.length} shot(s) sem movimento de camera nomeado: ${shotsSemMov.map((s) => s.n).join(', ')} — um movimento por shot`);
    score -= Math.min(30, shotsSemMov.length * 15);
  }

  // 4. Cor / grading nomeado.
  const colorHits = countHits(prompt, [
    /\bgrade\b|\bgrading\b|\bemulation\b|\banalog\b|\bbleach\b|\bteal\b|\bamber\b|\bcyan\b|\bmagenta\b|\bpalette\b|\bpaleta\b|\btones?\b|\bpink accents?\b|\bskin tones?\b/,
    /\blifted blacks\b|\bcontrolled highlights\b|\bsaturation\b|\bdesaturat|\bmuted\b|\bwarm\b|\bcool\b|\bcontemporary palette\b/,
  ]);
  if (colorHits < 1) {
    errors.push('prosa sem cor/grading nomeado (palette, tones, grade, warm/cool, skin tones)');
    score -= 15;
  }

  // 5. Anti-IA concreto: precisa de um bloco de "avoid" com tells concretos.
  const antiHits = countHits(prompt, [
    /\bavoid\b|\bevitar\b|\bno (fake|stiff|neon|exaggerated|oversexualized|messy|dramatic)\b/,
    /\bfake smiles?\b|\bstiff posing\b|\bexaggerated\b|\bunrealistic\b|\bplastic\b|\bwaxy\b|\bmorph\b|\bflicker\b|\bstiff\b/,
  ]);
  if (antiHits < 1) {
    errors.push('prosa sem bloco anti-IA concreto (avoid: fake smiles, stiff posing, exaggerated acting, neon, plastic skin...)');
    score -= 15;
  }

  const qHits = qualityHits(prompt);
  if (qHits.length >= 2) {
    errors.push(`prosa dominada por quality-words vazias: ${qHits.join(', ')} — troque por fatos visuais (fonte de luz, lente, grade)`);
    score -= Math.min(30, qHits.length * 8);
  } else if (qHits.length === 1) {
    warnings.push(`quality-word encontrada: ${qHits.join(', ')} — prefira fatos visuais`);
    score -= 8;
  }

  return scoreResult(artifacto, score, errors, warnings, {
    light_hits: lightHits,
    framing_hits: framingHits,
    color_hits: colorHits,
    anti_hits: antiHits,
    shots_sem_movimento: shotsSemMov.map((s) => s.n),
    generation_scenes: shotList.length,
  });
}

function evaluateShotlistDp(promptForge, artifacto = 'shotlist-dp') {
  const prompt = String((promptForge && promptForge.prompt) || '');
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  if (prompt.trim().length === 0) {
    return scoreResult(artifacto, 0, ['prompt-forge sem prosa (campo prompt) para o passe DP'], [], { generation_scenes: shots.length });
  }
  return evaluatePromptDp(prompt, shots, artifacto);
}

module.exports = {
  evaluateCinematography,
  evaluateShotlistDp,
  evaluatePromptDp,
};

if (require.main === module) {
  const mode = process.argv[2];
  const file = process.argv[3];
  if (!file || (mode !== 'cinematografia' && mode !== 'shotlist')) {
    console.error('Uso: node scripts/lib/dp-quality.cjs cinematografia|shotlist <arquivo.json>');
    process.exit(2);
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = mode === 'cinematografia'
    ? evaluateCinematography(json, file)
    : evaluateShotlistDp(json, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
