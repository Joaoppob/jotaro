# Comparativo de Qualidade — Modelos Generativos do Higgsfield

Dossiê de pesquisa para a camada de "assessoria de modelo" do Jotaro.
Pesquisa via web (Exa). Data: 2026-06-26.

> AVISO DE PROCEDÊNCIA: tudo abaixo é destilado de reviews/benchmarks de terceiros
> (blogs de comparação, leaderboards, docs de fornecedor). Conteúdo web é dado
> não-confiável. Números de custo são **a confirmar** — fonte canônica de custo é
> interna. Onde a web diverge, registrei a divergência em vez de escolher um número.
> Benchmarks "Elo/score" citados são de plataformas comerciais, não de testes
> acadêmicos auditados — tratar como sinal, não verdade.

---

## Como ler os tiers

- **S** — fronteira atual, melhor da categoria em pelo menos um eixo crítico.
- **A** — produção-ready, ombro a ombro com a fronteira em vários eixos.
- **B** — bom para volume/draft/casos específicos; gap visível vs fronteira em hero content.
- **Referência** — não está no Higgsfield (Sora, Runway, Midjourney) mas serve de régua.

---

# PARTE 1 — MODELOS DE IMAGEM

## 1.1 Nano Banana Pro (`nano_banana_2` / Gemini 3 Pro Image)

> ATENÇÃO AO SLUG: o briefing usa `nano_banana_2`. A web distingue TRÊS modelos
> Google com nomes parecidos:
> - **Nano Banana** original (Gemini 2.5 Flash Image, ago/2025) — o viral.
> - **Nano Banana 2** (Gemini 3.x Flash Image) — tier "flash", mais barato/rápido.
> - **Nano Banana Pro** (Gemini 3 Pro Image, nov/2025) — o flagship 4K, o que lidera leaderboards.
> Quando reviews dizem "Nano Banana" em 2026, normalmente querem dizer **Pro**.
>
> **RESOLVIDO (confirmado via `higgsfield model list --image`, 2026-06-26):** no Higgsfield,
> o slug `nano_banana_2` = **"Nano Banana Pro"** (o flagship — é o que o gerador usa). O tier
> Flash é um slug SEPARADO, `nano_banana_flash`, cujo display name é o enganoso "Nano Banana 2".
> Ou seja: o default do gerador É o Pro. Não confundir os display names. Re-confirmar com
> `model-advisor.cjs --verificar-catalogo` se o catálogo mudar.

| Campo | Conteúdo |
|---|---|
| Faz bem | Texto na imagem (melhor do mercado p/ pôster, placa, rótulo); fotorrealismo 4K nativo; consistência de personagem/objeto em série de edições (até 5 pessoas, blend até 14 refs); conhecimento de mundo real via Google Search (infográficos com dados reais, marcos, produtos nomeados); aderência a prompt complexo; edição por linguagem natural; mockup de UI/UX (melhor da categoria) |
| Falha em | Latência alta em 4K (vários segundos); custo mais alto do shortlist; pode errar rostos pequenos, ortografia em detalhe fino e dados de infográfico (verificar sempre); edição mascarada / mudança grande de luz (dia→noite) / blend de muitas imagens pode dar artefato |
| Tier | **S** (líder de imagem como all-rounder, abr/2026) |
| Melhor para | Hero creative com texto; pôster/anúncio com tipografia; mockup de produto; infográfico com dado real; edição precisa; localização/tradução de texto dentro da imagem |
| Custo/velocidade (a confirmar) | Web: ~US$0,13–0,24/imagem em 4K via API; ~10x mais lento que Flux.2; "100 tokens" vs 30 do Flux em uma plataforma. **A confirmar internamente** |

**Parecer.** É o teto de qualidade para imagem em 2026 e o default racional para qualquer
asset onde texto, realismo ou conhecimento de mundo importam. Para um gerador de ADS, é o
modelo do "hero shot" e de qualquer peça com copy embutida (pôster, packshot com rótulo,
mockup). O preço por imagem e a latência o tornam caro para gerar centenas de variações —
nesse cenário, usar um modelo B para o rascunho e subir para Nano Banana Pro só na peça final.
O risco real é confiar cegamente em infográfico/dado gerado: a própria Google avisa que pode
estar factualmente errado.

## 1.2 Flux / Flux.2 (`flux` — referência comparativa)

