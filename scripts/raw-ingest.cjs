#!/usr/bin/env node
'use strict';

/*
 * raw-ingest.cjs — mecanica deterministica e PATH-SAFE da ingestao do Raw/.
 *
 * O produto usa uma pasta `Raw/` na raiz onde o usuario deposita arquivos de um tema (imagens +
 * textos soltos), roda `/importa`, e o Jotaro organiza tudo num PROJETO pronto
 * pra rodar a Etapa 1 / producao.
 *
 * Este script e a CAMADA MECANICA (sem julgamento): escaneia, copia scaffold,
 * MOVE arquivos um a um, e esvazia o lote consumido — tudo com seguranca de
 * path. A CAMADA SEMANTICA (ler textos, decidir o que e marca/narrativa/roteiro,
 * inferir nome/tipo, autorar marca.md/narrativa.md) e do Jotaro, via /importa.
 *
 * DECISOES DO PROJETO (travadas):
 *   - MOVE os arquivos (Raw e caixa de entrada que esvazia), nao copia.
 *   - Subpastas = 1 projeto cada: Raw/<tema>/ vira um projeto; arquivos soltos
 *     na raiz do Raw/ contam como UM lote avulso (_avulso).
 *
 * Interface CLI (subcomando + flags --chave valor):
 *
 *   plan --root .
 *       escaneia Raw/, identifica LOTES (subpasta = lote; soltos = _avulso),
 *       classifica cada arquivo por extensao (imagem|texto|outro). DRY-RUN: nao
 *       altera nada. Imprime { lotes: [{ tema, path, arquivos: [{nome,tipo,path}] }] }.
 *
 *   scaffold --root . --projeto <nome> --tipo <personagem|produto|servico>
 *       copia templates/brand-<tipo> -> projects/<nome> (ERRA se ja existe).
 *       Ajusta project.json (nome, tipo_marca, status:"rascunho"). Valida o nome.
 *
 *   move --root . --de <Raw/...> --para <projects/...>
 *       move UM arquivo. PATH-SAFETY: --de dentro de Raw/, --para dentro de
 *       projects/; rejeita ../, absolutos que escapem, destino fora de projects/.
 *       Cria o diretorio-pai do destino se preciso. Erra se o destino ja existe.
 *
 *   finalize --root . --tema <tema>
 *       remove o lote consumido em Raw/<tema>/ — SO se estiver vazio (ou so com
 *       restos ja movidos); se sobrar arquivo nao-processado, NAO apaga e AVISA.
 *       Para _avulso, remove so os arquivos soltos consumidos, nunca o Raw/ em si
 *       nem .gitkeep/README. NUNCA apaga fora de Raw/.
 *
 *   write-rag --root . --projeto <nome> --arquivo marca|narrativa|roteiro-rascunho
 *       le conteudo do stdin e escreve APENAS nos arquivos permitidos do RAG do
 *       projeto. Usado pelo /importa para autorar sem liberar Write amplo.
 *       Use --file <caminho> para ler de um arquivo temporario (evita fragilidade
 *       de caracteres especiais no pipe do shell). --stdin forca stdin explicito.
 *
 *   activate --root . --projeto <nome>
 *       troca project.json de rascunho para ativo (sem sobrescrever outros campos).
 *
 * Saida sempre JSON no stdout. Erro nao-fatal -> exit != 0 com { ok:false, erro }.
 */

const fs = require('fs');
const path = require('path');
const parseArgs = require('./lib/parse-args.cjs');

const RAW_DIR = 'Raw';
const PROJECTS_DIR = 'projects';
const TEMPLATES_DIR = 'templates';
const AVULSO = '_avulso';

const IMAGE_RE = /\.(png|jpg|jpeg|webp)$/i;
const TEXT_RE = /\.(md|txt)$/i;
// docs de escritorio (docx/pptx/xlsx...): o Jotaro NAO consegue ler o conteudo
// direto (sem parser de Office). Classificar como "outro" generico os deixava
// invisiveis no plano — agora tem tipo proprio pra forcar uma pergunta explicita
// em vez de ficarem esquecidos no Raw sem nenhuma mencao.
const DOC_RE = /\.(docx?|pptx?|xlsx?)$/i;
const TIPOS = ['personagem', 'produto', 'servico'];

