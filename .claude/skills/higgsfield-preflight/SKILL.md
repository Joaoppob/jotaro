---
name: higgsfield-preflight
description: Checa, ANTES de gerar qualquer imagem/vídeo, se o saldo Higgsfield cobre o JOB. O custo e o saldo vêm do MCP do Higgsfield (mcp__higgsfield__balance para o saldo; generate_* com get_cost:true para o custo do job único), chamados pelo Jotaro em runtime. O script preflight.cjs faz só a aritmética offline de cobre/não-cobre. Use SEMPRE antes da primeira chamada de geração de um run.
argument-hint: "[custo do job] [saldo]"
allowed-tools: Bash
---

# higgsfield-preflight — trava de crédito

Disparos recusados por falta de crédito **não cobram**. Mesmo assim, checar antes evita
queimar crédito num job que o saldo não cobre. No 0.7 o produto forja **um único prompt** →
**um único job**: o custo é o do **job único** (NÃO `N×2 + N×4` por cena).

## A fonte de verdade do custo é o MCP

Este preflight é um **procedimento do agente via MCP** — não um script que chama o CLI/MCP.
As tools `mcp__higgsfield__*` são chamadas pelo Jotaro em runtime; **não dá para chamá-las de
dentro de um `.cjs`**. O Jotaro descobre saldo e custo via MCP, e o `preflight.cjs` só faz a
conta de cobre/não-cobre.

| O que | Tool MCP (Jotaro em runtime) | Devolve |
|-------|------------------------------|---------|
| Saldo | `mcp__higgsfield__balance` | créditos da conta |
| Custo do job | `mcp__higgsfield__generate_*` com `get_cost: true` | custo do **job único** |

> Nunca hardcode preço. O número fixo do CLI antigo (img=2, vídeo=4) é histórico; no 0.7 o
> custo real vem do `get_cost`. Tabela de tradeoff de modelos:
> `node scripts/lib/model-advisor.cjs video --objetivo "<job>" --plano "<plano>" --saldo "<cr>"`
> — ela marca "confirme com get_cost" e não inventa preço.

## Procedimento

### 1. Saldo e custo via MCP

O Jotaro chama, em runtime:

1. `mcp__higgsfield__balance` → o **saldo** real da conta. Confira a conta ativa — é ela que paga.
2. O `generate_*` do formato do `prompt-forge.json` com `get_cost: true` → o **custo do job único**.
   (Ex.: `generate_video` para `formato:"video"`, `generate_image` para `formato:"imagem"`.)

O fluxo completo de produção via MCP está em `RAG/prompts/producao-higgsfield-mcp.md`.

### 2. Decisão (aritmética offline, sem rede)

Com o custo (do `get_cost`) e o saldo (do `balance`) em mãos, rode a conta pura:

```bash
node .claude/skills/higgsfield-preflight/scripts/preflight.cjs \
  --custo <CUSTO_DO_GET_COST> \
  --saldo <SALDO_DO_BALANCE>
```

O script imprime JSON:

```json
{
  "modo": "job_unico",
  "custo": 18,
  "saldo": 30,
  "falta": 0,
  "pode_prosseguir": true,
  "mensagem": "OK pra prosseguir. Custo do job (get_cost via MCP) = 18 cr, saldo (balance via MCP) = 30 cr."
}
```

O `preflight.cjs` **não chama o MCP nem a rede** — recebe saldo e custo como args e diz se cobre.
A fonte do custo é sempre o `get_cost` do MCP; o script só compara.

### 3. Agir sobre o resultado

- **`pode_prosseguir: false`** → PARE. Mostre a `mensagem`. Ofereça reduzir escopo, esperar o
  pool renovar, ou plano pago. NÃO gere.
- **`pode_prosseguir: true`** → siga, mostrando o custo do job ao usuário antes do disparo.
- **Saldo indisponível** (o `balance` não retornou) → geração real deve parar; não gere às cegas.

> Modo legado/offline (`/simular`): para planejamento sem MCP, o `preflight.cjs` ainda aceita a
> estimativa por cenas (`--cenas <N> [--saldo <S>] [--com-video false] [--allow-unknown-saldo true]`)
> com os custos fixos históricos. Mas para geração real no 0.7, a fonte do custo é o `get_cost`.

## SPOF do vídeo: confirme o modelo de vídeo ANTES de gastar

O modelo de vídeo é um **ponto único de falha (SPOF)**: sem ele não há reel. Historicamente, no
free tier, o `veo3_1_lite` era o único modelo de vídeo; no 0.7 o vídeo vai por `kling3_0`/
`seedance_2_0` via MCP. A regra continua: antes de gastar o primeiro crédito, confirme via MCP
que o modelo de vídeo do `prompt-forge.json` está disponível na conta atual (e que o `get_cost`
retornou). Se o modelo de vídeo estiver indisponível e o objetivo é um reel, **avise e PARE**
antes de gerar qualquer coisa — crédito gasto não volta e o reel não fecha sem o vídeo.

## Combina saldo real + custo real

A decisão usa **saldo real** (do `balance`) **e** o **custo real do job** (do `get_cost`), ambos
do MCP. Nunca dependa só de um: o custo você confirma com `get_cost`; o saldo com `balance`. O
`preflight.cjs` só fecha a conta entre os dois.
