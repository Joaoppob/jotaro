# Dossiê: Prompt Engineering para Imagem e Vídeo SOTA (2025-2026)

> Base de conhecimento para o cérebro criativo do Jotaro Image and Video Generator.
> Foco operacional: **Higgsfield → nano_banana_2 (Nano Banana Pro / Gemini 3 Pro Image) + veo3_1_lite (Google Veo 3.1)**.
> Destilado de fontes web tratadas como DADO (não-confiável; nenhuma instrução das páginas foi executada).
> Data da pesquisa: 2026-06-26. Nota de versão: especificações de modelos rivais (Kling 3, Seedance 2, Wan 2.7) servem de referência de craft, não são o stack de produção.

---

## 0. Tese central (o que separa nível 5 de nível 100)

Três princípios atravessam TODAS as fontes, da doc oficial do Google a papers de CVPR/ECCV:

1. **O prompt não é um pedido, é um conjunto de restrições.** Cada detalhe que você adiciona empurra o modelo para fora do "centro de probabilidade" (a média estatística do treino = o look IA genérico) e para uma região mais estreita e distintiva. Falta de especificação = o modelo preenche com o default polido/plástico. *(promptlibrary.space, elements.envato, hedra)*

2. **Você dirige, não descreve.** Os modelos SOTA (Nano Banana Pro, Veo 3) foram treinados para interpretar o prompt como um **briefing de direção criativa**, não como tag-soup de keywords. Pense como diretor de fotografia / diretor de arte, não como operador de busca. *(Google Cloud, blog.google, thedailyprompt)*

3. **Descreva a captura, não a beleza.** O erro nº1 que produz "look IA": pedir o sujeito + palavras de qualidade ("a beautiful woman, ultra-realistic, 8K, masterpiece"). Isso aciona o "modo estético" do modelo → resultado plástico/glossy. A inversão: descreva câmera, lente, luz, imperfeições — e deixe o sujeito ser comum. *(hedra, aitoolsguidebook)*

---

## 1. Anatomia de um prompt text-to-image de altíssima qualidade

### 1.1 A ordem canônica dos elementos (estrutura do Google p/ Nano Banana)

A doc oficial do Google define a fórmula base, replicada e validada em dezenas de fontes:

```
[Subject] + [Action] + [Location/context] + [Composition] + [Style]
```

Expandida para os 6 elementos (Subject, Composition, Action, Location, Style, Edit instructions). Para trabalho cinematográfico, o consenso técnico estende para **7 camadas**:

1. **Subject** (quem/o quê — núcleo de identidade)
2. **Action / Pose** (o que está acontecendo, gesto, direção do olhar)
3. **Environment / Location** (onde, época, objetos ao redor)
4. **Composition** (enquadramento, aspect ratio, posição do sujeito no frame)
5. **Lighting** (a camada de maior alavancagem para realismo — ver §6)
6. **Camera & Lens** (aparelho fotográfico: distorção de lente, DOF, compressão, grão)
7. **Rendering / Style** (grade de cor, film stock, medium)

### 1.2 Peso posicional — front-loading

**Os modelos dão peso desproporcional às palavras no INÍCIO do prompt.** Regra prática:

- Conceito mais importante primeiro (geralmente o sujeito; ou o estilo, se o estilo é prioridade absoluta — "watercolor painting of…").
- Detalhes de suporte no meio (ambiente, luz, câmera).
- Refinamento/mood/paleta no fim.

Para Nano Banana Pro especificamente: ao usar referência de identidade, **a instrução de identidade vem ANTES da descrição da cena**, porque o modelo pondera tokens iniciais com mais força durante a geração. *(blog.laozhang, getvidzy)*

### 1.3 Prosa descritiva vs. listas — depende do modelo

Distinção **load-bearing** para o nosso stack:

| Modelo | Formato que responde melhor |
|--------|-----------------------------|
| **Nano Banana Pro / Gemini 3 image** | **Prosa narrativa / briefing estruturado.** Tags XML-style ou headings Markdown para separar seções. Gemini "prefere tags"; trata o prompt como documento de design. Listas ativam o "motor de reconhecimento de objetos" (bom para componentes de layout). |
| **Veo 3 / 3.1** | **Prosa rica e sensorial.** Frase única longa funciona muito bem (ver exemplo oficial do rally off-road, ~250 palavras). |
| Midjourney | Frases curtas, keyword-focused, 40-60 palavras |
| Flux / SDXL | Comma-separated keywords; Flux.2 é position-tolerant, SDXL é position-sensitive |

**Para Nano Banana Pro (nosso modelo de imagem):** estruture como briefing de produção. Gemini 3 responde melhor a prompts **diretos, bem-estruturados, com delimitadores claros** (XML tags ou headings). Coloque restrições críticas (persona, formato de saída, aspect ratio) no início.

### 1.4 Especificidade: substitua adjetivos por coisas nomeadas

A alavanca mais forte contra o look genérico. *(promptlibrary.space — "7 prompt fixes")*

