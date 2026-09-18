---
description: Forja o prompt único (formato imagem) e produz a imagem via MCP Higgsfield (generate_image, nano-banana), com a personagem ancorada no Element.
argument-hint: "[descrição da imagem]"
---

# /gerarimagem

Produz uma imagem com a cara da marca. O protocolo abaixo é obrigatório, na ordem. Não pule a
escolha do projeto, o preflight nem a checagem da RAG: são invariantes do Jotaro.

No 0.7 a imagem também nasce de um **prompt único** (`prompt-forge.json` com `formato: "imagem"`)
produzido num **só job** via MCP (`mcp__higgsfield__generate_image`, `nano_banana_2`). Não há
seleção de asset per-cena nem montagem.

## Passo 0: escolha o projeto (obrigatório)

Liste `projects/` (`ls projects/`), mostre os de `status: "ativo"` e pergunte pra qual gerar.
Chame de `<PROJ>` o root escolhido (ex.: `projects/example-hero`) — todos os comandos abaixo
usam esse `<PROJ>`. Marca nova: copie de `templates/` (ver "Projetos" no `CLAUDE.md`).

## Passo 1: entenda o estado

Antes de tudo, confira:
- Perfil de uso (estado global do usuário, não do projeto):
  ```bash
  node scripts/jotaro-profile.cjs status --root .
  ```
  Se `modo_expert: true`, mantenha a condução mais curta, sem pular custo, RAG e revisão.
- A cadência de revisão permite iniciar?
  ```bash
  node scripts/review-cadence.cjs status --root .
  ```
  Se `pode_iniciar_fluxo: false`, rode o protocolo de `/revisao` antes de gastar crédito.
  Se a revisão falhar, pare e corrija antes de gerar.
- O Higgsfield está conectado? Confira o saldo com `mcp__higgsfield__balance`. Se o connector MCP
  não estiver ativo, use o fallback CLI (`higgsfield account status`) ou aponte `/setup`.
- A pasta `<PROJ>/RAG/identidade-visual/` tem ao menos uma imagem? **Se estiver vazia, pare** e
  peça ao usuário que coloque pelo menos uma referência ali (veja `RAG/README.md`). Sem
  referência (e sem o Element que nasce dela), não há consistência.

## Passo 2: entreviste se o pedido for vago

Se a descrição da imagem não deixa claro o que mostrar (personagem, ação, cenário, estilo), faça
**até 3 perguntas específicas** antes de gerar:

> "Eu entendi que você quer [o que entendeu], mas você não me explicou direito como quer a
> imagem: [pergunta 1] [pergunta 2] [pergunta 3]"

Não gere no escuro. Espere as respostas.

## Passo 3: busque a identidade e garanta o Element

Spawne o agente `rag` (via Task) para ler o `RAG/` do projeto e devolver a identidade: anchor
textual, paleta, estilo e os paths das referências. **Diga o projeto no spawn**
(`{ objetivo: "ler identidade da marca", projeto: "<PROJ>" }`).

Salve a identidade retornada em `<PROJ>/output/identity-preflight.json` e rode:

```bash
node scripts/lib/identity-quality.cjs identity <PROJ>/output/identity-preflight.json
```

Se reprovar, não avance para prompt: corrija refs/anchor/RAG com o usuário. Garanta que o
**Element** da personagem existe no Higgsfield (`element_id` no `project.json`); se não existir,
crie-o das refs (`media_upload` → `media_confirm` → `show_reference_elements` — passo a passo em
`RAG/prompts/producao-higgsfield-mcp.md`).

## Passo 4: forje o prompt (formato imagem)

Spawne o agente `prompt-smith` (via Task), passando a identidade que o `rag` devolveu, a intenção
da imagem e o `element_id`. Ele devolve o **prompt único** com `formato: "imagem"`
(`schemas/prompt-forge.schema.json`), com a personagem ancorada no Element via `<<<element_id>>>`.
Calibre contra `RAG/prompts/exemplos-prompt-forge.md`. Salve em `<PROJ>/output/prompt-forge.json`.

