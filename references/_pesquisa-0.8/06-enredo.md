# Etapa 6 — Enredo (fio narrativo + decupagem): base teórica

> Pesquisa web 2026-07-03. Suporta o agente ENREDO do Jotaro 0.8 — fusão do
> story-writer + storyboard-director da 0.7. Pergunta-guia do agente: "o que acontece,
> cena a cena, condiz com o projeto?"

## O que é e por que existe

A Etapa 6 audita o rascunho do prompt multishot em duas camadas inseparáveis:

1. **Fio narrativo** — o vídeo conta uma história com arco completo? Gancho, beats de
   escalada, clímax, CTA. É a camada do *roteirista*.
2. **Decupagem** — a história está quebrada em cenas/planos filmáveis, com continuidade
   espacial e transições motivadas? É a camada do *diretor de storyboard*.

Na tradição de cinema essas camadas são documentos distintos: o roteiro (screenplay) e o
**découpage technique** — "última etapa da preparação do shooting script: o roteiro é
cortado em sequências e planos numerados, com notas detalhadas de ângulos e movimentos de
câmera" (Hackett, French Cinema Film Terms). O GDT (Office québécois de la langue
française) define découpage como a "construção definitiva do cenário: estabelecida a
lógica dramática, as cenas são decupadas em planos sucessivos", cada plano numerado com
ação, movimento de atores, movimento de câmera, ângulo e tamanho de plano. Ou seja: a
decupagem **pressupõe** a lógica dramática já resolvida — o que justifica auditar as duas
camadas juntas, nesta ordem, dentro de um único agente.

## Base teórica (com as descobertas da pesquisa)

### 1. Estrutura narrativa em micro-formato (15-60s)

- **Beat como unidade mínima.** McKee ("Story", via Superdirector): beat é "uma troca de
  comportamento em ação e reação" — o momento em que algo muda (revelação, virada
  emocional, informação nova, decisão). Short-form não inventou beats; **comprimiu-os**:
  cada beat carrega mais peso, e não há espaço para beat que não move o espectador.
- **Três atos comprimidos.** ScreenWeaver: Ato 1 = Hook (0-5s), Ato 2 = Escalada
  (5-45s), Ato 3 = Payoff (45-60s). Proporção ~5-10% hook / 70-75% escalada / 15-20%
  payoff. Tabela por duração: 15s → hook 1-2s, escalada 8-10s, payoff 3-5s; 30s → hook
  2-3s, escalada 18-22s, payoff 5-8s; 60s → hook 3-5s, escalada 40-45s, payoff 10-15s.
- **"Setup as payoff".** Em 15-60s não há tempo para setup e depois payoff separados —
  cada beat faz as duas coisas ao mesmo tempo (ScreenWeaver).
- **Modelo 5-beats.** Lomero (análise de segmentos): hook (0-3s) → contexto (3-8s) →
  problema (8-15s) → reveal (15-25s) → CTA (25-30s). Em 15s os beats colidem
  intencionalmente (contexto+problema fundem; reveal+CTA sobrepõem); em 60s as durações
  expandem mantendo a proporção.
- **Regra 3-7-21** (microdrama vertical, via CapCut): atenção em 3s, situação clara em
  7s, primeira recompensa/virada em 21s — força progresso cedo mesmo em vídeo de 60s.
- **Hook em 1-3s.** Consenso de todas as fontes. Retensis: queda >30% nos primeiros 3s
  = hook fraco. ClipForge: reter 60%+ dos viewers aos 3s é o portão de distribuição
  (vídeos acima disso têm ~4,2x mais alcance que os abaixo de 40%). Tipos de hook
  (Buffer.live/IFAA): imagem-choque, frase provocativa, ação com stakes imediatos,
  pergunta. O hook deve funcionar **sem som** (muitos scrollam mutados).
- **Clímax/payoff a ~65-80% da duração.** Análise de 200 virais (DEV.to Reader): payoff
  antes de 80% do vídeo → completion rate ~34% maior; posição ideal 65-75%. Coincide com
  o "reveal aos 15-25s de 30" do modelo Lomero.
