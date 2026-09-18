# Etapa 12 — Gates mecânicos (interlock): base teórica

> Pesquisa web, 2026-07-03. Fontes web listadas ao final; todas visitadas via Exa.

## O que é e por que existe

A Etapa 12 é a segunda trava do Jotaro 0.8: 9+ scripts determinísticos (dp-quality,
prompt-structure, narrative-quality, angle-variety, negative-prompt-discipline,
persona-carry, locucao-idioma, product-closeup, expressao-facial) que rodam sobre o
prompt final e, se todos passam, ARMAM um token assinado. Um hook PreToolUse bloqueia
mecanicamente qualquer chamada de geração sem token válido. Filozoe da casa:
"garantia é trava mecânica, não instrução que o LLM pode pular".

A literatura de 2025-2026 converge exatamente para esse desenho: LLMs são
probabilísticos por construção — "they have no built-in guardrails that guarantee
outputs conform to your schema, business rules, or regulatory constraints"
(Brightlume). O padrão de produção dominante é envolver o modelo em camadas
determinísticas que decidem sem ambiguidade: aprova ou rejeita, executa ou bloqueia.

## Base teórica

### 1. Guardrails determinísticos vs LLM-as-judge

A divisão de trabalho está bem mapeada (Future AGI, aidefense.dev, ai-tldr.dev):

- **Determinístico** (regex, schema, allowlist, parser): mesmo input → mesmo score,
  sempre. Latência sub-milissegundo, custo zero em runtime, 100% explicável. Cobre
  **estrutura, não significado**. Catches 30-60% das falhas reais de produção
  (Future AGI). Fraqueza: cego a semântica — "trivially evaded by paraphrase".
- **LLM-as-judge**: rubrica em linguagem natural, cobre qualquer dimensão que não
  comprime em parser (fidelidade, tom, persona, completude de tarefa). Custo: centavos
  por chamada, 100-3000ms de latência, e **drift de calibração** — o juiz é ele mesmo
  um prompt contra um modelo que muda (Future AGI).
- **Lógica de seleção é econômica**: "use the cheapest control type that can make the
  required judgment reliably. Don't spend an LLM-judge call on something a regex
  catches; don't expect a regex to catch something that requires understanding intent"
  (aidefense.dev).

**Arquitetura híbrida canônica**: camadas ordenadas do barato ao caro, com
curto-circuito — determinístico primeiro (piso), classificador no meio se houver,
juiz LLM só no resíduo ambíguo ou como auditoria assíncrona fora do caminho crítico
(aidefense.dev; alexcloudstar.com). Padrão "gate the judge" (dev.to/alex_spinov):
regras baratas dão veredito OK/BAD quando têm base, e **abstêm** (UNCERTAIN) quando
não têm — só o resíduo incerto escala para julgamento caro.

Regra operacional crítica para CI (qaskills.sh): **testes determinísticos ficam no
check obrigatório que bloqueia merge; suítes LLM-judge rodam agendadas ou
non-blocking**, porque "LLM-graded tests are non-deterministic and you do not want a
flaky judge blocking every merge". O 0.8 já respeita isso: especialistas (julgamento)
a montante, gates (determinismo) como trava.

### 2. Quality gates em CI/CD — fail-fast, ordering, shift-left

- **Fail fast, fail cheap**: gates que pegam os defeitos mais comuns com o menor tempo
  de execução rodam primeiro; falha cedo evita gastar compute nos estágios caros
  (MinimumCD; cicd.ariefw.com). Anti-padrão: todos os checks num bloco único no fim.
- **Checks não-determinísticos não podem ser gates bloqueantes**: dependem de estado
  externo e "cannot be made into blocking pipeline gates without coupling your ability
  to deploy to factors outside your control" — rodam async, como rede de segurança
  (MinimumCD). Tradução direta: LLM-judge nunca dentro do interlock.
- **Shift-left que funciona é tooling, não processo**: "process-based approaches rely
  on human discipline, which fails under deadline pressure. The shift-left approach
  that works is the one that makes it impossible to skip: automated gates that block
  progress" (assrt.ai). Gates bloqueantes devem ser **determinísticos e rápidos** —
  gate flaky é bypassado imediatamente e gera "gate fatigue" (meta: flakiness < 1%).
