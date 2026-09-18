# Etapa 9 — Realismo (anti-perfeição, assinatura motion-blur): base teórica

> Pesquisa web, 2026-07-03. Etapa 9 do fluxo Jotaro 0.8: agente REALISMO audita o
> rascunho do prompt perguntando "o prompt busca REALISMO, não perfeição?".
> Assinatura da casa: motion blur + imperfeição realista, contra o look "IA perfeita demais".

## O que é e por que existe

A etapa REALISMO é um gate de auditoria: antes do render, o rascunho do prompt é
inspecionado contra o vocabulário e as escolhas visuais que produzem o look "IA
perfeita demais" — pele de plástico, luz de estúdio sem fonte, simetria estéril,
nitidez digital sem motion blur. A razão comercial é direta: o espectador de 2026
desenvolveu detecção de padrão para conteúdo sintético e para anúncio polido, e
ambos disparam ceticismo. Dois corpos de evidência sustentam a etapa:

1. **Uncanny valley / eeriness percebida**: quando um humano gerado é quase-mas-não-
   totalmente real, o espectador sente desconforto — e estudos com anúncios gerados
   por IA mostram que eeriness percebida reduz confiança e aceitação do anúncio
   (Wang & Li 2025; MDPI JTAER 2024, ver Fontes).
2. **Authenticity bias em ads**: conteúdo com estética imperfeita/UGC supera
   criativo polido em TikTok/Reels por margens estruturais (hook rate, CTR, CPA),
   porque não pattern-matcheia como "anúncio" (dados na seção seguinte).

Logo: um vídeo de marca que parece IA perde duas vezes — perde confiança por
eeriness e perde atenção por parecer ad polido. A imperfeição realista é defesa
contra os dois mecanismos ao mesmo tempo.

## Base teórica (com as descobertas da pesquisa)

### 1. AI tells — o que denuncia imagem/vídeo de IA

Levantamento consolidado de BBC Future (Hany Farid), MIT Media Lab (Detect Fakes),
Kellogg/Northwestern (taxonomia de Matt Groh), Corvinus University e GIJN:

- **Pele e textura**: pele cerosa/oversmoothed, sem poros, sem pelos finos, sem
  variação de pigmentação; "uncannily smooth skin textures" é o artefato mais
  citado, inclusive em modelos topo de linha (BBC, Techcabal). GIJN: "uncanny
  perfection not found in real photography — rostos reais têm assimetrias sutis,
  padrões de desgaste e efeitos ambientais".
- **Simetria e beleza exageradas**: "exaggeration of symmetry" é critério
  diagnóstico explícito no estudo da Corvinus; Kellogg: "the face just a little
  too gorgeous", cor oversaturada, sheen de Instagram.
- **Física e luz impossíveis**: sombras em ângulos inconsistentes com a fonte,
  reflexos errados ou ausentes, múltiplos pontos de fuga num mesmo frame (Farid/TED:
  IA é processo estatístico, não modela geometria nem física — anomalias físicas
  são evidência de geração).
- **Iluminação sem fonte**: mismatch entre luz do rosto e luz do fundo; luz "de
  estúdio" onde não há estúdio (Kellogg). Techcabal: em deepfake real, a luz do
  rosto ficou constante enquanto o sujeito passava diante de uma janela.
- **Anatomia e mãos**: dedos extras/faltando, dentes sobrepostos, unhas ausentes,
  membros fundindo com o ambiente (Kellogg, Corvinus).
- **Texto**: letras distorcidas, gibberish em placas/embalagens (Mashable, Corvinus).
- **Movimento**: ausência de micro-movimentos, shifts de peso e marcha irregular;
  animais/pessoas em loops perfeitamente cronometrados; fluidos em câmera lenta sem
  caos de splash (Mashable, Techcabal). Pele ao redor dos olhos que não enruga no
  sorriso (ausência de marcadores de Duchenne).
