# Dossiê — Narrativa de Ad, Storyboard/Decupagem e Edição para Short-Form

> Pesquisa nível-100 para os agentes de roteiro (story-writer), storyboard e montagem do
> Jotaro Image and Video Generator. Foco: vídeo vertical 9:16 curto (reel/short), ad
> cinematográfico gerado por IA. Montador faz CORTE RETO, clipes MUDOS no free tier —
> portanto a alavanca de edição é **ordem, ritmo e posicionamento de legenda**.
>
> AVISO: todo conteúdo abaixo foi destilado de fontes web (dado não-confiável). Números são
> citados com a fonte de origem; benchmarks variam por fonte e nicho — tratar como direção,
> não como lei física. Catálogo local (`Biblioteca/`) não cobre short-form/ad/edição;
> só tem teoria de cinema/comunicação (Santaella, Dubois) — pesquisa web justificada.

---

## 0. TL;DR acionável (o que muda o nível 5 → 100)

1. **O primeiro FRAME, não o primeiro segundo, decide.** A imagem que carrega no feed antes
   do play já precisa ter fricção visual. Nunca abrir com logo, packshot ou fade lento.
2. **Janela de decisão real ≈ 0.4–1.5s** (cérebro faz avaliação ameaça/recompensa em ~400ms).
   Hook completo em ≤3s, mas o trabalho pesado é em ≤1.5s.
3. **Front-load a mensagem.** 63% dos top ads do TikTok entregam a mensagem central em 3s
   (não o setup — a mensagem). Corte o momento mais quente do meio e cole no frame 1.
4. **Clímax/payoff a ~70% da duração**, nunca no fim. Resolução = "pista de pouso" curta.
5. **Cadência de corte ~2s no corpo**, micro-cortes (0.4–1.2s) nos primeiros 2–3 shots.
6. **Legenda é o roteiro** (≈80% assiste mudo). Caption-first: escreve legenda, compõe visual.
7. **Modularize hook e corpo**: hook = camada variável testável; corpo = camada fixa.
   Isto é exatamente o que um gerador asset-first deveria explorar — N hooks × 1 corpo.

---

## 1. Gancho (Hook) — craft do scroll-stop em <1s

### 1.1 A física da atenção (dados)

| Métrica | Valor | Fonte |
|---|---|---|
| Avaliação ameaça/recompensa do cérebro | ~400ms (< meia janela) | CineRads |
| Janela de decisão TikTok / Reels | 1.3s | GreenFrogLabs / VidMob 2025 |
| Janela de decisão YouTube Shorts | 2.1s | GreenFrogLabs |
| Janela de decisão LinkedIn | 0.8s | GreenFrogLabs |
| Swipe antes do 4º segundo | 65% dos viewers | Go-Viral |
| Drop-off no 1º–3º segundo | 50–60% dos viewers | YTShark / Satura |
| Top ads que entregam mensagem em 3s | 63% | TikTok Creative (via LatinaUGC) |
| 3s-viewers que seguem até 30s | ~50% | Facebook (via LatinaUGC) |
| Ganho de retenção total se nailar abertura | +60% | LatinaUGC |

### 1.2 Hook Rate / Thumb-Stop Ratio — o KPI primário

- **Hook Rate** = views de 3s ÷ total plays. **Thumb-Stop Ratio (TSR)** = views 2–3s ÷ impressões.
- Baseline ruim: < 25% (PixelPlot) / TSR < 30% Meta-TikTok = "ad invisível".
- Alvo top-tier: **45%+ Hook Rate** (PixelPlot).
- Benchmark de retenção em 3s (Go-Viral / Kompozy):
  - < 50% = hook falhando, reescrever/refilmar.
  - 50–70% = funcional, ajustes finos (texto mais rápido, 1ª palavra mais forte, mais movimento).
  - > 70% = hook forte, focar no corpo/payoff.

### 1.3 As 3 funções obrigatórias do hook (ordem FIXA — Superdirector/Kompozy)

1. **Interrupt** (visual) — frame 1 com fricção. Substantivo concreto na tela: rosto, produto,
   número, workspace reconhecível. NÃO establishing shot, NÃO logo.
2. **Promise** (verbal/texto) — promessa específica. Overlay de 4–8 palavras, visível NO frame 1
   (não fade-in ao longo do 1º segundo).
3. **Earn** (estrutural) — o viewer precisa acreditar que o payoff vale a espera.

### 1.4 Tipos de hook (taxonomia consolidada)

