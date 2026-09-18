# Plano de implementação — Jotaro 0.8

> Objetivo: sair da arquitetura 0.7, baseada em linha de montagem aditiva, para a
> arquitetura 0.8, onde Jotaro dirige cada prompt como um projeto individual,
> sequencialmente auditado por especialistas, com aprovação humana única e produção
> rastreável.

> **Adendo (2026-07-03):** a 0.7 foi formalmente descontinuada (decisão do projeto) — a 0.8 é a
> única linha viva, e este plano deixa de ser "direção pra onde ir" e passa a ser a referência
> canônica de arquitetura. Também nesta data: adicionado o **Portão -1**, um checkpoint
> conversacional leve entre a etapa 03 (rascunho inicial) e a etapa 04 (história) — o Jotaro
> traduz o `project-brief` + o rascunho numa frase curta ("pra essa cena, a gente faz X — pra
> Y") e só chama a cadeia de especialistas com o "sim" do usuário. Ver `CLAUDE.md`
> §"O que o gerador faz" pro fluxo completo com o Portão -1 integrado. Também nesta data: os 10
> gates de conteúdo herdados da 0.7 (identidade, cinematografia, narrativa, enquadramento,
> negative-prompt, idioma, fechamento com produto, expressão facial, crítica) foram reconectados
> ao `preflight-gate-0.8.cjs` via `scripts/lib/manifest-to-shotlist.cjs` (adapta o manifesto pro
> formato que eles esperam) — o runner agora roda 15 gates, não mais só os 5 mecânicos. Cobertura
> parcial honesta: personagem/element_id/produto_element_id/mood por shot ainda não são
> modelados no manifesto 0.8, então os trechos desses gates que dependem só desses campos
> degradam sem falso-positivo (ver o adaptador).

## 1. Capacidade que a 0.8 precisa entregar

Depois da 0.8, Jotaro deve conseguir criar uma geração como um projeto próprio:

1. Ler identidade e referências.
2. Definir o objetivo do projeto.
3. Criar um primeiro rascunho de prompt.
4. Passar o mesmo rascunho por especialistas sequenciais.
5. Fechar o prompt com uma passada de essencialismo.
6. Rodar gates mecânicos.
7. Pedir aprovação humana única.
8. Produzir via MCP/Higgsfield apenas com token válido.
9. Criticar o render e registrar aprendizado.

O ganho principal não é "mais agentes". O ganho é mudar a função dos agentes:
cada folha audita o prompt pela lente da sua especialidade e só altera o que é sua
responsabilidade.

## 2. Diferença central entre 0.7 e 0.8

### 0.7 atual

Fluxo conceitual:

```text
rag
-> soul-strategist
-> story-writer
-> storyboard-director
-> editing-director
-> prompt-smith
-> gates
-> produção
-> crítica
```

Características:

- agentes adicionam camadas novas;
- dossiê cresce até virar prompt;
- aprovação humana existe em vários pontos;
- `prompt-smith` monta o prompt final a partir de camadas;
- `output/` ainda tende a funcionar como superfície única de geração;
- gates mecânicos validam o prompt final.

### 0.8 desejada

Fluxo conceitual:

```text
01 identidade/rag
-> 02 objetivo-do-projeto
-> 03 rascunho inicial do Jotaro
-> 04 historia
-> 05 mundo
-> 06 enredo
-> 07 camera
-> 08 montagem
-> 09 realismo
-> 10 audio
-> 11 prompt-smith final
-> 12 gates mecanicos
-> 13 aprovacao humana
-> 14 producao MCP
-> 15 critica pos-render
```

Características:

- cada prompt/generation é projeto-filho próprio;
- especialistas não empilham conteúdo livremente;
- cada especialista responde: "isto está condizente com o projeto?";
- cada agente tem escopo estreito, veredito estruturado e diff de ajuste;
- aprovação humana fica depois do prompt final e dos gates;
- produção só executa com token de aprovação;
- crítica pós-render fecha o ciclo de aprendizado.

## 3. Invariantes da 0.8

Estas regras não são preferência; são o contrato da versão:

1. **Cada geração é um projeto individual.**
   - Não sobrescrever apenas `projects/<marca>/output/`.
   - Criar histórico por geração.

2. **Cadeia sequencial.**
   - Cada especialista recebe o rascunho atual.
   - Um especialista não trabalha sobre uma versão antiga.

3. **Escopo estreito por agente.**
   - Agente de câmera não decide história.
   - Agente de áudio não reescreve mundo.
   - Prompt-smith não inventa nova direção.

4. **Essencialismo.**
   - O prompt final contém apenas o que serve ao projeto, cena e modelo alvo.
   - Detalhe bonito mas irrelevante deve ser cortado.

5. **Gates mecânicos continuam.**
   - Julgamento dos especialistas não substitui interlock determinístico.
   - Gates rodam depois do prompt-smith final.

6. **Aprovação humana única.**
   - O humano aprova a versão exata que será renderizada.
   - Qualquer mudança posterior invalida a aprovação.

7. **Produção com token e ledger.**
   - Nenhum MCP de gasto roda sem approval token válido.
   - Toda produção registra tool, modelo, prompt hash, output hash e custo.

8. **Crítica pós-render vira memória.**
   - Falha não pode ficar como opinião solta.
   - Cada crítica mapeia falha para etapa responsável.

## 4. Nova estrutura de projeto

### Estrutura alvo por marca

```text
projects/<marca>/
  project.json
  RAG/
    marca.md
    mundo.md
  generations/
    <generation-id>/
      intake.json
      identity.json
      project-brief.json
      draft-v0.md
      specialist-reviews/
        04-historia.json
        05-mundo.json
        06-enredo.json
        07-camera.json
        08-montagem.json
        09-realismo.json
        10-audio.json
      prompt/
        prompt.canonical.md
        prompt.<model>.md
        prompt-manifest.yaml
        essentialism-diff.md
      gates/
        gate-results.json
        production-token.json
      approval/
        approval-record.yaml
      production/
        production-job.yaml
        outputs/
      critique/
        post-render-critique.yaml
```

### Compatibilidade com 0.7

Durante a migração, manter leitura de:

```text
projects/<marca>/output/
```

mas escrever novas execuções em:

```text
projects/<marca>/generations/<generation-id>/
```

O `output/` pode virar apenas alias, export final ou compat layer.

## 5. Agentes: manter, redefinir e criar

### Agentes existentes que permanecem

| Arquivo atual | Destino 0.8 | Ação |
|---|---|---|
| `.claude/agents/rag.md` | `rag` / identidade | Manter, mas ajustar saída para geração individual |
| `.claude/agents/prompt-smith.md` | `prompt-smith final` | Redefinir como etapa de essencialismo |

### Agentes existentes que mudam de papel

| Arquivo atual | Novo papel | Ação |
|---|---|---|
| `.claude/agents/soul-strategist.md` | `historia` | Reduzir para auditoria de verdade emocional |
| `.claude/agents/story-writer.md` | parte de `enredo` | Fundir com storyboard como auditoria de acontecimento |
| `.claude/agents/storyboard-director.md` | parte de `enredo` | Fundir com story-writer |
| `.claude/agents/editing-director.md` | `montagem` | Isolar como especialista de ritmo de corte |

### Agentes novos

Criar:

```text
.claude/agents/objetivo-do-projeto.md
.claude/agents/historia.md
.claude/agents/mundo.md
.claude/agents/enredo.md
.claude/agents/camera.md
.claude/agents/montagem.md
.claude/agents/realismo.md
.claude/agents/audio.md
```

Observação: `historia`, `enredo` e `montagem` podem reaproveitar texto dos agentes
atuais, mas devem virar arquivos novos ou claramente renomeados para refletir a
arquitetura 0.8. Evitar manter nomes antigos se eles induzirem o comportamento 0.7.

### Contrato comum de agente especialista

Todo especialista 0.8 deve receber:

```json
{
  "generation_id": "...",
  "project_brief": {},
  "identity": {},
  "current_draft": "...",
  "previous_reviews": [],
  "stage_context": {}
}
```

Todo especialista 0.8 deve devolver:

```json
{
  "stage": "camera",
  "ok": true,
  "motivo": "...",
  "ajuste_aplicado": true,
  "campos_alterados": ["current_draft.shots[1].camera"],
  "draft_revisado": "...",
  "riscos": [],
  "proxima_etapa": "montagem"
}
```

Regra: se `draft_revisado` alterar algo fora do escopo do agente, o verify deve falhar.

## 6. Schemas novos e schemas alterados

### Criar schemas

```text
schemas/project-brief.schema.json
schemas/world.schema.json
schemas/specialist-review.schema.json
schemas/prompt-manifest.schema.json
schemas/approval-record.schema.json
schemas/production-job.schema.json
schemas/post-render-critique.schema.json
```

### Alterar schemas existentes

| Schema atual | Alteração |
|---|---|
| `schemas/project.schema.json` | adicionar `generations_dir`, `world_file`, versão 0.8 |
| `schemas/intake.schema.json` | incluir objetivo, canal, formato, público, awareness, métrica |
| `schemas/pipeline-state.schema.json` | adicionar estados 0.8 e token de produção |
| `schemas/prompt-forge.schema.json` | virar compat ou ser substituído por prompt manifest |
| `schemas/critique.schema.json` | alinhar com crítica pós-render por etapa |
| `schemas/cinematografia.schema.json` | reaproveitar para câmera, mas separar montagem |
| `schemas/edicao.schema.json` | virar base de `montagem.schema.json` se necessário |

### Campos obrigatórios do `project-brief`

```json
{
  "objetivo": "awareness|consideration|conversion|retencao|outro",
  "metrica_primaria": "hook_rate|hold_rate|vcr|ctr|cpa|qualidade_visual",
  "nivel_awareness": "fria|problem-aware|solution-aware|product-aware|retargeting",
  "single_minded_proposition": "...",
  "o_que_comunica": "...",
  "como_comunica": "...",
  "canal": "tiktok|reels|youtube_shorts|outro",
  "formato": "video|video_mudo|imagem",
  "estetica": "ugc-native|polished|cinematic|documental|outro",
  "time_budget": {
    "hook": "0-3s",
    "valor": "3-12s",
    "payoff_cta": "12-15s"
  }
}
```

## 7. Pipeline-state 0.8

Estados alvo:

```text
created
identity_ready
project_brief_ready
draft_v0_ready
historia_reviewed
mundo_reviewed
enredo_reviewed
camera_reviewed
montagem_reviewed
realismo_reviewed
audio_reviewed
prompt_final_ready
gates_passed
awaiting_human_approval
approved
production_queued
production_done
post_render_reviewed
closed
```

Estados de erro:

```text
blocked_missing_identity
blocked_missing_world
blocked_specialist_rejected
blocked_gate_failed
blocked_approval_rejected
blocked_mcp_failure
blocked_render_failed
```

Regra de transição: não pular etapa. Se uma etapa for refeita, invalidar todas as
etapas posteriores.

## 8. Gates mecânicos

### Manter gates 0.7

Arquivos atuais em `scripts/lib/` que devem continuar:

```text
dp-quality.cjs
prompt-structure.cjs
narrative-quality.cjs
angle-variety.cjs
negative-prompt-discipline.cjs
persona-carry.cjs
locucao-idioma.cjs
product-closeup.cjs
expressao-facial.cjs
identity-quality.cjs
editing-quality.cjs
```

### Criar ou evoluir gates 0.8

```text
scripts/lib/specialist-signoff.cjs
scripts/lib/prompt-manifest-required.cjs
scripts/lib/essentialism-diff.cjs
scripts/lib/one-camera-move-per-shot.cjs
scripts/lib/visual-contradiction.cjs
scripts/lib/approval-token.cjs
scripts/lib/production-ledger-required.cjs
```

### Alterar `scripts/verify.cjs`

Adicionar checks para:

1. todos os novos agents existem e têm frontmatter válido;
2. novos schemas validam exemplos;
3. cada etapa do pipeline tem schema e agente correspondente;
4. gates 0.7 ainda rodam;
5. gates 0.8 rodam;
6. não há MCP de produção sem approval token;
7. `package.json` mudou para `0.8.0`.

## 9. Aprovação humana e token de produção

### Novo arquivo

```text
approval/approval-record.yaml
```

Contrato:

```yaml
approval:
  project_id: ""
  generation_id: ""
  prompt_version: ""
  prompt_hash: ""
  gates_snapshot_hash: ""
  approved_by: ""
  approved_at: ""
  decision: "approved"
  production_token: ""
  expires_at: ""
```

### Mudança no hook

Alterar:

```text
.claude/hooks/higgsfield-gate.cjs
```

para validar:

- `generation_id`;
- `prompt_hash`;
- `approval.production_token`;
- escopo da tool MCP;
- expiração do token.

Sem token, bloquear:

```text
mcp__higgsfield__generate_video
mcp__higgsfield__generate_image
mcp__higgsfield__generate_audio
Bash(higgsfield:*)
Bash(hf:*)
```

`balance`, `show_generations`, `job_status` podem continuar sem token, pois não gastam
crédito.

## 10. Produção MCP

Criar:

```text
scripts/lib/production-job.cjs
scripts/lib/render-adapter.cjs
```

O adapter deve:

1. ler `prompt-manifest.yaml`;
2. ler `approval-record.yaml`;
3. escolher tool/modelo;
4. montar parâmetros;
5. chamar MCP somente se autorizado;
6. registrar `production-job.yaml`;
7. preservar outputs e hashes.

Regra: Produção MCP não reescreve prompt. Se precisar traduzir prompt canônico para
modelo, isso deve acontecer antes, na etapa 11, e ficar registrado como
`prompt.<model>.md`.

## 11. Crítica pós-render

Criar ou adaptar:

```text
scripts/lib/post-render-critique.cjs
schemas/post-render-critique.schema.json
```

Rubrica mínima:

```yaml
project_alignment:
  objetivo: 0-2
  identidade: 0-2
  mundo: 0-2
  enredo: 0-2
  camera: 0-2
  montagem: 0-2
  realismo: 0-2
  audio: 0-2
performance_hypothesis:
  attention: 0-2
  branding: 0-2
  connection: 0-2
  direction: 0-2
failures:
  - stage: "camera"
    severity: "medium"
    evidence: "..."
    next_action: "..."
```

Decisões possíveis:

```text
approved
variation
revise_prompt
revise_stage
rerender_tool
reopen_brief
reject
```

## 12. RBAC e permissões

### Folhas especialistas

Permissões padrão:

```yaml
tools: Read, Glob, Grep
```

Sem:

- `Task`;
- `Bash`;
- MCP Higgsfield;
- escrita direta fora do output estruturado esperado.

### Jotaro/orquestrador

Pode:

- chamar agentes;
- escrever artefatos em `projects/**/generations/**`;
- rodar scripts `node scripts/**`;
- chamar MCP de produção somente após aprovação/token.

### Ajustar `.claude/settings.json`

Adicionar permissão de escrita:

```text
Write(./projects/**/generations/**)
```

Manter:

```text
Write(./projects/**/output/**)
```

por compatibilidade temporária.

## 13. Ondas de implementação

### Wave 0 — Congelar 0.7 como baseline

Entregáveis:

- rodar `npm test`;
- registrar status atual;
- confirmar que a pasta 0.8 parte de uma cópia funcional;
- atualizar `package.json` de `0.7.0` para `0.8.0-alpha.1`.

Critério de aceite:

- `npm test` passa antes de qualquer mudança estrutural.

### Wave 1 — Estrutura de geração individual

Entregáveis:

- criar suporte a `projects/<marca>/generations/<id>/`;
- atualizar `pipeline-state.cjs`;
- criar helper `scripts/lib/generation-paths.cjs`;
- manter compatibilidade com `output/`.

Critério de aceite:

- comando/script consegue criar geração nova sem tocar na geração anterior;
- `pipeline-state get` continua read-only;
- schemas validam `generation_id`.

### Wave 2 — Project brief e mundo persistente

Entregáveis:

- criar `project-brief.schema.json`;
- criar `world.schema.json`;
- criar agente `objetivo-do-projeto`;
- criar agente `mundo`;
- adicionar `RAG/mundo.md` por projeto.

Critério de aceite:

- geração não avança sem `project-brief`;
- mundo é lido e atualizado como memória persistente.

### Wave 3 — Especialistas sequenciais

Entregáveis:

- criar `specialist-review.schema.json`;
- criar agentes `historia`, `enredo`, `camera`, `montagem`, `realismo`, `audio`;
- redefinir ou aposentar nomes 0.7 que conflitam;
- criar `specialist-signoff.cjs`.

Critério de aceite:

- cada especialista emite review estruturado;
- cadeia não pula etapa;
- ajuste fora de escopo falha em verify.

### Wave 4 — Prompt-smith final e prompt manifest

Entregáveis:

- reescrever `prompt-smith.md`;
- criar `prompt-manifest.schema.json`;
- gerar `prompt.canonical.md`, `prompt.<model>.md`, `prompt-manifest.yaml`;
- criar `essentialism-diff.md`;
- criar gates `prompt-manifest-required`, `essentialism-diff`,
  `one-camera-move-per-shot`, `visual-contradiction`.

Critério de aceite:

- prompt final consegue sobreviver sozinho;
- gates validam manifesto e diff;
- prompt-smith não inventa direção nova.

### Wave 5 — Gates 0.8 e aprovação humana única

Entregáveis:

- criar `approval-record.schema.json`;
- criar script/helper de approval token;
- alterar `higgsfield-gate.cjs`;
- atualizar `settings.json`;
- remover dependência dos 3 portões antigos.

Critério de aceite:

- MCP de geração bloqueia sem token;
- mudança no prompt invalida token;
- aprovação fica registrada por geração.

### Wave 6 — Produção MCP com ledger

Entregáveis:

- criar `production-job.schema.json`;
- criar `production-job.cjs`;
- criar `render-adapter.cjs`;
- registrar output hash, custo, model, seed e tool;
- preservar outputs por geração.

Critério de aceite:

- produção usa prompt aprovado;
- ledger permite reproduzir/auditar job;
- retry técnico não sobrescreve evidência.

### Wave 7 — Crítica pós-render e aprendizado

Entregáveis:

- criar `post-render-critique.schema.json`;
- adaptar `post-render-critique.cjs`;
- criar `references/render-learnings.md` ou memória equivalente;
- mapear falhas para etapa responsável.

Critério de aceite:

- todo render tem crítica ou status explícito de "não criticado";
- crítica gera decisão de próxima ação;
- falha nunca fica sem etapa responsável.

### Wave 8 — Migração de UX, docs e comandos

Entregáveis:

- atualizar `README.md`;
- atualizar `CLAUDE.md`;
- atualizar `/explica-fluxo`;
- atualizar `/gerarvideo`, `/gerarimagem`, `/roteiro`, `/revisao`;
- documentar fluxo 0.8 com referência ao Penpot e aos 15 `.md`.

Critério de aceite:

- usuário entende que Jotaro agora dirige projeto;
- comandos não descrevem mais fluxo 0.7 como principal;
- docs apontam para `references/_pesquisa-0.8`.

## 14. Ordem recomendada de PRs/commits

1. `docs: add jotaro 0.8 implementation plan`
2. `chore: bump jotaro generator to 0.8 alpha`
3. `feat: add generation-scoped project structure`
4. `feat: add project brief and world schemas`
5. `feat: add specialist review contract`
6. `feat: add 0.8 specialist agents`
7. `feat: add prompt manifest and essentialism pass`
8. `feat: add approval token gate`
9. `feat: add MCP production ledger`
10. `feat: add post-render critique contract`
11. `docs: update commands and user-facing flow`

## 15. Testes e verificação

### Comandos

```bash
npm test
node scripts/verify.cjs
node scripts/validate-rag.cjs --root .
node scripts/pipeline-state.cjs get --root <tmp> --cena 1 --tipo imagem
```

### Verificações novas que devem entrar no `verify.cjs`

- todos os arquivos de agente 0.8 existem;
- todos os schemas 0.8 existem;
- frontmatter dos agentes não autoriza `Task`, `Bash` ou MCP nas folhas;
- `settings.json` autoriza escrita em `generations`;
- gates 0.7 ainda rodam;
- gates 0.8 rodam;
- `higgsfield-gate` bloqueia geração sem token;
- exemplos em `examples/` validam contra schemas 0.8;
- `package.json` está em `0.8.x`.

## 16. Decisões ainda abertas

1. **Nome final dos agentes antigos.**
   - Manter `soul-strategist.md` como alias para `historia.md` ou substituir de vez?
   - Recomendação: substituir de vez para evitar comportamento 0.7.

2. **Formato do `prompt-manifest`.**
   - YAML ou JSON?
   - Recomendação: YAML para leitura humana, JSON se os gates ficarem mais simples.

3. **Onde Jotaro monta o rascunho v0.**
   - Dentro de `CLAUDE.md`, comando, ou script?
   - Recomendação: comando/script pequeno para gerar artefato persistido.

4. **Como representar `mundo.md`.**
   - Markdown livre ou schema + markdown?
   - Recomendação: markdown humano + `world.schema.json` para campos auditáveis.

5. **Se `prompt-forge.schema.json` será mantido.**
   - Pode virar compat layer durante a transição.
   - Recomendação: manter por uma versão e marcar como legacy.

## 17. Critério de pronto da 0.8

A 0.8 está pronta quando:

1. uma geração nova cria pasta própria em `generations/<id>`;
2. todas as 15 etapas deixam artefato verificável;
3. todos os especialistas têm veredito estruturado;
4. prompt-smith final gera prompt + manifest + diff;
5. gates 0.7 e 0.8 passam;
6. produção MCP bloqueia sem aprovação;
7. aprovação humana emite token escopado;
8. produção registra ledger;
9. crítica pós-render registra decisão e aprendizado;
10. `npm test` passa;
11. README/CLAUDE/comandos descrevem 0.8 como fluxo principal.

## 18. Handoff imediato

Próximo passo recomendado: **Wave 0 + Wave 1**.

Escopo do primeiro ciclo:

1. atualizar `package.json` para `0.8.0-alpha.1`;
2. criar helper de `generation-id`;
3. criar estrutura `projects/<marca>/generations/<id>`;
4. adaptar `pipeline-state.cjs`;
5. adicionar testes no `verify.cjs`;
6. rodar `npm test`.

Não começar pelos agentes. Primeiro a estrutura de persistência precisa existir; sem
ela, os especialistas novos voltam a escrever em cima do modelo mental da 0.7.

## 19. Backlog detalhado por wave

Esta seção expande as ondas em tarefas pequenas o bastante para execução direta.
Cada item deve deixar evidência em arquivo, teste ou saída de `npm test`.

### Wave 0 — Baseline, versão e trava de regressão

Objetivo: provar que a cópia 0.8 ainda funciona como 0.7 antes de mudar arquitetura.

Arquivos a tocar:

```text
package.json
README.md
CLAUDE.md
scripts/verify.cjs
```

Tarefas:

1. Rodar `npm test` sem alterações funcionais.
2. Registrar qualquer falha pré-existente em `tmp/baseline-0.8.md`.
3. Atualizar `package.json`:
   - `version`: `0.8.0-alpha.1`
   - `description`: mencionar Jotaro como diretor de projeto.
4. Adicionar no `README.md` uma nota curta:
   - "0.8 em migração".
   - "0.7 ainda é compatível".
   - "novas gerações devem usar `generations/<id>` quando Wave 1 entrar".
5. Criar seção em `CLAUDE.md` chamada `Jotaro 0.8 migration mode`.
6. Adicionar check no `verify.cjs`:
   - falhar se `package.json.version` ainda for `0.7.0`;
   - avisar se `references/_pesquisa-0.8` não tiver 15 arquivos.

Critérios de aceite:

- `npm test` passa.
- `package.json` não diz mais `0.7.0`.
- `verify.cjs` consegue detectar ausência da pesquisa 0.8.

Risco:

- Se `npm test` já falhar no baseline, não misturar correção com migração. Abrir uma
  correção isolada de baseline primeiro.

### Wave 1 — Estrutura de geração individual

Objetivo: parar de tratar `output/` como lugar único de verdade.

Arquivos a criar:

```text
scripts/lib/generation-paths.cjs
schemas/generation.schema.json
examples/generation/valid-generation-context.json
```

Arquivos a alterar:

```text
scripts/pipeline-state.cjs
schemas/pipeline-state.schema.json
schemas/project.schema.json
scripts/verify.cjs
.claude/settings.json
```

Contrato de geração:

```json
{
  "project_id": "examplebrand",
  "generation_id": "2026-07-03-duda-gym-001",
  "created_at": "2026-07-03T13:00:00-03:00",
  "status": "created",
  "root": "projects/ExampleBrand/generations/2026-07-03-duda-gym-001",
  "compat_output": "projects/ExampleBrand/output"
}
```

Tarefas:

1. Criar `generation-paths.cjs` com funções puras:
   - `resolveProjectRoot(root, projectId)`
   - `createGenerationId({ slug, now })`
   - `resolveGenerationRoot(projectRoot, generationId)`
   - `ensureGenerationTree(generationRoot)`
   - `relativeGenerationPaths(generationRoot)`
2. O helper deve criar, no mínimo:

```text
specialist-reviews/
prompt/
gates/
approval/
production/outputs/
critique/
```

3. Atualizar `pipeline-state.cjs` para aceitar:

```text
--project <id>
--generation <id>
```

4. Manter comportamento antigo quando `--generation` não vier.
5. Adicionar ao `pipeline-state.schema.json`:
   - `project_id`
   - `generation_id`
   - `generation_root`
   - `stage`
   - `invalidated_after`
   - `history[]`
6. Atualizar `.claude/settings.json`:

```text
Write(./projects/**/generations/**)
Read(./projects/**/generations/**)
```

7. Adicionar exemplos válidos e inválidos de generation context.
8. Atualizar `verify.cjs` para:
   - validar `schemas/generation.schema.json`;
   - criar uma geração temporária;
   - confirmar que `pipeline-state get` não escreve arquivo;
   - confirmar que `ensureGenerationTree` cria as pastas esperadas.

Critérios de aceite:

- Uma geração nova não altera `projects/<marca>/output/`.
- Uma geração nova cria árvore própria.
- `pipeline-state` consegue ler estado antigo e novo.

Anti-padrão a evitar:

- Criar `generations/` mas continuar salvando os artefatos reais em `output/`.

### Wave 2 — Project brief, objetivo e mundo persistente

Objetivo: criar o centro de gravidade do projeto. Especialistas não podem auditar
sem saber contra qual projeto estão julgando.

Arquivos a criar:

```text
schemas/project-brief.schema.json
schemas/world.schema.json
.claude/agents/objetivo-do-projeto.md
.claude/agents/mundo.md
templates/project-brief.template.json
templates/mundo.template.md
examples/project-brief/valid-awareness.json
examples/world/valid-mundo.md
```

Arquivos a alterar:

```text
schemas/intake.schema.json
schemas/project.schema.json
scripts/lib/dossie.cjs
scripts/verify.cjs
README.md
CLAUDE.md
```

Campos do `project-brief.schema.json`:

```json
{
  "project_id": "string",
  "generation_id": "string",
  "objetivo": "awareness|consideration|conversion|retencao|educacao|outro",
  "metrica_primaria": "hook_rate|hold_rate|vcr|ctr|cpa|roas|qualidade_visual",
  "nivel_awareness": "fria|problem-aware|solution-aware|product-aware|retargeting",
  "single_minded_proposition": "string",
  "o_que_comunica": "string",
  "como_comunica": "string",
  "publico": "string",
  "canal": "tiktok|reels|youtube_shorts|outro",
  "formato": "video|video_mudo|imagem",
  "estetica": "ugc-native|polished|cinematic|documental|outro",
  "time_budget": {
    "hook": "string",
    "desenvolvimento": "string",
    "payoff_cta": "string"
  },
  "restricoes": [],
  "provas_permitidas": [],
  "nao_fazer": []
}
```

Campos do `world.schema.json`:

```json
{
  "project_id": "string",
  "world_version": "string",
  "lugares": [
    {
      "id": "academia-duda",
      "nome": "Academia da Duda",
      "funcao_narrativa": "onde rotina e disciplina aparecem",
      "geografia": "string",
      "luz_natural": "string",
      "props_recorrentes": [],
      "texturas": [],
      "restricoes": []
    }
  ],
  "continuidade": {
    "o_que_nao_pode_mudar": [],
    "o_que_pode_variar": []
  }
}
```

Tarefas do agente `objetivo-do-projeto`:

1. Receber identidade + intake.
2. Extrair uma proposição única.
3. Separar `o_que_comunica` de `como_comunica`.
4. Definir métrica primária.
5. Definir awareness.
6. Definir estética estratégica: `ugc-native`, `polished`, `cinematic`, etc.
7. Definir time-budget.
8. Recusar múltiplas mensagens sem hierarquia.

Tarefas do agente `mundo`:

1. Ler `RAG/mundo.md` se existir.
2. Se não existir, criar proposta inicial de mundo.
3. Auditar se o rascunho usa lugar, props e luz coerentes.
4. Atualizar apenas memória de mundo, não história.
5. Registrar mudanças como diff.

Critérios de aceite:

- Nenhuma geração avança para `draft_v0_ready` sem `project-brief.json`.
- `mundo` não inventa lugar novo sem registrar em `mundo.md`.
- `project-brief` contém uma única proposição central.

### Wave 3 — Especialistas sequenciais

Objetivo: implementar a mudança filosófica da 0.8. Cada especialista audita o mesmo
prompt em evolução.

Arquivos a criar:

```text
schemas/specialist-review.schema.json
scripts/lib/specialist-chain.cjs
scripts/lib/specialist-signoff.cjs
.claude/agents/historia.md
.claude/agents/enredo.md
.claude/agents/camera.md
.claude/agents/montagem.md
.claude/agents/realismo.md
.claude/agents/audio.md
examples/specialist-review/valid-camera.json
examples/specialist-review/invalid-out-of-scope.json
```

Schema base:

```json
{
  "stage": "historia|mundo|enredo|camera|montagem|realismo|audio",
  "generation_id": "string",
  "input_hash": "string",
  "output_hash": "string",
  "ok": true,
  "motivo": "string",
  "ajuste_aplicado": true,
  "campos_alterados": [],
  "draft_revisado_path": "string",
  "riscos": [],
  "handoff": {
    "proxima_etapa": "string",
    "observacoes": []
  }
}
```

Regras de escopo por agente:

| Etapa | Pode alterar | Não pode alterar |
|---|---|---|
| `historia` | mensagem emocional, tensão, intenção percebida | câmera, luz técnica, MCP |
| `mundo` | cenário, props, geografia, continuidade espacial | arco emocional, CTA |
| `enredo` | acontecimentos, beat order, causalidade | lente, formato de câmera, música |
| `camera` | shot size, ângulo, lente/look, movimento | falas, história, produto como promessa |
| `montagem` | duração, corte, pacing, transições | identidade visual, mundo |
| `realismo` | imperfeição, motion blur, textura, anti-IA | estrutura de cena |
| `audio` | fala, música, silêncio, ambiente, legibilidade | câmera, mundo, montagem visual |

Tarefas:

1. Criar `specialist-chain.cjs` com a ordem fixa:

```js
[
  'historia',
  'mundo',
  'enredo',
  'camera',
  'montagem',
  'realismo',
  'audio'
]
```

2. Criar helper para calcular hash antes/depois de cada review.
3. Salvar cada review em `specialist-reviews/<stage>.json`.
4. Salvar o draft revisado de cada etapa, se útil:

```text
drafts/04-historia.md
drafts/05-mundo.md
...
```

5. `specialist-signoff.cjs` deve falhar se:
   - etapa ausente;
   - `ok=false`;
   - hash de input não corresponde ao draft anterior;
   - etapa altera campo fora do seu escopo;
   - etapa pula ordem.

Critérios de aceite:

- Uma cadeia completa produz sete reviews.
- Alteração fora de escopo reprova em exemplo inválido.
- Reexecutar uma etapa invalida reviews posteriores.

### Wave 4 — Prompt-smith final, manifesto e essencialismo

Objetivo: transformar a cadeia auditada em prompt final executável e enxuto.

Arquivos a criar:

```text
schemas/prompt-manifest.schema.json
scripts/lib/prompt-manifest-required.cjs
scripts/lib/essentialism-diff.cjs
scripts/lib/one-camera-move-per-shot.cjs
scripts/lib/visual-contradiction.cjs
templates/prompt-manifest.template.yaml
examples/prompt-manifest/valid-video.yaml
examples/prompt-manifest/invalid-missing-camera.yaml
```

Arquivos a alterar:

```text
.claude/agents/prompt-smith.md
scripts/lib/prompt-structure.cjs
scripts/preflight-gate.cjs
scripts/verify.cjs
schemas/prompt-forge.schema.json
```

Contrato do output:

```text
prompt/
  prompt.canonical.md
  prompt.<model>.md
  prompt-manifest.yaml
  essentialism-diff.md
```

Conteúdo mínimo do `prompt-manifest.yaml`:

```yaml
project_id: examplebrand
generation_id: 2026-07-03-duda-gym-001
model_target: kling3_0
aspect_ratio: "9:16"
duration_seconds: 8
primary_metric: hook_rate
brief_hash: ""
identity_hash: ""
specialist_reviews_hash: ""
shots:
  - id: 1
    beat: hook
    time: "0-3s"
    subject: ""
    action: ""
    world: ""
    camera:
      shot_size: "medium close-up"
      angle: "eye-level"
      movement: "slow dolly in"
      lens_or_look: "16mm documentary"
    montagem:
      cut_style: "hard cut"
      duration: 3
    realismo:
      motion_blur: "subtle shutter blur on hand movement"
      imperfections: []
    audio:
      dialogue: ""
      music: ""
      ambience: ""
negative_controls: []
```

Conteúdo mínimo do `essentialism-diff.md`:

```markdown
# Essentialism diff

## Preservado
- ...

## Cortado
- ...

## Motivo dos cortes
- ...

## Riscos remanescentes
- ...
```

Gates novos:

1. `prompt-manifest-required.cjs`
   - falha se manifesto não existir;
   - falha se `shots[]` estiver vazio;
   - falha se `brief_hash` ou `specialist_reviews_hash` estiver ausente.

2. `essentialism-diff.cjs`
   - falha se não houver seção `Cortado`;
   - falha se nenhum corte foi considerado;
   - falha se prompt final contém termos vazios tipo `masterpiece`, `ultra`, `perfect`.

3. `one-camera-move-per-shot.cjs`
   - falha se um shot tiver mais de um movimento principal não sequenciado;
   - flaggar termos como `pan while dolly`, `orbit and zoom` sem divisão.

4. `visual-contradiction.cjs`
   - falha em contradições explícitas:
     - `handheld` + `perfectly stable`;
     - `natural light` + `studio softbox` sem justificativa;
     - `ugc-native` + `polished commercial studio` sem intenção.

Critérios de aceite:

- Prompt final não depende do dossiê para ser entendido.
- Manifesto permite gates determinísticos.
- `prompt-forge.schema.json` fica marcado como legacy ou compat.

### Wave 5 — Aprovação humana única e token

Objetivo: trocar confiança em instrução por autorização verificável.

Arquivos a criar:

```text
schemas/approval-record.schema.json
scripts/lib/approval-token.cjs
scripts/lib/hash-artifact.cjs
examples/approval/valid-approved.yaml
examples/approval/invalid-stale-token.yaml
```

Arquivos a alterar:

```text
.claude/hooks/higgsfield-gate.cjs
.claude/settings.json
scripts/preflight-gate.cjs
scripts/verify.cjs
```

Regras:

1. Token nasce apenas depois de gates passarem.
2. Token inclui:
   - `generation_id`;
   - `prompt_hash`;
   - `gate_results_hash`;
   - `approved_by`;
   - `approved_at`;
   - `allowed_tools`;
   - `expires_at`.
3. Token expira.
4. Token é inválido se prompt mudar.
5. Token é inválido se gate-results mudar.
6. Token é inválido para outra geração.

Fluxo:

```text
prompt final
-> hash prompt
-> gates
-> hash gate-results
-> approval-record
-> production-token
-> MCP liberado
```

Testes obrigatórios:

- `higgsfield-gate` bloqueia MCP sem token.
- `higgsfield-gate` bloqueia token de outra geração.
- `higgsfield-gate` bloqueia token com prompt_hash antigo.
- `balance` e `job_status` continuam permitidos.

### Wave 6 — Produção MCP com ledger

Objetivo: separar execução de decisão criativa.

Arquivos a criar:

```text
schemas/production-job.schema.json
scripts/lib/production-job.cjs
scripts/lib/render-adapter.cjs
scripts/lib/output-hash.cjs
examples/production/valid-job.yaml
```

Contrato do `production-job.yaml`:

```yaml
production_job:
  project_id: examplebrand
  generation_id: 2026-07-03-duda-gym-001
  approval_token_hash: ""
  tool_server: higgsfield
  tool_name: mcp__higgsfield__generate_video
  model: kling3_0
  input_prompt_path: prompt/prompt.kling3_0.md
  input_manifest_path: prompt/prompt-manifest.yaml
  params:
    aspect_ratio: "9:16"
    duration_seconds: 8
    seed: null
  status: queued
  attempts:
    - started_at: ""
      finished_at: ""
      status: succeeded
      output_paths: []
      cost: null
      error: null
  outputs:
    - path: production/outputs/render-001.mp4
      sha256: ""
```

Adapter por modelo:

| Modelo/ferramenta | Entrada | Observação |
|---|---|---|
| Higgsfield video | `prompt.<model>.md` + refs | usa token |
| Higgsfield image | prompt visual + refs | usa token |
| Higgsfield audio | fala/música/sfx | usa token |
| CLI fallback | mesmo manifesto | permitido só com token |

Regras de retry:

- Retry de rede: mesmo prompt, mesma configuração, novo attempt.
- Erro de schema: parar e corrigir adapter.
- Erro criativo: não retry cego; mandar para crítica.
- Output parcial: preservar.

Critérios de aceite:

- Nenhuma chamada de produção acontece sem ledger.
- Ledger aponta para prompt e approval.
- Outputs têm hash.

### Wave 7 — Crítica pós-render

Objetivo: fechar o ciclo e impedir que erro vire memória perdida.

Arquivos a criar/alterar:

```text
schemas/post-render-critique.schema.json
scripts/lib/post-render-critique.cjs
templates/post-render-critique.template.yaml
references/render-learnings.md
examples/critique/valid-approved.yaml
examples/critique/valid-revise-camera.yaml
```

Critérios de avaliação:

1. Aderência ao projeto.
2. Identidade.
3. Mundo.
4. Enredo.
5. Câmera.
6. Montagem.
7. Realismo.
8. Áudio.
9. Potencial de attention.
10. Branding.
11. Connection.
12. Direction.

Cada falha deve ter:

```yaml
stage: camera
severity: low|medium|high|blocking
evidence: "observável no render"
root_cause: "prompt|specialist|model|adapter|brief|unknown"
next_action: "revise_stage|rerender_tool|reopen_brief|reject"
```

Critérios de aceite:

- Render aprovado tem crítica aprovada.
- Render reprovado aponta próxima etapa.
- Aprendizado reutilizável entra em `references/render-learnings.md`.

### Wave 8 — UX, comandos e documentação

Objetivo: a experiência do usuário refletir a 0.8.

Arquivos a alterar:

```text
README.md
CLAUDE.md
.claude/commands/inicio.md
.claude/commands/explica-fluxo.md
.claude/commands/gerarvideo.md
.claude/commands/gerarimagem.md
.claude/commands/roteiro.md
.claude/commands/revisao.md
.claude/commands/simular.md
```

Mudanças por comando:

| Comando | Mudança 0.8 |
|---|---|
| `/inicio` | apresentar Jotaro como diretor de projeto |
| `/explica-fluxo` | mostrar as 15 etapas |
| `/gerarvideo` | criar generation-id e project-brief antes de prompt |
| `/gerarimagem` | usar mesmo fluxo, mas manifesto de imagem |
| `/roteiro` | deixar claro que roteiro virou enredo auditado |
| `/revisao` | revisar prompt/render por etapa |
| `/simular` | simular token, gates e produção sem gasto |

Critérios de aceite:

- Nenhum comando descreve a 0.7 como fluxo principal.
- Docs apontam para `plano-jotaro-0.8.md` e `references/_pesquisa-0.8`.

## 20. Especificação etapa por etapa

Esta seção define, para cada uma das 15 etapas, entrada, saída, arquivo, agente/script
e principal critério de aceite.

### 01 — Identidade / RAG

Fonte teórica:

```text
references/_pesquisa-0.8/01-identidade-rag.md
```

Responsável:

```text
.claude/agents/rag.md
```

Entrada:

- `project_id`
- `generation_id`
- `projects/<marca>/RAG/`
- `RAG/identidade-visual/`
- referências de personagem/produto quando existirem

Saída:

```text
generations/<id>/identity.json
```

Campos mínimos:

```json
{
  "marca": "",
  "personagens": [],
  "produto": {},
  "paleta": [],
  "tom": "",
  "referencias": [],
  "restricoes_identidade": []
}
```

Critério de aceite:

- Identidade tem hash.
- Identidade diferencia personagem, produto e marca.
- Se `element_id` for necessário e estiver ausente, estado vira
  `blocked_missing_identity`.

### 02 — Objetivo do projeto

Fonte:

```text
references/_pesquisa-0.8/02-objetivo-do-projeto.md
```

Responsável:

```text
.claude/agents/objetivo-do-projeto.md
```

Saída:

```text
generations/<id>/project-brief.json
```

Critério de aceite:

- `single_minded_proposition` não está vazia.
- `metrica_primaria` existe.
- `o_que_comunica` e `como_comunica` são campos separados.
- Se houver múltiplas mensagens, o agente escolhe uma primária e marca as outras
  como proof points.

### 03 — Rascunho inicial do Jotaro

Fonte:

```text
references/_pesquisa-0.8/03-rascunho-inicial.md
```

Responsável:

```text
Jotaro/orquestrador
```

Saída:

```text
generations/<id>/draft-v0.md
```

Critério de aceite:

- Draft tem intenção, estrutura inicial, placeholders com dono e não finge certeza.
- Campos que dependem de especialista podem estar marcados como `a definir`, mas com
  dono explícito.

### 04 — História

Fonte:

```text
references/_pesquisa-0.8/04-historia.md
```

Responsável:

```text
.claude/agents/historia.md
```

Saída:

```text
specialist-reviews/04-historia.json
drafts/04-historia.md
```

Critério de aceite:

- A verdade emocional do projeto passa no prompt.
- O agente não transforma enredo técnico em drama inventado.
- O agente não mexe em câmera, montagem ou áudio.

### 05 — Mundo

Fonte:

```text
references/_pesquisa-0.8/05-mundo.md
```

Responsável:

```text
.claude/agents/mundo.md
```

Saídas:

```text
projects/<marca>/RAG/mundo.md
specialist-reviews/05-mundo.json
drafts/05-mundo.md
```

Critério de aceite:

- O cenário tem geografia, props e luz coerentes.
- Qualquer novo lugar entra no `mundo.md`.
- O prompt evita "fundo genérico".

### 06 — Enredo

Fonte:

```text
references/_pesquisa-0.8/06-enredo.md
```

Responsável:

```text
.claude/agents/enredo.md
```

Saídas:

```text
specialist-reviews/06-enredo.json
drafts/06-enredo.md
```

Critério de aceite:

- O que acontece cena a cena comunica o projeto.
- A causalidade é legível.
- O payoff não aparece como surpresa sem preparação.

### 07 — Câmera

Fonte:

```text
references/_pesquisa-0.8/07-camera.md
```

Responsável:

```text
.claude/agents/camera.md
```

Saídas:

```text
specialist-reviews/07-camera.json
drafts/07-camera.md
```

Critério de aceite:

- Cada shot tem size, ângulo, movimento e look/lente.
- Há no máximo um movimento primário por shot.
- O formato serve ao projeto, não ao enfeite.

### 08 — Montagem

Fonte:

```text
references/_pesquisa-0.8/08-montagem.md
```

Responsável:

```text
.claude/agents/montagem.md
```

Saídas:

```text
specialist-reviews/08-montagem.json
drafts/08-montagem.md
```

Critério de aceite:

- Ritmo de corte condiz com objetivo e métrica.
- Hook tem timing adequado.
- Transição existe por função, não por decoração.

### 09 — Realismo

Fonte:

```text
references/_pesquisa-0.8/09-realismo.md
```

Responsável:

```text
.claude/agents/realismo.md
```

Saídas:

```text
specialist-reviews/09-realismo.json
drafts/09-realismo.md
```

Critério de aceite:

- Prompt evita look de IA perfeita.
- Motion blur é motivado.
- Imperfeição parece captura real, não degradação genérica.

### 10 — Áudio

Fonte:

```text
references/_pesquisa-0.8/10-audio.md
```

Responsável:

```text
.claude/agents/audio.md
```

Saídas:

```text
specialist-reviews/10-audio.json
drafts/10-audio.md
```

Critério de aceite:

- Música, fala, silêncio e ambiente condizem com o projeto.
- Fala não contradiz guarda regulatória.
- Áudio funciona com e sem plataforma sound-on, quando aplicável.

### 11 — Prompt-smith final

Fonte:

```text
references/_pesquisa-0.8/11-prompt-smith-final.md
```

Responsável:

```text
.claude/agents/prompt-smith.md
```

Saídas:

```text
prompt/prompt.canonical.md
prompt/prompt.<model>.md
prompt/prompt-manifest.yaml
prompt/essentialism-diff.md
```

Critério de aceite:

- Prompt final contém apenas decisões úteis.
- Prompt dialetal não contradiz prompt canônico.
- Diff explica cortes.

### 12 — Gates mecânicos

Fonte:

```text
references/_pesquisa-0.8/12-gates-mecanicos.md
```

Responsável:

```text
scripts/preflight-gate.cjs
scripts/verify.cjs
scripts/lib/*.cjs
```

Saída:

```text
gates/gate-results.json
```

Critério de aceite:

- Todos os gates obrigatórios passam.
- Falha tem mensagem acionável.
- Gate determinístico não depende de LLM.

### 13 — Aprovação humana

Fonte:

```text
references/_pesquisa-0.8/13-aprovacao-humana.md
```

Responsável:

```text
Jotaro/orquestrador
scripts/lib/approval-token.cjs
```

Saída:

```text
approval/approval-record.yaml
gates/production-token.json
```

Critério de aceite:

- Humano aprova versão exata.
- Token é escopado, expirável e invalidável.

### 14 — Produção MCP

Fonte:

```text
references/_pesquisa-0.8/14-producao-mcp.md
```

Responsável:

```text
scripts/lib/render-adapter.cjs
scripts/lib/production-job.cjs
.claude/hooks/higgsfield-gate.cjs
```

Saída:

```text
production/production-job.yaml
production/outputs/*
```

Critério de aceite:

- Produção não reescreve prompt.
- Toda chamada tem ledger.
- Gasto só ocorre com token.

### 15 — Crítica pós-render

Fonte:

```text
references/_pesquisa-0.8/15-critica-pos-render.md
```

Responsável:

```text
scripts/lib/post-render-critique.cjs
Jotaro/orquestrador
```

Saída:

```text
critique/post-render-critique.yaml
references/render-learnings.md
```

Critério de aceite:

- Crítica compara render com projeto, não com gosto solto.
- Falha aponta etapa responsável.
- Há próxima ação clara.

## 21. Matriz de arquivos

### Criar

```text
.claude/agents/objetivo-do-projeto.md
.claude/agents/historia.md
.claude/agents/mundo.md
.claude/agents/enredo.md
.claude/agents/camera.md
.claude/agents/montagem.md
.claude/agents/realismo.md
.claude/agents/audio.md

schemas/generation.schema.json
schemas/project-brief.schema.json
schemas/world.schema.json
schemas/specialist-review.schema.json
schemas/prompt-manifest.schema.json
schemas/approval-record.schema.json
schemas/production-job.schema.json
schemas/post-render-critique.schema.json

scripts/lib/generation-paths.cjs
scripts/lib/specialist-chain.cjs
scripts/lib/specialist-signoff.cjs
scripts/lib/prompt-manifest-required.cjs
scripts/lib/essentialism-diff.cjs
scripts/lib/one-camera-move-per-shot.cjs
scripts/lib/visual-contradiction.cjs
scripts/lib/approval-token.cjs
scripts/lib/hash-artifact.cjs
scripts/lib/production-job.cjs
scripts/lib/render-adapter.cjs
scripts/lib/output-hash.cjs

templates/project-brief.template.json
templates/mundo.template.md
templates/prompt-manifest.template.yaml
templates/post-render-critique.template.yaml
references/render-learnings.md
```

### Alterar

```text
package.json
README.md
CLAUDE.md
.claude/settings.json
.claude/hooks/higgsfield-gate.cjs
.claude/agents/rag.md
.claude/agents/prompt-smith.md
scripts/verify.cjs
scripts/preflight-gate.cjs
scripts/pipeline-state.cjs
scripts/lib/dossie.cjs
scripts/lib/prompt-structure.cjs
schemas/project.schema.json
schemas/intake.schema.json
schemas/pipeline-state.schema.json
schemas/prompt-forge.schema.json
schemas/critique.schema.json
.claude/commands/inicio.md
.claude/commands/explica-fluxo.md
.claude/commands/gerarvideo.md
.claude/commands/gerarimagem.md
.claude/commands/roteiro.md
.claude/commands/revisao.md
.claude/commands/simular.md
```

### Marcar como legacy ou aposentar

```text
.claude/agents/soul-strategist.md
.claude/agents/story-writer.md
.claude/agents/storyboard-director.md
.claude/agents/editing-director.md
schemas/alma.schema.json
schemas/roteiro.schema.json
schemas/storyboard.schema.json
schemas/edicao.schema.json
```

Não remover imediatamente. Primeiro deixar aliases ou compatibilidade por uma versão
para não quebrar exemplos e testes 0.7.

## 22. Migração de dados e exemplos

### Projetos existentes

Projetos atuais prováveis:

```text
projects/ExampleBrand/
projects/ExampleHero/
```

Migração mínima por projeto:

1. Criar `RAG/mundo.md` se não existir.
2. Criar `generations/`.
3. Mover outputs antigos apenas se houver necessidade de histórico.
4. Não apagar `output/`.
5. Criar `generations/_legacy-0.7/` opcionalmente, com ponte para outputs antigos.

### Exemplo de ponte legacy

```text
projects/ExampleBrand/generations/_legacy-0.7/
  README.md
  legacy-output-path.txt
```

Conteúdo:

```text
Esta geração aponta para outputs criados antes da arquitetura 0.8.
Origem: projects/ExampleBrand/output/
```

### Exemplos novos

Criar uma geração exemplo sem render real:

```text
examples/generations/duda-gym-0.8/
  intake.json
  identity.json
  project-brief.json
  draft-v0.md
  specialist-reviews/*.json
  prompt/prompt-manifest.yaml
  approval/approval-record.yaml
  production/production-job.yaml
  critique/post-render-critique.yaml
```

Esse exemplo vira o fixture principal do `verify.cjs`.

## 23. Checklist de qualidade por PR

Para qualquer PR da 0.8:

```text
[ ] Não remove compatibilidade 0.7 sem substituto.
[ ] Não dá Bash/Task/MCP para agente folha.
[ ] Não escreve fora de projects/**/generations/** ou output compat.
[ ] Atualiza schema e exemplo juntos.
[ ] Atualiza verify junto com qualquer contrato novo.
[ ] Adiciona caso inválido para cada gate novo.
[ ] Mantém pesquisa 0.8 como referência, não como prompt runtime.
[ ] Roda npm test.
[ ] Documenta decisão aberta se não for resolvida.
```

## 24. Riscos técnicos e mitigação

| Risco | Como aparece | Mitigação |
|---|---|---|
| Agente volta a empilhar conteúdo | reviews longos e prompt inchado | `essentialism-diff` + escopo por agente |
| Especialista altera campo de outro | camera mexe em história | `specialist-signoff.cjs` |
| Aprovação vira teatro | humano aprova sem versão/hash | `approval-record` com prompt_hash |
| MCP gasta sem autorização | chamada direta ao tool | `higgsfield-gate` com token |
| `output/` continua como verdade | generations existe mas não é usado | Wave 1 bloqueia escrita nova fora de generation |
| Prompt canônico diverge do dialetal | adapter reescreve na produção | dialeto gerado na etapa 11, produção read-only |
| Crítica fica subjetiva | "ficou bom/ruim" | rubrica + falha por etapa |
| Pesquisa vira prompt injection | `.md` de pesquisa usado como instrução runtime | docs dizem que pesquisa é referência inerte |

## 25. Ordem de execução dentro de cada wave

Padrão recomendado:

1. Criar schema.
2. Criar exemplo válido.
3. Criar exemplo inválido.
4. Criar helper/script.
5. Ligar helper ao `verify.cjs`.
6. Ajustar agente/comando.
7. Rodar `npm test`.
8. Atualizar docs.

Motivo: se o schema e o verify vierem depois, a implementação tende a virar texto
solto. A 0.8 precisa nascer com contrato verificável.

## 26. Definition of done por tipo de artefato

### Agente

```text
[ ] Frontmatter com name, description, tools, model.
[ ] tools sem Bash, Task ou MCP se for folha.
[ ] Entrada declarada.
[ ] Saída declarada.
[ ] Escopo: pode/não pode.
[ ] Perguntas de auditoria.
[ ] Formato de veredito.
[ ] Referência ao .md de pesquisa correspondente.
```

### Schema

```text
[ ] `$schema`.
[ ] `title`.
[ ] `type`.
[ ] `required`.
[ ] `additionalProperties` definido.
[ ] Exemplo válido.
[ ] Exemplo inválido.
[ ] Validado por `verify.cjs`.
```

### Gate

```text
[ ] Função pura exportável.
[ ] CLI ou integração em preflight.
[ ] Mensagem de erro acionável.
[ ] Caso pass.
[ ] Caso fail.
[ ] Sem chamada LLM.
[ ] Sem dependência de rede.
```

### Comando Claude

```text
[ ] Explica fluxo 0.8.
[ ] Cria ou exige generation_id.
[ ] Não manda gerar antes da aprovação.
[ ] Aponta artefatos esperados.
[ ] Mantém UX clara para usuário não técnico.
```

## 27. Marco de implementação recomendado

### Milestone A — Fundação

Inclui Waves 0, 1 e 2.

Resultado:

- versão 0.8 alpha;
- geração individual;
- project brief;
- mundo persistente.

Esta milestone ainda pode não ter todos os agentes novos, mas já impede a 0.8 de
voltar ao `output/` único.

### Milestone B — Direção especializada

Inclui Waves 3 e 4.

Resultado:

- especialistas sequenciais;
- prompt-smith final;
- prompt manifest;
- gates novos de prompt.

Esta milestone entrega o coração criativo da 0.8.

### Milestone C — Produção segura

Inclui Waves 5 e 6.

Resultado:

- aprovação humana única;
- token;
- MCP ledger;
- produção rastreável.

Esta milestone torna o gasto controlado.

### Milestone D — Aprendizado e UX

Inclui Waves 7 e 8.

Resultado:

- crítica pós-render;
- aprendizado persistente;
- comandos e docs atualizados.

Esta milestone fecha a versão para uso.

## 28. Próxima ação concreta

Começar por uma task pequena e verificável:

```text
Wave 0.1 — bump e baseline
```

Escopo:

1. `package.json` para `0.8.0-alpha.1`.
2. `README.md` com aviso de migração.
3. `verify.cjs` checando 15 arquivos de pesquisa.
4. Rodar `npm test`.

Só depois:

```text
Wave 1.1 — generation-paths.cjs + árvore generations
```

Esse corte reduz risco e dá a primeira fundação real da 0.8.
