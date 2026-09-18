'use strict';

/**
 * scene-brief-required — gate mecanico da metodologia "projeto dentro de projeto".
 *
 * Valida consistencia entre scenes[] e shots[] no prompt-manifest:
 *   - cada scene tem cena_brief com as seis perguntas;
 *   - cada cena_brief tem sobrevive_sozinha e motivo_teste_vampiro;
 *   - shots[].cena_id aponta para uma scene existente;
 *   - scenes[].shot_ids apontam para shots existentes.
 *
 * Modo: warning (nao bloqueante nesta fase). Apos migracao de fixtures/agentes,
 * promover para blocking.
 */

const BLOCKING = true; // bloqueante nesta fase

function check(manifest) {
  const errors = [];
  const warnings = [];

  if (!manifest) return { ok: false, errors: ['manifest ausente'] };

  const hasScenes = Array.isArray(manifest.scenes) && manifest.scenes.length > 0;
  const hasShots = Array.isArray(manifest.shots) && manifest.shots.length > 0;

  if (!hasShots) {
    if (BLOCKING) {
      errors.push('scene-brief: manifest nao tem shots[] — impossivel validar rastreabilidade');
    }
    return { ok: BLOCKING ? errors.length === 0 : true, errors, warnings };
  }

  // shots[] existe; scenes[] pode ainda nao ter sido migrado.
  if (!hasScenes) {
    if (BLOCKING) {
      errors.push('scene-brief: manifest nao tem scenes[] — obrigatorio para rastreabilidade de cena');
    } else {
      warnings.push('scene-brief: manifest nao tem scenes[] (opcional nesta fase; sera obrigatorio apos migracao)');
    }
    return { ok: errors.length === 0, errors, warnings };
  }

  // --- scenes[] e shots[] existem: validacao de consistencia ---

  const sceneIds = new Set();
  for (const scene of manifest.scenes) {
    const sid = scene.cena_id;
    if (!sid) {
      errors.push('scene-brief: scene sem cena_id em scenes[]');
      continue;
    }
    if (sceneIds.has(sid)) {
      errors.push(`scene-brief: cena_id duplicado em scenes[]: ${sid}`);
    }
    sceneIds.add(sid);

    // cena_brief obrigatorio
    const brief = scene.cena_brief;
    if (!brief) {
      errors.push(`scene-brief: scene ${sid} nao tem cena_brief`);
      continue;
    }

    // seis perguntas da cena
    if (!brief.objetivo || typeof brief.objetivo !== 'string' || brief.objetivo.trim().length < 3) {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem objetivo (min 3 chars)`);
    }
    if (!brief.o_que_comunica || typeof brief.o_que_comunica !== 'string' || brief.o_que_comunica.trim().length < 3) {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem o_que_comunica (min 3 chars)`);
    }
    if (!brief.metodo_comunicacao || typeof brief.metodo_comunicacao !== 'string' || brief.metodo_comunicacao.trim().length < 3) {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem metodo_comunicacao (min 3 chars)`);
    }
    if (!brief.como_comunica || typeof brief.como_comunica !== 'string' || brief.como_comunica.trim().length < 3) {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem como_comunica (min 3 chars)`);
    }

    // arco (comeco-meio-fim)
    const arco = brief.arco;
    if (!arco || typeof arco !== 'object') {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem arco (objeto com inicio/meio/fim)`);
    } else {
      if (!arco.inicio || typeof arco.inicio !== 'string' || arco.inicio.trim().length < 2) {
        errors.push(`scene-brief: arco de ${sid} nao tem inicio (min 2 chars)`);
      }
      if (!arco.meio || typeof arco.meio !== 'string' || arco.meio.trim().length < 2) {
        errors.push(`scene-brief: arco de ${sid} nao tem meio (min 2 chars)`);
      }
      if (!arco.fim || typeof arco.fim !== 'string' || arco.fim.trim().length < 2) {
        errors.push(`scene-brief: arco de ${sid} nao tem fim (min 2 chars)`);
      }
    }

    // teste vampiro
    if (typeof brief.sobrevive_sozinha !== 'boolean') {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem sobrevive_sozinha (boolean)`);
    }
    if (!brief.motivo_teste_vampiro || typeof brief.motivo_teste_vampiro !== 'string' || brief.motivo_teste_vampiro.trim().length < 3) {
      errors.push(`scene-brief: cena_brief de ${sid} nao tem motivo_teste_vampiro (min 3 chars)`);
    }

    // shot_ids devem apontar para shots existentes
    const sids = scene.shot_ids;
    if (Array.isArray(sids) && sids.length > 0) {
      const shotIdSet = new Set(manifest.shots.map((s) => s.id));
      for (const shotId of sids) {
        if (!shotIdSet.has(shotId)) {
          errors.push(`scene-brief: scene ${sid} referencia shot ${shotId} em shot_ids, mas esse shot nao existe em shots[]`);
        }
      }
    }
  }

  // shots[].cena_id devem apontar para scenes existentes
  for (const shot of manifest.shots) {
    if (shot.cena_id) {
      if (!sceneIds.has(shot.cena_id)) {
        errors.push(`scene-brief: shot ${shot.id} referencia cena_id=${shot.cena_id}, mas essa scene nao existe em scenes[]`);
      }
    } else if (BLOCKING) {
      warnings.push(`scene-brief: shot ${shot.id} nao tem cena_id (opcional nesta fase; sera obrigatorio apos migracao)`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

module.exports = { check, BLOCKING };
