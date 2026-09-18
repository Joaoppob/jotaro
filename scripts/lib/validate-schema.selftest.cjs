#!/usr/bin/env node
'use strict';

/**
 * validate-schema.selftest.cjs — TESTE-PRIMEIRO do validador minimo.
 *
 * Valida os 3 exemplos reais contra schemas/shotlist.schema.json (todos devem
 * dar valid:true) e um objeto deliberadamente quebrado (deve dar valid:false
 * com o erro certo). Imprime "SELFTEST OK" e exit 0 so se tudo bater.
 */

const fs = require('fs');
const path = require('path');
const validate = require('./validate-schema.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const schemaPath = path.join(ROOT, 'schemas', 'shotlist.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const exemplos = [
  'RAG/prompts/exemplo-shotlist-mago.json',
  'RAG/prompts/exemplo-shotlist-produto.json',
  'RAG/prompts/exemplo-shotlist-servico.json',
];

let fail = false;

// 1. exemplos reais -> todos valid:true
for (const relPath of exemplos) {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
  const res = validate(schema, data);
  if (res.valid) {
    console.log(`OK   valid:true  ${relPath}`);
  } else {
    fail = true;
    console.log(`FAIL valid:false ${relPath} (esperava valid:true)`);
    for (const e of res.errors) console.log(`       - ${e}`);
  }
}

// 2. objeto deliberadamente quebrado -> valid:false
//    parte de um exemplo real e corrompe: remove duracao_total_seg + encurta
//    o prompt da cena 0 para < 80 chars.
const broken = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'RAG', 'prompts', 'exemplo-shotlist-mago.json'), 'utf8')
);
delete broken.duracao_total_seg;
broken.cenas[0].prompt = 'curto demais 9:16'; // < 80 chars, mas mantem o 9:16

const brokenRes = validate(schema, broken);
const temErroDuracao = brokenRes.errors.some((e) => /duracao_total_seg/.test(e));
const temErroMinLength = brokenRes.errors.some((e) => /cenas\[0\]\.prompt.*minLength 80/.test(e));

if (!brokenRes.valid && temErroDuracao && temErroMinLength) {
  console.log('OK   valid:false objeto-quebrado (erros corretos detectados)');
  console.log(`       erros: ${brokenRes.errors.length}`);
  for (const e of brokenRes.errors) console.log(`       - ${e}`);
} else {
  fail = true;
  console.log('FAIL objeto-quebrado nao detectado corretamente');
  console.log(`       valid=${brokenRes.valid} temErroDuracao=${temErroDuracao} temErroMinLength=${temErroMinLength}`);
  for (const e of brokenRes.errors) console.log(`       - ${e}`);
}

// 3. keywords suportadas precisam realmente validar; keywords desconhecidas
//    precisam falhar para nao criar falsa seguranca em schemas futuros.
const maxRes = validate({ type: 'object', properties: { x: { type: 'integer', maximum: 3 } } }, { x: 99 });
if (!maxRes.valid && maxRes.errors.some((e) => /maximum 3/.test(e))) {
  console.log('OK   maximum detecta numero acima do limite');
} else {
  fail = true;
  console.log('FAIL maximum nao detectou violacao');
  for (const e of maxRes.errors) console.log(`       - ${e}`);
}

const unsupportedRes = validate({ type: 'string', format: 'email' }, 'a@b.com');
if (!unsupportedRes.valid && unsupportedRes.errors.some((e) => /keyword de schema nao suportada \(format\)/.test(e))) {
  console.log('OK   keyword desconhecida falha explicitamente');
} else {
  fail = true;
  console.log('FAIL keyword desconhecida passou em silencio');
  for (const e of unsupportedRes.errors) console.log(`       - ${e}`);
}

if (fail) {
  console.error('\nSELFTEST FALHOU');
  process.exit(1);
}

console.log('\nSELFTEST OK');
process.exit(0);
