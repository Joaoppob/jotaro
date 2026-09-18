# Etapa 3 — Rascunho Inicial (Jotaro): base teórica

> Pesquisa web, 2026-07-03. Fontes visitadas listadas ao final.
> Contexto: no fluxo 0.8, o orquestrador (Jotaro) monta um PRIMEIRO RASCUNHO do prompt
> único de vídeo multishot 9:16 a partir do project-brief + identidade da marca, e uma
> cadeia de 7 especialistas (história→mundo→enredo→câmera→montagem→realismo→áudio)
> audita esse mesmo rascunho sequencialmente, cada um ajustando só sua alçada.

## O que é e por que existe

O Rascunho Inicial é o artefato v0 do prompt: uma versão completa-porém-imperfeita do
prompt multishot, escrita de ponta a ponta pelo Jotaro antes de qualquer especialista
tocar nele. Ele existe por uma razão estrutural: **os 7 especialistas do 0.8 são
auditores, não geradores**. Auditor precisa de objeto de auditoria. Sem um rascunho
completo, cada especialista teria que inventar sua parte do zero — e isso é criação por
comitê, o padrão que a literatura de multi-agente identifica como o de pior convergência.

O rascunho v0 não precisa ser bom. Precisa ser **completo em estrutura e explícito em
intenção**, para que cada auditor saiba o que está lapidando e por quê.

## Base teórica (com as descobertas da pesquisa)

### 1. Teoria de escrita: o rascunho-primeiro funciona porque separa geração de julgamento