| Campo | Conteúdo |
|---|---|
| Faz bem | Velocidade (até ~10x mais rápido que Nano Banana Pro); texto legível confiável (Flux Dev é forte aqui, e Flux.2 [Pro] trata texto como objetivo de primeira classe, aceita JSON de cena e códigos de cor exatos); UI/dashboard/layout exato como especificado; open weights (self-host, fine-tune); custo baixo; múltiplas variantes (Schnell p/ draft, Dev p/ qualidade) |
| Falha em | Perde feio para Nano Banana Pro em qualidade geral, conhecimento de mundo e text rendering em teste direto; estética pode parecer "AI-genérica" sem referência; em strings longas não-inglês pode dar glitch |
| Tier | **A** (imagem) — fronteira aberta, mas atrás do Nano Banana Pro |
| Melhor para | Geração em volume; draft rápido de muitas variações; layout/UI especificado por JSON; pipelines que precisam de open weight |
| Custo/velocidade (a confirmar) | Web: muito mais rápido e mais barato que Nano Banana Pro ("30 tokens vs 100" em uma plataforma); resolução nativa ~4MP (~2048²). **A confirmar** |

**Parecer.** O cavalo de carga de volume e velocidade. Num gerador de ADS asset-first, é o
candidato natural para a fase de divergência (gerar muitas variações baratas e rápidas) antes
de subir a vencedora para um modelo S. Open weights é irrelevante para o usuário final do
produto, mas relevante para a economia de custo do backend. Não é o modelo do hero shot quando
a peça precisa brilhar em realismo ou texto denso.

## 1.3 Midjourney (`midjourney` — referência comparativa)

| Campo | Conteúdo |
|---|---|
| Faz bem | Estética/estilo distintivo e customizável (preferido por criativos profissionais p/ look autoral); imagens "painterly", concept art, ilustração |
| Falha em | Texto na imagem ainda não-confiável (palavras longas, fontes apertadas, infográfico viram gibberish); fraco em reproduzir imagem de referência (em um teste divergiu totalmente de objetos enviados); resolução nativa ~2K (precisa upscale p/ 4K) |
| Tier | **A** em estilo / **C** em texto e fidelidade-a-referência |
| Melhor para | Concept art, mood, ilustração estilizada, look de campanha autoral onde texto é decorativo |
| Custo/velocidade (a confirmar) | Web não destacou números limpos. **A confirmar** |

**Parecer.** Especialista em estética, não em precisão. Para ADS, serve para gerar o
"clima"/direção de arte, não a peça final com produto e copy. Se o anúncio depende de rótulo
legível, mockup fiel ou packshot do produto real, Midjourney é a escolha errada. Vale como
modelo de exploração de estilo, não de produção.

## 1.4 Seedream 4.5 (`seedream` — referência comparativa)

| Campo | Conteúdo |
|---|---|
| Faz bem | 4K nativo; visual cinematográfico (melhor grain, color grading, "mais real/mais cinematográfico"); fidelidade de rosto em retrato a baixo custo; consistência multi-imagem / geração em batch coordenada (campanhas com várias peças); aceita até ~12–14 refs; texto melhorou (~94% em tipografia, por claim do fornecedor); controle visual nativo (Canny, Depth, Mask) |
| Falha em | Não chega ao nível do Nano Banana Pro em detalhe fino, realismo de marco/objeto nomeado e consistência estrita de personagem; estética "plasticky" / beautification agressiva (boa p/ comercial, ruim p/ orgânico); infográfico/dado denso ainda erra; texto curvo falha (~59% dos casos); pode lento em 4K (>100s em alguns hosts); alucina detalhes de lugares reais |
| Tier | **A** (imagem) — top tier, ~#7–10 em leaderboards de comunidade |
| Melhor para | Lote de retratos / fashion / produto multi-ângulo; campanha multi-asset coordenada; beleza, produto, lifestyle cinematográfico a baixo custo |
| Custo/velocidade (a confirmar) | Web: ~US$0,02–0,04/imagem (flat, independe da resolução); ~3–6x mais barato que Nano Banana Pro; ~45s p/ 4K em alguns hosts. **A confirmar** |