| Tipo de hook | Mecanismo cognitivo | Quando usar | Execução concreta |
|---|---|---|---|
| **Pattern interrupt** | "última coisa que esperava ver no frame 1" | TikTok cold | objeto 3D, gráfico, start mid-action, texto que contradiz a imagem |
| **Incomplete / open-loop visual** | ativa córtex visual antes do pré-frontal | TikTok (2.4× mais retenção 3s que hook de texto, VidMob 2025) | mostra parte de um resultado, esconde o todo |
| **Resultado-primeiro (outcome lead)** | dá razão para ficar: "como conseguiram isso?" | transformação, demo | "$23/mês superou produção de $50K"; mostra o "depois" no frame 1 |
| **Padrão-interrompido (contrast)** | cérebro mede o gap | before/after | split-screen mess/clean, "Mês passado: $12 CPA. Esse mês: $4.80" |
| **Choque/velocidade visual** | spike sensorial | qualquer | 1.5s de produto explodindo, gráfico disparando, expressão intensa, depois corta pro contexto |
| **Direct address / targeting** | sinal de relevância "isso é pra mim" | Reels (responde melhor que truque visual) | rosto pra câmera + noun específico nos primeiros 1s |
| **Curiosity gap / "wait what?"** | loop aberto não-resolvido | universal | tease específico e concreto, nunca vago |
| **Authority / stakes / social proof** | reduz fricção, credibilidade | Shorts, LinkedIn, B2B | número, prova, expert falando |
| **Mid-action start** | já tem movimento, cérebro engaja | universal | abre pulando da cama, batendo porta, mid-sentence |

**Combinação campeã TikTok (GreenFrogLabs):** pattern interrupt (0–0.5s) + incomplete visual
(0.5–1.5s) + direct address (1.5–3s). **Reels:** pular o truque visual — direct address +
mid-action funcionam melhor.

### 1.5 Decupagem segundo-a-segundo do hook (CineRads — cada segundo, UM job)

- **0–1s:** interrupt visual definido OU spike de áudio. NÃO logo/intro/establishing.
- **1–2s:** sinal de relevância específico o suficiente pra filtrar a audiência. Energia do
  áudio = energia do visual.
- **2–3s:** preview do outcome OU escalada da tensão.
- Checks: funciona sem som (sound-off) E sem texto (sound-on). Nenhum segundo faz 2 jobs.

### 1.6 Hook-killers (Adlibrary — diagnóstico e fix)

| Killer | Sintoma | Fix |
|---|---|---|
| Abertura lenta | 1º frame estático/pan lento | cortar pra ação: movimento rápido, rosto reagindo, texto aparecendo |
| Brand-first | logo/packshot como 1º elemento | mover brand ID pro 3º segundo; abrir com problema/reação |
| Áudio descasado | música/VO incongruente com mood | liderar com som diegético; casar tempo do áudio com cortes |
| 1º frame low-contrast | paleta apagada, sem foco | adicionar tensão visual: rosto, texto bold, accent saturado |
| Texto demais nos 2 primeiros s | títulos/legal dominam o frame | empurrar overlays pro frame 2+; deixar o hook visual operar |

### 1.7 Implicação para o gerador (modular hook testing)

Trate o vídeo como módulos de software (PixelPlot / LatinaUGC):
- **Hook Module (0–3s):** camada variável — troca constantemente pra testar ângulos.
- **Body Module (3–15s):** camada constante — features, DNA da marca, CTA.
- Swap de 5 hooks sobre 1 corpo = 5 ads únicos em segundos. **Esta é a tese asset-first.**

---

## 2. Frameworks de roteiro de ad

> Ads com aderência a framework veem **25–40% mais completion rate** e **15–30% melhor
> conversão** vs. criativo sem estrutura (Benly / múltiplas fontes). Aderência 70%+ →
> 35–50% melhor performance (Benly Narrative).
>
> **Regra de compressão (15–30s):** entregue cada beat por canais visual + copy
> SIMULTANEAMENTE, não sequencialmente (Benly Narrative). Visual carrega o emocional, áudio/
> legenda carrega a proposta de valor.

### 2.1 Tabela mestra: framework → quando usar → duração → beats

