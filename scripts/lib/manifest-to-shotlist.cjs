'use strict';

/**
 * manifest-to-shotlist.cjs — adapta prompt-manifest.yaml (schemas/prompt-manifest.schema.json,
 * o contrato real da 0.8) para o formato prompt-forge (schemas/prompt-forge.schema.json, o
 * contrato que os 10 gates de conteudo legados da 0.7 esperam).
 *
 * Por que existe: os 10 gates (identity-quality, dp-quality, prompt-structure,
 * narrative-quality, angle-variety, negative-prompt-discipline, locucao-idioma,
 * product-closeup, expressao-facial, critique) nasceram de bugs reais de producao e
 * continuam validos como criterio, mas foram escritos contra o prompt-forge.json da 0.7.
 * O manifesto da 0.8 tem forma diferente (shots[].camera.{shot_size,angle,movement} em vez
 * de tamanho_plano/angulo/movimento_camera soltos, sem campo `prompt` de prosa solto -- a
 * prosa vive em prompt.canonical.md, arquivo separado). Este adaptador fecha essa lacuna sem
 * reescrever os 10 gates.
 *
 * Campos que o manifesto 0.8 NAO modela ainda (personagem, element_id, produto_element_id,
 * mood por shot, continuidade multi-job, audio.locucao top-level): ficam null/undefined de
 * proposito. Os gates que leem esses campos foram escritos pra degradar sem falso-positivo
 * quando o campo esta ausente (ver cada um: personagem null pula o bloco de checagem de
 * personagem, mood ausente so nao casa termos banidos nesse campo especifico). Isso e uma
 * cobertura parcial honesta, nao uma emulacao perfeita do prompt-forge.
 */

function adaptManifestToShotlist(manifest, canonicalProse) {
  const m = manifest || {};
  const shots = Array.isArray(m.shots) ? m.shots : [];

  const adaptedShots = shots.map((shot) => {
    const s = shot || {};
    const camera = s.camera || {};
    const audio = s.audio || {};
    const descricaoParts = [s.subject, s.action, s.world].filter((v) => typeof v === 'string' && v.trim());
    const fala = typeof audio.dialogue === 'string' && audio.dialogue.trim() ? audio.dialogue : undefined;
    return {
      n: s.id,
      beat: s.beat,
      descricao: descricaoParts.length ? descricaoParts.join(' — ') : undefined,
      tamanho_plano: camera.shot_size,
      angulo: camera.angle,
      movimento_camera: camera.movement,
      fala,
      // mood nao existe no schema do manifesto 0.8 -- deixado ausente de proposito.
    };
  });

  return {
    projeto: m.project_id || null,
    personagem: null,
    element_id: null,
    produto_element_id: null,
    negative_prompt: Array.isArray(m.negative_controls) && m.negative_controls.length
      ? m.negative_controls.join(', ')
      : undefined,
    duracao_seg: typeof m.duration_seconds === 'number' ? m.duration_seconds : undefined,
    continuidade: undefined,
    audio: undefined,
    shots: adaptedShots,
    prompt: typeof canonicalProse === 'string' ? canonicalProse : '',
  };
}

module.exports = { adaptManifestToShotlist };
