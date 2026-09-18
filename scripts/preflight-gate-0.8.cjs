#!/usr/bin/env node
'use strict';

/**
 * preflight-gate-0.8.cjs — runner real dos gates 0.8 contra uma geracao de verdade.
 *
 * PROBLEMA QUE RESOLVE: os gates novos da 0.8 (specialist-signoff, prompt-manifest-required,
 * essentialism-diff, one-camera-move-per-shot, visual-contradiction) existem como funcoes
 * testadas por mock em scripts/verify.cjs, mas nenhum runner real os chamava contra
 * artefatos de uma `generations/<id>/` de verdade antes de liberar producao. O
 * preflight-gate.cjs existente e o runner da 0.7 (roda contra output/prompt-forge.json).
 * Este script e o runner 0.8: le os artefatos reais de uma geracao, roda os 5 gates 0.8 MAIS
 * os 10 gates de conteudo nascidos de bug real de producao (via manifest-to-shotlist.cjs, que
 * adapta o manifesto pro formato que eles esperam), e so entao arma o token (reaproveitando o
 * MESMO mecanismo de armToken/tokenValid do preflight-gate.cjs, com o campo `extra` que carrega
 * generation_id/prompt_hash/gates_snapshot_hash/mode:'0.8').
 *
 * 2026-07-03: os 10 gates de conteudo (identity-quality, dp-quality, prompt-structure,
 * narrative-quality, angle-variety, negative-prompt-discipline, locucao-idioma,
 * product-closeup, expressao-facial, critique) foram escritos contra prompt-forge.json (0.7) e
 * nunca rodavam contra o manifesto da 0.8 -- so existiam como comando manual documentado no
 * CLAUDE.md, contra o arquivo errado. `manifest-to-shotlist.cjs` fecha essa lacuna. Cobertura
 * parcial honesta: personagem/element_id/produto_element_id/mood por shot ainda nao sao
 * modelados no manifesto 0.8, entao os gates que dependem so desses campos degradam sem
 * falso-positivo (ver o adaptador).
 *
 * Uso:
 *   node scripts/preflight-gate-0.8.cjs --root . --project <project_id> --generation <generation-id>
 *
 * Depois de armado, a producao continua bloqueada ate a aprovacao humana
 * (scripts/approve-generation.cjs) preencher approval_token no mesmo token.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const genPaths = require('./lib/generation-paths.cjs');
const preflightGate = require('./preflight-gate.cjs');
const yamlLite = require('./lib/yaml-lite.cjs');
const specialistSignoff = require('./lib/specialist-signoff.cjs');
const promptManifestRequired = require('./lib/prompt-manifest-required.cjs');
const oneCameraMovePerShot = require('./lib/one-camera-move-per-shot.cjs');
const visualContradiction = require('./lib/visual-contradiction.cjs');
const essentialismDiff = require('./lib/essentialism-diff.cjs');
const manifestToShotlist = require('./lib/manifest-to-shotlist.cjs');
const identityQuality = require('./lib/identity-quality.cjs');
const dpQuality = require('./lib/dp-quality.cjs');
const promptStructure = require('./lib/prompt-structure.cjs');
const narrativeQuality = require('./lib/narrative-quality.cjs');
const angleVariety = require('./lib/angle-variety.cjs');
const negativePromptDiscipline = require('./lib/negative-prompt-discipline.cjs');
const locucaoIdioma = require('./lib/locucao-idioma.cjs');
const productCloseup = require('./lib/product-closeup.cjs');
const expressaoFacial = require('./lib/expressao-facial.cjs');
const critique = require('./lib/critique.cjs');
const sceneBriefRequired = require('./lib/scene-brief-required.cjs');

const REQUIRED_FILES = [
  path.join('prompt', 'prompt.canonical.md'),
  path.join('prompt', 'prompt-manifest.yaml'),
  path.join('prompt', 'essentialism-diff.md'),
];

function sha256(content) {
  return crypto.createHash('sha256').update(String(content), 'utf8').digest('hex');
}

function listSpecialistReviewFiles(generationRoot) {
  const dir = path.join(generationRoot, 'specialist-reviews');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.json'))
    .sort()
    .map((f) => path.join(dir, f));
}

// Verifica a presenca dos artefatos obrigatorios. Devolve { ok, missing } sem
// lancar — quem chama decide se sai com erro.
function checkRequiredArtifacts(generationRoot) {
  const missing = [];
  for (const rel of REQUIRED_FILES) {
    const abs = path.join(generationRoot, rel);
    if (!fs.existsSync(abs)) missing.push(rel);
  }
  const reviews = listSpecialistReviewFiles(generationRoot);
  if (reviews.length === 0) missing.push('specialist-reviews/*.json (nenhum arquivo)');
  return { ok: missing.length === 0, missing, reviewFiles: reviews };
}

// runGates0_8: roda os 5 gates 0.8 + os 10 gates de conteudo legados (adaptados via
// manifest-to-shotlist.cjs) contra os artefatos de uma generationRoot ja existente (o
// chamador CLI garante presenca via checkRequiredArtifacts antes). projectRoot e opcional,
// usado so pelo identity-quality pra checar refs reais em disco.
// Devolve { ok, results:[{name,ok,errors}], manifest, promptHash }.
function runGates0_8(generationRoot, reviewFiles, projectRoot) {
  const results = [];

  // 1. specialist-signoff: le todas as reviews, valida a cadeia inteira.
  let reviews = [];
  let parseError = null;
  for (const f of reviewFiles) {
    try {
      const parsed = JSON.parse(fs.readFileSync(f, 'utf8'));
      reviews.push(parsed);
    } catch (e) {
      parseError = `${path.basename(f)}: JSON invalido (${e && e.message})`;
      break;
    }
  }
  if (parseError) {
    results.push({ name: 'specialist-signoff', ok: false, errors: [parseError] });
  } else {
    const chainResult = specialistSignoff.validateChain(reviews);
    results.push({ name: 'specialist-signoff', ok: chainResult.ok, errors: chainResult.errors || [] });
  }

  // 2. Le e parseia o prompt-manifest.yaml (necessario para os proximos 3 gates).
  const manifestPath = path.join(generationRoot, 'prompt', 'prompt-manifest.yaml');
  let manifest = null;
  let manifestParseError = null;
  try {
    const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
    manifest = yamlLite.parse(manifestRaw);
  } catch (e) {
    manifestParseError = `prompt-manifest.yaml: falha ao ler/parsear (${e && e.message})`;
  }

  if (manifestParseError) {
    results.push({ name: 'prompt-manifest-required', ok: false, errors: [manifestParseError] });
    results.push({ name: 'one-camera-move-per-shot', ok: false, errors: [manifestParseError] });
    results.push({ name: 'visual-contradiction', ok: false, errors: [manifestParseError] });
  } else {
    const r1 = promptManifestRequired.check(manifest);
    results.push({ name: 'prompt-manifest-required', ok: r1.ok, errors: r1.errors || [] });

    const r2 = oneCameraMovePerShot.check(manifest);
    results.push({ name: 'one-camera-move-per-shot', ok: r2.ok, errors: r2.errors || [] });

    const r3 = visualContradiction.check(manifest);
    results.push({ name: 'visual-contradiction', ok: r3.ok, errors: r3.errors || [] });
  }

  // 5. essentialism-diff: le o markdown e roda contra os artefatos reais de prompt.
  const diffPath = path.join(generationRoot, 'prompt', 'essentialism-diff.md');
  let diffContent = null;
  let diffReadError = null;
  try {
    diffContent = fs.readFileSync(diffPath, 'utf8');
  } catch (e) {
    diffReadError = `essentialism-diff.md: falha ao ler (${e && e.message})`;
  }
  if (diffReadError) {
    results.push({ name: 'essentialism-diff', ok: false, errors: [diffReadError] });
  } else {
    const modelTarget = manifest && manifest.model_target;
    const diffResult = essentialismDiff.check(diffContent, {
      generationRoot,
      canonicalPath: path.join(generationRoot, 'prompt', 'prompt.canonical.md'),
      modelPath: modelTarget ? path.join(generationRoot, 'prompt', `prompt.${modelTarget}.md`) : undefined,
      modelName: modelTarget,
    });
    results.push({ name: 'essentialism-diff', ok: diffResult.ok, errors: diffResult.errors || [] });
  }

  // 6. scene-brief-required: valida consistencia scenes[]/shots[]/cena_brief.
  // So roda se o manifesto parseou e tem scenes[] ou shots[] com cena_id.
  if (!manifestParseError && manifest) {
    const sbResult = sceneBriefRequired.check(manifest);
    results.push({ name: 'scene-brief-required', ok: sbResult.ok, errors: sbResult.errors || [], warnings: sbResult.warnings || [] });
  }

  let promptHash = null;
  const canonicalPath = path.join(generationRoot, 'prompt', 'prompt.canonical.md');
  let canonicalProse = '';
  if (fs.existsSync(canonicalPath)) {
    canonicalProse = fs.readFileSync(canonicalPath, 'utf8');
    promptHash = sha256(canonicalProse);
  }

  // 7. Os 10 gates de conteudo legados (nascidos de bug real de producao), adaptados
  // pro formato do manifesto 0.8. So rodam se o manifesto parseou (senao ja reprovou
  // acima em prompt-manifest-required e nao ha shots confiaveis pra avaliar).
  if (!manifestParseError) {
    const shotlist = manifestToShotlist.adaptManifestToShotlist(manifest, canonicalProse);

    const contentGates = [
      { name: 'identity-quality', run: () => identityQuality.evaluateShotlistRefs(shotlist, 'shotlist', { projectRoot }) },
      { name: 'dp-quality', run: () => dpQuality.evaluateShotlistDp(shotlist, 'shotlist-dp') },
      { name: 'prompt-structure', run: () => promptStructure.evaluateShotlist(shotlist, 'inline') },
      { name: 'narrative-quality', run: () => narrativeQuality.evaluateShotlist(shotlist, 'inline') },
      { name: 'angle-variety', run: () => angleVariety.evaluateShotlist(shotlist, 'inline') },
      { name: 'negative-prompt-discipline', run: () => negativePromptDiscipline.evaluateShotlist(shotlist, 'inline') },
      { name: 'locucao-idioma', run: () => locucaoIdioma.evaluateShotlist(shotlist, 'inline') },
      { name: 'product-closeup', run: () => productCloseup.evaluateShotlist(shotlist, 'inline') },
      { name: 'expressao-facial', run: () => expressaoFacial.evaluateShotlist(shotlist, 'inline') },
    ];

    for (const gate of contentGates) {
      try {
        const r = gate.run();
        results.push({ name: gate.name, ok: r.ok, errors: r.errors || [] });
      } catch (e) {
        results.push({ name: gate.name, ok: false, errors: [`falha ao rodar: ${e && e.message}`] });
      }
    }

    // critique.cjs tem formato de retorno proprio (gate_aprovado/parecer), normalizado aqui.
    try {
      const cr = critique.evaluateShotlist(shotlist, 'inline');
      results.push({
        name: 'critique',
        ok: !!cr.gate_aprovado,
        errors: cr.gate_aprovado ? [] : [cr.parecer || 'critique reprovou (ver gate_anti_ia.reprovado_por)'],
      });
    } catch (e) {
      results.push({ name: 'critique', ok: false, errors: [`falha ao rodar: ${e && e.message}`] });
    }
  }

  const ok = results.every((r) => r.ok);

  return { ok, results, manifest, promptHash };
}

function formatErrors(result) {
  const lines = [];
  for (const r of result.results) {
    if (r.ok) {
      lines.push(`PASS ${r.name}`);
    } else {
      const errs = r.errors && r.errors.length ? r.errors : ['reprovado'];
      for (const e of errs) {
        lines.push(`FAIL ${r.name} :: ${e}`);
      }
    }
  }
  return lines;
}

function main() {
  const argv = process.argv.slice(2);
  let root = null;
  let project = null;
  let generation = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') root = argv[++i];
    else if (argv[i] === '--project') project = argv[++i];
    else if (argv[i] === '--generation') generation = argv[++i];
  }
  if (!root || !project || !generation) {
    console.error('Uso: node scripts/preflight-gate-0.8.cjs --root . --project <project_id> --generation <generation-id>');
    process.exit(2);
  }

  const repoRoot = path.resolve(root);
  let projectRoot;
  let generationRoot;
  try {
    projectRoot = genPaths.resolveProjectRoot(repoRoot, project);
    generationRoot = genPaths.resolveGenerationRoot(projectRoot, generation);
  } catch (e) {
    console.error(`[preflight-gate-0.8] path invalido: ${e && e.message}`);
    process.exit(1);
  }

  if (!fs.existsSync(generationRoot)) {
    console.error(`[preflight-gate-0.8] generation root ausente: ${path.relative(repoRoot, generationRoot)}`);
    process.exit(1);
  }

  const presence = checkRequiredArtifacts(generationRoot);
  if (!presence.ok) {
    console.error('[preflight-gate-0.8] artefatos obrigatorios ausentes:');
    for (const m of presence.missing) console.error(`  - ${m}`);
    process.exit(1);
  }

  const result = runGates0_8(generationRoot, presence.reviewFiles, projectRoot);

  for (const line of formatErrors(result)) {
    if (line.startsWith('FAIL')) console.error(line);
    else console.log(line);
  }

  if (!result.ok) {
    preflightGate.clearToken(repoRoot);
    console.error('\nGate 0.8 REPROVOU. Nao gaste credito: conserte os criterios acima e rode de novo.');
    process.exit(1);
  }

  const promptHash = result.promptHash;
  const gatesSnapshotHash = sha256(JSON.stringify(result.results));
  const canonicalRel = path.relative(repoRoot, path.join(generationRoot, 'prompt', 'prompt.canonical.md')).replace(/\\/g, '/');
  const gateNames = result.results.map((r) => r.name);

  preflightGate.armToken(repoRoot, project, canonicalRel, promptHash, gateNames, undefined, {
    generation_id: generation,
    project_id: project,
    prompt_hash: promptHash,
    gates_snapshot_hash: gatesSnapshotHash,
    mode: '0.8',
  });

  console.log(`\nGate 0.8 ARMADO: ${gateNames.length} gates verdes. generation_id=${generation} prompt_hash=${promptHash ? promptHash.slice(0, 8) : '(ausente)'}. Falta aprovacao humana (scripts/approve-generation.cjs) antes de gastar credito.`);
  process.exit(0);
}

module.exports = {
  REQUIRED_FILES,
  checkRequiredArtifacts,
  listSpecialistReviewFiles,
  runGates0_8,
};

if (require.main === module) {
  main();
}
