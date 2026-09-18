#!/usr/bin/env node
'use strict';

const fs = require('fs');

const LAYERS = [
  {
    id: 'subject',
    label: 'Subject/Sujeito',
    weight: 1.0,
    patterns: [
      /\b(subject|sujeito)\b/i,
      /\b(man|woman|person|character|mage|wizard|model|product|bottle|device)\b/i,
      /\b(middle-aged|young|elderly|in (his|her|their))\b/i,
      /\b(wearing|dressed in|with|has)\b.{3,60}\b(hair|eyes|skin|build|face)\b/i,
    ],
  },
  {
    id: 'action',
    label: 'Action/Pose',
    weight: 0.7,
    patterns: [
      /\b(action|pose|gesture|movimento|doing|fazendo)\b/i,
      /\b(standing|sitting|walking|running|holding|looking|reaching|cradling|casting|drinking|typing|talking|smiling|leaning)\b/i,
      /\b(gaze|eye contact|staring|glancing|facing|turned)\b/i,
    ],
  },
  {
    id: 'environment',
    label: 'Environment/Location',
    weight: 0.6,
    patterns: [
      /\b(environment|location|local|ambiente|setting|background|scene)\b/i,
      /\b(room|studio|office|forest|street|beach|desert|kitchen|living room|bedroom|cafe|restaurant|garden|park|warehouse|alley)\b/i,
      /\b(indoor|outdoor|interior|exterior|inside|outside)\b/i,
    ],
  },
  {
    id: 'composition',
    label: 'Composition/Framing',
    weight: 0.8,
    patterns: [
      /\b(composition|composição|composicao|framing|enquadramento|frame)\b/i,
      /\b9:16|vertical/i,
      /\b(close-up|medium shot|wide shot|full body|headshot|portrait|cropped|tight|loose)\b/i,
      /\b(rule of thirds|centered|centrado|off-center|dead-center|negative space|leading lines)\b/i,
    ],
  },
  {
    id: 'lighting',
    label: 'Lighting',
    weight: 0.9,
    patterns: [
      /\b(lighting|luz|iluminação|iluminacao)\b/i,
      /\b(key light|fill light|rim light|backlight|side light|window light|practical|motivated)\b/i,
      /\b(hard|soft|diffused|directional|overhead|from (camera-)?(left|right)|top|side)\b/i,
      /\b(3200k|5600k|6500k|warm|cool|daylight|tungsten|golden hour|neon)\b/i,
      /\b(shadows?|highlights?|chiaroscuro|contrast ratio)\b/i,
    ],
  },
  {
    id: 'camera_lens',
    label: 'Camera/Lens',
    weight: 0.7,
    patterns: [
      /\b(camera|shot on|filmed on|lens|lente|distância focal|focal length)\b/i,
      /\b\d{2}mm|f\/\d/i,
      /\b(depth of field|DoF|shallow|deep|macro|bokeh)\b/i,
      /\b(Canon|Sony|Nikon|Fujifilm|Leica|iPhone|AE-1|a7III|5D|GR III|X100)\b/i,
    ],
  },
  {
    id: 'rendering_style',
    label: 'Rendering/Style',
    weight: 0.6,
    patterns: [
      /\b(style|estilo|rendering|film stock|emulation|grade|grading|palette|paleta)\b/i,
      /\b(Kodak|Portra|Ektachrome|Ektar|Ilford|Fuji|Cinestill|HP5|Velvia|Provia)\b/i,
      /\b(grain|grão|grao|analog|film|matte|lifted blacks|desaturated|muted)\b/i,
      /\b(warm|cool|amber|teal|vintage|modern|editorial|lifestyle)\b/i,
    ],
  },
];

const QUALITY_WORDS = /\b(8k|ultra.realistic|photoreal|masterpiece|best quality|award.winning|cinematic|hyperrealistic?|beautiful|stunning|superb?)\b/i;

