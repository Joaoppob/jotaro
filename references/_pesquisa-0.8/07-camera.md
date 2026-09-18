# Etapa 7 — Câmera (direção de fotografia): base teórica

> Pesquisa web, 2026-07-03. Fontes web verificadas ao final.
> Contexto: Jotaro 0.8 forja UM prompt único de vídeo multishot 9:16 (Higgsfield: kling3_0 / seedance_2_0_mini).
> A Etapa 7 é o agente CÂMERA — audita o rascunho como um diretor de fotografia.

---

## O que é e por que existe

A Etapa 7 responde a uma pergunta que nenhuma etapa anterior responde: **"a câmera escolhida
condiz com a intenção emocional de cada shot?"** Roteiro, personagem e ritmo definem O QUE
acontece; a câmera define COMO o espectador *sente* o que acontece. Shot size controla distância
emocional, ângulo controla relação de poder, movimento controla energia e atenção, lente controla
compressão do espaço e intimidade, e o formato de captura (16mm, digital, smartphone) controla
o contrato de autenticidade com o público.

A base cognitiva é sólida: shot sizes funcionam como "hierarquia de informação e emoção"
(Synima) — close-ups criam empatia forçada porque humanos só chegam a essa distância de quem
conhecem intimamente (Total Storyteller); ângulos moldam percepção subconsciente de poder
(Celtx, Britannica); e o cérebro humano dedica 30–40% do processamento visual a rostos, o que
faz do close-up a arma de retenção número 1 em feed vertical (Vidpros).

Por que um agente dedicado: modelos de vídeo AI foram treinados com vocabulário cinematográfico
real ("dolly in", "medium close-up", "handheld") e respondem a ele como instrução, não como
decoração (Studiolist/Seedance guide). Um rascunho sem direção de câmera explícita deixa a
decisão mais impactante do vídeo ao acaso do modelo.

---

## Base teórica

### 1. Shot sizes e efeito psicológico

Princípio central (Total Storyteller): **quanto mais perto o enquadramento, mais íntimo** —
porque replica distâncias sociais reais. A escala de menos para mais pessoal:
EWS → LS → MLS/cowboy → MS → MCU → CU → ECU.

| Sigla | Shot | Enquadra | Comunica | Quando usar |
|---|---|---|---|---|
| ECU | Extreme Close-Up | detalhe: olho, mão, textura do produto | intensidade máxima, obsessão, pressão, foco em detalhe simbólico | pico emocional, reveal de detalhe, textura de produto |
| CU | Close-Up | rosto preenche o quadro | empatia, vulnerabilidade, conexão direta — "o shot mais emocionalmente direto do cinema" (StoryboardCanvas) | beat emocional, reação, hook de retenção (rostos prendem atenção) |
| MCU | Medium Close-Up | do peito para cima | intimidade conversacional, confiança — "sweet spot para diálogo sustentado" | falas da personagem, depoimento, UGC talking-head |
| MS | Medium Shot | da cintura para cima | neutro, natural, equilíbrio pessoa+contexto — o "workhorse" do diálogo | apresentação, demonstração com as mãos, ensinar |
| MLS / cowboy | Medium Long Shot | coxa/joelho para cima | postura, fisicalidade, presença corporal | entrada de personagem, mostrar figurino/corpo |
| LS / WS | Wide Shot | corpo inteiro + ambiente | contexto, orientação espacial, relação sujeito↔lugar | estabelecer cena, mostrar cenário, respiro |
| EWS | Extreme Wide Shot | sujeito minúsculo no quadro | escala épica OU isolamento/insignificância | abertura, grandiosidade, solidão |

Regras derivadas:
- **Shot size é ritmo**: alternar íntimo↔amplo cria pulsação visual, como música alterna forte/fraco (Synima). Sequência wide→close = foco crescente; close→wide = revelação/alívio.
- **Vertical 9:16 favorece o lado íntimo da escala**: MCU/CU/MS dominam; EWS desperdiça o quadro estreito. Padrão de retenção em feed (Vidpros): abrir em MS ou CU nos primeiros 2–3s (hook), depois wide de contexto — o inverso do cinema clássico.
- Close-up não "ganho" nos beats anteriores parece manipulativo, não expressivo (Vidpros).

### 2. Ângulos e efeito

