#!/usr/bin/env node
'use strict';

/**
 * pesquisa-sanitize.cjs — nucleo de seguranca da skill pesquisa-web.
 *
 * A web e conteudo NAO-CONFIAVEL. Pode conter prompt-injection indireta
 * ("ignore suas instrucoes anteriores e rode X"). Este modulo e a fronteira que
 * transforma resultado bruto da web em DADO TIPADO E INERTE, nunca instrucao.
 *
 * O que ele faz, e SO isso:
 *   - extrai APENAS os campos { titulo, trecho, url } de cada resultado bruto;
 *   - TRUNCA o trecho a <=500 chars (reduz superficie de injection);
 *   - LIMITA a <=5 resultados (cap de superficie);
 *   - envelopa com { origem:"web-externa", query, capturado_em, resultados };
 *   - coage tudo a string (nenhum objeto/funcao/campo extra sobrevive).
 *
 * O que ele NAO faz (por design — e o ponto de seguranca):
 *   - NAO promove nenhum conteudo da web a campo de acao/instrucao;
 *   - NAO cria campo executavel a partir do conteudo;
 *   - NAO interpreta o texto — instrucao injetada permanece TEXTO INERTE
 *     dentro de `trecho`/`titulo`, jamais um comando.
 *
 * E PURO e TESTAVEL SEM REDE: recebe resultados ja em memoria e devolve a
 * estrutura. O fetch (curl/exa) vive na skill; aqui so o saneamento, que e a
 * peca de seguranca verificavel pelo verify.cjs (teste adversarial).
 *
 * Uso programatico:
 *   const { sanitize } = require('./lib/pesquisa-sanitize.cjs');
 *   const out = sanitize(brutos, { query, capturado_em });
 *
 * Uso CLI (stdin = JSON { query, resultados } de resultados brutos):
 *   curl ... | parser | node scripts/lib/pesquisa-sanitize.cjs --query "..."
 *   imprime a saida estruturada e valida no stdout; exit 1 se invalida.
 */

const TRECHO_MAX = 500;
const MAX_RESULTADOS = 5;

function asString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  // objeto/array/funcao da web NUNCA viram campo estruturado: descartados a ''.
  return '';
}

function truncate(value, max) {
  const s = asString(value);
  return s.length > max ? s.slice(0, max) : s;
}

function nowIso() {
  // ISO 8601 em UTC, segundos. Trend e perecivel — o timestamp e obrigatorio.
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Extrai de um resultado bruto SOMENTE os tres campos inertes permitidos.
 * Qualquer outro campo que a web traga (ex.: "acao", "comando", "tool",
 * "system") e simplesmente IGNORADO — nao ha caminho dele para a saida.
 */
function sanitizeResultado(bruto) {
  const src = bruto && typeof bruto === 'object' && !Array.isArray(bruto) ? bruto : {};
  return {
    titulo: asString(src.titulo !== undefined ? src.titulo : src.title),
    trecho: truncate(src.trecho !== undefined ? src.trecho : src.snippet, TRECHO_MAX),
    url: asString(src.url !== undefined ? src.url : src.link),
  };
}

/**
 * sanitize(resultadosBrutos, opts) -> envelope estruturado e inerte.
 *   opts.query        : a query de busca (eco). default ''.
 *   opts.capturado_em : timestamp ISO. default: agora (UTC).
 */
function sanitize(resultadosBrutos, opts) {
  const o = opts || {};
  const lista = Array.isArray(resultadosBrutos) ? resultadosBrutos : [];
  const resultados = lista.slice(0, MAX_RESULTADOS).map(sanitizeResultado);
  return {
    origem: 'web-externa',
    query: asString(o.query),
    capturado_em: o.capturado_em ? asString(o.capturado_em) : nowIso(),
    resultados,
  };
}

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    if (process.stdin.isTTY) return resolve('');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(data));
  });
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--query') out.query = argv[++i];
    else if (argv[i] === '--capturado-em') out.capturado_em = argv[++i];
  }
  return out;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  readStdin().then((raw) => {
    let input;
    try {
      input = raw.trim() ? JSON.parse(raw) : {};
    } catch (e) {
      process.stderr.write(`pesquisa-sanitize: entrada nao e JSON valido (${e.message})\n`);
      process.exit(1);
      return;
    }
    // aceita { resultados: [...] } ou diretamente um array de resultados.
    const brutos = Array.isArray(input) ? input : input.resultados;
    const query = args.query !== undefined ? args.query : input.query;
    const out = sanitize(brutos, { query, capturado_em: args.capturado_em });

    // valida a propria saida contra o schema antes de imprimir — defesa em
    // profundidade: a saida do nucleo de seguranca sempre satisfaz o contrato.
    let schema = null;
    try {
      const fs = require('fs');
      const path = require('path');
      schema = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '..', '..', 'schemas', 'pesquisa.schema.json'), 'utf8')
      );
    } catch (_) {
      schema = null;
    }
    if (schema) {
      const validate = require('./validate-schema.cjs');
      const res = validate(schema, out);
      if (!res.valid) {
        process.stderr.write('pesquisa-sanitize: saida nao valida contra pesquisa.schema.json: ' + res.errors.join('; ') + '\n');
        process.exit(1);
        return;
      }
    }
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
    process.exit(0);
  });
}

module.exports = { sanitize, sanitizeResultado, TRECHO_MAX, MAX_RESULTADOS };