**Parecer.** O melhor custo-benefício para volume de imagem comercial bonita: retrato, fashion,
produto, lifestyle, com look cinematográfico de fábrica e preço baixo. Para um gerador de ADS,
é forte candidato a "modelo de campanha" — gerar um conjunto coeso de peças com o mesmo
personagem/estilo. O preço fixo por imagem independente da resolução é uma vantagem econômica
real. Onde tropeça: realismo de marco/produto nomeado e a estética plástica, que pode trair
"isso é IA" em públicos exigentes. Não substitui Nano Banana Pro na peça que precisa de
precisão absoluta.

## 1.5 Ideogram 4.0 (`ideogram` — referência comparativa)

| Campo | Conteúdo |
|---|---|
| Faz bem | Texto/tipografia disciplinada (pôster, logo, signage, packaging limpos e corretos); melhor em legendas densas de infográfico que o próprio Nano Banana Pro em alguns testes; multilíngue; open weight (self-host, fine-tune); workflow de batch (até 3.000 prompts) e custo mais baixo entre os que fazem texto confiável |
| Falha em | Perdeu o "moat" de melhor text renderer — empatou/perdeu para Nano Banana Pro em 4 de 5 rounds e nunca o venceu sozinho; resolução nativa 2K (vs 4K do NBP) limita print grande; estética menos distintiva que Midjourney/Seedream (pode ficar "AI-genérica" sem referência) |
| Tier | **A** (imagem, especialista em texto) |
| Melhor para | Pôster/logo/signage/packaging com texto correto a custo menor; volume de peças tipográficas; quando se precisa de open weight |
| Custo/velocidade (a confirmar) | Web: "o mais barato que faz texto de forma confiável". **A confirmar** |

**Parecer.** Era o rei do texto; em 2026 o Nano Banana Pro alcançou. Hoje seu diferencial é
custo + open weight + workflow de batch para peças tipográficas em volume. Para ADS com muita
copy embutida e orçamento apertado, é a alternativa econômica ao Nano Banana Pro — entrega
texto correto, só não tem a riqueza de cena nem o 4K. Bom segundo-lugar de texto, não primeira
escolha para hero creative.

---

# PARTE 2 — MODELOS DE VÍDEO

> Eixos avaliados: realismo de movimento, controle de câmera, consistência temporal,
> duração máxima, áudio nativo. Onde leaderboards divergem (e divergem muito entre
> Kling, Veo, Seedance, Sora), registro a divergência.

## 2.1 Veo 3.1 (`Veo 3.1` Standard, Google DeepMind)

| Campo | Conteúdo |
|---|---|
| Faz bem | Áudio nativo sincronizado de melhor qualidade do mercado (diálogo + lip-sync ~10ms, ambiente, SFX em uma passada, 48kHz); melhor aderência a prompt ("fez o que pediu"); iluminação/textura/look cinematográfico (cor, sombra, continuidade de cena); física forte; melhor em cena ampla, atmosfera, clima, paisagem, arquitetura; first/last-frame control, "ingredients to video", video extension; 4K em preview |
| Falha em | "AI look" persistente (apontado como o mais artificial entre os 4 grandes em uma fonte); consistência amolece em close-up de rosto humano (vs Kling); clipe curto (4/6/8s, o mais curto do grupo); aspect ratios limitados (16:9 e 9:16); custo alto / credit-intensive (~40–70 créditos por vídeo no Higgsfield); diálogo falado curto ainda "em desenvolvimento" pela própria Google |
| Tier | **S** (vídeo) — fronteira em áudio e cinematografia |
| Melhor para | Hero shot cinematográfico de marca; cena ampla/exterior/atmosférica; qualquer peça onde áudio nativo (diálogo, ambiente) é parte do conceito; spot onde o diretor assina cada frame |
| Movimento/câmera/temporal/duração/áudio | Movimento: cinematográfico, suave, menos "urgente" que Kling/Sora. Câmera: pull-back/pan suaves. Temporal: forte continuidade de cena (mas uma fonte aponta como ponto fraco relativo). Duração: 4–8s. Áudio: **melhor da categoria** |
| Custo/velocidade (a confirmar) | Web diverge muito: ~US$0,35–0,40/s (algumas fontes até US$0,60–0,75/s em 4K com áudio); ~2min41s por geração. Higgsfield: ~40–70 créditos/vídeo. **A confirmar** |