- ❌ "fantasy armor" → ✅ "ornate elven plate armor, etched with silver leaf patterns, high collar, pauldrons shaped like falcon wings"
- ❌ "metal" → ✅ "brushed aluminum" / "anodized titanium" / "powder-coated steel"
- ❌ "wood" → ✅ "weathered oak with visible grain and creased seams"
- ❌ "good lighting" → ✅ "hard top light from camera-left, warm 3200K, long shadows"
- ❌ "beautiful forest" → ✅ "sunlit forest, rays filtering through ancient redwood canopy, morning mist over a carpet of ferns, dew on spider webs"

**Regra:** "Visual details do more work than the adjective 'beautiful' ever could." Detalhes visuais concretos fazem o trabalho que adjetivos abstratos nunca fazem.

### 1.5 Exemplo ANTES/DEPOIS (text-to-image)

**ANTES (nível 5 — genérico):**
```
A beautiful woman drinking coffee in a cafe, photorealistic, 8K, ultra detailed, cinematic
```

**DEPOIS (nível 100 — briefing dirigido):**
```
Subject: A woman in her early 30s, tired, shoulder-length dark hair with a few
strands escaping, faint under-eye shadows, natural skin with visible pores and
slight forehead shine.
Action: cradling a ceramic mug with both hands, looking down at it, not at camera.
Location: a cluttered neighborhood cafe, late morning, a half-eaten croissant and
a folded newspaper on the marble table, condensation ring under a water glass.
Composition: medium close-up, subject off-center to the right (rule of thirds),
9:16 vertical, negative space upper-left.
Lighting: hard window light from camera-left, defined shadow on the right side of
her face, warm daylight mixing with cooler interior tone near the back wall.
Camera & lens: shot on a Canon AE-1, 50mm, shallow depth of field (f/2),
background falls soft.
Style: Kodak Gold 200 film emulation, fine grain, gentle halation on highlights,
muted low-contrast palette.
```

A versão DEPOIS aplica: front-load do sujeito específico, luz direcional nomeada, lente concreta, film stock nomeado, imperfeição deliberada, off-center, e — crucialmente — **remove todas as quality words**.

---

## 2. Negative prompts: quando, como, e o que de fato remove artefato

### 2.1 Mecânica (validada por papers, não folclore)

**Como funciona de verdade** *(ECCV 2024, arxiv 2406.02965; ai-tldr; WACV 2026)*:

Negative prompt NÃO é filtro pós-geração. É um input paralelo via **classifier-free guidance (CFG)**: a cada passo de denoising o modelo faz uma predição condicionada ao prompt positivo e outra ao negativo, e **se afasta da direção negativa enquanto avança para a positiva**, exagerando o gap.

Dois comportamentos comprovados empiricamente:

1. **Delayed Effect (efeito atrasado):** o impacto do negative prompt só aparece DEPOIS que o positivo já renderizou o conteúdo correspondente — tipicamente após o **passo 10** de difusão. Aplicar negative cedo demais pode até *gerar* o objeto negado antes de suprimi-lo ("Reverse Activation") e distorcer a estrutura da imagem/fundo.
2. **Deletion Through Neutralization:** o negative deleta conceitos por cancelamento mútuo no espaço latente com o positivo.

**Implicação crítica:** negative prompt só funciona em conceitos que o modelo tem um "handle" interno forte. `blurry`, `watermark`, `text` são bem-aprendidos → dirigem de forma confiável. Um artefato esquisito e específico que você não consegue nomear limpo **não responde** — o modelo não tem direção clara para fugir.

### 2.2 CFG scale governa a força do negative

*(imagetoprompt.dev)*

- CFG 3-5: negative tem efeito mínimo (bom para trabalho artístico/criativo)
- CFG 7: balanço padrão, ponto de partida recomendado
- CFG 9-11: influência forte do negative, mas pode introduzir artefato
- CFG 12+: negative domina, gera imagem super-saturada/artefatada

Sweet spot: **CFG 7-8**. Se o negative não está fazendo efeito suficiente, suba o CFG (até ~9) antes de inchar a lista.

### 2.3 A grande virada de 2026: modelos limpos precisam de MENOS (ou ZERO) negative

**Isto é decisivo para o nosso stack.** *(nowaythisisai — "Negative Prompts in Mid-2026")*

Flux.2 (nov/2025) e a família Gemini foram treinados em corpus muito mais limpo que SDXL. As categorias de artefato que os negative prompts SDXL atacavam (anatomia malformada, pele plástica, ruído de baixa-res) aparecem em frequência **materialmente menor** mesmo sem negative.

Consequência operacional: **o longo negative prompt estilo-SDXL DEGRADA a saída de modelos limpos.**

- `"blurry, low quality, jpeg artefacts"` no negative empurra para nitidez extrema → imagem hiper-definida que lê como sintética.
- `"plastic skin"` no negative empurra para detalhe de poro exagerado que, acima de um limiar, *também* lê como sintético.

**Regra Flux.2/Gemini-class 2026:** negative prompt típico = **0 a 15 tokens**, mirando apenas os edge-cases específicos observados naquele prompt/seed. Não existe "lista canônica" como existia no SDXL.