- **Ruído/grão**: fotos reais têm ruído de sensor com distribuição natural; imagens
  de IA têm ruído "matematicamente perfeito" com padrões estrela detectáveis
  (Farid/TED, GIJN: "real photos have natural chaos").
- **Fundo**: objetos de fundo que se movem de forma impossível, multidões
  borradas/distorcidas, cenário "overly cinematic" (BBC, Corvinus, Kellogg).

Nota tática (BBC/Farid): vídeos de IA convincentes hoje tendem a se esconder atrás
de baixa qualidade proposital (compressão, blur) — ou seja, imperfeição *aleatória*
também é usada para enganar. A assinatura da casa não é degradar a imagem: é
imperfeição *fotográfica motivada* (grão, blur de obturador, luz com fonte), não
sujeira genérica.

### 2. Uncanny valley — o mecanismo

Mori (1970, tradução IEEE Spectrum): a resposta afetiva a uma entidade quase-humana
despenca de empatia para repulsa justamente quando a semelhança se aproxima — mas
não atinge — o real. Aplicado a ads: estudos de 2024-2025 (MDPI JTAER; Wang & Li)
encontram que **perceived eeriness reduz confiança percebida, e confiança medeia a
aceitação do anúncio gerado por IA**. Gutuleac et al. (2024, Psychology & Marketing)
sobre virtual influencers: imperfeições visuais *do tipo errado* (textura de pele
não-natural, cabelo estranho) geram dissonância cognitiva e desconforto; cues
sociais reais mitigam o efeito. Tradução prática: o objetivo não é "menos perfeito"
genérico — é sair do vale por cima, parecendo capturado, ou aceitar estilização
franca; o meio-termo "quase-foto-perfeita" é o pior lugar.

### 3. Imperfeições que criam realismo em cinema/fotografia

- **Motion blur — regra do shutter 180°**: shutter = metade do período do frame
  (24fps → 1/48s). Esse montante de blur "bate com a persistência de visão do olho
  humano" e é o que o cérebro aceita como movimento contínuo natural; sem blur o
  footage fica "choppy, stuttery, staccato" — cada frame parece desconectado do
  próximo (Wipster, ToolsForFilm, In Depth Cine, ExpertPhotography). Desvios são
  ferramenta expressiva: Saving Private Ryan usou shutter 45-90° + handheld para
  urgência crua. **Ponto-chave para a assinatura**: nitidez total em movimento é um
  AI tell; blur calibrado tipo-180° é o que faz o movimento "parecer filmado".
- **Handheld / micro-shake**: movimento orgânico leve sinaliza operador humano;
  "documentary-style projects benefit from controlled handheld work — the slight
  natural movement adds authenticity" (DIY Photography). Runway lista "handheld
  shake adds documentary realism and urgency" como qualidade de movimento nomeável.
- **Luz motivada / practicals**: Deakins — "I like justification for lighting in a
  shot. I think it adds a kind of realism... I hope you believe the lighting is
  real"; luz sem motivação "takes me out of the film" (StudioBinder). Luz precisa
  ter fonte crível no mundo da cena (janela, abajur, tela, neon) — exatamente o que
  o look "estúdio irreal" da IA viola. HowToFilmSchool: o truque não é realismo
  literal, é a luz *parecer justificada*.
- **Grão de filme / ruído ISO**: grão é a textura de captura; imagem sem ruído
  nenhum lê como render (Miraflow: "perfect, noiseless quality" é um dos sinais
  mais claros de imagem gerada).
- **Óptica imperfeita**: aberração cromática em bordas de alto contraste, vinheta,
  distorção de lente, lens flare orgânico, foco raso com plano focal fino —
  evidências de vidro real (BrightCoding, Miraflow).
- **Composição imperfeita**: enquadramento levemente descentrado, candid/não-posado,
  sujeito não olhando pra câmera, foreground fora de foco entrando no quadro —
  escolhas de operador humano, não de otimizador (Miraflow, Covefox).

