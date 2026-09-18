#!/usr/bin/env node
/**
 * preflight.cjs — aritmetica OFFLINE de custo de um run Higgsfield.
 *
 * NAO chama CLI, NAO chama MCP, NAO chama a rede. A fonte de verdade do CUSTO no
 * 0.7 e o MCP do Higgsfield (`mcp__higgsfield__balance` para o saldo e
 * `generate_*` com `get_cost:true` para o custo do JOB UNICO) — chamado pelo
 * Jotaro em runtime, nunca de dentro deste `.cjs`. Este script so faz a conta de
 * cobre / nao-cobre depois que o agente ja descobriu saldo e custo via MCP.
 *
 * Duas formas de uso:
 *
 *   A) Preferido no 0.7 — custo do JOB UNICO vindo do get_cost do MCP:
 *      node preflight.cjs --custo <CUSTO_DO_GET_COST> --saldo <SALDO_DO_BALANCE>
 *      -> diz se o saldo cobre o job. O 0.7 forja UM prompt -> UM job; o custo
 *         NAO e N*2 + N*4. O numero real vem do MCP, este script so compara.
 *
 *   B) Legado/offline — estimativa por cenas com os custos fixos do CLI antigo
 *      (mantida para compatibilidade e para /simular):
 *      node preflight.cjs --cenas <N> [--saldo <S>] [--com-video true|false]
 *        [--teto-dia 10] [--allow-unknown-saldo true]
 *
 * Custos fixos do modo (B) (free tier, confirmados ao vivo no CLI 2026-06-18):
 *   - imagem (nano_banana_2)            = 2 creditos
 *   - video  (veo3_1_lite, --duration 4)= 4 creditos
 * Teto free = 10 creditos/dia, pool compartilhado img+video.
 *
 * Sai com JSON no stdout. exit 0 sempre (a decisao esta no campo pode_prosseguir).
 */

const custos = require('../../../../scripts/lib/custos.cjs');
const parseArgs = require('../../../../scripts/lib/parse-args.cjs');

const CUSTO_IMAGEM = custos.IMAGEM;
const CUSTO_VIDEO = custos.VIDEO;
const TETO_DIA_FREE = custos.TETO_DIA;

function toBool(v, def) {
  if (v === undefined) return def;
  if (typeof v === 'boolean') return v;
  return String(v).toLowerCase() !== 'false' && String(v) !== '0';
}

/**
 * covers — aritmetica pura do JOB UNICO (modo A, preferido no 0.7).
 *
 * Recebe o CUSTO (do `generate_*` get_cost:true do MCP) e o SALDO (do
 * `mcp__higgsfield__balance`), ambos descobertos pelo agente em runtime, e diz se
 * o saldo cobre o job. Nao chama nada — so compara. A fonte do custo e o MCP.
 */
function covers({ custo, saldo }) {
  const custoConhecido = custo !== undefined && custo !== null && custo !== '';
  const custoNum = custoConhecido ? Number(custo) : null;
  if (!custoConhecido || !Number.isFinite(custoNum) || custoNum < 0) {
    return {
      modo: 'job_unico',
      erro: `custo do job invalido ou ausente (recebido: ${String(custo)}). ` +
        `O custo vem do MCP: chame generate_* com get_cost:true e passe o numero em --custo.`,
      pode_prosseguir: false,
    };
  }
  const saldoConhecido = saldo !== undefined && saldo !== null && saldo !== '';
  const saldoNum = saldoConhecido ? Number(saldo) : null;
  if (!saldoConhecido || !Number.isFinite(saldoNum)) {
    return {
      modo: 'job_unico',
      custo: custoNum,
      saldo: null,
      pode_prosseguir: false,
      mensagem:
        `Saldo real indisponivel. O saldo vem do MCP (mcp__higgsfield__balance). ` +
        `Sem saldo confiavel nao gero. Custo do job (get_cost) = ${custoNum} cr.`,
    };
  }
  const cobre = saldoNum >= custoNum;
  return {
    modo: 'job_unico',
    custo: custoNum,
    saldo: saldoNum,
    falta: cobre ? 0 : custoNum - saldoNum,
    pode_prosseguir: cobre,
    mensagem: cobre
      ? `OK pra prosseguir. Custo do job (get_cost via MCP) = ${custoNum} cr, saldo (balance via MCP) = ${saldoNum} cr.`
      : `NAO da pra gerar agora. Custo do job = ${custoNum} cr, saldo = ${saldoNum} cr ` +
        `(faltam ${custoNum - saldoNum} cr). Disparo recusado por falta de credito NAO cobra.`,
  };
}