> **Aplicação Nano Banana Pro:** a doc oficial do Google nem usa campo de negative — usa **positive framing**: "empty street" em vez de "no cars". Para Nano Banana, prefira reformular positivamente. Se o Higgsfield expõe campo de negative, mantenha curtíssimo e targeted (ex.: `text, watermark, logo` quando aparecer junk textual; nada mais).

### 2.4 Workflow correto de negative (o loop que vence presets)

Gerar → inspecionar → isolar o defeito recorrente → escrever UM negative targeted → rodar de novo → podar agressivamente. Esse loop bate qualquer lista preset gigante porque mantém o negative atado ao que a imagem está fazendo de errado *naquele seed/prompt*. *(aiphotogenerator)*

**Para SDXL/legado (não é nosso caso, mas referência):** lista de 50-120 tokens ainda importa. Ex. para retrato: `deformed eyes, extra fingers, mutated hands, bad anatomy, disfigured, cartoon, 3d render, illustration`.

---

## 3. Conditioning por referência: consistência de personagem/identidade

> Nano Banana é **state-of-the-art nisso** — é a maior alavanca de qualidade do nosso pipeline para ADs com personagem recorrente.

### 3.1 Especificações reais (doc oficial Google Cloud)

- **Até 14 imagens de referência** num único prompt (mix de objetos). Tipos: png, jpeg, webp, heic, heif.
- Knowledge cutoff: **janeiro 2025**.
- Aspect ratios nativos incluindo **9:16** (nosso formato de AD).
- Resoluções 1K/2K/4K. Todas as saídas trazem **SynthID watermark + C2PA Content Credentials** (relevante para compliance de ads).

### 3.2 Quantas referências — o limiar de degradação

Embora suporte 14, **mais não é melhor.** Consenso convergente de múltiplas fontes de teste:

- **6 imagens de alta qualidade** = cap prático para fidelidade estrutural máxima. (Google: 6 das 14 contribuem com alta fidelidade.)
- Acima disso, o modelo **faz a média** de mais variação → degrada precisão estrutural e funde traços.
- Para a maioria dos jobs, **3 referências** com papéis claros (1 identidade + 1 estilo + 1 ambiente) é mais estável que uma pilha de 10.
- Resolução de referência: **1024×1024**. NÃO use 4K como referência cegamente.

> **Heurística de produção:** comece com o menor conjunto que descreve completamente o job. 4-8 refs para personagem; 3 refs com papéis nomeados para AD de produto+pessoa.

### 3.3 Papéis explícitos por referência (regra de ouro)

NUNCA jogue referências e torça para o modelo adivinhar. **Dê a cada referência UM trabalho claro:**

```
Use Image A for the character's pose, Image B for the art style,
Image C for the background environment.
```

Para AD de produto: "Use the uploaded product reference to preserve bottle shape, cap color, and label placement. Use the scene description only for the background and props." *(rivya, blog.google)*

### 3.4 Identity Locking via enumeração de traços (a técnica nº1)

A diferença entre amador e profissional. Dizer "same person" é vago. **Enumere os marcadores faciais específicos** como um checklist:

**Fórmula de identity lock comprovada** *(blog.laozhang, wentuo, prompting.systems)*:

```
Generate an image of the person shown in the reference images. Maintain the exact
same facial features — identical eye shape, nose bridge contour, jawline angle,
lip proportions, and skin texture. [Scene description].
```

Mecânica: Nano Banana Pro usa um "identity latent" — traduz marcadores faciais (ângulo da mandíbula, espaçamento dos olhos, marcas distintas) numa "impressão digital matemática" estável. A enumeração textual ancora essa impressão. **Partial denoising** permite editar atributos (camisa vermelha→azul) preservando a impressão digital facial.

### 3.5 Reuso verbatim de tokens (text anchor)

O segundo âncora, em paralelo à referência de imagem: **reuse as MESMAS palavras exatas em toda geração.**

- "emerald green eyes" sempre — nunca alterne com "green eyes". Sinônimos quebram a consistência ("cinematic" ≠ "filmic" para o modelo).
- Mantenha um "**character DNA paragraph**" — bloco fixo de descrição que entra em todas as gerações daquele personagem.

### 3.6 Reference sheet de 3 vistas (reconstrução 3D)

Para ancorar consistência de diferentes ângulos: crie **uma única imagem de referência com 3 vistas** — frontal direta, perfil 45°, perfil 90°. Isso dá ao modelo entendimento 3D completo da estrutura da cabeça → reproduz o mesmo personagem em novos ângulos/distâncias focais sem "face collapse".

### 3.7 Anti-drift em séries longas (anchoring)

Em sequências de 50+ frames, ocorre **drift cumulativo**. Mitigação:

1. Gere uma base portrait forte e edite a partir dela (iterar, não re-rolar do zero).
2. Periodicamente **regenere uma referência "limpa"** que corresponda ao leve drift acumulado, e use essa referência atualizada nos frames seguintes (re-anchoring).
3. Para máximo lock: **mask/inpaint** — mascare tudo exceto o rosto (ou só olhos/nariz/boca) e edite roupa/pose/fundo. A região não-mascarada vira âncora visual não-negociável.