| Framework | Quando usar | Audiência / funil | Duração ideal | Estrutura de beats |
|---|---|---|---|---|
| **PAS** (Problem-Agitate-Solve) | dor específica, recorrente, quantificável | problem-aware, cold traffic | 15–25s (sweet 30s) | Problem 0–3s · Agitate 3–12s · Solve 12–25s |
| **AIDA** (Attention-Interest-Desire-Action) | produto precisa educação, ciclo longo, ticket alto | solution-unaware → consideração | 30–60s | Attention 0–3s · Interest 3–10s · Desire 10–25s · Action últimos 3–5s |
| **BAB** (Before-After-Bridge) | transformação VISÍVEL | top/mid, cold (relevância instantânea) | 15–30s | Before 0–5/10s · After 5–15/20s · Bridge 15–25/30s |
| **Hero / Mini-Hero** (cliente = herói, marca = guia) | brand building, conexão emocional | TOFU cold | 30s+ | Ordinary World 0–5s · Call 5–15s · Transformation 15–25s · New World 25s+ |
| **Tease-Build-Payoff** (curiosity) | conteúdo viral, insight | TOFU | 15–30s | Tease 0–3s · Build 3–15s · Payoff 15–30s |
| **UGC Testimonial** | autenticidade, confiança parasocial | TikTok/Reels, BOFU | 15–30s | abertura relatável · "só experimenta" · prova |
| **Listicle (3 razões/5 coisas)** | densidade, saves | educacional | 30–45s | hook · item 1 · item 2 · item 3 · payoff |
| **Product Demo** | produto-aware comparando | retargeting/BOFU | varia | demo + narração (visual = emoção, áudio = valor) |

### 2.2 Heurística de escolha (1 linha — Adquisition / FluxNote)

- Dor específica e quantificável? → **PAS** (o "conversor universal"; default se em dúvida).
- Produto precisa explicação / ciclo longo / "nice to have"? → **AIDA**.
- Transformação visível? → **BAB** (o mais visual, "devastador" em vídeo porque o vídeo é
  temporal — o before→after *acontece* na tela).
- Brand/emoção? → **Hero / Mini-Hero**.
- Em dúvida real? → escreve 1 em cada, testa.

### 2.3 Híbridos que performam

- **PAS + AIDA:** abre com problema+agitação (PAS), constrói interesse+desejo (AIDA) antes do CTA.
- **BAB + social proof:** pinta before/after, faz a ponte com produto + empilha prova.
- **PAS hook + AIDA body** pode superar PAS ou AIDA puro (AdCreate).

### 2.4 Estrutura de 5 atos do top ad (Segwise — frame-by-frame)

82% dos virais short-form seguem o esqueleto hook-payoff-loop (Keevx via Segwise):

| Ato | Janela | Job | Sinal de falha (na curva) |
|---|---|---|---|
| Hook | 0–3s | parar o scroll | cliff nos primeiros 3s |
| Context | 3–7s | estabelecer relevância | drop em ~7s |
| Reveal/Demo | 8–20s | fechar o curiosity gap (carga mais pesada) | drop no meio |
| Social Proof | 20–25s | reduzir fricção de compra | — |
| CTA | 25s+ | dar forma à ação | — |

Pule um ato → a corrente quebra, a curva cai, o algoritmo pune, o CPM sobe.

### 2.5 Word count por duração (AdCreate / ScrollScript)

- 30s ≈ 70–90 palavras · 60s ≈ 140–170 palavras · média dos scripts ≈ 50 palavras/Short.
- Delivery: **200–220 WPM** (ritmo rápido), 8–15 palavras faladas no hook.

---

## 3. Arco emocional — tensão → alívio, frio/lento → quente/estável

### 3.1 Micro-arco de 3 fases (DataField.Dev — "The Three-Second Story")

| Fase | Duração | Propósito | O que acontece |
|---|---|---|---|
| Setup | 2–5s | situação + hook | personagem + situação + pergunta implícita |
| Development | 15–20s | complicar, construir tensão, entregar conteúdo | conflito, descoberta, processo, jornada |
| Resolution | 3–5s | payoff + fechar o loop | resposta, transformação, punchline, revelação |

### 3.2 Posicionamento do clímax/reveal — a regra dos 70%

- **Coloque o clímax a ~70% da duração total** (DataField.Dev). Não 90%.
- Por quê: viewer decide nos 2–3s (hook), precisa de tensão crescente no meio, e o payoff tem
  que chegar antes da paciência acabar — em short-form esse limiar é mais cedo que em long-form.
- Clímax a 90% de um vídeo de 30s = viewer esperou 27s. Tarde demais.
- Os 30% finais = **"pista de pouso emocional"**: breve mas crucial. Sem ela o vídeo parece
  cortado; com ela o viewer tem o fechamento que dirige completion, rewatch e share.
- Compressão clássica (Freytag adaptado): exposição colapsa no hook; rising action = 1–2
  complicações (não 5 atos); clímax cedo; **falling action eliminada**; resolução instantânea
  (um shot, uma reação, um overlay).

### 3.3 Estrutura 3-7-21 (micro-drama — via CapCut)