// arquivos do esqueleto do Raw/ que NUNCA contam como conteudo de lote nem sao
// apagados/movidos: o esqueleto versionado da caixa de entrada.
const RAW_SKELETON = new Set(['.gitkeep', 'README.md']);
const RAG_WRITE_FILES = {
  marca: path.join('RAG', 'marca.md'),
  narrativa: path.join('RAG', 'narrativa.md'),
  'roteiro-rascunho': path.join('RAG', 'roteiro-rascunho.md'),
};

// ----------------------------------------------------------------------------
// path-safety
// ----------------------------------------------------------------------------

// child esta DENTRO de parent (ou e o proprio parent)? rel nao pode subir (..)
// nem ser absoluto. Mesmo criterio do scripts/lib/ensure-dir.cjs.
function isInside(parent, child) {
  const r = path.relative(parent, child);
  return r === '' || (!!r && !r.startsWith('..') && !path.isAbsolute(r));
}

function realpath(p) {
  return fs.realpathSync.native ? fs.realpathSync.native(p) : fs.realpathSync(p);
}

// Checa se ALGUM componente do path entre base e target e um symlink. Necessario
// porque `fs.realpathSync.native` no Windows NAO resolve componente de symlink — o
// guard so por realpath e enganavel la. lstat de cada componente nao depende disso.
function pathHasSymlinkComponent(baseAbs, targetAbs) {
  const rel = path.relative(baseAbs, targetAbs);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return false;
  let cur = baseAbs;
  for (const part of rel.split(/[\\/]+/)) {
    cur = path.join(cur, part);
    try {
      if (fs.lstatSync(cur).isSymbolicLink()) return true;
    } catch (_) {
      // componente ainda nao existe (ex.: destino novo) — nao e symlink, segue.
    }
  }
  return false;
}

function assertRealInside(baseAbs, targetAbs, label) {
  // 1) defesa robusta (independe de plataforma): nenhum componente pode ser symlink.
  if (pathHasSymlinkComponent(baseAbs, targetAbs)) {
    return { ok: false, erro: `${label} atravessa symlink: ${targetAbs}` };
  }
  // 2) defesa por realpath: o alvo resolvido tem de cair dentro da base resolvida.
  const baseReal = realpath(baseAbs);
  const targetReal = realpath(targetAbs);
  if (!isInside(baseReal, targetReal)) {
    return { ok: false, erro: `${label} aponta para fora via symlink: ${targetAbs}` };
  }
  return { ok: true, real: targetReal, baseReal };
}

// resolve um arg de path do usuario contra a raiz e garante que cai dentro de
// `base` (Raw/ ou projects/). Rejeita componente "..", path absoluto que escape.
function resolveInside(rootAbs, baseRel, argPath) {
  if (!argPath || typeof argPath !== 'string') {
    return { ok: false, erro: 'path ausente' };
  }
  const baseAbs = path.resolve(rootAbs, baseRel);
  // rejeita explicitamente componente de traversal antes de resolver.
  const parts = String(argPath).split(/[\\/]+/);
  if (parts.includes('..')) {
    return { ok: false, erro: `path com traversal (..) rejeitado: ${argPath}` };
  }
  // resolve contra a raiz (aceita "Raw/x" e "projects/y"; absoluto e tolerado
  // so se ainda cair dentro da base apos a checagem isInside).
  const abs = path.isAbsolute(argPath) ? path.resolve(argPath) : path.resolve(rootAbs, argPath);
  if (!isInside(baseAbs, abs)) {
    return { ok: false, erro: `path fora de ${baseRel}/: ${argPath}` };
  }
  return { ok: true, abs, baseAbs };
}

// nome de projeto valido: sem barra, sem traversal, sem absoluto, nao-vazio,
// nao um dos nomes reservados de navegacao.
function validProjectName(nome) {
  if (!nome || typeof nome !== 'string') return false;
  if (nome === '.' || nome === '..') return false;
  if (/[\\/]/.test(nome)) return false;
  if (path.isAbsolute(nome)) return false;
  if (nome.split(/[\\/]+/).includes('..')) return false;
  // Windows MAX_PATH: nomes > 32 chars arriscam bater 260 chars com o path completo
  if (nome.length > 32) return false;
  return true;
}

// ----------------------------------------------------------------------------
// classificacao
// ----------------------------------------------------------------------------

