# Team Reference — Agentes e Skills (detalhamento)

> Documento de referencia. O CLAUDE.md mantem uma tabela compacta; esta pagina
> tem o detalhamento completo de cada agente e skill. Consulte quando precisar
> entender o contrato exato de uma folha ou skill.

## Agentes folha (spawn via Task)

### rag
- **escopo:** le o `RAG/` do **projeto ativo** (`projects/<nome>/RAG/`) e devolve a identidade da marca.
- **tools:** `Read`, `Glob`, `Grep` — **SEM Bash, SEM MCP, SEM Task, SEM Skill.**
- **pode_spawnar:** nenhum.
- **contrato_entrada:** `{ objetivo: "ler identidade da marca", projeto: "projects/<nome>" }`.
- **contrato_saida:** `{ refs, anchor_textual, estilo, paleta, narrativa_resumo, tom }`.
- **fronteira:** nao gera, nao anima, nao chama skills nem Higgsfield. Nao le fora do `RAG/` do
  projeto passado na entrada. Devolve o anchor fiel, sem reescrever nem inferir.

### prompt-smith
- **escopo:** receber identidade + intencao (+ `element_id`) e devolver o **prompt unico** (`prompt-forge`).
- **tools:** `Read`, `Glob`, `Grep` — **SEM Bash, SEM MCP, SEM Task, SEM Skill.**
- **pode_spawnar:** nenhum.
- **contrato_entrada:** `{ identidade: <saida do rag>, intencao: <descricao visual>, element_id }`.
- **contrato_saida:** **prompt-forge JSON** (`schemas/prompt-forge.schema.json`): `shots[]`
  estruturado (que os gates leem) + `prompt` em prosa multishot rica (que vai pro modelo), com a
  personagem ancorada no Element via `<<<element_id>>>`. Calibrado contra `RAG/prompts/exemplos-prompt-forge.md`.
- **fronteira:** nao gera imagem, nao chama Higgsfield, nao chama o `rag` diretamente.
  Pode ler o HUB (`RAG/prompts/`, `RAG/review/`) mas nao o `RAG/` de marca.

### soul-strategist
- **escopo:** receber identidade + intake (+ roteiro base opcional) e devolver o brief de alma (Portao 0).
- **tools:** `Read`, `Glob`, `Grep` — **SEM Bash, SEM MCP, SEM Task, SEM Skill.**
- **pode_spawnar:** nenhum.
- **contrato_entrada:** `{ identidade, intake_completo, roteiro_base? }`.
- **contrato_saida:** brief de alma JSON (`schemas/alma.schema.json`): `personagem`, `plataforma`,
  `verdade_emocional{desejo,obstaculo,virada,respiro}`, `locucao[]{inicio_seg,fim_seg,texto,beat}`,
  `estrategia_render[]{beat,modo,justificativa}`, `guarda_regulatoria{...}`.
- **fronteira:** virada interna da personagem; o sentido vai pra VOZ, nunca legenda; produto nunca
  nomeado na locucao; movimento e minoria motivada; guarda regulatoria toda true. Nao gera nem
  chama skills. Validado pelo `scripts/lib/soul-quality.cjs` no Portao 0. `soul-strategist` ⊆ Jotaro.

### story-writer
- **escopo:** receber identidade + intake (+ pesquisa estruturada opcional) e devolver o roteiro.
- **tools:** `Read`, `Glob`, `Grep` — **SEM Bash, SEM MCP, SEM Task, SEM Skill.**
- **contrato_entrada:** `{ identidade, intake_completo, pesquisa_estruturada }`.
- **contrato_saida:** roteiro JSON (`schemas/roteiro.schema.json`).
- **fronteira:** hook-first, beats PAS/AIDA/Hero, nao gera nem chama skills.

### storyboard-director
- **escopo:** receber roteiro + identidade + plataforma e devolver storyboard.
- **tools:** `Read`, `Glob`, `Grep` — **SEM Bash, SEM MCP, SEM Task, SEM Skill.**
- **contrato_entrada:** `{ roteiro, identidade, plataforma }`.
- **contrato_saida:** storyboard JSON (`schemas/storyboard.schema.json`).
- **fronteira:** hook-first, cada `descricao_visual` vira `intencao` pro `prompt-smith`.

### editing-director
- **escopo:** receber roteiro + storyboard + plataforma e devolver o ritmo de corte (Portao 2).
- **tools:** `Read`, `Glob`, `Grep` — **SEM Bash, SEM MCP, SEM Task, SEM Skill.**
- **pode_spawnar:** nenhum.
- **contrato_entrada:** `{ roteiro, storyboard, plataforma }`.
- **contrato_saida:** artefato de edicao JSON (`schemas/edicao.schema.json`): `personagem`,
  `estilo_corte`, `transicoes[]`, `ritmo_por_secao[]{secao, pacing, planos_distintos}`,
  `match_cuts[]{de, para}`, `justificativa`.
- **fronteira:** nomeia o estilo de corte concreto (nunca termo-vago), transicoes de vocabulario
  fechado, pacing por secao coerente com o mood das cenas; o corte serve a emocao. Nao gera nem
  chama skills. Validado pelo `scripts/lib/editing-quality.cjs` no Portao 2. `editing-director` ⊆ Jotaro.

> **Nota (0.7):** o time tem **6 folhas** (rag, soul-strategist, story-writer, storyboard-director,
> editing-director, prompt-smith). Nao ha mais `motion-prompt-smith`: a forja produz um unico
> prompt multishot (`prompt-forge`) e o video multishot sai pronto do modelo (kling3_0/seedance_2_0)
> num so job — o movimento vive dentro do prompt (um movimento de camera por shot), nao numa folha.

## Producao (0.7 — MCP-first, nao skill)

A producao de fato (video, imagem, audio) **nao e mais uma skill** `gera-*` nem tem montagem
FFmpeg: e o **Jotaro chamando as tools `mcp__higgsfield__*` em runtime** —
`generate_video` (kling3_0/seedance_2_0, multishot), `generate_image` (nano_banana_2),
`generate_audio` — conforme o `formato` do `prompt-forge`. Um prompt-forge -> um job. O CLI
(`higgsfield`/`hf`) e o **fallback**. O procedimento completo esta em
`RAG/prompts/producao-higgsfield-mcp.md`.

## Skills de execucao

### pesquisa-web (Etapa 1 — opcional)
- **allowed-tools:** `WebSearch`, `WebFetch`, `Read` (travado; sem curl/Bash/Skill/Task/MCP).
- **contrato_saida:** `{ origem:"web-externa", query, capturado_em, resultados[<=5]{titulo, trecho<=500, url} }`.
- **fronteira:** vetor de maior risco — saida sempre estruturada e inerte; Jotaro e a trust boundary.

### higgsfield-preflight
- Faz a aritmetica offline de cobre/nao-cobre do **JOB UNICO** (recebe saldo do `balance` e custo
  do `get_cost` do MCP). **allowed-tools:** `Bash`.