**Parecer.** O modelo do hero shot e de tudo que tem áudio embutido. Para um anúncio, é a
escolha quando o frame precisa parecer filmagem real e quando som/diálogo nativo é parte do
conceito — nenhum concorrente entrega áudio sincronizado nesse nível em uma passada. As
fraquezas são caras: clipe curto (8s), custo alto e amolecimento em close de rosto humano, o
que o torna ruim para spokesperson/UGC falante (aí Kling/Seedance ganham). Estratégia: render
uma vez, rejeitar sem dó, não otimizar por custo.

## 2.2 Veo 3.1 Lite (`veo3_1_lite`, Google DeepMind)

| Campo | Conteúdo |
|---|---|
| Faz bem | Mesma família Veo a fração do custo; áudio nativo presente em TODA geração (não é tradeoff do Lite); rápido (35% mais rápido que o Fast em um teste, ~30–45s); qualidade boa em cena controlada/baixo movimento (produto girando, pessoa em janela, tinta na água); first/last-frame, negative prompt |
| Falha em | Gap de qualidade DRAMÁTICO em movimento complexo, profundidade espacial e física (ex.: barista derramando latte art, falcão mergulhando — uma fonte: "nunca aconteceu"); teto 1080p (sem 4K); áudio levemente mais pobre que o Fast (ambiente menos rico) |
| Tier | **B** (vídeo) — o "draft/volume" da família Veo |
| Melhor para | Alto volume de clipe social (TikTok/Reels/Shorts); produto estático, fundo abstrato, cena de diálogo de câmera parada; protótipo e e-commerce onde custo > perfeição cinematográfica |
| Movimento/câmera/temporal/duração/áudio | Movimento: ok em cena simples, quebra em física complexa. Câmera: melhor estática. Temporal: ok em baixo movimento. Duração: 4/6/8s. Áudio: presente, funcional, levemente inferior ao Fast |
| Custo/velocidade (a confirmar) | Web: ~US$0,05/s em 720p (até 7–8x mais barato que o Standard); ~US$0,08/s em 1080p; sem 4K. **A confirmar** — fontes divergem (uma cita "US$0,03/s"; o Higgsfield cobra por crédito) |

**Parecer.** É o Veo de volume: barato, rápido, com áudio, ótimo para gerar muitos clipes de
cena simples e câmera quase parada (packshot girando, produto em mesa, fundo). A armadilha é
pedir movimento ou física — aí o gap para o Veo Standard é grande e o resultado denuncia o
custo cortado. Para um gerador de ADS, é o modelo certo da fase de teste de hooks e de
e-commerce em massa; errado para o hero shot. Score web informal: ~8,7/10 vs 9,4/10 do Full.

## 2.3 Kling 3.0 (`kling3_0`, Kuaishou)

| Campo | Conteúdo |
|---|---|
| Faz bem | Melhor custo-qualidade para social/volume (default de vídeo no MCP do Higgsfield por isso); 4K nativo (único do grupo); movimento humano natural e expressão facial; consistência de personagem forte (até 4 imagens de ref, voice binding); textura/reflexo/névoa atmosférica (em uma fonte, melhor do grupo); câmera cinematográfica controlada (pan/tracking/reveal); multi-shot storyboard até 6 cuts; clipe longo (até ~2–3min em variantes); macro/produto; #1 no leaderboard Artificial Analysis (1.249 Elo) em uma fonte |
| Falha em | Suporte ao cliente / confiabilidade ruins (Trustpilot 1.5/5, "bug do 99%" — render falha em 99% e queima crédito); color grading desloca entre cuts; pode falhar em prompt difícil; lip-sync/voice cloning fraco; "parece bom, mas não parece Veo 3.1" (teto cinematográfico abaixo do Veo/Sora); pode tropeçar em cena multi-sujeito complexa |
| Tier | **A** (vídeo) — workhorse; topo de leaderboard em uma fonte, mas teto cinematográfico abaixo do Veo |
| Melhor para | Volume de hooks TikTok/Reels (20–60 variações p/ teste criativo); conteúdo com pessoas/personagem; fashion, social; macro/produto; quando precisa de 4K barato ou clipe longo |
| Movimento/câmera/temporal/duração/áudio | Movimento: humano natural, "urgente". Câmera: cinematográfica controlada (forte). Temporal: estável (com deriva de cor entre cuts). Duração: 3–15s (até ~2–3min em variantes). Áudio: nativo, mas pode ser abafado; lip-sync fraco |
| Custo/velocidade (a confirmar) | Web diverge MUITO: de "~6 créditos/vídeo" e "~US$0,03/s" (mais barato) a "US$0,13–0,40/s"; plano a partir de US$6,99/mo; free tier generoso. **A confirmar** |

