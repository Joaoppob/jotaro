# Plano de implementacao: metodologia projeto dentro de projeto

> Registrado em 2026-07-03.
> Este plano traduz `RAG/metodologia-projeto-dentro-de-projeto.md` para um contrato de
> implementacao no sistema Jotaro 0.8. Ele ainda nao aplica mudancas em schemas, agentes ou
> gates; define a ordem segura para fazer isso sem quebrar a cadeia atual.

> **Adendo (2026-07-03, pos-implementacao):** o campo ficou `cena_id` em todo lugar
> (`scenes[].cena_id`, `shots[].cena_id`, `scene_audits[].cena_id`), nao `scene_id` como este
> plano recomendava na secao "Open questions" abaixo — para manter consistencia PT-BR com o
> resto do projeto (identico ao `cena_id` que ja existia dentro de `cena_brief`). As menções a
> `scene_id` abaixo são o registro histórico da decisão original; o schema/codigo real usa
> `cena_id`.

## Objetivo

Fazer o Jotaro 0.8 tratar cada geracao como um **projeto mae** e cada cena como um **projeto
filho**.

Hoje o sistema ja possui `project-brief.json` no nivel da geracao e `storyboard.cenas[]` /
`prompt-manifest.shots[]` no nivel tecnico. O que falta e um contrato intermediario por cena:
cada cena precisa ter objetivo, mensagem, metodo de comunicacao, execucao tecnica, arco proprio
e teste vampiro.

Depois da implementacao, os especialistas devem auditar:

- a coerencia do projeto inteiro;
- a coerencia de cada cena isolada;
- a relacao entre cenas;
- a fidelidade da execucao tecnica ao metodo criativo escolhido.

## Estado atual

### Contratos existentes

- `schemas/project-brief.schema.json` descreve o projeto mae, mas ainda nao tem
  `metodo_comunicacao`.
- `schemas/storyboard.schema.json` tem `cenas[]` flat, sem `cena_brief`.
- `schemas/prompt-manifest.schema.json` tem `shots[]` flat, sem `scene_id` ou `scenes[]`.
- `schemas/specialist-review.schema.json` descreve uma review por etapa da cadeia, nao uma review
  por cena.

### Cadeia existente

Os especialistas rodam em ordem fixa:

1. `historia`
2. `mundo`
3. `enredo`
4. `camera`
5. `montagem`
6. `realismo`
7. `audio`

Os arquivos persistidos seguem o padrao atual:

- `04-historia.json`
- `05-mundo.json`
- `06-enredo.json`
- `07-camera.json`
- `08-montagem.json`
- `09-realismo.json`
- `10-audio.json`

Esse padrao deve ser preservado na primeira implementacao. Nao criar reviews por cena como
arquivos separados nesta etapa.

## Principios de implementacao

1. **Mudanca aditiva primeiro.**
   Campos novos entram como opcionais antes de virarem obrigatorios. Isso evita quebrar exemplos,
   gates e fixtures enquanto os agentes ainda nao foram migrados.

2. **Cena e projeto, nao fragmento tecnico.**
   O novo objeto por cena nao deve ser apenas camera/luz/duracao. Ele precisa responder as mesmas
   seis perguntas da geracao, em escala menor.

3. **Metodo e diferente de execucao.**
   `metodo_comunicacao` e a estrategia criativa/estrutural. `como_comunica` deve ficar reservado
   para execucao tecnica: camera, montagem, realismo, audio e performance.

4. **Manter a cadeia sequencial.**
   O sistema nao precisa virar uma matriz `cena x especialista` em arquivos. A review continua por
   especialista, mas cada especialista passa a poder declarar auditorias internas por cena.

5. **Gate bloqueante so depois da migracao.**
   O teste vampiro por cena pode nascer como warning e virar bloqueante quando schemas, agentes,
   exemplos e manifestos estiverem alinhados.

## Capability

Depois de implementado, Jotaro 0.8 tera a capacidade de:

- gerar um brief do projeto mae com objetivo, mensagem, metodo, execucao e restricoes;
- gerar um brief para cada cena, com a mesma anatomia do projeto mae;
- preservar a estrutura solicitada pelo usuario quando existir `estrutura_solicitada`;
- auditar se cada cena sobrevive sozinha;
- rastrear quais shots pertencem a qual cena;
- bloquear manifestos finais que tenham cenas sem objetivo, mensagem, metodo ou arco proprio.

## Fase 1: schemas, exemplos e templates

### 1. Atualizar `project-brief.schema.json`

Adicionar ao projeto mae:

```json
"metodo_comunicacao": { "type": "string", "minLength": 10 }
```

Recomendacao inicial:

- adicionar como opcional;
- atualizar descricao de `como_comunica` para deixar claro que e execucao tecnica;
- depois de atualizar agentes e exemplos, promover `metodo_comunicacao` para `required`.

Arquivos relacionados:

- `schemas/project-brief.schema.json`
- `templates/project-brief.template.json`
- `examples/project-brief/valid-awareness.json`
- `.claude/agents/objetivo-do-projeto.md`

