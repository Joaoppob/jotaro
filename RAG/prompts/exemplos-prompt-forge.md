# Exemplos de calibração do prompt-forge

> Leitor primário: o agente `prompt-smith`. Estes exemplos são **reais** e existem para
> calibrar o que a forja deve produzir. O `prompt-smith` monta o campo `prompt` do
> `prompt-forge.json` (`schemas/prompt-forge.schema.json`) no nível do **ALVO OURO** abaixo
> ou mais rico — **nunca** no nível de nenhum dos dois anti-padrões. O conhecimento de base
> (anatomia, camadas, avoid) está em `RAG/prompts/padroes-de-prompt.md`; aqui está a
> **calibração de nível**.

---

## Aprendizado-chave 1: a identidade vem da REFERÊNCIA, não de travar o texto

O anti-padrão 1 estrangula a riqueza do prompt por **medo de quebrar a personagem**: ele escreve
"everything else holds", "one continuous shot", "consistent identity, the existing light
unchanged" — e o resultado é fraco, um plano único travado, sem vida. Ele confia no texto para
segurar a identidade e, com isso, mata a direção.

O ALVO faz o oposto: **confia na referência** (a personagem entra como `<<<element_id>>>`, que o
backend reescreve pra `@nome` — o Element carrega o rosto, o corpo, a identidade) e por isso pode
**encher de direção** sem medo — cenas, cortes, câmera, mood, avoid, decupagem cronometrada. A
identidade está garantida pela referência; o texto fica livre para dirigir.

Regra de forja: **quanto mais forte a referência, mais rico pode ser o prompt.** Não trave o
texto para "preservar" a personagem — ancore a personagem no Element e dirija com tudo.

---

## Aprendizado-chave 2: a estrutura do anúncio — rotina → personalidade → produto, e a gravação TERMINA no produto

Isto é um **anúncio pra TikTok/Reels**, não um curta emocional. A estrutura correta tem uma
ordem fixa e um fechamento não-negociável:

1. **rotina** — o que ela faz. Energia, ação, contexto real (treino, dia a dia).
2. **personalidade** — quem ela é. A fala, a conexão direta com quem assiste, o momento humano.
3. **produto** — o fechamento. A gravação **termina aqui**. Não corta de volta pra rotina, não
   corta pra outro plano, não desvia pro rosto/sorriso genérico depois. **O produto é a última
   coisa que o vídeo mostra.**

Esta ordem já é a estrutura do `shots[]` (`beat: "gancho"` → `"desenvolvimento-conversa"` →
`"cta"`, na posição final) e do `narrative-quality.cjs` (que exige CTA no fechamento) — mas o
gate mecânico só confere se o **último shot está rotulado `cta`**, não se a *prosa* dentro dele
genuinamente encerra ali. É fácil rotular certo e ainda assim escrever uma prosa que corta de
volta pra outra coisa depois do produto — isso já aconteceu neste próprio arquivo (ver histórico
abaixo) e é o tipo de erro que só um olho humano ou um julgamento de qualidade pega, não um gate
determinístico. **Cheque a prosa, não só o rótulo do beat.**

### O erro que já aconteceu aqui — e por que ele é sutil

Uma versão anterior deste ALVO OURO tinha `beat: "cta"` certo no último shot, mas a *prosa*
dizia: "close-up of the packaging... **then cut back to her continuing the routine**." O rótulo
estrutural passava no gate; o conteúdo real cortava embora do produto um instante depois de
mostrá-lo. Isso é exatamente "as gravações não terminam no produto" — o vídeo tecnicamente
*mostra* o produto, mas não *fecha* nele. A correção: a última frase descrita, o último quadro
imaginado, tem que ser o produto — sem "e então" depois dele.

### O que a guarda regulatória do `soul-strategist` NÃO significa

O brief de alma (`schemas/alma.schema.json`) carrega os selos `produto_nao_a_camera` e
`produto_como_aliado` — eles existem pra impedir que o produto seja tratado como **herói ou
gatilho da virada emocional** (um "tomei X e tudo melhorou" é desfecho funcional e reprova). Isso
**não** significa esconder o produto, desfocá-lo, ou tirá-lo de quadro. Um prompt que escreve
"product softly out-of-focus in secondary plane, never facing the lens directly" está lendo a
guarda **literal demais** — e o resultado é um produto que desaparece do anúncio. O produto pode
e deve aparecer com **presença real**: nítido, em foco, seguro/consumido com naturalidade, como o
**fechamento** do reel. A guarda barra o *pack shot de catálogo* (produto de frente pra câmera
tipo anúncio de prateleira) e o *desfecho funcional* (produto como causa da virada) — não barra o
produto **visível e presente**. Ver ANTI-PADRÃO 2 abaixo — é exatamente esse erro de leitura.

