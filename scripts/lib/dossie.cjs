#!/usr/bin/env node
'use strict';

/**
 * dossie.cjs — o montador do Dossie de Prompt Vivo.
 *
 * O produto virou um forjador de prompt: cada agente da Etapa 1 enriquece UM
 * artefato vivo e legivel — o Dossie — em vez de N JSONs soltos. Este montador NAO
 * gera nada, NAO gasta credito: ele so LE os artefatos disponiveis no output/ do
 * projeto e os consolida em dois arquivos:
 *
 *   - dossie.json  — consolidado estruturado (schemas/dossie.schema.json). Cada uma
 *                    das 9 secoes tem { status, dono, conteudo }; secao cujo artefato
 *                    ainda nao existe fica status:"pendente", conteudo:null.
 *   - dossie.md    — a VISAO LEGIVEL por humano (o heroi). Markdown lido, secoes
 *                    0->6 na ordem, cada uma com cabecalho de status e o conteudo
 *                    renderizado em prosa (nao JSON cru).
 *
 * Mapa secao -> artefato -> dono (0.7: a forja termina num PROMPT UNICO):
 *   §0 intencao       .intake-state.json  intake (Jotaro)
 *   §1 identidade     identity.json       rag
 *   §2 alma           alma-brief.json     soul-strategist
 *   §3 roteiro        roteiro.json        story-writer
 *   §4 decupagem      storyboard.json     storyboard-director
 *   §5 edicao         edicao.json         editing-director
 *   §6 prompt_unico   prompt-forge.json   prompt-smith
 *
 * Uso:
 *   node scripts/lib/dossie.cjs --root projects/<nome>
 *   node scripts/lib/dossie.cjs --out <dir-com-os-artefatos>   # le e escreve no dir
 */

const fs = require('fs');
const path = require('path');

// Definicao das 9 secoes na ordem 0->8. `key` e a chave no dossie.json; `arquivo`
// e o nome do artefato lido do dir de output; `dono` e o agente responsavel; `titulo`
// e o nome legivel; `n` e o indice da secao no dossie.md. No 0.7 a forja termina no
// PROMPT UNICO (prompt-forge.json) — nao ha mais §7 de prompts de movimento.
const SECOES = [
  { n: 0, key: 'intencao', arquivo: '.intake-state.json', dono: 'intake (Jotaro)', titulo: 'Intencao' },
  { n: 1, key: 'identidade', arquivo: 'identity.json', dono: 'rag', titulo: 'Identidade' },
  { n: 2, key: 'project_brief', arquivo: 'project-brief.json', dono: 'objetivo-do-projeto', titulo: 'Project Brief' },
  { n: 3, key: 'mundo', arquivo: 'world.json', dono: 'mundo', titulo: 'Mundo' },
  { n: 4, key: 'alma', arquivo: 'alma-brief.json', dono: 'soul-strategist', titulo: 'Alma' },
  { n: 5, key: 'roteiro', arquivo: 'roteiro.json', dono: 'story-writer', titulo: 'Roteiro' },
  { n: 6, key: 'decupagem', arquivo: 'storyboard.json', dono: 'storyboard-director', titulo: 'Decupagem' },
  { n: 7, key: 'edicao', arquivo: 'edicao.json', dono: 'editing-director', titulo: 'Edicao' },
  { n: 8, key: 'prompt_unico', arquivo: 'prompt-forge.json', dono: 'prompt-smith', titulo: 'Prompt Unico' },
];

function lerJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return undefined;
  }
}

function naoVazio(v) {
  return v !== undefined && v !== null && String(v).trim().length > 0;
}