### 3.8 Múltiplos personagens na mesma cena

- Forneça referência para cada personagem presente.
- **Mapeie posições left-to-right explicitamente:** "Character A (Maya) on the left, Character B (Ruiz) on the right."
- **Limite ~5 personagens** por cena — acima disso o identity latent começa a falhar e os traços se misturam (faces genéricas/mescladas).

---

## 4. Style locking — consistência de estética entre cenas de uma série

> Gerar UMA imagem bonita é fácil. Gerar dez que pertencem visivelmente à mesma série/marca é o problema difícil. Toda cena drifta um pouco em paleta, lente, rendering.

### 4.1 O método do "style block" (bloco de marca)

A técnica mais robusta e portável entre modelos *(aitoolsguidebook, aimagicx, humanacademy)*:

Separe o prompt em camadas e **trave as do meio através de TODA a série:**

```
[Subject]          ← varia por imagem
+ [Style]          ← TRAVADO — DNA visual
+ [Lighting & color] ← TRAVADO
+ [Camera / composition] ← varia por imagem (adiciona variedade)
```

Exemplo de **style block reusável** (o "brand sheet" — cole verbatim em cada prompt):

```
Style: editorial photography, slightly desaturated film look, soft analog grain,
Kodak Portra 400 emulation
Color: warm muted palette, dusty rose + sage green + cream, low contrast
Lighting: soft window light from camera-left, gentle falloff, no hard shadows
```

### 4.2 Regras operacionais de consistência de série

1. **Um modelo só para a série inteira.** Trocar de modelo no meio (Nano Banana → outro) garante quebra de estilo — cada modelo tem seu look default.
2. **Gere uma anchor image que você genuinamente ama PRIMEIRO.** A série se alinha a essa âncora — não se constrói "democraticamente" por muitas takes que tendem à média/mush.
3. **Reuse palavras exatas, não sinônimos.** Salve o style block num arquivo; não reescreva de memória.
4. **Teste 3 imagens primeiro, trave o bloco, depois gere o resto.**
5. **Revise em tamanho thumbnail** — drift é mais fácil de detectar em miniatura.
6. **Revise o set JUNTO**, não imagem por imagem. Cheque: deriva de cor/temperatura, níveis de polish diferentes, fundos que parecem outra marca, crops que não funcionam como campanha.

### 4.3 Separar regras-de-marca duráveis de ideias-de-cena

Mantenha 4 buckets separados *(rivya)*:

- regras de marca duráveis (style block)
- detalhes específicos do produto
- detalhes específicos da cena
- restrições de output (ex.: "no busy patterns", safe zones)

Style note curta o suficiente para realmente ser reusada. Se inchar, divida.

### 4.4 Para vídeo (Veo): repita o "style block" entre takes

O Veo mantém estilo de câmera, luz e atmosfera entre takes **reusando a mesma referência + repetindo um style block** (lente, movimento de câmera, luz, paleta) em cada prompt. Mesma lógica do bloco de imagem.

---

## 5. Motion prompting — image-to-video e text-to-video (Veo-class)

### 5.1 A regra mestra: câmera ≠ sujeito. Ambos são escolhas, não defaults.

Se você não especifica movimento, o modelo escolhe — e o default costuma ser um **drift leve sobre sujeito estático** (não é o que você queria). Separe sempre:

- **Movimento de câmera** (como o espectador se move pelo espaço)
- **Movimento primário do sujeito** (a ação)
- **Movimento secundário** (casaco esvoaçando, cabelo, ambiente)

### 5.2 "Cinematic" é resultado, não instrução

A frase mais importante de toda a pesquisa de vídeo *(veo3ai)*:

> "Do not ask for 'cinematic' and stop there. Cinematic is an outcome, not an instruction."

Palavras como "épico", "lindo", "dinâmico" **não significam nada para uma lente**. Diga: onde a câmera começa, para onde se move, quão rápido, o que fica em foco, como o sujeito reage, e quais restrições físicas devem permanecer críveis.

- ❌ "epic motion" / "dynamic"
- ✅ "Slow dolly push-in from waist-level to product close-up"

### 5.3 Vocabulário de movimento de câmera (o que os modelos respeitam)

Termos atados a metáforas de rig — os modelos foram treinados neles:

| Movimento | Efeito | Uso |
|-----------|--------|-----|
| **Static / locked-off** | Câmera imóvel | Observacional, clareza de UI/texto, instrução |
| **Pan (left/right)** | Rotação horizontal de posição fixa | Revelar info adjacente (manter lento — compõe motion blur) |
| **Tilt (up/down)** | Rotação vertical | Revelações verticais (ótimo em 9:16) |
| **Dolly / Track (in/out)** | Câmera move fisicamente | Cinematográfico mesmo lento; **default para product shot** |
| **Zoom (in/out)** | Muda focal length (câmera não move) | Diferente de dolly |
| **Orbit / Arc** | Caminho circular ao redor do sujeito | Hero objects |
| **Crane / Pullback** | Sobe/recua | Estabelecer escala |
| **Handheld** | Micro-sway / micro-shake | UGC, realismo, imediatismo — **arriscado para text overlay** |
| **Gimbal** | Suave estabilizado | Profissional limpo |
| **Whip pan** | Pan ultrarrápido borrado | Transição/desorientação |

