#!/usr/bin/env node
'use strict';

/*
 * intake-state.cjs — estado da intake guiada da Etapa 1 (roteirizacao v0.5).
 *
 * Espelha o padrao de review-cadence.cjs: estado computavel externamente ao LLM,
 * lido programaticamente, nao inferido do contexto de conversa. Isso elimina a
 * amnesia de contexto longo — o Jotaro pergunta SO as lacunas pendentes e nunca
 * reperginta o que ja foi respondido.
 *
 * O estado vive por PROJETO em `<root>/output/.intake-state.json`, onde
 * `--root projects/<nome>`. O arquivo gravado valida contra intake.schema.json.
 *
 * Com `--generation <id>`, o estado passa a viver em
 * `<root>/generations/<id>/.intake-state.json` (o path que CLAUDE.md e
 * `.claude/commands/roteiro.md` documentam) em vez de `output/`. Omitir
 * `--generation` mantem o comportamento legado (`output/.intake-state.json`),
 * usado por fluxos sem generation ainda criada.
 *
 * Interface CLI (subcomando + flags --chave valor):
 *   status  --root projects/<nome>
 *       -> { lacunas_pendentes: [...], status, ...estado }
 *          DETECTA a biblioteca de personagem do disco e persiste
 *          tem_personagem/personagens/modo_visual (ver applyDetection).
 *   update  --root projects/<nome> --campo <k> --valor <v>
 *       -> grava o campo, recomputa lacunas_pendentes e status
 *   reset   --root projects/<nome>
 *       -> zera o estado
 *   detect  --root projects/<nome>
 *       -> roda SO a deteccao da biblioteca (sem persistir), retorna
 *          { existe, personagens, tem_personagem, tem_marca, plano_tem_imagem, modo_visual }
 *
 * Campos OBRIGATORIOS (bloqueiam; entram em lacunas_pendentes se nulos/vazios):
 *   projeto, plataforma, objetivo_post, tipo_conteudo
 * Campos OPCIONAIS (nao bloqueiam):
 *   tem_roteiro, referencias_usuario, estrutura_solicitada
 *   - estrutura_solicitada: fluxo de cenas explicito que o usuario descreveu (ex.: "rotina ->
 *     fala -> produto"). Quando preenchido, tem prioridade sobre os moldes padrao das folhas
 *     de roteiro/alma/storyboard (ver seus arquivos em .claude/agents/).
 * Campos DETECTADOS do disco (asset-first; NAO inferidos do contexto de conversa):
 *   tem_personagem, personagens, modo_visual
 *   - tem_personagem: presenca de RAG/identidade-visual/<char>/ com imagem.
 *     NUNCA gravado como false quando existe biblioteca de personagem populada.
 *   - personagens: nomes das subpastas de personagem com imagem.
 *   - modo_visual: "biblioteca" se ha biblioteca populada; senao "geracao".
 */

const fs = require('fs');
const path = require('path');
const parseArgs = require('./lib/parse-args.cjs');
const identidadeVisual = require('./lib/identidade-visual.cjs');

const STATE_REL = path.join('output', '.intake-state.json');

// Campos que bloqueiam o avanco da intake. Ordem = ordem de pergunta sugerida.
const CAMPOS_OBRIGATORIOS = ['projeto', 'plataforma', 'objetivo_post', 'tipo_conteudo'];
// Campos opcionais aceitos por update (nao bloqueiam).
const CAMPOS_OPCIONAIS = ['tem_roteiro', 'tem_personagem', 'referencias_usuario', 'personagens', 'modo_visual', 'estrutura_solicitada'];
// Plataformas validas (espelha o enum de intake.schema.json, menos o null).
const PLATAFORMAS = ['instagram', 'tiktok', 'facebook', 'youtube', 'reels'];

function statePath(root, generationId) {
  if (generationId) {
    return path.resolve(root || '.', 'generations', generationId, '.intake-state.json');
  }
  return path.resolve(root || '.', STATE_REL);
}

function emptyState() {
  return {
    projeto: '',
    plataforma: null,
    objetivo_post: null,
    tipo_conteudo: null,
    tem_roteiro: false,
    // tem_personagem/modo_visual/personagens NAO sao mais default-false-no-escuro:
    // sao DETECTADOS da biblioteca de personagem (RAG/identidade-visual/<char>/).
    // null = ainda nao detectado; a deteccao roda no `status` (applyDetection).
    tem_personagem: false,
    personagens: [],
    modo_visual: null,
    referencias_usuario: [],
    estrutura_solicitada: null,
    lacunas_pendentes: [],
    status: 'em-andamento',
  };
}

function load(root, generationId) {
  const p = statePath(root, generationId);
  if (!fs.existsSync(p)) return recompute(emptyState());
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
    return recompute(Object.assign(emptyState(), obj, {
      referencias_usuario: Array.isArray(obj.referencias_usuario) ? obj.referencias_usuario : [],
      personagens: Array.isArray(obj.personagens) ? obj.personagens : [],
    }));
  } catch (_) {
    try {
      fs.copyFileSync(p, p + '.corrupt-' + Date.now());
    } catch (_) {
      // ignore
    }
    return recompute(emptyState());
  }
}

