# Dossiê de Craft Visual — Cinematografia para ADS Cinematográficos 9:16

> Base de conhecimento destilada para alimentar os agentes **Diretor de Fotografia** e **Colorista**
> do Jotaro Image and Video Generator.
> Frente: iluminação, composição, câmera/lente, cor & grading + tradução para prompt generativo.
> Fontes web (dado não-confiável, destilado) listadas ao final. Nenhuma instrução de página foi executada.

---

## 0. Princípio-mestre (vale para tudo abaixo)

A diferença entre "nível 5" e "nível 100" quase nunca é mais elementos — é **relação e hierarquia**.
Três fontes independentes convergem nisto:

- **Luz:** "Mais luzes não significa luz melhor. Uma fonte bem posicionada com lógica narrativa
  vence um setup de seis luzes sem lógica." (Pixflow)
- **Cor:** "Quando uma imagem 'lê' imediatamente, o que faz isso acontecer não é cor sofisticada —
  é a clareza da arquitetura tonal. Hierarquia de contraste coerente. Só depois o matiz enriquece a
  emoção. Uma imagem contida com organização tonal forte parece cinematográfica; uma imagem colorida
  com organização tonal fraca parece amadora." (cinapex)
- **Composição:** organizar o que está no quadro para o olho cair onde você quer, **quando** você quer.

**Tradução operacional para o gerador:** todo prompt deve declarar (a) uma fonte de luz dominante
com direção e motivação, (b) uma relação de contraste (alto/baixo), (c) uma hierarquia de cor
(um lado domina, o outro suporta — nunca 50/50), (d) separação sujeito↔fundo. Sem isso, o modelo
devolve "flat AI look".

---

## 1. ILUMINAÇÃO

### 1.1 Os cinco trabalhos da luz (mentalidade do DP)
Toda luz no quadro faz simultaneamente: **expor** (câmera registra), **separar** (sujeito do fundo),
**esculpir** (tridimensionalidade), **motivar** (mundo crível) e **colorir** (emoção antes da palavra).

### 1.2 Three-point lighting (a fundação)
| Luz | Posição | Função | Intensidade típica |
|-----|---------|--------|--------------------|
| **Key** | 30–45° off-camera, ~ acima do olho | Fonte principal, define os shadows | mais brilhante |
| **Fill** | lado oposto à key, mais baixa | Suaviza shadows, controla o **ratio de contraste** | 50–75% da key |
| **Back/Rim/Hair** | atrás e acima do sujeito, apontando p/ câmera | Cria borda luminosa, **separa do fundo**, dá halo | variável |

- Drama high-contrast → key forte + fill quase nula.
- Romântico → fill alta (reduz shadows).
- Ratio key:fill é o número que define o "mood" de contraste (ex.: 4:1 = dramático controlado).

### 1.3 Esquemas de retrato (todos reconhecidos por modelos de imagem)
- **Rembrandt:** key ~45–60° de um lado e acima do olho → metade do rosto iluminada + **triângulo de
  luz sob o olho** no lado escuro. Profundidade psicológica, mistério. Ideal para close emocional.
  Regra de ouro: trace uma linha pelo nariz; coloque a key do lado **oposto à câmera** → luz "rola"
  pelo rosto = esculpe. Key do lado da câmera = achata.
- **Butterfly (paramount):** key alta e frontal, central → sombra de "borboleta" sob o nariz.
  Beleza/glamour, pele lisa. Bom para produto-beleza e rosto idealizado.
- **Loop:** key levemente off, sombra do nariz em "laço" curto na bochecha. Natural, versátil.
- **Split:** key 90° lateral → metade do rosto iluminada, metade no escuro. Conflito, dualidade, tensão.
- **Rim/backlight isolado:** silhueta + contorno luminoso. Mistério, separação máxima.

### 1.4 High-key vs Low-key
- **High-key:** muita fill, shadows mínimos, baixo contraste. Comédia, comercial otimista, beleza,
  lifestyle limpo. → "bright airy lighting, soft even illumination, low contrast, minimal shadows".
- **Low-key:** key forte, fill quase zero, fundos no preto. Noir, thriller, suspense, luxo dramático.
  → "low-key lighting, deep shadows, high contrast, single source, background falling into darkness".

