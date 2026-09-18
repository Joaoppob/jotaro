#!/usr/bin/env node
/*
 * scope-guard.cjs - hook UserPromptSubmit do Jotaro Generator.
 *
 * Contrato:
 * - recebe JSON na stdin; o prompt costuma vir em `prompt`;
 * - bloqueia com exit 0 + JSON { decision:"block", reason, suppressOriginalPrompt:true };
 * - libera com exit 0 + `{}`;
 * - falha aberto: erro interno ou stdin corrompida nunca travam o usuario.
 *
 * O hook e reforco. A defesa primaria continua no CLAUDE.md.
 */

'use strict';

function allow() {
  try { process.stdout.write('{}'); } catch (_) { /* noop */ }
  process.exit(0);
}

function block(reason) {
  try {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason,
      suppressOriginalPrompt: true,
    }));
  } catch (_) {
    process.exit(0);
    return;
  }
  process.exit(0);
}

function readStdin() {
  return new Promise(function (resolve) {
    var data = '';
    var settled = false;
    function done() {
      if (settled) return;
      settled = true;
      resolve(data);
    }
    try {
      if (process.stdin.isTTY) { done(); return; }
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', function (chunk) { data += chunk; });
      process.stdin.on('end', done);
      process.stdin.on('error', done);
      setTimeout(done, 1500);
    } catch (_) {
      done();
    }
  });
}

function normalize(prompt) {
  return String(prompt || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

var path = require('path');

var JAILBREAK = [];
var IN_DOMAIN = [];
var OFFTOPIC = [];

try {
  var patternsFile = path.join(__dirname, 'scope-guard-patterns.json');
  var patterns = JSON.parse(require('fs').readFileSync(patternsFile, 'utf8'));
  if (Array.isArray(patterns.jailbreak)) {
    JAILBREAK = patterns.jailbreak.map(function (s) { return new RegExp(s); });
  }
  if (Array.isArray(patterns.in_domain)) {
    IN_DOMAIN = patterns.in_domain.map(function (s) { return new RegExp(s); });
  }
  if (Array.isArray(patterns.offtopic)) {
    OFFTOPIC = patterns.offtopic.map(function (s) { return new RegExp(s); });
  }
} catch (_) {
  // fallback: patterns hardcoded (backward compat)
  JAILBREAK = [
    /ignor[ae]\s+(o|os|todas?|tudo)?\s*(anterior|acima|as?\s+instru)/,
    /esqueca\s+(suas?\s+)?(instru|tudo|o\s+anterior)/,
    /desconsidere?\s+(as?\s+)?(instru|regras|tudo)/,
    /voce\s+agora\s+(e|vai\s+ser|sera)/,
    /a\s+partir\s+de\s+agora\s+voce/,
    /developer\s+mode|modo\s+desenvolvedor|jailbreak|dan\s+mode/,
    /\bsystem\s*:/,
    /novas?\s+instrucoes|nova\s+persona|novo\s+papel/,
    /finja\s+que\s+voce|pretenda\s+ser|aja\s+como\s+se\s+voce/,
    /you\s+are\s+now|you\s+will\s+now\s+(act|be)/,
    /new\s+instructions?\s*(:|from)/,
    /from\s+now\s+on\s+you\s+(are|will)/,
    /reset\s+(your\s+)?(instructions?|memory|context)/,
  ];
  IN_DOMAIN = [
    /\b(higgsfield|mcp|ffmpeg|rag|jotaro|reel|reels|shorts|tiktok)\b/,
    /\b(imagem|imagens|video|videos|credito|creditos|setup|gerador|geracao)\b/,
    /\b(pipeline|retomar|retomada|checkpoint|save[- ]?crystal|prompt|shot[- ]?list)\b/,
    /\b(conect[ae][mr]?\b|login|OAuth|autentic|cli|conta|saldo|account)\b/,
    /\b(roteiro|storyboard|story|narrativa|tendencia|viral|publico|conteudo|plataforma|instagram)\b/,
    /\b(importa|importar|raw|organiza|organizar|material)\b/,
    /\b(inicio|comecar|painel|situacao|panorama)\b/,
  ];
  OFFTOPIC = [
    /\b(codigo|programacao|programar|debug(ar)?|javascript|python|typescript|java\b|c\+\+|sql|html|css|regex|function\b|stack\s*trace|compil(ar|e|ador))\b/,
    /\b(politica|eleicao|presidente|noticia|o\s+que\s+voce\s+acha\s+sobre|sua\s+opiniao)\b/,
    /\b(escrev[ae]\s+(um\s+)?(email|e-mail|texto|redacao|carta|artigo|poema|ensaio)|traduz[ae]?\b|traducao|resum[ae]\s+(este|esse|o)\s+texto)\b/,
  ];
}

function matchesAny(regexes, text) {
  for (var i = 0; i < regexes.length; i++) {
    if (regexes[i].test(text)) return true;
  }
  return false;
}

function classify(prompt) {
  if (typeof prompt !== 'string' || prompt.trim() === '') return null;
  var p = normalize(prompt);

  if (matchesAny(JAILBREAK, p)) {
    return 'Esse tipo de instrucao nao muda como o gerador funciona. O papel aqui e conduzir a criacao de imagens e videos pra sua marca. Quer comecar uma criacao?';
  }

  if (matchesAny(IN_DOMAIN, p)) return null;

  if (matchesAny(OFFTOPIC, p)) {
    return 'Isso fica fora do que este gerador faz. Minha praia e criar imagens e reels pra sua marca. Quer comecar uma criacao ou tirar uma duvida sobre o gerador?';
  }

  return null;
}

(async function main() {
  try {
    var raw = await readStdin();
    var payload;
    try {
      payload = raw && raw.trim() ? JSON.parse(raw) : {};
    } catch (_) {
      allow();
      return;
    }
    var prompt = payload && (payload.prompt || payload.user_prompt || payload.userPrompt);
    var reason = classify(prompt);
    if (reason) { block(reason); return; }
    allow();
  } catch (_) {
    allow();
  }
})();

process.on('uncaughtException', function () { try { process.exit(0); } catch (_) {} });
process.on('unhandledRejection', function () { try { process.exit(0); } catch (_) {} });

module.exports = { classify, normalize };
