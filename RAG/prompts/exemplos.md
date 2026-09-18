# Exemplos: como ler e adaptar o prompt-forge pronto

> Leitor primário: o agente `prompt-smith` e quem quiser entender como um reel se monta.
>
> **No 0.7 o produto é um `prompt` único, multishot, em prosa** — não uma shot-list gerada
> cena a cena e montada. A calibração canônica está em **`RAG/prompts/exemplos-prompt-forge.md`**
> (o ALVO OURO e o anti-padrão) e o exemplo válido completo em
> **`RAG/prompts/exemplo-prompt-forge-examplebrand.json`** (valida contra
> `schemas/prompt-forge.schema.json`, é o que o `verify` checa). Leia esses dois primeiro; este
> arquivo é o mapa de leitura.

## O que é o prompt-forge

O `prompt-forge.json` é o **prompt único** que o `prompt-smith` entrega e que vai num só job pro
Higgsfield. Ele tem:

- `formato` (`video` | `imagem` | `audio`) e `modelo` (`kling3_0` / `seedance_2_0` para vídeo,
  `nano_banana_2` para imagem);
- `element_id`: a referência que ancora a personagem no prompt como `<<<element_id>>>`;
- `prompt`: a **prosa multishot rica** que vai pro modelo — abertura de estilo, personagem
  ancorada no Element, as cenas como beats, e os blocos de direção (visual style, editing style,
  mood, camera direction, avoid, decupagem cronometrada);
- `shots[]`: a versão **estruturada** de cada beat (`tamanho_plano`, `angulo`,
  `movimento_camera`, `mood`, ...) que os gates de texto pré-crédito leem;
- `negative_prompt?`: curto e targeted (0-15 tokens), quando houver;
- `audio?`: locução/trilha, quando o formato pedir.

O contrato formal é `schemas/prompt-forge.schema.json`.

## Como ler `exemplo-prompt-forge-examplebrand.json`

É o exemplo **real e válido** do reel da Duda (FitBar): um prompt único multishot de ~12-15s,
três cenas como beats (treino → conversa → produto), com a personagem ancorada no Element. Repare:

- o campo `prompt` **não repete traços da Duda por cena** — ela entra uma vez ancorada no
  Element (`<<<element_id>>>`), e o texto fica livre para dirigir;
- as três cenas são **parágrafos/beats** dentro do mesmo prompt, não três jobs;
- há blocos nomeados de **visual style, editing style, mood, camera direction e avoid**, mais uma
  **decupagem cronometrada** (0-4 / 4-8 / 8-12) que casa com a estrutura;
- `shots[]` codifica cada beat de forma estruturada (variedade de plano e ângulo — o gate
  `angle-variety.cjs` cobra que os beats não sejam todos iguais).

O passo a passo de por que esse prompt "funciona" (e o anti-padrão de plano único travado que
NÃO produzir) está em `RAG/prompts/exemplos-prompt-forge.md`.

## Da semente ao alvo: o trabalho da forja

A forja **parte de um brief simples do usuário** (curto, informal, em PT-BR) e o enriquece camada
por camada — identidade → alma → roteiro → decupagem → ritmo de corte — até o `prompt-smith`
montar a prosa final no nível do ALVO OURO. Exemplo de entrada:

```
quero uma cena na academia da duda, comendo a fitbar em um momento da rotina, cena 1 ela
treinando, cena 2 conversando e cena 3 comendo a fitbar, estilo tiktok com cortes entre
elas, bem dinâmica, na rotina.
```

A distância entre essa semente e o ALVO (visual style nomeado, editing style, mood, camera
direction, avoid e decupagem cronometrada, com a Duda **ancorada no Element**) é o trabalho da
forja. O ALVO completo que sai dessa entrada está em `exemplos-prompt-forge.md` e no
`exemplo-prompt-forge-examplebrand.json`.

## Como adaptar para a sua marca

1. Troque as imagens em `identidade-visual/` pela sua identidade e gere o **Element** da
   personagem (o `rag` lê a marca de `marca.md`; o Element ancora a identidade no prompt).
2. Preserve a **função dramática** — gancho, construção, payoff, CTA limpo —, expressa como
   **beats dentro do prompt único**, não como contagem fixa de cenas. O arco cheio é a forma da
   história de personagem; marcas de produto/serviço condensam (3-4 beats). Ver "Decisão de arco"
   em `RAG/narrativa.md` e a seção 3 de `padroes-de-prompt.md`.
3. Troque o conteúdo dos beats (cenário, ação, produto) pela sua história, e deixe os blocos de
   direção (visual style, editing, mood, camera, avoid) refletirem a estética da marca.
4. O `prompt-smith` faz isso quando você pede um reel: recebe `{ identidade, intencao, element_id }`
   e o storyboard/ritmo aprovados, e monta o `prompt-forge.json`.

> **Nota sobre os exemplos-shotlist do repo.** Os arquivos `exemplo-shotlist-mago.json`,
> `exemplo-shotlist-produto.json` e `exemplo-shotlist-servico.json` permanecem no repo como
> **referência histórica de arco narrativo** (a sequência de funções dramáticas de um reel) e
> continuam validando contra `schemas/shotlist.schema.json`. Eles **não** são o contrato de
> produção do 0.7 — a produção lê o `prompt-forge.json`. Use-os para estudar a curva narrativa;
> use o `exemplo-prompt-forge-examplebrand.json` como o molde do que a forja entrega.