// montarDossie le os artefatos do dir e devolve o objeto consolidado (conforme
// schemas/dossie.schema.json). Nao escreve nada — pura.
function montarDossie(outDir) {
  const secoes = {};
  const conteudos = {}; // guarda o conteudo bruto por key para o renderizador

  for (const s of SECOES) {
    const artefato = lerJson(path.join(outDir, s.arquivo));
    const preenchida = artefato !== undefined;
    secoes[s.key] = {
      status: preenchida ? 'preenchida' : 'pendente',
      dono: s.dono,
      conteudo: preenchida ? artefato : null,
    };
    conteudos[s.key] = artefato;
  }

  // Cabecalho do dossie: personagem e plataforma vem do primeiro artefato que os
  // tenha (alma > identidade-intake > shotlist...). Projeto vem do nome do dir ou
  // da intake. Tudo com fallback honesto (— quando nao se sabe).
  const alma = conteudos.alma;
  const intake = conteudos.intencao;
  const promptUnico = conteudos.prompt_unico;
  const personagem =
    (alma && alma.personagem) ||
    (promptUnico && promptUnico.personagem) ||
    (intake && Array.isArray(intake.personagens) && intake.personagens[0]) ||
    '—';
  const plataforma =
    (intake && intake.plataforma) ||
    (alma && alma.plataforma) ||
    '—';
  // Projeto: a intake e a fonte canonica. Sem ela, derivamos do caminho: quando o
  // dir e o `output/` de um projeto, o nome do projeto e a pasta-pai; senao e o
  // proprio dir (ex.: o dir de demo). Fallback honesto: — quando nada serve.
  const baseDir = path.basename(outDir);
  const projeto =
    (intake && intake.projeto) ||
    (baseDir === 'output' ? path.basename(path.dirname(outDir)) : baseDir) ||
    '—';

  return {
    projeto: String(projeto),
    personagem: String(personagem),
    plataforma: String(plataforma),
    secoes,
  };
}

// ---------- renderizadores por secao (JSON -> prosa legivel) ----------

function renderIntencao(c) {
  if (!c) return '';
  const linhas = [];
  if (naoVazio(c.objetivo_post)) linhas.push(`- **Objetivo do post:** ${c.objetivo_post}`);
  if (naoVazio(c.tipo_conteudo)) linhas.push(`- **Tipo de conteudo:** ${c.tipo_conteudo}`);
  if (naoVazio(c.modo_visual)) linhas.push(`- **Modo visual:** ${c.modo_visual}`);
  if (Array.isArray(c.personagens) && c.personagens.length) linhas.push(`- **Personagens:** ${c.personagens.join(', ')}`);
  if (naoVazio(c.status)) linhas.push(`- **Status da intake:** ${c.status}`);
  return linhas.join('\n');
}

function renderIdentidade(c) {
  if (!c) return '';
  const linhas = [];
  if (naoVazio(c.anchor_textual)) linhas.push(`**Anchor:** ${c.anchor_textual}`);
  if (naoVazio(c.estilo)) linhas.push(`**Estilo:** ${c.estilo}`);
  if (Array.isArray(c.paleta) && c.paleta.length) linhas.push(`**Paleta:** ${c.paleta.join(', ')}`);
  if (naoVazio(c.narrativa_resumo)) linhas.push(`**Narrativa:** ${c.narrativa_resumo}`);
  if (naoVazio(c.tom)) linhas.push(`**Tom:** ${c.tom}`);
  if (Array.isArray(c.refs) && c.refs.length) linhas.push(`**Refs:** ${c.refs.join(', ')}`);
  return linhas.join('\n\n');
}