Câmera também controla **emoção**: locked-off wide = observacional; handheld follow = imediato; slow push-in = íntimo; low-angle dolly = poderoso. Esses termos fazem mais trabalho que "cinematic".

### 5.4 UM movimento de câmera por shot (regra dura)

**Combinar dois verbos de movimento = o modelo escolhe o caos.** Um verbo por shot mantém limpo. Para movimento composto, escreva como **beats sequenciais**:

```
Start: slow dolly-in. Then: gentle pan right for the final 2 seconds.
```

Os modelos (Seedance, Veo) respeitam a sequência melhor do que dois movimentos jammed numa cláusula. Orbit + dolly + tilt num clip de 5s = caos.

### 5.5 Lente como bucket (não milímetros exatos para vídeo)

- wide (sensação 24-28mm)
- normal (35-50mm)
- telephoto (85mm+)

Evite milímetros exatos em vídeo a menos que necessário; use os buckets + "shallow focus / deep focus / macro".

### 5.6 Image-to-video: prompt SÓ para movimento (não re-descreva)

Regra crítica do guia Veo *(Dr. Bakkali, Google Cloud)*:

- **DO:** prompt para movimento de câmera, animação do sujeito, mudanças de ambiente.
- **DON'T:** re-descrever personagem, fundo ou luz. Prompts redundantes **confundem o modelo** e degradam o resultado.

Por que i2v vence para trabalho controlado: o frame de abertura é a batalha composicional. Se o frame está errado (sujeito, estilo, luz, enquadramento), nenhum motion prompting conserta. **Trave um frame forte (gerado no Nano Banana) e depois anime.**

Três formas de animar uma imagem, da mais confiável para a menos:
1. **Camera Motion** (câmera move, cena estática) — mais simples e confiável.
2. **Subject Animation** (sujeito move) — melhor para ações sutis e lifelike.
3. Ambos — mais difícil.

### 5.7 Duração = orçamento de storytelling (não setting de qualidade)

Mapeamento validado *(morphed, sureprompts)*:

| Duração | Tipo de prompt | Exemplo |
|---------|----------------|---------|
| 4s | UMA ação | cap do frasco abre |
| 6s | uma ação + um movimento de câmera | slow push-in em dançarina girando |
| 8s | dois beats | mão pega produto, câmera revela o rótulo |
| 10s | sequência de 3 shots | setup, ação, payoff |
| 15s | mini-AD multi-shot | problema, transformação, frame final |

Se você pede AD completa + troca de roupa + orbit + product reveal + reaction shot em 5s, o modelo comprime tudo até o clip ficar confuso. **Uma ação principal por clip;** quebre ações complexas em clips separados e monte depois.

**Timecode prompting** (Sora 2 e Seedance 2 são fortes nisso; Veo aceita beats):
```
[0-2s] Blurred close-up of object on a pedestal, dramatic side light.
[2-4s] Camera focuses and pulls back, revealing a sleek earbud case.
[4-6s] The case opens, earbuds glow softly.
```

### 5.8 ANTES/DEPOIS (image-to-video, AD vertical)

**ANTES (nível 5):**
```
A cinematic video of a perfume bottle, beautiful, dynamic, epic
```

**DEPOIS (nível 100):**
```
Start from this image. Camera: slow dolly push-in from a medium shot to a close-up
on the bottle's label, gimbal-smooth, eye level. Subject motion: golden liquid
inside catches the light and shifts subtly; a single dust mote drifts across the
key light. Environment motion: soft caustic reflections crawl across the marble
surface. Late golden-hour side light from camera-left. Keep the bottle shape and
label exactly as in the reference. Natural timing, no jump cuts, no abrupt
transitions. 9:16, 6 seconds.
```

### 5.9 O que cada modelo respeita vs. ignora (referência de craft, stack ≠ nosso)

> Nosso vídeo é Veo 3.1 lite. Os abaixo são para entender o campo e calibrar expectativas.

- **Veo 3 / 3.1** (NOSSO): endpoint-driven; aceita first/last frame para travar narrativa; forte em prompt adherence e física; gera áudio nativo; reusa referência + style block para consistência entre takes. Aceita prosa longa e detalhada.
- **Seedance 2**: pensa em **shots/cortes/enquadramento**. Linguagem de câmera/ângulo muda MUITO a saída; linguagem de velocidade quase não afeta. Sistema `@camera/@action/@effect/@style` para extrair atributos de referência (determinístico). Melhor para edits limpos e personagens estáveis.
- **Kling 3**: pensa em **movimento/física/continuidade**. Velocidade de movimento muda muito; ângulo de câmera quase não. Motion transfer (extrai padrão de movimento de vídeo-ref). Melhor para dança/esporte/ação; pode driftar enquadramento.
- **Wan 2.7**: first/last frame (interpola entre dois keyframes); mais "creative license"; melhor dirigido.