### 4. Estética UGC/amadora deliberada em ads — os dados

- Stackmatix (dados agregados 2026): UGC-style vs polished — 3-second view rate
  42-55% vs 22-34%; CTR +90-100%; CPA 30-50% menor; through-play +70-80%.
- DansUGC: engajamento 40-80% maior; scripts idênticos entregues por clientes reais
  vs atores profissionais convertem 35-55% melhor — "authenticity trumps polish".
  "The slight shakiness, natural lighting variations, and authentic environments
  signal 'real content' rather than 'advertisement'".
- Benly: TikTok +47% completion rate para UGC; polished fica -12% abaixo da média
  na plataforma. (Inverso em LinkedIn/YouTube, onde polido ganha.)
- MHI Growth Engine (estudo 2026): estética UGC supera estúdio em 31% em média;
  feedback de usuário literal: versão polida "looked too much like an ad", versão
  UGC "like a friend recommending something". Fadiga de IA deixou consumidores
  hiper-céticos — presença imperfeita e humana sinaliza "real person, real stakes".
- Mecanismo (Ads & Scale, Do Times): o feed é primeira-pessoa, handheld, informal;
  ad polido registra como interrupção "antes do cérebro, no polegar". Nielsen: 80%+
  confiam mais em recomendação de pessoa do que em mensagem de marca.
- **Limite documentado**: luxo, alto AOV, B2B e retargeting favorecem polimento;
  e "UGC" super-dirigido (roteiro palavra-por-palavra) performa pior que estúdio —
  formato autêntico com textura de ad é o pior dos dois mundos (Ads & Scale, Modo25).

### 5. Vocabulário de prompt — o que induz cada look

Convergência de 6 guias (justoborn, BrightCoding, AVB, Covefox, ThePixelParadox,
Miraflow) + guias de vídeo (Runway oficial, VideoAI.me para Kling):

- Termos de "qualidade" genérica ("8K", "highly detailed", "masterpiece") ancoram
  o modelo em render 3D/game — "using '8K' actually ruins realism... plastic, CGI
  aesthetic. Use camera names instead" (justoborn).
- "Perfect skin" gera plástico; pedir "natural skin texture, visible pores" gera
  pele (Covefox: "perfect skin is the enemy of realistic AI photos").
- Linguagem interpretativa ("stunning", "ethereal", "beautiful", "dreamlike") puxa
  para ilustração; linguagem fotográfica ("captured", "shot on", "candid moment")
  ancora em captura (AVB).
- "Cinematic" + "photorealistic" juntos se contradizem — cinematic puxa color-grade
  dramático, photorealistic puxa foto crua; escolher um (Covefox).
- Para vídeo, a própria Runway usa como exemplo oficial: "Handheld documentary film
  style. Natural camera shake. Raw indie film aesthetic. Natural lighting.
  Unpolished, authentic look. Low budget realism. Observational feel."
- VideoAI.me (Kling): "slight handheld drift" é "o truque de realismo de maior
  impacto"; checklist de realismo inclui fonte de luz física nomeada com direção,
  uma micro-ação entre beats (olhar, ajeitar), uma imperfeição de ambiente
  (bagunça, roupa amassada), paleta levemente dessaturada, e negative com
  "plastic skin, digital sharpness, oversaturated".
- Runway: preferir frase positiva — "no camera shake" pode produzir shake; dizer o
  que quer ver ("smooth, stable camera movement" / "slight handheld drift").

## Opções e vocabulário que o agente tem à disposição

### Léxico pró-realismo (permitido/encorajado)