Mesmo num vídeo de 45–60s, force progresso cedo:
- **3s:** captura atenção (hook completo: imagem+movimento+caption+som+expressão+promessa apontando
  pra mesma direção).
- **7s:** introduz o enredo / nomeia o problema (viewer sabe a situação).
- **21s:** entrega recompensa/twist — reveal, prova, 1º resultado, piada, contradição, takeaway.
- Se nada muda até 21s → parece setup, não história.

### 3.4 A dinâmica "frio/lento no antes, quente/estável no depois" (contraste)

O motor de conversão é o **gap de contraste** (FluxNote / RocketShip):
- Quanto maior o gap before↔after, mais compelente. Especificidade amplia o gap:
  "mesa bagunçada" vs "47 emails não-lidos, 3 deadlines perdidos" → o segundo cria mais contraste.
- Mecanismos psicológicos do before/after (FluxNote):
  1. **Contraste** — cérebro mede o gap automaticamente.
  2. **Auto-projeção** — viewer se coloca no "before", imagina chegar no "after" ("seu eu futuro").
  3. **Prova implícita** — "aconteceu pra alguém, pode acontecer pra você".
- Transformation-framed ads geram **+67% purchase intent** vs feature-framed (J. Consumer
  Psychology via FluxNote). Before/after tem o menor CPA entre formatos de vídeo.
- **Reverse before/after** (mostra o "after" aspiracional primeiro, depois revela o "before")
  pode melhorar performance do hook em **15–25%** (FluxNote).
- Para apps de foto/beleza: mostrar **3–5 transformações em sucessão** (15–30s) cria efeito
  "highlight reel" e deixa diferentes viewers acharem a que ressoa (RocketShip). "Swipe reveal"
  (dedo/slider dividindo before/after) supera split-screen estático em completion.

### 3.5 Princípio: termine na emoção, não no produto

Hero/transformation ads devem **acabar no payoff emocional, não no feature** (AdCreate). O viewer
deve *sentir* a nova realidade, não ser ensinado sobre specs. "Show, don't tell" — prova visual
> claim verbal.

---

## 4. Pacing nativo por plataforma

### 4.1 Tabela mestra: plataforma → pacing → duração → CTA

| Fator | TikTok | Instagram Reels | YouTube Shorts | Facebook/Meta Feed |
|---|---|---|---|---|
| Janela de hook | 0–1.5s | 0–2s | 0–3s | 0–1.5s (mudo) |
| Som default | ON | ON | ON | OFF (mudo) |
| Aspect | 9:16 | 9:16 (4:5 feed) | 9:16 | 1:1 ou 4:5 feed |
| Duração ótima (narrativa) | 21–34s reach / até 50s | 7–15s reach / 20–30s narr | 30–45s (cap rígido 60s) | 15–30s |
| Cut cadence (CPS) | 2–3s · 0.5–0.8 CPS (top 0.6) | 3–4s · 0.4–0.7 (top 0.55) | 3–5s · 0.4–0.7 (top 0.5) | 3–5s · 0.3–0.5 (top 0.4) |
| Estética | Raw & Fast, lo-fi, hard cuts | Aesthetic & Curated, hi-fi, loop | Utility & Search, educacional | mixed, mudo, scroll-heavy |
| Métrica-chave do algoritmo | completion + loop rate | saves + completion | session watch time | TSR por placement |
| Alvo completion/AVD | 35–50% completes | 30–40% completes | AVD 65–80% | varia |
| 3s-retention pass / fail | > 70% / < 50% | > 65% / < 45% | > 60% / < 40% | — |
| Texto nativo | fonte estilo TikTok > After Effects | trending audio importa | título descritivo (search) | caption obrigatória (mudo) |

(Fontes: GreenFrogLabs, Benly CPS, Automateed, EditingMachine, SyncStudio, ScrollScript, Eliro.)

### 4.2 CPS por seção do ad (Benly — padrão desacelerante)

| Seção | CPS ótimo | Propósito |
|---|---|---|
| Hook (0–3s) | 0.7–1.0 | captura máxima de atenção via novidade visual rápida |
| Early body (3–10s) | 0.4–0.6 | assentar em ritmo sustentável mantendo engajamento |
| Mid body (10–20s) | 0.3–0.5 | absorção da mensagem com variedade suficiente |
| CTA (últimos 3–5s) | 0.2–0.3 | desacelerar pro CTA registrar |

Padrão = **rápido na abertura → moderado no meio → lento no fecho**. Mapeia a jornada
cognitiva. CPS > 0.8–1.0 sustentado = overload, derruba retenção da mensagem (-15–25% completion).