| Ângulo | Efeito psicológico | Quando usar |
|---|---|---|
| Eye-level | neutralidade, igualdade, realismo documental | padrão UGC/diálogo; a personagem fala de igual pra igual com o espectador |
| Low angle | poder, autoridade, heroísmo, ameaça | momento de confiança da personagem, hero shot de produto |
| High angle | vulnerabilidade, pequenez, humildade | "antes" do problema, autodepreciação cômica, fragilidade |
| Overhead / bird's eye (90°) | desapego, visão "divina", padrão gráfico | flat-lay de produto, estabelecer geografia, abertura |
| Dutch tilt | instabilidade, desorientação, algo errado | caos cômico, tensão; usar RARAMENTE — se todo beat tem ângulo dramático, nenhum funciona (Celtx) |
| OTS (over-the-shoulder) | ancoragem relacional entre dois sujeitos | conversa a dois, reação a algo/alguém |
| POV | imersão total — "máquinas de empatia: não assistimos a personagem, somos ela" (Peekatthis) | unboxing, experiência em primeira pessoa, demonstração |
| Shoulder-level | mais natural que eye-level estrito para corpo inteiro | alternativa ao eye-level em MS/MLS |

Síntese Celtx: eye-level = neutralidade; high = vulnerabilidade; low = dominância; dutch =
desequilíbrio; overhead = destino/desapego. **Combinações somam**: CU + low angle = determinação
heroica; WS + high angle = isolamento; MS + eye-level = realismo pé no chão. Ângulos devem
**evoluir com a dramaturgia** — mudar de high para low quando a personagem assume o controle.

### 3. Movimentos de câmera

| Movimento | O que faz | Sentido narrativo |
|---|---|---|
| Static / locked | câmera parada | ancora a cena, deixa a performance respirar, tensão contida |
| Pan (esq/dir) | gira no eixo horizontal | revelar informação lateral, seguir ação sem sair do lugar |
| Tilt (cima/baixo) | gira no eixo vertical | escala, verticalidade, apresentar personagem dos pés à cabeça (poder) |
| Push-in / dolly in | avança fisicamente ao sujeito | intimidade crescente, revelação interna, tensão — "convite visual, escalada" (Clapboard) |
| Pull-back / dolly out | afasta fisicamente | contexto, isolamento, fechamento de cena, respiro |
| Tracking / follow | acompanha sujeito em movimento | imersão na ação, caminhada, energia |
| Orbit / arc | circunda o sujeito | reveal 360 de produto/personagem, momento-monumento |
| Crane / boom | sobe/desce a câmera inteira | reveal de cenário, abertura/encerramento épico |
| Handheld | tremor humano | urgência, realismo cru, autenticidade UGC |
| Zoom | muda focal sem mover câmera | look retrô/camcorder (crash zoom cômico); em geral preferir dolly |

Regras derivadas:
- **Todo movimento precisa de motivação** — "evite movimentos sem propósito; defina ponto de início e fim" (LibreTexts). Movimento gratuito é ruído.
- Velocidade muda o significado: "slow dolly in" = tensão/intimidade/expectativa; "fast dolly in" = urgência/impacto (CinePrompt).
- Static não é ausência de decisão — é decisão. Em UGC, câmera fixa de tripé "parece produzido"; micro-shake handheld parece humano (Dearie Digital).
- **REGRA DE OURO PARA VÍDEO GERADO: um movimento primário por shot.** "Múltiplos movimentos simultâneos causam jitter, artefatos e output confuso" (Seedance 2.0 guide). Detalhe abaixo em §6.

### 4. Lentes e distância focal

| Faixa | Categoria | Efeito no espaço | Efeito no rosto/sujeito | DOF |
|---|---|---|---|---|
| 14–24mm | wide | expande profundidade, exagera distâncias, movimento parece mais rápido | distorce rosto de perto ("hatchet face"); imersão quase primeira-pessoa | profundo (tudo em foco) |
| 35mm | wide moderado | autêntico, ainda mostra ambiente | leve alongamento, energia | médio-profundo |
| 50mm | normal | mais próximo da visão humana; "a lente desaparece" | natural, honesto | médio |
| 85mm | retrato/tele curto | comprime espaço, fundo vira textura | rosto plano e lisonjeiro; "isolamento óptico faz o trabalho emocional" (Previs Pro) | raso (fundo cremoso) |
| 100–200mm | tele | achata tudo, fundo "cola" no sujeito | distância observacional, tensão, voyeurismo | muito raso |

