#!/usr/bin/env node
'use strict';

/**
 * ensure-dir.cjs — cria diretorios relativos a um projeto, sem node -e.
 *
 * Uso:
 *   node scripts/lib/ensure-dir.cjs --root projects/example-hero output/imagens output/clips
 *
 * O root precisa estar dentro do repo atual (cwd), e cada diretorio precisa ser
 * relativo ao root, sem path traversal. Resultado em JSON; exit 1 em erro.
 */

const fs = require('fs');
const path = require('path');
const parseArgs = require('./parse-args.cjs');

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!!rel && !rel.startsWith('..') && !path.isAbsolute(rel));
}

function ensureDirs(rootArg, dirs) {
  const repoRoot = process.cwd();
  const root = path.resolve(repoRoot, rootArg || '.');
  if (!isInside(repoRoot, root)) {
    return { ok: false, erro: 'root fora do repo', root };
  }
  if (!Array.isArray(dirs) || dirs.length === 0) {
    return { ok: false, erro: 'informe ao menos um diretorio relativo ao root' };
  }

  const created = [];
  for (const dir of dirs) {
    if (!dir || path.isAbsolute(dir) || String(dir).split(/[\\/]+/).includes('..')) {
      return { ok: false, erro: `diretorio invalido: ${String(dir)}` };
    }
    const target = path.resolve(root, dir);
    if (!isInside(root, target)) {
      return { ok: false, erro: `diretorio fora do root: ${String(dir)}` };
    }
    fs.mkdirSync(target, { recursive: true });
    created.push(path.relative(repoRoot, target).replace(/\\/g, '/'));
  }
  return { ok: true, root: path.relative(repoRoot, root).replace(/\\/g, '/') || '.', dirs: created };
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const filteredDirs = [];
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--root') {
      i++;
      continue;
    }
    if (arg.startsWith('--')) continue;
    filteredDirs.push(arg);
  }
  const result = ensureDirs(args.root || '.', filteredDirs);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result.ok ? 0 : 1);
}

module.exports = { ensureDirs, isInside };