function renderProjectBrief(c) {
  if (!c) return '';
  const linhas = [];
  if (naoVazio(c.single_minded_proposition)) linhas.push(`**Proposicao unica:** ${c.single_minded_proposition}`);
  if (naoVazio(c.objetivo)) linhas.push(`**Objetivo:** ${c.objetivo}`);
  if (naoVazio(c.metrica_primaria)) linhas.push(`**Metrica primaria:** ${c.metrica_primaria}`);
  if (naoVazio(c.nivel_awareness)) linhas.push(`**Awareness:** ${c.nivel_awareness}`);
  if (naoVazio(c.o_que_comunica)) linhas.push(`**O que comunica:** ${c.o_que_comunica}`);
  if (naoVazio(c.como_comunica)) linhas.push(`**Como comunica:** ${c.como_comunica}`);
  if (naoVazio(c.publico)) linhas.push(`**Publico:** ${c.publico}`);
  const meta = [c.canal, c.formato, c.estetica].filter(naoVazio);
  if (meta.length) linhas.push(`**Formato estrategico:** ${meta.join(' · ')}`);
  if (c.time_budget && typeof c.time_budget === 'object') {
    linhas.push(`**Time budget:** hook ${c.time_budget.hook || '-'}; desenvolvimento ${c.time_budget.desenvolvimento || '-'}; payoff/CTA ${c.time_budget.payoff_cta || '-'}`);
  }
  if (Array.isArray(c.nao_fazer) && c.nao_fazer.length) linhas.push(`**Nao fazer:** ${c.nao_fazer.join('; ')}`);
  return linhas.join('\n\n');
}

function renderMundo(c) {
  if (!c) return '';
  const linhas = [];
  if (naoVazio(c.world_version)) linhas.push(`**Versao:** ${c.world_version}`);
  const lugares = Array.isArray(c.lugares) ? c.lugares : [];
  if (lugares.length) {
    linhas.push('**Lugares:**');
    for (const lugar of lugares) {
      const props = Array.isArray(lugar.props_recorrentes) ? lugar.props_recorrentes.join(', ') : '';
      linhas.push(`- **${lugar.nome || lugar.id}** (${lugar.id || '-'}) — ${lugar.funcao_narrativa || '-'}. Luz: ${lugar.luz_natural || '-'}. Props: ${props || '-'}.`);
    }
  }
  const cont = c.continuidade || {};
  if (Array.isArray(cont.o_que_nao_pode_mudar) && cont.o_que_nao_pode_mudar.length) {
    linhas.push(`**Nao pode mudar:** ${cont.o_que_nao_pode_mudar.join('; ')}`);
  }
  if (Array.isArray(cont.o_que_pode_variar) && cont.o_que_pode_variar.length) {
    linhas.push(`**Pode variar:** ${cont.o_que_pode_variar.join('; ')}`);
  }
  return linhas.join('\n\n');
}

function renderAlma(c) {
  if (!c) return '';
  const out = [];
  const ve = c.verdade_emocional || {};
  // o arco vira prosa: desejo -> obstaculo -> virada -> respiro
  const arco = ['desejo', 'obstaculo', 'virada', 'respiro']
    .map((k) => naoVazio(ve[k]) ? `**${k}** ${ve[k]}` : null)
    .filter(Boolean)
    .join(' → ');
  if (arco) out.push(`**Verdade emocional:** ${arco}`);

  if (Array.isArray(c.locucao) && c.locucao.length) {
    const linhas = c.locucao
      .map((l) => `  - \`${l.inicio_seg}s–${l.fim_seg}s\` (beat ${l.beat}): "${l.texto}"`)
      .join('\n');
    out.push(`**Locucao cronometrada:**\n${linhas}`);
  }

  if (Array.isArray(c.estrategia_render) && c.estrategia_render.length) {
    const linhas = c.estrategia_render
      .map((r) => `  - beat ${r.beat} — **${r.modo}**: ${r.justificativa}`)
      .join('\n');
    out.push(`**Estrategia de render por beat:**\n${linhas}`);
  }

  if (c.guarda_regulatoria && typeof c.guarda_regulatoria === 'object') {
    const ativas = Object.entries(c.guarda_regulatoria)
      .filter(([, v]) => v === true)
      .map(([k]) => k)
      .join(', ');
    if (ativas) out.push(`**Guarda regulatoria:** ${ativas}`);
  }
  return out.join('\n\n');
}