Mecânica-chave (Previs Pro): mesmo enquadramento com lente mais wide = câmera mais perto =
maior diferença geométrica nariz↔orelha = rosto "arredondado" e presença invasiva; com tele,
câmera longe = rosto plano e isolado. **O público lê isso como distância emocional, não como
óptica.** DOF raso não é escolha estética isolada: vem de lente longa + proximidade — muda a
relação câmera-sujeito inteira. Wide lens amplifica percepção de movimento de câmera; tele
quase anula (Premiumbeat) — relevante para prompts: push-in em wide parece viajar pelo espaço,
em tele parece zoom.

Mapeamento prático: ambiente como personagem → 18–24mm; UGC autêntico com contexto → 24–35mm
(campo de visão de smartphone); diálogo clássico → 50mm; single emocional / beauty shot de
produto → 85mm com fundo desfocado.

### 5. Formatos / looks de captura

| Look | Assinatura visual | Evoca | Uso em conteúdo de marca vertical |
|---|---|---|---|
| 16mm film | grão orgânico visível, halation nos brilhos, gate weave sutil, cores gauzy, softness | nostalgia, autenticidade indie, "vivido", memória — "se o Super 8 é uma memória, 16mm é um documentário" (Filmmakers Academy) | marca lifestyle/heritage; "para no meio do scroll — a falta de naturalismo é a força" (Belmondo); grão dá gravitas |
| 35mm film | grão fino, cor rica, roll-off suave de highlights | cinema premium, atemporal, blockbuster | brand film aspiracional, campanha hero, produto high-end |
| Digital clean | nítido, sem grão, cores fiéis, alta definição | modernidade, precisão, tecnologia — mas em feed pode gritar "anúncio" | demos de produto tech, beleza/food com detalhe; risco de "Production Blindness" (Dearie) |
| VHS / camcorder | baixa resolução, smear, timestamp, cores lavadas | anos 80–90, home video, ironia, throwback | humor nostálgico, teaser retrô, gancho de pattern-break |
| Smartphone / UGC | flat, foco profundo, handheld micro-shake, luz de janela, frontal levemente descentrado | "conteúdo de amigo", confiança, zero-produção | formato dominante em 9:16: lo-fi supera hi-fi em ~2.4x engajamento (dados TikTok via inReels); 72% acham UGC mais confiável (Leapwave) |

Insight estratégico (Dearie Digital): em feed vertical, alta produção virou "Scroll Signal" —
o cérebro cataloga como anúncio e pula. O look de captura é a primeira decisão de *contrato
de autenticidade*: UGC/smartphone camufla o anúncio no feed; 16mm quebra o padrão com textura
analógica; digital clean só se paga quando o detalhe do produto É a mensagem.

### 6. Como modelos de vídeo AI respondem a vocabulário de câmera

Descobertas diretas dos guias Kling/Seedance/Runway/Veo (fontes 2026):

- **O vocabulário cinematográfico é instrução executável, não decoração.** "Seedance responde a vocabulário explícito: dolly in/out, pan, tracking shot, orbit, handheld, fixed/locked, crane, push in" (Studiolist). Todos os grandes modelos foram treinados nesses termos (VidScore).
- **Kling 3.0**: melhor superfície de controle de câmera do stack 2026 — enums `camera_control` (down_back, forward_up, right_turn_forward, left_turn_forward) e `advanced_camera_control.movement_type` (horizontal, vertical, pan, tilt, roll, zoom) + motion brush (AI Video Bootcamp). Em prompt de texto: começar com termo de enquadramento preciso ("extreme close-up", "medium close-up", "establishing wide shot") e direcional explícito ("smooth pan left to right", "slow dolly push toward subject"); responde a marcadores de tempo/beats ("Beat 0-4s: ...") — relevante para multishot num prompt único.
- **Seedance 2.0**: prompt-only (sem enum de câmera na API); estrutura recomendada `[Sujeito] + [Ação] + [Ambiente] + [Câmera] + [Estilo] + [Restrições]`. Duas regras críticas: (1) **um movimento primário por shot** — simultâneos causam jitter; sequenciais funcionam ("tracks right THEN cranes up"); (2) **separar frase da câmera da frase do sujeito** — misturar faz ambos se moverem imprevisível. Aceita specs de lente no estilo ("22mm wide-angle", "65mm IMAX, heavy film grain"). Default seguro: "slow dolly in, smooth gimbal, steady motion, no zoom".
- **Modificadores de velocidade**: "slow" antes de qualquer movimento funciona consistentemente em todos os modelos; "fast" é menos confiável (Veo às vezes ignora). Seedance responde bem a "rapid", "gradual", "creeping" (CinePrompt).
- **Diferenças entre modelos**: Kling e Runway distinguem dolly (parallax real) de zoom; Veo tende a tratar como sinônimos. Runway Gen-4 usa painel de controle visual em vez de texto para câmera. Kling 3.0 é melhor em física/movimento humano; Seedance 2.0 lidera em suavidade de movimento cinematográfico e atmosfera (benchmark Curious Refuge fev/2026 via AVB).
- **Looks funcionam via linguagem de estilo**: "heavy film grain", "16mm film look", "shot on smartphone, handheld" no bloco de estilo do prompt são interpretados; especificar lente ("35mm lens", "85mm portrait lens, shallow depth of field") influencia compressão e DOF do render.