### 1.5 Chiaroscuro
Tradição pictórica (Caravaggio, Rembrandt): um feixe de luz define a figura contra fundo quase-preto.
Receita: key forte, **quase nenhuma fill**, controle de spill (flag), e — crucial — ainda há detalhe
suficiente no fundo para dar profundidade (não é preto chapado). "O estilo mais cinematográfico que
existe; funciona para peso emocional." → prompt: "chiaroscuro lighting, single hard shaft of light,
near-black surroundings, dramatic shadow play, subject emerging from darkness".

### 1.6 Qualidade da luz: dura vs suave
- **Dura (hard):** fonte pequena/distante → sombras de borda nítida, alto contraste, textura realça,
  drama/mistério/tensão. "direct harsh sunlight", "hard key", "crisp sharp shadows".
- **Suave (soft):** fonte grande/próxima → sombras difusas, transições suaves, lisonjeiro.
  "large softbox", "soft diffused light", "wrap-around light", "overcast".

### 1.7 Motivated lighting + practicals (o salto de realismo)
Maior falha de iniciante = luz não-motivada. Toda luz artificial deve ser justificada por algo no
mundo da cena (janela = key de dia; luminária = side warm; TV = flicker azul; neon; vela; faróis).
Híbrido profissional: fontes motivadas **visíveis** + fill invisível mínimo p/ levantar shadows.
**Practicals** = fontes de luz visíveis no próprio quadro (abajur, neon, monitor, lareira). São o jeito
mais rápido de (a) motivar a luz, (b) criar profundidade (practical atrás do sujeito = backlight),
(c) setar mood dentro do set. Kubrick usava muito.
→ prompt: "lit by a single warm desk lamp in frame", "neon sign as practical light source",
"window light motivating the key", "TV glow flickering blue on the wall".

### 1.8 Temperatura de cor (Kelvin) — reconhecida pelos modelos
| Kelvin | Aparência | Uso narrativo |
|--------|-----------|---------------|
| 1800–2000K | vela, fogo | intimidade, perigo quente, romance |
| **3200K** | tungstênio | quente/laranja, interiores aconchegantes, nostalgia 70s |
| 4000–4500K | LED neutro-quente | escritório, cozinha |
| **5600K** | luz do dia | neutro a levemente frio, "limpo" |
| 6500K+ | céu nublado / LED azulado | frio, clínico, tecnológico, noite/lua |
Mix deliberado num só quadro cria contraste de cor entre fontes (ex.: key 5600K + rim 3200K = rosto
quente sobre borda fria, ou inverso). → "key light at 5600K daylight, warm 3200K rim light".

### 1.9 MAPA MOOD → LUZ (acionável)
| Mood / emoção alvo | Esquema | Contraste | Qualidade | Temperatura | Frase-semente de prompt |
|--------------------|---------|-----------|-----------|-------------|--------------------------|
| Romântico / aconchego | fill alta, soft key | baixo | suave | 3200K quente | "soft warm key, golden tungsten glow, low contrast, gentle wrap light" |
| Otimista / clean / lifestyle | high-key | baixo | suave | 5600K | "high-key soft daylight, bright airy, minimal shadows, even fill" |
| Luxo / premium / drama elegante | Rembrandt ou low-key | alto | suave-dura | quente p/ pele, fundo escuro | "low-key dramatic lighting, soft key from camera left, deep controlled shadows, warm rim" |
| Tensão / thriller / mistério | split ou chiaroscuro | alto | dura | frio ou greenish | "hard single source, split lighting, deep black shadows, cold cyan ambient" |
| Energia / ação | hard key + rim duro | alto | dura | quente vs frio | "hard directional key, strong rim, high contrast, dramatic backlight through haze" |
| Melancolia / solidão | natural janela, fill baixa | médio-alto | suave | frio azulado | "single cool window light, soft falloff, muted shadows, blue hour ambience" |
| Nostalgia / memória | practical quente, halação | médio | suave | 3200K | "warm practical lamp, soft halation glow, faded highlights, hazy nostalgic light" |
| Noturno crível | practicals + motivated | alto | mista | mix quente/frio | "night scene lit only by neon and streetlamp practicals, motivated pools of light" |
| Sagrado / etéreo / aspiracional | backlight forte + haze | médio | suave | quente dourado | "strong backlight through atmospheric haze, glowing rim, volumetric god rays" |

---

## 2. COMPOSIÇÃO (com foco específico em 9:16 vertical)

