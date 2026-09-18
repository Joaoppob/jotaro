'use strict';

const fs = require('fs');

const ACCEPT_THRESHOLD = 2;

function score(alignment) {
  if (!alignment) return 0;
  const fields = ['objetivo', 'identidade', 'enredo', 'camera', 'montagem', 'realismo', 'audio'];
  const total = fields.reduce((sum, f) => sum + (alignment[f] || 0), 0);
  return { total, max: fields.length * 2, pct: Math.round((total / (fields.length * 2)) * 100) };
}

function performanceScore(hypothesis) {
  if (!hypothesis) return 0;
  const fields = ['attention', 'branding', 'connection', 'direction'];
  return fields.reduce((sum, f) => sum + (hypothesis[f] || 0), 0);
}

function decideVerdict(critique, maxAttempts) {
  const max = maxAttempts || 3;
  const attempt = critique.attempt || 1;

  if (!critique.project_alignment) {
    return { decision: 'escalate', reason: 'project_alignment ausente' };
  }

  const alignmentScore = score(critique.project_alignment);
  const minAxisScore = Math.min(
    critique.project_alignment.objetivo || 0,
    critique.project_alignment.identidade || 0,
    critique.project_alignment.enredo || 0,
    critique.project_alignment.camera || 0,
    critique.project_alignment.montagem || 0,
    critique.project_alignment.realismo || 0,
    critique.project_alignment.audio || 0
  );

  const failures = critique.failures || [];
  const blockingFailures = failures.filter((f) => f.severity === 'blocking');

  if (blockingFailures.length > 0) {
    if (attempt >= max) {
      return { decision: 'escalate', reason: `max attempts (${max}) alcancado com ${blockingFailures.length} falhas blocking` };
    }
    return { decision: 'revise_stage', reason: `${blockingFailures.length} falhas blocking`, target: blockingFailures[0].stage };
  }

  if (minAxisScore <= 0 && alignmentScore.total >= 8) {
    if (attempt >= max) return { decision: 'escalate', reason: `eixo zerado apos ${attempt} tentativas` };
    return { decision: 'rerender_tool', reason: `eixo com score 0 (total ${alignmentScore.pct}%)` };
  }

  if (alignmentScore.pct >= 70 && minAxisScore >= ACCEPT_THRESHOLD) {
    return { decision: 'accept', reason: `alignment ${alignmentScore.pct}%, min axis ${minAxisScore} >= ${ACCEPT_THRESHOLD}` };
  }

  if (attempt >= max) {
    return { decision: 'escalate', reason: `max attempts (${max}) alcancado, alignment ${alignmentScore.pct}%` };
  }

  if (alignmentScore.pct < 50) {
    return { decision: 'revise_prompt', reason: `alignment ${alignmentScore.pct}% abaixo de 50%` };
  }

  return { decision: 'rerender_tool', reason: `alignment ${alignmentScore.pct}% abaixo do threshold, tentativa ${attempt}/${max}` };
}

function extractLeanings(critique) {
  const items = [];
  const failures = critique.failures || [];
  for (const f of failures) {
    if (f.evidence && f.root_cause && f.root_cause !== 'unknown') {
      items.push({
        pattern: f.evidence.substring(0, 120),
        recommendation: f.next_action === 'revise_stage' ? `Revisar ${f.stage} antes do proximo render` : f.next_action,
        stage_affected: f.stage,
      });
    }
  }
  return items;
}

function evaluatePostRender(input) {
  const ANTI_IA_KEYS = ['C8', 'C9', 'C10', 'C11'];
  const ALL_KEYS = Object.keys(input.scores || {}).filter((k) => /^C\d+$/i.test(k));
  const weights = {};
  ALL_KEYS.forEach((k) => { weights[k] = 1 / ALL_KEYS.length; });

  const antiIa = ANTI_IA_KEYS.map((k) => input.scores[k]).filter((v) => v !== undefined);
  if (antiIa.length < 4) {
    const failures = ANTI_IA_KEYS.filter((k) => input.scores[k] === undefined).map((k) => ({
      stage: 'modelo', severity: 'blocking', evidence: `Score ${k} ausente ou faltando`, root_cause: 'unknown', next_action: 'reject' }));
    return { ok: false, verdict: 'escalate', failures, warnings: [], anti_ia_score: 0, weighted_total: 0 };
  }

  const minAntiIa = Math.min(...antiIa);
  const meanAntiIa = Math.round(antiIa.reduce((s, v) => s + v, 0) / antiIa.length);
  let weighted = 0;
  ALL_KEYS.forEach((k) => { weighted += (input.scores[k] || 0) * (weights[k] || 0); });
  weighted = Math.round(weighted);

  const attempt = input.attempt || 1;
  const max = input.max_attempts || 3;
  const warnings = [];
  const failures = [];

  if (meanAntiIa < 60 && meanAntiIa >= 50) {
    warnings.push(`Qualidade anti-IA mediocre (mean=${meanAntiIa}) — aceito com alerta`);
  }

  ANTI_IA_KEYS.forEach((k) => {
    if (input.scores[k] <= 20) {
      failures.push(`Criterio ${k} tell forte (score=${input.scores[k]})`);
    }
  });

  if (minAntiIa <= 20 && attempt < max) {
    return { ok: false, verdict: 'reroll', failures, warnings, anti_ia_score: meanAntiIa, weighted_total: weighted };
  }
  if (minAntiIa <= 20 && attempt >= max) {
    return { ok: false, verdict: 'escalate', failures, warnings, anti_ia_score: meanAntiIa, weighted_total: weighted };
  }
  return { ok: true, verdict: 'accept', failures, warnings, anti_ia_score: meanAntiIa, weighted_total: weighted };
}

const POST_RENDER_CRITIQUE = { score, performanceScore, decideVerdict, extractLeanings, evaluatePostRender, ACCEPT_THRESHOLD };
module.exports = POST_RENDER_CRITIQUE;

// CLI: node scripts/lib/post-render-critique.cjs <critique.json>
// Duas formas de entrada, auto-detectadas pela chave presente:
//  - {scores: {...}}            -> Wave L, rubrica anti-IA C8-C11 sobre o render (0-100), evaluatePostRender
//  - {project_alignment: {...}} -> Wave 7, alinhamento por etapa (0-2), schemas/post-render-critique.schema.json, decideVerdict
// Exit code: 0 accept/approved, 1 retry (reroll/variation/revise_prompt/revise_stage/rerender_tool), 2 escalate/reject/reopen_brief.
if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node scripts/lib/post-render-critique.cjs <critique.json>');
    process.exit(2);
  }
  let input;
  try {
    input = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error(`Erro lendo/parseando ${file}: ${e.message}`);
    process.exit(2);
  }

  let result;
  let verdict;
  if (input.scores) {
    result = evaluatePostRender(input);
    verdict = result.verdict;
  } else if (input.project_alignment) {
    result = decideVerdict(input, input.max_attempts);
    verdict = result.decision;
  } else {
    console.error('critique.json precisa ter "scores" (Wave L, anti-IA C8-C11) ou "project_alignment" (Wave 7, alinhamento por etapa).');
    process.exit(2);
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  const ACCEPT = new Set(['accept', 'approved']);
  const ESCALATE = new Set(['escalate', 'reject', 'reopen_brief']);
  if (ACCEPT.has(verdict)) process.exit(0);
  if (ESCALATE.has(verdict)) process.exit(2);
  process.exit(1);
}
