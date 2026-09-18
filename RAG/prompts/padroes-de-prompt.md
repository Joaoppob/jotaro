# Padrões de prompt: o HUB

> Leitor primário: o agente `prompt-smith`. Este arquivo é o conhecimento técnico de como se
> escreve um prompt que rende consistência e riqueza. É genérico: serve para qualquer marca.
> O delta de cada marca (o SPOKE) vem do `rag`, lendo `RAG/marca.md` e `identidade-visual/`.
>
> **No 0.7 a forja produz um `prompt` único, multishot, em prosa** — não uma shot-list
> per-cena. As cenas viram **parágrafos/beats DENTRO do prompt único**. A identidade vem da
> **referência (o Element)** — a personagem entra ancorada como `<<<element_id>>>`, não descrita
> à força no texto. A calibração de nível (o ALVO OURO) está em
> `RAG/prompts/exemplos-prompt-forge.md`; este arquivo é o **conhecimento de prompt-craft** que
> alimenta aquele nível. O contrato de saída é `schemas/prompt-forge.schema.json`.

---

## 1. Anatomia de um bom prompt (Nano Banana Pro / Gemini / Kling / Seedance)

Estes modelos respondem melhor a **prosa descritiva estruturada** do que a listas de palavras
soltas. A ordem de leitura abaixo é o que rende consistência. Ela vale tanto para o **prompt
único** de vídeo multishot (as camadas descrevem o reel inteiro, e as cenas entram como beats)
quanto para uma imagem.

**Atualizacao nivel-100:** prompt e restricao, nao pedido. A rubrica
`RAG/review/rubrica-nivel-100.md` e o gate `scripts/lib/critique.cjs` penalizam quality-words
que costumam puxar look plastico/generico: `8K`, `ultra-realistic`, `photoreal`,
`masterpiece`, `best quality`, `cinematic` usado como adjetivo vazio e `supersaturated`.
Troque esses atalhos por fatos observaveis: fonte de luz, direcao, textura, paleta, composicao,
peso fisico, movimento de camera motivado — e a identidade **ancorada no Element**.

**Wave D / passe DP:** antes de credito, `scripts/lib/dp-quality.cjs` valida se cada shot do
`prompt-forge.json` nasceu de um style block verificavel. Cada shot precisa preservar no campo
`cinematografia` e no texto do `prompt`: luz motivada (fonte + direcao + contraste/Kelvin),
composicao 9:16 com safe-zone central (Y=220-1440 / middle 60%, topo/base limpos), um movimento
de camera por shot, cor/grading nomeado e anti-IA concreto. Sem isso, volte ao prompt-smith.

As **camadas canônicas do prompt** (as 7 que o `scripts/lib/prompt-structure.cjs` cobra, com
subject, composition e lighting obrigatórias):

| # | Camada | O que entra | Exemplo |
|---|--------|-------------|---------|
| 1 | Estilo / medium | abre definindo o mundo visual | `Vertical TikTok-style video, 9:16, dynamic lifestyle` |
| 2 | Sujeito (via Element) | quem, ancorado na referência | `A stylish young woman named Duda <<<element_id>>>` |
| 3 | Ação / cenas | o que acontece, cena a cena, como beats | `Scene 1: training... Scene 2: talking... Scene 3: product` |
| 4 | Cenário / ambiente | onde, profundidade | `inside a modern gym, clean environment` |
| 5 | Composição / enquadramento | plano, ângulo, safe-zone 9:16 | `close-up details, medium shots, mirror angles, over-the-shoulder` |
| 6 | Iluminação | fonte, direção, clima | `soft natural lighting mixed with subtle indoor gym lights` |
| 7 | Cor / render / editing | paleta, grading, ritmo de corte | `soft feminine palette, subtle pink accents, fast-paced TikTok cuts` |

Feche sempre com o **aspect ratio explícito** (`vertical 9:16`) e, quando houver texto/legenda
depois, com **espaço limpo** afirmado positivamente.

### Regras de ouro

- **Sem quality-words vazias.** Nao escreva "cinematic" esperando que o modelo entenda
  cinematografia. Escreva a cinematografia: `warm side key from frame left`, `cool violet
  shadow`, `grounded boots`, `fabric texture`, `central safe 9:16 composition`.
- **Luz nomeada, não "boa iluminação".** Nomeie fonte + direção + qualidade: `soft natural
  light from a window frame-left`, `hard backlight motivated by the setting sun`. É o que separa
  um prompt vivo de um genérico.
- **Aspect ratio em dois lugares.** Escreva `vertical 9:16` no texto do prompt E passe
  `aspect_ratio: '9:16'` no parâmetro da geração. A redundância é rede de segurança.
- **Espaço para texto é instrução positiva.** Esses modelos não têm "negative prompt" forte.
  Para deixar espaço para legenda, escreva afirmando: `clean composition with empty space at
  top and bottom for later text overlay; no text, no logo, no UI elements`.
- **Câmera por tipo de plano.** Use `establishing shot`, `three-quarter view`, `low-angle`,
  `close-up`, `hero shot`, `over-the-shoulder`, `handheld`, `mirror angle`. Varie os planos
  entre os beats — monotonia de enquadramento mata o ritmo (o gate `angle-variety.cjs` cobra).