| Camada | Vocabulário |
|---|---|
| Captura | shot on 35mm lens / 85mm portrait lens, Kodak Portra 400, ISO 800-1600, DSLR photo, IMG_xxxx candid photograph |
| Movimento | natural motion blur, 180-degree shutter feel, slight handheld drift, handheld tracking, micro camera shake, motion blur on background |
| Luz | natural window light, available light, overcast daylight, golden hour backlight, practical lamp light, motivated lighting, single light source with real falloff, harsh midday sun |
| Textura | subtle film grain, sensor noise in shadows, natural skin texture, visible pores, flyaway hairs, fabric grain, matte finish |
| Óptica | shallow depth of field, f/1.8 look, soft organic lens flare, slight vignette, chromatic aberration at high-contrast edges, out-of-focus foreground |
| Atitude | candid, unposed, documentary-style, observational, mid-gesture, not looking at camera, off-center framing, lived-in environment, unedited photo look, iPhone feel (para registro UGC) |
| Cor | muted natural palette, slightly desaturated, natural color grading, analog film colors |
| Micro-vida | steam rising, curtains drifting, clutter on counter, wrinkled shirt, sweat visible, breeze in hair |

### Léxico proibido (induz look IA)

- **Qualidade genérica**: 8K, 4K UHD, ultra-detailed, hyper-detailed, masterpiece,
  best quality, award-winning, trending on ArtStation
- **Perfeição**: perfect, flawless, perfect skin, perfect symmetry, immaculate,
  pristine, polished
- **Interpretativo/ilustrativo**: beautiful, stunning, gorgeous, ethereal, magical,
  dreamlike, epic
- **Luz irreal**: studio lighting (sem cena de estúdio), perfect lighting, evenly
  lit, glowing, volumetric rays gratuitos, ring light frontal
- **Render**: CGI, octane render, unreal engine, 3D, ultra-sharp, digital sharpness
- **Combinação contraditória**: "cinematic" empilhado com "photorealistic"

### Negative prompt padrão da casa (quando o modelo suporta)

`plastic skin, oversmoothed, waxy, digital sharpness, oversaturated, perfect
symmetry, studio lighting, CGI, 3D render, frozen expression, jittery eyes`

## Como aplicar no fluxo 0.8 (prático)

### Perguntas de auditoria do agente REALISMO sobre o rascunho

1. **Movimento**: o prompt pede/permite motion blur natural (sensação 180°) e algum
   handheld drift, ou vai sair nitidez congelada em movimento?
2. **Luz**: toda luz descrita tem fonte crível nomeada com direção (janela, practical,
   sol nublado)? Existe "studio lighting" ou luz sem motivação no texto?
3. **Pele/textura**: há pedido explícito de textura natural (poros, grão), ou o texto
   deixa o modelo defaultar para pele lisa?
4. **Léxico proibido**: aparece algum termo da lista proibida (8K, perfect, masterpiece,
   beautiful...)? Remover ou substituir por equivalente fotográfico.
5. **Composição**: o quadro é candid/levemente descentrado, ou está simétrico-frontal-
   posado (assinatura de IA)?
6. **Micro-vida**: existe ao menos uma micro-ação humana e uma imperfeição de ambiente
   (bagunça, amassado, vapor, brisa)? Ambientes estéreis leem como render.
7. **Cor**: paleta natural/levemente dessaturada, ou saturação neon default?
8. **Coerência com formato**: o registro (UGC-iPhone vs documental-35mm vs comercial
   limpo) foi escolhido de propósito e é consistente no prompt inteiro?
9. **Frase positiva**: as instruções de imperfeição estão em linguagem positiva
   ("slight handheld drift"), não negativa ("no shaky camera")?

### Como aplicar a assinatura sem virar clichê

- **A assinatura é motivada, não decorativa.** Motion blur nasce do movimento real da
  cena (sujeito andando, pan da câmera), nunca "add motion blur" solto sobre cena
  estática — blur sem movimento é outro artefato.
- **Dose por registro, não receita fixa.** UGC-vertical: iPhone feel + handheld +
  available light, quase zero grão nomeado (o registro já carrega). Documental:
  35mm + grão sutil + observational. Comercial premium (alto AOV): manter luz
  motivada e textura de pele, reduzir shake — os dados mostram que polimento vence
  em luxo/retargeting; a assinatura vira sutileza, não estética lo-fi.