### 2. Criar `cena-brief.schema.json`

Novo contrato recomendado:

```json
{
  "cena_id": "cena-1",
  "objetivo": "estabelecer pressao social",
  "o_que_comunica": "todo mundo exige mais de voce",
  "metodo_comunicacao": "repeticao escalando",
  "como_comunica": "zoom em bocas, corte seco, sem pausa",
  "arco": {
    "inicio": "primeira exigencia",
    "meio": "segunda exigencia intensifica",
    "fim": "terceira voz fecha a pressao"
  },
  "sobrevive_sozinha": true,
  "motivo_teste_vampiro": "Mesmo isolada, a cena comunica pressao externa crescente."
}
```

Campos propostos:

- `cena_id`
- `objetivo`
- `o_que_comunica`
- `metodo_comunicacao`
- `como_comunica`
- `arco.inicio`
- `arco.meio`
- `arco.fim`
- `sobrevive_sozinha`
- `motivo_teste_vampiro`

Decisao recomendada:

- usar enum proprio para `objetivo` de cena somente em fase posterior;
- comecar como string, porque objetivos de cena nao sao iguais aos objetivos de campanha.

### 3. Atualizar `storyboard.schema.json`

Adicionar `cenas[].cena_brief` como opcional:

```json
"cena_brief": {
  "$ref": "./cena-brief.schema.json"
}
```

Se o validador local nao suportar `$ref`, duplicar o shape minimo dentro de
`storyboard.schema.json` ou criar validacao custom em `verify.cjs`.

Regra:

- cada `cena_brief.cena_id` deve bater com a cena;
- `cena_brief` vira obrigatorio so depois de migrar exemplos e agentes.

### 4. Atualizar `prompt-manifest.schema.json`

Adicionar camada de rastreabilidade sem quebrar `shots[]`:

```json
"scenes": [
  {
    "id": "cena-1",
    "time": "0-5s",
    "beat": "hook",
    "cena_brief": {},
    "shot_ids": [1, 2, 3]
  }
]
```

Adicionar em cada shot:

```json
"scene_id": { "type": "string", "minLength": 1 }
```

Recomendacao:

- `scenes[]` opcional na primeira fase;
- `shots[].scene_id` opcional na primeira fase;
- gate mecanico valida consistencia quando ambos existirem;
- depois da migracao, ambos podem virar obrigatorios.

## Fase 2: agentes

### `objetivo-do-projeto`

Responsabilidade nova:

- preencher `metodo_comunicacao` do projeto mae;
- preservar `estrutura_solicitada` quando existir;
- separar estrategia criativa de execucao tecnica.

Nao deve:

- criar `cena_brief`, porque as cenas ainda nao foram fixadas.

### `storyboard-director`

Responsabilidade nova:

- fixar `cenas[]`;
- para cada cena, gerar `cena_brief`;
- responder as seis perguntas por cena;
- manter `estrutura_solicitada` como prioridade quando o usuario ja trouxe roteiro/cenas.

Contrato novo por cena:

1. Qual o objetivo da cena?
2. O que ela comunica?
3. Qual o metodo de comunicacao?
4. Como ela comunica tecnicamente?
5. Qual o arco comeco-meio-fim?
6. Ela sobrevive sozinha?

### `historia`

Responsabilidade nova:

- rodar teste vampiro por cena;
- apontar cena que depende demais do contexto externo;
- marcar risco alto quando uma cena nao comunica nada completa isoladamente.

### `enredo`

Responsabilidade nova:

- auditar arco interno de cada cena;
- auditar progressao entre cenas;
- verificar se a sequencia mae nao esta sustentada por cenas fracas individualmente.

### `camera`, `montagem`, `realismo`, `audio`

Responsabilidade nova:

- auditar se a execucao tecnica realiza o `metodo_comunicacao` da cena;
- nao trocar o metodo sem devolver para `historia`/`enredo`;
- registrar alteracoes por cena em `scene_audits[]`.

### `prompt-smith`

Responsabilidade nova:

- carregar `cena_brief` para o manifesto final;
- preencher `scenes[]`;
- preencher `shots[].scene_id`;
- manter `shots[]` flat para compatibilidade com gates existentes.

## Fase 3: specialist reviews e gates

### 1. Expandir `specialist-review.schema.json`

Adicionar campo opcional:

```json
"scene_audits": [
  {
    "scene_id": "cena-1",
    "ok": true,
    "motivo": "A cena tem objetivo, mensagem, metodo e arco proprio.",
    "campos_alterados": [],
    "riscos": []
  }
]
```

Manter o envelope atual:

- `stage`
- `generation_id`
- `ok`
- `motivo`
- `draft_revisado`
- `campos_alterados`
- `riscos`
- `handoff`

Isso preserva a cadeia existente e permite auditoria por cena sem multiplicar arquivos.

### 2. Criar gate `scene-brief-required`

Arquivo sugerido:

- `scripts/lib/scene-brief-required.cjs`

Responsabilidades:

