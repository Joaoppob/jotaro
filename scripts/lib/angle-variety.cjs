#!/usr/bin/env node
'use strict';

/**
 * angle-variety.cjs — gate de variedade de enquadramento (nivel-100).
 *
 * Lacuna apontada na auditoria: nenhum gate checava angulos/tamanhos de plano. Um
 * reel inteiro em "medium shot, eye-level" passava todos os outros gates. A pesquisa
 * de benchmark é clara: corte = nova informacao; repetir o mesmo plano mata o ritmo.
 *
 * 0.7: le o prompt-forge (schemas/prompt-forge.schema.json). Cada `shots[]` ja traz
 * o TAMANHO de plano (`tamanho_plano`) e o ANGULO (`angulo`) como campos tipados —
 * nada de regex sobre prosa. O gate os normaliza para uma familia canonica
 * (wide/medium/close/full/...) e reprova:
 *   - reel com >=4 shots e menos de 3 tamanhos de plano distintos (monotonia);
 *   - shots ADJACENTES com plano E angulo identicos (corte que nao muda nada).
 * Alerta (nao reprova) shot sem plano declarado.
 *
 * Uso: node scripts/lib/angle-variety.cjs <prompt-forge.json>   (exit 1 se reprova)
 */

const fs = require('fs');

// Normalizacao do campo tipado shots[].tamanho_plano para uma familia canonica.
// O valor ja vem estruturado (ex.: "extreme-close", "medium", "wide"); reduzimos a
// uma familia para medir variedade de forma robusta a sinonimos.
const SHOT_SIZES = [
  { key: 'extreme-wide', re: /\bextreme[- ]wide\b|\bvista aerea\b|\baerial\b/ },
  { key: 'wide', re: /\bwide\b|\bestablishing\b|\blong\b|\bplano geral\b|\baberto\b/ },
  { key: 'full', re: /\bfull\b|\bcorpo inteiro\b|\bplano inteiro\b/ },
  { key: 'medium', re: /\bmedium\b|\bmid\b|\bplano medio\b|\bplano americano\b|\bcowboy\b/ },
  { key: 'three-quarter', re: /\bthree[- ]quarter\b|\b3\/4\b|\bplano tres quartos\b/ },
  { key: 'macro', re: /\bmacro\b|\binsert\b|\bextreme[- ]close\b|\bdetalhe\b/ },
  { key: 'close', re: /\bclose\b|\bprimeiro plano\b/ },
];

const ANGLES = [
  { key: 'low', re: /\blow\b|\bcontra[- ]?plong[ée]e\b|\bfrom below\b|\bworm'?s eye\b/ },
  { key: 'high', re: /\bhigh\b|\bplong[ée]e\b|\bfrom above\b/ },
  { key: 'over-the-shoulder', re: /\bover[- ]the[- ]shoulder\b|\bots\b/ },
  { key: 'overhead', re: /\boverhead\b|\btop[- ]down\b|\bbird'?s eye\b|\baerial\b/ },
  { key: 'dutch', re: /\bdutch\b|\bcanted\b|\btilted horizon\b/ },
  { key: 'eye', re: /\beye\b|\bfront view\b|\bfrontal\b|\bfacing camera\b/ },
];

function lower(v) { return String(v || '').toLowerCase(); }

function detect(list, text) {
  for (const item of list) if (item.re.test(text)) return item.key;
  return null;
}

function evaluateShotlist(promptForge, artifacto = 'inline') {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];

  const errors = [];
  const warnings = [];

  if (shots.length === 0) {
    return { artifacto, ok: true, score: 100, errors, warnings: ['prompt-forge sem shots para avaliar angulos'], scenes: [] };
  }

  const sigs = shots.map((s) => {
    const rawSize = lower(s.tamanho_plano);
    const rawAngle = lower(s.angulo);
    // Normaliza para familia canonica; se nao casar nenhuma, usa o valor cru (nao-nulo)
    // como sua propria familia para nao inflar/perder variedade silenciosamente.
    const size = detect(SHOT_SIZES, rawSize) || (rawSize.trim() ? rawSize.trim() : null);
    const angle = detect(ANGLES, rawAngle) || (rawAngle.trim() ? rawAngle.trim() : null);
    if (!size) warnings.push(`shot ${s.n}: tamanho de plano nao declarado (wide/medium/close/full...)`);
    return { n: s.n, size, angle };
  });

  let score = 100;

  // 1. Variedade de tamanhos de plano
  const distinctSizes = new Set(sigs.map((s) => s.size).filter(Boolean));
  if (shots.length >= 4 && distinctSizes.size < 3) {
    errors.push(`variedade de enquadramento baixa: so ${distinctSizes.size} tamanho(s) de plano distinto(s) em ${shots.length} shots (minimo 3) — alterne wide/medium/close/full`);
    score -= 35;
  } else if (shots.length >= 2 && distinctSizes.size < 2) {
    errors.push('todos os shots usam o mesmo tamanho de plano — sem variacao de enquadramento');
    score -= 30;
  }

  // 2. Shots adjacentes com plano E angulo identicos
  for (let i = 1; i < sigs.length; i++) {
    const a = sigs[i - 1];
    const b = sigs[i];
    if (a.size && b.size && a.size === b.size && (a.angle || null) === (b.angle || null)) {
      errors.push(`shots ${a.n} e ${b.n} adjacentes com mesmo plano/angulo (${a.size}/${a.angle || 'sem-angulo'}) — varie o corte`);
      score -= 20;
    }
  }

  // 3. Variedade de angulos (advisory)
  const distinctAngles = new Set(sigs.map((s) => s.angle).filter(Boolean));
  if (shots.length >= 4 && distinctAngles.size < 2) {
    warnings.push('pouca variacao de angulo de camera (considere low/high/eye misturados)');
    score -= 8;
  }

  return {
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    scenes: sigs,
    distinct_sizes: Array.from(distinctSizes),
    distinct_angles: Array.from(distinctAngles),
    generation_scenes: shots.length,
  };
}

module.exports = { evaluateShotlist, SHOT_SIZES, ANGLES };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/angle-variety.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