function save(root, state, generationId) {
  const p = statePath(root, generationId);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n', 'utf8');
  // fallback copy+unlink NAO e atomico (aceitavel: state single-agent sequencial)
  try {
    fs.renameSync(tmp, p);
  } catch (e) {
    if (e.code === 'EXDEV') {
      fs.copyFileSync(tmp, p);
      fs.unlinkSync(tmp);
      process.stderr.write('[intake-state] EXDEV: fallback copy+unlink para ' + p + '\n');
    } else {
      throw e;
    }
  }
}

// um campo obrigatorio esta "preenchido" se nao for null/"" (e plataforma valida).
function preenchido(campo, valor) {
  if (campo === 'plataforma') return PLATAFORMAS.indexOf(valor) !== -1;
  return valor !== null && valor !== undefined && String(valor).trim() !== '';
}

function recompute(state) {
  const lacunas = CAMPOS_OBRIGATORIOS.filter((c) => !preenchido(c, state[c]));
  state.lacunas_pendentes = lacunas;
  if (state.status !== 'abandonado') {
    state.status = lacunas.length === 0 ? 'completo' : 'em-andamento';
  }
  return state;
}

/*
 * applyDetection — deriva tem_personagem/personagens/modo_visual do disco
 * (RAG/identidade-visual/<char>/), em vez de inferir do contexto de conversa.
 * Corrige o bug do run example-fitness-brand (tem_personagem:false com dezenas de rostos).
 *
 * Regra-cofre: NUNCA grava tem_personagem:false quando existe biblioteca de
 * personagem populada. Quando ha biblioteca: tem_personagem:true, personagens
 * dos nomes de subpasta, modo_visual:"biblioteca". Sem biblioteca: modo_visual
 * "geracao" e personagens []; tem_personagem segue o detectado (false).
 */
function applyDetection(root, state) {
  const det = identidadeVisual.detect(root);
  if (det.tem_personagem) {
    state.tem_personagem = true;
    state.personagens = det.personagens;
    state.modo_visual = 'biblioteca';
  } else {
    state.personagens = [];
    state.modo_visual = 'geracao';
    // sem biblioteca de personagem: o sujeito unico (mago) ou projeto sem refs.
    // nao forcamos true; mantemos o detectado (false) — coerente com geracao.
    state.tem_personagem = false;
  }
  return state;
}

function coerce(campo, valorRaw) {
  if (campo === 'tem_roteiro' || campo === 'tem_personagem') {
    const v = String(valorRaw).trim().toLowerCase();
    return v === 'true' || v === 'sim' || v === '1';
  }
  if (campo === 'referencias_usuario' || campo === 'personagens') {
    // lista separada por virgula
    return String(valorRaw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (campo === 'modo_visual') {
    const v = String(valorRaw).trim().toLowerCase();
    return v === 'biblioteca' || v === 'geracao' ? v : null;
  }
  if (campo === 'plataforma') {
    return String(valorRaw).trim().toLowerCase();
  }
  return String(valorRaw);
}

// status agora DETECTA a biblioteca de personagem do disco e persiste o resultado
// (tem_personagem/personagens/modo_visual), corrigindo o tem_personagem-no-escuro.
// A deteccao roda sempre que o status e consultado, refletindo o estado real do RAG.
function status(root, generationId) {
  const state = load(root, generationId);
  applyDetection(root, state);
  recompute(state);
  save(root, state, generationId);
  return state;
}

// detect: roda SO a deteccao (tem_personagem/personagens/modo_visual) e devolve,
// sem persistir nem mexer nas lacunas. Util para inspecao isolada.
function detect(root) {
  return identidadeVisual.detect(root);
}

function update(root, args) {
  const campo = args.campo;
  if (!campo) {
    return { erro: 'campo ausente', uso: 'update --campo <k> --valor <v>' };
  }
  const conhecidos = CAMPOS_OBRIGATORIOS.concat(CAMPOS_OPCIONAIS);
  if (conhecidos.indexOf(campo) === -1) {
    return { erro: 'campo desconhecido', campo, campos_validos: conhecidos };
  }
  const generationId = args.generation;
  const state = load(root, generationId);
  // re-detecta a biblioteca PRIMEIRO (fonte-de-verdade do filesystem), depois
  // aplica o update do usuario por cima — um update explicito de modo_visual/
  // tem_personagem/personagens ainda vence nesta chamada, sem ser clobbered.
  applyDetection(root, state);
  state[campo] = coerce(campo, args.valor === undefined ? '' : args.valor);
  recompute(state);
  save(root, state, generationId);
  return state;
}

function reset(root, generationId) {
  const state = recompute(emptyState());
  save(root, state, generationId);
  return state;
}

if (require.main === module) {
  const sub = process.argv[2] || 'status';
  const args = parseArgs(process.argv, 3);
  const root = args.root || '.';
  const generationId = args.generation;
  let result;
  switch (sub) {
    case 'status':
      result = status(root, generationId);
      break;
    case 'update':
      result = update(root, args);
      break;
    case 'reset':
      result = reset(root, generationId);
      break;
    case 'detect':
      result = detect(root);
      break;
    default:
      result = { erro: 'subcomando desconhecido', uso: 'status|update|reset|detect' };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(0);
}

module.exports = {
  STATE_REL,
  CAMPOS_OBRIGATORIOS,
  CAMPOS_OPCIONAIS,
  PLATAFORMAS,
  statePath,
  emptyState,
  load,
  status,
  update,
  reset,
  detect,
  applyDetection,
};