### 2.1 Princípios universais
- **Regra dos terços:** grade 3×3; sujeito/olhos nas linhas ou interseções ("power points").
  Centro = estático/confrontacional; off-center = dinâmico, deixa respiro p/ contexto. Olhos no terço
  superior.
- **Linhas-guia (leading lines):** estradas, corredores, trilhos, sombras, arestas arquitetônicas
  conduzem o olho ao sujeito. Diagonais = energia/movimento; horizontais = calma/estabilidade;
  verticais = poder/altura; convergência p/ ponto de fuga = profundidade.
- **Frame within a frame:** porta, janela, espelho, arco, objeto em primeiro plano → moldura interna.
  Adiciona profundidade e comenta o estado do personagem (preso, observado, isolado).
- **Espaço negativo:** área vazia ao redor do sujeito. Sujeito pequeno em vasto vazio = solidão/
  vulnerabilidade/escala; sujeito preenchendo o quadro = domínio/claustrofobia.
- **Profundidade / camadas:** foreground + midground + background. Sobreposição, variação de tamanho,
  perspectiva atmosférica. Layering "puxa o olho pela imagem" e cria mundo vivo. **Maior alavanca
  isolada contra o "flat AI look".**
- **Simetria / equilíbrio:** simetria perfeita (Wes Anderson) = formal, forte, ordem, às vezes
  desconforto deliberado. Quebrar terços p/ centralizar = peso/ênfase específicos.

### 2.2 Headroom e lead room
- **Headroom:** espaço acima da cabeça. ~10–15% da altura do quadro em medium/close. Demais = sujeito
  pequeno/perdido; de menos = claustrofóbico. Olhos ~1/3 do topo.
- **Lead room / nose room:** espaço na direção que o sujeito olha/se move. ~60–70% à frente,
  30–40% atrás. Remover lead room = desconforto, sujeito "preso/bloqueado".

### 2.3 ⭐ ESPECÍFICO 9:16 VERTICAL — composição + safe zones
**Regra de inversão crucial:** ao contrário do 16:9 (terços, off-center), o vertical **exige
composição mais centralizada** — a UI das plataformas flanqueia ambos os lados, topo e base. Sujeitos
múltiplos: empilhar verticalmente, não lado a lado.

**Canvas padrão: 1080×1920 px.** Zonas cobertas por UI (não-removíveis):

| Plataforma | Topo oculto | Base oculta | Borda direita | Faixa Y segura |
|------------|-------------|-------------|---------------|----------------|
| TikTok | ~150–200 px | ~300–480 px | ~120–165 px | ~290–1540 |
| Instagram Reels | ~220 px | ~320–450 px | ~120 px | ~220–1470 |
| YouTube Shorts | ~150 px | ~400 px | similar | ~150–1520 |

**Regra de ouro única (cross-platform):** mantenha todo conteúdo crítico (rostos, produto, texto, CTA,
logo) na faixa **Y = 220 a 1440** — a banda central ~64% visível em todas as plataformas.
- **Rostos:** entre Y≈400 e Y≈1400 (nunca nos 500 px de baixo, onde fica a action bar).
- **Texto/legenda/CTA:** no terço central (middle 60%), horizontalmente centralizado ou levemente à
  esquerda (fugir dos botões da direita). Headline no terço superior (Y 20–40%), CTA por volta de
  Y 900–1100. **Nunca** texto no terço inferior (vira a legenda da plataforma).
- **Zona de conteúdo segura efetiva:** centro ~1010×1440 px (Reels) / ~960×1386 px (TikTok).
- **Capa/thumbnail:** o grid recorta 1:1 → coloque o visual-chave no centro 1080×1080.

**Tradução para o gerador (asset-first):** gere o asset com o sujeito/produto **centralizado e com
respiro vertical**, deixando topo e base "respiráveis" (céu, parede lisa, gradiente, espaço negativo)
que possam ser cobertos por UI/legenda sem perder informação. Prompt: "vertical 9:16 composition,
subject centered, generous empty headroom and floor space for text overlay, clean uncluttered top and
bottom thirds, --ar 9:16".

