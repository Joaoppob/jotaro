#!/usr/bin/env node
'use strict';

const custos = require('./custos.cjs');
const parseArgs = require('./parse-args.cjs');

// Data do snapshot do catalogo abaixo (confirmado via `higgsfield model list`).
// O catalogo e ESTATICO; a verificacao viva e feita por idsObsoletos() alimentado
// com a saida real de `higgsfield model list`.
const CATALOGO_DATA = '2026-06-26';

// Caminho MCP do 0.7: a producao vai pelas tools mcp__higgsfield__* (chamadas pelo
// Jotaro em runtime, nunca de dentro de um .cjs). Estes ids sao executaveis AGORA
// por esse caminho. `executable_mcp` e o flag do caminho MCP; `executable_now`
// segue sendo o flag do caminho CLI legado (lido por quem seleciona current/CLI).
const EXECUTABLE_MCP = new Set(['kling3_0', 'seedance_2_0', 'seedance_2_0_mini', 'nano_banana_2']);

const MODELS = [
  {
    id: 'nano_banana_2',
    display_name: 'Nano Banana Pro',
    kind: 'image',
    tier: 'A',
    executable_now: true,
    plan: 'free',
    focus: ['default', 'image', 'reference', 'fast', 'budget', 'product', 'text'],
    best_for: 'Default executavel hoje via CLI: imagem 9:16 com refs, boa aderencia e custo fixo. Confirmado 2026-06-26: o slug nano_banana_2 = "Nano Banana Pro" (NAO o Flash).',
    tradeoff: 'Nao confunda com nano_banana_flash (display "Nano Banana 2", tier inferior). nano_banana_2 e o Pro. Pode ficar abaixo de Soul/Cinema Studio em still cinema-grade.',
    cost_note: `fixo no CLI atual: ${custos.IMAGEM} cr por imagem 9:16`,
  },
  {
    id: 'text2image_soul_v2',
    display_name: 'Higgsfield Soul V2',
    kind: 'image',
    tier: 'A',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['character', 'identity', 'ugc', 'fashion', 'personagem', 'consistencia', 'soul'],
    best_for: 'Personagem/UGC/fashion com identidade consistente via soul_id (Higgsfield Soul V2).',
    tradeoff: 'Exige fluxo Soul; substitui parte do refs+anchor quando houver credito/plano.',
    cost_note: 'AC via higgsfield generate cost; depende de soul_id/plano',
  },
  {
    id: 'soul_cinematic',
    kind: 'image',
    tier: 'S',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['cinema', 'cinematic', 'film', 'lighting', 'stills', 'personagem', 'character'],
    best_for: 'Still cinema-grade, luz dramatica e personagem com acabamento premium.',
    tradeoff: 'Provavel modelo pago; nao e o default CLI desta versao.',
    cost_note: 'AC via higgsfield generate cost; nao usar numero fixo',
  },
  {
    id: 'cinematic_studio_2_5',
    kind: 'image',
    tier: 'S',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['cinema', 'film', 'stills', '4k', 'premium', 'lighting'],
    best_for: 'Still cinematografico 4K e campanha com cara de filme.',
    tradeoff: 'Custo/plano AC; usar quando o output precisa bater nivel 100 visual.',
    cost_note: 'AC via higgsfield generate cost; nao usar numero fixo',
  },
  {
    id: 'ms_image',
    kind: 'image',
    tier: 'A',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['ad', 'ads', 'dtc', 'produto', 'product', 'brand', 'marketing'],
    best_for: 'Imagem de ad DTC brand-kit-aware, produto e avatar.',
    tradeoff: 'Exige style_id/Marketing Studio; pode curto-circuitar parte do pipeline.',
    cost_note: 'AC via higgsfield generate cost; depende de style_id',
  },
  {
    id: 'veo3_1_lite',
    display_name: 'Veo 3.1 Lite',
    kind: 'video',
    tier: 'B',
    executable_now: true,
    plan: 'free',
    focus: ['default', 'free', 'volume', 'fast', 'hook', 'simple', 'budget'],
    best_for: 'Default executavel hoje via CLI: volume, hooks simples, produto com baixo movimento, 4s 9:16.',
    tradeoff: 'Nao e o teto; quebra mais em fisica complexa, hero shot e movimento ambicioso.',
    cost_note: `fixo no CLI atual: ${custos.VIDEO} cr por video 4s 9:16 com --duration 4`,
  },
  {
    id: 'veo3_1',
    kind: 'video',
    tier: 'S',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['hero', 'cinema', 'cinematic', 'audio', 'quality', 'physics', 'film'],
    best_for: 'Hero shot cinematografico, audio nativo e fisica mais confiavel que o Lite.',
    tradeoff: 'Custo alto e clipe curto; confirmar plano/preco antes de rodar.',
    cost_note: 'AC via higgsfield generate cost; web sugere custo alto',
  },
  {
    id: 'cinematic_studio_3_0',
    kind: 'video',
    tier: 'S',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['hero', 'cinema', 'cinematic', 'sota', 'film', 'quality', 'premium'],
    best_for: 'Modelo cinema-grade/SOTA para hero video premium.',
    tradeoff: 'Provavel pago; usar quando o objetivo e teto de craft, nao volume.',
    cost_note: 'AC via higgsfield generate cost; nao usar numero fixo',
  },
  {
    id: 'seedance_2_0_mini',
    display_name: 'Seedance 2.0 Mini',
    kind: 'video',
    tier: 'S/A',
    executable_now: false,
    plan: 'paid_or_ac',
    duration_max_seg: 15,
    focus: ['default', 'reference', 'identity', 'character', 'personagem', 'commercial', 'ad', 'ads', 'control', 'controle', 'product', 'produto', 'multishot'],
    best_for: 'Confirmado em uso real (2026-07 em diante) como o modelo que MELHOR desempenha no pipeline 0.7 hoje: multishot com Element, controle de camera e fidelidade de referencia/produto, custo mais leve que o seedance_2_0 cheio.',
    tradeoff: 'Variante mini da familia seedance_2_0 -- mesma disciplina, mais leve. Confirme sempre o custo real com get_cost (mini nao significa automaticamente mais barato). Teto de duracao: 4-15s por job -- roteiro mais longo precisa dividir em partes (ver needsSplit() e RAG/prompts/producao-higgsfield-mcp.md).',
    cost_note: 'AC via higgsfield generate cost; confirmado executavel via MCP em uso real',
  },
  {
    id: 'seedance_2_0',
    kind: 'video',
    tier: 'S/A',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['control', 'controle', 'commercial', 'ad', 'ads', 'identity', 'character', 'lip-sync', 'audio', 'reference'],
    best_for: 'Ad comercial on-brief, controle de camera, refs, personagem e audio/lip-sync.',
    tradeoff: 'Pode exigir plano Plus/verificacao; menos experimental, mais disciplinado.',
    cost_note: 'AC via higgsfield generate cost; plano pode bloquear',
  },
  {
    id: 'kling3_0',
    kind: 'video',
    tier: 'A',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['volume', 'hook', 'social', 'motion', 'person', '4k', 'fashion'],
    best_for: 'Variacoes sociais em volume, movimento humano e hooks para teste criativo.',
    tradeoff: 'Risco operacional/deriva de cor; teto hero abaixo de Veo/Cinematic Studio.',
    cost_note: 'AC via higgsfield generate cost; nao usar numero fixo',
  },
  {
    id: 'marketing_studio_video',
    kind: 'video',
    tier: 'A',
    executable_now: false,
    plan: 'paid_or_ac',
    focus: ['ad', 'ads', 'marketing', 'tiktok', 'reels', 'product', 'hooks'],
    best_for: 'Ad de produto one-click para TikTok/Reels com hooks/settings/ad_reference.',
    tradeoff: 'Pode ser atalho de pipeline, mas reduz controle artesanal por cena.',
    cost_note: 'AC via higgsfield generate cost; depende do Marketing Studio',
  },
];

