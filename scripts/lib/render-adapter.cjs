'use strict';

const MODEL_ADAPTERS = {
  kling3_0: {
    type: 'video',
    aspectRatios: ['9:16', '16:9', '1:1'],
    durationRange: [4, 15],
    supports: ['prompt', 'negative_prompt', 'element_id'],
    buildParams(manifest) {
      return {
        prompt: manifest.canonical_prompt || '',
        negative_prompt: (manifest.negative_controls || []).join(', '),
        aspect_ratio: manifest.aspect_ratio || '9:16',
        duration: manifest.duration_seconds || 8,
      };
    },
  },
  seedance_2_0_mini: {
    type: 'video',
    aspectRatios: ['9:16', '16:9', '1:1'],
    durationRange: [4, 15],
    supports: ['prompt', 'negative_prompt', 'image_ref'],
    buildParams(manifest) {
      return {
        prompt: manifest.canonical_prompt || '',
        negative_prompt: (manifest.negative_controls || []).join(', '),
        aspect_ratio: manifest.aspect_ratio || '9:16',
        duration: manifest.duration_seconds || 8,
      };
    },
  },
  seedance_2_0: {
    type: 'video',
    aspectRatios: ['9:16', '16:9', '1:1'],
    durationRange: [4, 30],
    supports: ['prompt', 'negative_prompt', 'image_ref', 'element_id'],
    buildParams(manifest) {
      return {
        prompt: manifest.canonical_prompt || '',
        negative_prompt: (manifest.negative_controls || []).join(', '),
        aspect_ratio: manifest.aspect_ratio || '9:16',
        duration: manifest.duration_seconds || 8,
      };
    },
  },
  nano_banana_2: {
    type: 'image',
    aspectRatios: ['9:16', '16:9', '1:1', '4:5'],
    durationRange: null,
    supports: ['prompt', 'negative_prompt', 'image_ref', 'element_id'],
    buildParams(manifest) {
      return {
        prompt: manifest.canonical_prompt || '',
        negative_prompt: (manifest.negative_controls || []).join(', '),
        aspect_ratio: manifest.aspect_ratio || '9:16',
      };
    },
  },
  soul_cinematic: {
    type: 'video',
    aspectRatios: ['9:16', '16:9'],
    durationRange: [4, 30],
    supports: ['prompt', 'negative_prompt', 'element_id'],
    buildParams(manifest) {
      return {
        prompt: manifest.canonical_prompt || '',
        negative_prompt: (manifest.negative_controls || []).join(', '),
        aspect_ratio: manifest.aspect_ratio || '9:16',
        duration: manifest.duration_seconds || 8,
      };
    },
  },
};

function resolve(model) {
  const adapter = MODEL_ADAPTERS[model];
  if (!adapter) throw new Error(`Modelo desconhecido: ${model}`);
  return adapter;
}

function buildCallParams(model, manifest) {
  const adapter = resolve(model);
  return adapter.buildParams(manifest);
}

function needsSplit(model, targetDurationSeconds) {
  const adapter = resolve(model);
  if (!adapter.durationRange) return false;
  return targetDurationSeconds > adapter.durationRange[1];
}

function supportsFormat(model, aspectRatio) {
  const adapter = resolve(model);
  return adapter.aspectRatios.includes(aspectRatio);
}

function resolveToolForModel(model, format) {
  if (model === 'nano_banana_2' || format === 'imagem') {
    return 'mcp__higgsfield__generate_image';
  }
  return 'mcp__higgsfield__generate_video';
}

function listModels() {
  return Object.keys(MODEL_ADAPTERS).map((key) => ({
    model: key,
    type: MODEL_ADAPTERS[key].type,
    durationRange: MODEL_ADAPTERS[key].durationRange,
    aspectRatios: MODEL_ADAPTERS[key].aspectRatios,
  }));
}

const RENDER_ADAPTER = { resolve, buildCallParams, needsSplit, supportsFormat, resolveToolForModel, listModels, MODEL_ADAPTERS };
module.exports = RENDER_ADAPTER;