function classify(nome) {
  if (IMAGE_RE.test(nome)) return 'imagem';
  if (TEXT_RE.test(nome)) return 'texto';
  if (DOC_RE.test(nome)) return 'documento';
  return 'outro';
}

// arquivos de um diretorio (nao-recursivo), pulando o esqueleto do Raw.
function listLoteFiles(dirAbs, opts) {
  const skipSkeleton = opts && opts.skipSkeleton;
  if (!fs.existsSync(dirAbs)) return [];
  return fs
    .readdirSync(dirAbs, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => !(skipSkeleton && RAW_SKELETON.has(name)))
    .sort();
}

// arquivos de um lote DESCENDO em subpastas (recursivo). Cada arquivo vem com
// seu subpath relativo ao lote (`subdir`, "" no topo) e o `nome` do arquivo.
// `opts.skipSkeleton` pula o esqueleto do Raw SO no topo (subpastas aninhadas
// nunca sao esqueleto). `opts.skipDirs` lista nomes de subpasta de 1o nivel a
// NAO descer (usado pelo _avulso: subpastas da raiz do Raw ja sao lotes proprios).
// Saida ordenada por subdir, depois nome — deterministica.
function listLoteFilesRecursive(loteAbs, opts) {
  const skipSkeleton = opts && opts.skipSkeleton;
  const skipDirs = (opts && opts.skipDirs) || null;
  const out = [];
  if (!fs.existsSync(loteAbs)) return out;

  const visited = new Set();
  function walk(dirAbs, subdir) {
    // guarda de ciclo: nunca revisita o mesmo diretorio real (protege contra loop
    // de symlink, embora symlinks ja sejam pulados abaixo).
    let real;
    try { real = realpath(dirAbs); } catch (_) { real = dirAbs; }
    if (visited.has(real)) return;
    visited.add(real);

    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const ent of entries) {
      // NUNCA segue symlink (arquivo ou diretorio): pode apontar pra fora do Raw
      // (importaria dado externo) ou criar ciclo. Completude vale pra conteudo REAL
      // do lote, nao pra atalhos que escapam dele.
      if (ent.isSymbolicLink()) continue;
      if (ent.isDirectory()) {
        // no topo do lote, opcionalmente pula subpastas que sao lotes proprios.
        if (subdir === '' && skipDirs && skipDirs.has(ent.name)) continue;
        walk(path.join(dirAbs, ent.name), subdir === '' ? ent.name : `${subdir}/${ent.name}`);
      } else if (ent.isFile()) {
        // esqueleto so e pulado no topo do lote (subdir vazio).
        if (skipSkeleton && subdir === '' && RAW_SKELETON.has(ent.name)) continue;
        out.push({ subdir, nome: ent.name });
      }
    }
  }

  walk(loteAbs, '');
  out.sort((a, b) => (a.subdir === b.subdir ? a.nome.localeCompare(b.nome) : a.subdir.localeCompare(b.subdir)));
  return out;
}

// ----------------------------------------------------------------------------
// plan
// ----------------------------------------------------------------------------

// resumo por PASTA REAL dentro do lote: { nome, path, n_imagens, n_textos,
// n_documentos, n_outros }. Agrupa pelo `subdir` COMPLETO (a pasta exata que
// contem o arquivo), nao so a 1a componente — CRITICO pra lotes com wrapper
// (ex.: "Personagens FindYourFlow/lea", ".../duda", ".../Cenarios",
// ".../Produto" todos daboaixo do mesmo wrapper). Agrupar so pela 1a componente
// colapsava tudo isso numa unica linha "Personagens FindYourFlow" com a soma
// de tudo — e foi exatamente o bug real: a Nina (subpasta aninhada) e as pastas
// genericas (Cenarios/Produto) ficaram invisiveis no resumo e nunca migraram do
// Raw. Agora cada pasta real vira uma linha propria, em qualquer profundidade.
// `nome` e o nome da propria pasta (ultimo componente do path) — o candidato a
// chave de personagem; `path` e o subdir completo, pra desambiguar duas pastas
// de mesmo nome em ramos diferentes. Arquivos no topo do lote (subdir "") nao
// entram em subpasta nenhuma.
function summarizeSubpastas(arquivos) {
  const acc = new Map();
  for (const a of arquivos) {
    if (!a.subdir) continue; // arquivo no topo do lote nao tem subpasta
    let s = acc.get(a.subdir);
    if (!s) {
      const partes = a.subdir.split('/');
      s = { nome: partes[partes.length - 1], path: a.subdir, n_imagens: 0, n_textos: 0, n_documentos: 0, n_outros: 0 };
      acc.set(a.subdir, s);
    }
    if (a.tipo === 'imagem') s.n_imagens += 1;
    else if (a.tipo === 'texto') s.n_textos += 1;
    else if (a.tipo === 'documento') s.n_documentos += 1;
    else s.n_outros += 1;
  }
  return Array.from(acc.values()).sort((x, y) => x.path.localeCompare(y.path));
}