// Custo de geracao POR CENARIO (reel de N cenas). Para o modelo default executavel
// o numero e fixo e real (custos.cjs); para modelos pagos NAO inventa preco — devolve
// "AC x N" e manda confirmar com `higgsfield generate cost`. Em modo biblioteca a
// imagem custa 0 (selecao de asset), so o video custa.
function custoCenario(model, cenas, modo) {
  const n = Number(cenas);
  if (!Number.isFinite(n) || n <= 0) return null;
  const modoVisual = String(modo || 'geracao').toLowerCase();
  if (!model) return null;
  if (!model.executable_now) {
    return { cenas: n, por_cena: 'AC', total: `AC x ${n}`, confirmar: 'higgsfield generate cost', fixo: false };
  }
  if (model.kind === 'image') {
    const porCena = modoVisual === 'biblioteca' ? 0 : custos.IMAGEM;
    return { cenas: n, modo: modoVisual, por_cena: porCena, total: porCena * n, unidade: 'creditos', fixo: true };
  }
  // video
  return { cenas: n, por_cena: custos.VIDEO, total: custos.VIDEO * n, unidade: 'creditos', fixo: true };
}

// Diz se um modelo e executavel pelo caminho MCP do 0.7 (mcp__higgsfield__*).
function executableMcp(model) {
  return !!model && EXECUTABLE_MCP.has(model.id);
}

