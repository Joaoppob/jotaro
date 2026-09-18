# Etapa 13 — Aprovação humana única: base teórica

> Pesquisa web, 2026-07-03. Etapa 13 do fluxo Jotaro 0.8: depois dos
> especialistas e dos gates mecânicos, o humano aprova ou pede ajuste antes de
> qualquer chamada de produção MCP.

## O que é e por que existe

A aprovação humana única é o ponto em que Jotaro para de raciocinar e pede decisão.
Ela não substitui os agentes especialistas nem os gates mecânicos. Ela existe por
outro motivo: **responsabilidade criativa e risco de execução**.

O fluxo 0.8 muda de três aprovações intermediárias para uma aprovação final porque a
arquitetura agora é sequencial e especializada. Se o humano aprovar no meio, antes de
câmera, montagem, realismo e áudio, a aprovação fica obsoleta minutos depois. Faz mais
sentido aprovar:

1. `project-brief`
2. prompt final
3. manifesto de geração
4. vereditos dos especialistas
5. resultado dos gates

Só então a produção pode gastar créditos, chamar MCPs ou gerar artefatos.

## Base teórica

### 1. Human-in-the-loop é controle de decisão, não decoração de processo

IBM define human-in-the-loop como participação humana ativa em operação, supervisão
ou decisão de um sistema automatizado para garantir precisão, segurança,
responsabilidade ou julgamento ético. StackAI descreve approval workflow como padrão
de runtime em que o agente precisa pedir e receber uma decisão antes de finalizar uma
saída de impacto.

Tradução para o Jotaro: a aprovação humana não deve ser um "olhar se ficou bonito".
Ela precisa ser uma decisão operacional com opções claras:

- **Aprovar**: autoriza produção.
- **Pedir ajuste direcionado**: volta para etapa específica.
- **Reabrir brief**: objetivo/proposição estavam errados.
- **Cancelar**: projeto não deve avançar.

Se a aprovação não muda o estado do pipeline, ela vira teatro.

### 2. Governança de IA pede accountability, monitoramento e ciclo de vida

NIST AI RMF organiza risco em funções de Govern, Map, Measure e Manage, e destaca
test, evaluation, verification and validation ao longo do ciclo de vida. ISO/IEC
42001 traz a mesma lógica para gestão: política, objetivos, risco, ciclo de vida,
monitoramento, avaliação de performance e melhoria contínua.

No 0.8, isso implica:

- A aprovação precisa deixar rastro: quem aprovou, quando, qual versão do prompt.
- O humano aprova uma versão imutável, não um texto que pode mudar depois.
- Produção MCP deve verificar o token de aprovação antes de executar.
- Ajustes pós-aprovação invalidam o token.

### 3. Marketing e vídeo gerativo precisam de julgamento de marca

Lemonlight e Knak, em contexto de produção de vídeo e marketing, convergem em um
ponto: IA gera opções em escala, mas humanos decidem estratégia, aderência de marca,
risco reputacional e qualidade final. Para o Jotaro, isso define o escopo da Etapa 13:

- O humano não revisa se cada especialista "fez seu trabalho"; os gates já verificam
  o mínimo.
- O humano decide se aquele prompt é a peça que a marca quer assinar.
- O humano pode aceitar imperfeição técnica se ela serve ao projeto.
- O humano pode rejeitar um prompt tecnicamente válido se a direção está errada.

### 4. Aprovação boa é informada, mas curta

Uma etapa de aprovação falha quando despeja todo o dossiê no usuário. A interface
deve mostrar apenas o que sustenta decisão:

- objetivo do projeto
- métrica primária
- proposição única
- prompt final
- resumo por etapa: ok/ajustado/risco
- gates: pass/fail
- mudanças desde a versão anterior

Isso preserva a capacidade de julgamento. A base teórica de HITL e governança aponta
para decisões rastreáveis e contextualizadas, não para revisão infinita.

## Opções que a aprovação deve oferecer