function plan(rootAbs) {
  const rawAbs = path.resolve(rootAbs, RAW_DIR);
  if (!fs.existsSync(rawAbs)) {
    return { ok: true, lotes: [], aviso: `${RAW_DIR}/ nao existe` };
  }
  const lotes = [];

  const entries = fs.readdirSync(rawAbs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

  // subpastas = 1 lote cada — agora RECURSIVO: desce em sub-subpastas do lote.
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const temaDir = path.join(rawAbs, ent.name);
    const arquivos = listLoteFilesRecursive(temaDir).map((f) => {
      const rel = f.subdir ? `${ent.name}/${f.subdir}/${f.nome}` : `${ent.name}/${f.nome}`;
      return {
        nome: f.nome,
        subdir: f.subdir,
        tipo: classify(f.nome),
        path: `${RAW_DIR}/${rel}`,
      };
    });
    lotes.push({
      tema: ent.name,
      path: `${RAW_DIR}/${ent.name}`,
      arquivos,
      subpastas: summarizeSubpastas(arquivos),
    });
  }

  // arquivos soltos na raiz do Raw = lote _avulso (pulando o esqueleto). Subpastas
  // da raiz do Raw JA sao lotes proprios (acima); o _avulso so abraca arquivos
  // soltos no topo — nao desce em subpasta nenhuma (skipDirs = todas as subpastas).
  const subdirsRaiz = new Set(entries.filter((e) => e.isDirectory()).map((e) => e.name));
  const soltos = listLoteFilesRecursive(rawAbs, { skipSkeleton: true, skipDirs: subdirsRaiz }).map((f) => ({
    nome: f.nome,
    subdir: f.subdir, // sempre "" — _avulso nao desce
    tipo: classify(f.nome),
    path: `${RAW_DIR}/${f.nome}`,
  }));
  if (soltos.length > 0) {
    lotes.push({ tema: AVULSO, path: RAW_DIR, arquivos: soltos, subpastas: [] });
  }

  return { ok: true, lotes };
}

// ----------------------------------------------------------------------------
// scaffold
// ----------------------------------------------------------------------------

// copia recursiva de um diretorio (sem deps; preserva subarvore do template).
function copyTree(srcAbs, dstAbs) {
  const st = fs.lstatSync(srcAbs);
  if (st.isSymbolicLink()) {
    throw new Error(`template contem symlink nao permitido: ${srcAbs}`);
  }
  if (st.isDirectory()) {
    fs.mkdirSync(dstAbs, { recursive: true });
    for (const name of fs.readdirSync(srcAbs)) {
      copyTree(path.join(srcAbs, name), path.join(dstAbs, name));
    }
  } else {
    fs.copyFileSync(srcAbs, dstAbs);
  }
}