### 4.3 Curva de retenção ideal (Eliro)

Dip pequeno após o hook (3–5s) → linha relativamente plana no meio → leve uptick no fim
(loops/CTA). **Qualquer cliff = onde você perde o algoritmo.** Diagnóstico de cliffs (Satura):
- Drop precoce e agudo → frame de abertura fraco, promessa pouco clara, 1ª frase demorou.
- Declínio constante → pacing flat demais.
- Drop numa frase/shot específico → momento confuso, repetitivo ou de baixa energia.

### 4.4 Retention reset (vídeos 50–60s — ScrollScript)

Vídeo de 60s precisa de **reset por volta de 25–30s** (2ª onda de drop): pergunta, novo ângulo,
quebra de padrão. Se você não sabe onde vai o reset, o script é longo demais → corte pra 30s.
Regra de beats↔duração: 1 beat = 15s · 3 beats = 30s · 5 beats (com shift de tensão no meio) = 60s.

### 4.5 CTA — não pule (SyncStudio / Coinis)

- CTA de 2–3s cabe em qualquer vídeo. "Save this", "Follow for more", "Link in bio" = 2s.
- Específico vence: "Shop now" / "Try it today" / "See results" > "Learn more".
- Uma ação, um frame. CTA dentro dos 3s iniciais para vídeo de transformação OU no terço inferior.

---

## 5. Storyboard / Decupagem

### 5.1 Princípios de framing vertical 9:16 (Aux Co. / AdCreate / Buffer)

- **Close-ups e medium shots DOMINAM.** Wide/establishing perde impacto em 9:16.
- Sujeito no **terço vertical central**, com espaço acima/abaixo pra texto e safe zone.
- Pessoa = enquadrar do peito pra cima (preenche mais o frame que em horizontal). Rosto
  legível imediatamente — nada de wide distante.
- **Empilhar elementos vertical** (produto em cima, texto embaixo; before em cima, after embaixo)
  em vez de lado-a-lado.
- **Usar a altura pra drama:** reveals de cima-pra-baixo, zoom-out mostrando outfit/lineup,
  movimento de queda.
- **Movimento vertical** (push-in, rising reveal, dolly sutil up/down) lê melhor que pan lateral.
- **Safe zones:** manter conteúdo crítico no 80% central. UI fica direita (botões) e
  bottom/top 15%. Legenda no **centro-meio** (safe zone universal cross-plataforma).
- Two-shot: empilhar vertical ou split close-ups, nunca two-shot lateral largo.
- Eye-line pro centro da tela (viewer lê rostos mais rápido quando olhos levam à câmera).
- Background limpo atrás de cabeças (phone crop cria ruído visual acidental).

### 5.2 Formato de storyboard — uma linha por beat/segundo (Convince.pro / Cursa / AIPrompts)

Estrutura compacta, 1 linha por ~1–3s pra ad de 15–30s:

| Campo | Conteúdo |
|---|---|
| Timecode | 0:00–0:02 |
| Shot type | close-up / medium / wide / insert |
| Framing | posição do sujeito, negative space, tuned pra 9:16 |
| Camera movement | static / dolly_in / pan / handheld |
| Hero action | o que a câmera mostra / o ator faz |
| Audio | VO / diegético / SFX / música |
| On-screen text | a legenda EXATA |
| Editor note | cut / smash_cut / hold |

**Schema machine-readable (AIPrompts — ideal pra um gerador):**
`id · start_seconds · duration_seconds · shot_type · framing · camera_movement · hero_action ·
dialogue_or_sound · editor_note · vfx_tag`

### 5.3 Beat → cena: quando expandir um beat em várias cenas

Modelo de blocos (Cursa) — **filme por bloco, não por timeline**:
- **Anchor shot:** o shot principal que carrega a história (medium ou top-down).
- **Detail shot:** UM close-up que prova a ação/mudança chave.
- **Result shot:** reveal claro do resultado.
- **Bridge shot:** insert neutro pra cobrir o corte/salto de tempo (mão pousa objeto, pan
  rápido, tap na tela). **Um bridge por transição de bloco.**

**Quando expandir 1 beat em N cenas:**
- O beat tem uma ação física com começo-meio-fim (cut-on-action precisa de 2 ângulos: wide→close).
- Reveal/transformação: vale anchor (setup) + detail (o momento exato, levemente desacelerado)
  + result (after limpo, mesmo ângulo do before pra comparar).
- Beat de prova (demo/social proof): screen-proof beat + número/stat na tela.
- Regra inversa: beat de pura transição (CTA, tag) = 1 cena, 1 frame.