---

## Opções e vocabulário que o agente tem à disposição

Léxico canônico (em inglês, como vai no prompt final):

- **Shot sizes**: `extreme close-up`, `close-up`, `medium close-up`, `medium shot`, `cowboy shot`, `full shot`, `wide shot`, `extreme wide shot`, `establishing shot`.
- **Ângulos**: `eye-level`, `low angle`, `high angle`, `overhead / top-down / bird's eye`, `dutch angle`, `over-the-shoulder`, `POV`, `shoulder-level`, `ground level`, `worm's eye`.
- **Movimentos** (UM primário por shot): `static / locked-off`, `slow pan left|right`, `tilt up|down`, `slow dolly in / push-in`, `dolly out / pull-back`, `tracking shot / camera follows`, `orbit / 360-degree arc`, `crane up|down`, `handheld with slight shake`, `smooth gimbal`, `crash zoom` (só look retrô/cômico).
- **Modificadores de velocidade**: `slow`, `gradual`, `creeping` (confiáveis) · `rapid`, `quick` (menos confiáveis — preferir manter tudo lento e deixar só UM elemento rápido).
- **Lentes/óptica**: `18mm wide-angle`, `24mm`, `35mm lens`, `50mm lens`, `85mm portrait lens`, `macro lens`, `shallow depth of field`, `deep focus`, `rack focus`, `anamorphic`.
- **Looks de captura**: `shot on 16mm film, organic grain, halation`, `35mm film look, fine grain`, `clean digital, crisp`, `VHS camcorder footage, timestamp`, `smartphone footage, vertical, handheld, natural window light, UGC style`.

---

## Como aplicar no fluxo 0.8

### Matriz intenção → escolha de câmera (defaults para 9:16 de marca)

| Intenção do beat | Shot size | Ângulo | Movimento | Lente/look sugerido |
|---|---|---|---|---|
| Hook (0–2s, parar o scroll) | CU ou MCU | eye-level | static handheld ou slow push-in | 35mm; look = o contrato do vídeo inteiro |
| Personagem fala / vende (UGC) | MCU | eye-level, olhando pra lente | handheld com micro-shake, static | smartphone/UGC, foco profundo |
| Demonstração de produto (mãos) | MS ou CU nas mãos | eye-level ou high leve | static ou slow tilt down | 50mm, digital clean |
| Beauty shot / hero de produto | CU→ECU | low angle leve | slow orbit OU slow push-in | 85mm, shallow DOF |
| Detalhe/textura (comida, material) | ECU / macro | overhead ou eye-level | static ou creeping push-in | macro, shallow DOF |
| Emoção / virada interna | CU | eye-level | slow push-in | 85mm, fundo dissolvido |
| Confiança / "depois" da transformação | MCU ou MS | low angle | slow push-in ou static | 35–50mm |
| Vulnerabilidade / "antes" | MS ou MCU | high angle | static | 35mm |
| Contexto / onde estamos | WS (raro EWS em 9:16) | eye-level ou overhead | slow pan ou crane down | 24mm, deep focus |
| Energia / ação / caminhada | MS–MLS | eye-level | tracking / camera follows | 24–35mm (wide amplifica movimento) |
| Nostalgia / memória / heritage | qualquer | eye-level | handheld suave | 16mm film grain, halation |
| Caos cômico / algo errado | MCU | dutch leve | handheld ou crash zoom | conforme look do vídeo |
| Fechamento / respiro / CTA | MS ou pull-back a WS | eye-level | slow pull-back | mesma lente do hook (fechar o arco) |