**Parecer.** O cavalo de carga do teste de criativo. A relação crédito-qualidade é imbatível
para as 20–60 variações de hook que decidem qual será o hero — por isso é o modelo de vídeo
default no Higgsfield MCP. Tem 4K, clipe longo, movimento humano natural e consistência de
personagem (com Soul ID, ainda mais). O teto cinematográfico fica abaixo do Veo/Sora para a
peça final, o lip-sync é fraco para spokesperson, e há ruído real de confiabilidade
(bug do 99%, deriva de cor). Fluxo ideal: Kling para divergir e achar o vencedor, Veo/Sora
para o hero.

## 2.4 Seedance 2.0 (`seedance_2_0`, ByteDance)

| Campo | Conteúdo |
|---|---|
| Faz bem | Melhor aderência a prompt comercial e consistência (o próprio Higgsfield chama de melhor modelo p/ conteúdo comercial/ads); controle multi-modal — aceita até 9–12 inputs de referência (imagem/vídeo/áudio juntos), planeja imagem + som juntos; áudio nativo + lip-sync nível fonema em 8+ idiomas; multi-shot/UGC; consistência de personagem excelente (9,5/10 em uma fonte); melhor controle de câmera (9,5/10 em uma fonte); física forte; turnaround rápido / bom custo |
| Falha em | Pouco experimental visualmente ("peça uma catedral de neon derretendo e você ganha uma catedral de neon derretendo literal e competente, raramente surpreende"); crise de copyright (ação legal de Hollywood/Disney citada); filas longas em pico; sem upload de rosto humano realista (compliance chinês) em uma fonte; texto na imagem mais fraco (artefato em serifa) |
| Tier | **S/A** (vídeo) — líder em controle e consistência comercial |
| Melhor para | ADS comercial on-brief; UGC multilíngue com personagem falante; campanha que precisa bater exatamente o brief (câmera, ação, composição); conteúdo com áudio/lip-sync sincronizado |
| Movimento/câmera/temporal/duração/áudio | Movimento: realista, física forte. Câmera: **melhor controle do grupo**. Temporal: consistência de personagem excelente. Duração: ~12–15s. Áudio: nativo, lip-sync fonema em 8+ idiomas (líder em lip-sync junto com Wan/Kling, dependendo da fonte) |
| Custo/velocidade (a confirmar) | Web diverge: ~US$0,10–0,25/s a US$0,70–0,75/s; Higgsfield: ~90 créditos/15s 720p; **full só no plano Plus (US$39/mo); Starter recebe Seedance 2.0 Fast**; moderação estrita + verificação de e-mail comercial regional. **A confirmar** |

**Parecer.** O modelo do "controle absoluto" para anúncio comercial. Se você sabe exatamente o
que quer — movimento de câmera, ação do personagem, composição, áudio sincronizado, peça
multilíngue com falante — Seedance entrega o brief com a maior fidelidade do grupo, e aceita
mais referências que qualquer concorrente. É o "sonho do diretor criativo". O preço dessa
disciplina é pouca surpresa visual (para conceito experimental, Kling ganha) e fricção
operacional real no Higgsfield: full atrás de paywall (Plus), moderação estrita e verificação
de e-mail comercial. Forte candidato a default de ADS quando o brief é fechado.

## 2.5 Wan 2.6 (`wan2_6`, Alibaba)

> NOTA: o blog oficial do Higgsfield já cita **WAN 2.7** no lineup (jun/2026).
> Confirmar internamente se o slug `wan2_6` aponta para 2.6 ou já para 2.7.

