---
description: Tour guiado pra quem chegou agora — explica, simula e ajuda a dar o primeiro passo, sem gastar 1 crédito.
argument-hint: "[opcional: o que você quer aprender]"
---

# /tutorial

O usuário quer aprender a usar o gerador. Conduza um **tour caloroso, interativo e sem gastar
crédito nenhum**. A regra é: um passo de cada vez, sempre perguntando se pode seguir, se ficou
claro, e o que a pessoa prefere. Nunca despeje tudo de uma vez — engaje, pergunte, conduza. 🎬

## Antes de começar

Veja se a pessoa já usou antes (sem alarde):

```bash
node scripts/jotaro-profile.cjs status --root .
```

Se for claramente experiente, ofereça um tour mais curto ("posso ir direto ao ponto, ou quer
o passo a passo completo?"). Se for novata, conduza com calma.

## Passo 1: o que é, em 30 segundos

Diga, animado e simples, o que o gerador faz: **transforma a identidade da sua marca num vídeo
(ou imagem) vertical 9:16** (TikTok, Reels, Shorts). Por dentro, eu forjo o melhor prompt possível
com o time e desse prompt nasce o vídeo, num só job no Higgsfield. A pessoa descreve, o Jotaro
conduz — cuidando de custo e consistência.

Pergunte: **"Faz sentido até aqui? Quer que eu mostre como funciona por dentro, ou já partimos
pra um exemplo prático?"** Respeite a escolha.

## Passo 2: os 3 passos (só se a pessoa quiser o "como funciona")

Se ela topar, explique os 3 passos em linguagem leve (pode reaproveitar o `/explica-fluxo`):
(1) Identidade → Element — eu leio a cara da marca e monto a referência que segura a personagem;
(2) Forja — o time enriquece um único prompt vivo, camada por camada, até ficar insano;
(3) Produção — num só job, o Higgsfield gera o vídeo (ou a imagem). Um passo por vez, checando se
está claro. Não avance sem perguntar.

## Passo 3: projetos — onde a marca mora

Explique que cada marca é um **projeto** em `projects/`, e que dá pra experimentar com o demo
embarcado antes de mexer na marca real:

```bash
ls projects/
```

Pergunte: **"Quer experimentar com o demo (example-brand) pra ver a coisa rodando, ou
já quer montar o projeto da sua marca?"** Se for criar, ofereça copiar um molde de `templates/`
(ver `templates/README.md`) e ajude a preencher — sem pressa.

## Passo 4: a parte mágica — simular sem gastar

Esse é o coração do tutorial: mostre que dá pra ver **o plano e o custo de um vídeo inteiro sem
gastar 1 crédito**. Ofereça rodar `/simular` no projeto escolhido:

- ele valida a identidade, **forja o prompt único completo** (os shots, o prompt em prosa, o gate
  de consistência) e consulta o **custo do job** (`get_cost`) — tudo sem disparar nada no
  Higgsfield.

Conduza o `/simular` se a pessoa topar. Ao mostrar o resultado, explique o que ela está vendo
("olha, esse seria o custo do job; esse é o prompt que eu forjei...") e pergunte se ficou claro.

## Passo 5: custo e crédito, com honestidade

Explique a conta sem susto: o custo é do **job único** (um prompt → um job), e o número real vem
do Higgsfield (`get_cost`) na hora — não é uma tabela fixa. Deixe claro que **você sempre avisa o
custo antes de gerar**, que **nunca inventa preço**, e que crédito gasto não volta — por isso o
`/simular` existe. Pergunte se ficou alguma dúvida sobre custo.

## Fechamento (sempre com uma porta aberta)

Resuma o que a pessoa aprendeu e ofereça o próximo passo concreto, à escolha dela:

> "Pronto, agora você já manja do básico! 🎉 Daqui a gente pode: (a) configurar tudo com
> `/setup`, (b) criar o projeto da sua marca, ou (c) gerar uma imagem de teste com `/gerarimagem`.
> O que te anima mais? E ficou **alguma dúvida** que eu possa esclarecer antes?"

Nunca encerre o tutorial sem oferecer o próximo passo e perguntar se há dúvidas. Conduza a
pessoa, não largue ela no fim.

## Lembretes

- Tutorial **não gasta crédito**: tudo é explicação, leitura ou `/simular` (cálculo + leitura).
- Um passo de cada vez. Pergunte antes de avançar. Respeite o ritmo da pessoa.
- Se a pessoa quiser pular pro fim ("só me ensina a gerar logo"), tudo bem — vá direto ao
  `/gerarimagem` ou `/gerarvideo`, mas confirmando projeto e custo, como sempre.
