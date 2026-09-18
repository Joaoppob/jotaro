#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const REF_RE = /^RAG\/identidade-visual\/([^/.]+\/)*[^/]+\.(png|jpg|jpeg|webp)$/i;
const MARCA_DIR = 'marca';
const ROOT_BUCKET = '__root__';
// mesma heuristica de scripts/lib/product-closeup.cjs -- deteta se o shot final do
// prompt-forge mostra um produto fisico em destaque, pra cobrar fidelidade de referencia.
const PRODUCT_HINT_RE = /produto|\bpote\b|\bjar\b|package|embalagem|\bgoma\b|gummy|gummies|\bfrasco\b/i;
const GENERIC_ANCHOR = /\b(generic|person|character|brand|logo|nice|beautiful|premium|style|generico|genérico|pessoa|personagem|marca|bonito|estilo)\b/giu;
const STOPLIST = new Set([
  'same', 'from', 'the', 'with', 'and', 'character', 'reference', 'images',
  'image', 'style', 'frame', 'vertical', 'mobile', 'brand', 'identity',
  'premium', 'realistic', 'social', 'portraiture',
  'mesmo', 'mesma', 'referencia', 'referência', 'referencias', 'referências',
  'imagem', 'imagens', 'estilo', 'quadro', 'vertical', 'marca', 'identidade',
  'personagem', 'pessoa', 'realista',
]);

function normRef(ref) {
  return String(ref || '').replace(/\\/g, '/');
}

function parseRef(ref) {
  const normalized = normRef(ref);
  const ok = REF_RE.test(normalized) && !normalized.split('/').includes('..') && !path.isAbsolute(String(ref || ''));
  if (!ok) return { ok: false, ref: normalized, bucket: null, file: null };
  const rest = normalized.slice('RAG/identidade-visual/'.length);
  const parts = rest.split('/');
  if (parts.length === 1) {
    return { ok: true, ref: normalized, bucket: ROOT_BUCKET, file: parts[0] };
  }
  return { ok: true, ref: normalized, bucket: parts[0], file: parts[parts.length - 1] };
}

function distinctiveTokens(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^\p{L}]+/u)
    .filter((w) => /^\p{L}+$/u.test(w) && w.length >= 4 && !STOPLIST.has(w));
}

function summarizeRefs(refs) {
  const out = {
    total: 0,
    invalid: [],
    root: [],
    marca: [],
    personagens: {},
  };
  for (const ref of Array.isArray(refs) ? refs : []) {
    const parsed = parseRef(ref);
    if (!parsed.ok) {
      out.invalid.push(normRef(ref));
      continue;
    }
    out.total += 1;
    if (parsed.bucket === ROOT_BUCKET) out.root.push(parsed.ref);
    else if (parsed.bucket.toLowerCase() === MARCA_DIR) out.marca.push(parsed.ref);
    else {
      if (!out.personagens[parsed.bucket]) out.personagens[parsed.bucket] = [];
      out.personagens[parsed.bucket].push(parsed.ref);
    }
  }
  return out;
}

function scoreResult(artifacto, score, errors, warnings, extra) {
  return Object.assign({
    artifacto,
    ok: errors.length === 0,
    score: Math.max(0, Math.min(100, Math.round(score))),
    errors,
    warnings,
  }, extra || {});
}

function evaluateIdentity(identity, artifacto = 'identity') {
  const errors = [];
  const warnings = [];
  const refs = Array.isArray(identity && identity.refs) ? identity.refs : [];
  const refSummary = summarizeRefs(refs);
  const anchor = String((identity && identity.anchor_textual) || '');
  const tokens = distinctiveTokens(anchor);
  const genericHits = (anchor.match(GENERIC_ANCHOR) || []).length;

  let score = 100;
  if (refs.length === 0) {
    errors.push('refs ausentes: identidade sem referencia visual nao pode gerar com consistencia');
    score -= 45;
  }
  if (refSummary.invalid.length) {
    errors.push(`refs invalidas ou inseguras: ${refSummary.invalid.join(', ')}`);
    score -= 35;
  }
  if (anchor.length < 80) {
    errors.push(`anchor_textual curto demais (${anchor.length} chars, min 80)`);
    score -= 35;
  }
  if (tokens.length < 8) {
    errors.push(`anchor_textual generico: so ${tokens.length} tracos distintivos (min 8)`);
    score -= 30;
  }
  if (genericHits >= 3) {
    errors.push('anchor_textual usa termos genericos demais; enumere tracos fisicos/material/roupa');
    score -= 20;
  }

  const personagemCount = Object.keys(refSummary.personagens).length;
  if (personagemCount > 1) {
    warnings.push(`identidade contem ${personagemCount} personagens; prompt-smith deve rotear refs por cena`);
  }
  if (refSummary.root.length && personagemCount > 0) {
    warnings.push('refs planas e subpastas coexistem; confirme se raiz e sujeito unico ou material legado');
    score -= 5;
  }
  if (!refSummary.marca.length && personagemCount > 0) {
    warnings.push('sem refs em RAG/identidade-visual/marca/; cenas de marca/produto podem ficar soltas');
  }

  return scoreResult(artifacto, score, errors, warnings, {
    refs: refSummary,
    anchor: {
      chars: anchor.length,
      distinctive_tokens: tokens.length,
      generic_hits: genericHits,
    },
  });
}