Anne Lamott ("Shitty First Drafts", *Bird by Bird*, 1994): "Almost all good writing
begins with terrible first efforts. You need to start somewhere. Start by getting
something — anything — down on paper." O modelo dela é de três drafts com papéis
distintos: o *down draft* (só colocar no papel), o *up draft* (consertar), o *dental
draft* (checar cada dente). O insight transferível: **quem gera não deve julgar ao mesmo
tempo que gera** — julgamento prematuro mata a geração ("worrying about quality too
early kills creativity and momentum", Writing For Pleasure Centre). E o corolário
prático: "You can't fix what you haven't written" — revisão só opera sobre artefato
existente.

Segundo insight de Lamott, menos citado e mais relevante ao Jotaro: o primeiro rascunho
é **instrumento de descoberta** — "there may be something in the very last line of page
six that you now know what you're supposed to be writing about". Ao escrever o v0
inteiro, o Jotaro descobre a espinha do vídeo (qual é o momento-chave, onde o CTA cai
naturalmente) de um jeito que um outline abstrato não revela.

### 2. Padrões LLM: draft-then-refine converge; geração paralela não

- **Self-Refine** (Madaan et al., NeurIPS 2023): gerar output inicial → feedback
  acionável → refinar, em loop, melhora ~20% absoluto em média sobre geração one-shot,
  em 7 tarefas, mesmo com GPT-4. Condição-chave do paper: o feedback precisa ser
  **acionável e localizado** ("identifies specific areas that can be refined") — não
  nota genérica. Tradução pro 0.8: cada especialista deve receber o rascunho + sua
  alçada explícita, e devolver edições pontuais, não reescrita.
- **Reflexion** (Shinn et al., NeurIPS 2023): arquitetura Actor / Evaluator /
  Self-Reflection — o feedback verbal funciona como "semantic gradient signal", uma
  direção concreta de melhoria. O 0.8 é uma variante disso: Jotaro é o Actor, cada
  especialista é um Evaluator+Refiner de dimensão única. Reflexion também mostra que
  **manter histórico das iterações anteriores no contexto** evita repetir erros — cada
  especialista da cadeia deveria ver o que os anteriores mudaram, não só o estado atual.
- **Por que artefato compartilhado > geração paralela**: o estudo MAST ("Why Do
  Multi-Agent LLM Systems Fail?", Cemri et al., 2025; 1600+ traces, 14 modos de falha)
  mostra que as falhas dominantes de MAS são de **desalinhamento inter-agente e
  verificação**, não de capacidade do modelo. Gerar partes em paralelo e costurar depois
  maximiza exatamente esses modos (cada agente assume um mundo diferente). Editar um
  artefato único sequencial elimina a costura: o estado compartilhado é o próprio texto.

### 3. Riscos documentados da cadeia sequencial (e o que os mitiga)

- **Error compounding / drift silencioso** (Redis, "Why Multi-Agent LLM Systems Fail"):
  em cadeias sequenciais, "a subtly wrong intermediate output passes through intact, and
  every downstream agent treats it as fact". Um erro do especialista 2 vira "fato" pros
  especialistas 3–7. Mitigação: o rascunho v0 carrega a **intenção original** de forma
  explícita, para que auditores posteriores possam checar contra ela, não só contra o
  estado corrente.
- **Intent drift** (Jearon Wong, "Defining Intent Drift in Agentic Workflows"): "every
  handoff can drop constraints, weaken boundaries, or compress meaning. Every local step
  may look reasonable. The global work still drifts." A degradação é gradual e
  disfarçada de progresso razoável. Mitigação: seções invariantes (intenção, marca,
  CTA) marcadas como **não-editáveis** pelos especialistas — só o Jotaro as escreve.
- **Sobrescrita fora de alçada**: análogo textual do lost-update de estado compartilhado
  (AgentPatterns, "Shared State Isolation Anomalies"). No 0.8 a cadeia é serial, então
  não há corrida — mas há o risco de o especialista de câmera "melhorar" o enredo.
  Mitigação: alçada declarada por seção do rascunho (single-writer-per-key aplicado a
  texto).
- **Contexto demais também degrada** (arXiv 2606.21666, "Hallucination as Context
  Drift"): broadcast total de contexto piora alucinação vs. comunicação seletiva. Cada
  especialista deve receber o rascunho + brief comprimido da sua alçada, não o dossiê
  inteiro de todos.

### 4. O que um rascunho de prompt de vídeo precisa conter para ser auditável

Os guias de prompt de vídeo convergem numa anatomia estável por shot:

- **Veo 3.1 (Google Cloud)**: fórmula `[Cinematography] + [Subject] + [Action] +
  [Context] + [Style & Ambiance]`, e o padrão **timestamp prompting** para multishot:
  `[00:00-00:02] Medium shot... [00:02-00:04] Reverse shot... SFX: ...` — cada segmento
  com framing, ação e áudio próprios.
- **Prompt Architects (Veo 3)**: 7 camadas ordenadas — subject, action, scene, camera,
  lighting, style, audio — com o bloco de áudio como maior alavanca de qualidade, e
  cena/ambiente como o que impede o "studio-grey nowhere" genérico.
- **RAOGY (scene atoms)**: tratar cada shot como "scene atom" de ~8s com arco interno
  (0-2s setup, 2-6s development, 6-8s button) — e planejar o multishot como outline de
  atoms de uma frase cada, antes de detalhar.

Mínimo auditável do v0, cruzando as três fontes: **esqueleto de shots com timestamps**
(quantos shots, duração, ordem), **intenção declarada por shot** (o beat narrativo que o
shot cumpre — é isso que o auditor de enredo checa), e os **slots por shot** (subject /
action / scene / camera / lighting / style / audio), preenchidos quando o Jotaro tem
base no brief e marcados como **placeholder explícito** (`[CAMERA: a definir — sugestão:
tracking]`) quando não tem. Placeholder explícito é o que transforma lacuna em item de
auditoria em vez de convite a invenção silenciosa.

## Opções e vocabulário que o Jotaro tem à disposição

**O que o rascunho v0 CONTÉM (obrigatório):**

1. **Cabeçalho de intenção** — objetivo do vídeo, público, emoção-alvo, CTA, formato
   (9:16, duração total). Seção invariante: especialistas leem, não editam.
2. **Identidade de marca resolvida** — personagem/produto com descrição física
   consistente (a mesma em todos os shots — é o que dá consistência multishot), tom de
   voz, restrições de marca.
3. **Esqueleto de shots** — N shots com timestamp, uma linha de beat narrativo cada
   ("shot 3: virada — o problema aparece"), no estilo scene-atom outline.
4. **Slots por shot** — subject, action, scene/context, camera, lighting, style, audio.
   Preenchidos com a melhor hipótese do Jotaro OU placeholder explícito com dono
   (`[AUDIO: alçada do especialista 7]`).
5. **Registro de decisões** — 3-5 linhas: por que essa estrutura, o que o Jotaro
   considerou e descartou. É o "semantic gradient" que orienta os auditores (Reflexion).

**O que o v0 DEIXA EM ABERTO (deliberadamente):**

- Refinamento fino de cada alçada: coreografia exata de câmera, régua de cortes,
  texturas de realismo, mix de áudio — o Jotaro esboça, o especialista lapida.
- Alternativas dentro de um slot: o Jotaro pode registrar `sugestão A / B` num
  placeholder e deixar o especialista decidir.
- O que o v0 NUNCA deixa em aberto: número de shots, ordem dos beats, intenção por
  shot, identidade da marca. Isso é espinha — se a espinha muda depois do especialista
  2, tudo que 3-7 fizeram foi sobre premissa morta.

## Como aplicar no fluxo 0.8 (prático, direto)

1. Jotaro lê project-brief + identidade → escreve o v0 **inteiro, de uma vez, sem
   auto-censura** (modo down-draft de Lamott: completude > qualidade). Proibido entregar
   v0 com shots faltando; permitido entregar shots medíocres.
2. Todo campo sem base no brief vira placeholder explícito com dono declarado. Nunca
   inventar silenciosamente (mesma regra do `[a verificar]` de catalogação).
3. Cada especialista recebe: v0 atual + cabeçalho de intenção + changelog dos
   especialistas anteriores + declaração da própria alçada (quais seções pode editar).
4. Cada especialista devolve: edições localizadas + 1-2 linhas de justificativa no
   changelog. Reescrita total do rascunho é violação de protocolo.
5. Checagem de intenção no fim da cadeia: o prompt final é comparado contra o cabeçalho
   de intenção do v0 (defesa anti intent-drift — o v0 é o contrato, não só o material).

## Mudanças sugeridas ao fluxo 0.8

A pesquisa não contradiz o desenho draft-then-audit — ela o valida (Self-Refine,
Reflexion, MAST). Mas sugere 4 reforços:

1. **Changelog acumulado na cadeia**: cada especialista vê o que os anteriores mudaram e
   por quê (Reflexion: histórico de iterações evita repetir/desfazer). Sem isso, o
   especialista 6 pode reverter decisão do 3 sem saber.
2. **Seções invariantes com dono único**: cabeçalho de intenção + identidade de marca
   editáveis só pelo Jotaro (anti intent-drift; single-writer-per-key). Se um
   especialista achar que a espinha está errada, ele **sinaliza**, não edita.
3. **Placeholders com dono declarado** no v0: cada `[a definir]` nomeia qual dos 7
   especialistas o resolve. Lacuna sem dono é o vetor clássico de invenção silenciosa e
   error compounding.
4. **Gate final de intenção**: passo barato pós-cadeia (o próprio Jotaro) comparando
   prompt final vs. cabeçalho de intenção do v0. MAST mostra que "task verification"
   ausente é uma das 3 categorias-raiz de falha de MAS.

## Fontes (URLs completas)

- Anne Lamott, "Shitty First Drafts" (Bird by Bird, 1994), texto integral:
  https://mccourt.georgetown.edu/wp-content/uploads/2022/08/Anne-Lamott-Shitty-First-Drafts-1.pdf
- Writing For Pleasure Centre, análise pedagógica do ensaio de Lamott:
  https://writing4pleasure.com/2026/01/23/our-subject-knowledge-series-what-writer-teachers-need-to-know-3-s-first-drafts-anne-lamott/
- Scribophile, "What Is a Shitty First Draft":
  https://www.scribophile.com/academy/what-is-a-shitty-first-draft
- Madaan et al., "Self-Refine: Iterative Refinement with Self-Feedback" (NeurIPS 2023):
  https://arxiv.org/abs/2303.17651 e https://selfrefine.info/
- Shinn et al., "Reflexion: Language Agents with Verbal Reinforcement Learning"
  (NeurIPS 2023): https://arxiv.org/abs/2303.11366
- Cemri et al., "Why Do Multi-Agent LLM Systems Fail?" (MAST, 2025):
  https://arxiv.org/pdf/2503.13657
- Redis, "Why Multi-Agent LLM Systems Fail & How to Fix Them" (2026):
  https://redis.io/blog/why-multi-agent-llm-systems-fail/
- "Hallucination as Context Drift: Synchronization Protocols for Multi-Agent LLM
  Systems": https://arxiv.org/html/2606.21666
- AgentPatterns, "Multi-Agent Shared State Isolation Anomalies":
  https://agentpatterns.ai/anti-patterns/multi-agent-shared-state-isolation-anomalies/
- Jearon Wong, "Defining Intent Drift in Agentic Workflows" (2026):
  https://www.jearonwong.com/essays/defining-intent-drift-in-agentic-workflows/
- Google DeepMind, Veo prompt guide: https://deepmind.google/models/veo/prompt-guide/
- Google Cloud, "Ultimate prompting guide for Veo 3.1" (timestamp prompting):
  https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- RAOGY, "Complete Veo 3 Prompt Engineering Guide: Scene Atoms":
  https://raogy.guide/blog/veo3-prompt-engineering-guide
- Prompt Architects, "Veo 3 Prompt Structure" (7 camadas, áudio como alavanca):
  https://prompt-architects.com/blog/21-veo3-prompt-structure
