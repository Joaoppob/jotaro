---
description: Pipeline completo do vídeo: forja o prompt único e produz o vídeo multishot 9:16 via MCP Higgsfield (generate_video), com a personagem ancorada no Element. Depois do render, aplique a crítica pós-render (Wave L) antes de entregar.
argument-hint: "[descrição do vídeo]"
---

# /gerarvideo

Conduz o pipeline inteiro, da forja do prompt único ao vídeo multishot renderizado. É o comando
de maior custo: uma geração de vídeo consome crédito, e crédito gasto não volta. Por isso o
protocolo é rigoroso e tem checkpoint de retomada. Siga na ordem, sem pular invariante.

No 0.7 **não há geração per-cena nem montagem**: o time forja **um** prompt (`prompt-forge.json`)
e o Higgsfield produz **um** job — um vídeo multishot único, com ou sem áudio. A produção é
**MCP-first** (as tools `mcp__higgsfield__*`); o CLI é fallback.

## Passo 0: escolha o projeto (obrigatório, antes de tudo)

Não existe projeto fixo. Liste `projects/` e pergunte pra qual o usuário quer gerar:

```bash
ls projects/
```

Mostre os de `status: "ativo"`. Pergunte "Pra qual projeto?". Se só houver um, confirme.
Chame de `<PROJ>` o root escolhido (ex.: `projects/example-hero`) — **todos os comandos
abaixo usam esse `<PROJ>`**. Se o usuário quer uma marca nova, veja "Projetos" no `CLAUDE.md`
(copiar de `templates/`).

## Passo 1: entenda o estado e cheque a retomada

Antes de tudo:
- Veja o perfil de uso (estado global do usuário, não do projeto):
  ```bash
  node scripts/jotaro-profile.cjs status --root .
  ```
  Se `modo_expert: true`, conduza com menos explicação, mantendo todos os checkpoints.
- A cadência de revisão permite iniciar?
  ```bash
  node scripts/review-cadence.cjs status --root .
  ```
  Se `pode_iniciar_fluxo: false`, rode o protocolo de `/revisao` antes de gastar crédito.
  Se a revisão falhar, pare e corrija antes de gerar.
- O Higgsfield está conectado? Confira o saldo com `mcp__higgsfield__balance`. Se o connector
  MCP não estiver ativo, use o fallback CLI (`higgsfield account status`) ou aponte `/setup`.
  Confirme que é a conta certa antes de gastar.
- **Existe `<PROJ>/output/.pipeline-state.json`?** Se existir, há um run em andamento NESSE
  projeto. Pergunte ao usuário: retomar de onde parou (reaproveitando o prompt já forjado, sem
  refazer a Etapa 1) ou começar um run novo? Crédito gasto não volta. Respeite a escolha dele.

## Passo 2: confirme as imagens de referência e o Element

Liste o que tem em `<PROJ>/RAG/identidade-visual/` e **confirme com o usuário antes de seguir**:

> "Para o vídeo eu vou usar estas referências da personagem: [lista]. Posso seguir com elas?"

Se a pasta estiver vazia, pare e peça que ele coloque ao menos uma imagem (veja
`RAG/README.md`). Sem referência, não há consistência. Dessas refs nasce o **Element** do
Higgsfield (`media_upload` → `media_confirm` → `show_reference_elements` create → `element_id`
guardado no `project.json`), que ancora a identidade no prompt como `<<<element_id>>>`. Se o
Element ainda não existe para a personagem do vídeo, crie-o agora (o passo a passo está em
`RAG/prompts/producao-higgsfield-mcp.md`).

## Passo 3: entreviste se o pedido for vago

Se o pedido não descreve o vídeo com clareza (que história, quantos shots/beats, que estilo, se
tem locução), faça **até 3 perguntas específicas** antes de gerar:

> "Eu entendi que você quer [o que entendeu], mas preciso de mais clareza: [perguntas]"

## Passo 4: forje o prompt único (Etapa 1)

Conduza a Etapa 1 até o prompt único, respeitando os **três portões** (Invariante 7): spawne o
`rag` (identidade — **diga o projeto** no spawn: `{ objetivo, projeto: "<PROJ>" }`), o
`soul-strategist` (🚦 alma), o `story-writer` (🚦 roteiro), o `storyboard-director` + o
`editing-director` (🚦 cenas + ritmo de corte). Apresente o `dossie.md` crescendo em cada portão:

```bash
node scripts/lib/dossie.cjs --root <PROJ>
```

Só com os três "sim" spawne o `prompt-smith`, passando a identidade, a intenção e o `element_id`
da personagem. Ele devolve o **prompt único** (`schemas/prompt-forge.schema.json`): o `shots[]`
estruturado + o campo `prompt` em prosa multishot rica, com a personagem ancorada no Element.
Calibre contra `RAG/prompts/exemplos-prompt-forge.md` (o ALVO OURO). Salve em
`<PROJ>/output/prompt-forge.json`.

## Passo 5: assessoria de modelo + preflight de custo (do job único)

Antes do preflight, rode a assessoria de modelo e mostre a tabela de tradeoff:

```bash
node scripts/lib/model-advisor.cjs video --objetivo "<resumo-do-video>" --plano "<free|paid>" --saldo "<saldo-do-balance>"
```

Explique o tradeoff dos modelos de vídeo do MCP: **`seedance_2_0_mini` é o de melhor desempenho
confirmado em uso real hoje — apresente-o sempre**; `kling3_0` para multishot social/volume;
`seedance_2_0` (cheio) quando a identidade/controle de personagem precisa ser ainda mais forte
(lip-sync, refs, ad on-brief). Grave o modelo escolhido no `modelo` do `prompt-forge.json`.