function renderRoteiro(c) {
  if (!c) return '';
  const out = [];
  if (naoVazio(c.titulo)) out.push(`**Titulo:** ${c.titulo}`);
  if (naoVazio(c.gancho)) out.push(`**Gancho:** ${c.gancho}`);
  if (Array.isArray(c.desenvolvimento) && c.desenvolvimento.length) {
    const linhas = c.desenvolvimento
      .map((b) => `  ${b.beat}. ${b.descricao}`)
      .join('\n');
    out.push(`**Desenvolvimento:**\n${linhas}`);
  }
  if (naoVazio(c.cta)) out.push(`**CTA:** ${c.cta}`);
  const meta = [];
  if (naoVazio(c.plataforma)) meta.push(`plataforma ${c.plataforma}`);
  if (naoVazio(c.duracao_alvo_seg)) meta.push(`${c.duracao_alvo_seg}s`);
  if (naoVazio(c.tom)) meta.push(`tom: ${c.tom}`);
  if (meta.length) out.push(`*(${meta.join(' · ')})*`);
  return out.join('\n\n');
}

function renderDecupagem(c) {
  if (!c) return '';
  const cenas = Array.isArray(c.cenas) ? c.cenas : [];
  if (!cenas.length) return '';
  return cenas.map((cn) => {
    const partes = [`**Cena ${cn.n}** (${cn.beat_narrativo || '—'})`];
    if (naoVazio(cn.descricao_visual)) partes.push(cn.descricao_visual);
    const tail = [];
    if (naoVazio(cn.mood)) tail.push(`mood: ${cn.mood}`);
    if (naoVazio(cn.duracao_seg)) tail.push(`${cn.duracao_seg}s`);
    if (naoVazio(cn.personagem_presente)) tail.push(`personagem: ${cn.personagem_presente}`);
    if (tail.length) partes.push(`*(${tail.join(' · ')})*`);
    return `- ${partes.join(' — ')}`;
  }).join('\n');
}

function renderEdicao(c) {
  if (!c) return '';
  const out = [];
  if (naoVazio(c.estilo_corte)) out.push(`**Estilo de corte:** ${c.estilo_corte}`);
  if (Array.isArray(c.transicoes) && c.transicoes.length) out.push(`**Transicoes:** ${c.transicoes.join(', ')}`);
  if (Array.isArray(c.ritmo_por_secao) && c.ritmo_por_secao.length) {
    const linhas = c.ritmo_por_secao
      .map((r) => `  - **${r.secao}** — ${r.pacing} *(${r.planos_distintos} plano${r.planos_distintos === 1 ? '' : 's'} distinto${r.planos_distintos === 1 ? '' : 's'})*`)
      .join('\n');
    out.push(`**Pacing por secao:**\n${linhas}`);
  }
  if (Array.isArray(c.match_cuts) && c.match_cuts.length) {
    const linhas = c.match_cuts.map((m) => `  - ${m.de} → ${m.para}`).join('\n');
    out.push(`**Match-cuts:**\n${linhas}`);
  }
  if (naoVazio(c.justificativa)) out.push(`**Justificativa:** ${c.justificativa}`);
  return out.join('\n\n');
}

// §6 — o PROMPT UNICO (prompt-forge). Renderiza o cabecalho (formato/modelo/personagem),
// a decupagem estruturada (shots[]) e a prosa final que vai pro modelo.
function renderPromptUnico(c) {
  if (!c) return '';
  const out = [];
  const meta = [];
  if (naoVazio(c.formato)) meta.push(`formato: ${c.formato}`);
  if (naoVazio(c.modelo)) meta.push(`modelo: ${c.modelo}`);
  if (naoVazio(c.aspect_ratio)) meta.push(c.aspect_ratio);
  if (naoVazio(c.personagem)) meta.push(`personagem: ${c.personagem}`);
  if (naoVazio(c.duracao_seg)) meta.push(`${c.duracao_seg}s`);
  if (meta.length) out.push(`*(${meta.join(' · ')})*`);

  const shots = Array.isArray(c.shots) ? c.shots : [];
  if (shots.length) {
    const linhas = shots.map((s) => {
      const cab = `**Shot ${s.n}** (${s.beat || '—'})`;
      const tec = [s.tamanho_plano, s.angulo, s.movimento_camera].filter(naoVazio).join(' · ');
      const desc = naoVazio(s.descricao) ? s.descricao : '';
      const tail = tec ? ` *(${tec})*` : '';
      return `- ${cab}: ${desc}${tail}`;
    }).join('\n');
    out.push(`**Decupagem (shots):**\n${linhas}`);
  }

  if (naoVazio(c.negative_prompt)) out.push(`**Negative:** ${c.negative_prompt}`);
  if (naoVazio(c.prompt)) out.push(`**Prompt final (vai pro modelo):**\n\n> ${String(c.prompt).replace(/\n/g, '\n> ')}`);
  return out.join('\n\n');
}