- **Retention reset no meio de vídeos de 60s.** ScrollScript: segunda onda de drop-off
  aos ~25-30s exige um reset (pergunta nova, ângulo novo, pattern break) antes do
  segundo beat maior.
- **CTA integrado e suave.** Lomero: CTA soft ("segue para mais X") converte mais que
  hard. Real Reel/vertical drama: "corte na pergunta, não na resposta" — o final forte é
  o que gera share e replay. Loop (final que reconecta ao início) gera replays, que o
  algoritmo do TikTok pesa mais que quase tudo (Retensis). No Jotaro 0.7 o CTA já é fala
  real da personagem — a teoria confirma: CTA como beat dramático, não como apêndice.

### 2. Decupagem clássica e continuidade

- **Decupar** = cortar a ação em planos numerados, cada um com: ação, tamanho de plano,
  ângulo, movimento de câmera, quem está em quadro (GDT/CinéCréatis). É o documento que
  garante que "o resultado final fique próximo do planejado" — exatamente a função do
  prompt multishot.
- **Continuity editing** (Wikipedia): sistema de regras para que o espectador perceba
  espaço e tempo consistentes entre cortes — a "edição invisível". Ferramentas de
  continuidade espacial: establishing shot, regra dos 180°, eyeline match, match on
  action.
- **Regra dos 180°** (Wikipedia/StudioBinder): câmera fica de um lado do eixo de ação
  entre dois sujeitos, preservando a relação esquerda/direita entre planos. Cruzar a
  linha desorienta (reverse cut). Válido também para movimento: sujeito andando não pode
  inverter direção aparente entre planos. Formas legítimas de resetar a linha: plano
  neutro sobre o eixo, movimento de câmera contínuo, cutaway.
- **Regra dos 30°** (Learn About Film): entre dois planos do mesmo sujeito, mudar
  posição da câmera em pelo menos 30° (ou mudar tamanho de plano) para evitar jump cut
  não intencional.
- **Cobertura** (Wikipedia Camera coverage / Tools for Film): master (wide que cobre a
  cena toda) + medium shots + close-ups + OTS + reaction shots + inserts/cutaways.
  "Call and answer": plano e contra-plano usam mesmo tamanho de lente/distância para
  consistência. No contexto de prompt gerado (sem edição posterior), cobertura vira
  **variedade planejada de planos** — o checklist do Story2Board se aplica direto:
  "shot sizes variam — sem sequências longas de enquadramento idêntico".
- **Corte motivado** (Story2Board): todo corte deve ser motivado por algo — olhar do
  personagem, som, movimento. Ex.: CU personagem olha à esquerda → CUT (motivado pelo
  olhar) → MS do que ela vê. Cortes arbitrários "desperdiçam" em short film; em prompt
  multishot, transição sem motivação vira incoerência visível.

### 3. Storyboarding — o que um quadro profissional define

Convergência de Storyflow, Drawstory, Soundstripe, Pixflow e Storyline Forge — cada
painel/quadro comunica:

1. **Quem está em quadro** e onde (blocking, posição, entrada/saída de quadro)
2. **Ação** — o que acontece fisicamente no plano
3. **Tamanho de plano** — ECU, CU, MCU, MS, WS, establishing
4. **Ângulo** — eye-level, high, low, dutch
5. **Movimento de câmera** — static, pan, tilt, dolly, tracking, zoom (com direção)
6. **Transição para o próximo plano** — cut, match cut, dissolve, motivação do corte
7. **Duração estimada** e diálogo/som-chave do plano

Storyflow (guia 2026): "se alguém pode reordenar seus painéis sem quebrar o sentido, a
sequência não está fazendo trabalho narrativo suficiente" — teste direto de fio causal.
E: "storyboards fracos falham **entre** os quadros, não dentro deles" — o handoff
painel-a-painel (transition logic) é onde auditar. O equivalente textual disso num prompt
multishot é: cada shot do prompt precisa carregar os 7 itens acima em linguagem, e cada
junção shot→shot precisa de motivação e continuidade explícitas.

