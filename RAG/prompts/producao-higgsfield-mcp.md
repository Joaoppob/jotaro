# Produção via Higgsfield MCP (procedimento do agente)

> Leitor primário: o **Jotaro** (orquestrador). Este documento descreve **o que o Jotaro faz em
> runtime via as tools MCP do Higgsfield** (`mcp__higgsfield__*`). **Não é código.** As tools MCP
> são chamadas pelo agente em runtime — **não dá para chamá-las de dentro de um script `.cjs`**.
> Os scripts `.cjs` do projeto fazem só lógica offline (tabelas, validação de JSON, aritmética);
> a produção de fato (upload, geração, polling, download) é o agente que executa, aqui.

A entrada da produção é sempre o **`prompt-forge.json`** (`schemas/prompt-forge.schema.json`): o
campo `prompt` (a prosa multishot), o `aspect_ratio`, o `modelo`, o `element_id`/medias e, quando
`formato:"video"`, o `audio`. O `<<<element_id>>>` dentro do `prompt` é o marcador da personagem;
o backend o reescreve para `@nome` na hora de enviar ao modelo.

---

## 1. Fluxo Element (referência de personagem ou produto)

O **Element** é a referência visual que ancora a identidade no Higgsfield — de uma personagem OU
de um **produto físico central**. É ele que o `prompt` injeta como `<<<element_id>>>` (personagem)
ou `<<<produto_element_id>>>` (produto). Monte o Element **antes** de gerar:

1. **Localize as imagens** no projeto: `projects/<proj>/RAG/identidade-visual/<personagem>/*`
   (personagem) ou `projects/<proj>/RAG/identidade-visual/marca/*` (produto — a mesma subpasta
   reservada de refs de marca/produto, nunca conta como personagem).
2. **Para cada imagem:** chame `mcp__higgsfield__media_upload` e em seguida
   `mcp__higgsfield__media_confirm` — isso registra a media no Higgsfield e devolve um id de media.
3. **Crie o Element** com `mcp__higgsfield__show_reference_elements` (action `create`), passando as
   medias confirmadas do passo 2. A tool retorna o **`element_id`**.
4. **Guarde o `element_id`** no `project.json` do projeto, no mapa `elements` (chave = nome da
   personagem, ou `"produto"` para o produto físico). É esse id que o Jotaro repassa ao
   `prompt-smith` (`element_id` ou `produto_element_id` do `prompt-forge.json`) e que vai, como
   `<<<element_id>>>` ou `<<<produto_element_id>>>`, dentro do `prompt`.

**Produto físico: crie o Element sempre que o produto aparecer em destaque.** Descrever o produto
só em prosa (mesmo com os traços reais documentados em `RAG/identidade-visual/marca/produto.md`)
é mais fraco que ancorá-lo na referência de verdade — a mesma lição já aprendida com personagem
("a identidade vem da referência, não de travar o texto") vale igual pro produto. Sem o Element do
produto, o `identity-quality.cjs` avisa (não bloqueia, se houver foto real); com foto real
NENHUMA, ele bloqueia — sem nenhuma âncora o modelo inventa a embalagem.

**Personagem treinada (Soul, opcional, mais forte).** Quando a marca tem 5-20 fotos consistentes
da personagem, em vez de (ou além de) um Element, treine uma personagem com
`mcp__higgsfield__show_characters` (action `train`). O treino dá identidade mais robusta para
modelos que suportam character/Soul.

> Sem personagem: `element_id: null` no `prompt-forge.json` e nenhum `<<<element_id>>>` no
> `prompt`. Sem produto de destaque (ou sem Element dele ainda): `produto_element_id: null`.

---

## 2. Produção por formato

Sempre passe o `prompt` do `prompt-forge.json` + `aspect_ratio` + as medias/Element. O modelo vem
do campo `modelo`.

| `formato` | Tool MCP | Modelo típico | Observação |
|-----------|----------|---------------|------------|
| `video` | `mcp__higgsfield__generate_video` | `seedance_2_0_mini` (melhor desempenho confirmado hoje), `kling3_0` (multishot) ou `seedance_2_0` (forte identidade) | Com áudio/locução do bloco `audio` |
| `video_mudo` | `mcp__higgsfield__generate_video` | idem | Igual ao vídeo, **sem** áudio |
| `imagem` | `mcp__higgsfield__generate_image` | `nano_banana_2` | Still único, sem decupagem temporal |
| áudio/voz | `mcp__higgsfield__generate_audio` | — | Locução a partir do `audio.locucao[]`; voz via `audio.voz_id` |

