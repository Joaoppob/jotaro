'use strict';

/**
 * yaml-lite.cjs — parser YAML minimo, sem dependencias externas.
 *
 * PROBLEMA QUE RESOLVE: os artefatos 0.8 (prompt-manifest.yaml, approval-record.yaml,
 * production-job.yaml, critique.yaml) sao escritos a mao em YAML (ver os `toYaml()` em
 * production-job.cjs e similares), mas o projeto nao tem NENHUMA dependencia externa
 * (package.json sem deps) — nao ha js-yaml disponivel para leitura. Este modulo cobre
 * SO o subconjunto de YAML que este projeto de fato escreve, calibrado contra os 4
 * exemplos reais em examples/{prompt-manifest,approval,production,critique}/.
 *
 * Suporta:
 * - indentacao de 2 espacos
 * - `chave: valor` (string sem aspas, string "com aspas", numero, boolean, null vazio)
 * - `chave:` seguido de bloco aninhado (objeto)
 * - `chave:` seguido de lista `- ` (item objeto multi-linha OU item escalar)
 * - arrays inline `[a, b, c]` e `[]`
 * - comentarios de linha inteira iniciados por `#` (comentario no fim da linha de
 *   valor NAO e suportado — nao ocorre nos artefatos deste projeto)
 *
 * NAO e um parser YAML geral. Nao usar fora deste projeto sem recalibrar.
 */

function stripComments(text) {
  return text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      return !(trimmed.startsWith('#'));
    })
    .join('\n');
}

function indentOf(line) {
  const m = line.match(/^( *)/);
  return m ? m[1].length : 0;
}

// Desescapa as sequencias que scripts/lib/yaml-escape.cjs (escapeYamlDoubleQuoted)
// produz na escrita: backslash escapado primeiro (senao os escapes seguintes
// dobram), depois aspas duplas, depois \n e \t literais viram os caracteres
// reais. Escrito assim porque o parser antes desta correcao nao interpretava
// NENHUMA sequencia de escape (so tirava as aspas via slice) -- writers como
// approve-generation.cjs e production-job.cjs interpolavam texto livre sem
// escaping nenhum, e um valor com `"` + quebra de linha fabricava chaves YAML
// extras/duplicadas ao ser relido (yaml-lite.cjs usa ultima-chave-vence).
function unescapeDoubleQuoted(value) {
  let out = '';
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '\\' && i + 1 < value.length) {
      const next = value[i + 1];
      if (next === '\\') { out += '\\'; i++; continue; }
      if (next === '"') { out += '"'; i++; continue; }
      if (next === 'n') { out += '\n'; i++; continue; }
      if (next === 't') { out += '\t'; i++; continue; }
    }
    out += value[i];
  }
  return out;
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === '') return null;
  if (value === '~' || value === 'null' || value === 'Null' || value === 'NULL') return null;
  if (value === 'true' || value === 'True' || value === 'TRUE') return true;
  if (value === 'false' || value === 'False' || value === 'FALSE') return false;

  // string entre aspas duplas
  if (value.length >= 2 && value[0] === '"' && value[value.length - 1] === '"') {
    return unescapeDoubleQuoted(value.slice(1, -1));
  }
  // string entre aspas simples
  if (value.length >= 2 && value[0] === "'" && value[value.length - 1] === "'") {
    return value.slice(1, -1);
  }

  // array inline: [a, b, c] ou []
  if (value[0] === '[' && value[value.length - 1] === ']') {
    const inner = value.slice(1, -1).trim();
    if (inner === '') return [];
    return inner.split(',').map((item) => parseScalar(item.trim()));
  }

  // numero
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);

  // string sem aspas
  return value;
}

// Divide "chave: resto" respeitando que pode nao haver ": " (ex: "chave:" sozinho).
function splitKeyValue(line) {
  const idx = line.indexOf(':');
  if (idx === -1) return null;
  const key = line.slice(0, idx).trim();
  const rest = line.slice(idx + 1);
  return { key, rest };
}

// Parseia um bloco de linhas (todas com indentacao >= baseIndent) como objeto.
// `lines` e o array completo; `startIdx` o indice da primeira linha do bloco;
// devolve { value, nextIdx } onde nextIdx e o indice logo apos o bloco consumido.
function parseBlock(lines, startIdx, baseIndent) {
  const obj = {};
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    const ind = indentOf(line);
    if (ind < baseIndent) break;
    if (ind > baseIndent) {
      // linha mais indentada do que esperado nesta chamada: nao deveria acontecer
      // se o chamador delimitou baseIndent corretamente; avanca defensivamente.
      i++;
      continue;
    }

    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('- ') || trimmedLine === '-') {
      // Bloco que comecou direto como lista sem chave-pai (nao esperado no topo,
      // mas defensivo): trata como lista solta nao suportada aqui, para.
      break;
    }

    const kv = splitKeyValue(line);
    if (!kv) { i++; continue; }
    const { key, rest } = kv;
    const restTrimmed = rest.trim();

    if (restTrimmed === '') {
      // chave: <nada> -> bloco aninhado (objeto ou lista) na indentacao seguinte
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j >= lines.length) {
        obj[key] = null;
        i = j;
        continue;
      }
      const childIndent = indentOf(lines[j]);
      if (childIndent <= baseIndent) {
        // nao ha bloco filho de fato (proxima linha volta ou fica no mesmo nivel)
        obj[key] = null;
        i++;
        continue;
      }
      const childTrimmed = lines[j].trim();
      if (childTrimmed.startsWith('- ') || childTrimmed === '-') {
        const res = parseList(lines, j, childIndent);
        obj[key] = res.value;
        i = res.nextIdx;
      } else {
        const res = parseBlock(lines, j, childIndent);
        obj[key] = res.value;
        i = res.nextIdx;
      }
      continue;
    }

    obj[key] = parseScalar(restTrimmed);
    i++;
  }
  return { value: obj, nextIdx: i };
}