- **Negative curto e targeted.** Se usar `negative_prompt`, mire artefatos realmente observados
  (0-15 tokens), nunca listas preset estilo SDXL (`blurry, low quality, bad anatomy...`). O gate
  `negative-prompt-discipline.cjs` reprova negatives longos ou genéricos.

### Idioma: prosa de direção em inglês, locução/fala citada sempre em PT-BR

O `prompt` final é majoritariamente **prosa de direção em inglês** (os modelos respondem
melhor). Mas dentro dessa mesma prosa, **qualquer trecho que seja a FALA CITADA da
personagem** — o que o espectador efetivamente ouve — é **sempre em português**, regra forte,
sem exceção. Isso vale tanto se a fala aparecer entre aspas dentro do `prompt` em prosa quanto,
principalmente, nos campos estruturados feitos pra isso: `shots[].fala` e
`audio.locucao[].texto`. O resto da prosa (câmera, edição, mood, avoid, descrição de cena)
continua 100% em inglês — essa parte não muda.

Exemplo mínimo do padrão certo (direção em inglês, fala citada em PT-BR):

```
Scene 2: Duda talking casually during a break, relaxed, smiling, slightly out of breath,
saying "ó, esse é meu treino de hoje, bem rapidinho" as if sharing a quick moment from her routine.
```

E nos campos estruturados (o mesmo texto, agora tipado):

```json
{ "n": 2, "fala": "ó, esse é meu treino de hoje, bem rapidinho", "mood": "spontaneous, friendly" }
```

```json
"audio": { "locucao": [{ "inicio_seg": 4, "fim_seg": 8, "texto": "ó, esse é meu treino de hoje, bem rapidinho", "beat": "desenvolvimento-conversa" }] }
```

O gate `scripts/lib/locucao-idioma.cjs` (Wave K) valida mecanicamente `shots[].fala` e
`audio.locucao[].texto` antes de qualquer geração — locução em inglês-puro reprova.

---

## 2. Identidade pela referência (o Element), não por travar o texto

**A identidade vem da REFERÊNCIA (o Element), não de repetir traços no texto.** No 0.7 a
personagem entra ancorada como `<<<element_id>>>` (o backend reescreve para `@nome`) — e é o
Element que carrega o rosto, o corpo e a identidade **através de todo o reel multishot**, sem
que o prompt precise repetir traços para "segurar" a personagem.