## Passo 5: preflight de custo (do job único)

Antes de gerar, rode a assessoria de modelo (`nano_banana_2` é o modelo de imagem do MCP):

```bash
node scripts/lib/model-advisor.cjs image --objetivo "<resumo-da-imagem>" --plano "<free|paid>" --saldo "<saldo-do-balance>"
```

Confira o saldo (`mcp__higgsfield__balance`) e o custo do job chamando
`mcp__higgsfield__generate_image` com `get_cost: true`. A skill `higgsfield-preflight` faz a
aritmética offline de cobre/não-cobre. Mostre o custo do job e o saldo, e **reconfirme o projeto
`<PROJ>`** junto do custo. **Se o saldo não cobre, pare** e informe. Nunca invente preço: o número
vem do `get_cost`. Peça o ok do usuário.

## Passo 6: arme o gate pré-crédito (INTERLOCK)

Arme o gate sobre o `prompt-forge.json` — ele roda os gates de texto pré-crédito de uma vez:

```bash
node scripts/preflight-gate.cjs --root <PROJ>
```

Se todos passam, grava o token assinado e libera a produção; se algum reprova, **não chame
`generate_image`**: volte ao `prompt-smith` com os critérios reprovados. O hook `higgsfield-gate.cjs`
bloqueia mecanicamente a geração via MCP sem token fresco cujo hash bata no prompt atual.

## Passo 7: produza a imagem (MCP)

Chame `mcp__higgsfield__generate_image` com o `prompt`, o `aspect_ratio`, o `modelo`
(`nano_banana_2`) e o Element/medias. Faça polling com `mcp__higgsfield__job_status` e recupere o
resultado com `mcp__higgsfield__show_generations`, salvando em `<PROJ>/output/`. Depois, mostre ao
usuário o path da imagem e pergunte se ficou boa ou se quer refazer.

**Crítica pós-render (Wave L, Tier-3).** O gate do Passo 6 gateia o plano em texto; este gateia o
pixel. Depois de gerar, olhe a imagem **real** e atribua os scores anti-IA 0/50/100 por eixo
(C8 física, C9 textura, C10 estabilidade, C11 continuidade — `RAG/review/rubrica-nivel-100.md`).
Grave em `<PROJ>/output/critique.json` (`{ artifacto, attempt, max_attempts, scores }`) e rode:

```bash
node scripts/lib/post-render-critique.cjs <PROJ>/output/critique.json
```

Veredito pelo exit code: **0 accept**, **1 reroll** (um tell forte — mão morphing, plástico,
física quebrada — anula o premium; regere), **2 escalate** (budget esgotado ou score ausente →
mostre a imagem + scores e deixe o usuário decidir, Invariante 7). Respeite o `max_attempts`:
nunca entre em loop de re-roll queimando crédito.

Depois que o fluxo de imagem terminar com sucesso, registre a cadência:

```bash
node scripts/review-cadence.cjs record-flow --root . --kind imagem --label "<resumo-curto>"
```

Se o retorno vier com `revisao_sugerida: true`, sugira rodar `/revisao` agora. Se o usuário
não quiser, tudo bem, mas antes do próximo fluxo a revisão será obrigatória.

Registre também o primeiro run concluído:

```bash
node scripts/jotaro-profile.cjs mark-run --root . --marca "<cliente-ou-marca>"
```

Se ainda não estiver em modo expert, ofereça ativar para reduzir explicações nos próximos
fluxos.

## Lembretes

- O custo é do **job único** e vem do `get_cost` do MCP; nunca invente preço.
- Se for o primeiro uso, conduza devagar, explicando cada passo. Depois de um run completo,
  registre no perfil e ofereça o modo expert (pula as explicações).
- Você não escreve o prompt na unha nem produz a imagem por fora: o `prompt-smith` forja, e a
  produção é sua via MCP (`generate_image`). Você orquestra.