const LAYER_MIN = 5;
const CORE_LAYERS = ['subject', 'composition', 'lighting'];
const CORE_MIN = 3;

function lower(text) {
  return String(text || '').toLowerCase();
}

function checkLayer(prompt, layer) {
  const lc = lower(prompt);
  for (const pattern of layer.patterns) {
    if (pattern.test(lc)) return true;
  }
  return false;
}

function evaluatePromptText(prompt, label) {
  const errors = [];
  const warnings = [];
  const layersFound = [];
  const layersMissing = [];
  let coreMissing = [];

  for (const layer of LAYERS) {
    if (checkLayer(prompt, layer)) {
      layersFound.push(layer.id);
    } else {
      layersMissing.push(layer.id);
    }
  }

  coreMissing = CORE_LAYERS.filter((id) => !layersFound.includes(id));
  const totalFound = layersFound.length;

  let score = 0;
  for (const layer of LAYERS) {
    if (layersFound.includes(layer.id)) {
      score += layer.weight;
    }
  }
  const maxWeight = LAYERS.reduce((s, l) => s + l.weight, 0);
  score = Math.round((score / maxWeight) * 100);

  if (totalFound < LAYER_MIN) {
    errors.push(`${label}: prompt cobre so ${totalFound}/${LAYERS.length} camadas (min ${LAYER_MIN}); faltam: ${layersMissing.join(', ')}`);
    score = Math.min(score, 35);
  }

  if (coreMissing.length > 0) {
    errors.push(`${label}: camadas criticas ausentes: ${coreMissing.join(', ')} (subject, composition, lighting)`);
    score = Math.min(score, 25);
  }

  if (QUALITY_WORDS.test(lower(prompt))) {
    warnings.push(`${label}: quality-words encontradas (8K, cinematic, etc) — troque por fatos visuais`);
    score = Math.max(0, score - 10);
  }

  if (prompt.length < 80) {
    warnings.push(`${label}: prompt muito curto (${prompt.length} chars, min recomendado 80)`);
    score = Math.max(0, score - 15);
  }

  if (!/9:16/.test(prompt)) {
    errors.push(`${label}: prompt sem aspect ratio 9:16`);
    score = Math.max(0, score - 20);
  }

  return {
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
    layers_found: layersFound,
    layers_missing: layersMissing,
  };
}

// 0.7: o artefato e o prompt-forge; a estrutura das 7 camadas e avaliada sobre a
// PROSA UNICA (campo `prompt`), nao mais por cena. As camadas subject/composition/
// lighting continuam obrigatorias; um prompt tipo "beautiful woman, 8K, cinematic"
// reprova.
function evaluateShotlist(promptForge, artifacto = 'inline') {
  const prompt = String((promptForge && promptForge.prompt) || '');

  const errors = [];
  const warnings = [];

  if (prompt.trim().length === 0) {
    errors.push('prompt-forge sem campo prompt (prosa) — nada a avaliar; o prompt-smith precisa montar a prosa multishot');
    return {
      artifacto,
      ok: false,
      score: 0,
      errors,
      warnings,
      scenes: [],
      generation_scenes: 0,
      layer_count: LAYERS.length,
      layer_min: LAYER_MIN,
    };
  }

  const result = evaluatePromptText(prompt, 'prompt');
  errors.push(...result.errors);
  warnings.push(...result.warnings);

  return {
    artifacto,
    ok: result.errors.length === 0,
    score: result.score,
    errors,
    warnings,
    scenes: [result],
    layers_found: result.layers_found,
    layers_missing: result.layers_missing,
    layer_count: LAYERS.length,
    layer_min: LAYER_MIN,
  };
}

module.exports = { evaluateShotlist, evaluatePromptText, LAYERS };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/prompt-structure.cjs <prompt-forge.json>');
    process.exit(2);
  }
  const promptForge = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = evaluateShotlist(promptForge, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