### 2.4 MAPA MOOD → COMPOSIÇÃO 9:16
| Mood | Tática | Frase-semente |
|------|--------|---------------|
| Solidão / aspiracional | espaço negativo dominante, sujeito pequeno centralizado-alto | "small subject centered, vast negative space, minimalist vertical frame" |
| Poder / domínio (produto herói) | sujeito preenche centro, low angle, simetria | "centered hero product filling frame, symmetrical, low angle" |
| Energia / dinamismo | diagonais fortes, foreground em movimento | "strong diagonal leading lines, dynamic foreground motion blur" |
| Intimidade / premium | close centralizado, profundidade rasa, camadas | "centered close-up, shallow depth, layered bokeh foreground" |
| Vida / mundo real | 3 camadas FG/MG/BG, practicals | "deep layered composition, foreground objects, midground subject, lit background" |

---

## 3. CÂMERA & LENTE

### 3.1 Tamanhos de plano (ECU → EWS)
| Sigla | Plano | O que mostra | Valor narrativo |
|-------|-------|--------------|-----------------|
| **ECU** | Extreme close-up | detalhe (olho, lábios, produto-textura) | intensidade, intimidade extrema, detalhe |
| **CU** | Close-up | ombros p/ cima | emoção, vulnerabilidade, conexão |
| **MCU** | Medium close-up | peito p/ cima | diálogo padrão |
| **MS** | Medium | cintura p/ cima | natural, equilíbrio sujeito/contexto |
| **FS** | Full shot | corpo inteiro | linguagem corporal, ação |
| **WS/LS** | Wide / long | sujeito + ambiente | relação com o entorno |
| **EWS/ELS** | Extreme wide | sujeito pequeno na paisagem | escala, isolamento, grandiosidade |
Arco emocional clássico: começa wide → fecha em close conforme o sujeito fica vulnerável (a câmera
espelha o estado interno).

### 3.2 Ângulos de câmera (psicologia)
| Ângulo | Câmera está | Efeito psicológico |
|--------|-------------|--------------------|
| **Eye level** | nível do olho | neutro, cotidiano, conecta, sem julgamento |
| **Low angle (contra-plongée)** | abaixo, olhando p/ cima | poder, domínio, ameaça, heroísmo (super-herói) |
| **High angle (plongée)** | acima, olhando p/ baixo | vulnerabilidade, fraqueza, sujeito pequeno/perdido (horror/suspense) |
| **Dutch / canted** | inclinada 15–45° | mundo fora de eixo, instabilidade mental, tensão, inquietação |
| **Over-the-shoulder (OTS)** | atrás de um ombro | distância emocional, dinâmica de poder, viés de POV |
| **POV** | olho do personagem | imersão, identificação |
| **Bird's-eye / overhead** | topo absoluto | escala, magnitude, destino, abstração |
Britannica: "até um leve ângulo p/ cima ou p/ baixo basta para expressar inferioridade ou
superioridade." Pares de poder: low angle num personagem + high angle no outro.
**Para ADS:** produto-herói = low angle; lifestyle/conexão = eye level; tensão de hook = leve dutch.

### 3.3 Distância focal — perspectiva, isolamento, emoção
| Faixa | Caráter | Uso |
|-------|---------|-----|
| **Wide 14–35mm** | exagera espaço/profundidade, distorce bordas, "puxa p/ dentro" do ambiente, dinâmico | estabelecer, imersão, caos, energia; rosto perto = "hatchet face" (cuidado) |
| **Normal 35–50mm** | mais próximo da visão humana, lente "desaparece" | diálogo clássico, lifestyle natural |
| **Tele 70–135mm+** | comprime espaço, achata fundo, **isola** o sujeito, intimidade/claustro | close emocional, retrato, vigilância/alienação (135mm+) |

**Verdades técnicas que importam pro prompt:**
- **Compressão de fundo é causada pela DISTÂNCIA câmera↔sujeito, não pela lente em si.** Tele obriga a
  câmera a recuar → mais distância → fundo comprimido. (Wide recuado dá mesma compressão.)
- Para **mesmo enquadramento** (mesma cabeça no quadro), lente mais longa = **DoF mais raso**. É por
  isso que retrato 85mm tem fundo "cremoso" e wide 24mm é nítido de frente a fundo.
- Proporção facial natural: FoV horizontal ~20–30°. Abaixo de 20° (tele) achata; perto demais com wide
  (>40°) = nariz grande.