| Opção | Efeito no pipeline | Quando usar |
|---|---|---|
| Aprovar | Emite token de produção | Prompt está pronto para render |
| Ajustar história | Volta para etapa 4 | Mensagem emocional não passa |
| Ajustar mundo | Volta para etapa 5 | Ambiente parece genérico |
| Ajustar enredo | Volta para etapa 6 | Ação/cena não comunica |
| Ajustar câmera | Volta para etapa 7 | Plano ou formato não condiz |
| Ajustar montagem | Volta para etapa 8 | Ritmo/corte não serve ao objetivo |
| Ajustar realismo | Volta para etapa 9 | Está perfeito demais/IA demais |
| Ajustar áudio | Volta para etapa 10 | Voz, música ou silêncio não funcionam |
| Reforjar prompt | Volta para etapa 11 | Prompt está inchado ou ambíguo |
| Reabrir brief | Volta para etapa 2 | O objetivo estava errado |
| Cancelar | Fecha projeto sem produção | Projeto perdeu sentido |

## Critérios que o humano deve ver

### Decisão de marca

- Este prompt parece algo que a marca/personagem pode assinar?
- O tom está alinhado ao projeto?
- A peça evita promessa, risco ou exagero que a marca não sustentaria?

### Decisão de projeto

- O que comunica está claro?
- Como comunica está coerente?
- A métrica primária faz sentido para o formato?
- A primeira cena sustenta o objetivo?

### Decisão de produção

- Vale gastar créditos de render?
- Há algum risco óbvio de falha no modelo?
- O prompt está específico o bastante para a ferramenta escolhida?
- Se o resultado sair ruim, o diagnóstico será possível?

## Contrato de aprovação sugerido

```yaml
approval:
  project_id: ""
  generation_id: ""
  prompt_version: ""
  approved_by: ""
  approved_at: ""
  decision: "approved|revision_requested|brief_reopen|cancelled"
  revision_target: null
  notes: ""
  gates_snapshot_hash: ""
  prompt_hash: ""
  production_token: ""
```

## Perguntas de auditoria da etapa

1. O usuário está vendo a versão final exata que será enviada ao MCP?
2. O prompt tem hash antes da aprovação?
3. Qualquer alteração posterior invalida a aprovação?
4. A UI oferece revisão direcionada por etapa, não comentário solto?
5. O resumo dos especialistas cabe em uma tela?
6. Os gates aparecem como evidência, não como substituto de julgamento?
7. O humano sabe qual métrica primária este render busca?
8. O token de produção expira?
9. A aprovação fica registrada no ledger do projeto?
10. A produção MCP bloqueia sem esse token?

## Mudanças sugeridas ao fluxo 0.8

1. **Criar `approval-record.yaml`** por geração individual.
2. **Hash imutável do prompt final** antes de pedir aprovação.
3. **Token de produção curto e escopado**: válido apenas para `generation_id`,
   `prompt_hash` e ferramenta MCP autorizada.
4. **Ajuste direcionado por etapa** em vez de "voltar tudo".
5. **Resumo executivo de aprovação**: brief + prompt + vereditos + gates + diff.

## Direção em uma frase (chip)

**"A aprovação humana não revisa o processo; ela assume responsabilidade pela versão exata que vai renderizar."**

## Fontes (URLs completas)

- https://www.ibm.com/think/topics/human-in-the-loop — definição de human-in-the-loop e papel em precisão, segurança e accountability.
- https://www.stackai.com/insights/human-in-the-loop-ai-agents-how-to-design-approval-workflows-for-safe-and-scalable-automation — approval workflows para agentes.
- https://www.nist.gov/itl/ai-risk-management-framework — NIST AI RMF, gestão de risco de IA.
- https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf — AI RMF 1.0, TEVV e ciclo de vida.
- https://www.iso.org/artificial-intelligence/ai-management-systems — ISO/IEC 42001 e gestão de sistemas de IA.
- https://www.iso.org/home/insights-news/resources/iso-42001-explained-what-it-is.html — requisitos de ISO/IEC 42001.
- https://www.oecd.org/en/topics/sub-issues/ai-principles.html — princípios OECD atualizados para IA confiável.
- https://oecd.ai/en/ai-principles — visão geral dos princípios OECD.
- https://www.lemonlight.com/blog/human-in-the-loop-ai-video-production/ — HITL aplicado à produção de vídeo de marca.
- https://knak.com/blog/human-in-the-loop-examples/ — HITL aplicado a marketing e conteúdo brand-ready.
- https://productschool.com/blog/artificial-intelligence/human-in-the-loop-ai — oversight humano para confiabilidade e edge cases.
- https://www.mdpi.com/1099-4300/28/4/377 — revisão sistemática sobre configurações human-in/on/along-the-loop.

