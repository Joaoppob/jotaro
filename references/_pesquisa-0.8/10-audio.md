# Etapa 10 — Áudio (música + falas): base teórica

> Pesquisa web executada em 2026-07-03. Todas as afirmações abaixo estão
> ancoradas nas fontes listadas na última seção.

## O que é e por que existe

A Etapa 10 do fluxo 0.8 é o agente **ÁUDIO**: audita o rascunho do Dossiê de Prompt
perguntando "música e falas condizem com o projeto?". Herda da 0.7 a locução
cronometrada (fala pro espectador em PT-BR, direção técnica em inglês) e a regra
forte de que todo conteúdo audível pro espectador é em português.

Ela existe por três razões ancoradas na literatura:

1. **Som é metade do realismo.** O espectador não percebe silêncio como silêncio —
   percebe como "falha do sistema de som" (filmsound.org). Um vídeo gerado por IA
   sem camada de ambiente soa quebrado antes de parecer falso visualmente.
2. **Música define a leitura emocional antes da primeira palavra.** A trilha
   enquadra emocionalmente o conteúdo nos primeiros segundos e molda a
   interpretação de tudo que vem depois (closermusic.com; IJSRP systematic review).
   Música errada = mensagem certa lida errado.
3. **Modelos com áudio nativo (Veo 3.x, Kling 3.0) geram som SEMPRE** — se o prompt
   não especifica o soundstage, o modelo alucina (plateia de estúdio rindo, música
   genérica, ambiente errado). Auditoria de áudio no rascunho é prevenção de
   alucinação de áudio, não polimento (Replicate; snubroot/Veo-3-Prompting-Guide).

## Base teórica (com as descobertas da pesquisa)

### 1. Sound design: diegético, não-diegético, ambiente

- **Som diegético** = qualquer som que origina do mundo da cena (fala dos
  personagens, ambiente do local, música tocando num rádio em quadro) — se o
  personagem pode ouvir, é diegético, mesmo off-screen (sirene de ambulância que
  não aparece). **Som não-diegético** = audível só pro espectador: trilha musical,
  narração/voice-over, efeitos de comentário (open.library.okstate.edu; Adobe;
  StudioBinder).
- Os dois se misturam de propósito: bons filmes cruzam a fronteira (trilha que
  vira som do fone do personagem) para controlar a percepção do espectador
  (okstate; WeVideo). Em ad curto, o análogo é: locução não-diegética + ambiente
  diegético + fala em quadro no mesmo peça.
- **Room tone / ambiente** é a "impressão digital sonora" do local — hum elétrico,
  tráfego distante, ar. Camada contínua sob o diálogo que faz cortes soarem
  invisíveis e a cena soar viva; sem ela, o áudio "morre" e o espectador sente
  algo errado sem saber o quê (StudioBinder room-tone; filmsound.org).
- Distinção útil pro vocabulário do agente: **room tone** (contínuo, controlado,
  de continuidade) ≠ **ambience** (ambiente mais amplo e ativo: multidão, ondas)
  ≠ **silêncio** (quase não existe no mundo real) (StudioBinder).
- Hitchcock e Tarantino demonstram que tensão pode ser construída SÓ com som
  diegético, quase sem trilha — o drama vem do mundo da cena (StudioBinder
  diegetic-sound). Relevante pra decidir "quando não ter música".

### 2. Música e emoção em ads curtos

- Música define o tom emocional do anúncio **antes de qualquer palavra** e
  influencia como o espectador interpreta visual, locução e o próprio produto.
  Congruência música↔narrativa aumenta autenticidade percebida e credibilidade
  emocional (closermusic.com, citando Journal of Marketing). Mapeamento básico:
  upbeat = energia/diversão; ambient suave = calma/confiança/luxo; retrô =
  nostalgia; tempo alto = urgência/impulso.
- Em short-form, a música dá a pista emocional **em milissegundos** de scroll,
  reduzindo carga cognitiva; música emocionalmente congruente aumenta retenção da
  mensagem e compartilhamento (IJSRP — revisão sistemática sobre share rates).