function scaffold(rootAbs, args) {
  const nome = args.projeto;
  const tipo = args.tipo;
  if (!validProjectName(nome)) {
    return { ok: false, erro: `nome de projeto invalido: ${String(nome)}` };
  }
  if (TIPOS.indexOf(tipo) === -1) {
    return { ok: false, erro: `tipo invalido: ${String(tipo)} (use ${TIPOS.join('|')})` };
  }
  const templateAbs = path.resolve(rootAbs, TEMPLATES_DIR, `brand-${tipo}`);
  if (!fs.existsSync(templateAbs)) {
    return { ok: false, erro: `template ausente: ${TEMPLATES_DIR}/brand-${tipo}` };
  }
  const dstAbs = path.resolve(rootAbs, PROJECTS_DIR, nome);
  // dupla checagem de path-safety: o destino tem que cair dentro de projects/.
  if (!isInside(path.resolve(rootAbs, PROJECTS_DIR), dstAbs)) {
    return { ok: false, erro: `destino fora de ${PROJECTS_DIR}/: ${nome}` };
  }
  if (fs.existsSync(dstAbs)) {
    return { ok: false, erro: `projeto ja existe (nunca sobrescreve): ${PROJECTS_DIR}/${nome}` };
  }

  try {
    copyTree(templateAbs, dstAbs);
  } catch (e) {
    return { ok: false, erro: `falha ao copiar template: ${e.message}` };
  }

  // ajusta project.json: nome, tipo_marca, status rascunho.
  const projJsonPath = path.join(dstAbs, 'project.json');
  let proj;
  try {
    proj = JSON.parse(fs.readFileSync(projJsonPath, 'utf8'));
  } catch (e) {
    return { ok: false, erro: `project.json do template ilegivel: ${e.message}` };
  }
  proj.nome = nome;
  proj.tipo_marca = tipo;
  proj.status = 'rascunho';
  fs.writeFileSync(projJsonPath, JSON.stringify(proj, null, 2) + '\n', 'utf8');

  return {
    ok: true,
    projeto: `${PROJECTS_DIR}/${nome}`,
    tipo_marca: tipo,
    status: 'rascunho',
    a_partir_de: `${TEMPLATES_DIR}/brand-${tipo}`,
  };
}

// ----------------------------------------------------------------------------
// move
// ----------------------------------------------------------------------------

function move(rootAbs, args) {
  const de = resolveInside(rootAbs, RAW_DIR, args.de);
  if (!de.ok) return { ok: false, erro: `--de invalido: ${de.erro}` };
  const para = resolveInside(rootAbs, PROJECTS_DIR, args.para);
  if (!para.ok) return { ok: false, erro: `--para invalido: ${para.erro}` };

  if (!fs.existsSync(de.abs)) {
    return { ok: false, erro: `origem nao existe: ${args.de}` };
  }
  if (!fs.statSync(de.abs).isFile()) {
    return { ok: false, erro: `origem nao e um arquivo: ${args.de}` };
  }
  const realSrc = assertRealInside(de.baseAbs, de.abs, 'origem');
  if (!realSrc.ok) return { ok: false, erro: realSrc.erro };
  if (fs.existsSync(para.abs)) {
    return { ok: false, erro: `destino ja existe (nunca sobrescreve): ${args.para}` };
  }

  // cria o diretorio-pai do destino (dentro de projects/, ja validado).
  fs.mkdirSync(path.dirname(para.abs), { recursive: true });
  const realDstParent = assertRealInside(para.baseAbs, path.dirname(para.abs), 'destino');
  if (!realDstParent.ok) return { ok: false, erro: realDstParent.erro };

  // move: rename, com fallback copy+unlink para cross-device (EXDEV).
  try {
    fs.renameSync(de.abs, para.abs);
  } catch (e) {
    if (e.code === 'EXDEV') {
      fs.copyFileSync(de.abs, para.abs);
      fs.unlinkSync(de.abs);
    } else {
      return { ok: false, erro: `falha ao mover: ${e.message}` };
    }
  }

  return {
    ok: true,
    de: relFromRoot(rootAbs, de.abs),
    para: relFromRoot(rootAbs, para.abs),
  };
}

function relFromRoot(rootAbs, abs) {
  return path.relative(rootAbs, abs).replace(/\\/g, '/');
}

// ----------------------------------------------------------------------------
// finalize
// ----------------------------------------------------------------------------