- **Higiene de gate** (botneve.com): todo gate novo deve declarar sua classe de falha
  (o que pega), latência esperada, orçamento de falso positivo e **condição de
  aposentadoria** ("if false-positive rate exceeds X, kill the gate"). Gates só se
  acumulam por incidente e nunca são removidos → pipeline lento que não protege.

### 3. Interlocks de engenharia — por que trava física > procedimento

A hierarquia de controles (NIOSH/CDC, OSHA) ordena: eliminação > substituição >
**controles de engenharia** > controles administrativos > EPI. Controles de engenharia
são mais eficazes porque "control exposures without significant human interaction" —
os melhores são parte do design original, bloqueiam o perigo na fonte, **impedem que o
usuário modifique ou interfira no controle** e exigem ação mínima para funcionar (CDC).

Lockout/tagout (procedimento) vs guarda intertravada (trava física) é a metáfora exata
do 0.8. LOTO "is an administrative control; it requires affirmative actions by people
to be effective. For that reason, lockout is subject to human error" (ASSP). O número
que fecha o argumento: um operador que trava a máquina 1x/dia por 10 anos precisa
acertar o procedimento 2.500 vezes; um interlock ISO 13849-1 PL d falha perigosamente
no máximo 1 vez a cada 114 anos (ASSP). "Its weakness lies in the foreseeable,
predictable failures of workers to always follow the policy" (Machine Design) —
substitua "workers" por "LLM" e é a tese do interlock do Jotaro.

Aplicado a agentes: hooks PreToolUse são a camada determinística fora da janela de
contexto — "the model cannot argue with or forget a shell process"; "instructions
handle judgment; hooks handle compliance" (agentpatterns.ai). No Claude Code, um hook
que retorna deny bloqueia a tool **mesmo em bypassPermissions** — hooks apertam
política, nunca afrouxam (blakecrosley.com). Limites conhecidos (RFC #45427 do
claude-code): hooks podem falhar silenciosamente (fail-open em exit codes != 0/2),
podem não cobrir subagentes, e um gate por tool-name não vê o mesmo efeito por caminho
alternativo (ex.: escrita via Bash em vez de Write). Interlock robusto precisa cobrir
**todos os caminhos até o efeito**, não só a tool nominal.

### 4. Validação estruturada de saída de LLM

- **Constrained decoding resolve sintaxe, não semântica**: schema compilado em FSM
  torna erro sintático impossível por construção, mas "a field typed as number with
  range [0,100] might still be wrong in ways no type checker can detect" — falhas
  semânticas estruturalmente invisíveis (tianpan.co). Bônus perverso: o "format tax"
  degrada o raciocínio 3-9 pontos percentuais em média sob decoding restrito.
- **Camadas**: (1) validação estrutural (schema/tipos/enums — Pydantic, Zod, Ajv,
  JSON Schema 2020-12); (2) validação semântica/regras de negócio em código; (3) juiz
  para o resto. "Runtime validation is the contract boundary" mesmo quando o provider
  já garante schema (geodocs.dev).
- **Contratos tipados entre agentes**: schemas versionados como artefato de primeira
  classe (schema registry), contrato congelado após uso, validação no **pre-emit
  hook** — depois que o modelo retorna, antes que qualquer tool consuma (balacode.io;
  geodocs.dev). Falha de validação → 1 retry com o erro no prompt; segunda falha →
  rota de erro explícita, nunca truncamento silencioso.

## Opções e vocabulário disponíveis

| Tipo de gate | Decide por | Pega | Custo | Papel no 0.8 |
|---|---|---|---|---|
| Regra/regex | Pattern match | Termos banidos, presença obrigatória, comprimento | ~0, sub-ms | negative-prompt-discipline, locucao-idioma, product-closeup |
| Schema/estrutura | Parse tipado | Campos faltando, tipos errados, enums inválidos | ~0, sub-ms | prompt-structure, dp-quality |
| Heurística de conteúdo | Contagem/score em código | Variedade, repetição, proporção | ~0, ms | angle-variety, persona-carry, narrative-quality |
| Classificador ML | Modelo pequeno | Toxicidade, off-topic | baixo, 10-50ms | (não usado no 0.8) |
| LLM-as-judge | Rubrica + modelo | Semântica, tom, fidelidade, completude | alto, 100-3000ms | especialistas a montante — NUNCA dentro do interlock |
| Interlock (token + hook) | Assinatura verificável | Qualquer execução sem gate verde | ~0 | PreToolUse + token assinado |

