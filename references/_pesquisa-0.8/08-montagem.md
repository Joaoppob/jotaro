# Etapa 8 — Montagem (ritmo de corte): base teórica

> Pesquisa web para o agente MONTAGEM do Jotaro 0.8 (ex editing-director, agora etapa isolada).
> Contexto: o 0.8 forja UM prompt único de vídeo multishot 9:16 (15-60s) via Higgsfield — os cortes
> acontecem DENTRO da geração, não em pós FFmpeg. A etapa audita o rascunho perguntando:
> "o ritmo de corte entre os planos condiz com o projeto?"
> Data: 2026-07-03. Fontes visitadas listadas ao final.

## O que é e por que existe

Montagem é a decisão de ONDE, QUANDO e COMO um plano termina e o próximo começa — e o que essa
junção produz no espectador. Não é acabamento: Eisenstein a chamou de "o nervo do cinema" e
sustentou que o significado de um filme nasce da colisão entre planos, não dos planos isolados
(Wikipedia, Soviet montage theory). No fluxo 0.8 não existe editor humano nem timeline: o "editor"
é o próprio prompt. Se o prompt não codifica duração por shot, tipo de transição e curva de ritmo,
o modelo improvisa — e improviso de pacing é a diferença entre um vídeo que retém e um que é
descartado no scroll. A etapa MONTAGEM existe para auditar essa camada antes do render: ela não
cria conteúdo novo, ela verifica se o ritmo de corte escrito no rascunho serve à emoção e ao
objetivo do projeto.

## Base teórica (com as descobertas da pesquisa)

### Eisenstein — montagem de atrações e colisão

