#!/usr/bin/env node
'use strict';

/**
 * validate-rag.cjs — valida identidade de marca (por projeto) e o HUB compartilhado.
 *
 * Topologia multi-projeto:
 *   - Identidade de marca vive em projects/<nome>/RAG/ (marca, narrativa, identidade-visual).
 *   - O HUB brand-agnostic vive em RAG/ na raiz (prompts, review, troubleshooting, README).
 *
 * Modos:
 *   --project <path>   valida a identidade de UM projeto (ex.: --project projects/example-hero)
 *   --all-projects     varre projects/*: status "ativo" bloqueia, "rascunho" só avisa,
 *                      "arquivado" é pulado
 *   --hub              valida só o HUB compartilhado (RAG/ na raiz)
 *   (sem modo)         valida HUB + all-projects (validação completa do produto) sob --root
 *
 * exit 0 = ok; exit 1 = alguma invariante bloqueante falhou. JSON no stdout.
 */

const fs = require('fs');
const path = require('path');

const IMAGE_RE = /\.(png|jpg|jpeg|webp)$/i;

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

function exists(root, rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(root, rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

// Lista refs da pasta plana E das subpastas por personagem (asset-first). Antes era
// flat-only e projetos com biblioteca por personagem (nova/, kai/...) apareciam sem refs.
function listImages(root) {
  const dir = path.join(root, 'RAG', 'identidade-visual');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return []; }
  for (const e of entries) {
    if (e.isFile() && IMAGE_RE.test(e.name)) {
      out.push(`RAG/identidade-visual/${e.name}`);
    } else if (e.isDirectory()) {
      let subs;
      try { subs = fs.readdirSync(path.join(dir, e.name)); } catch (_) { subs = []; }
      for (const f of subs) {
        if (IMAGE_RE.test(f)) out.push(`RAG/identidade-visual/${e.name}/${f}`);
      }
    }
  }
  return out.sort();
}

// asset-first = ha ao menos uma subpasta de personagem com imagem.
function hasCharacterLibrary(root) {
  const dir = path.join(root, 'RAG', 'identidade-visual');
  if (!fs.existsSync(dir)) return false;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return false; }
  return entries.some((e) => {
    if (!e.isDirectory() || e.name.toLowerCase() === 'marca') return false;
    try { return fs.readdirSync(path.join(dir, e.name)).some((f) => IMAGE_RE.test(f)); }
    catch (_) { return false; }
  });
}

function hasHeadingMatching(text, pattern) {
  const normalized = text.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const escaped = pattern
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^##\\s+.*${escaped}.*$`, 'mi').test(normalized);
}