| Campo | Conteúdo |
|---|---|
| Faz bem | Melhor custo do mercado em 1080p (3–5x mais barato que Veo/Kling); multi-shot storytelling nativo (auto-edit wide→medium→close-up, "tool de diretor"); consistência de personagem via referência (R2V, preserva aparência/voz/movimento entre cenas); áudio nativo em uma passada (SFX, ambiente, lip-sync, multi-speaker, voice cloning p/ voz de marca); rápido (~20s/geração, o mais rápido em uma fonte); restyle/"reshoot" de footage existente (transferência de estilo por vídeo-ref); **open weights** (self-host em RTX 4090+, fine-tune); duração ~15–30s |
| Falha em | Qualidade visivelmente abaixo do Veo p/ hero brand content (68/100 vs 92 do Veo em uma fonte; 4,41/5 vs 4,70 do Seedance); consistência de personagem fraca em 20s+; física apenas "fair"; áudio com distorção "treble-heavy" / lip-sync fraco em benchmark (4,0/10 em um teste vs 8,2 do Kling); **sem benchmarks independentes** (quase todo claim vem de hosts, não de teste auditado); precisa de clipe de referência p/ melhor resultado |
| Tier | **B** (vídeo) — melhor valor; gap claro vs fronteira em hero content |
| Melhor para | Social/draft/thumbnail em volume; restyle/reshoot de footage; narrativa multi-shot barata; e-learning/ads com personagem estável; quem precisa de open weight / soberania de dados |
| Movimento/câmera/temporal/duração/áudio | Movimento: aceitável (não Veo/Kling). Câmera: ok. Temporal: fraco em 20s+. Duração: 15–30s (das maiores). Áudio: nativo mas com distorção/lip-sync fraco apontados |
| Custo/velocidade (a confirmar) | Web: ~US$0,15/s em 1080p ou ~US$1,00/vídeo (host); self-host grátis; plano a partir de ~US$5/mo; Higgsfield: "lower credit cost". **A confirmar** |

**Parecer.** O modelo da economia e do restyle. Para um gerador de ADS, Wan brilha em dois
lugares: (1) volume barato de 1080p com narrativa multi-shot, e (2) "reshoot" — pegar um clipe
de referência e re-estilizá-lo, o que o Higgsfield posiciona como caso de uso dele. A
contrapartida é honesta: qualidade visível abaixo do Veo para hero, consistência que cai em
clipe longo, áudio/lip-sync fracos em benchmark, e ausência de teste independente (cautela com
os claims de "rivaliza Veo"). Open weights importa para o backend, não para o usuário final.
Tier B sólido — o "barato que serve".

## 2.6 Grok Imagine Video (`grok_video`, xAI)

| Campo | Conteúdo |
|---|---|
| Faz bem | Preço competitivo (~US$0,05/s, ~25% do custo do Veo); geração rápida (~30s, sem cold start); controle granular de duração em incrementos de 1s (1–15s — útil p/ timing exato de Story/Reel); muitos aspect ratios (16:9, 9:16, 1:1, 4:3, 3:4, 3:2, 2:3, auto); áudio nativo sincronizado; edição de vídeo por linguagem natural; t2v e i2v na mesma interface; "casou" 6 de 8 categorias com o Veo em um teste atmosférico/cinematográfico |
| Falha em | Teto 720p (todos os grandes concorrentes fazem 1080p — gap visível); física complexa fraca (artefatos surreais, lógica de colisão; "erra quando o prompt exige entender física"); consistência de personagem não tão benchmarkada; "ilimitado" tem soft caps não-documentados (throttle após ~10–15 vídeos em 720p); edição limitada (input cap ~8,7s) |
| Tier | **B** (vídeo) — "value king" p/ social 720p; atrás em resolução e física |
| Melhor para | Social barato onde 720p basta; clipe de duração exata (timing preciso); iteração rápida de ideia; conteúdo atmosférico/cinematográfico narrativo onde duração+velocidade+áudio importam mais que pixel |
| Movimento/câmera/temporal/duração/áudio | Movimento: competitivo em cena padrão, fraco em física complexa. Câmera: ok. Temporal: menos benchmarkado. Duração: 1–15s (granular, das mais flexíveis). Áudio: nativo sincronizado (diferencial) |
| Custo/velocidade (a confirmar) | Web: ~US$0,05/s (linear); ~30s/geração; soft caps não documentados. **A confirmar** |

**Parecer.** O disruptor de preço/velocidade. Para ADS, sua jogada é volume barato de social
720p com áudio nativo e timing exato (gerar um clipe de exatos 7s para um Story). Casa com o
Veo em cenas atmosféricas a 1/4 do custo. O teto de 720p é a barreira dura — para hero ou
entrega premium, está fora. A física complexa também o trai (líquido, colisão). Bom modelo de
divergência/teste, não de peça final premium. Atenção aos soft caps não documentados se o
backend depender de throughput.

---