**Tradução para o nosso pipeline:** como usamos Veo, podemos (a) prompt com prosa rica + beats, (b) usar i2v com frame forte do Nano Banana, (c) repetir style block entre clips, (d) explorar first/last frame para transições controladas.

---

## 6. Armadilhas que produzem "look IA / genérico / stock" — e como evitar

> Esta é a seção mais densa em valor. O "look IA" não é aleatório: é a média estatística do treino (stock retocado + fotografia editorial).

### 6.1 A causa raiz

Modelos são treinados em datasets onde uma fatia desproporcional é **stock retocado** — pele alisada, luz flat de estúdio, tudo na mesma distância focal. Prompt vago → o modelo busca a **média estatística** = imagem que parece pesadamente retocada. Cada detalhe que você deixa indefinido é preenchido com a versão mais "polida" aprendida.

### 6.2 As 6 armadilhas (e o fix de cada uma)

**1. Luz flat / "ring-light face" — o maior delator isolado.**
Sem especificação, o modelo default para iluminação **uniforme e difusa de todos os ângulos**: sem lado de sombra, sem rolloff de highlight, sem profundidade ("foto de passaporte de repartição super-iluminada").
- *Fix:* nomeie **fonte + direção + qualidade + temperatura**. Luz lateral e backlight criam mais profundidade. Se você não consegue dizer de onde vem a luz numa imagem, é quase certamente IA.
- ✅ "hard window light from camera-left, defined shadow on the opposite side, warm daylight mixing with cooler interior near the back wall"

**2. Pele plástica / silicone — o maior delator em retrato.**
Modelo default para pele lisa sem poros (aprendeu "boa pele = pele lisa" do stock retocado).
- *Fix:* "visible skin pores, natural blemishes, slight facial asymmetry, fine surface hairs, subtle redness, slight oiliness in spots and dryness in others, realistic subsurface scattering". Esses cues puxam o modelo para os dados mais candidos/menos retocados.
- ⚠️ Cuidado com over-correction em Flux/Gemini: poro exagerado também lê como sintético. Calibre.

**3. Textura uniforme (sem profundidade de foco).**
Modelo aplica o mesmo nível de detalhe em toda a imagem (processa tudo de uma vez, sem o foco depth-dependent de uma lente real).
- *Fix:* DOF explícito ("sharp focus on subject, blurred background") força tratamento diferente de fg/bg. Nomeie desgaste de material: "well-used leather bag with scuffs on the corners", "linen shirt washed many times, soft and slightly wrinkled". **Coisas gastas parecem mais reais que coisas novas.**

**4. Composição centrada / simétrica (instinto de iniciante e de algoritmo).**
- *Fix:* assimetria deliberada. Sujeito offset, negative space que cria tensão, rule of thirds, leading lines.

**5. Quality words que TRAEM (counterintuitivo e crítico).**
`8K`, `ultra-realistic`, `hyperrealistic`, `masterpiece`, `cinematic`, `photoreal` — tão super-usadas que os modelos as aprenderam como **código para "o look polido/plástico/asset-store"**. Dizer "photoreal" pode produzir saída MENOS realista que não dizer nada.
- *Fix:* **CORTE todas.** Substitua cada uma por um fato fotográfico concreto (lente, film stock, luz). "Your output gets more realistic when you remove them."

**6. Equipamento "de estúdio" que lê como stock.**
"Shot on Canon R5, 85mm f/1.4, studio lighting" → look stock genérico.
- *Fix:* nomeie equipamento humilde — "shot on an iPhone", "a point-and-shoot", "a Ricoh GR III", "an old Canon AE-1". E adicione **verdade óptica**: "fine film grain, slight chromatic aberration, soft/slightly missed focus, mild over-exposure with a few blown highlights, gentle vignetting".

### 6.3 A inversão fundamental (Hedra)

> "Describe the capture, not the beauty."

Uma foto lê como real quando foi **tirada mal** — rápido, em luz ruim, sem pensar em composição. Snapshot de festa com flash on-camera: hotspot nos rostos, fundo em quase-preto, motion blur, tilt. Nada disso é "bom" — e tudo é como uma foto de celular real de fato parece.

**Comprometa-se com UM efeito de câmera** e leve até o fim. Meio-termo (nem amador convincente, nem pro limpo) = "off". Escolha uma direção e empurre toda.

### 6.4 Film stocks — a alavanca de narrowing mais eficiente

Nomear UM film stock = o modelo reproduz color science, grão e tonalidade.
- ⚠️ **Evite os over-prompted** que agora leem como "tentando parecer film": **Portra 400** e **Cinestill 800T** especialmente.
- ✅ Prefira: **Kodak Gold 200, Ektachrome, Ilford HP5, Pro 400H, Ektar.**

### 6.5 Referências de era / cinegrafista
"1990s editorial" bate 50 palavras de estilo. Referência de era/diretor de fotografia comprime intenção visual densa em poucas palavras.

