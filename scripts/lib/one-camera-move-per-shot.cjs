'use strict';

const MOVE_WORD = 'pan|tilt|dolly|track|push.in|zoom|orbit|crane|pedestal';

// Sinonimos: termos diferentes que descrevem o MESMO movimento fisico de camera.
// "push-in" e "dolly in" sao o mesmo deslocamento (camera anda em direcao ao
// sujeito) — nomear os dois na mesma frase ("slow push-in / dolly in") e uma
// unica decisao de movimento, escrita com sinonimo entre parenteses/barra para
// clareza, nao uma instrucao de dois movimentos simultaneos. O gate deve
// contar MOVIMENTOS DISTINTOS, nao PALAVRAS distintas.
const CANONICAL_MOVE = {
  'push in': 'push-in', 'push-in': 'push-in', 'pushin': 'push-in', 'dolly in': 'push-in', 'dolly-in': 'push-in',
  'pull back': 'pull-back', 'pull-back': 'pull-back', 'dolly out': 'pull-back', 'dolly-out': 'pull-back',
  pan: 'pan', tilt: 'tilt', track: 'track', zoom: 'zoom', orbit: 'orbit', crane: 'crane', pedestal: 'pedestal', dolly: 'dolly',
};

function canonicalizeMove(word) {
  const key = word.toLowerCase().replace(/-/g, ' ').trim();
  return CANONICAL_MOVE[key] || key;
}

// Extrai os movimentos nomeados de uma frase e devolve os tipos CANONICOS
// distintos (nao a contagem bruta de palavras) — "push-in" e "dolly in" na
// mesma frase colapsam pro mesmo tipo, "pan" e "tilt" continuam distintos.
function distinctMoveTypes(text) {
  const re = new RegExp('\\b(' + MOVE_WORD + ')(\\s*(in|out))?\\b', 'gi');
  const found = new Set();
  let m;
  while ((m = re.exec(text)) !== null) {
    const phrase = m[3] ? `${m[1]} ${m[3]}` : m[1];
    found.add(canonicalizeMove(phrase));
  }
  return found;
}

function check(manifest) {
  const errors = [];
  if (!manifest) return { ok: false, errors: ['manifest ausente'] };
  const shots = manifest.shots || [];

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    const movement = String((shot.camera && shot.camera.movement) || '').toLowerCase();

    if (!movement) continue;

    const types = distinctMoveTypes(movement);
    if (types.size >= 2) {
      errors.push(`shot[${i}] camera.movement "${movement}": movimentos de camera distintos detectados (${[...types].join(', ')})`);
    }
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { check };