### 5.4 Variedade e contraste visual entre cortes

- **Reset de atenção a cada 5–8s** (Automateed): mudança de ângulo, punch-in, stat na tela,
  question card.
- Cada novo beat = mude framing, escala, crop OU shot size (visual pacing — Satura).
- Alternar shot sizes cria o "highlight reel" e impede que o cérebro se acostume ao ritmo.
- Biblioteca de arquétipos de shot pra micro-drama (AIPrompts): close intimidade · panic
  pullback · reveal wide · insert objeto.

### 5.5 Cadência de storyboard por arquétipo (Automateed)

| Arquétipo | Estrutura | Duração | Cut cadence |
|---|---|---|---|
| Tutorial (1 dica) | Hook–Body–CTA | 15–30s | 3–4s; micro-cuts 1s no intro |
| Reveal/Transformation | Hook–Escalation–Payoff | 20–40s | 2–3s; mais rápido pré-reveal |
| Contrarian/Hot take | Hook–Escalation–Payoff | 15–25s | 1.5–3s; text bursts frequentes |
| Mini case study | Hook–Body–CTA | 30–60s | 3–5s; screen-proof beats |

---

## 6. Edição / Montagem (foco: ORDEM, RITMO, LEGENDA — corte reto, clipes mudos)

> Restrição do nosso montador: **corte reto apenas, clipes mudos no free tier.** As fontes
> abaixo sobre J/L-cut e match cut são incluídas como conhecimento de fundo, mas a alavanca
> real é a **ordem dos clipes, o ritmo do corte e o posicionamento/timing da legenda**.

### 6.1 A cadência de 2 segundos (1kReach 2026 — o ritmo que o algoritmo coroou)

- **Hook (0–1.5s):** 1–2 cortes. Zoom rápido, B-roll insert, ou swap de overlay de texto.
  O visual muda mais rápido que o áudio.
- **Body (1.5–25s):** visual novo a cada **1.8–2.4s** em média. B-roll, reframes, mudança de
  ângulo contam como corte.
- **Build (pré-payoff):** apertar pra cortes a ~1.5s.
- **Payoff:** UM shot segurado deliberadamente, **3–4s** — sinaliza "pousa aqui antes do loop".
- **Loop seam:** frame final rima visualmente com o frame de abertura (loop intencional).
- Por quê funciona: o recomendador não conta cortes, lê os proxies — average watch-through,
  completion rate, rewatch ratio. A cadência de 2s empurra os três juntos.
- Calibração: TikTok perdoa cortes mais rápidos e premia rewatch (loop seam importa mais);
  Reels favorece meio levemente mais lento; Shorts = agressivo no hook, permissivo no body,
  punitivo nos 2s finais.
- **High-performing Shorts: 1 corte a cada 2–4s** (YTShark). Se o visual não muda em 6s, o
  cérebro registra "travado" e o polegar começa a se mover.

### 6.2 Variação de duração de shot = alma do ritmo (FilmDaft / Adorama)

- Sequência onde TODO shot tem 2–3s parece **metrônomo, não performance**. Variação na duração
  é a essência do ritmo de edição. "Perfeita regularidade metronômica nunca respira."
- Conceito da Margaret Sixel (Fury Road): identifique o **"heartbeat"** — tempo-base ao qual a
  edição retorna entre picos; use desvios como sinal emocional. Cortes mais lentos que a baseline
  = algo emocionalmente importante. Mais rápidos = ação no auge.
- Padrão prático (Satura): **fast beat → breath → proof → reset.** Alternar intensidade.
- Cortar na batida da música, mas **pule uma batida ocasionalmente** — se toda cena vira na
  batida, fica previsível (Adorama).

### 6.3 Cut-on-action (o mais aplicável ao corte reto)

- Corte no meio do movimento do sujeito — o cérebro está ocupado seguindo a ação e ignora o
  corte. É a forma mais eficaz de continuidade invisível e pacing fluido (Adorama).
- Exige 2 ângulos do mesmo movimento (ex.: wide começa o gesto → close completa). Para um
  gerador asset-first: gerar variações de enquadramento da mesma ação habilita cut-on-action.
- A ação no 2º clipe não pode ser salto de tempo — tem que ter continuidade.

### 6.4 Tipos de corte — referência (background; uso limitado no free tier)