- **Trending sound vs original vs licenciada:** trending empresta familiaridade e
  momentum algorítmico — melhor para topo de funil / awareness; áudio original dá
  controle, longevidade e identidade sonora — melhor para meio/fundo de funil e
  brand recall (RocketShip HQ). TikTok reporta: 88% dos usuários dizem que som é
  essencial na plataforma; 73% param pra olhar ads com áudio; conteúdo com áudio
  original teve +52% de brand awareness vs faixa comercial genérica (TikAdSuite,
  citando TikTok/Kantar). Trending sounds saturam ("audio fatigue") — valem antes
  do pico (IJSRP).
- **Licenciamento importa em ad:** música do library geral do TikTok é só pra uso
  pessoal; ad precisa de Commercial Music Library (CML), faixa licenciada ou áudio
  original (Audiodrome; benly.ai). No fluxo 0.8 o modelo gera música original por
  prompt — o que elimina o problema de licença, mas perde o efeito "trending".
- **Os 3 erros que matam hook rate** (RocketShip HQ): (a) stock music genérica que
  grita "isto é um ad" em 0,2s (guitarra/piano corporativo); (b) nenhuma estratégia
  de som (áudio residual da filmagem); (c) **energy mismatch** — visual acelerado
  com música lenta (ou vice-versa) derruba watch-through. BPM útil pra ads:
  100–140 (TikAdSuite).
- **Quando NÃO ter música:** (a) clipes UGC/testemunho/founder-talk — lo-fi e
  fala seca soam nativos do feed e geram mais confiança que trilha polida
  (TikAdSuite); (b) quando o lip-sync é prioridade em modelo generativo — música
  de fundo mascara consoantes e degrada a sincronia ("no background music" é
  recomendação explícita, Skywork/Veo 3); (c) quando o som diegético É o conteúdo
  (ASMR de produto, textura, crunch); (d) beat de tensão/pausa dramática — o corte
  da música é um recurso de ênfase.

### 3. Voz, fala e legendas em short-form

- **Fala em quadro vs voice-over:** entrega conversacional olhando pra câmera —
  "falar com uma pessoa, não dar palestra" — domina os virais (59,4% dos 13,5M de
  clipes analisados pela OpusClip). Voice-over/faceless também funciona: 55,3% dos
  vídeos da base Revid.ai são faceless com VO e crescem normalmente. A escolha é
  criativa, não de performance.
- **Ritmo de fala:** 150–170 WPM é a faixa ótima pra shorts (viral.day); guias de
  VO sugerem 140–160 pra pontos importantes, até 180–200 pra hype (ReelBase).
  Frases curtas (8–12 palavras), contrações, tom coloquial. Dead air é inimigo:
  pausas >0,25–0,5s derrubam retenção; o áudio deve abrir com pico de energia nos
  primeiros 0,5s — nunca começar em sussurro/respiração (viral.day).
- **Hook falado nos primeiros 3 segundos** decide a maior parte do resultado —
  mas **hook falado sozinho é a pior configuração estável**: análise de ~5,5k
  vídeos achou gap de 14x entre visual+texto-em-tela e visual+só-fala; no
  Instagram (mais sound-off) fala sem texto em tela ativamente prejudica; no
  TikTok (cultura mais sound-on) fala+texto soma (thecontentlabs.app). Regra
  prática: o hook falado e o texto em tela dizem a mesma coisa ao mesmo tempo.
- **Dado do "85% sem som" — verificado e nuançado:** o número original é da Meta
  (85% dos vídeos do Facebook assistidos em mute) e segue citado; dados atuais:
  ~85% das views mobile sem som, 92% em mobile quando o som não está disponível,
  69% em locais públicos (Kapwing; FlyCut; AdCreate). **Exceção crítica: TikTok é
  plataforma sound-on** (~88% assistem com som ligado, per TikTok/Kantar via
  benly.ai). Ou seja: o áudio precisa funcionar E o vídeo precisa sobreviver mudo.
- **Legendas queimadas (open captions) são obrigatórias em ad:** +12–16% reach,
  +80% completion, +10–20% CTR vs o mesmo ad sem legenda (AdCreate); 80% mais
  chance de assistir até o fim com legenda (Verizon/Publicis via Kapwing); 86,6%
  dos criadores usam captions, 96,8% no formato animado palavra-a-palavra — o
  estilo de melhor performance em TikTok/Reels (Revid.ai; AdCreate). Legenda
  reforça retenção até pra quem ouve (dual-coding: +40% recall) (ClipForge).