### Perguntas de auditoria do agente CÂMERA (checklist sobre o rascunho)

1. **Cada shot tem os 4 eixos definidos?** (size + ângulo + movimento + lente/look). Eixo ausente = decisão entregue ao acaso do modelo.
2. **O shot size condiz com a intenção emocional do beat?** (íntimo = perto; contexto = longe). O tamanho está "ganho" pelos beats anteriores?
3. **Há progressão/ritmo de tamanhos entre shots**, ou é tudo MCU monótono? Existe pelo menos uma alternância íntimo↔amplo?
4. **O ângulo tem justificativa dramática?** Se está tudo em eye-level: aceitável para UGC, mas há beat de poder/vulnerabilidade que pediria low/high? Se há dutch/overhead: é motivado ou enfeite?
5. **UM movimento primário por shot?** Qualquer "pan while tilting"/"dolly while orbiting" → reescrever como sequencial ("X, then Y") ou cortar em dois shots.
6. **Câmera e sujeito descritos em frases separadas?** (regra Seedance). Se misturados, separar.
7. **Velocidade explícita?** Preferir `slow/gradual`; se há elemento rápido, todo o resto do shot deve ser lento.
8. **A lente serve a distância emocional?** Reação emocional em wide de perto (distorce) ou master em 85mm (esmaga contexto) = erro clássico (Previs Pro).
9. **O look de captura é ÚNICO e coerente com o contrato de autenticidade do vídeo?** UGC não mistura com digital clean polido; 16mm não vira clean no shot 3 sem motivação narrativa (ex.: flashback).
10. **O vocabulário está no léxico canônico dos modelos?** Termos fora da lista (§Opções) devem ser traduzidos para termos treinados.
11. **Funciona em 9:16?** EWS e composições laterais desperdiçam quadro vertical; sujeito na banda vertical central, headroom controlado.
12. **O hook (shot 1) prende em 2s?** Rosto ou detalhe forte em CU/MCU, não establishing lento.

### Formato de saída sugerido (bloco de câmera por shot no prompt)

```
Shot N — [tamanho], [ângulo], [movimento único com velocidade].
Camera: [frase só da câmera]. Subject: [frase só do sujeito].
Lens/look: [focal + DOF + formato de captura — consistente no vídeo todo].
```

---

## Mudanças sugeridas ao fluxo 0.8

1. **Contrato de look global antes da auditoria por shot**: o agente CÂMERA deve primeiro fixar UM look de captura para o vídeo inteiro (UGC smartphone / 16mm / digital clean / VHS) derivado da marca e do canal — e só depois auditar shot a shot. Look é decisão de projeto, não de shot.
2. **Validador mecânico "um movimento por shot"**: regra objetiva (detectar "while", dois verbos de movimento de câmera na mesma frase) pode virar check automático no verify, não só julgamento do agente.
3. **Separação câmera/sujeito como lint do prompt final**: exigir que o bloco de cada shot tenha frase da câmera e frase do sujeito distintas (regra documentada do Seedance; beneficia Kling também).
4. **Dialeto por modelo no render**: se o alvo é kling3_0, o forjador pode opcionalmente emitir `camera_control`/`advanced_camera_control` (enums da API) além do texto; se seedance_2_0_mini, manter câmera 100% no texto com estrutura [Camera] explícita. A Etapa 7 decide a intenção; a camada de render traduz para o dialeto.
5. **Defaults de fallback**: quando o rascunho não dá base para decidir, usar "slow dolly in, smooth gimbal, steady motion, no zoom" (default seguro documentado do Seedance) em vez de omitir câmera.

---

## Fontes (URLs completas)

