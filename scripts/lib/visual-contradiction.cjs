'use strict';

const CONTRADICTIONS = [
  { a: /\bhandheld\b/i, b: /\bperfectly.stable\b/i, label: 'handheld + perfectly stable' },
  { a: /\bhandheld\b/i, b: /\bstabilized\b/i, label: 'handheld + stabilized' },
  { a: /\bnatural.light\b/i, b: /\bstudio.softbox\b/i, label: 'natural light + studio softbox' },
  { a: /\bnatural.light\b/i, b: /\bstudio.lighting\b/i, label: 'natural light + studio lighting' },
  { a: /\bugc.native\b/i, b: /\bpolished.commercial\b/i, label: 'ugc-native + polished commercial' },
  { a: /\bugc.native\b/i, b: /\bstudio.shot\b/i, label: 'ugc-native + studio shot' },
  { a: /\bdocumentary\b/i, b: /\bperfect.composi/i, label: 'documentary + perfect composition' },
  { a: /\bdocumentary\b/i, b: /\bcinematic.lighting\b/i, label: 'documentary + cinematic lighting' },
  { a: /\breal.footage\b/i, b: /\b3d.render\b/i, label: 'real footage + 3d render' },
  { a: /\braw\b/i, b: /\bcolor.graded\b/i, label: 'raw + color graded' },
  { a: /\bcctv\b/i, b: /\bcinematic\b/i, label: 'cctv + cinematic' },
  { a: /\bfound.footage\b/i, b: /\bhigh.quality\b/i, label: 'found footage + high quality' },
];

function check(manifest) {
  const errors = [];
  if (!manifest) return { ok: false, errors: ['manifest ausente'] };
  const shots = manifest.shots || [];

  // Cada shot e checado isoladamente: uma contradicao so conta se os dois termos
  // aparecem DENTRO do mesmo shot, nunca espalhados entre shots diferentes do manifesto.
  for (const shot of shots) {
    const shotText = JSON.stringify(shot).toLowerCase();
    const shotLabel = shot && shot.id !== undefined ? `shot ${shot.id}` : 'shot sem id';

    for (const { a, b, label } of CONTRADICTIONS) {
      if (a.test(shotText) && b.test(shotText)) {
        errors.push(`contradicao visual (${shotLabel}): ${label}`);
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, errors: [] };
}

module.exports = { check };