### 4. Como Veo 3.x e Kling 3.0 tratam áudio no prompt

- **Veo 3/3.1 — sintaxe de soundstage:** descrever o áudio em frases separadas,
  por tipo: `Dialogue:` (quem fala + a linha), `SFX:` (sons pontuais), `Ambient
  noise:` (fundo do local), música (ex.: "a swelling orchestral score begins")
  — inclusive com timing por segmento `[00:06-00:08] ... SFX: ...` (Google Cloud
  Veo 3.1 prompting guide; docs.cloud.google.com).
- **Diálogo sem legenda fantasma:** Veo tende a queimar legendas mal escritas se
  o diálogo vem entre aspas. Sintaxe que funciona: `A mulher diz: texto da fala`
  (dois-pontos, SEM aspas) + `(no subtitles)` explícito no prompt (Medium/Wafae
  Bakkali — Google Cloud Community; Replicate; snubroot). Nota: o guia oficial
  do Veo 3.1 usa aspas, a prática da comunidade converge no dois-pontos — tratar
  como padrão dos exemplos-ouro e validar no render.
- **Alucinação de áudio:** se o fundo não é especificado, o modelo inventa (caso
  clássico: risada de plateia de estúdio em cena de comédia). Prevenção = declarar
  o ambiente esperado por cena, sempre ("Audio: quiet office ambiance, no audience
  sounds") (Replicate; snubroot).
- **Lip-sync no Veo:** uma frase curta por clipe, dimensionada pra 3–6s de fala;
  "clearly enunciates", boca visível (medium/close-up), pacing explícito
  ("speaks calmly over ~4-5 seconds"); remover música/ambiente pesado quando o
  lip-sync é prioridade (Skywork).
- **Kling 3.0 (modelo do 0.7/0.8) — Native Audio:** gera fala + lip-sync + SFX +
  ambiente + música num passe. Referência precisa de quem fala em cena
  multi-personagem; binding de voz por sintaxe própria (`O homem <<<voice_1>>>
  diz, ...` / `[Personagem@NomeDaVoz]`); ambiente é gerado automaticamente a
  partir da descrição da cena — descreva o local acusticamente e o som segue
  (Kling 3.0 User Guide; kling.ai blog Omni; PonPon).
- **Limites duros de diálogo no Kling** (testados em produção): ~10 palavras em
  5s, ~20 palavras em 10s, 35–45 em 15s; exceder causa drift de lip-sync, final
  engolido ou áudio cortado. Palavras simples > jargão/nome de marca polissilábico;
  terminar a linha em palavra curta e forte; 1 falante por clipe é o mais
  confiável; "Immediately" como conector elimina pausa entre falas de dois
  personagens (VIDEOAI.ME; PonPon).
- **ACHADO CRÍTICO — idioma:** o Native Audio do Kling 3.0 suporta oficialmente
  5 línguas: chinês, inglês, japonês, coreano e espanhol. Diálogo em outra língua
  **é traduzido para inglês pelo modelo** (Kling 3.0 User Guide). Português NÃO
  está na lista oficial — a regra "todo conteúdo audível em PT-BR" colide com a
  capacidade declarada do kling3_0 e precisa de validação empírica ou de plano B
  (VO em PT via `generate_audio`/TTS por cima de vídeo sem native audio).
- Música dentro do prompt: pedir "soft background music" / "subtle score" abaixa o
  nível da trilha gerada; sem direção, o modelo decide volume e presença (PonPon).

## Opções e vocabulário que o agente tem à disposição

**Camadas de som (o rascunho deve declarar cada uma, mesmo que "nenhuma"):**

1. `Dialogue` — fala em quadro (diegética, lip-sync) ou voice-over (não-diegética).
2. `Ambient` — room tone / ambiente do local, por cena (rua, cozinha, quarto).
3. `SFX` — sons pontuais sincronizados à ação (pote abrindo, passo, clique).
4. `Music` — trilha não-diegética: mood, energia, BPM implícito, ponto de entrada.
5. `Silêncio/corte de som` — recurso deliberado de ênfase, nunca omissão.

**Tipos de trilha (vocabulário de direção):** upbeat/energética (urgência, CTA),
ambient suave (confiança, skincare/wellness), lo-fi/UGC (nativo de feed, trust),
build-up com beat drop (reveal de produto), emocional minor-key (storytelling),
sem música (testemunho seco, ASMR, beat de tensão).

**Padrões de fala:** conversacional 1-pra-1 (padrão dominante), 150–170 WPM,
frases de 8–12 palavras, hook falado = texto em tela, zero dead air >0,5s, linha
final curta e forte. Orçamento de palavras por duração do shot: ~2 palavras/segundo.

## Como aplicar no fluxo 0.8 (perguntas de auditoria sobre o rascunho)

O agente ÁUDIO audita o rascunho com este checklist:

1. **Coerência de projeto:** a música pedida condiz com a emoção-alvo da alma e
   com a energia visual do ritmo de corte? (energy mismatch = reprova)
2. **Soundstage completo por shot:** cada shot declara ambiente esperado? Algum
   shot ficou sem direção de áudio (risco de alucinação — plateia, música errada)?
3. **Fala dentro do orçamento:** cada linha de fala cabe na duração do shot
   (~2 palavras/s; 5s ≈ 10 palavras)? Termina em palavra curta? 1 falante por shot?
4. **Idioma:** toda fala/locução audível está em PT-BR (gate `locucao-idioma.cjs`
   já cobre)? O modelo escolhido suporta fala em PT? Se kling3_0: sinalizar risco.
5. **Hook sonoro:** os primeiros 0,5–3s têm energia de áudio (fala ou som forte),
   sem abertura morta? O hook falado espelha o texto em tela?
6. **Lip-sync vs música:** shots de fala em quadro pedem trilha baixa ou ausente
   ("soft background music" / "no background music")?
7. **Sem legenda fantasma:** o prompt usa dois-pontos (não aspas) pra fala e
   inclui "(no subtitles)"? Legendas em PT são decisão nossa, não do modelo.
8. **Quando não ter música:** o rascunho considerou fala seca/diegético puro onde
   o formato é testemunho/UGC? Música foi adicionada por default ou por intenção?
9. **Mute-proof:** o vídeo comunica a mensagem sem som (texto em tela nos beats
   chave)? — porque fora do TikTok a maioria assiste mudo.

## Mudanças sugeridas ao fluxo 0.8

1. **Gate idioma×modelo (novo check ou extensão do `locucao-idioma.cjs`):** se
   `formato=video`, `modelo=kling3_0` e existe `shots[].fala` em PT-BR, emitir
   aviso bloqueante-suave: PT não está nas 5 línguas oficiais do Native Audio do
   Kling 3.0 (fala pode sair traduzida pra inglês ou com lip-sync ruim). Exigir
   validação empírica 1x (piloto barato) ou rota B: vídeo sem native audio +
   locução PT-BR via `generate_audio`.
2. **Orçamento de fala determinístico:** check que compara nº de palavras de
   `shots[].fala` com `duracao_s` do shot (limite ~2,2 palavras/s; reprova acima).
   É a causa nº 1 de áudio cortado/garbled nos guias de produção do Kling.
3. **Soundstage obrigatório por shot no prompt-forge:** campo (ou convenção na
   prosa) `Ambient:` por shot, mesmo que "quiet room tone" — prevenção de
   alucinação de áudio. O agente ÁUDIO reprova shot sem ambiente declarado.
4. **Convenção anti-legenda-fantasma nos exemplos-ouro:** fala com dois-pontos sem
   aspas + "(no subtitles)" no prompt; legendas queimadas em PT viram decisão
   explícita da intake (dado: ads com open captions têm +80% completion — mas no
   0.8 sem pós-produção, legenda = ou o texto em tela do próprio modelo, ou nada).
5. **Pergunta de intake "trilha ou sem trilha":** default hoje é sempre-música;
   a literatura diz que testemunho/UGC seco performa melhor sem trilha polida.
   Uma escolha consciente (com recomendação por tipo de conteúdo) evita música
   por inércia.

## Fontes (URLs completas)

- https://open.library.okstate.edu/introfilmtv/part/sound/ — diegético vs não-diegético, fronteira trans-diegética
- https://www.adobe.com/creativecloud/video/hub/ideas/diegetic-vs-non-diegetic-sound.html — definições e mistura criativa
- https://www.studiobinder.com/blog/what-is-diegetic-sound/ — som diegético, tensão sem trilha (Hitchcock)
- https://www.studiobinder.com/blog/what-is-room-tone/ — room tone vs ambience vs silêncio, continuidade
- https://filmsound.org/terminology/roomtone.htm — soundtrack "going dead" percebido como falha
- https://www.wevideo.com/blog/diegetic-sound-vs-non-diegetic-sound — som não-diegético como condutor emocional
- https://closermusic.com/blog/The-Role-of-Music-in-Advertising-How-Sound-Creates-Emotion-and-Drives-Sales — música define tom antes da palavra; congruência
- https://www.ijsrp.org/research-paper-0326/ijsrp-p17108.pdf — revisão sistemática: música de fundo e share rate em short video
- https://www.rocketshiphq.com/sound-music-tiktok-ads-importance/ — trending vs original por funil; 3 erros de áudio em ads
- https://tikadsuite.com/blog/best-music-for-tiktok-ads/ — 88% som essencial, 73% param em ad com áudio, +52% awareness com áudio original, BPM
- https://benly.ai/learn/tiktok-ads/tiktok-ads-sound-music-strategy — TikTok sound-on (~88%), CML, sonic branding 8.5x recall
- https://audiodrome.net/use-cases/music-for-tiktok-ads/ — licenciamento: CML vs library pessoal
- https://www.kapwing.com/resources/subtitle-statistics/ — 85% Facebook mute, 80% completam com legenda, 92% mobile sem som
- https://caption.flycut.co/en/blog/video-accessibility-2025-subtitles-essential — 85% mobile sem som, breakdown por plataforma
- https://adcreate.com/blog/how-ai-captions-increase-video-ad-performance — open captions em ads: +80% completion, word-by-word highlight
- https://clip-forge.io/blog/short-form-video-caption-strategy — dual-coding, hook reinforcement (+15–25% watch duration)
- https://thecontentlabs.app/blog/do-tiktok-videos-need-on-screen-text — hook falado sozinho = 14x pior; texto espelha fala
- https://www.opus.pro/blog/anatomy-of-a-viral-tiktok-2026 — 59,4% delivery conversacional; captions queimadas animadas
- https://www.revid.ai/blog/the-anatomy-of-a-viral-short-2026 — 86,6% usam captions (96,8% animadas); faceless 55,3%
- https://viral.day/en/blog/the-18-parameters-that-define-a-viral-clip-and-how-to-measure-them-with-ai — 150–170 WPM, gaps >0,25s, pico de energia em 0,5s
- https://reelbase.io/blog/ai-voiceovers-vs-real-voice-engagement — AI VO vs voz real; pacing 140–200 WPM
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1 — sintaxe Dialogue/SFX/Ambient, segmentos com timestamp
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide — elementos de áudio no prompt Veo
- https://medium.com/google-cloud/veo-3-a-detailed-prompting-guide-867985b46018 — dois-pontos sem aspas evita legenda fantasma
- https://replicate.com/blog/using-and-prompting-veo-3 — alucinação de áudio (plateia), "(no subtitles)", diálogo explícito vs implícito
- https://github.com/snubroot/Veo-3-Prompting-Guide — prevenção de alucinação de áudio, formato de diálogo verificado
- https://skywork.ai/blog/how-to-prompt-lip-synced-dialogue-google-veo-3/ — lip-sync: 1 frase/clipe, 3–6s, sem música de fundo
- https://kling.ai/quickstart/klingai-video-3-model-user-guide — Native Audio: 5 línguas oficiais (zh/en/ja/ko/es), tradução p/ inglês fora delas
- https://kling.ai/blog/kling-video-3-omni-native-lip-sync-audio-guide — binding de voz <<<voice_1>>>, ambiente por descrição semântica
- https://kling.ai/quickstart/klingai-video-26-audio-user-guide — Voice Control [Personagem@Voz], tipos de som suportados
- https://videoai.me/blog/kling-ai-dialogue-lip-sync — limites de palavras por duração, troubleshooting de fala
- https://ponpon.ai/blog/kling-3-audio-guide — <20 palavras/clipe, 1 falante, ambiente automático, "soft background music"
