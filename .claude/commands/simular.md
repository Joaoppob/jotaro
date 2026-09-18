---
description: Simula um run completo montando o prompt-forge e calculando o custo do job (get_cost) sem gerar nada, sem gastar 1 credito.
argument-hint: "[descricao do video]"
---

# /simular

Roda toda a validacao pre-geracao sem disparar nenhum job no Higgsfield. E util pra quem quer ver
o plano completo — o prompt forjado, a RAG pronta, e exatamente quanto vai custar — tudo sem
gastar credito. O coracao do 0.7: montar o **prompt unico** e consultar o **custo do job** antes
de qualquer geracao.

## Passo 0: escolha o projeto

Liste `projects/` e pergunte qual projeto simular. Chame de `<PROJ>` o root escolhido
(ex.: `projects/example-hero`).

## Passo 1: validacao da RAG do projeto

Rode o validador deterministico da identidade do projeto:

```bash
node scripts/validate-rag.cjs --project <PROJ>
```

Se falhar, mostre o que falta (imagens, secoes da marca, anchor) e pare. Sem RAG pronta, nao
ha o que simular.

## Passo 2: forje o prompt unico (sem gerar)

Spawne o `rag` para ler a identidade da marca — diga o projeto no spawn
(`{ objetivo, projeto: "<PROJ>" }`). Depois spawne o `prompt-smith` com a identidade, a intencao
e o `element_id` da personagem. Ele devolve o **prompt unico** (`schemas/prompt-forge.schema.json`):
o `shots[]` estruturado + o campo `prompt` em prosa multishot rica. Salve em
`<PROJ>/output/prompt-forge.json`.

Mostre ao usuario o resumo:
- Projeto e personagem
- Formato (video / video_mudo / imagem) e modelo destino
- Os shots (beat, plano, angulo, movimento, mood)
- Referencia da personagem (Element) usada
- O prompt em prosa (ou um trecho)

Isso NAO gasta credito — os agentes so leem e sintetizam.

## Passo 3: rode os gates pre-credito (sem gerar)

Arme o gate sobre o prompt-forge — ele roda todos os gates de texto de uma vez e mostra se o
prompt passaria:

```bash
node scripts/preflight-gate.cjs --root <PROJ>
```

Mostre ao usuario o resultado do gate (aprovado / o que reprovou). Se reprovar, e aqui que se
descobre, sem custo: volte ao `prompt-smith`/`storyboard-director`.

## Passo 4: custo do job (get_cost, sem gerar)

Confira o saldo (`mcp__higgsfield__balance`) e o custo do job chamando o `generate_*` do formato
com `get_cost: true` (passando o `prompt`, `aspect_ratio` e o Element/medias do prompt-forge) —
isso devolve o custo do **job unico** sem disparar geracao. A skill `higgsfield-preflight` faz a
aritmetica offline de cobre/nao-cobre. Se o Higgsfield nao estiver conectado, diga "custo nao
conferido (Higgsfield desconectado)" e aponte `/setup`.

Mostre ao usuario:
- Formato e modelo
- Custo do job (o numero real do `get_cost`, nunca inventado)
- Saldo atual, ou "saldo nao conferido"
- Se cabe no saldo

## Passo 5: checks de prontidao

Confira:
- Higgsfield conectado? (`mcp__higgsfield__balance`). Se nao, aponte `/setup`.
- O Element da personagem existe (`element_id` no `project.json`)? Se nao, e o que falta pra
  produzir — aponte o passo de criar o Element (`RAG/prompts/producao-higgsfield-mcp.md`).
- As referencias em `<PROJ>/RAG/identidade-visual/` batem com a personagem do prompt.

## Fechamento

Mostre um resumo final:

```
SIMULACAO COMPLETA

RAG:                    pronta
Higgsfield (MCP):       conectado (saldo Z)
Element da personagem:  ok
Formato:                video (kling3_0)
Prompt-forge:           montado, gate aprovado
Custo do job:           X creditos (get_cost)
Cabe no saldo?          sim / nao (faltam W creditos)

Quando quiser gerar de verdade, e so rodar /gerarvideo.
```

Se algo falhou em qualquer etapa, diga exatamente o que e como resolver. Nao cobre credito
para simular — toda a validacao e leitura, gate deterministico ou consulta de `get_cost` (que
nao gera).