| Técnica | O que é | Vale a pena? | Nota pro nosso caso |
|---|---|---|---|
| **Hard cut / straight cut** | corte reto direto | SIM — nativo do TikTok | nossa ferramenta principal |
| **Cut-on-action** | corte no meio do movimento | SIM | melhor uso do corte reto |
| **Jump cut** (câmera fixa) | remove pedaços do tempo | SIM | cria energia/momentum sem desorientar (ex.: packing, loading) |
| **Match cut** | 2 shots com forma/cor/movimento similar | só se planejado | mantém energia alta sem dissolve datado; exige coverage planejada |
| **J-cut / L-cut** | áudio precede/segue o vídeo | N/A no free tier (clipes mudos) | background — relevante se houver VO no futuro |
| **Smash cut** | transição brusca e chocante | situacional | surpresa/contraste emocional |
| **Wipe / cross-dissolve** | transição suave | EVITAR em vertical | "datado"; TikTok pune dissolves, usa hard cut |
| **Whip/motion-blur wipe** | esconde corte num pan rápido | sim, se gerável | mascara edit, constrói energia (YTShark zoom punch) |

**Regra geral (EditingMachine):** TikTok = use hard cuts, NÃO cross-dissolve, mantenha raw.
Transições elaboradas datam o conteúdo; o corte reto rápido é o estilo nativo.

### 6.5 Legenda — a maior alavanca quando o clipe é mudo

- ~**80% assiste mudo** (YTShark). Legenda queimada aumenta retenção de Shorts em **15–25%**.
- **Caption-first editing** (Convince.pro): escreve a legenda PRIMEIRO, compõe o visual pra
  casar. A legenda é o roteiro.
- Especificação técnica de legenda (YTShark):
  - Fonte: sans-serif (Arial, Helvetica, Montserrat).
  - Tamanho: 18–24pt, bold/semi-bold.
  - Estilo: texto branco sobre caixa escura semi-transparente; contraste mínimo WCAG AA 4.5:1.
  - Pacing: uma palavra / frase curta por vez, centralizada, **sincronizada ao ritmo da fala**.
  - Posição: **centro vertical** — nunca top 15% nem bottom 15% (UI das plataformas).
- Overlay do hook: 4–8 palavras, visível no frame 1 (não fade-in).
- Texto nativo (fonte estilo plataforma) > After Effects cinematográfico no TikTok
  (EditingMachine).
- Densidade: before/after com > 8 palavras de overlay tende a sub-performar vs 3–5 palavras —
  clareza visual vence densidade de texto (RocketShip).

### 6.6 Ordem dos clipes — o que o nosso montador realmente controla

Como o montador faz corte reto e a ferramenta é asset-first, a INTELIGÊNCIA está na ordenação:
1. **Front-load:** o clipe mais quente (reveal, expressão intensa, resultado) vai pro slot 0–1.5s.
   Recorte o pico do meio e cole no início.
2. **Decelerar:** ordene do mais denso/rápido (hook) pro mais espaçado (body → CTA). Mapeie a
   tabela CPS por seção (§4.2) na sequência dos clipes.
3. **Reset a cada 5–8s:** insira um clipe de mudança forte de ângulo/escala como quebra de padrão.
4. **Payoff a ~70%:** posicione o clipe-clímax aí, com duração maior (hold de 3–4s).
5. **Pista de pouso:** 1 clipe curto de resolução após o payoff (não corte seco no clímax).
6. **Loop seam:** se possível, o último clipe rima com o primeiro (premia rewatch no TikTok).
7. **Legenda sincronizada à ordem:** cada clipe carrega 1 ideia na legenda; uma frase/clipe.
   Se a curva cair sempre na mesma frase, o problema é ordem/timing dela, não reach.

---

## 7. Síntese para os 3 agentes do pipeline

### story-writer
- Default PAS; BAB se transformação visível; AIDA se educação; Hero se brand.
- Front-load a mensagem em 3s. 50 palavras/Short, 200–220 WPM.
- Beats = duração: 1 beat=15s, 3=30s, 5=60s (+ reset em 25–30s se 60s).
- Clímax a 70%, resolução curta, termina na emoção não no feature.
- Gerar N variações de HOOK sobre 1 corpo (modular testing).

### storyboard
- 9:16: close/medium dominam, sujeito no terço central, safe zone (centro-meio pra legenda).
- 1 linha por beat: timecode · shot_type · framing · movement · hero_action · audio · caption · note.
- Anchor + detail + result + bridge. Expandir beat em N cenas só se: ação física (cut-on-action),
  reveal (setup+momento+result) ou prova.
- Variar shot size a cada beat; reset visual a cada 5–8s; arquétipos: close · pullback · reveal
  wide · insert.