// Custo de um JOB UNICO no caminho MCP do 0.7. O produto forja UM prompt -> UM job;
// o custo NAO e per-cena x N. O numero REAL vem do `get_cost` do MCP em runtime
// (generate_* com get_cost:true); este advisor NAO inventa preco — so apresenta a
// linha de tradeoff e manda confirmar. Por isso o total e sempre "confirme com
// get_cost", nunca um literal img=2/video=4.
function custoJob(model) {
  if (!model) return null;
  return {
    modelo: model.id,
    unidade: 'job_unico',
    total: 'confirme com get_cost',
    fonte: 'mcp__higgsfield__generate_*(get_cost:true)',
    fixo: false,
  };
}

// Alguns modelos de video tem teto de duracao por job (ex.: seedance_2_0_mini,
// 4-15s). Um roteiro mais longo que o teto precisa virar 2+ jobs que juntos
// formam UM video (ver RAG/prompts/producao-higgsfield-mcp.md + video-join.cjs).
// Divide em partes iguais respeitando o teto (nunca so 2 fixo -- um roteiro de
// 40s com teto 15 precisa de 3 partes, nao 2 partes de 20s cada).
function needsSplit(modelIdOrObj, duracaoAlvoSeg) {
  const model = typeof modelIdOrObj === 'string' ? MODELS.find((m) => m.id === modelIdOrObj) : modelIdOrObj;
  const cap = model && model.duration_max_seg;
  const duracao = Number(duracaoAlvoSeg);
  if (!cap || !Number.isFinite(duracao) || duracao <= cap) {
    return { split: false, cap: cap || null, partes: 1 };
  }
  const partes = Math.ceil(duracao / cap);
  return { split: true, cap, partes, duracao_por_parte_alvo: Math.ceil((duracao / partes) * 10) / 10 };
}

// Cruza os ids hardcoded do MODELS com a saida REAL de `higgsfield model list`
// (texto cru, uma linha por modelo com o slug na 1a coluna). Devolve os ids do
// catalogo estatico que NAO aparecem mais no catalogo vivo — sinal de obsolescencia.
// O Jotaro alimenta isto com a saida do CLI antes de recomendar um teto pago.
function idsObsoletos(liveListText, kind) {
  const text = String(liveListText || '');
  const slugs = new Set();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([a-z0-9_]+)\b/i);
    if (m) slugs.add(m[1].toLowerCase());
  }
  if (slugs.size === 0) return { ok: false, erro: 'saida de model list vazia ou ilegivel', obsoletos: [] };
  const alvo = kind ? MODELS.filter((mo) => mo.kind === normalizeKind(kind)) : MODELS;
  const obsoletos = alvo.filter((mo) => !slugs.has(mo.id.toLowerCase())).map((mo) => mo.id);
  return { ok: true, conferidos: alvo.length, obsoletos };
}

function normalizeKind(kind) {
  const k = String(kind || '').toLowerCase();
  if (k === 'imagem') return 'image';
  if (k === 'video') return 'video';
  return k === 'image' ? 'image' : 'video';
}