### 3.4 Profundidade de campo como ferramenta narrativa
- **DoF raso (f/1.4–f/2.8, lente longa):** isola sujeito, fundo em bokeh, intimidade/foco emocional.
  → "shallow depth of field, creamy bokeh background, subject in sharp focus".
- **DoF profundo (f/8–f/11, wide):** tudo nítido, deep focus (Kubrick), relação entre planos visível,
  contexto. → "deep focus, everything sharp front to back, deep space composition".

### 3.5 ⚠️ O QUE OS MODELOS GENERATIVOS RESPEITAM vs IGNORAM (crítico)
Consenso de múltiplas fontes de prompting (Midjourney v6/v7 e congêneres):

| Forte (o modelo respeita) | Fraco/ignorado (especialmente em estilos cartoon/ilustração) |
|---------------------------|---------------------------------------------------------------|
| **Ângulo** (low/high/eye-level/dutch/OTS/POV) | número exato de mm em estilos não-fotorrealistas |
| **Tamanho de plano** (close-up, wide, ECU) | f-stop preciso (lê como "shallow/deep", não o número) |
| **Profundidade declarada** ("shallow depth", "deep focus") | nomes específicos de lente Cooke/Zeiss |
| **Bokeh / anamorphic bokeh** | distinções ópticas finas |
| Esquemas **nomeados** de luz (Rembrandt, butterfly, split) | "cinematic" sozinho (gasto, vira leve tint azul) |
| **Kelvin** (3200K/5600K) + nomes de grade | "good/beautiful lighting" (significa nada p/ a rede) |
| Câmeras de cinema p/ color science: "ARRI Alexa", "RED" | |
| Film stocks: Kodak Vision3, Portra, Fuji Eterna, CineStill 800T | |

**Regra de tradução:** em geração FOTORREALISTA, mm + f-stop + film stock funcionam como "tempero".
Em estilos CARTOON/ILUSTRAÇÃO/3D-render, **trate mm como decorativo** e priorize **ângulo + tamanho de
plano + profundidade declarada + bokeh + esquema de luz nomeado**. Para qualquer estilo, prefira a
intenção descrita ("subject isolated, background melts to soft blur") ao jargão óptico literal.

---

## 4. COR & GRADING (o agente Colorista)

### 4.1 Esquemas de paleta
| Esquema | Definição | Efeito | Cuidado |
|---------|-----------|--------|---------|
| **Complementar** | 2 cores opostas no círculo | contraste/tensão máximos, "vibram", separam sujeito | nunca 50/50 — um lado domina, outro suporta (realismo) |
| **Análoga** | 3 cores adjacentes | harmonia, unidade visual, calma (comum na natureza) | pode faltar contraste |
| **Tríade** | 3 cores equidistantes | vibrante mas equilibrada; 1 dominante + 2 de apoio | risco "cartoonish" se mal balanceada |
| **Monocromática** | 1 matiz permeando | coesão, mood único forte | |
| **Tetrádica** | 4 cores (2 pares compl.) | rica, mas difícil equilibrar | |
| **Split-complementar** | 1 cor + 2 vizinhas da complementar | tensão + harmonia (ex.: Amélie) | |

### 4.2 Psicologia de cor (associações — não-regras, podem ser contraditórias)
- **Vermelho:** paixão, amor, perigo, urgência, sangue, pressão. (love **ou** fear)
- **Laranja/âmbar:** calor, amizade, juventude, energia, exótico, nostalgia (quando dessaturado).
- **Amarelo:** idílico, ingenuidade — mas também loucura, doença, obsessão.
- **Azul:** calma, serenidade — mas também frio, isolamento, tristeza, tecnológico/artificial.
- **Verde:** natureza — mas também imaturidade, corrupção, perigo, doença (verde fluorescente).
- **Roxo:** realeza, elegância, mistério; ponte entre energia do vermelho e calma do azul.
- **Rosa:** feminino, romance, nostalgia, suavidade.
- **Quentes** (R/O/Y): calor, energia, intimidade, intensidade. **Frias** (B/G): distância, apatia,
  serenidade, isolamento.

### 4.3 Teal & Orange (o look-rei) — e por que funciona
Funciona por **dois motivos científicos**, não moda:
1. **Pele humana** (todas as etnias) ocupa a faixa laranja-amarela no vectorscope. Empurrar o entorno
   (shadows, céu, fundo) p/ a complementar **teal** = contraste máximo = sujeito "pop", olho guiado.