- **1-2 imperfeições por camada, não todas.** Guias convergem em "pick 1-2 authentic
  flaws" (BrightCoding). Empilhar grão + aberração + vinheta + flare + shake no
  mesmo prompt produz pastiche "faux-vintage", que é tão detectável quanto o
  plástico.
- **Imperfeição fotográfica ≠ degradação.** Nunca simular qualidade ruim (compressão,
  blur de foco errado) para esconder artefatos — essa é a tática de deepfake que a
  BBC descreve, e mina a marca. A casa quer captura crível, não sujeira.
- **Anti-clichê**: variar a fonte de luz motivada entre shots (janela / practical /
  externa nublada), variar o descentramento, alternar quais imperfeições entram.
  Se todo vídeo da casa sair "golden hour + film grain + lens flare", isso vira o
  novo uniforme detectável.

## Mudanças sugeridas ao fluxo 0.8

1. **Lista proibida como check mecânico, não julgamento.** O agente REALISMO deveria
   ter o léxico proibido como blocklist literal (grep no rascunho) antes da auditoria
   qualitativa — barato e elimina a classe inteira de regressão.
2. **Assinatura parametrizada por registro.** O rascunho já carrega formato/tom das
   etapas anteriores; REALISMO deveria aplicar dose de imperfeição em 3 presets
   (UGC / documental / premium) em vez de uma assinatura única — os dados de UGC vs
   polished mostram que a dose certa depende de funil e categoria.
3. **Regra de frase positiva.** Toda correção de REALISMO deve reescrever em positivo
   ("locked tripod" / "slight handheld drift"), nunca inserir negações no corpo do
   prompt — modelos de vídeo ecoam o termo negado (documentado pela Runway).
4. **Teto de imperfeições.** Máximo de ~2 flaws ópticos + 1 de textura + 1 de
   movimento por prompt, para a assinatura não colapsar em pastiche vintage.
5. **Micro-vida obrigatória.** Se o rascunho não tiver nenhuma micro-ação humana nem
   imperfeição de ambiente, REALISMO injeta uma — é o item de maior impacto por
   palavra segundo os guias de vídeo (Kling/VideoAI.me).

## Fontes (URLs completas)