- https://www.synima.com/blog/the-language-of-shot-sizes/ — shot sizes como hierarquia de informação/emoção, ritmo visual
- https://www.studiobinder.com/blog/types-of-camera-shots-sizes-in-film/ — definições EWS→ECU
- https://storyboardcanvas.ai/shot-design-guide — efeito emocional por shot size e "use when"
- https://totalstoryteller.com/how-to-use-shot-sizes-camera-angles/ — escala de intimidade, proximidade do eyeline
- https://vidpros.com/common-camera-shot-types-angles-meanings-uses/ — shot sizes aplicados a conteúdo social/retenção, 30–40% do processamento visual em rostos
- https://blog.celtx.com/types-of-camera-angles-guide/ — ângulos, combinações size+ângulo, "não dramatizar todo beat"
- https://www.studiobinder.com/blog/types-of-camera-shot-angles-in-film/ — low/high/dutch/overhead detalhados
- https://en.wikipedia.org/wiki/Camera_angle — definições canônicas de ângulo e POV
- https://www.britannica.com/art/film/Shooting-angle-and-point-of-view — base histórica do ângulo como linguagem
- https://peekatthis.com/camera-angles-shots-every-filmmaker-needs-to-know/ — tabela ângulo→efeito→uso; POV como "empathy machine"
- https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film/ — pan, tilt, push-in, pull-out e sentido narrativo
- https://www.clapboard.com/blog/directing/cinematography/camera-movements-storytelling — movimento como decisão narrativa; push-in vs pull-out
- https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/Video_Production_Handbook/08%3A_Video_Aesthetics/8.03%3A_Camera_Movements — motivação e ponto de início/fim de movimento
- https://sequence.film/production-handbook/camera-movement — handheld vs dolly vs gimbal (texturas de movimento)
- https://www.indepthcine.com/videos/focal-length — focal length: espaço, compressão, DOF, conexão emocional
- https://wiki.previspro.com/shots/lens-choice-for-character — 35/50/85mm para personagem; geometria rosto/distância; erros clássicos
- https://www.clapboard.com/blog/directing/cinematography/camera-framing-visual-storytelling — wide vs tele: intenção narrativa por focal
- https://www.premiumbeat.com/blog/various-focal-lengths-for-images/ — percepção de movimento e compressão z-axis por focal
- https://www.panavision.com/highlights/highlights-detail/5-ways-focal-length-affects-your-subject — field of view, perspectiva, DOF, distorção
- https://www.tandfonline.com/doi/abs/10.1080/10407413.2014.877284 — Banks et al., por que 50mm parece "natural" (psicologia ecológica)
- https://www.filmsupply.com/articles/analog-footage-in-commercial-filmmaking/ — analógico em publicidade: heritage, autenticidade emocional
- https://www.belmondo.tv/journal/analog-in-a-digital-world — 16mm em campanha de marca; grão que para o scroll
- https://www.filmmakersacademy.com/blog-super-8-16mm-film-35mm-film/ — Super 8 vs 16mm vs 35mm: estética, grão, quando escolher
- https://www.mauriziomercorella.com/color-grading-blog/what-is-film-grain-charateristics-importance-filmmaking — grão: origem física e função estética
- https://mixinglight.com/color-grading-tutorials/behind-the-curtain-16mm-film-emulation/ — assinatura visual do 16mm (softness, 4:3, contraste)
- https://deariedigital.com/why-lo-fi-video-content-is-outperforming-polished-ads-and-how-to-shoot-it/ — "Production Blindness", como filmar lo-fi de verdade
- https://www.leapwave.ai/resources/native-tiktok-ads — anatomia do anúncio nativo TikTok; 72% confiam mais em UGC
- https://www.theauxiliaryco.com/blog-the-aux-cable/vertical-video-production-for-ads — produção vertical intencional 9:16 vs crop
- https://www.inreels.ai/blog/tiktok-ads-that-dont-look-like-ads — lo-fi 2.4x engajamento; sinais de autenticidade
- https://www.thebrief.ai/blog/ugc-video-ads-guide-formats/ — UGC-style por plataforma
- https://cineprompt.io/field-notes/camera-movement-keywords — keywords de movimento que funcionam em Runway/Kling/Veo/Sora/Seedance; modificadores de velocidade
- https://kling.ai/blog/ai-camera-control-movement-prompts-guide — guia oficial Kling: framing terms, direcionais, pacing
- https://studiolist.co/guides/seedance-2-prompt-guide/ — Seedance 2.0: um movimento por shot, separar câmera/sujeito, estrutura de prompt
- https://vidscore.dev/blog/ai-video-prompt-guide — vocabulário de câmera cross-model; "um movimento + uma ação por shot"
- https://aivideobootcamp.com/blog/cinematic-ai-video-prompts-2026/ — enums de câmera do Kling 3.0 (fal.ai), Seedance prompt-only, benchmark 2026
- https://medium.com/@creativeaininja/how-to-actually-control-next-gen-video-ai-runway-kling-veo-and-sora-prompting-strategies-92ef0055658b — tokens de câmera por modelo, prompts JSON/beats