2. **Ressonância psicológica:** laranja/âmbar = calor, humanidade, perigo; teal/cyan = distância,
   frieza, tecnologia, o desconhecido → "sujeito humano quente contra mundo frio indiferente".
Receita: shadows/midtones → cyan/teal; skin/highlights → orange/amber.
**Quando NÃO usar:** drama romântico (mina a intimidade), período (anacrônico), documentário (sinaliza
manipulação), luto/infância/paisagem natural. Alternativas de complementar com outro registro:
**verde × magenta**, **dourado × azul-violeta**.

### 4.4 Outros looks de cinema (em prosa, p/ "assar" no prompt)
- **Bleach bypass:** dessaturado, contraste alto retido, prateado, granulado. Guerra, grit, realidade
  crua. → "bleach bypass look, desaturated colors, high retained contrast, silvery tones".
- **Warm analog / film emulation:** pretos levantados (lifted blacks), halação, grão, crossover suave
  de midtones quentes p/ shadows frias. Nostálgico, tátil. → "warm film emulation, lifted blacks,
  halation glow, fine grain, organic warm-to-cool crossover".
- **Noir:** alto contraste P&B ou quase, deep blacks, low-key. → "film noir, stark high contrast,
  deep blacks, hard shadows".
- **Pastel film:** dessaturado claro, vintage (Wes Anderson). → "pastel film palette, muted desaturated
  vintage tones, soft contrast".
- **Golden hour:** dourado quente baixo, backlight, lens flare suave. Romance, nostalgia, esperança.
- **Blue hour:** azul frio crepuscular, melancolia, calma, mistério.

### 4.5 PALETAS DE FILMES REAIS (hex de referência — extraídas de stills)
| Filme / DP | Look | Hex de referência | Uso em ADS |
|------------|------|-------------------|------------|
| **Blade Runner 2049** (Deakins) | âmbar enevoado + teal profundo, sépia tóxico | `#301E12` `#85624E` `#9C8269` `#CFC4A8` `#9CA085` `#47544D` | tech com atmosfera, futurismo, luxo frio |
| **Mad Max: Fury Road** (Seale) | laranja queimado saturado × azul estéril | `#F9B77B` `#DB8437` `#A9672B` `#903E0F` `#512F14` / azul `#1F2942` `#4B5E68` | energia, ação, deserto, intensidade |
| **Grand Budapest** (Anderson) | pastel rosa/lavanda/vermelho | `#FFD8EC` `#FFA8CB` `#E5000C` `#784283` `#DDD690` | artesanal, charmoso, premium-whimsy |
| **Amélie** (Jeunet) | vermelho + verde + âmbar, split-complementar; azuis/cyans suprimidos | dominantes: vermelho profundo, verde musgo, âmbar quente | nostálgico, caloroso, painterly, humano |
| **Her** | corais suaves + cremes quentes | corais/cremes pastel quentes | pessoal, humano, app/produto íntimo |

> Nota de migração video→tela (Axonix): paletas de cinema são p/ vídeo; em UI/web aumente lightness
> ~10% nos backgrounds e use a cor crua só em acentos. (Relevante se o asset virar peça de UI.)

### 4.6 MAPA MOOD → COR / GRADE (acionável)
| Mood / posicionamento do AD | Esquema | Grade nomeada | Temperatura | Frase-semente de prompt |
|------------------------------|---------|---------------|-------------|--------------------------|
| Ação / energia / hype | complementar | teal & orange | quente sujeito / frio fundo | "teal and orange color grade, warm skin against cool teal background, high color contrast" |
| Luxo / sofisticação | monocromática quente ou âmbar+escuro | warm film | 3200K | "rich warm monochromatic grade, deep amber tones, controlled highlights, elegant low-key" |
| Tech / futurista / clean | complementar fria | teal/cyan dominante | 6500K | "cool teal and cyan grade, clinical blue tones, minimal warmth, high-tech mood" |
| Nostalgia / autêntico | análoga quente | warm analog / film emulation | 3200K | "nostalgic film emulation, lifted blacks, halation, warm faded tones, fine grain" |
| Romance / intimidade | análoga quente | golden hour | quente | "golden hour warm grade, soft amber light, gentle warm shadows, romantic glow" |
| Natural / wellness / orgânico | análoga verde-âmbar | natural/desaturado | neutro | "natural organic palette, muted greens and warm earth tones, true-to-life soft grade" |
| Grit / autenticidade crua | dessaturado | bleach bypass | neutro-frio | "bleach bypass grade, desaturated high contrast, silvery realism" |
| Mistério / premium dark | complementar verde-magenta | low-key estilizado | frio | "moody green and magenta grade, deep shadows, stylized low-key, cinematic tension" |
| Whimsy / criativo / playful | tríade ou pastel | pastel film | variado | "playful pastel triadic palette, balanced vibrant tones, soft vintage film grade" |