const RENDERIZADORES = {
  intencao: renderIntencao,
  identidade: renderIdentidade,
  project_brief: renderProjectBrief,
  mundo: renderMundo,
  alma: renderAlma,
  roteiro: renderRoteiro,
  decupagem: renderDecupagem,
  edicao: renderEdicao,
  prompt_unico: renderPromptUnico,
};

// renderMarkdown transforma o dossie consolidado na visao legivel (o heroi).
function renderMarkdown(dossie) {
  const linhas = [];
  linhas.push(`# Dossie de Prompt — ${dossie.personagem} · ${dossie.plataforma}`);
  linhas.push('');
  linhas.push(`> Projeto: **${dossie.projeto}** · forjador de prompt vivo (Etapa 1).`);
  linhas.push('> Cada agente enriquece este artefato unico; secoes pendentes aguardam o agente dono.');
  linhas.push('');

  for (const s of SECOES) {
    const secao = dossie.secoes[s.key] || {};
    const preenchida = secao.status === 'preenchida';
    const selo = preenchida
      ? `[✅ preenchida por ${secao.dono}]`
      : `[⏳ pendente]`;
    linhas.push(`## §${s.n} — ${s.titulo} ${selo}`);
    linhas.push('');
    if (preenchida) {
      const corpo = (RENDERIZADORES[s.key] || (() => ''))(secao.conteudo);
      linhas.push(corpo && corpo.trim().length ? corpo : '*(artefato presente, sem conteudo renderizavel)*');
    } else {
      linhas.push(`⏳ aguardando o agente \`${secao.dono}\`.`);
    }
    linhas.push('');
  }

  return linhas.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

// montarEEscrever le os artefatos do outDir, monta o dossie e escreve dossie.json +
// dossie.md no proprio outDir. Devolve { dossie, jsonPath, mdPath }.
function montarEEscrever(outDir) {
  const dossie = montarDossie(outDir);
  const md = renderMarkdown(dossie);
  const jsonPath = path.join(outDir, 'dossie.json');
  const mdPath = path.join(outDir, 'dossie.md');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(dossie, null, 2) + '\n');
  fs.writeFileSync(mdPath, md);
  return { dossie, md, jsonPath, mdPath };
}

module.exports = { montarDossie, renderMarkdown, montarEEscrever, SECOES };

if (require.main === module) {
  const argv = process.argv.slice(2);
  let root = null;
  let outDir = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') root = argv[++i];
    else if (argv[i] === '--out') outDir = argv[++i];
  }
  if (!root && !outDir) {
    console.error('Uso: node scripts/lib/dossie.cjs --root projects/<nome>  (ou)  --out <dir-com-os-artefatos>');
    process.exit(2);
  }
  // --root projects/<nome> => le/escreve em <root>/output. --out <dir> => le/escreve no proprio dir.
  const dir = outDir || path.join(root, 'output');
  if (!fs.existsSync(dir)) {
    console.error(`[dossie] diretorio nao encontrado: ${dir}`);
    process.exit(2);
  }
  const { dossie, jsonPath, mdPath } = montarEEscrever(dir);
  const preenchidas = Object.values(dossie.secoes).filter((s) => s.status === 'preenchida').length;
  console.log(`Dossie montado: ${preenchidas}/${SECOES.length} secoes preenchidas.`);
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  process.exit(0);
}