**Quando regra basta**: a propriedade tem assinatura estável e compõe em parser
(estrutura, presença, formato, contagem). **Quando juiz é necessário**: a propriedade
é uma rubrica em linguagem natural (a locução soa natural? a expressão facial serve à
cena?). **Padrão híbrido do 0.8**: juízes (especialistas) rodam antes e caro;
gates rodam depois, baratos e bloqueantes. A abstenção é vocabulário útil: gate que
não tem base mecânica para vetar deve abstain-and-flag, não adivinhar.

## Como aplicar no fluxo 0.8

Com especialistas qualitativos a montante, a pergunta é: quais gates viram
redundantes? **Resposta da teoria: nenhum gate determinístico vira redundante por
existir julgamento LLM antes.** Especialista é controle administrativo (procedimento
que o modelo executa); gate é controle de engenharia (trava). A hierarquia de
controles manda usar os dois — engineering control + administrative control combinados
(CDC/OSHA). O especialista reduz a taxa de chegada de prompts ruins ao gate; não
substitui a trava, porque ele mesmo é probabilístico e sujeito a drift.

O que muda é a **classificação interna dos gates**:

1. **Insubstituíveis (núcleo mecânico, hard-block)**: prompt-structure, dp-quality
   (schema/estrutura), negative-prompt-discipline, locucao-idioma, product-closeup
   (presença/formato com assinatura estável), e o próprio interlock token+hook.
   São o piso determinístico — nada acima deles os cobre.
2. **Proxies semânticos (candidatos a rebalancear)**: narrative-quality,
   expressao-facial, persona-carry, angle-variety — na medida em que tentam medir
   qualidade semântica via heurística de código. Antes do 0.8 eram a única defesa
   dessas dimensões; agora o especialista julga a mesma dimensão com mais acuidade.
   Teoria aplicável: manter o **núcleo mecanicamente checável** como hard-block
   (ex.: contagem objetiva de ângulos repetidos) e mover a parte "proxy de qualidade"
   para warn/abstain com registro no dossiê — padrão gate-the-judge invertido: a regra
   abstém onde o julgamento já foi feito a montante, e o falso positivo não bloqueia.
3. **Gate novo natural**: validar mecanicamente que os **vereditos dos especialistas
   existem e estão bem-formados** no dossiê (contrato tipado: schema versionado do
   veredito, campos obrigatórios, enum de decisão). O gate não re-julga qualidade —
   verifica que o julgamento aconteceu e foi registrado. É a ponte entre as duas
   travas: julgamento sem registro estruturado não arma token.

Ordenação (fail-fast): schema/estrutura primeiro (sub-ms, pega o grosso), presença/
regex depois, heurísticas de conteúdo por último; curto-circuito na primeira falha
hard. E higiene: cada gate com orçamento de falso positivo declarado e condição de
aposentadoria — sem isso, gates acumulam e geram fatigue/bypass.

Sobre o interlock em si: amarrar o token ao **hash do conteúdo do prompt aprovado**
(não só ao fato de os gates terem rodado), para que edição pós-gate invalide o token;
e auditar caminhos alternativos até a geração (subagentes, chamadas via Bash/script
direto à API) — os limites documentados de PreToolUse (fail-open silencioso, bypass
por caminho não nominal) são exatamente os furos que um interlock de engenharia não
pode ter.

## Mudanças sugeridas ao fluxo 0.8

1. **Não remover nenhum gate** — reclassificar: núcleo mecânico (hard-block) vs proxy
   semântico (warn/abstain + registro no dossiê), gate a gate.
2. **Gate novo: contrato de veredito** — schema versionado para o output de cada
   especialista; gate valida presença + estrutura do veredito antes de armar token.
3. **Token amarrado a hash do prompt** — token assinado inclui hash do conteúdo
   aprovado; qualquer mutação pós-gate invalida.
4. **Auditoria de caminhos de bypass** — interlock deve cobrir geração via subagente e
   via chamada direta (Bash/script), não só a tool nominal do MCP.