---

## Aprendizado-chave 3: o gancho é SEMPRE ação + fala, nunca um frame parado e mudo

Isto vem de cima do pipeline (`story-writer`, `storyboard-director`), mas chega até aqui: a Scene 1
do `prompt` nunca é uma imagem silenciosa esperando a fala "começar depois". A personagem já está
em ação física E já está falando desde o primeiro instante — a fala do gancho nunca fecha uma
ideia sozinha, ela puxa pra frente. O catálogo completo de padrões reais (walk-and-talk, grab-
and-speak, mirror pull-in, spin-reveal...) está em `RAG/prompts/hooks-de-movimento.md` — escolha
um de lá em vez de inventar um gesto genérico. O ALVO OURO abaixo aplica isso: a Scene 1 já traz
`Duda` falando desde o frame 1, não só treinando em silêncio.

**Não invente uma complicação técnica específica que ninguém pediu.** Se o brief é "ela dançando
bem", a cena é ela dançando bem — nunca "ela dançando, mas travando numa parte específica da
coreografia" que ninguém escreveu. O padrão de hook dá a forma (ação + fala); o conteúdo vem do
que foi de fato pedido.

---

## Aprendizado-chave 4: o CTA é SEMPRE fala real da personagem, nunca card mudo — e nunca revela série

Bug real (run de produção, 2026-07-01): um roteiro de capítulo de arco serializado saiu com CTA
"segue pra não perder o capítulo 2" — quebrando a quarta parede sobre a própria estrutura de
produção. O espectador nunca sabe que existe um "capítulo 2" por trás; o vídeo termina como
qualquer conteúdo autocontido, de forma abrupta, na última palavra da fala.

O `shots[]` cta (ver ALVO OURO abaixo) reflete isso: `fala: "bora, segue aí pra ver o resto do
treino"` — CTA genérico e natural ("segue pra ver mais"), nunca meta-referência de série. Corte
seco na última palavra, sem desacelerar depois dela nem "resolver" a cena — o fechamento no
produto (Aprendizado-chave 1) acontece **simultâneo** à fala, não depois.

---

## ALVO OURO — o que produzir

Prompt rico multishot. É este o piso de qualidade do `prompt` que o `prompt-smith` entrega (ou
mais rico). Note a estrutura: abertura de estilo/medium + personagem ancorada na referência → 3
cenas na ordem **rotina → personalidade → produto** → visual style → editing style → mood →
camera direction → **avoid** → decupagem cronometrada, fechando literalmente no produto, sem
corte de volta. Cada camada é fato visual nomeado, não quality-word vazia.