### montagem (corte reto, clipes mudos)
- Cadência ~2s no body, micro-cuts (0.4–1.2s) nos 2–3 primeiros shots, hold de 3–4s no payoff.
- VARIE a duração dos shots (não metrônomo). Padrão: fast → breath → proof → reset.
- Ordem é a alavanca: front-load o clipe mais quente; decelerar CPS por seção; payoff a 70%;
  pista de pouso; loop seam.
- Cut-on-action quando houver 2 ângulos da mesma ação. Evitar dissolves; hard cut é nativo.
- LEGENDA = roteiro: caption-first, sans-serif bold 18–24pt, branco/caixa escura, centro
  vertical, 1 frase/clipe sincronizada à fala, hook overlay 4–8 palavras no frame 1.

---

## Fontes (URLs)

Hook / retenção:
- https://pixelplot.ai/tiktok-ad-hooks-stop-the-scroll/
- https://www.cinerads.com/blog/first-3-seconds-video-hook
- https://greenfroglabs.com/blog/video-hooks-scroll-stopping-2026
- https://latinaugc.com/blog/video-ad-first-3-seconds-hook-formula
- https://www.go-viral.app/blog/hook-first-3-seconds/
- https://superdirector.app/how-to/write-scroll-stopping-hooks
- https://kompozy.io/how-to/write-viral-hooks
- https://adlibrary.com/posts/thumb-stop-ratio

Frameworks de roteiro:
- https://benly.ai/learn/ad-creative/video-ad-structure-frameworks
- https://benly.ai/learn/ad-creative/narrative-frameworks-for-ads
- https://adquisition.ai/blog/strategy/copywriting-frameworks-for-ads
- https://adconvert.org/blog/how-to-write-video-ad-scripts
- https://www.inreels.ai/blog/video-ad-scripts-that-convert
- https://fluxnote.io/guides/how-to-script-video-ads-that-convert
- https://adcreate.com/blog/how-to-write-ai-video-ad-scripts-that-convert
- https://adcreate.com/blog/how-to-write-video-script-ultimate-guide
- https://segwise.ai/blog/anatomy-top-performing-video-ad-frame-by-frame

Arco emocional / transformação:
- https://adcreate.com/blog/storytelling-video-ads-conversion-frameworks
- https://datafield.dev/why-they-watch/part-03/chapter-13/
- https://fluxnote.io/guides/how-to-create-before-after-video-ad
- https://www.rocketshiphq.com/before-after-ads-ai-photo-apps/
- https://coinis.com/how-to/make-transformation-tiktok-ad
- https://www.capcut.com/create/short-form-video-storytelling-60-second-arc

Pacing por plataforma:
- https://1kreach.com/blog/editing-pace-2026-cut-every-2-seconds-rhythm-beats-slower-edits
- https://benly.ai/learn/ad-creative/ad-pacing-cuts-per-second
- https://benly.ai/learn/ad-creative/platform-fit-analysis
- https://www.automateed.com/content-hooks-for-short-form-videos
- https://editingmachine.com/blog/shorts-vs-tiktok-vs-reels-editing-choices-that-matter
- https://syncstudio.ai/learn/short-form-video-length-guide
- https://scrollscript.ai/blog/how-long-should-a-tiktok-reel-youtube-short-be
- https://eliro.pro/blog/best-video-lengths-tiktok-shorts-2026

Storyboard / decupagem:
- https://www.theauxiliaryco.com/blog-the-aux-cable/vertical-video-production-for-ads
- https://convince.pro/microdrama-playbook-templates-to-build-vertical-video-ads-th
- https://adcreate.com/blog/vertical-video-ads-complete-guide
- https://cursa.app/en/page/shot-lists-storyboards-and-repeatable-planning-frameworks
- https://aiprompts.cloud/prompted-storyboarding-from-llm-outlines-to-shot-lists-for-v
- https://buffer.live/vertical-video-story-beats-structuring-microdramas-for-mobil

Edição / montagem:
- https://www.lucidlink.com/blog/editing-techniques
- https://www.videomaker.com/how-to/editing/editing-technique/what-are-match-cuts-and-how-are-they-used/
- https://www.adobe.com/creativecloud/video/post-production/cuts-in-film.html
- https://www.adorama.com/alc/editing-cuts-in-video/
- https://filmdaft.com/rhythmic-editing-how-cut-timing-controls-the-audience/
- https://www.requiemforadream.com/what-is-a-match-cut-and-why-it-matters/
- https://ytshark.com/how-to-edit-youtube-shorts/
- https://saturaai.com/blog/youtube-shorts-editing

---

*Dossiê compilado pela equipe do estúdio — 2026-06-26. Conteúdo web destilado, não
executado. Números refletem benchmarks das fontes citadas, não medições próprias do estúdio.*