### 4. Retenção em short-form (dados)

- **Mudança visual a cada 2-5s.** Retensis: algo na tela deve mudar a cada 3-5s (corte,
  texto, ângulo, cutaway); jump cuts regulares melhoram watch time em 10-15 p.p. vs
  plano estático. Virvid: top Shorts têm 1 mudança visual a cada 2-4s (20+ clipes nos
  primeiros 60s). Análise de 200 virais TikTok: ASL (average shot length) <2,5s
  correlaciona com views (mediana 4,2M para ASL<1,5s vs 800K para ASL>4s).
- **Pattern interrupts a cada 8-12s** (macro) — Creedom, 50 vídeos 10M+: 88% tinham
  quebra de ritmo visual/narrativo a cada 8-12s; com interrupt: 8% drop por intervalo de
  15s; sem: 22%. Lomero: 2-4 interrupts num vídeo de 30s ("menos de 2 = meio saggy; mais
  de 4 = frenético"); heurística: se nada novo (visual, áudio ou tonal) entrou nos
  últimos 4s, o vídeo está derivando. Densidade varia por plataforma (TikTok tolera
  mais; Shorts, menos).
- **Open loops.** Superdirector: o mecanismo de momentum é fechar um beat abrindo uma
  pequena pergunta e empilhar loops em ordem crescente de impacto — versão estrutural é
  melhor que o signpost verbal ("mas aqui vem o melhor...").
- **Curva de drop-off tem 3 zonas** (Lomero): penhasco nos 3s (filtro do hook), declive
  raso no meio (attention drift — território dos pattern interrupts), queda no final
  (reveal entregue ou não). Otimizar só o hook "deixa ~40% da retenção potencial na
  mesa".
- **Completion rate importa tanto quanto retenção.** TikTok: 21-34s é a faixa de maior
  completion (dados creator-fund via ScrollScript); Virvid: 92% de completion = status
  "sticky" com multiplicador ~3x de alcance no TikTok. Vídeo curto completado > vídeo
  longo abandonado.

## Opções e vocabulário que o agente tem à disposição

**Estruturas narrativas (escolher 1 por projeto):**

| Estrutura | Beats | Melhor para |
|---|---|---|
| 3 atos comprimidos | Hook → Escalada → Payoff | narrativa geral 30-60s |
| 5 beats (Lomero) | Hook → Contexto → Problema → Reveal → CTA | conteúdo comercial/UGC |
| Micro-arco (IFAA) | Setup → Turn → Payoff | 15s, gag única, twist simples |
| 3-7-21 | Atenção 3s → Situação 7s → Recompensa 21s | teste de progresso em qualquer duração |
| Vertical drama | Hook/explosão → Friction → Spike → Button | dramático/serial, cliffhanger |

**Tipos de beat:** hook (imagem, frase, ação, pergunta), setup/contexto, inciting
incident, escalada, midpoint twist / retention reset, reveal/clímax, payoff, CTA-como-fala,
button/cliffhanger, loop-back (final reconecta ao início).

**Elementos de decupagem por shot (checklist de 7 itens):** quem em quadro + blocking;
ação; tamanho de plano (ECU/CU/MCU/MS/WS/EST); ângulo (eye/high/low/dutch); movimento de
câmera (static/pan/tilt/dolly/tracking/zoom + direção); transição e sua motivação
(olhar, som, movimento, match); duração estimada + fala/som.

**Regras de continuidade:** 180° (eixo de ação e direção de movimento consistentes),
30° (ou muda tamanho de plano) entre shots do mesmo sujeito, eyeline match, match on
action, establishing quando muda de espaço, corte motivado sempre.

**Léxico vertical 9:16** (IFAA/Buffer.live): close-ups vencem (rosto/olhos leem melhor
em tela pequena), movimento vertical > lateral, ação em camadas
foreground/midground/background, hook funciona mutado.

## Como aplicar no fluxo 0.8 (perguntas de auditoria sobre o rascunho)

**Camada A — fio narrativo:**

1. O hook está nos primeiros 1-3s do primeiro shot, é visual (funciona sem som) e abre
   uma pergunta que só o resto do vídeo responde?
2. Qual estrutura o rascunho segue (3 atos / 5 beats / micro-arco)? Ela condiz com a
   duração e o objetivo do projeto?
3. Aos 7s a situação está clara? Aos ~21s (ou 1/3) já houve primeira virada/recompensa?
4. O clímax/reveal cai entre 65-80% da duração — nem antes demais, nem guardado para o
   último segundo?
5. Vídeo de 45-60s: existe retention reset (pergunta nova, ângulo novo) perto do meio?
6. Cada beat muda algo (informação, emoção, stakes)? Beat que não muda nada = cortar.
7. O CTA é um beat dramático integrado (fala da personagem, consequência da história) e
   não um apêndice? O final abre loop ou fecha com força (share/replay)?
8. **Teste de reordenação:** se as cenas puderem ser embaralhadas sem quebrar o sentido,
   o fio causal está fraco.

**Camada B — decupagem:**

9. Cada shot do prompt especifica os 7 itens (quem, ação, plano, ângulo, movimento,
   transição, duração)? Item ausente = ambiguidade que o gerador vai preencher sozinho.
10. Shots consecutivos do mesmo sujeito respeitam 180° (posição e direção de movimento)
    e 30° (ou mudam tamanho de plano)?
11. Toda transição shot→shot tem motivação (olhar, som, ação, match)?
12. Os tamanhos de plano variam — sem dois shots seguidos com enquadramento idêntico?
    Predominam closes (9:16)?
13. Há mudança visual pelo menos a cada 3-5s dentro da duração de cada shot, e um
    pattern interrupt (mudança de ritmo/ângulo/elemento) a cada ~8-12s no total?
14. Mudou de espaço/tempo? Precisa de re-establishing ou pista visual de localização.
15. Cada shot condiz com o projeto (produto, personagem, identidade visual) — fidelidade
    ao dossiê acima de virtuosismo de câmera.

## Mudanças sugeridas ao fluxo 0.8

1. **A fusão story-writer + storyboard-director se sustenta.** A teoria clássica é
   explícita: découpage é a etapa *final* do roteiro, feita sobre a lógica dramática já
   resolvida (GDT), geralmente por *uma* pessoa (o diretor — CinéCréatis). Em 15-60s,
   onde "setup é payoff" e cada beat é também um plano, separar os dois papéis criaria
   handoff artificial. Manter fundido, mas **auditar em duas passadas ordenadas dentro
   do mesmo agente**: primeiro fio (perguntas 1-8), depois decupagem (9-15) — nunca
   misturado, porque decupagem sobre fio quebrado é retrabalho garantido.
2. **Adotar o checklist de 7 itens por shot como contrato de saída.** Se o rascunho do
   prompt não nomeia tamanho de plano, movimento e motivação de transição por shot, o
   ENREDO devolve com gap apontado (não completa por inferência).
3. **Adicionar verificação de posição do clímax (65-80%)** como check numérico simples
   sobre a timeline do prompt — é o dado mais acionável da pesquisa de retenção.
4. **Para durações 45-60s, exigir retention reset explícito no meio** (~25-30s) — beat
   marcado no prompt, não esperança de que o gerador crie variedade.
5. **Incluir teste de mute:** o hook e o clímax precisam ler visualmente sem áudio
   (short-form é consumido mutado com frequência) — pertinente porque o prompt Higgsfield
   controla sobretudo o visual.

## Fontes (URLs completas)

- https://www.screenweaver.ai/blog/writing-short-film-tiktok-youtube-shorts-reels — 3 atos em 60s, proporções por duração, setup-as-payoff
- https://superdirector.app/learn/beat-structure — beat (McKee), 5 fases, open loops estruturais, timing por duração
- https://www.lomero.app/blog/anatomy-of-viral-short-form-video — 5 beats (hook/contexto/problema/reveal/CTA) com timing
- https://www.lomero.app/blog/pattern-interrupts-in-short-form-video — curva de drop-off em 3 zonas, densidade de interrupts, heurística dos 4s
- https://independentfilmartsacademy.com/writing-scripts-for-the-tiktok-generation-short-form-storytelling-techniques/ — micro-arcos, linguagem vertical 9:16
- https://moviescript.xyz/how-to-write-vertical-microdramas-format-pacing-and-beats-fo — beats de 8-20s, formato VSL com timestamps
- https://www.real-reel.com/vertical-drama-script-guide-film-tv-creators/ — hook/friction/spike/button, "corte na pergunta"
- https://www.capcut.com/create/short-form-video-storytelling-60-second-arc — regra 3-7-21
- https://buffer.live/vertical-video-story-beats-structuring-microdramas-for-mobil — beat sheet microdrama, tipos de hook
- https://en.wikipedia.org/wiki/continuity_editing — continuity editing, establishing, eyeline, match on action, 30°
- https://en.wikipedia.org/wiki/180-degree_rule — regra dos 180°, reverse cut, formas de resetar a linha
- https://en.wikipedia.org/wiki/Camera_coverage — cobertura, master scene method, call-and-answer
- https://www.studiobinder.com/blog/film-coverage/ — tipos de cobertura, estratégia "V"
- https://www.studiobinder.com/blog/what-is-the-180-degree-rule-film/ — seguir/quebrar/dobrar a linha
- https://learnaboutfilm.com/film-language/sequence/ — sistema de continuidade prático, 30°
- https://www.toolsforfilm.com/glossary/coverage — glossário de cobertura (master, OTS, reaction, inserts)
- https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8885535/decoupage — definição canônica de découpage (GDT)
- https://hackettpublishing.com/french_cinema_support/filmterms_e.html — découpage e transições (glossário acadêmico)
- https://www.cinecreatis.net/en/glossary/technical-breakdown/ — découpage technique como documento do diretor
- https://www.studiobinder.com/blog/what-is-a-shooting-script-in-film/ — shooting script vs screenplay
- https://storyflow.so/blog/how-to-make-a-storyboard — o que um painel comunica, notação de setas
- https://storyflow.so/blog/what-is-a-storyboard-complete-guide — transition logic, teste de reordenação
- https://www.drawstory.ai/blog/film-production-storyboard-guide — 5 informações por painel
- https://story2board.com/how-to-storyboard/short-film — corte motivado, checklist de revisão
- https://www.soundstripe.com/blogs/storyboard-template — campos padrão do template
- https://pixflow.net/blog/how-to-storyboard/ — movimentos de câmera e character shots
- https://storylineforge.com/blog/from-script-to-screen-professional-storyboarding-techniques/ — anotações técnicas e símbolos
- https://retensis.com/blog/tiktok-retention-rate-benchmarks-2026 — drop nos 3s, mudança visual a cada 3-5s, loops/replays
- https://clip-forge.io/blog/short-form-video-analytics-5-metrics-predict-growth — portão dos 60% aos 3s, watch-through
- https://hub.creedom.ai/we-analysed-50-viral-videos-using-creedom-here-are-the-7-patterns-we-found — 50 virais: ASL 2,2s, interrupt a cada 8-12s
- https://nextjs-from-zero.vercel.app/articles/3971490 — 200 virais: ASL <2,5s, payoff a 65-75%, interrupt em 1,5s
- https://scrollscript.ai/blog/how-to-long-should-a-tiktok-reel-youtube-short-be — durações ideais por plataforma, retention reset aos 25-30s *(URL canônico: https://scrollscript.ai/blog/how-long-should-a-tiktok-reel-youtube-short-be)*
- https://virvid.ai/blog/shorts-retention-blueprint-ai-data-signals — mudança visual a cada 2-4s, sticky content 92%
- https://edicionvideopro.com/en/editing-for-platforms-video-marketing/pattern-interrupts-tiktok-retention-guide/ — A/B interrupts vs sem (dados internos, amostra 200 vídeos)