// Conta imagens de referencia numa subpasta de personagem no disco. `baseRoot` e a
// raiz do projeto (ex.: projects/example-hero) resolvida a partir do `projeto` do
// prompt-forge; retorna 0 se a pasta nao existe ou nao ha imagens.
function countCharacterRefs(baseRoot, personagem) {
  if (!baseRoot || !personagem) return 0;
  const dir = path.join(baseRoot, 'RAG', 'identidade-visual', personagem);
  let entries;
  try { entries = fs.readdirSync(dir); } catch (_) { return 0; }
  return entries.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f)).length;
}

// conta imagens reais do produto em RAG/identidade-visual/marca/ -- a mesma pasta
// reservada de refs de marca/produto (nao personagem; ver identidade-visual.cjs).
function countMarcaProductRefs(baseRoot) {
  if (!baseRoot) return 0;
  const dir = path.join(baseRoot, 'RAG', 'identidade-visual', MARCA_DIR);
  let entries;
  try { entries = fs.readdirSync(dir); } catch (_) { return 0; }
  return entries.filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f)).length;
}

// o shot final do prompt-forge mostra o produto em destaque? (mesma heuristica do
// product-closeup.cjs, aplicada so a ultima shot -- e onde o produto fecha o anuncio).
function lastShotMentionsProduct(promptForge) {
  const shots = Array.isArray(promptForge && promptForge.shots) ? promptForge.shots : [];
  if (shots.length === 0) return false;
  const last = shots[shots.length - 1];
  return PRODUCT_HINT_RE.test(String((last && last.descricao) || ''));
}