**Escolha do modelo de vídeo:** `seedance_2_0_mini` é o modelo com melhor desempenho confirmado em
uso real no pipeline 0.7 — sempre apresente essa opção primeiro. `kling3_0` para multishot
social/volume quando quiser variar; `seedance_2_0` (cheio) quando a identidade/controle de
personagem precisa ser ainda mais forte (lip-sync, refs, ad on-brief). O `model-advisor.cjs`
apresenta o tradeoff; o custo real vem do `get_cost` (ver §3). **Nunca deixe de citar o
`seedance_2_0_mini`** antes de gerar — já aconteceu dele nunca ser sugerido por estar ausente do
catálogo do advisor.

**Polling e resultado:**

1. Após disparar `generate_*`, faça **polling** com `mcp__higgsfield__job_status` até concluir.
   **Narre o progresso pra pessoa, nunca vá em silêncio.** `job_status` devolve
   `poll_after_seconds` — respeite esse intervalo, mas antes de cada nova espera **avise em
   texto** que está esperando o render terminar (ex.: "gerando ainda, o Higgsfield costuma levar
   1-3min pra vídeo — te aviso assim que sair"). Vídeo real demora minutos; sem essa narração, a
   conversa parece travada/sem resposta durante todo o polling — bug real reportado em produção
   (2026-07-01): duas partes de um vídeo dividido gerando em sequência, sem nenhuma mensagem
   intermediária, pareceu um travamento de verdade.
2. Recupere o resultado / baixe com `mcp__higgsfield__show_generations` ou
   `mcp__higgsfield__job_display`.

---

## 2b. Divisão e junção — quando o roteiro passa do teto de duração do modelo

Alguns modelos de vídeo têm teto de duração por job — `seedance_2_0_mini`: **4-15s**. Isto não é o
caso normal (a forja continua "um prompt → um job"); é uma exceção estreita e deliberada pra
quando o roteiro aprovado é mais longo que o teto do modelo escolhido. **Não acontece sempre** —
só dispare este fluxo quando `scripts/lib/model-advisor.cjs`
`needsSplit(modelo, duracao_alvo_seg)` disser `split: true`.

1. **Confirme a necessidade e avise o custo total, e o tempo total.** `needsSplit` devolve
   `partes` (quantos jobs) e `duracao_por_parte_alvo`. Avise a pessoa **antes de gastar**: "esse
   roteiro tem Xs, o `seedance_2_0_mini` vai até 15s, então vai sair em N partes e juntar num
   vídeo só — o custo é a soma dos N jobs, confirma?". O preflight de custo (§3) roda **por
   parte**, não uma vez só. **As partes renderizam em sequência, nunca em paralelo** (a Parte 2
   só pode começar depois que a Parte 1 termina, porque referencia o `job_id` dela) — avise que
   o tempo total é a soma de N renders, não um só, pra não parecer travado no meio do segundo.
2. **A decupagem já vem dividida.** O `storyboard-director` decide onde cortar (fronteira de
   beat) e escreve a continuidade; o `prompt-smith` devolve N `prompt-forge.json` distintos, cada
   um com `continuidade.parte`/`total_partes` preenchidos (ver as seções deles sobre isso).
3. **Gere a Parte 1 normalmente** (`generate_video`, mesmo Element de sempre). Faça o polling
   (acima) até concluir e guarde o `job_id`.
4. **Gere a Parte 2+ referenciando a parte anterior**, pra continuidade visual real (não só
   textual): no `generate_video` da Parte 2, inclua em `params.medias` uma entrada
   `{ role: "video_references", value: "<job_id da parte anterior>" }` — o Higgsfield aceita o
   `job_id` de uma geração anterior direto, sem precisar baixar/re-subir frame nenhum. Some o
   Element de sempre nas `medias` também (a identidade continua ancorada nele). Repita o polling.
5. **Depois que TODAS as partes concluírem**, junte num arquivo só com o script dedicado — é a
   ÚNICA superfície de FFmpeg no 0.7, escopada a isto e só a isto (ver
   `scripts/lib/video-join.cjs`; não existe FFmpeg em nenhum outro lugar do pipeline):

   ```bash
   node scripts/lib/video-join.cjs --root projects/<proj> \
     --out output/clips/<nome-do-post>.mp4 \
     --part <url-do-resultado-parte-1> --part <url-do-resultado-parte-2> [--part ...]
   ```

   O script baixa cada parte (via `fetch` nativo do Node, não curl), roda o join com `ffmpeg`
   (via `child_process`, nunca como comando Bash exposto) e devolve `{ ok, output, bytes }`. Se
   `ok:false`, não prometa o vídeo pronto — mostre o erro e não re-tente às cegas.
6. **Registre no ledger cada job separadamente** (§4 abaixo) — o custo foi de N jobs reais, mesmo
   que o resultado final seja um arquivo só.

---

## 3. Preflight de custo (via MCP) — antes de gerar, sempre

A **fonte de verdade do custo é o MCP**, não o CLI nem tabela hardcoded. Antes de qualquer
geração, o Jotaro faz, nesta ordem:

1. **Saldo:** `mcp__higgsfield__balance` → quanto a conta tem.
2. **Custo do job:** chame o `generate_*` do formato com `get_cost: true` — isso devolve o custo
   do **job único** (NÃO `N×2 + N×4`; o produto 0.7 forja **um** prompt → **um** job, não N
   gerações por cena).
3. **Decisão:** se o saldo **não cobre** o custo do job, **PARE** e avise o usuário (reduzir
   escopo, esperar pool renovar, ou plano pago). Disparo recusado por falta de crédito não cobra.

O `scripts/lib/model-advisor.cjs` apresenta a tabela de tradeoff de modelos e marca "confirme com
get_cost" — ele **não** inventa preço. O `scripts/preflight.cjs` (skill `higgsfield-preflight`)
faz só a **aritmética offline** de cobre/não-cobre: recebe `saldo` e `custo` (este vindo do
`get_cost` do MCP) e diz se dá pra prosseguir. Nenhum `.cjs` chama o MCP — o agente é quem chama.

---

## 4. Registro (ledger por job) — depois de gerar, sempre

A produção do 0.7 forja **um** prompt → **um** job, então a unidade de registro é o **job**, não a
cena. Depois que `generate_*` disparou e o `mcp__higgsfield__job_status` confirmou que o job
concluiu (gastou crédito de fato), o Jotaro registra a linha na trilha de crédito do projeto:

1. **Registre o gasto real** no ledger append-only do projeto ativo. O crédito é o **custo real**
   vindo do `get_cost` do MCP (§3), nunca um valor fixo:

   ```bash
   node scripts/lib/ledger.cjs append --root projects/<proj> \
     --tipo video|imagem --job <job_id do generate_*> --creditos <n do get_cost>
   ```

   `--job` é o id do job Higgsfield; `--creditos` é o número que o MCP cobrou (não 2/4 hardcoded).
   `--cena` é **opcional** (job-scoped: um job = uma linha). Só registre quando **gerou de fato** —
   nunca em retomada/skip (ali não houve gasto). Confira o acumulado com
   `node scripts/lib/ledger.cjs summary --root projects/<proj>`.

2. **Histórico vivo por projeto** é o próprio Higgsfield: `mcp__higgsfield__show_generations`
   lista as gerações da conta/workspace. Para escopar ao projeto, use o
   `higgsfield_workspace` do `project.json` quando presente. O ledger local é a trilha de
   auditoria de crédito (append-only, self-contained); o `show_generations` é a galeria viva
   das saídas no Higgsfield. Os dois se complementam: o ledger diz **quanto/quando/em que job**;
   o `show_generations` diz **o que ficou pronto**.

> O custo real vem **do MCP** (`get_cost`), não de tabela fixa. O `--creditos` do ledger é onde
> esse número real é gravado; o fallback por `--tipo` (custos.cjs) só existe para retrocompat e
> não deve ser a fonte quando o `get_cost` está disponível.

---

## Resumo do interlock

```
prompt-forge.json (campo prompt, aspect_ratio, modelo, element_id, audio)
   │
   ├─ Element: media_upload → media_confirm → show_reference_elements(create) → element_id → project.json
   │            (ou show_characters(train) para personagem Soul)
   │
   ├─ Preflight: balance + generate_*(get_cost:true) → custo do JOB ÚNICO
   │            preflight.cjs(saldo, custo) → cobre? senão PARA
   │
   └─ Produção: generate_video|generate_image|generate_audio (prompt + aspect_ratio + medias/Element)
                → job_status (polling) → show_generations / job_display (resultado)
```