function textScore(model, objective) {
  const text = String(objective || '').toLowerCase();
  let score = model.executable_now ? 12 : 0;
  if (model.tier === 'S') score += 25;
  else if (model.tier === 'S/A') score += 22;
  else if (model.tier === 'A') score += 16;
  else score += 8;
  for (const token of model.focus) {
    if (text.includes(token)) score += 18;
  }
  if (/free|barat|budget|volume|hook|teste|rapido/.test(text) && model.plan === 'free') score += 35;
  if (/hero|cinema|cinematic|premium|nivel 100|qualidade maxima/.test(text) && model.tier.includes('S')) score += 30;
  if (/personagem|character|identidade|consisten/.test(text) && /soul|seedance/.test(model.id)) score += 35;
  if (/produto|product|dtc|marketing|ad\b|ads/.test(text) && /marketing|ms_|seedance|nano/.test(model.id)) score += 20;
  if (/audio|som|lip/.test(text) && model.kind === 'video' && /veo3_1|seedance|marketing/.test(model.id)) score += 25;
  // Desempate a favor do seedance_2_0_mini: confirmado em uso real (2026-07) como o
  // modelo que MELHOR desempenha no pipeline 0.7 hoje. Sem este nudge ele empatava de
  // tier com o seedance_2_0 cheio e nunca aparecia recomendado primeiro — o que ja
  // aconteceu de verdade (relatado em producao: o advisor nunca sugeria o mini).
  if (model.id === 'seedance_2_0_mini') score += 5;
  return score;
}

function sortOptions(options, objective) {
  return options
    .map((model) => Object.assign({ fit_score: textScore(model, objective) }, model))
    .sort((a, b) => b.fit_score - a.fit_score || String(a.id).localeCompare(String(b.id)));
}

function recommendModels(input = {}) {
  const kind = normalizeKind(input.kind || input.outputType);
  const objective = input.objective || input.objetivo || '';
  const plan = String(input.plan || input.plano || 'unknown').toLowerCase();
  const credits = input.credits === undefined || input.credits === null || input.credits === ''
    ? null
    : Number(input.credits);
  const options = sortOptions(MODELS.filter((model) => model.kind === kind), objective);
  const current = options.find((model) => model.executable_now) || null;
  let recommended = options[0] || null;
  if (plan === 'free' && /free|barat|budget|volume|hook|teste|rapido/.test(String(objective).toLowerCase())) {
    recommended = current || recommended;
  }

  const warnings = [];
  if (plan === 'free' && recommended && !recommended.executable_now) {
    warnings.push(`Plano free/saldo atual nao executa ${recommended.id} automaticamente; apresente como upgrade/topup e use ${current && current.id} se o usuario quiser seguir agora.`);
  }
  if (credits !== null && Number.isFinite(credits) && credits <= 0) {
    warnings.push('Credito atual e 0; nada pago roda agora. A assessoria mostra o teto, nao autoriza gasto.');
  }
  warnings.push('No caminho MCP do 0.7 o produto forja UM prompt -> UM job: o custo e do JOB UNICO, nao per-cena x N. O numero real vem do get_cost do MCP (generate_* com get_cost:true); confirme com get_cost antes de prometer preco.');
  warnings.push('Custos de modelos nao-default sao AC: confirme com higgsfield generate cost antes de prometer preco.');
  warnings.push('Execucao automatica desta versao continua via CLI; modelos nao-default sao decisao informada do usuario antes de integrar rota propria.');
  warnings.push(`Catalogo abaixo e snapshot de ${CATALOGO_DATA}; rode \`higgsfield model list\` e cruze com idsObsoletos() antes de recomendar um teto pago (ids podem mudar).`);

  const cenas = input.cenas === undefined || input.cenas === null || input.cenas === '' ? null : Number(input.cenas);
  const custo_cenario = cenas !== null
    ? {
      cenas,
      modo: input.modo || input.modo_visual || 'geracao',
      executavel: custoCenario(current, cenas, input.modo || input.modo_visual),
      recomendado: recommended && recommended.id !== (current && current.id)
        ? custoCenario(recommended, cenas, input.modo || input.modo_visual)
        : null,
    }
    : null;

  // Caminho MCP do 0.7: marca quais opcoes rodam agora via mcp__higgsfield__* e
  // anexa o custo de JOB UNICO (confirme com get_cost; nunca per-cena x N).
  const topOptions = options.slice(0, 5).map((o) => Object.assign({}, o, {
    executable_mcp: executableMcp(o),
    custo_job: custoJob(o),
  }));
  const mcpModel = topOptions.find((o) => o.executable_mcp) || null;

  return {
    kind,
    objective,
    plan,
    credits,
    catalogo_data: CATALOGO_DATA,
    current_executable_model: current,
    recommended,
    options: topOptions,
    // Caminho MCP (0.7): modelo executavel agora via MCP + custo do job unico.
    mcp_executable_model: mcpModel,
    custo_job: custoJob(recommended),
    custo_cenario,
    warnings,
  };
}