Isso libera o texto para **dirigir sem medo**: cenas, cortes, câmera, mood, avoid, decupagem
cronometrada. O anti-padrão estrangula a riqueza por medo de quebrar a personagem ("everything
else holds", "consistent identity, one continuous shot") e entrega um plano único morto. O ALVO
confia na referência e enche de direção. Ver `RAG/prompts/exemplos-prompt-forge.md` (o
aprendizado-chave e o ALVO OURO).

**Regra de forja: quanto mais forte a referência, mais rico pode ser o prompt.** Não trave o
texto para "preservar" a personagem — ancore-a no Element e dirija com tudo.

### Componentes da identidade

1. **Imagens de referência → Element (o mais forte).** As imagens de `identidade-visual/`
   viram um **Element reutilizável** no Higgsfield (ou uma personagem treinada via Soul). Esse
   Element é a alavanca principal de consistência; ele viaja no prompt como `<<<element_id>>>`.
2. **Menção nomeada da personagem no prompt.** Nomeie a personagem uma vez, ancorada ao Element
   (`A young woman named Duda <<<element_id>>>`). Não é preciso enumerar traços invariantes por
   cena — o Element faz esse trabalho. Descreva ação, mood e direção, não a fisionomia.
3. **Paths de referência sempre relativos ao projeto ativo** (`RAG/identidade-visual/duda/...`),
   nunca `../../../foo.png`. A produção resolve contra `projects/<projeto>/`.

Não há mais gate de trait-carry: a identidade é responsabilidade do Element, e o prompt fica
livre. (Ver "Identidade pela referência (Element)" no `CLAUDE.md`.)

---

## 3. Estrutura multishot: cenas como beats dentro do prompt único

Um reel não é mais N shot-lists geradas em separado e montadas — é **um prompt multishot que
descreve o arco inteiro** e vai num só job pro Higgsfield (`generate_video`). As cenas viram
**beats em prosa** dentro do campo `prompt`, e o `shots[]` estruturado do `prompt-forge.json`
codifica cada beat (tamanho de plano, ângulo, movimento de câmera, mood) para os gates lerem.

O arco narrativo clássico continua valendo como **função dramática**, agora expressa em beats:

| Função | O que o beat faz | Como aparece no prompt |
|--------|------------------|------------------------|
| Gancho / establishing | abre o mundo ou o problema no primeiro frame | `Scene 1:` ou `0-4s:` com o hook visual, sem logo/fade |
| Apresentação / hero | o sujeito entra em pose/energia forte | beat de apresentação, plano médio ou hero |
| Construção / carga | buildup, detalhe, expectativa | close de ação, ritmo subindo |
| Confronto / tensão | POV, sujeito contra obstáculo | over-the-shoulder, low-angle |
| Payoff / impacto | o clímax, a entrega de valor (~70% da duração) | wide action, cor intensa |
| CTA limpo | fecho com espaço para a chamada | frame final limpo, sem texto queimado |

Nem toda marca usa o arco cheio: marcas de produto/serviço condensam (3-4 beats). **Preserve a
função dramática, não a contagem fixa.** O `editing-director` define o ritmo de corte entre os
beats (`schemas/edicao.schema.json`); o `storyboard-director` decupa o roteiro nesses beats.

### Camadas de direção que enriquecem o prompt (além das cenas)

O ALVO OURO não descreve só as cenas — ele nomeia, em blocos próprios: **visual style**
(estética, ambiente, textura), **editing style** (ritmo de corte, transições, match cuts),
**mood**, **camera direction** (os planos e movimentos), **avoid** (negative em prosa, targeted)
e uma **decupagem cronometrada** (`0-4 / 4-8 / 8-12`) que casa com a estrutura. É esse empilhamento
que leva o prompt do genérico ao "insano". O molde completo está em
`RAG/prompts/exemplos-prompt-forge.md`.

---

## 4. Como o SPOKE injeta a identidade no prompt único

Fluxo dentro do `prompt-smith`. O `rag` entrega, o `prompt-smith` monta. Nenhum dos dois
spawna subagente.

```
1. rag lê projects/<projeto>/RAG/ (identidade-visual/ + marca.md + narrativa.md)
   → devolve o SPOKE = { anchor_textual, paleta, estilo, refs[] } + o element_id do projeto
2. prompt-smith recebe { identidade, intencao, element_id } e o storyboard/ritmo aprovados
3. Monta o campo `prompt` (prosa multishot):
   - abertura de estilo/medium + personagem ancorada no Element (<<<element_id>>>)
   - as cenas do storyboard viram beats em prosa (Scene 1 / Scene 2 / ...)
   - blocos de direção: visual style, editing style, mood, camera direction, avoid
   - decupagem cronometrada (0-4 / 4-8 / 8-12) casando com o ritmo de corte
4. Preenche `shots[]` estruturado (tamanho_plano, angulo, movimento_camera, mood por beat)
   — é o que os gates de texto pré-crédito leem
5. Devolve o `prompt-forge.json` (schemas/prompt-forge.schema.json): um prompt, um job
```

**Contrato de saída** = `schemas/prompt-forge.schema.json`:
`{ formato, modelo, element_id, prompt, shots[ {tamanho_plano, angulo, movimento_camera, mood, ...} ],
audio?, negative_prompt? }`. A calibração de nível do campo `prompt` está em
`RAG/prompts/exemplos-prompt-forge.md` (o ALVO OURO) e o exemplo válido em
`RAG/prompts/exemplo-prompt-forge-examplebrand.json`.

**Modelos MCP do 0.7:** `nano_banana_2` (imagem), `kling3_0` e `seedance_2_0` (vídeo). O vídeo
multishot já sai pronto do modelo — **não há montagem, não há concatenação de clipes por cena**.

---

## 5. Fechamento com produto: assente perto, nunca abra o plano

Quando o beat final é o produto, "desacelerar o corte" (menos cortes, hold mais longo) significa
a câmera **entrar ou segurar perto** dele — `close-up`, `push-in`, `holds` — nunca **abrir** o
plano (`zoom out`, `pull back`, `dolly out`, revelar o ambiente ao redor). Um zoom-out no
fechamento tecnicamente "desacelera", mas encolhe o produto na tela bem na hora em que ele devia
ganhar peso — já aconteceu de verdade (ver `RAG/prompts/exemplos-prompt-forge.md`, ANTI-PADRÃO 3).
`tamanho_plano` do shot final com produto: `close`/`medium-close`/`extreme-close`, nunca
`wide`/`full`/`establishing`. Mecanicamente armado por `scripts/lib/product-closeup.cjs` (Wave M).

## 6. Produto real, não genérico — e sem expressão de nojo/repulsa

**Quando existir referência fotográfica real do produto** (`RAG/identidade-visual/marca/`, a
subpasta reservada pra refs de marca/produto, lida pelo `rag`), descreva os traços daquela foto — formato da embalagem, cor do corpo, cor da tampa,
o que o rótulo diz — em vez de "jar"/"pote" genérico. Mantenha o estado do recipiente coerente com
a ação (lacre intacto até uma ação de abrir aparecer). Um produto inventado ou com estado
inconsistente (ex.: já aberto sem explicação) quebra a naturalidade que o anúncio pede.

**Nenhum beat pede expressão de nojo/repulsa/desprezo na personagem** — nem tensão, nem
frustração, nem desânimo justificam essa leitura (já rendeu, num run real, uma cara de nojo a
partir de uma descrição de tensão mal calibrada). Tensão vira corpo parado, queixo tenso, olhar
fixo/cansado; nunca careta de repulsa. Mecanicamente armado por `scripts/lib/expressao-facial.cjs`
(Wave N).