function countSections(text) {
  return (text.match(/^##\s+.+$/gm) || []).length;
}

function extractAnchor(text) {
  const marker = /Anchor textual canonico|Anchor textual canônico/i;
  const idx = text.search(marker);
  if (idx === -1) return '';
  const after = text.slice(idx);
  const fenceStart = after.indexOf('```');
  if (fenceStart === -1) return '';
  const rest = after.slice(fenceStart + 3);
  const fenceEnd = rest.indexOf('```');
  if (fenceEnd === -1) return '';
  return rest.slice(0, fenceEnd).trim();
}

// ---------- validação de identidade de marca (um projeto) ----------
function validateProject(projectRoot) {
  const checks = [];
  const add = (ok, name, detail) => checks.push({ ok, name, detail: detail || null });

  add(exists(projectRoot, 'project.json'), 'projeto tem project.json');
  add(exists(projectRoot, 'RAG/marca.md'), 'projeto tem RAG/marca.md');
  add(exists(projectRoot, 'RAG/narrativa.md'), 'projeto tem RAG/narrativa.md');

  const refs = listImages(projectRoot);
  const assetFirst = hasCharacterLibrary(projectRoot);
  add(refs.length >= 1, 'projeto tem ao menos uma imagem de referencia', refs.join(', '));
  // O teto de 4 refs vale so pro modelo flat (sujeito unico). Em asset-first (biblioteca
  // por personagem) cada personagem pode ter muitas refs — o teto nao se aplica.
  add(assetFirst || refs.length <= 4, 'projeto tem no maximo quatro imagens de referencia (flat)', refs.join(', '));
  add(refs.every((ref) => ref.startsWith('RAG/identidade-visual/')), 'paths de refs sao relativos ao projeto');

  if (exists(projectRoot, 'RAG/marca.md')) {
    const marca = read(projectRoot, 'RAG/marca.md');
    add(countSections(marca) >= 4, 'marca.md tem ao menos 4 secoes', `${countSections(marca)} encontradas`);
    for (const kw of ['O que', 'Publico', 'Estilo visual', 'Tom da comunicacao']) {
      add(hasHeadingMatching(marca, kw), `marca.md contem secao com "${kw}"`);
    }
    add(
      hasHeadingMatching(marca, 'Personagem central') || hasHeadingMatching(marca, 'Produto central'),
      'marca.md contem secao de personagem ou produto central'
    );
    const anchor = extractAnchor(marca);
    add(anchor.length >= 80, 'marca.md contem anchor textual canonico', anchor.slice(0, 80));
    add(/vertical 9:16 frame/i.test(anchor), 'anchor textual inclui vertical 9:16 frame');
  }

  if (exists(projectRoot, 'RAG/narrativa.md')) {
    const narrativa = read(projectRoot, 'RAG/narrativa.md');
    add(countSections(narrativa) >= 3, 'narrativa.md tem ao menos 3 secoes', `${countSections(narrativa)} encontradas`);
    for (const kw of ['Historia', 'Cenario', 'Como o']) {
      add(hasHeadingMatching(narrativa, kw), `narrativa.md contem secao com "${kw}"`);
    }
  }

  return { ok: checks.every((c) => c.ok), refs, checks };
}

// ---------- validação do HUB compartilhado ----------
function validateHub(repoRoot) {
  const checks = [];
  const add = (ok, name, detail) => checks.push({ ok, name, detail: detail || null });
  const hubFiles = [
    'RAG/README.md',
    'RAG/troubleshooting.md',
    'RAG/prompts/padroes-de-prompt.md',
    'RAG/prompts/exemplos.md',
    'RAG/prompts/exemplo-shotlist-mago.json',
    'RAG/prompts/exemplo-shotlist-produto.json',
    'RAG/prompts/exemplo-shotlist-servico.json',
    'RAG/review/consistencia-personagem.md',
    'RAG/review/qualidade-prompt.md',
    'RAG/review/reel-final.md',
    'RAG/review/regeneracao-cena.md',
  ];
  for (const file of hubFiles) add(exists(repoRoot, file), `HUB tem ${file}`);
  return { ok: checks.every((c) => c.ok), checks };
}

function projectStatus(projectRoot) {
  try {
    return JSON.parse(read(projectRoot, 'project.json')).status || null;
  } catch (_) {
    return null;
  }
}

function listProjects(repoRoot) {
  const dir = path.join(repoRoot, 'projects');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(dir, d.name))
    .filter((p) => fs.existsSync(path.join(p, 'project.json')));
}

// ---------- scan de todos os projetos respeitando status ----------
function validateAllProjects(repoRoot) {
  const projetos = [];
  let blocked = false;
  for (const projDir of listProjects(repoRoot)) {
    const nome = path.basename(projDir);
    const status = projectStatus(projDir);
    if (status === 'arquivado') {
      projetos.push({ nome, status, skipped: true, ok: true });
      continue;
    }
    const r = validateProject(projDir);
    // "ativo" bloqueia o produto; "rascunho" (ou status ausente) só avisa.
    const bloqueia = status === 'ativo';
    if (!r.ok && bloqueia) blocked = true;
    projetos.push({ nome, status, ok: r.ok, bloqueia, checks: r.checks, refs: r.refs });
  }
  return { ok: !blocked, projetos };
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const repoRoot = path.resolve(args.root || '.');
  let result;

  if (args.project) {
    result = validateProject(path.resolve(repoRoot, args.project));
  } else if (args['all-projects']) {
    result = validateAllProjects(repoRoot);
  } else if (args.hub) {
    result = validateHub(repoRoot);
  } else {
    // validação completa do produto: HUB + todos os projetos
    const hub = validateHub(repoRoot);
    const all = validateAllProjects(repoRoot);
    result = { ok: hub.ok && all.ok, hub, projetos: all.projetos };
  }

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result.ok ? 0 : 1);
}

module.exports = { validateProject, validateHub, validateAllProjects, listProjects, projectStatus, listImages, extractAnchor };
