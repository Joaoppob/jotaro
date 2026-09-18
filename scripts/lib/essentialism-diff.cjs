'use strict';

const fs = require('fs');
const path = require('path');

const EMPTY_QUALITY = [
  'masterpiece', '8k', 'ultra realistic', 'ultra-realistic', 'photoreal',
  'photorealistic', 'best quality', 'award-winning', 'beautiful', 'stunning',
  'breathtaking', 'perfect', 'hyper-realistic', 'hyperrealistic', 'ultra-detailed',
];

function findForbiddenTerms(text) {
  const found = [];
  for (const term of EMPTY_QUALITY) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'i');
    if (regex.test(text)) {
      found.push(term);
    }
  }
  return found;
}

// Remove trechos entre crases (`termo`) antes de checar termos proibidos no
// essentialism-diff.md. O diff e prosa de auditoria humana: ele pode citar um
// termo proibido em backticks como EXEMPLO do que nao foi usado (ex.: "nenhum
// termo da lista (`masterpiece`, `8k`) apareceu no draft") sem que isso
// signifique que o termo esta de fato no prompt. So o texto fora de backticks
// e checado. Nao se aplica a canonicalContent/modelContent (prompt real que
// vai pro modelo) — la, qualquer ocorrencia do termo e real, backtick ou nao.
function stripBacktickQuoted(text) {
  return String(text || '').replace(/`[^`]*`/g, ' ');
}

// Le um arquivo de prompt (canonical ou <model>) se ele existir. Tolerante a
// ausencia: retorna null em vez de lancar, e quem chama registra isso como
// "nao verificado" em vez de erro de gate.
function readPromptArtifact(filePath) {
  if (!filePath) return null;
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

// Resolve os paths default de prompt.canonical.md e prompt.<model>.md a partir
// de uma generation root (ver scripts/lib/generation-paths.cjs: artefatos do
// prompt-smith vivem em <generationRoot>/prompt/).
function resolveDefaultPromptPaths(generationRoot, modelName) {
  if (!generationRoot) return {};
  const promptDir = path.join(generationRoot, 'prompt');
  const result = { canonical: path.join(promptDir, 'prompt.canonical.md') };
  if (modelName) {
    result.model = path.join(promptDir, `prompt.${modelName}.md`);
  }
  return result;
}

/**
 * Checa o diff de essencialismo (completude estrutural + quality-words) e,
 * quando fornecido via `options`, TAMBEM checa quality-words proibidas nos
 * artefatos que de fato vao pro modelo: prompt.canonical.md e prompt.<model>.md.
 * O diff em si so documenta a decisao; quem protege o output real e essa
 * checagem adicional.
 *
 * Retrocompatibilidade: `check(mdContent)` (assinatura original, 1 argumento)
 * continua funcionando identico a antes — a checagem de prompt-artifacts e
 * inteiramente opt-in via o segundo argumento `options`.
 *
 * @param {string} mdContent - conteudo do essentialism-diff.md
 * @param {Object} [options]
 * @param {string} [options.generationRoot] - raiz da generation; se fornecido,
 *   resolve os paths default de prompt.canonical.md / prompt.<model>.md
 * @param {string} [options.modelName] - nome do modelo (para prompt.<model>.md)
 * @param {string} [options.canonicalPath] - path explicito para prompt.canonical.md
 *   (sobrepoe o resolvido via generationRoot)
 * @param {string} [options.modelPath] - path explicito para prompt.<model>.md
 *   (sobrepoe o resolvido via generationRoot)
 * @param {string} [options.canonicalContent] - conteudo ja lido do prompt canonico
 *   (evita I/O quando o chamador ja tem o conteudo em mao)
 * @param {string} [options.modelContent] - conteudo ja lido do prompt do modelo
 */
function check(mdContent, options) {
  const errors = [];
  const text = String(mdContent || '');
  const opts = options || {};
  const checkedArtifacts = [];
  const skippedArtifacts = [];

  if (!/## Cortado/.test(text)) {
    errors.push('essentialism diff: secao ## Cortado ausente');
  }
  if (!/## Preservado/.test(text)) {
    errors.push('essentialism diff: secao ## Preservado ausente');
  }
  if (!/## Motivo dos cortes/.test(text)) {
    errors.push('essentialism diff: secao ## Motivo dos cortes ausente');
  }
  if (!/## Riscos remanescentes/.test(text)) {
    errors.push('essentialism diff: secao ## Riscos remanescentes ausente');
  }

  const cortadoIdx = text.indexOf('## Cortado');
  const motivoIdx = text.indexOf('## Motivo dos cortes');
  if (cortadoIdx >= 0 && motivoIdx >= 0) {
    const cortadoSection = text.slice(cortadoIdx, motivoIdx);
    const lines = cortadoSection.split('\n').filter((l) => l.trim().startsWith('-'));
    if (lines.length === 0) {
      errors.push('essentialism diff: nenhum corte listado na secao ## Cortado');
    }
  }

  for (const term of findForbiddenTerms(stripBacktickQuoted(text))) {
    errors.push(`essentialism diff contem termo proibido: "${term}"`);
  }

  const hasPreservado = /## Preservado[\s\S]*?- /.test(text);
  if (!hasPreservado) {
    errors.push('essentialism diff: secao ## Preservado sem itens');
  }

  // Checagem adicional (opt-in): quality-words proibidas nos artefatos reais
  // que vao pro modelo, nao so no relatorio de auditoria sobre eles.
  const defaultPaths = resolveDefaultPromptPaths(opts.generationRoot, opts.modelName);
  const canonicalPath = opts.canonicalPath || defaultPaths.canonical;
  const modelPath = opts.modelPath || defaultPaths.model;

  const canonicalContent = opts.canonicalContent != null
    ? String(opts.canonicalContent)
    : readPromptArtifact(canonicalPath);
  if (canonicalContent != null) {
    checkedArtifacts.push('prompt.canonical.md');
    for (const term of findForbiddenTerms(canonicalContent)) {
      errors.push(`prompt.canonical.md contem termo proibido: "${term}"`);
    }
  } else if (canonicalPath || opts.canonicalContent !== undefined) {
    skippedArtifacts.push({ artifact: 'prompt.canonical.md', reason: 'arquivo ausente', path: canonicalPath || null });
  }

  const modelContent = opts.modelContent != null
    ? String(opts.modelContent)
    : readPromptArtifact(modelPath);
  if (modelContent != null) {
    const label = opts.modelName ? `prompt.${opts.modelName}.md` : 'prompt.<model>.md';
    checkedArtifacts.push(label);
    for (const term of findForbiddenTerms(modelContent)) {
      errors.push(`${label} contem termo proibido: "${term}"`);
    }
  } else if (modelPath || opts.modelContent !== undefined) {
    skippedArtifacts.push({
      artifact: opts.modelName ? `prompt.${opts.modelName}.md` : 'prompt.<model>.md',
      reason: 'arquivo ausente',
      path: modelPath || null,
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    // Documenta o que foi de fato verificado nos artefatos de producao, para
    // que o chamador saiba se a cobertura ficou so no diff (nenhum artifact
    // fornecido) ou se cobriu tambem prompt.canonical.md / prompt.<model>.md.
    checkedArtifacts,
    skippedArtifacts,
  };
}

module.exports = { check };