function finalize(rootAbs, args) {
  const tema = args.tema;
  if (!tema || typeof tema !== 'string') {
    return { ok: false, erro: 'informe --tema (nome da subpasta ou _avulso)' };
  }
  const rawAbs = path.resolve(rootAbs, RAW_DIR);

  // _avulso: remove os arquivos soltos consumidos da raiz do Raw, nunca o Raw/
  // em si nem o esqueleto. So apaga o que sobrou e ja foi movido? Nao: avulso nao
  // tem pasta propria — removemos os arquivos soltos restantes (os ainda nao
  // movidos sao "restos"); se quiser preservar nao-processados, o /importa so
  // chama finalize apos mover tudo. Aqui: removemos os soltos remanescentes.
  if (tema === AVULSO) {
    // _avulso so abraca arquivos soltos no TOPO do Raw; subpastas da raiz ja sao
    // lotes proprios (nao descer nelas — skipDirs). Nunca apaga o Raw/ em si nem
    // o esqueleto. So checa/avisa as sobras soltas; nada de rm aqui.
    const subdirsRaiz = new Set(
      fs.readdirSync(rawAbs, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    );
    const soltos = listLoteFilesRecursive(rawAbs, { skipSkeleton: true, skipDirs: subdirsRaiz });
    if (soltos.length > 0) {
      return {
        ok: false,
        tema: AVULSO,
        apagado: false,
        aviso: 'lote avulso nao esvaziado: sobraram arquivos nao-processados',
        sobraram: soltos.map((f) => ({ path: `${RAW_DIR}/${f.nome}`, imagem: classify(f.nome) === 'imagem' })),
      };
    }
    return { ok: true, tema: AVULSO, preservado: 'Raw/ e esqueleto (.gitkeep, README.md)' };
  }

  // subpasta: so remove a pasta se estiver vazia (ou so com restos ja movidos).
  // path-safety: nome de tema nao pode escapar de Raw/.
  if (/[\\/]/.test(tema) || tema === '.' || tema === '..' || tema.split(/[\\/]+/).includes('..')) {
    return { ok: false, erro: `tema invalido: ${tema}` };
  }
  const temaAbs = path.join(rawAbs, tema);
  if (!isInside(rawAbs, temaAbs)) {
    return { ok: false, erro: `tema fora de ${RAW_DIR}/: ${tema}` };
  }
  if (!fs.existsSync(temaAbs)) {
    return { ok: true, tema, ja_removido: true };
  }
  if (!fs.statSync(temaAbs).isDirectory()) {
    return { ok: false, erro: `tema nao e um diretorio: ${tema}` };
  }

  // REGRA-COFRE: a checagem de sobras e RECURSIVA. Se sobrar QUALQUER arquivo
  // real (nao-esqueleto) em qualquer profundidade do lote, NAO apaga, AVISA, e
  // lista as sobras (path a partir do Raw + se e imagem). O rm recursivo so roda
  // quando a varredura recursiva nao acha NENHUM arquivo real. Nunca apagar dado
  // nao-processado.
  const restantes = listLoteFilesRecursive(temaAbs);
  if (restantes.length > 0) {
    return {
      ok: false,
      tema,
      apagado: false,
      aviso: 'lote nao esvaziado: sobraram arquivos nao-processados',
      sobraram: restantes.map((f) => ({
        path: f.subdir ? `${RAW_DIR}/${tema}/${f.subdir}/${f.nome}` : `${RAW_DIR}/${tema}/${f.nome}`,
        imagem: classify(f.nome) === 'imagem',
      })),
    };
  }

  // varredura recursiva limpa (so subdirs vazios, no maximo) -> remove o lote.
  fs.rmSync(temaAbs, { recursive: true, force: true });
  return { ok: true, tema, apagado: `${RAW_DIR}/${tema}` };
}

// ----------------------------------------------------------------------------
// write-rag / activate
// ----------------------------------------------------------------------------

function projectRoot(rootAbs, nome) {
  if (!validProjectName(nome)) {
    return { ok: false, erro: `nome de projeto invalido: ${String(nome)}` };
  }
  const baseAbs = path.resolve(rootAbs, PROJECTS_DIR);
  const projAbs = path.resolve(baseAbs, nome);
  if (!isInside(baseAbs, projAbs)) {
    return { ok: false, erro: `projeto fora de ${PROJECTS_DIR}/: ${nome}` };
  }
  if (!fs.existsSync(projAbs) || !fs.statSync(projAbs).isDirectory()) {
    return { ok: false, erro: `projeto nao existe: ${PROJECTS_DIR}/${nome}` };
  }
  const realProj = assertRealInside(baseAbs, projAbs, 'projeto');
  if (!realProj.ok) return { ok: false, erro: realProj.erro };
  return { ok: true, abs: projAbs, baseAbs };
}

function writeRag(rootAbs, args, content) {
  const proj = projectRoot(rootAbs, args.projeto);
  if (!proj.ok) return { ok: false, erro: proj.erro };
  const relFile = RAG_WRITE_FILES[args.arquivo];
  if (!relFile) {
    return {
      ok: false,
      erro: `arquivo invalido: ${String(args.arquivo)} (use ${Object.keys(RAG_WRITE_FILES).join('|')})`,
    };
  }
  const destAbs = path.resolve(proj.abs, relFile);
  if (!isInside(proj.abs, destAbs)) {
    return { ok: false, erro: `destino fora do projeto: ${relFile}` };
  }
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  const realParent = assertRealInside(proj.abs, path.dirname(destAbs), 'destino RAG');
  if (!realParent.ok) return { ok: false, erro: realParent.erro };
  if (args.arquivo === 'roteiro-rascunho' && fs.existsSync(destAbs)) {
    return { ok: false, erro: 'roteiro-rascunho.md ja existe (nunca sobrescreve rascunho)' };
  }

  // resolve fonte: --file > stdin. --file evita fragilidade de caracteres
  // especiais que o pipe do shell (echo/printf) pode corromper.
  let text;
  if (args.file && typeof args.file === 'string') {
    const fileAbs = path.resolve(rootAbs, args.file);
    if (!isInside(rootAbs, fileAbs)) {
      return { ok: false, erro: `--file fora da raiz do projeto: ${args.file}` };
    }
    if (!fs.existsSync(fileAbs)) {
      return { ok: false, erro: `--file nao encontrado: ${args.file}` };
    }
    try {
      text = fs.readFileSync(fileAbs, 'utf8');
    } catch (e) {
      return { ok: false, erro: `erro ao ler --file: ${e.message}` };
    }
    // apaga o temporario apos leitura (se for tmp)
    if (/[\\/]tmp[\\/]/.test(args.file) || args.file.startsWith('tmp' + path.sep)) {
      try { fs.unlinkSync(fileAbs); } catch (_) { /* best effort */ }
    }
  } else {
    text = String(content || '');
  }

  const normalized = text.replace(/\r\n/g, '\n');
  fs.writeFileSync(destAbs, normalized.endsWith('\n') ? normalized : normalized + '\n', 'utf8');
  return { ok: true, arquivo: relFromRoot(rootAbs, destAbs), bytes: Buffer.byteLength(normalized, 'utf8') };
}

function activate(rootAbs, args) {
  const proj = projectRoot(rootAbs, args.projeto);
  if (!proj.ok) return { ok: false, erro: proj.erro };
  const projJsonPath = path.join(proj.abs, 'project.json');
  let projJson;
  try {
    projJson = JSON.parse(fs.readFileSync(projJsonPath, 'utf8'));
  } catch (e) {
    return { ok: false, erro: `project.json ilegivel: ${e.message}` };
  }
  projJson.status = 'ativo';
  fs.writeFileSync(projJsonPath, JSON.stringify(projJson, null, 2) + '\n', 'utf8');
  return { ok: true, projeto: `${PROJECTS_DIR}/${args.projeto}`, status: 'ativo' };
}

function readStdinSync() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (_) {
    return '';
  }
}

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------

function main() {
  const sub = process.argv[2] || 'plan';
  const args = parseArgs(process.argv, 3);
  const rootAbs = path.resolve(args.root || '.');

  let result;
  switch (sub) {
    case 'plan':
      result = plan(rootAbs);
      break;
    case 'scaffold':
      result = scaffold(rootAbs, args);
      break;
    case 'move':
      result = move(rootAbs, args);
      break;
    case 'finalize':
      result = finalize(rootAbs, args);
      break;
      case 'write-rag':
      result = writeRag(rootAbs, args, args.file ? '' : readStdinSync());
      break;
    case 'activate':
      result = activate(rootAbs, args);
      break;
    default:
      result = { ok: false, erro: 'subcomando desconhecido', uso: 'plan|scaffold|move|finalize|write-rag|activate' };
  }

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result && result.ok ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  RAW_DIR,
  PROJECTS_DIR,
  TEMPLATES_DIR,
  AVULSO,
  TIPOS,
  isInside,
  resolveInside,
  validProjectName,
  classify,
  assertRealInside,
  pathHasSymlinkComponent,
  listLoteFilesRecursive,
  summarizeSubpastas,
  plan,
  scaffold,
  move,
  finalize,
  writeRag,
  activate,
};