# PARTE 3 — REFERÊNCIAS EXTERNAS (não no Higgsfield, servem de régua)

## 3.1 Sora 2 / Sora 2 Pro (OpenAI) — referência

| Campo | Conteúdo |
|---|---|
| Faz bem | **Melhor física/simulação de mundo da categoria** (água, fogo, gravidade, colisão, momento, permanência de objeto); melhor coerência narrativa multi-shot (único que segura shot1→shot2→shot3 com continuidade de personagem); duração longa (20–25s); câmera/profundidade de campo |
| Falha em | Sem áudio nativo robusto (precisa gerar/sincronizar à parte); "dumbed down" vs demos (claim de downgrade); filtro de segurança agressivo; tier Pro caro (US$200/mo citado); crop fechado; cabelo/tecido às vezes artefatado |
| Tier | **S** (vídeo) — rei da física e da narrativa |
| Melhor para | Hero shot dirigido por física (pour de produto, drapeado de tecido, close de relógio onde o movimento vende o spec); curta com continuidade de personagem |

**Parecer (régua).** Quando o realismo de física é o produto, nada chega perto. Define o teto
de "movimento crível". Útil como referência de qualidade-alvo para o hero shot físico.

## 3.2 Runway Gen-4.5 (Runway) — referência

| Campo | Conteúdo |
|---|---|
| Faz bem | Controle criativo (motion brushes, style references, director mode); upscale 4K em pós; integração After Effects; #4 em um leaderboard (1.230 Elo) |
| Falha em | Sem áudio nativo; física/lip-sync medianos vs fronteira |
| Tier | **A** (vídeo) — padrão p/ trabalho criativo dirigido |
| Melhor para | Trabalho artístico/criativo com controle fino de direção |

**Parecer (régua).** O padrão de "controle de diretor". Régua para os recursos de controle
criativo que o produto pode querer expor.

## 3.3 MiniMax / Hailuo 2.3 (no Higgsfield, mencionado de passagem)

Curto/UGC rápido, estabilidade de cor/estilo, texto on-screen nítido, baixo custo, sintonizado
para velocidade > controle cinematográfico profundo. Tier B — alternativa de draft rápido.
**A confirmar se está no escopo do produto.**

---

# RANKING CONSOLIDADO (síntese para a tabela do produto)

### IMAGEM
| Tier | Modelo | Uma linha |
|---|---|---|
| S | Nano Banana Pro | Teto de qualidade; texto, realismo 4K, conhecimento de mundo. Caro/lento. |
| A | Seedream 4.5 | Cinematográfico, barato, multi-asset; estética plástica. |
| A | Flux / Flux.2 | Rápido, barato, open; volume e layout. Estética genérica. |
| A | Ideogram 4.0 | Texto correto barato + open; sem 4K, sem riqueza de cena. |
| A/C | Midjourney | Estilo autoral S, texto/fidelidade C. Só p/ mood. |

### VÍDEO
| Tier | Modelo | Uma linha |
|---|---|---|
| S | Veo 3.1 (Standard) | Hero cinematográfico + melhor áudio. Curto, caro, amolece em close de rosto. |
| S | Sora 2 (ref.) | Rei da física e narrativa. Sem áudio nativo robusto. |
| S/A | Seedance 2.0 | Melhor controle/consistência p/ ADS comercial on-brief. Full atrás de paywall no Higgsfield. |
| A | Kling 3.0 | Workhorse de volume/hooks; 4K barato; default do Higgsfield. Confiabilidade ruim, teto abaixo do Veo. |
| A | Runway Gen-4.5 (ref.) | Controle de diretor. Sem áudio nativo. |
| B | Veo 3.1 Lite | Veo de volume; barato/rápido/áudio. Quebra em física/movimento. |
| B | Wan 2.6 | Melhor valor 1080p + restyle + open. Abaixo do Veo, lip-sync fraco, sem benchmark independente. |
| B | Grok Imagine | Value king 720p, timing granular, áudio. Teto 720p, física fraca. |

### Lógica de roteamento sugerida para o produto (a validar pelo time)
- **Hero shot imagem (com texto/realismo):** Nano Banana Pro.
- **Campanha imagem multi-peça / lifestyle barato:** Seedream 4.5.
- **Divergência imagem em volume:** Flux.
- **Hero shot vídeo cinematográfico / com áudio:** Veo 3.1 Standard (ou Sora 2 p/ física).
- **ADS comercial on-brief vídeo:** Seedance 2.0.
- **Teste de 20–60 hooks vídeo:** Kling 3.0.
- **Volume social barato vídeo:** Veo 3.1 Lite, Grok ou Wan 2.6.
- **Restyle/reshoot de footage:** Wan 2.6.