- **Montagem de atrações (1923):** cada "atração" é uma unidade de impacto sensorial/psicológico
  "experimentalmente regulada e matematicamente calculada" para produzir choques emocionais que,
  em sequência correta, conduzem o espectador à conclusão desejada (Eisenstein, "Montage of
  Attractions"). Tradução direta pro 0.8: cada shot do multishot é uma atração calculada; a ordem
  e a junção são parte do cálculo, não decoração.
- **Colisão:** "montagem é uma ideia que NASCE da colisão de dois planos independentes" — o
  sentido não está em nenhum dos planos, explode do choque entre eles (dialética
  tese × antítese = síntese). Exemplo canônico: operários massacrados intercalados com gado no
  matadouro em *A Greve* (Wikipedia; media-studies.com).
- **Cinco métodos de montagem** (Film Form, 1949), úteis como taxonomia de ritmo (Videomaker):
  - **Métrica** — corta por duração fixa dos planos, independente do conteúdo (ritmo de metrônomo).
  - **Rítmica** — a duração responde ao movimento DENTRO do quadro (Escadaria de Odessa).
  - **Tonal** — corta pelo tom emocional dominante do plano (luz, atmosfera).
  - **Overtonal** — síntese das três anteriores; conflito entre tom primário e secundário.
  - **Intelectual** — justaposição que produz conceito abstrato (crítica, metáfora).

### Walter Murch — "In the Blink of an Eye" e a Regra dos Seis

Murch ranqueia seis critérios para o corte ideal, com pesos explícitos (Murch, In the Blink of an
Eye, 2ª ed.; StudioBinder; wiki UT Austin):

1. **Emoção — 51%**: o corte é fiel à emoção do momento?
2. **História — 23%**: o corte avança a narrativa?
3. **Ritmo — 10%**: ocorre num momento ritmicamente "certo"?
4. **Eye-trace — 7%**: respeita onde o olho do espectador está no quadro?
5. **Planaridade (2D) — 5%**: respeita eixo/linha de 180°, direção de tela?
6. **Continuidade espacial (3D) — 4%**: respeita a posição real dos corpos no espaço?

Regras derivadas:
- **Sacrifique de baixo pra cima.** Se precisar quebrar algo, quebre continuidade espacial antes
  de quebrar ritmo, ritmo antes de história, história NUNCA antes de emoção. "Emoção vale mais
  que os outros cinco somados."
- **Um corte que quebra continuidade mas serve à emoção funciona; um corte que preserva
  continuidade mas mata a emoção nunca funciona** (ScriptReader.ai). O público perdoa erro
  técnico se o sentimento está certo.
- **O corte espelha o piscar de olhos:** humanos piscam nas fronteiras entre estados cognitivos
  (pensamento completo, mudança de atenção). Cortes posicionados nessas fronteiras parecem
  naturais; cortes no meio de um pensamento parecem errados. Pergunta operacional: "onde o
  pensamento do espectador se completa naturalmente?"

### Corte invisível vs corte expressivo

Dois regimes opostos, ambos legítimos (WeDesignMotion; Lumira Studio):
- **Corte invisível** (continuidade clássica): cut on action, respeitar direção de tela e
  eye-trace, overlap de áudio (J/L-cut), cortar no beat da música. O espectador não percebe a
  emenda. Default para conteúdo de produto, tutorial, UGC "autêntico".
- **Corte expressivo** (herança eisensteiniana): jump cut, smash cut, whip pan, match cut
  ostensivo — o corte SE FAZ notar para produzir energia, humor, tensão ou ideia. Default para
  hooks, montagens de energia, reveals.
- Regra prática de Lumira: "o hard cut é o default; qualquer outra transição precisa responder
  'o que ela me dá que um corte seco não daria?'". E limitar o vocabulário: 2-3 tipos de
  transição por peça mantém coesão (WeVideo).

### Ritmo e pacing — dados de short-form (o que a pesquisa achou)

- **Frequência de corte por plataforma** (Benly, guia CPS 2026): faixa ótima geral 0,3-0,5 cortes
  por segundo (1 corte a cada 2-3s); TikTok/Reels 0,5-0,8 CPS (1 corte a cada 1,2-2s);
  YouTube/LinkedIn 0,2-0,4 CPS. Acima de ~0,8-1,0 CPS: sobrecarga cognitiva, retenção de mensagem
  cai.
- **Curva de pacing dentro do vídeo** (Benly): hook (0-3s) em 0,7-1,0 CPS — máxima novidade
  visual, melhora hook rate em 15-25%; corpo em 0,3-0,5 CPS — absorção da mensagem; CTA (últimos
  3-5s) em 0,2-0,3 CPS — desacelerar para o call-to-action registrar.
- **Análise de 200 TikToks virais** (DEV.to/viralvidanalyzer): shot length médio < 1,5s → mediana
  4,2M views; 1,5-2,5s → 2,8M; 2,5-4s → 1,4M; > 4s → 800K. 87% tinham "pattern interrupt" nos
  primeiros 1,5s. Payoff antes de 80% do vídeo → +34% completion. Nuance do próprio autor: não é
  "cortar mais rápido", é MUDANÇA VISUAL (novo ângulo, zoom, texto, prop) a cada 1,5-2,5s.
- **Regra dos 3-4 segundos** (Blitzcut): vídeos com mudança visual/sonora a cada 3-4s retêm
  40-60% mais que conteúdo estático; cada corte "reseta o timer" de swipe. Mas cortes mais
  rápidos que 2s em talking-head cansam — 3-4s é o sweet spot para fala.
- **Estudo experimental N=242** (Dost & Huang, 2026): estilos de jump cut têm efeitos distintos —
  cortes "seamless" aumentam likes (fluência de processamento); cortes "overlapping" aumentam
  completion/rewatch (erro de predição sustenta atenção), mas só em frequência baixa/moderada.
  Pacing alto reduz engajamento sustentado no geral. Conclusão: **não perseguir velocidade por
  si; casar estilo de corte com o KPI**.
- **UGC vs polido** (Benly): anúncios estilo UGC a 0,1-0,3 CPS (planos de 3-10s) SUPERAM anúncios
  polidos de CPS alto no TikTok/Reels — autenticidade > variedade visual nesse formato.
- **Quando segurar um plano:** conteúdo emocional/atmosférico pede planos de 5-7s+ (SeedanceTips);
  o CTA pede plano segurado; e Murch autoriza: se a emoção pede respiro, o respiro vence o
  metrônomo. Estático > 5s sem mudança interna = perda rápida de viewers (Benly TikTok guide) —
  plano longo só se há movimento interno (câmera, ação, luz).

## Opções e vocabulário que o agente tem à disposição

### Transições (vocabulário canônico + efeito)

| Transição | O que é | Efeito / quando usar |
|---|---|---|
| **Hard cut** (corte seco) | Junção direta A→B | Workhorse default; ~tudo. Neutro, rápido |
| **Cut on action** | Corte no meio de um movimento que continua no plano B | Invisibilidade máxima; continuidade |
| **Match cut gráfico** | Composição/forma do plano A rima com B | Conexão de ideias, elegância, reveals |
| **Match cut de ação** | Mesmo gesto continua em outro contexto | Elipse de tempo/espaço sem atrito |
| **Match cut sonoro** (sound bridge) | Som do A vira som equivalente no B | Costura de cenas distintas |
| **Jump cut** | Corte dentro do mesmo enquadramento, sujeito "pula" | Passagem de tempo, urgência, energia UGC; se nota de propósito |
| **Smash cut** | Corte brusco com contraste violento de tom/energia | Choque, comédia, quebra de expectativa |
| **Whip pan** | Câmera chicoteia até virar borrão, próximo plano entra do borrão | Pico de energia, mudança de local, causa-efeito; só com movimento real |
| **J-cut** | Áudio do plano B entra ANTES da imagem cortar | Antecipação; fluidez de diálogo/narração |
| **L-cut** | Áudio do plano A continua DEPOIS do corte de imagem | Reação, continuidade conversacional |
| **Speed ramp** | Aceleração/desaceleração dentro do plano até o corte | Ênfase dramática, energia esportiva/produto |
| **Dissolve** | Fusão A→B | Passagem de tempo, tom reflexivo; curto (6-12 frames) senão vira slideshow |
| **Dip to black/white** | Mergulho em preto/branco entre planos | Quebra de capítulo, reset; pesado pra short-form |
| **Occlusion cut** | Objeto/corpo preenche o quadro e "esconde" o corte | Corte invisível de alto nível |

Mapa rápido problema→transição (WeDesignMotion): proteger direção de movimento → cut on action /
whip motivado; proteger som → J/L-cut; salto de tempo suave → dissolve curto; reset duro → dip to
black; montagem de energia → whip motivado.

### Padrões de pacing (curvas prontas para auditoria)

- **Curva short-form padrão (15-30s):** hook denso (shots de 1-2s ou pattern interrupt em <1,5s)
  → corpo moderado (2-4s/shot) → CTA segurado (3-5s, plano único).
- **Curva emocional/brand:** poucos shots, 4-7s cada, transições suaves (dissolve curto, match
  cut), aceleração só no clímax.
- **Curva UGC autêntica:** planos de 3-10s, jump cuts na fala, zero transição "de efeito".
- **Aceleração rítmica** (Eisenstein métrico/rítmico): shots encurtando progressivamente
  (4s → 3s → 2s → 1s) para construir clímax; o inverso (alongando) para resolução/pouso.
- **Regra de variação** (Lumira): peça onde todo shot tem a mesma duração soa mecânica — variar
  duração cria ênfase e respiração. Exceção deliberada: montagem métrica como efeito.

## Como aplicar no fluxo 0.8 (prático)

### Como expressar ritmo de corte NUM PROMPT multishot

Os guias de Kling 3.0, Seedance 2.0, Veo 3.1 e Sora 2 (este último via Higgsfield) convergem em
quatro mecanismos que os modelos entendem:

1. **Estrutura de shot list, não parágrafo.** "Shot 1: [...] / Shot 2: [...]" ou blocos por shot.
   Kling 3.0 aceita até 6 cortes em 15s com shot prompts + duração por shot (The Design
   Inspiration); Sora 2 via Higgsfield pede "cada shot como bloco distinto com setup, ação e luz
   próprios" (Higgsfield Sora 2 Prompt Guide).
2. **Duração explícita por shot / timestamps.** `Shot 1 (3 seconds): ...` (Kling) ou
   `[0-4s]: ... [4-8s]: ...` (Seedance timeline prompting; Veo 3.1 timestamp prompting
   `[00:04-00:06]`). É o mecanismo direto de codificar pacing: hook 1-2s, corpo 3-4s, CTA 4-5s.
3. **Keyword de transição entre shots.** Seedance 2.0 reconhece `Cut to` (hard cut), `Camera cut
   to` (reposicionamento explícito), `Shot Switch` (ponte visual), `Camera switching` (mudança
   gradual) — e sempre descrever a cena nova DEPOIS da keyword (SeedanceTips). `hard cut to` vs
   `seamless morph into` dá instrução explícita em vez de deixar o modelo improvisar (Prompt
   Bible Seedance). Whip pan funciona como keyword de urgência.
4. **Pacing implícito pela densidade de descrição.** Em modelos com timestamps frouxos, a
   quantidade de ação descrita por shot controla a duração percebida: descrição mínima + transições
   rápidas = shots de 2-3s; descrição ambiental detalhada + câmera lenta = shots de 5-7s
   (SeedanceTips).

Restrições conhecidas que a auditoria deve respeitar:
- **Um movimento de câmera + uma ação por shot** — empilhar movimentos num shot gera caos
  (Cineprompt; Higgsfield Sora 2 guide).
- Nem todo modelo produz hard cut verdadeiro num prompt só: alguns tendem a "fluir" entre
  posições de câmera em vez de cortar (MindStudio sobre Seedance) — a keyword de corte precisa
  ser explícita e testada por modelo.
- Multishot Higgsfield/Seedance: rosto no primeiro shot apenas, para minimizar drift de
  identidade nos cortes seguintes (Higgsfield blog multi-shot).
- 9:16: sujeito e ação centralizados no quadro para sobreviver aos cortes sem decapitar
  ninguém (Segmind).

### Perguntas de auditoria do agente MONTAGEM (checklist)

1. **Emoção primeiro (Murch):** cada corte serve à emoção da seção? Existe algum corte que está
   "certo tecnicamente" mas mata o tom? (Se sim: refazer — emoção = 51%.)
2. **Curva de pacing:** as durações por shot desenham a curva certa pro projeto? Hook em shots
   curtos/pattern interrupt <1,5s? CTA segurado e desacelerado? Corpo sem estático >5s?
3. **Frequência vs formato:** o CPS médio condiz com o registro? (UGC autêntico: 0,1-0,3 CPS;
   energia TikTok: 0,5-0,8 CPS; emocional/brand: planos longos.) O rascunho não está "perseguindo
   velocidade por si"?
4. **Transições declaradas:** cada junção entre shots tem instrução explícita (`Cut to`, match
   cut, whip pan, J-cut de narração)? Ou o prompt está deixando o modelo improvisar a emenda?
5. **Vocabulário enxuto:** há no máximo 2-3 tipos de transição na peça? Transição "de efeito"
   só onde a energia justifica?
6. **Colisão com propósito (Eisenstein):** a sequência de shots produz a ideia/sensação desejada
   pela justaposição, ou é só cobertura do mesmo assunto? Existe pelo menos uma junção que soma
   sentido (reveal, contraste, match cut)?
7. **Variação rítmica:** as durações variam (ou a uniformidade é métrica deliberada)? Há
   aceleração/desaceleração intencional em direção ao clímax e ao pouso?
8. **Viabilidade no modelo:** cada shot tem 1 câmera + 1 ação? Durações somam o total do vídeo?
   Rosto só no shot 1? Keywords de transição no dialeto que o modelo-alvo entende?

## Mudanças sugeridas ao fluxo 0.8

1. **Duração explícita por shot como campo obrigatório do rascunho** (não opcional): a soma das
   durações deve bater com a duração total, e o agente MONTAGEM valida a curva
   (hook curto → corpo médio → CTA segurado) contra o tipo de projeto.
2. **Toda junção entre shots deve carregar uma instrução de transição nomeada** no prompt final
   (`Cut to` como default; match cut/whip pan/J-cut apenas motivados). Junção sem instrução =
   issue de auditoria.
3. **Tabela de dialeto por modelo** em referência do agente: keywords de transição que
   Kling/Seedance/Veo/Sora entendem diferem (`Cut to` vs `[0-4s]` vs `[00:04-00:06]` vs shot
   prompts com duração); o MONTAGEM deve auditar no dialeto do modelo-alvo do render.
4. **Perfil de pacing por registro do projeto** (UGC / energia / emocional / brand) como input da
   etapa — para a pergunta "condiz com o projeto?" ter critério objetivo (faixas de CPS e
   duração/shot desta pesquisa) em vez de gosto.

## Fontes (URLs completas)

- Walter Murch, *In the Blink of an Eye* (2ª ed., PDF): https://www.craftfilmschool.com/userfiles/files/Walter%20Murch%20-%20In%20the%20Blink%20of%20an%20Eye%20Revised%202nd%20Edition%20(2001%2C%20Silman-James%20Pr).pdf
- StudioBinder — The Rule of Six: https://www.studiobinder.com/blog/walter-murch-rule-of-six/
- ScriptReader.ai — In the Blink of an Eye guide: https://scriptreader.ai/guides/blink-of-an-eye-murch
- UT Austin RTF 318 — Murch's Rule of Six: https://cloud.wikis.utexas.edu/wiki/display/rtf318/Murch%27s+Rule+of+Six
- Eisenstein — "Montage of Attractions" (PDF): https://anarcosurrealisti.noblogs.org/files/2011/02/Montage-of-attractions.pdf
- Wikipedia — Soviet montage theory: https://en.wikipedia.org/wiki/Soviet_montage_theory
- Videomaker — Eisenstein: the man, the method, the montage: https://www.videomaker.com/how-to/directing/film-history/sergei-eisenstein-the-man-the-method-the-montage/
- Media Studies — Eisenstein and Five Methods of Montage: https://media-studies.com/eisenstein-montage/
- Benly — Ad Pacing & Cuts Per Second: https://benly.ai/learn/ad-creative/ad-pacing-cuts-per-second
- Benly — TikTok Ad Creative 2026: https://benly.ai/learn/ad-creative/tiktok-ad-creative-guide
- Blitzcut — TikTok 3-Second Rule: https://blitzcutai.com/blog/3-second-rule-tiktok-jump-cuts
- Dost & Huang — jump-cut styles × frequency experiment (N=242): https://archives.marketing-trends-congress.com/2026/pages/PDF/paper_professor_DOST_HUANG.pdf
- Análise de 200 TikToks virais (shot length × views): https://nextjs-from-zero.vercel.app/articles/3971490
- OpusClip — TikTok Length & Format for Retention: https://www.opus.pro/blog/tiktok-length-format-retention-data
- StudioBinder — Types of Editing Transitions in Film: https://www.studiobinder.com/blog/types-of-editing-transitions-in-film/
- Wedio — 13 Popular Film Transitions: https://academy.wedio.com/uk/types-of-transitions-in-film-2/
- WeDesignMotion — Keep cuts invisible, not flashy: https://wedesignmotion.com/blog/productivity/video-transitions-how-to-keep-cuts-invisible-not-flashy/
- Adobe — Cuts in film: https://www.adobe.com/creativecloud/video/post-production/cuts-in-film.html
- WeVideo — 7 Video Transition Types: https://www.wevideo.com/blog/for-work/7-easy-camera-transitions-to-enhance-your-videos
- Lumira Studio — Video Transitions: A Practical Guide: https://www.lumirastudio.com/blog/insights/simple-video-transitions-tips-to-make-your-videos-better/
- MindStudio — Timeline Prompting with Seedance 2.0: https://www.mindstudio.ai/blog/timeline-prompting-seedance-2-cinematic-ai-video
- SeedanceTips — Multi-Shot Storytelling Guide: https://seedancetips.com/guides/multi-shot-storytelling/
- Kling 3.0 Prompt Guide: https://kling3.pro/blog/kling-3-0-prompt-guide
- The Design Inspiration — Kling 3.0 Multi-Shot Tutorial: https://thedesigninspiration.com/news/tech/kling-3-0-tutorial-crafting-the-perfect-multi-shot-prompt/
- Philipp Schneider — Prompt Bible for Seedance 2.0: https://medium.com/@philipp.sch.3/prompt-bible-for-seedance-2-0-064dee13e11d
- HeyMarmot — Veo 3.1 Prompting Guide: https://heymarmot.com/blog/veo-prompting-guide
- Cineprompt — Complete Guide to AI Video Prompts: https://www.cineprompt.pro/blog/ai-video-prompt-guide
- Higgsfield — Generating with Seedance 2.0: https://higgsfield.ai/blog/generating-with-seedance-2-0
- Higgsfield — Sora 2 Prompt Guide: https://higgsfield.ai/sora-2-prompt-guide
- Higgsfield — Multi-shot com Seedance (Director of AI-Cinema): https://higgsfield.ai/blog/Become-The-Director-of-AI-Cinema-with-best-Video-Model
- Segmind — Higgsfield AI Prompt Format Guide: https://blog.segmind.com/higgsfield-ai-prompt-guide-video-creation/
