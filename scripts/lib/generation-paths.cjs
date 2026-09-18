'use strict';

const fs = require('fs');
const path = require('path');

const REQUIRED_DIRS = [
  'specialist-reviews',
  'prompt',
  'gates',
  'approval',
  path.join('production', 'outputs'),
  'critique',
];

function cleanSegment(value, fallback) {
  const raw = String(value || '').trim().toLowerCase();
  const cleaned = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return cleaned || fallback;
}

function assertSafeSegment(name, value) {
  if (!value || typeof value !== 'string') {
    throw new Error(`${name} obrigatorio`);
  }
  if (path.isAbsolute(value) || value.split(/[\\/]+/).includes('..')) {
    throw new Error(`${name} inseguro: ${value}`);
  }
}

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}

function resolveProjectRoot(root, projectId) {
  assertSafeSegment('projectId', projectId);
  const rootAbs = path.resolve(root || '.');
  const projectRoot = path.resolve(rootAbs, 'projects', projectId);
  if (!isInside(path.resolve(rootAbs, 'projects'), projectRoot)) {
    throw new Error(`projectId fora de projects/: ${projectId}`);
  }
  return projectRoot;
}

function createGenerationId(options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  if (Number.isNaN(now.getTime())) {
    throw new Error('now invalido para generation id');
  }
  const date = now.toISOString().slice(0, 10);
  const slug = cleanSegment(options.slug || 'geracao', 'geracao');
  return `${date}-${slug}`;
}

function resolveGenerationRoot(projectRoot, generationId) {
  assertSafeSegment('generationId', generationId);
  const projectAbs = path.resolve(projectRoot || '.');
  const generationsAbs = path.resolve(projectAbs, 'generations');
  const generationRoot = path.resolve(generationsAbs, generationId);
  if (!isInside(generationsAbs, generationRoot)) {
    throw new Error(`generationId fora de generations/: ${generationId}`);
  }
  return generationRoot;
}

function ensureGenerationTree(generationRoot) {
  const rootAbs = path.resolve(generationRoot);
  fs.mkdirSync(rootAbs, { recursive: true });
  for (const dir of REQUIRED_DIRS) {
    fs.mkdirSync(path.join(rootAbs, dir), { recursive: true });
  }
  return relativeGenerationPaths(rootAbs);
}

function relativeGenerationPaths(generationRoot) {
  const rootAbs = path.resolve(generationRoot);
  const paths = {
    root: rootAbs,
    specialist_reviews: path.join(rootAbs, 'specialist-reviews'),
    prompt: path.join(rootAbs, 'prompt'),
    gates: path.join(rootAbs, 'gates'),
    approval: path.join(rootAbs, 'approval'),
    production: path.join(rootAbs, 'production'),
    production_outputs: path.join(rootAbs, 'production', 'outputs'),
    critique: path.join(rootAbs, 'critique'),
  };
  return Object.fromEntries(
    Object.entries(paths).map(([key, value]) => [key, (path.relative(rootAbs, value) || '.').replace(/\\/g, '/')])
  );
}

function buildGenerationContext(root, projectId, generationId) {
  const projectRoot = resolveProjectRoot(root, projectId);
  const generationRoot = resolveGenerationRoot(projectRoot, generationId);
  return {
    project_id: projectId,
    generation_id: generationId,
    root: path.relative(path.resolve(root || '.'), generationRoot).replace(/\\/g, '/'),
    compat_output: path.relative(path.resolve(root || '.'), path.join(projectRoot, 'output')).replace(/\\/g, '/'),
  };
}

module.exports = {
  REQUIRED_DIRS,
  resolveProjectRoot,
  createGenerationId,
  resolveGenerationRoot,
  ensureGenerationTree,
  relativeGenerationPaths,
  buildGenerationContext,
};

// CLI: cria a arvore de uma geracao nova ANTES da intake comecar — fecha o gap
// entre o que CLAUDE.md/roteiro.md documentam (intake gravada em
// `generations/<id>/.intake-state.json`) e o fato de nao existir, ate agora,
// nenhum jeito de criar esse `<id>` fora de um `node -e` improvisado.
//
// Uso: node scripts/lib/generation-paths.cjs create --root projects/<nome> --slug <slug>
//   -> { generation_id, root, ...paths } — generation_id serve de `--generation`
//      pro intake-state.cjs e demais scripts da Fase 1-3.
if (require.main === module) {
  const parseArgs = require('./parse-args.cjs');
  const sub = process.argv[2] || 'create';
  const args = parseArgs(process.argv, 3);
  const root = args.root || '.';
  let result;
  switch (sub) {
    case 'create': {
      const generationId = createGenerationId({ slug: args.slug });
      const generationRoot = resolveGenerationRoot(root, generationId);
      const paths = ensureGenerationTree(generationRoot);
      result = { generation_id: generationId, ...paths };
      break;
    }
    default:
      result = { erro: 'subcomando desconhecido', uso: 'create --root projects/<nome> --slug <slug>' };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(0);
}
