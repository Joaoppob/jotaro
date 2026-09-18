---
description: Confere saldo e plano no Higgsfield (via balance do MCP). Não gasta crédito.
---

# /creditos

Confira o estado do crédito no Higgsfield sem gastar nada. O usuário quer saber quanto tem e
o que dá para fazer com isso.

## Antes

Confirme que o Higgsfield está conectado (connector MCP). Rode `mcp__higgsfield__balance` — se
não retornar, o Higgsfield não está conectado: aponte para o `/setup`. No fallback CLI, se vier
"Not authenticated", conduza `higgsfield auth login` (sem reiniciar o Claude Code).

## O que fazer

Leia o saldo direto pela tool do MCP, sem chamar geração:

```
mcp__higgsfield__balance
```

Retorna o saldo da conta conectada. No fallback CLI, `higgsfield account status` devolve email,
plano e créditos. Isso é diferente do custo de um job, que precisa do prompt-forge pronto e do
`get_cost` para estimar.

## Confira a conta certa

Confirme com o usuário que a conta conectada é a que ele quer usar (a dos créditos). Se trocou de
conta no Higgsfield e o saldo não bate, reconecte na conta nova — eu confiro o novo saldo na hora,
sem reiniciar nada.

## Como apresentar

Diga, em linguagem simples:

- O saldo atual (e o plano/email, no fallback CLI, pra não haver dúvida de qual conta é).
- Que o custo real de uma criação é do **job único** (um prompt → um job), e vem do `get_cost` do
  MCP quando o prompt estiver forjado — **não** de uma tabela fixa por cena. Eu confiro sempre
  antes de gerar e nunca invento preço.
- Que dá pra ver o custo exato sem gastar: é só rodar `/simular`, que monta o prompt-forge e
  consulta o `get_cost`.

## Gasto já registrado (ledger por projeto)

O Higgsfield diz o saldo da conta; o **ledger** diz o que *um projeto* já gastou. O gasto é
por projeto, então pergunte de qual o usuário quer ver (ou liste `projects/` e some os que
interessam). Para o projeto `<PROJ>` (não custa nada, é leitura):

```bash
node scripts/lib/ledger.cjs summary --root <PROJ>
```

Devolve `total_creditos`, `por_dia`, `por_tipo` e `alertas`. Use pra responder "quanto já gastei
no projeto X?" e cruzar com o saldo do Higgsfield. Se o arquivo não existir ainda
(`n_entries: 0`), é só porque nenhum run gastou crédito nesse projeto.

## Custo honesto

Se o saldo não cobre o job que o usuário quer, seja claro: as opções são esperar a renovação
diária do pool, reduzir o escopo, ou assinar um plano pago. Não empurre o plano pago; apenas
mostre a conta com clareza e deixe a escolha com ele.

Planos pagos mudam com o tempo; se o usuário quiser comparar, aponte para a página atual do
Higgsfield em vez de prometer preços fixos.
