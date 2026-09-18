#!/usr/bin/env node
'use strict';

/**
 * check-download.cjs — guard de download zero-bytes / truncado.
 *
 * gera-imagem e gera-video baixam via `curl -L`. Um download que falhou em
 * silencio (URL expirada, timeout, redirect quebrado) grava um arquivo de 0
 * bytes e o pipeline so descobre depois, quando o FFmpeg/montagem quebra com
 * erro opaco. Este check roda logo apos o curl e ANTES de gravar no
 * save-crystal: se o arquivo nao existe ou e pequeno demais para ser uma
 * imagem/video real, sinaliza falha de download para re-tentar o curl.
 *
 * Uso:
 *   node scripts/lib/check-download.cjs "<path>"
 *
 * Saida (stdout, JSON):
 *   { "ok": true,  "size": <bytes> }            exit 0
 *   { "ok": false, "erro": "...", "size": <n> }  exit 1
 *
 * Dep-free: so usa fs (built-in).
 */

const fs = require('fs');

// Limiar minimo. Um PNG/MP4 real do Higgsfield tem dezenas de KB; 1024 bytes
// (1 KB) e folgado o bastante para nunca dar falso-positivo num arquivo valido
// e apertado o bastante para pegar truncamento/zero-bytes. Resposta de erro
// HTTP salva como arquivo costuma ter < 1 KB.
// RACIONAL: o menor PNG 1080x1920 via nano_banana_2 (~50-200 KB mesmo para cenas
// minimalistas), e o menor MP4 via veo3_1_lite (~100+ KB). O threshold de 1 KB
// e ~50x menor que o menor asset real — seguro para nunca rejeitar resultado
// valido, mas captura curl que salvou HTML de erro ou arquivo truncado.
const MIN_BYTES = 1024;

function main() {
  const target = process.argv[2];
  if (!target) {
    process.stdout.write(
      JSON.stringify({ ok: false, erro: 'path nao informado (uso: check-download.cjs <path>)', size: 0 }) + '\n'
    );
    process.exit(1);
  }

  let size = 0;
  try {
    const st = fs.statSync(target);
    if (!st.isFile()) {
      process.stdout.write(
        JSON.stringify({ ok: false, erro: 'path nao e um arquivo', size: 0 }) + '\n'
      );
      process.exit(1);
    }
    size = st.size;
  } catch (e) {
    process.stdout.write(
      JSON.stringify({ ok: false, erro: 'arquivo nao existe (download nao gravou nada)', size: 0 }) + '\n'
    );
    process.exit(1);
  }

  if (size < MIN_BYTES) {
    process.stdout.write(
      JSON.stringify({
        ok: false,
        erro: `arquivo pequeno demais (${size} bytes < ${MIN_BYTES}): download vazio ou truncado`,
        size,
      }) + '\n'
    );
    process.exit(1);
  }

  process.stdout.write(JSON.stringify({ ok: true, size }) + '\n');
  process.exit(0);
}

main();
