'use strict';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const SECRET_PATH = path.join(PROJECT_ROOT, '.claude', 'state', '.approval-secret');

// O HMAC so protege contra adulteracao se a mesma chave for usada pra assinar
// e pra validar. Um secret novo por chamada (o bug original) tornava a
// assinatura decorativa: validateToken nunca recalculava nada, entao qualquer
// JSON no formato certo passava. Aqui o secret e gerado uma vez e persistido
// localmente (nunca commitado — ver .gitignore).
function getOrCreateSecret() {
  try {
    const existing = fs.readFileSync(SECRET_PATH, 'utf8').trim();
    if (existing.length >= 32) return existing;
  } catch (_) {
    // arquivo ainda nao existe ou esta corrompido — gera um novo abaixo
  }
  const fresh = crypto.randomBytes(32).toString('hex');
  try {
    fs.mkdirSync(path.dirname(SECRET_PATH), { recursive: true });
    fs.writeFileSync(SECRET_PATH, fresh, { mode: 0o600 });
  } catch (_) {
    // sem permissao de escrever o secret: segue mesmo assim com o valor em
    // memoria (falha fechada — assinaturas desta run nao vao bater com runs
    // futuras que conseguirem persistir, o que reprova a validacao, nunca
    // aceita as cegas).
  }
  return fresh;
}

function generateToken({ project_id, generation_id, prompt_hash, gate_results_hash, approved_by, allowed_tools, expires_at }) {
  const payload = JSON.stringify({
    project_id,
    generation_id,
    prompt_hash,
    gate_results_hash,
    approved_by,
    allowed_tools,
    expires_at,
    issued_at: new Date().toISOString(),
  });
  const secret = getOrCreateSecret();
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, signature })).toString('base64');
}

function decodeToken(token) {
  try {
    const raw = Buffer.from(String(token), 'base64').toString('utf8');
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function validateToken(token, now) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.payload || !decoded.signature) {
    return { valid: false, reason: 'token invalido ou corrompido' };
  }
  const secret = getOrCreateSecret();
  const expectedSignature = crypto.createHmac('sha256', secret).update(decoded.payload).digest('hex');
  const expectedBuf = Buffer.from(expectedSignature, 'hex');
  const givenBuf = Buffer.from(String(decoded.signature), 'hex');
  if (expectedBuf.length !== givenBuf.length || !crypto.timingSafeEqual(expectedBuf, givenBuf)) {
    return { valid: false, reason: 'assinatura invalida — token adulterado ou nao emitido por este sistema' };
  }
  let data;
  try {
    data = JSON.parse(decoded.payload);
  } catch (_) {
    return { valid: false, reason: 'token payload malformado' };
  }
  if (!data.generation_id || data.generation_id.length < 10) {
    return { valid: false, reason: 'token sem generation_id valido' };
  }
  if (!data.prompt_hash || data.prompt_hash.length < 8) {
    return { valid: false, reason: 'token sem prompt_hash' };
  }
  if (data.expires_at && new Date(data.expires_at) <= new Date(now || Date.now())) {
    return { valid: false, reason: 'token expirado' };
  }
  if (!data.allowed_tools || data.allowed_tools.length === 0) {
    return { valid: false, reason: 'token sem allowed_tools' };
  }
  if (data.decision === 'rejected') {
    return { valid: false, reason: 'token rejeitado' };
  }
  return { valid: true, reason: 'token valido', data };
}

function validateGenerationMatch(token, expectedGenerationId, expectedPromptHash) {
  const result = validateToken(token);
  if (!result.valid) return result;
  if (result.data.generation_id !== expectedGenerationId) {
    return { valid: false, reason: `token e para geracao ${result.data.generation_id}, nao ${expectedGenerationId}` };
  }
  if (result.data.prompt_hash !== expectedPromptHash) {
    return { valid: false, reason: 'prompt_hash do token nao bate com o prompt atual — prompt foi alterado apos aprovacao' };
  }
  return result;
}

const APPROVAL_TOKEN = { generateToken, decodeToken, validateToken, validateGenerationMatch };
module.exports = APPROVAL_TOKEN;