function printHuman(advice) {
  const lines = [];
  lines.push(`# Assessoria de modelo (${advice.kind})`);
  lines.push(`Objetivo: ${advice.objective || '(nao informado)'}`);
  lines.push(`Modelo executavel agora (CLI legado): ${advice.current_executable_model.id} (${advice.current_executable_model.cost_note})`);
  if (advice.mcp_executable_model) {
    lines.push(`Modelo executavel agora (MCP 0.7): ${advice.mcp_executable_model.id}`);
  }
  lines.push(`Parecer: ${advice.recommended.id} - ${advice.recommended.best_for}`);
  lines.push('Custo (caminho MCP 0.7): JOB UNICO — confirme com get_cost (generate_* com get_cost:true). NAO e per-cena x N.');
  if (advice.custo_cenario) {
    const e = advice.custo_cenario.executavel;
    if (e) {
      const tot = e.fixo ? `${e.total} ${e.unidade}` : e.total;
      lines.push(`Custo do cenario (${advice.custo_cenario.cenas} cenas, modo ${advice.custo_cenario.modo}, ${advice.current_executable_model.id}): ${tot}${e.fixo ? '' : ' — confirme com higgsfield generate cost'}`);
    }
  }
  lines.push('');
  lines.push('| modelo | tier | roda agora (MCP)? | melhor para | custo | tradeoff |');
  lines.push('|---|---|---|---|---|---|');
  for (const option of advice.options) {
    const rodaMcp = (option.executable_mcp || EXECUTABLE_MCP.has(option.id)) ? 'sim' : 'nao';
    lines.push(`| ${option.id} | ${option.tier} | ${rodaMcp} | ${option.best_for} | confirme com get_cost | ${option.tradeoff} |`);
  }
  lines.push('');
  for (const warning of advice.warnings) lines.push(`- ${warning}`);
  return `${lines.join('\n')}\n`;
}

module.exports = {
  MODELS,
  CATALOGO_DATA,
  EXECUTABLE_MCP,
  recommendModels,
  printHuman,
  custoCenario,
  custoJob,
  executableMcp,
  idsObsoletos,
  needsSplit,
};

if (require.main === module) {
  const args = parseArgs(process.argv);
  const fs = require('fs');
  // Modo verificacao de catalogo: cruza os ids hardcoded com a saida do CLI vivo.
  //   higgsfield model list --image > /tmp/live.txt
  //   node scripts/lib/model-advisor.cjs --verificar-catalogo /tmp/live.txt [--tipo image]
  if (args['verificar-catalogo']) {
    let text = '';
    try { text = fs.readFileSync(args['verificar-catalogo'], 'utf8'); } catch (e) {
      process.stderr.write(`nao li o arquivo de model list: ${e.message}\n`);
      process.exit(2);
    }
    const r = idsObsoletos(text, args.tipo || args.kind);
    process.stdout.write(`${JSON.stringify(r, null, 2)}\n`);
    process.exit(r.ok && r.obsoletos.length === 0 ? 0 : 1);
  }
  const kind = args.kind || args.tipo || process.argv[2];
  const objective = args.objective || args.objetivo || args.o || '';
  const advice = recommendModels({
    kind,
    objective,
    plan: args.plan || args.plano,
    credits: args.credits || args.creditos || args.saldo,
    cenas: args.cenas || args.scenes,
    modo: args.modo || args['modo-visual'],
  });
  if (args.json === true || args.json === 'true') {
    process.stdout.write(`${JSON.stringify(advice, null, 2)}\n`);
  } else {
    process.stdout.write(printHuman(advice));
  }
}