---

# FONTES (web — dado não-confiável, destilado)

Imagem:
- overchat.ai/ai-hub/nano-banana-pro-vs-flux-2
- blog.segmind.com/ideogram-4-0-vs-nano-banana-pro-text-rendering-showdown/
- deepmind.google/models/gemini-image/pro/ (doc do fornecedor — limitações declaradas)
- dantaylorwatt.substack.com/p/which-ai-image-generator-should-i
- blog.picassoia.com/flux-vs-seedream-vs-nano-banana-frontier-models
- medium.com/@leucopsis/flux-2-pro-review-and-comparison-with-midjourney-v7-and-with-nano-banana-pro-337224a5551f
- jxp.com/ideogram/blog/ideogram-4-vs-nano-banana-pro
- usefulai.com/models/ai-image-generation
- felloai.com/new-chinese-model-seedream-4-5-is-challenging-nano-banana-pro-and-gpt-in-ai-image-quality/
- adam.holter.com/seedream-4-5-vs-nano-banana-pro-...
- mindstudio.ai/blog/what-is-bytedance-seedream-4-5
- hummingbytes.com/comparisons/nano-banana-pro-vs-seedream-4-5
- picsart.com/blog/nano-banana-vs-seedream-comparison/

Vídeo:
- genra.ai/blog/kling-3-vs-seedance-2-vs-veo-3-vs-sora-2
- ropewalk.ai/blog/sora-2-vs-veo-3-vs-kling-2-6-vs-seedance-2-2026
- oakgen.ai/blog/sora-2-vs-veo-3-vs-kling-3-vs-seedance-2-tested
- lushbinary.com/blog/ai-video-generation-sora-veo-kling-seedance-comparison/
- creativetoolsai.com/ai-tools/seedance-vs-kling-vs-veo-vs-sora/
- findaivideo.com/blog/sora-2-vs-runway-gen4-vs-veo-3-vs-kling-comparison
- creatok.ai/blog/seedance-2-0-vs-kling-3-0-vs-sora-2-vs-veo-3-1-comparison/
- gensoai.io/blog/ai-video-generators-compared-2026
- mindstudio.ai/blog/veo-3-1-vs-veo-3-1-fast-vs-veo-3-1-light-comparison
- theplanettools.ai/blog/veo-3-1-lite-vs-fast-vs-full-comparison-2026
- mindstudio.ai/blog/veo-3-1-vs-fast-vs-light-comparison
- help.artlist.io/.../Veo-3-1-Variants
- picsart.com/blog/veo-models-comparison/
- ainewshome.com/article/veo-3-1-lite-vs-fast-benchmark-...
- apidog.com/blog/grok-imagine-video-vs-sora-2-veo-3-seedance-wan-vidu-comparison-2026/
- wavespeed.ai/blog/posts/grok-imagine-video-vs-...
- vidguru.ai/blog/veo-3-1-vs-grok-imagine-video-comparison.html
- aiwithoutlimits.com/grok-imagine-review/
- techloy.com/grok-imagine-video-vs-veo-3-1-...
- tokenmix.ai/blog/wan-2-6-text-to-video-review-2026
- vibedex.ai/blog/wan-26-review-2026
- amrytt.com/wan-review/
- mindstudio.ai/blog/what-is-wan-2-6-video-open-source
- vidzoo.ai/blog/wan-2-6-review-multi-shot-ai-video-generation
- apimart.ai/blog/wan-2-6-vs-kling-chinese-ai-video-model-comparison

Perspectiva Higgsfield (fornecedor — viés comercial):
- higgsfield.ai/blog/best-ai-video-generators-2026
- higgsfield.ai/blog/5-Best-AI-Video-Models-2026-Tested-Compared
- higgsfield.ai/blog/Kling-3.0-is-on-Higgsfield-User-Guide-AI-Video-Generation
- claudefa.st/blog/tools/mcp-extensions/higgsfield-vs-sora-vs-veo
- similarlabs.com/blog/kling-vs-seedance-vs-veo-3-vs-higgsfield