// 0.7: o artefato e o prompt-forge (PROMPT UNICO). A identidade vem da REFERENCIA
// (o Element), nao de anchor textual + refs per-cena. Valida:
//   (a) se ha `personagem`, exige `element_id` nao-nulo OU refs no disco em
//       <projeto>/RAG/identidade-visual/<personagem>/;
//   (b) sem mistura de personagens (o schema carrega um unico personagem; se a prosa
//       nomear outra personagem conhecida por subpasta, alerta).
//   (c) se o shot final mostra o produto em destaque, exige referencia real dele
//       (RAG/identidade-visual/marca/) e, quando ha produto_element_id, que o
//       marcador realmente apareca na prosa — a mesma disciplina do Element de
//       personagem, aplicada ao produto fisico.
// `opts.projectRoot` permite apontar a raiz do projeto no disco (default: derivado
// de `projeto`, resolvido contra o cwd).
function evaluateShotlistRefs(promptForge, artifacto = 'shotlist', opts = {}) {
  const errors = [];
  const warnings = [];
  let score = 100;
  const lower = (s) => String(s || '').toLowerCase();

  const personagem = promptForge && promptForge.personagem
    ? String(promptForge.personagem).trim()
    : null;
  const elementId = promptForge && promptForge.element_id != null
    ? String(promptForge.element_id).trim()
    : '';
  // <<<element_id>>> e o marcador injetado (backend reescreve pra @nome) — conta como
  // Element presente. Só null/vazio é ausencia.
  const hasElement = elementId.length > 0;

  const projeto = promptForge && promptForge.projeto ? String(promptForge.projeto) : null;
  const projectRoot = opts.projectRoot
    || (projeto ? path.join(process.cwd(), 'projects', projeto) : null);

  if (personagem) {
    const refCount = countCharacterRefs(projectRoot, personagem);
    if (!hasElement && refCount === 0) {
      errors.push(`personagem "${personagem}" sem Element (element_id null) e sem refs em RAG/identidade-visual/${personagem}/ — a identidade precisa de ancora (Element treinado ou biblioteca de refs) antes de gerar`);
      score -= 45;
    }
    if (!hasElement && refCount > 0) {
      warnings.push(`personagem "${personagem}" sem element_id, mas ${refCount} ref(s) no disco — o Element deve ser treinado a partir dessas refs antes do job`);
      score -= 10;
    }
    // Mistura: outra personagem (com subpasta propria) nomeada na prosa.
    const prompt = lower(String((promptForge && promptForge.prompt) || ''));
    if (projectRoot) {
      let chars = [];
      try {
        const base = path.join(projectRoot, 'RAG', 'identidade-visual');
        chars = fs.readdirSync(base, { withFileTypes: true })
          .filter((d) => d.isDirectory() && d.name.toLowerCase() !== MARCA_DIR)
          .map((d) => d.name);
      } catch (_) { chars = []; }
      // Comparacao case-insensitive: a subpasta da propria personagem (ex.: 'duda')
      // NAO conta como "outra personagem" quando o campo personagem e 'Duda'.
      const personagemLower = lower(personagem);
      const outros = chars.filter((c) => lower(c) !== personagemLower && prompt.includes(c.toLowerCase()));
      if (outros.length) {
        errors.push(`prosa mistura personagens: alem de "${personagem}", nomeia ${outros.join(', ')} — um prompt-forge = uma personagem ancorada`);
        score -= 30;
      }
    }
  }

  // Fidelidade do produto real: quando o fechamento mostra o produto em destaque, o
  // Element do produto (produto_element_id) TEM que ancorar isso — senao o modelo
  // INVENTA a embalagem. Ja aconteceu de verdade: um "pote" generico onde o produto
  // real e um frasco de suplemento ambar com tampa lilas (run de producao, 2026-07-01).
  //
  // Prioridade maxima e nao-negociavel: refs reais SEM
  // Element deixou de ser aviso e virou reprovacao. Uma foto real descrita em prosa
  // ainda deixa espaco pro modelo interpretar/desviar; so o Element ancora de verdade.
  // Sem nenhuma ancora = erro (pior caso). Refs sem Element = TAMBEM erro agora (nao
  // e mais "funciona, so nao e maximo" — e "nao gera sem o Element pronto"). Element
  // declarado mas nao injetado na prosa = erro (Element existe e nao esta sendo usado).
  let produtoElementPresent = false;
  if (lastShotMentionsProduct(promptForge)) {
    const produtoElementId = promptForge && promptForge.produto_element_id != null
      ? String(promptForge.produto_element_id).trim()
      : '';
    produtoElementPresent = produtoElementId.length > 0;
    const produtoRefCount = countMarcaProductRefs(projectRoot);

    if (!produtoElementPresent && produtoRefCount === 0) {
      errors.push('fechamento mostra o produto em destaque, mas o projeto nao tem referencia real dele (RAG/identidade-visual/marca/) nem produto_element_id — sem ancora, o modelo inventa a embalagem');
      score -= 45;
    } else if (!produtoElementPresent && produtoRefCount > 0) {
      errors.push(`fechamento mostra o produto com ${produtoRefCount} ref(s) reais em RAG/identidade-visual/marca/, mas sem produto_element_id — o produto PRECISA do Element antes de gerar (prioridade maxima, nao-negociavel; ver RAG/identidade-visual/marca/produto.md). Crie o Element do produto (mesmo fluxo do Element de personagem) antes de continuar.`);
      score -= 35;
    } else if (produtoElementPresent) {
      const promptText = String((promptForge && promptForge.prompt) || '');
      if (!promptText.includes(produtoElementId)) {
        errors.push(`produto_element_id definido ("${produtoElementId}") mas o marcador <<<${produtoElementId}>>> nao aparece no prompt — o Element existe e nao esta ancorando a prosa`);
        score -= 30;
      }
    }
  }

  return scoreResult(artifacto, score, errors, warnings, {
    personagem: personagem || null,
    element_present: hasElement,
    produto_element_present: produtoElementPresent,
    project_root: projectRoot,
  });
}

module.exports = {
  parseRef,
  summarizeRefs,
  evaluateIdentity,
  evaluateShotlistRefs,
};

if (require.main === module) {
  const mode = process.argv[2];
  const file = process.argv[3];
  if (!file || (mode !== 'identity' && mode !== 'shotlist')) {
    console.error('Uso: node scripts/lib/identity-quality.cjs identity|shotlist <arquivo.json>');
    process.exit(2);
  }
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const result = mode === 'identity'
    ? evaluateIdentity(json, file)
    : evaluateShotlistRefs(json, file);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exit(1);
}