O custo é do **job único**, não per-cena × N. Confira o saldo e o custo:

1. **Saldo:** `mcp__higgsfield__balance`.
2. **Custo do job:** chame `mcp__higgsfield__generate_video` com `get_cost: true` (passando o
   `prompt`, `aspect_ratio` e o Element/medias do `prompt-forge.json`) — isso devolve o custo do
   job sem gerar. A skill `higgsfield-preflight` faz a aritmética offline de cobre/não-cobre.

Mostre ao usuário, com clareza:
- **O projeto** pra onde vai gerar (`<PROJ>`) — reconfirme aqui.
- O custo do job (o número real do `get_cost`, **nunca** um preço inventado).
- O saldo atual.

**Se o saldo não cobre o job, pare** e informe. Ofereça reduzir o escopo, esperar o pool renovar,
ou um plano pago. Peça o ok antes de gastar — confirmando projeto **e** custo na mesma frase.

## Passo 6: arme o gate pré-crédito (INTERLOCK)

Antes de gerar, **arme o gate** com o runner único, que roda TODOS os gates de texto pré-crédito
de uma vez sobre o `prompt-forge.json`:

```bash
node scripts/preflight-gate.cjs --root <PROJ>
```

Se todos passam, ele grava um token assinado (`.claude/state/.gate-pass.json`) com o hash do
prompt-forge e libera a produção. Se algum reprova, **não gere**: apresente os critérios
reprovados e volte ao `prompt-smith`/`storyboard-director`. O hook `PreToolUse`
`higgsfield-gate.cjs` **bloqueia mecanicamente** a geração via MCP sem um token fresco cujo hash
bata no prompt atual — editou o prompt depois de armar? Rearme.

## Passo 7: produza o vídeo (MCP)

Com o gate armado e o custo confirmado, produza o vídeo — **um** job:

1. Chame `mcp__higgsfield__generate_video` com o `prompt`, o `aspect_ratio` (default 9:16), o
   `modelo` e o Element/medias (e, se `formato: "video"`, o bloco `audio` — locução via
   `generate_audio`/`voz_id`).
2. Faça **polling** com `mcp__higgsfield__job_status` até concluir.
3. Recupere o resultado com `mcp__higgsfield__show_generations` / `mcp__higgsfield__job_display`
   e salve em `<PROJ>/output/`.
4. Registre o progresso no `<PROJ>/output/.pipeline-state.json`: se o run cair, dá para retomar.

Se o job não nascer (erro na chamada), **não fique aguardando**: leia o erro/JSON cru, confira os
parâmetros contra `RAG/prompts/producao-higgsfield-mcp.md`, corrija e tente de novo. Máximo de 2
tentativas antes de parar e investigar; não entre em loop silencioso.

## Passo 8: crítica pós-render (Wave L, Tier-3)

Antes de entregar, olhe o **vídeo real** e atribua os scores anti-IA 0/50/100 por eixo (C8 física,
C9 textura, C10 estabilidade, C11 continuidade — `RAG/review/rubrica-nivel-100.md`). Grave em
`<PROJ>/output/critique.json` (`{ artifacto, attempt, max_attempts, scores }`) e rode o gate:

```bash
node scripts/lib/post-render-critique.cjs <PROJ>/output/critique.json
```

Veredito pelo exit code: **0 accept** (entrega), **1 reroll** (um tell forte anula o premium —
regere o job), **2 escalate** (budget esgotado ou score ausente → mostre o vídeo e os scores ao
usuário e deixe ele decidir, Invariante 7). Nunca entre em loop infinito: respeite o
`max_attempts`.

## Passo 9: entregue

Mostre o path final do vídeo. Pergunte se ficou bom ou se quer refazer (o checkpoint deixa
reaproveitar o prompt já forjado sem refazer a Etapa 1).

Mostre também o **custo real do run** pela trilha de auditoria do projeto (leitura, não gasta):

```bash
node scripts/lib/ledger.cjs summary --root <PROJ>
```

O `total_creditos` confirma quanto este run consumiu (deve bater com o preflight do Passo 5).

Registre que o usuário completou um run (perfil é estado global do usuário, fica em `--root .`):

```bash
node scripts/jotaro-profile.cjs mark-run --root . --marca "<projeto>"
```

Se ainda não estiver em modo expert, ofereça: "Da próxima vez posso conduzir em modo expert,
com menos explicações e os mesmos checkpoints. Quer ativar?". Se aceitar:

```bash
node scripts/jotaro-profile.cjs expert-on --root .
```

Depois que o vídeo terminar com sucesso, registre a cadência:

```bash
node scripts/review-cadence.cjs record-flow --root . --kind video --label "<resumo-curto>"
```

Se o retorno vier com `revisao_sugerida: true`, sugira rodar `/revisao` agora. Se o usuário
não quiser, tudo bem, mas antes do próximo fluxo a revisão será obrigatória.

## Lembretes

- O custo é do **job único** (a forja produz um prompt → um job), não per-cena × N. O número real
  vem do `get_cost` do MCP; nunca invente preço.
- Primeiro uso: conduza devagar, explique cada etapa. Depois de um run completo, registre no
  perfil e ofereça o modo expert.
- A produção é sua, via MCP (`generate_video` + polling). As folhas (`rag`, `prompt-smith`, ...)
  só recebem entrada e devolvem saída; você orquestra tudo.