```
Vertical TikTok-style video, 9:16, dynamic lifestyle fitness routine inside a modern gym, real energy from start to finish. A stylish young woman named Duda <<<element_id>>> moves through her daily gym routine — natural, energetic, feminine, aspirational, like a polished TikTok vlog with cinematic cuts. The arc is simple and sharp: her routine first, her personality next, the product last — the video closes on it, never cuts away from it.
Scene 1 (routine — the hook, action and voice together from frame one): Duda is already training in the gym when the video opens, mid-motion, and speaks straight to camera the instant it starts — "gente, vem comigo que hoje o treino tá diferente" — as she adjusts her hair and grabs the weights, no silent beat before the line lands. Quick cuts of chalk dust on her hands, stretching against the rack, short breaks between sets. Sweat catching the overhead gym lights. The camera moves with real energy: handheld-style shots, close-ups of hands gripping the bar, sneakers on rubber flooring, mirror reflections catching her mid-motion — action and voice building toward the next scene together, never a static muted frame.
Scene 2 (personality): Duda pauses, leaning on the rack, talking casually straight to camera during a break — relaxed, smiling, slightly out of breath, sharing a quick moment from her routine like a genuine TikTok "day in my routine" clip. Natural window light mixes with the gym's indoor lights on her skin. Soft background gym noise, natural body language, quick jump cuts between her words.
Scene 3 (product — the closing beat, held longer than the cuts before it): Duda reaches into her gym bag and pulls out the FitBar wrapper <<<produto_element_id>>> — the real branded bottle, never a generic invented jar. The camera settles — a deliberate close-up on her hand, the packaging catching a warm practical light source (a locker-room lamp or window light, motivated, not staged), her fingers peeling back the wrapper. She brings it to her mouth and eats it, a small, genuine, unguarded smile as she tastes it — savoring, not performing — and says, light and natural, right as the camera holds on the product: "bora, cola aqui que o treino continua". The product stays clearly in frame and in focus, held naturally in her hand at chest height, never facing the lens like a commercial pack shot, but never hidden or blurred either — this is the last thing the video shows. Hard cut on her last word — no cut back to the workout, no lingering resolve, no mention of chapters or series.
Visual style: modern TikTok aesthetic, clean gym environment, soft natural lighting mixed with subtle indoor gym lights, fresh skin tones, realistic textures — sweat, chalk, rubber, steel — slightly cinematic but still casual and social-media friendly. Soft, feminine, contemporary palette with subtle pink accents that connect to the brand, warming slightly into Scene 3's practical light.
Editing style: fast-paced TikTok cuts and rhythmic transitions through Scenes 1 and 2, jump-cuts and quick zoom-ins carrying the energy — then a deliberate slowdown into Scene 3, where the cutting rate drops and the camera holds, giving the product moment real weight instead of rushing past it. Dynamic but not chaotic; the pacing itself signals what matters.
Mood: confident, healthy, energetic, feminine, aspirational through the routine and personality beats — settling into warm, personal, unhurried satisfaction in the product beat. Not commercial, not staged.
Camera direction: vertical framing throughout. Scene 1 — handheld energetic mid shots and close-ups, mirror angles, quick zoom-ins. Scene 2 — medium close-up, natural handheld drift, eye-level, speaking to camera. Scene 3 — camera settles into a static or slow push-in close-up on hand and face, product clearly lit and in focus, held for the final beat.
Avoid: exaggerated commercial acting, unrealistic gym movements, neon colors, overly dramatic lighting, fake smiles, stiff posing, oversexualized framing, messy background, product facing the lens like a catalog shot, cutting away from the product before the video ends, text overlays unless needed.
Create a 12–15 second vertical TikTok-style video in 9:16.
0–4 seconds: Duda already training in a modern gym, speaking straight to camera from the first instant ("gente, vem comigo que hoje o treino tá diferente") — fast cuts of lifting weights, chalk on hands, stretching, checking herself in the mirror. Energetic, real movement, action and voice together, no silent opening frame.
4–8 seconds: Duda takes a short break, talks casually straight to camera about her routine — natural, confident, friendly, relaxed, genuine half-smile.
8–12 seconds (closing beat — the product): Duda opens her gym bag, takes out the FitBar wrapper, unwraps the bar, brings it to her mouth, eats it, small genuine smile, and says "bora, cola aqui que o treino continua" as the camera holds on her hand and the product, clearly lit and in focus. Hard cut on her last word — no cut back to the workout.
Style: polished TikTok vlog, lifestyle fitness aesthetic, soft feminine colors, clean gym lighting, realistic handheld camera, quick jump cuts easing into a deliberate hold, natural expressions, stylish but casual direction. The product is part of her routine and her self-care — genuinely held, genuinely eaten, clearly seen, never hidden and never sold like a pack shot.
```

**Por que funciona:** a personagem entra ancorada na referência (`<<<element_id>>>`); a partir daí
o prompt **dirige sem medo** nas cenas 1 e 2 — textura real (giz, suor, borracha, aço), luz
motivada, câmera específica. E crucialmente, a **cena 3 desacelera**: o ritmo de corte cai, a
câmera se assenta, o produto ganha peso visual real (nítido, em foco, seguro com naturalidade) —
e o vídeo **termina ali**, no instante em que ela termina de falar o CTA. Nenhum corte de volta
pro treino, nenhum desvio pro rosto genérico, nenhuma menção a capítulo/série. É exatamente o que
`shots[]` codifica de forma estruturada: `shots[2]` (`n:3`, `beat:"cta"`) tem `fala:"bora, segue
aí pra ver o resto do treino"` e `movimento_camera` dizendo "camera settles... holds... no cut
back", coerente com a prosa — o CTA fala, não é card mudo.