### 6.6 Pós-produção não é trapaça, é o workflow
Mesmo com prompt perfeito, imagem de nível premium passa por uma rodada de edição: color grading (highlights mais frios, shadows mais quentes quebra a "paleta IA"), vignette sutil, **film grain overlay em baixa intensidade** (elimina o "too clean"), e re-crop (o crop default da IA quase nunca é o melhor).

---

## 7. Síntese acionável para o cérebro criativo do Jotaro (AD vertical 9:16)

### 7.1 Pipeline canônico (asset-first)

```
1. Nano Banana Pro (nano_banana_2): gerar o FRAME forte
   - briefing estruturado de 7 camadas (§1.1)
   - identity lock por enumeração + 3-6 refs com papéis nomeados (§3)
   - style block travado se for série (§4)
   - aspect ratio 9:16 nativo
   - ZERO quality words; luz direcional + film stock + imperfeição (§6)
        ↓
2. Veo 3.1 lite (veo3_1_lite): animar via image-to-video
   - prompt SÓ de movimento (não re-descrever) (§5.6)
   - 1 movimento de câmera + beats se composto (§5.4)
   - duração = orçamento narrativo (§5.7)
   - "keep [identidade/produto] exactly as in reference"
        ↓
3. Pós: color grade + grain + crop + text overlay composited (não deixar a IA renderizar texto/logo da marca) (§6.6)
```

### 7.2 Template de AD vertical (9-line creative brief, adaptado)

```
1) Deliverable: vertical 9:16 ad, [10-15s], [plataforma], 1080×1920.
2) One audience + one intent + one emotion.
3) Hook (0-2s): pattern interrupt visual — contraste de cor / shift de movimento /
   reveal (covered→uncovered). NÃO o primeiro segundo, o primeiro FRAME.
4) Body (2-8s): uma ação clara + reveal do produto.
6) CTA (últimos 2s): visual, na safe-zone inferior.
7) Subject + Action: um sujeito, uma ação.
8) Scene + camera + lighting + style: nomeados e específicos.
9) Guardrails: avoid-list curto + safe-zone de caption (espaço no topo/base).
```

### 7.3 Princípios de hook para 9:16 (stop-the-scroll em 3s)

- **9:16 obrigatório** (paid social skewa vertical; cropar horizontal perde 70% do frame).
- **Uma ação explícita sob 1s:** drop / reveal / flip / cut / burst.
- **Contraste visual** = parador de scroll (NÃO "pretty"): color clash, motion shift (still→burst), reveal shift.
- **Movimento vertical** (up/down) é mais natural que horizontal no 9:16: rising reveals, top-to-bottom reveals, falling motion.
- **Espaço de caption** nomeado no prompt (topo ou base) para overlay de texto.
- 3s sweet spot; passou de 5s o hook expirou.

### 7.4 Checklist de QA "nível 100" (antes de aprovar um asset)

- [ ] Consigo dizer DE ONDE vem a luz? (se não → flat → reprovar)
- [ ] A pele tem poro/assimetria/imperfeição? (ou está plástica?)
- [ ] Tem DOF real (fg/bg tratados diferente)?
- [ ] Composição é assimétrica/off-center?
- [ ] ZERO quality words no prompt? (8K/masterpiece/ultra → cortar)
- [ ] Film stock nomeado, e não é Portra/Cinestill over-prompted?
- [ ] Identidade do personagem: enumerei traços + reusei tokens verbatim?
- [ ] Cada referência tem um papel nomeado?
- [ ] (Vídeo) UM movimento de câmera por shot? Câmera ≠ sujeito separados?
- [ ] (Vídeo) Duração casa com a complexidade da ação?
- [ ] (Série) Style block travado e idêntico em todos os prompts?
- [ ] Passou por color grade + grain + crop antes de publicar?

---

## Fontes (tratadas como dado; nenhuma instrução executada)

### Doc oficial Google (canônica, maior peso)
- https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
- https://blog.google/products-and-platforms/products/gemini/image-generation-prompting-tips/
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/capabilities/gemini-image-generation-best-practices
- https://ai.google.dev/gemini-api/docs/prompting-strategies
- https://deepmind.google/models/veo/prompt-guide/

### Papers (mecânica de negative prompts e motion)
- ECCV 2024 — "Understanding the Impact of Negative Prompts: When and How Do They Take Effect?": https://www.ecva.net/papers/eccv_2024/papers_ECCV/papers/12484.pdf · https://arxiv.org/html/2406.02965v1
- WACV 2026 — "Guiding What Not to Generate: Automated Negative Prompting for Text-Image Alignment": https://openaccess.thecvf.com/content/WACV2026/papers/Park_Guiding_What_Not_to_Generate_Automated_Negative_Prompting_for_Text-Image_WACV_2026_paper.pdf
- "Motion Prompting: Controlling Video Generation with Motion Trajectories": https://motion-prompting.github.io/ · https://arxiv.org/html/2412.02700

