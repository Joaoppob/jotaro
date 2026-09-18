'use strict';

const fs = require('fs');
const path = require('path');
const validateSchema = require('./validate-schema.cjs');

const SCHEMA_PATH = path.join(__dirname, '..', '..', 'schemas', 'prompt-manifest.schema.json');
let cachedSchema = null;
function loadSchema() {
  if (!cachedSchema) {
    cachedSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  }
  return cachedSchema;
}

// Checa o manifest contra o proprio JSON schema (schemas/prompt-manifest.schema.json).
// Isso pega QUALQUER divergencia entre o manifest e o contrato — inclusive campos que
// as checagens manuais abaixo nao cobrem (ex.: shots[].montagem.duration < 0.5,
// cena_brief incompleto, beat fora do enum). Achado real (golden dry-run
// 2026-07-03): um manifest com um shot de 0.4s (abaixo do minimo 0.5 do schema)
// passou pelas checagens manuais daqui sem ser pego, porque nenhuma delas olhava
// pra shots[].montagem.duration — so a validacao de schema, rodada a parte, achou.
function check(manifest) {
  const errors = [];
  if (!manifest) return { ok: false, errors: ['manifest ausente'] };

  const schemaResult = validateSchema(loadSchema(), manifest);
  for (const err of schemaResult.errors) {
    errors.push(`manifest schema: ${err}`);
  }

  // Checagens adicionais, com mensagem mais legivel que o generico do schema
  // (o schema ja cobre presenca/formato; estas reforcam o essencial pro humano).
  if (!manifest.shots || manifest.shots.length === 0) {
    errors.push('manifest: shots[] vazio');
  }
  if (!manifest.brief_hash || manifest.brief_hash.length < 8) {
    errors.push('manifest: brief_hash ausente ou muito curto');
  }
  if (!manifest.specialist_reviews_hash || manifest.specialist_reviews_hash.length < 8) {
    errors.push('manifest: specialist_reviews_hash ausente ou muito curto');
  }
  if (!manifest.identity_hash || manifest.identity_hash.length < 8) {
    errors.push('manifest: identity_hash ausente ou muito curto');
  }
  if (!manifest.model_target) {
    errors.push('manifest: model_target ausente');
  }
  if (manifest.duration_seconds !== undefined) {
    if (typeof manifest.duration_seconds !== 'number' || manifest.duration_seconds < 4 || manifest.duration_seconds > 60) {
      errors.push('manifest: duration_seconds fora do intervalo 4-60');
    }
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { check };