5. **Higiene de gate** — declarar por gate: classe de falha, orçamento de falso
   positivo, condição de aposentadoria; revisar quando especialista a montante zerar a
   taxa de disparo de um proxy semântico.
6. **Regra de ouro mantida e explicitada**: nenhum LLM-judge inline no interlock;
   julgamento roda antes (especialistas) ou async (auditoria) — nunca como gate
   bloqueante.

## Fontes (URLs completas)

- https://futureagi.com/blog/deterministic-vs-llm-judge-evals-2026/ — Deterministic vs LLM-Judge Evals: 2026 Guide (Future AGI)
- https://aidefense.dev/posts/choosing-runtime-guardrails-for-llm-apps/ — Choosing Runtime Guardrails for LLM Apps: A Decision Framework
- https://ai-tldr.dev/learn/production-llmops/guardrails-reliability/what-are-llm-guardrails/ — What Are LLM Guardrails? (AI/TLDR)
- https://www.alexcloudstar.com/blog/ai-guardrails-output-validation-2026/ — AI Guardrails And Output Validation 2026 (Alex Cloudstar)
- https://coverge.ai/blog/llm-guardrails — LLM guardrails: a practical guide (Coverge)
- https://qaskills.sh/blog/llm-guardrails-testing-guide-2026 — LLM Guardrails Testing in 2026 (QASkills)
- https://dev.to/alex_spinov/your-llm-judge-costs-more-than-the-agent-gate-it-in-40-lines-cc7 — Gate the LLM judge in 40 lines
- https://brightlume.ai/blog/deterministic-layers-non-deterministic-ai-hybrid-architecture — Deterministic Layers Around Non-Deterministic AI
- https://beyond.minimumcd.org/docs/reference/pipeline-reference-architecture/ — Pipeline Reference Architecture (MinimumCD)
- https://cicd.ariefw.com/articles/10-6-where-to-put-quality-gates-in-your-pipeline-matters-more-than-what-you-scan/ — Optimal Placement of Quality Gates
- https://botneve.com/devops-practices/ci-cd-deployment-gate-design/ — CI/CD Deployment Gate Design (botneve)
- https://assrt.ai/t/shift-left-testing-quality-gates-pipeline — Shift-Left Testing: Quality Gates (Assrt)
- https://www.machinedesign.com/learning-resources/basics-of-design/article/21831836/engineering-basics-why-interlock-guards-trump-lockout-tagout — Why Interlock Guards Trump Lockout/Tagout (Machine Design)
- https://www.warrenforensics.com/wp-content/uploads/2018/11/Can-an-Interlocked-Guard-take-the-Place-of-LockOutTagOut.pdf — Interlocked Guard vs LOTO (Warren Forensics)
- https://www.cdc.gov/niosh/hierarchy-of-controls/about/index.html — Hierarchy of Controls (NIOSH/CDC)
- https://www.osha.gov/sites/default/files/Hierarchy_of_Controls_02.01.23_form_508_2.pdf — Hierarchy of Controls (OSHA)
- https://www.assp.org/docs/default-source/psj-articles/f1garrahan_0820.pdf — Lockout/Tagout como controle administrativo (ASSP, PL d 114 anos)
- https://code.claude.com/docs/en/hooks.md — Hooks reference (Claude Code)
- https://blakecrosley.com/blog/claude-code-hooks-explained — Claude Code Hooks: The Deterministic Layer
- https://github.com/anthropics/claude-code/issues/45427 — RFC: Deterministic tool gate — hooks necessary but insufficient
- https://agentpatterns.ai/instructions/enforcing-agent-behavior-with-hooks/ — Enforcing Agent Behavior with Hooks (AgentPatterns)
- https://tianpan.co/blog/2026-04-15-semantic-validation-llm-outputs — The Semantic Validation Layer
- https://collinwilkins.com/articles/structured-output — LLM Structured Outputs: Schema Validation for Real Pipelines
- https://balacode.io/blog/schema-registry-pattern-llm-output-contracts — The Schema Registry Pattern for LLM Output Contracts
- https://geodocs.dev/ai-agents/agent-output-validation-spec — Agent Output Validation Specification (Geodocs)