function preflight({ cenas, saldo, comVideo, tetoDia, allowUnknownSaldo }) {
  if (cenas === undefined || cenas === null || cenas === '') {
    return { erro: 'numero de cenas invalido ou ausente (use --cenas <N>)' };
  }
  if (!Number.isFinite(Number(cenas))) {
    return { erro: `numero de cenas invalido: nao e numero (recebido: ${String(cenas)})` };
  }
  const n = Math.max(0, Math.floor(Number(cenas)));
  if (n === 0) {
    return { erro: 'numero de cenas deve ser pelo menos 1 (recebido: 0)' };
  }
  const incluiVideo = comVideo !== false;
  const teto = Number.isFinite(Number(tetoDia)) ? Number(tetoDia) : TETO_DIA_FREE;

  const custoImagens = n * CUSTO_IMAGEM;
  const custoVideos = incluiVideo ? n * CUSTO_VIDEO : 0;
  const custoTotal = custoImagens + custoVideos;

  // dias necessarios no plano free (teto diario), arredondado pra cima
  const diasFree = teto > 0 ? Math.ceil(custoTotal / teto) : null;

  // saldo: pode ser desconhecido (agente nao conseguiu o tool)
  const saldoConhecido = saldo !== undefined && saldo !== null && saldo !== '';
  const saldoNum = saldoConhecido ? Number(saldo) : null;
  const saldoValido = saldoConhecido && Number.isFinite(saldoNum);

  let podeProsseguir;
  let poolBaixo = false;
  let mensagem;

  if (saldoConhecido && !saldoValido) {
    podeProsseguir = false;
    mensagem =
      `Saldo real invalido recebido (${String(saldo)}). Nao vou gerar sem saldo confiavel. ` +
      `Rode higgsfield account status novamente ou reconecte com higgsfield auth login.`;
  } else if (!saldoConhecido) {
    // Geracao real bloqueia sem saldo confiavel. A excecao explicita e /simular,
    // onde o usuario so quer custo/planejamento e nenhuma chamada sera criada.
    podeProsseguir = !!allowUnknownSaldo;
    mensagem =
      `Custo estimado do run: ${custoTotal} creditos ` +
      `(${n} imagens x ${CUSTO_IMAGEM} = ${custoImagens}` +
      (incluiVideo ? ` + ${n} videos x ${CUSTO_VIDEO} = ${custoVideos}` : '') +
      `). Saldo real INDISPONIVEL. ` +
      (allowUnknownSaldo
        ? `Modo simulacao: pode seguir porque nenhuma geracao sera disparada. `
        : `PARANDO: geracao real exige higgsfield account status com saldo valido. `) +
      `No free tier (${teto} cr/dia) este run levaria ~${diasFree} dia(s).`;
  } else if (custoTotal > saldoNum) {
    podeProsseguir = false;
    mensagem =
      `NAO da pra rodar o run inteiro agora. Custo total = ${custoTotal} cr, ` +
      `saldo atual = ${saldoNum} cr (faltam ${custoTotal - saldoNum} cr). ` +
      `Opcoes: (1) reduzir o numero de cenas; (2) esperar o pool free renovar ` +
      `(${teto} cr/dia, ~${diasFree} dia(s) pro run completo); (3) plano pago. ` +
      `Disparos recusados por falta de credito NAO cobram — nada e perdido por checar.`;
  } else {
    podeProsseguir = true;
    poolBaixo = saldoNum < custoTotal * 2;
    mensagem =
      `OK pra prosseguir. Custo total = ${custoTotal} cr ` +
      `(${custoImagens} imagens` +
      (incluiVideo ? ` + ${custoVideos} videos` : '') +
      `), saldo = ${saldoNum} cr.`;
    if (poolBaixo) {
      mensagem +=
        ` AVISO: pool baixo (saldo < 2x o custo do run). ` +
        `Sem folga pra regenerar cenas falhas sem renovar o pool.`;
    }
  }

  return {
    cenas: n,
    inclui_video: incluiVideo,
    saldo: saldoNum,
    saldo_conhecido: saldoConhecido,
    saldo_valido: saldoValido,
    custo_imagens: custoImagens,
    custo_videos: custoVideos,
    custo_total: custoTotal,
    teto_dia: teto,
    dias_free: diasFree,
    pool_baixo: poolBaixo,
    pode_prosseguir: podeProsseguir,
    mensagem,
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv);
  // Modo A (preferido no 0.7): custo do JOB UNICO vindo do get_cost do MCP.
  const result = args.custo !== undefined
    ? covers({ custo: args.custo, saldo: args.saldo })
    : preflight({
      cenas: args.cenas,
      saldo: args.saldo,
      comVideo: toBool(args['com-video'], true),
      tetoDia: args['teto-dia'],
      allowUnknownSaldo: toBool(args['allow-unknown-saldo'], false),
    });
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(0);
}

module.exports = { preflight, covers, CUSTO_IMAGEM, CUSTO_VIDEO, TETO_DIA_FREE };