- validar que cada cena tem `cena_brief`;
- validar que cada `cena_brief` responde as seis perguntas;
- validar que `sobrevive_sozinha` existe;
- validar que `motivo_teste_vampiro` nao esta vazio;
- validar que `shots[].scene_id` aponta para uma cena existente;
- validar que `scenes[].shot_ids` apontam para shots existentes.

Modo de rollout:

1. fase inicial: warning;
2. depois de migrar fixtures/agentes: blocking.

### 3. Integrar ao preflight

Arquivo sugerido:

- `scripts/preflight-gate-0.8.cjs`

Ordem recomendada:

1. `specialist-signoff`
2. `prompt-manifest-required`
3. `scene-brief-required`
4. gates tecnicos existentes

## Fase 4: testes e verificacao

Atualizar `scripts/verify.cjs` com testes para:

- `project-brief.schema.json` aceita `metodo_comunicacao`;
- exemplo de project brief atualizado valida;
- `storyboard.schema.json` aceita `cena_brief`;
- exemplo de storyboard com tres cenas filhas valida;
- `prompt-manifest.schema.json` aceita `scenes[]` e `shots[].scene_id`;
- gate `scene-brief-required` aceita manifesto coerente;
- gate `scene-brief-required` rejeita cena sem metodo;
- gate `scene-brief-required` rejeita cena sem teste vampiro;
- gate `scene-brief-required` rejeita `shot.scene_id` sem cena correspondente;
- `specialist-review.schema.json` aceita `scene_audits[]`.

Comando de verificacao:

```bash
npm test
```

ou:

```bash
node scripts/verify.cjs
```

## Fase 5: documentacao operacional

Atualizar:

- `CLAUDE.md`
- `README.md`
- `plano-jotaro-0.8.md`, se continuar sendo o plano vivo da versao
- `RAG/metodologia-projeto-dentro-de-projeto.md`, apenas se alguma decisao conceitual mudar

Mudancas esperadas em `CLAUDE.md`:

- declarar a metodologia como contrato operacional, nao apenas referencia;
- atualizar a tabela de artefatos;
- atualizar o Portao -1 para apresentar projeto mae + cenas filhas;
- explicar que especialistas auditam o todo e as cenas.

## Rollout recomendado

### PR 1: contratos aditivos

Escopo:

- `project-brief.schema.json`
- `cena-brief.schema.json`
- `storyboard.schema.json`
- exemplos/templates
- testes de schema em `verify.cjs`

Risco:

- baixo, se todos os campos novos forem opcionais.

### PR 2: agentes

Escopo:

- `objetivo-do-projeto`
- `storyboard-director`
- `historia`
- `enredo`
- especialistas tecnicos
- `prompt-smith`

Risco:

- medio, porque muda comportamento da cadeia.

### PR 3: manifest e gate

Escopo:

- `prompt-manifest.schema.json`
- `scene-brief-required.cjs`
- integracao no preflight
- testes de falha/sucesso

Risco:

- medio. Comecar como warning.

### PR 4: obrigatoriedade

Escopo:

- promover `metodo_comunicacao` para required;
- promover `cena_brief`, `scenes[]` e `shots[].scene_id` para required;
- tornar teste vampiro por cena bloqueante.

Risco:

- alto se exemplos reais antigos ainda existirem sem migracao.

## Nao objetivos

Esta implementacao nao deve:

- mudar a ordem dos especialistas;
- criar arquivos separados por cena dentro de `specialist-reviews/`;
- remover `estrutura_solicitada`;
- alterar render/Higgsfield;
- hand-editar artefatos gerados por RBAC;
- transformar `shots[]` em estrutura aninhada obrigatoria antes dos gates serem atualizados.

## Questoes em aberto

1. O campo por cena deve se chamar `cena_brief` ou `scene_brief`?
   - Recomendacao: `cena_brief` em `storyboard`, porque o contrato ja usa `cenas[]`.
   - Recomendacao: `scene_id` em `prompt-manifest`, porque o contrato ja usa `shots[]`.

2. `objetivo` de cena deve ter enum?
   - Recomendacao: string no primeiro PR.
   - Enum proprio pode vir depois, quando houver exemplos suficientes.

3. O teste vampiro por cena deve nascer bloqueante?
   - Recomendacao: warning no primeiro rollout, blocking depois da migracao dos exemplos.

4. O validador local suporta `$ref` suficiente para `cena-brief.schema.json`?
   - Se nao suportar, usar shape inline no `storyboard.schema.json` e teste custom em
     `verify.cjs`.

## Criterio de pronto

A metodologia estara implementada quando:

- todo `project-brief` tiver `metodo_comunicacao`;
- todo storyboard tiver `cena_brief` por cena;
- todo prompt manifest tiver `scenes[]` e `shots[].scene_id`;
- todo especialista puder registrar `scene_audits[]`;
- o gate `scene-brief-required` impedir cenas sem objetivo, mensagem, metodo, arco ou teste
  vampiro;
- `npm test` passar;
- `CLAUDE.md` descrever a metodologia como parte operacional do fluxo 0.8.
