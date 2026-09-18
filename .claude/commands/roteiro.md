---
description: Inicia a intake guiada do roteiro — coleta as lacunas pendentes antes de qualquer geração, sem gastar crédito.
---

# /roteiro

Use quando a pessoa quer começar uma criação, pede um roteiro/storyboard, ou descreve um post
que quer produzir. A entrada pode ser um **brief simples** (curto, informal — ex.: "quero uma
cena da Duda na academia comendo a fitbar, estilo TikTok com cortes") **ou um roteiro completo
já pronto** (cenas cronometradas, falas, música — ver "Roteiro completo colado" abaixo); é dessa
semente que a Fase 1 parte. Esta é a **porta de entrada** do gerador: a intake guiada que
precede tudo. **Nada gera aqui** — é só a coleta estruturada do que o sistema precisa saber
antes de spawnar qualquer folha ou gastar crédito. O fluxo termina no **manifesto final**
(`prompt-manifest.yaml`), depois do Portão -1 e da aprovação humana (ver `/explica-fluxo`).

A intake é guiada por estado em disco (`projects/<nome>/generations/<id>/.intake-state.json`),
então você pergunta **só as lacunas pendentes** e **nunca reperginta** o que já foi respondido —
mesmo numa conversa longa ou se a pessoa pausar e voltar depois.

## O que fazer

### 1. Descubra o projeto ativo

Se ainda não sabe pra qual projeto a pessoa vai trabalhar, pergunte (ou liste `ls projects/`
e ofereça o demo example-brand). A partir daqui, `<nome>` é esse projeto e todo comando usa
`--root projects/<nome>`.

Em seguida, crie o `generation_id` desta rodada — é o `<id>` que identifica esta geração do
início ao fim (intake → especialistas → manifesto → produção), e o mesmo `<id>` usado em
`--generation <id>` em todo comando de `intake-state.cjs` daqui pra frente:

```bash
node scripts/lib/generation-paths.cjs create --root projects/<nome> --slug <slug-curto-do-pedido>
```

Devolve `{ generation_id, ... }` e já cria a árvore `generations/<id>/{specialist-reviews,
prompt, gates, approval, production/outputs, critique}/`. Guarde o `generation_id` — sem ele, a
intake grava em `output/.intake-state.json` (path legado, sem isolamento por geração).

### Passo 0. Varra o material do projeto ANTES de perguntar

Antes de perguntar qualquer lacuna, leia o que o projeto já tem no `RAG/`. Perguntar no escuro,
com 50 roteiros e três personas prontas no disco, é o que faz a intake parecer cega. Aqui você
surfa o que existe e propõe, depois cobre só o que o material não respondeu.

Primeiro, detecte a biblioteca de personagem e o modo visual direto do disco:

```bash
node scripts/intake-state.cjs detect --root projects/<nome>
```

O `detect` devolve `{ existe, personagens, tem_personagem, tem_marca, plano_tem_imagem,
modo_visual }`. Use isso para não perguntar o que o disco já responde:

- `personagens` não vazio: o projeto já tem biblioteca de personagem. Não pergunte "tem
  personagem?"; você já sabe quem são. `tem_personagem` vem `true` e `modo_visual` vem
  `biblioteca` nesse caso.
- `personagens` vazio e `modo_visual: "geracao"`: projeto sem biblioteca, cada cena será gerada.

Depois, leia o resto do material do projeto com Glob/Grep/Read:

- roteiros já escritos (`projects/<nome>/RAG/**/*roteiro*`, `*.md` de roteiro);
- dossiês ou notas de persona;
- a narrativa e a marca (`RAG/marca.md`, `RAG/narrativa.md`).

Com isso em mãos, **surfe e proponha** em vez de perguntar do zero. Por exemplo: "Você já tem
50 roteiros prontos aqui e três personas na biblioteca: Nina, Lea e Duda. Quero te
sugerir os três ganchos mais fortes que vi, ou você já tem um em mente?". A pessoa escolhe entre
o que você propôs e o que ela trouxe; nos dois casos a intake anda mais rápido e mais ancorada.

**Curadoria, não catálogo neutro.** Ao surfar roteiros de um banco salvo (ex.: `roteiros-base-50`),
não liste tudo com o mesmo peso. Aplique a mesma régua do gancho (`RAG/prompts/hooks-de-
movimento.md`): destaque os que já têm ação física + fala fortes na abertura; para os que abrem
estáticos ou sem vida (ex.: "grava um close de mãos" sem ação nem fala nenhuma) — não os empurre
como se fossem igualmente bons. Ou proponha a versão com gancho ajustado, ou diga com franqueza
que a abertura está fraca e sugira um ângulo melhor. Um "leque completo" apresentado sem filtro
não é ajuda — é jogar a decisão de qualidade de volta pro usuário.

Só depois desse passo você vai às lacunas. As perguntas continuam valendo, mas só para o que o
material de fato não responde.

### 2. Leia o estado da intake

```bash
node scripts/intake-state.cjs status --root projects/<nome> --generation <id>
```

O script devolve o estado e, dentro dele, `lacunas_pendentes` — a lista de campos
obrigatórios ainda em aberto. Os campos obrigatórios (bloqueiam o avanço) são:

- `projeto` — qual marca/projeto vamos atender.
- `plataforma` — onde o post vai (`instagram`, `tiktok`, `facebook`, `youtube`, `reels`).
- `objetivo_post` — o que a marca quer comunicar com esse post.
- `tipo_conteudo` — produto, serviço, personagem, depoimento, tendência.

Campos opcionais (você coleta se a pessoa tiver, mas não bloqueiam): `tem_roteiro`,
`referencias_usuario`, `estrutura_solicitada`.

**`estrutura_solicitada` — capture assim que aparecer, não espere perguntar.** Se a pessoa já
descreveu um fluxo de cenas literal na própria mensagem (ex.: "quero que seja rotina -> ela fala
sobre a situação -> come e mostra o produto"), grave isso **verbatim** em `estrutura_solicitada`
antes mesmo de entrar nas lacunas obrigatórias:

```bash
node scripts/intake-state.cjs update --root projects/<nome> --generation <id> --campo estrutura_solicitada --valor "<o que a pessoa descreveu, literal>"
```

**Roteiro completo colado — mesmo campo, mesma prioridade, sem resumir.** Se a pessoa colar um
roteiro de diretor pronto (cenas cronometradas do tipo "Cena 1: 0-5s: ...", falas atribuídas,
indicação de música por cena, world-building de abertura), isso também vai em
`estrutura_solicitada` — **verbatim, sem resumir nem reescrever**. Um roteiro completo é a forma
mais forte de `estrutura_solicitada` que existe: quanto mais detalhado o que a pessoa já
escreveu, menos você e os especialistas precisam inventar. Não pergunte as lacunas obrigatórias
uma a uma se o roteiro já responde (ex.: `tipo_conteudo` costuma estar implícito no tema) —
extraia o que der do roteiro colado e pergunte só o que sobrar.

Esse campo, quando preenchido, **vira a fonte de verdade da ordem/conteúdo de cenas** para o
`objetivo-do-projeto`, o `storyboard-director` e os 7 especialistas da Fase 2 (`historia`,
`mundo`, `enredo`, `camera`, `montagem`, `realismo`, `audio`) — eles encaixam a estrutura pedida
em vez de decidir pelo molde padrão deles (hook-first, world-building genérico, PAS/AIDA/Hero).
Já aconteceu de o pipeline reinterpretar livremente uma estrutura que o usuário tinha deixado
clara (abertura de tensão no lugar de ação de rotina, fala tratada como acessório) — este campo
existe pra isso não se repetir. Isso vale mais ainda pra roteiro completo: se `historia` reprovar
uma abertura porque parece "estabelecimento neutro" sem perceber que o roteiro pediu exatamente
isso, é regressão, não gate funcionando.

Os campos `tem_personagem`, `personagens` e `modo_visual` não se perguntam: eles vêm do disco,
detectados no passo 0 (`detect`) e persistidos pelo `status`. Se a biblioteca de personagem
responde, não pergunte.

### 3. Pergunte só as lacunas pendentes — uma de cada vez

Para cada item em `lacunas_pendentes`, faça **uma** pergunta no seu tom proativo e acolhedor.
Não despeje as 4 de uma vez como formulário; conduza uma a uma, comemorando o progresso.
A cada resposta, grave o campo na hora:

```bash
node scripts/intake-state.cjs update --root projects/<nome> --generation <id> --campo <campo> --valor "<resposta>"
```

Depois de cada `update`, releia o `lacunas_pendentes` retornado e siga pra próxima lacuna.
Se a pessoa já respondeu algo de passagem (ex.: disse a plataforma sem você perguntar),
grave esse campo também e pule a pergunta correspondente — nunca reperginte o já coletado.

### 4. Ao completar (lacunas vazias) — resumo e confirmação

Quando `lacunas_pendentes` ficar vazio (`status: "completo"`), **pare** e mostre um resumo
claro do que coletou:

> Beleza, então é isso:
> • Projeto: **<projeto>**
> • Plataforma: **<plataforma>**
> • Objetivo: **<objetivo_post>**
> • Tipo de conteúdo: **<tipo_conteudo>**
> (+ os opcionais que a pessoa tiver dado)

Pergunte se está tudo certo antes de seguir: "Confirma que é isso? Posso ajustar qualquer
ponto antes da gente avançar." Deixe claro, com leveza, que **a partir daqui é que entra a
construção do roteiro** (próxima fase) e que **nada foi gerado nem cobrado** até agora.

## Regras

- **Nada gera nesta fase.** A intake só coleta e persiste. Geração de imagem/vídeo continua
  atrás de preflight, confirmação de custo e das aprovações humanas das fases seguintes.
- **Estado é a fonte da verdade**, não a memória da conversa. Sempre leia o `status` antes de
  perguntar, e sempre grave com `update` depois de cada resposta.
- **Não reperginte.** Se um campo já tem valor no estado, ele não está em `lacunas_pendentes`
  — então não pergunte de novo.
- Para recomeçar do zero (a pessoa quer trocar tudo): `node scripts/intake-state.cjs reset
  --root projects/<nome> --generation <id>`.

## Fecho: objetivo do projeto, rascunho e Portão -1

Com a intake confirmada, o **primeiro** passo de construção é o **objetivo do projeto**. Spawne
o `rag` (identidade) e, em seguida, o `objetivo-do-projeto`, passando
`{ identidade, intake, project_id, generation_id, pesquisa_estruturada? }` — se `intake` trouxer
`estrutura_solicitada` preenchida (fluxo curto ou roteiro completo colado), ela é a fonte de
verdade da proposição e das cenas, não um dado a normalizar pelos moldes padrão. Ele devolve o
**`project-brief.json`** (`schemas/project-brief.schema.json`): proposição central única, o que
comunica, como comunica, métrica e público.

Em seguida spawne o `storyboard-director` (papel 0.8) com `{ project_brief, identidade,
plataforma }` — ele fixa o **rascunho inicial**: a decupagem de cenas que a cadeia de
especialistas vai auditar. Se `estrutura_solicitada` tiver um roteiro completo, o rascunho segue
literalmente a ordem, o timing e as falas dele — cada "Cena N: X-Ys" do roteiro vira um ou mais
shots do rascunho, sem reinterpretar.

Traduza isso numa frase curta e direta e peça o **Portão -1** — "entendido! pra essa cena, a
gente faz [ação central] — pra [mensagem/público]. Fecha?". **Sem esse "sim", você não spawna
`historia` nem começa a cadeia de 7 especialistas.** Se a pessoa pedir ajuste, devolva ao
`objetivo-do-projeto`/rascunho com o feedback e reapresente. Só depois do Portão -1 a Fase 2
(especialistas) começa — ver `.claude/commands/explica-fluxo.md` pro fluxo completo.

## Como responder

- Enquanto houver lacunas: faça a próxima pergunta, com energia, e ofereça guiar.
- Ao completar: mostre o resumo, peça confirmação, e siga para o `objetivo-do-projeto` e o
  rascunho inicial — o Portão -1 é o próximo checkpoint depois disso.
