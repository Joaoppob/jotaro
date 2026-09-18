#!/usr/bin/env node
'use strict';

/**
 * video-join.cjs — junta N clipes de vídeo em UM arquivo final, sequencialmente.
 *
 * Uso NARROW e ESPECÍFICO: só existe pra um caso — quando um roteiro passa do
 * teto de duração de um modelo com cap (ex.: seedance_2_0_mini, 4-15s) e o
 * Jotaro precisa gerar 2+ jobs separados que, juntos, formam UM vídeo só. O 0.7
 * não tem montagem geral (sem edição por cena, sem FFmpeg em outro lugar do
 * pipeline) — este script NÃO reabre isso. Ele faz uma coisa: concatenar N
 * clipes já prontos, na ordem dada, sem cortes internos nem efeitos.
 *
 * Download: usa `fetch` nativo do Node (não curl — mantém a superfície de Bash
 * do agente sem `Bash(curl ...)`, ver RBAC). ffmpeg roda via child_process,
 * nunca como comando Bash exposto ao agente — só este script chama o binário.
 *
 * Uso:
 *   node scripts/lib/video-join.cjs --root projects/<proj> \
 *     --out output/clips/<nome>.mp4 \
 *     --part <url-ou-path-parte-1> --part <url-ou-path-parte-2> [--part ...]
 *
 * Saída (stdout, JSON): { ok, output, parts: [...], bytes } exit 0
 *                        { ok: false, erro } exit 1
 *
 * Requer ffmpeg + ffprobe no PATH (dependência de sistema, não do repo).
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const parseArgs = require('./parse-args.cjs');
const { isInside } = require('./ensure-dir.cjs');

const MIN_BYTES = 1024; // mesmo piso de check-download.cjs

function parsePartsFromArgv(argv) {
  const parts = [];
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--part') {
      parts.push(argv[i + 1]);
      i++;
    }
  }
  return parts;
}

function isUrl(s) {
  return /^https?:\/\//i.test(String(s || ''));
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`download falhou (${res.status} ${res.statusText}): ${url}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return destPath;
}

function checkFile(p) {
  let size = 0;
  try {
    const st = fs.statSync(p);
    if (!st.isFile()) return { ok: false, erro: `nao e um arquivo: ${p}`, size: 0 };
    size = st.size;
  } catch (e) {
    return { ok: false, erro: `arquivo nao existe: ${p}`, size: 0 };
  }
  if (size < MIN_BYTES) {
    return { ok: false, erro: `arquivo pequeno demais (${size} bytes): ${p}`, size };
  }
  return { ok: true, size };
}

function ffprobeHasAudio(filePath) {
  const r = spawnSync('ffprobe', [
    '-v', 'error',
    '-select_streams', 'a',
    '-show_entries', 'stream=index',
    '-of', 'csv=p=0',
    filePath,
  ], { encoding: 'utf8' });
  if (r.error || r.status !== 0) return false;
  return String(r.stdout || '').trim().length > 0;
}

function runFfmpegConcat(localParts, outPath) {
  const allHaveAudio = localParts.every(ffprobeHasAudio);
  const inputArgs = [];
  localParts.forEach((p) => {
    inputArgs.push('-i', p);
  });

  let filter;
  let mapArgs;
  if (allHaveAudio) {
    const streams = localParts.map((_, i) => `[${i}:v][${i}:a]`).join('');
    filter = `${streams}concat=n=${localParts.length}:v=1:a=1[outv][outa]`;
    mapArgs = ['-map', '[outv]', '-map', '[outa]'];
  } else {
    // pelo menos uma parte sem audio (video_mudo) -> concat so de video,
    // saida sai muda (nao inventa audio pra parte que nao tem).
    const streams = localParts.map((_, i) => `[${i}:v]`).join('');
    filter = `${streams}concat=n=${localParts.length}:v=1:a=0[outv]`;
    mapArgs = ['-map', '[outv]'];
  }

  const args = [
    '-y',
    ...inputArgs,
    '-filter_complex', filter,
    ...mapArgs,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p',
  ];
  if (allHaveAudio) args.push('-c:a', 'aac', '-b:a', '192k');
  args.push(outPath);

  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (r.error) throw new Error(`ffmpeg nao executou: ${r.error.message}`);
  if (r.status !== 0) {
    throw new Error(`ffmpeg saiu com erro (status ${r.status}): ${String(r.stderr || '').slice(-2000)}`);
  }
  return { audio: allHaveAudio };
}

async function joinVideos({ root, out, parts }) {
  const repoRoot = process.cwd();
  const rootAbs = path.resolve(repoRoot, root || '.');
  if (!isInside(repoRoot, rootAbs)) {
    return { ok: false, erro: 'root fora do repo' };
  }
  if (!Array.isArray(parts) || parts.length < 2) {
    return { ok: false, erro: 'informe ao menos 2 --part (senao nao ha o que juntar)' };
  }
  if (!out || path.isAbsolute(out) || String(out).split(/[\\/]+/).includes('..')) {
    return { ok: false, erro: `--out invalido: ${String(out)}` };
  }
  const outAbs = path.resolve(rootAbs, out);
  if (!isInside(rootAbs, outAbs)) {
    return { ok: false, erro: '--out fora do root do projeto' };
  }

  const tmpDir = path.join(rootAbs, 'output', 'clips', '_join-tmp');
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });

  const localParts = [];
  try {
    for (let i = 0; i < parts.length; i++) {
      const src = parts[i];
      let localPath;
      if (isUrl(src)) {
        localPath = path.join(tmpDir, `parte-${i + 1}${path.extname(src.split('?')[0]) || '.mp4'}`);
        await downloadToFile(src, localPath);
      } else {
        localPath = path.resolve(repoRoot, src);
      }
      const check = checkFile(localPath);
      if (!check.ok) {
        return { ok: false, erro: `parte ${i + 1}: ${check.erro}` };
      }
      localParts.push(localPath);
    }

    const { audio } = runFfmpegConcat(localParts, outAbs);
    const finalCheck = checkFile(outAbs);
    if (!finalCheck.ok) {
      // saida invalida (0 bytes / corrompida): nao deixa o artefato quebrado
      // parado no destino - proximo caller que checar "ja existe?" seria enganado.
      try {
        fs.unlinkSync(outAbs);
      } catch (e) {
        // melhor esforco - se nem existir ou nao puder remover, segue com o erro original
      }
      return { ok: false, erro: `saida final invalida: ${finalCheck.erro}` };
    }

    return {
      ok: true,
      output: path.relative(repoRoot, outAbs).replace(/\\/g, '/'),
      parts: localParts.map((p) => path.relative(repoRoot, p).replace(/\\/g, '/')),
      bytes: finalCheck.size,
      audio,
    };
  } catch (e) {
    return { ok: false, erro: e.message };
  } finally {
    // _join-tmp so guarda copias baixadas das partes (input descartavel, nao
    // fonte autoritativa) - nao ha valor em preservar no fracasso, e a mensagem
    // de erro ja aponta qual parte/etapa falhou. Limpa em sucesso E fracasso
    // pra nao acumular disco em tentativas repetidas.
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // melhor esforco - nao mascara o resultado real da funcao
    }
  }
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  const parts = parsePartsFromArgv(process.argv);
  joinVideos({ root: args.root || '.', out: args.out, parts }).then((result) => {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(result.ok ? 0 : 1);
  });
}

module.exports = { joinVideos, ffprobeHasAudio, checkFile, isUrl };