**O produto também entra ancorado na referência, não descrito à força (regra escalada
2026-07-01, prioridade máxima).** `produto_element_id` é injetado no `prompt` como
`<<<produto_element_id>>>` exatamente no instante em que o produto aparece — o mesmo mecanismo do
`<<<element_id>>>` da personagem, aplicado ao frasco real da marca. Sem essa âncora, o modelo
inventa uma embalagem genérica; o `identity-quality.cjs` agora **reprova** (não só avisa) quando o
fechamento mostra o produto sem o Element dele pronto.

**Nota de idioma (regra forte, não coincidência):** a prosa acima é toda em inglês — é direção
técnica (câmera, edição, mood, avoid), e isso é certo. Mas a **locução** desse mesmo reel, em
`RAG/prompts/exemplo-prompt-forge-examplebrand.json` (`audio.locucao[].texto` e `shots[].fala`,
incluindo o CTA em `shots[2]`), é sempre em português — "ó, esse é meu treino de hoje, bem
rapidinho" no gancho, "bora, cola aqui que o treino continua" no CTA. Isso não é acaso:
locução/fala é *sempre* PT-BR, por regra (ver `RAG/prompts/padroes-de-prompt.md` §Idioma e o gate
`scripts/lib/locucao-idioma.cjs`), mesmo com toda a direção técnica em inglês ao redor.

---

## ANTI-PADRÃO 1 — congelamento por medo

Prompt de "preservação": plano único travado, resultado fraco. Foi gerado pelo Jotaro -0.6, na
fase em que a forja tinha medo de quebrar a personagem e por isso estrangulava a riqueza.

```
Smooth lateral tracking shot moving with Duda over four seconds. Her arm rises and she brings the bottle to her lips in one slow, deliberate sip, a single exhale of settling. Everything else holds: stable framing, consistent identity, the existing light unchanged, one continuous shot.
```

**Por que falha:** "Everything else holds", "consistent identity", "the existing light
unchanged", "one continuous shot" — tudo isso é **medo virado em instrução**. O prompt trava o
texto para não arriscar a personagem e, no processo, entrega um plano único morto: uma cena, um
movimento, zero direção, zero edição, zero arco. A identidade deveria vir do Element, não de
congelar o frame. O `prompt-smith` **nunca** produz neste nível.

---

## ANTI-PADRÃO 2 — alma sem anúncio (a arte engole o produto)

Prompt real, gerado com craft cinematográfico genuíno — muito mais rico e específico que o
ALVO OURO em cada plano isolado (luz motivada com temperatura de cor nomeada, match-cuts, arco
frio→quente, blocking preciso). E ainda assim **falha como anúncio**, de duas formas distintas:

```
Arco emocional por cena: tensão e silêncio pré-ação → determinação e dureza controlada → energia e conquista física → triunfo suave, calor e fechamento.

Vertical fitness lifestyle video, 9:16, raw motivational tone inside a real modern gym. A disciplined young woman named Duda <<<element_id>>> anchors the frame across four beats — her energy carries the arc, not her face.

Scene 1: Duda seen from behind, standing still in front of a weight rack. Breath visible in the rise and fall of her shoulders. Overhead fluorescent key light, cold 5600K, casting hard shadows down her back and across the rubber floor. Complete stillness — the silence before effort. [...]

Scene 2: Hard-cut to close-up of Duda's face in the mirror — jaw set, eyes forward, punching silence. Split lateral light from frame right, hard source at 45° cutting the face into shadow and highlight. [...]

Scene 3: Match-cut from fists in mirror to hand gripping a water bottle — lateral tracking shot follows Duda mid-squat with a barbell [...]. Hard-cut to wall rest: Duda leaning against raw concrete, drinking water, one hand rising naturally to her mouth with a FitBar wrapper between two fingers — product softly out-of-focus in secondary plane, never facing the lens directly. [...]

Scene 4: Slow counter-plongée zoom-in: camera rises slightly below Duda's eye line and pushes toward her face. A smile builds from nowhere — slow, earned, not performed. [...]

Avoid: pack shot facing camera, product as hero of any frame, [...]
```

**Por que falha (duas causas, ambas do mesmo erro-raiz):**