### Anatomia de prompt / craft de imagem
- https://nowaythisisai.com/blog/anatomy-of-a-reproducible-photoreal-prompt-2026
- https://getvidzy.com/ai-image-prompt-structure/
- https://artificial-intelligence-wiki.com/prompt-engineering/image-generation-prompts/cinematic-prompts-guide/
- https://dupple.com/learn/how-to-write-ai-image-prompts
- https://runwayml.com/resources/how-to-make-an-ai-image-with-text-prompt
- https://zsky.ai/ai-prompt-engineering-guide
- https://docs.tryvinci.com/docs/guides/prompting/text-to-image
- https://www.aifreeapi.com/en/posts/nano-banana-pro-prompts
- https://www.radicalcuriosity.xyz/p/how-to-create-an-effective-prompt
- https://thedailyprompt.org/prompt-guides/mastering-nano-banana-a-research-based-guide-to-googles-next-gen-prompting

### Negative prompts (deep dive aplicado)
- https://nowaythisisai.com/blog/negative-prompts-mid-2026-why-they-stopped-mattering-on-flux
- https://www.imagetoprompt.dev/blog/negative-prompts-stable-diffusion/
- https://ai-tldr.dev/learn/multimodal-ai/image-generation/negative-prompts-explained/
- https://www.aiphotogenerator.net/blog/2026/04/stable-diffusion-negative-prompt

### Consistência de personagem / identity locking
- https://selfielab.me/blog/nano-banana-pro-multi-ref-character-workflow-guide-20260313
- https://blog.wentuo.ai/en/nano-banana-pro-multi-image-reference-best-practices-en.html
- https://flowith.io/blog/nano-banana-consistent-characters-storyboard/
- https://prompting.systems/blog/nano-banana-pro-character-consistency-guide
- https://blog.laozhang.ai/en/posts/nano-banana-pro-face-consistency-guide
- https://nowaythisisai.com/blog/nano-banana-nano-banana-pro-how-creators-achieve-near-perfect-ai-character-consistency
- https://blog.picassoia.com/how-to-keep-characters-consistent-in-nano-banana-ai
- https://www.youtube.com/watch?v=f4HcdR3cd4M

### Style locking / consistência de série e marca
- https://aitoolsguidebook.com/en/articles/style-consistency-images/
- https://aitoolsguidebook.com/en/articles/consistent-image-style-prompt/
- https://rivya.ai/blog/ai-brand-visual-consistency
- https://tools.inyourleague.net/en/midjourney-style-reference-sref-consistent-brand-visuals-guide-en/
- https://www.humanacademy.ai/en/blog/variation-with-consistency
- https://www.aimagicx.com/blog/ai-brand-image-consistency-style-guide

### Motion prompting / vídeo (Veo, Kling, Seedance, Wan)
- https://medium.com/google-cloud/veo-3-a-detailed-prompting-guide-867985b46018
- https://www.eachlabs.ai/blog/structuring-veo-3-prompts-for-better-motion-control
- https://www.veo3ai.io/blog/veo-3-camera-control-prompts-2026
- https://pixeldojo.ai/guides/veo-3-1-prompting-guide
- https://dhl.veed.io/learn/veo-3-1-prompts
- https://replicate.com/blog/using-and-prompting-veo-3
- https://superprompt.com/blog/veo3-prompting-best-practices
- https://www.atlascloud.ai/blog/guides/wan-2.7-vs-seedance-2.0-vs-kling-3.0-which-video-api-should-developers-choose
- https://blog.segmind.com/kling-vs-seedance-ai-video-comparison/
- https://oakgen.ai/blog/seedance-2-vs-wan-2-7-motion-control
- https://wavespeed.ai/blog/posts/blog-seedance-2-0-prompt-template/
- https://morphed.app/blog/seedance-2-0-text-to-video
- https://allinoneaicenter.com/blog/kling-ai-motion-control-tutorial
- https://help.scenario.com/articles/6618023406-how-to-choose-the-right-video-model-2026-edition
- https://sureprompts.com/blog/ai-video-prompting-complete-guide-2026

### Look IA / realismo
- https://elements.envato.com/learn/realistic-ai-images
- https://blog.picassoia.com/how-to-avoid-the-ai-look-in-your-images
- https://www.hedra.com/blog/make-ai-images-look-like-real-photos-prompting
- https://artandalgorithms.ai/articles/creative/why-ai-images-look-ai
- https://aitoolsguidebook.com/en/articles/ai-poor-realism/
- https://artsmart.ai/blog/ai-image-prompts-photorealistic/
- https://aivideobootcamp.com/blog/photorealistic-ai-prompts-guide-2026/
- https://www.promptlibrary.space/blog/why-ai-images-look-generic-7-prompt-fixes-that-work-across-every-model

### AD vertical / hook / short-form
- https://www.veo3gen.app/blog/ai-video-prompts-for-marketers-the-9-line-ad-creative-brief-template-examples-fi
- https://adcreate.com/blog/vertical-video-ads-complete-guide
- https://adxmagic.com/guides/ai-video-ads/ai-tiktok-video-ads
- https://aitoolsguidebook.com/en/articles/social-ad-hook-prompts/
- https://ponpon.ai/seedance-2.0/vertical-video
- https://adxmagic.com/guides/ad-formats-platforms/vertical-video-ads-guide