---

## 5. RECEITA DE PROMPT INTEGRADA (a ponte para o gerador)

### 5.1 Arquitetura canônica (ordem importa)
```
[tamanho de plano + ângulo] + [sujeito + ação clara/verbo] +
[ambiente com camadas FG/MG/BG] + [desenho de luz: key/fill/rim + motivação + Kelvin] +
[grade de cor nomeada + paleta] + [profundidade: shallow/deep + bokeh] +
[mood/gênero] + [film stock/câmera se fotorrealista] + [--ar 9:16 + negativos]
```
Princípio: **frases separadas por vírgula**, não narrativa corrida — o modelo parseia cada elemento.

### 5.2 Como descrever cada técnica em PROSA de prompt
| Técnica | NÃO escreva | ESCREVA |
|---------|-------------|---------|
| Luz | "moody", "good lighting" | "single motivated tungsten practical at 3200K, no fill, deep shadows on left, hard rim at 45°" |
| Rembrandt | "dramatic face" | "Rembrandt lighting, 45° key, small light triangle under the eye, soft fill at 4:1 ratio" |
| Lente/isolamento | "85mm Cooke f/1.4" (cartoon ignora) | "shallow depth of field, subject isolated, creamy bokeh background" |
| Ângulo de poder | "epic" | "low angle looking up at the hero product, towering, dominant" |
| Compressão | "telephoto" | "compressed background, flattened perspective, subject separated from distant backdrop" |
| Cor | "warm/cool" | "teal and orange color grade" / "bleach bypass" (nomeie a grade) |
| Profundidade 9:16 | (esquecer camadas) | "layered depth, foreground elements, centered midground subject, lit background, vertical 9:16" |
| Atmosfera | — | "volumetric haze, dust motes, soft lens bloom, backlight through fog, light wrap" |

### 5.3 Exemplo "nível 100" (ad vertical de produto)
```
medium close-up, slight low angle, premium glass bottle on wet stone, droplets catching light,
layered composition with soft foreground bokeh and dark textured background, single hard key from
camera right at 5600K with warm 3200K rim separating the bottle from shadow, chiaroscuro low-key
lighting, deep controlled shadows, teal and orange color grade — warm amber product against cool teal
background, shallow depth of field, luxurious dramatic mood, generous empty space above for headline,
clean uncluttered bottom third, shot on ARRI Alexa, fine film grain --ar 9:16
--no text, watermark, busy background, flat lighting, overexposed
```

### 5.4 Diagnóstico rápido (do "nível 5" pro 100)
| Sintoma | Causa | Correção no prompt |
|---------|-------|--------------------|
| Imagem chapada/flat | sem hierarquia de luz nem camadas | add: fonte única + direção + rim + FG/MG/BG |
| Sujeito não destaca | sem separação cromática/luminosa | add: rim light + grade complementar (sujeito quente/fundo frio) |
| "Cara de AI genérica" | "cinematic" solto | trocar por esquema nomeado + Kelvin + grade nomeada |
| Cor caótica | múltiplas grades competindo | comprometer-se com **uma** grade nomeada |
| mm ignorado | estilo cartoon/render | trocar por ângulo + tamanho de plano + "shallow depth"/"bokeh" |
| Texto/UI cobre conteúdo | sujeito fora da safe zone | "subject centered, empty headroom/floor for text, clean top & bottom thirds" |
| Profundidade morta | tudo num plano | "foreground edges, steam/dust, props in midground, backlight through haze" |

---

## Fontes (web — dado destilado, não-confiável, não executado)