// Parseia uma lista cujos itens comecam com "- " na indentacao `itemIndent`.
function parseList(lines, startIdx, itemIndent) {
  const arr = [];
  let i = startIdx;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }
    const ind = indentOf(line);
    if (ind < itemIndent) break;
    if (ind > itemIndent) { i++; continue; }

    const trimmedLine = line.trim();
    if (!(trimmedLine.startsWith('- ') || trimmedLine === '-')) break;

    const afterDash = trimmedLine === '-' ? '' : trimmedLine.slice(2);
    const dashColOffset = ind + 2; // coluna onde comeca o conteudo apos "- "

    if (afterDash.trim() === '') {
      // "- " sozinho: item e um bloco nas linhas seguintes, indentado alem do "- "
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j < lines.length && indentOf(lines[j]) > ind) {
        const childIndent = indentOf(lines[j]);
        const res = parseBlock(lines, j, childIndent);
        arr.push(res.value);
        i = res.nextIdx;
      } else {
        arr.push(null);
        i++;
      }
      continue;
    }

    const kv = splitKeyValue(afterDash);
    if (kv && (afterDash.includes(':')) && !isInlineArrayOrScalarWithColon(afterDash)) {
      // Item objeto multi-linha: primeira "chave: valor" fica na propria linha do
      // "-", as chaves seguintes ficam alinhadas em dashColOffset.
      const firstObj = {};
      const { key, rest } = kv;
      const restTrimmed = rest.trim();
      if (restTrimmed === '') {
        // primeira chave do item tambem abre bloco aninhado
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        if (j < lines.length && indentOf(lines[j]) > ind) {
          const childIndent = indentOf(lines[j]);
          const childTrimmed = lines[j].trim();
          if (childTrimmed.startsWith('- ') || childTrimmed === '-') {
            const res = parseList(lines, j, childIndent);
            firstObj[key] = res.value;
            i = res.nextIdx;
          } else {
            const res = parseBlock(lines, j, childIndent);
            firstObj[key] = res.value;
            i = res.nextIdx;
          }
        } else {
          firstObj[key] = null;
          i++;
        }
      } else {
        firstObj[key] = parseScalar(restTrimmed);
        i++;
      }

      // Continua consumindo linhas subsequentes do MESMO item (indentadas em
      // dashColOffset, ou mais, formando sub-blocos daquela chave).
      while (i < lines.length) {
        if (lines[i].trim() === '') { i++; continue; }
        const ind2 = indentOf(lines[i]);
        if (ind2 < dashColOffset) break;
        if (ind2 > dashColOffset) {
          // sub-bloco pertencente a ultima chave processada: nao deveria bater
          // aqui pois parseBlock/parseList ja consomem filhos; avanca defensivo.
          i++;
          continue;
        }
        const lineTrimmed2 = lines[i].trim();
        if (lineTrimmed2.startsWith('- ') || lineTrimmed2 === '-') break;
        const kv2 = splitKeyValue(lines[i]);
        if (!kv2) { i++; continue; }
        const restTrimmed2 = kv2.rest.trim();
        if (restTrimmed2 === '') {
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === '') j++;
          if (j < lines.length && indentOf(lines[j]) > ind2) {
            const childIndent = indentOf(lines[j]);
            const childTrimmed = lines[j].trim();
            if (childTrimmed.startsWith('- ') || childTrimmed === '-') {
              const res = parseList(lines, j, childIndent);
              firstObj[kv2.key] = res.value;
              i = res.nextIdx;
            } else {
              const res = parseBlock(lines, j, childIndent);
              firstObj[kv2.key] = res.value;
              i = res.nextIdx;
            }
          } else {
            firstObj[kv2.key] = null;
            i++;
          }
        } else {
          firstObj[kv2.key] = parseScalar(restTrimmed2);
          i++;
        }
      }

      arr.push(firstObj);
      continue;
    }

    // Item escalar (string, numero, array inline, etc.)
    arr.push(parseScalar(afterDash));
    i++;
  }
  return { value: arr, nextIdx: i };
}

// Distingue "chave: valor" de um escalar que por acaso contem ":" (ex.: horario
// "0-3s" nao tem ":", mas "time: 14:00" teria — nos exemplos deste projeto os
// escalares de item de lista soltos nao contem "chave:" reconhecivel porque o
// padrao real sempre usa "- id: 1" (objeto) para itens estruturados. Esta funcao
// e defensiva: se o "rest" apos o primeiro ':' comeca com espaco+valor ou fim de
// linha, tratamos como chave-valor; senao como escalar.
function isInlineArrayOrScalarWithColon(text) {
  // arrays inline ou strings com aspas contendo ':' nao devem ser tratados como kv.
  const trimmed = text.trim();
  if (trimmed[0] === '[' ) return true;
  if (trimmed[0] === '"' || trimmed[0] === "'") return true;
  return false;
}

function parse(text) {
  if (text == null) return {};
  const cleaned = stripComments(String(text)).replace(/\r\n/g, '\n');
  const lines = cleaned.split('\n');
  // ignora linhas totalmente vazias no fim/inicio para achar o baseIndent real
  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start++;
  if (start >= lines.length) return {};
  const baseIndent = indentOf(lines[start]);
  const res = parseBlock(lines, start, baseIndent);
  return res.value;
}

module.exports = { parse };