1. **O produto está enterrado e desfocado.** "Product softly out-of-focus in secondary plane,
   never facing the lens directly" — isso não é "produto como aliado", é produto **invisível**.
   Leia a guarda regulatória literal demais (ver Aprendizado-chave 2 acima) e o resultado é um
   anúncio que mal mostra o que está vendendo.
2. **O vídeo não termina no produto — termina num sorriso genérico.** O arco emocional (Scene 4:
   "a smile builds... camera pushes toward her face") rouba o fechamento que deveria ser do
   produto (que nem aparece na Scene 4, e já ficou pra trás, borrado, na Scene 3). Rotina →
   personalidade → produto virou rotina → determinação → produto-borrado → triunfo-facial. A
   "alma" (o arco tensão→triunfo) engoliu a estrutura do anúncio.

**A lição, não o descarte:** o craft aqui é real e vale roubar — luz motivada com temperatura
nomeada, texturas específicas (concreto, borracha, aço), o ritmo de corte que desacelera no
fechamento. O ALVO OURO acima **incorpora esse craft**, mas aplicado à estrutura certa: a câmera
desacelera e assenta na **Scene 3 (o produto)**, não numa Scene 4 sem produto. Vida e estrutura
não competem — a vida serve a estrutura, nunca a substitui.

---

## ANTI-PADRÃO 3 — o produto encolhe no fechamento (zoom-out)

Prompt real, gerado e **renderizado de verdade** (run de produção, 2026-07-01). A estrutura estava
certa (rotina → personalidade → produto, termina no produto, sem cortar de volta) — mas a *câmera*
do fechamento errou de um jeito diferente do ANTI-PADRÃO 2: em vez de esconder o produto, ela se
afastou dele bem na hora de mostrá-lo.

```
Scene 3 (release and product — the closing beat, camera settles and holds): [...] A slow, deliberate zoom-out follows: the camera pulls back and reveals the full room — colorful LED wrap around the walls, the creator setup spread around her, ring light behind her, she at the center of it all, at ease. The FitBar wrapper is clearly in frame at the end of the zoom-out — visible, in focus, on the desk in front of her [...]
```

**Por que falha:** o produto está de fato visível, em foco, sem pack shot e sem corte pra outra
coisa — a letra da regra passa. Mas o *movimento de câmera* (`slow zoom-out`, plano final `wide`)
faz o produto **encolher na tela** exatamente no momento em que ele deveria ganhar peso visual. O
vídeo real mostrou o quarto inteiro, com o produto pequeno num canto do quadro — o oposto do
"close-up deliberado" do ALVO OURO (Scene 3: "camera settles into a static or slow push-in
close-up on hand and face, product clearly lit and in focus"). "Desacelerar o corte" (menos
cortes, hold mais longo) foi lido como licença para abrir o plano — não é. Desacelerar é a câmera
**entrar ou segurar perto**, nunca se afastar.

**A correção:** o fechamento com produto sempre termina em `close`/`medium-close`/`extreme-close`,
com `movimento_camera` do tipo `push-in`, `settles`, `holds` — nunca `zoom out`, `pull back`,
`dolly out` ou qualquer variação de "revela o ambiente". Mecanicamente armado pelo gate
`scripts/lib/product-closeup.cjs` (Wave M).

---

## FORMATO DA ENTRADA — de onde a forja PARTE

O brief simples do usuário. É deste tipo de entrada (curta, informal, em PT-BR) que a forja
parte para chegar ao nível do ALVO OURO. O usuário descreve a intenção; o time enriquece camada
por camada (identidade → alma → roteiro → decupagem → ritmo de corte) até o `prompt-smith`
montar a prosa final.

```
quero uma cena na academia da duda, comendo a fitbar em um momento da rotina, cena 1 ela treinando, cena 2 conversando e cena 3 comendo a fitbar, estilo tiktok com cortes entre elas, bem dinâmica, na rotina.
```

**A distância entre a entrada e o alvo é o trabalho da forja.** A entrada tem a semente (3 cenas,
academia, FitBar, estilo TikTok dinâmico com cortes, na ordem rotina→personalidade→produto);
o ALVO é essa semente enriquecida com visual style nomeado, editing style, mood, camera direction,
avoid e decupagem cronometrada que **fecha no produto sem desviar** — com a Duda ancorada no
Element, não descrita no texto. O exemplo válido completo que sai dessa entrada está em
`RAG/prompts/exemplo-prompt-forge-examplebrand.json`.