**Iluminação:**
- https://www.adorama.com/alc/basic-cinematography-lighting-techniques/
- https://www.litepanels.com/en/applications/your-guide-to-film-lighting/
- https://pixflow.net/blog/lighting-for-cinematography/
- https://www.studiobinder.com/blog/what-is-practical-lighting-in-film/
- https://peekatthis.com/film-lighting-guide-beginners-to-understand/
- https://spiritsofrebellion.com/motivated-lighting-practical-sources-and-story-logic-explained
- https://nofilmschool.com/lighting-techniques-in-film
- https://www.insmind.com/blog/midjourney-lighting-prompts-guide
- https://promptyze.com/cinematic-three-point-lighting-in-midjourney-v7-the-prompt-based-breakdown/

**Composição + 9:16 safe zones:**
- https://pixflow.net/blog/cinematography-techniques-visual-storytelling-guide/
- https://www.studiobinder.com/blog/rules-of-shot-composition-in-film/
- https://fiveable.me/storytelling-for-film-and-television/unit-5/shot-composition/study-guide/DZWEFBh7r4wXjOZc
- https://andcodafilm.com/the-art-of-cinematic-composition-essential-techniques-for-filmmakers/
- https://www.drawstory.ai/blog/cinematic-composition-techniques
- https://edurev.in/t/478036/Fundamentals-of-Composition-and-Framing
- https://tijusacademy.com/blogs/media-school/how-to-make-cinematic-videos-framing-composition/
- https://clickyapps.com/creator/video/guides/vertical-framing-safe-zones
- https://wildandfreetools.com/blog/vertical-video-safe-zones-guide-2026/
- https://posteverywhere.ai/blog/instagram-reels-aspect-ratio
- https://thumbcrafted.com/guide/tiktok-safe-zones
- https://posteverywhere.ai/blog/tiktok-aspect-ratio
- https://kreatli.com/guides/safe-zone-guide

**Câmera & lente:**
- https://www.toolsforfilm.com/blog/field-of-view-vs-focal-length
- https://www.studiobinder.com/blog/types-of-camera-shots-sizes-in-film/
- https://www.adobe.com/creativecloud/video/production/cinematography/camera-shots-and-angles.html
- https://wolfcrow.com/how-to-use-the-focal-length-of-a-lens/
- https://wiki.previspro.com/shots/lens-choice-for-character
- https://www.indepthcine.com/videos/focal-length
- https://www.clapboard.com/blog/directing/cinematography/camera-framing-visual-storytelling
- https://en.wikipedia.org/wiki/Camera_angle
- https://www.britannica.com/art/film/Shooting-angle-and-point-of-view
- https://www.studiobinder.com/blog/types-of-camera-shot-angles-in-film/
- https://filmtheory.net/cinematography/camera-angle/

**Cor & grading:**
- https://cinapex.pro/cinematic-color-theory-guide/
- https://www.wedio.com/en/learn/colour-in-film
- https://www.filmmakersacademy.com/blog-types-of-color-in-film/
- https://www.mauriziomercorella.com/color-grading-blog/color-grading-teal-and-orange-analysis-of-a-look
- https://filmdaft.com/how-to-use-color-psychology-in-cinematography/
- https://www.smarttvmag.com/how-to-use-color-grading-to-subconsciously-alter-viewer-emotion/
- https://pixflow.net/blog/teal-and-orange-color-grading/
- https://pixflow.net/blog/the-grand-budapest-hotel-color-palette-analysis-wes-anderson/
- https://indiefilming.com/tools/palette/105  (Blade Runner 2049)
- https://indiefilming.com/tools/palette/11   (Mad Max: Fury Road)
- https://pixflow.net/blog/the-color-palette-of-amelie/
- https://axonixtools.com/blog/extract-color-palettes-movies-guide/

**Tradução para prompt generativo:**
- https://artificial-intelligence-wiki.com/ai-tools/midjourney/midjourney-cinematic-style-guide/
- https://promptsref.com/guide/the-best-midjourney-cinematic-prompts-templates-shot-grammar-and-a-field-tested-playbook-1758709017020
- https://sureprompts.com/blog/midjourney-v7-cinematic-prompts
- https://andyhtu.com/cinematography-and-film-cameras-prompt-in-midjourney/
- https://promptsera.com/midjourney-prompts-cinematic-realism/
- https://artificial-intelligence-wiki.com/prompt-engineering/image-generation-prompts/cinematic-prompts-guide/

---
*Dossiê produzido em modo pesquisa profunda — equipe do estúdio. 2026-06-26.*