- https://www.bbc.com/future/article/20251031-the-number-one-sign-you-might-be-watching-ai-video — BBC Future / Hany Farid: sinais de vídeo IA, tática da baixa qualidade
- https://www.media.mit.edu/projects/detect-fakes/overview/ — MIT Media Lab Detect Fakes: artefatos de deepfake (pele, sombras, glare, piscar)
- https://insight.kellogg.northwestern.edu/article/ai-photos-identification — Kellogg/Groh: 5 categorias de artefatos (anatomia, estilo, física, sociocultural)
- https://www.uni-corvinus.hu/post/hir/dont-be-fooled-eight-ways-to-spot-ai-generated-images/?lang=en — Corvinus: 8 critérios visuais, incl. exagero de simetria
- https://gijn.org/resource/guide-detecting-ai-generated-content/ — GIJN: "uncanny perfection", ruído, pontos de fuga, consistência de sombras
- https://techcabal.com/2026/03/12/how-to-tell-if-a-video-is-ai-generated/ — Techcabal: pele cerosa em Sora 2, marcadores de Duchenne, fluidos, rPPG
- https://mashable.com/article/how-to-know-if-viral-video-is-ai — Mashable: física, texto, micro-movimentos, áudio limpo demais
- https://www.youtube.com/watch?v=q5_PrTvNypY — TED / Hany Farid: ruído estrela, vanishing points, sombras e fonte de luz
- https://web.ics.purdue.edu/~drkelly/MoriTheUncannyValley1970 — Mori 1970 (trad. IEEE Spectrum): ensaio original do uncanny valley
- https://doi.org/10.1002/mar.21989 — Gutuleac et al. 2024: virtual influencers, uncanny valley e cues sociais
- https://www.mdpi.com/0718-1876/19/3/108 — JTAER 2024: perceived eeriness reduz confiança/aceitação de ads gerados por IA
- https://doi.org/10.54097/eqv6ek17 — Wang & Li 2025: eeriness → confiança → aceitação de anúncio IA (mediação)
- https://expertphotography.com/photography-180-degree-rule — regra do shutter 180°, comparação de shutter speeds
- https://www.wipster.io/blog/debunking-the-180-degree-shutter-rule — motion blur = shutter speed; 1/48s como blur "natural ao olho"
- https://www.indepthcine.com/videos/shutter-angle — shutter angle, Saving Private Ryan 45-90°, Gladiator
- https://www.toolsforfilm.com/blog/exposure-triangle-for-cinematographers — por que 180° "bate" com a persistência de visão
- https://www.diyphotography.net/cinematic-video-settings/ — handheld intencional, 24fps, motion blur natural
- https://www.youtube.com/watch?v=G_0M_GHw9GI — StudioBinder / Deakins: practical lighting e justificação da luz
- https://www.studiobinder.com/blog/what-is-practical-lighting-in-film/ — practicals, motivated lighting, realismo
- https://howtofilmschool.com/dictionary/motivated-lighting/ — luz motivada: crível, não literal
- https://dansugc.com/blog/tiktok-ugc-ads-vs-regular-tiktok-ads-which-performs-better — UGC +40-80% engajamento; real vs ator +35-55% conversão
- https://www.stackmatix.com/blog/tiktok-ugc-ads-performance-data — tabela UGC vs polished (3s view, CTR, CPA, through-play)
- https://www.adsandscale.com/blog/ugc-vs-studio-creative — hook rates, over-briefed UGC como pior dos dois mundos, exceções premium
- https://dotimes.co.uk/ugc-vs-studio-ads-what-converts-better-on-tiktok-and-why/ — mecanismo de trust/pattern-matching, Nielsen
- https://benly.ai/learn/ad-creative/ugc-vs-polished-ads — tabela por plataforma (TikTok +47% completion; LinkedIn/YouTube invertem)
- https://mhigrowthengine.com/blog/dtc-ad-creative-whats-working-2026/ — UGC aesthetic +31%; fadiga de IA e ceticismo do consumidor
- https://modo25.com/blog/paid-social/how-to-test-ugc-vs-polished-creative-in-paid-ads/ — liberdade criativa vs script rígido
- https://justoborn.com/hyperrealistic-ai-art/ — "8K arruina realismo"; lentes, film stocks, imperfeições de pele
- https://www.blog.brightcoding.dev/2025/12/10/the-guide-to-creating-blindingly-realistic-ai-images-40+-keywords-that-fool-professional-photographers — léxico em camadas, "pick 1-2 authentic flaws"
- https://aivideobootcamp.com/blog/photorealistic-ai-prompts-guide-2026/ — linguagem fotográfica vs interpretativa, checklist de realismo
- https://covefox.com/how-to-make-ai-photos-look-like-real-dslr-shots/ — "perfect skin é o inimigo"; cinematic × photorealistic se contradizem
- https://thepixelparadox.com/photorealistic-prompt-templates/ — template camera+luz+constraints; negatives padrão
- https://miraflow.ai/blog/how-to-make-ai-images-look-like-real-photos-prompt-tricks — grão/ISO, aberração, vinheta, foreground fora de foco
- https://help.runwayml.com/hc/en-us/articles/47313737321107-Text-to-Video-Prompting-Guide — prompt oficial "handheld documentary... unpolished, authentic look"
- https://runwayml.com/resources/ai-video-prompting-guide — frase positiva; handheld shake = realismo documental
- https://videoai.me/blog/kling-ai-realistic-prompts — "slight handheld drift" como truque nº1; checklist de 7 itens; negatives de vídeo
