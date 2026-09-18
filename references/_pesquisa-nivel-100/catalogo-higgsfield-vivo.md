# Catálogo vivo do Higgsfield (probe MCP) — matéria-prima da assessoria de modelo

> Capturado via tool MCP de exploracao de modelos do Higgsfield (list image + video) e `balance`.
> Fonte AUTORITATIVA de quais modelos existem hoje (o produto só conhecia
> `nano_banana_2` + `veo3_1_lite`). Custos NÃO vêm deste probe — confirmar via
> `higgsfield generate cost` / `custos.cjs` quando for precificar. **A confirmar = AC.**

## Estado da conta no momento do probe
- **Créditos: 0. Plano: free.** Nada pago roda hoje. A assessoria de modelo deve
  deixar isso explícito e mostrar o que cada upgrade/topup compraria.

---

## Modelos de IMAGEM (output_type=image)

| id | nome | provider | foco | resoluções | 9:16? | notas |
|---|---|---|---|---|---|---|
| `nano_banana` | Nano Banana | Google | budget realista | — | ✓ | barato |
| `nano_banana_2` | Nano Banana 2 | Google | rápido, alta qualidade, photoreal, img2img | 1k/2k/4k | ✓ | **modelo atual do produto** |
| `nano_banana_pro` | Nano Banana Pro | Google | **qualidade máxima**, text-rendering, diagramas | 1k/2k/4k | ✓ | tier acima do nano_banana_2 |
| `nano_banana_2_shots` | Nano Banana Pro (shots) | — | refs múltiplas (image_references) | auto+todos | ✓ | variante com referências |
| `soul_2` / `soul_v2` | Higgsfield Soul 2.0 | Higgsfield | **UGC realista, fashion editorial, geração de personagem** | 1.5k/2k | ✓ | `soul_id` → personagem personalizado/consistente |
| `soul_cinematic` | **Soul Cinema** | Higgsfield | **stills cinema-grade, concept art, lighting dramático** | 1.5k/2k | ✓ | `soul_id` cinematográfico |
| `soul_cast` | Soul Cast | Higgsfield | **identidade de personagem cinematográfica consistente** | 16:9 | ✗(só 16:9) | budget 10-500; persona |
| `soul_location` | Soul Location | Higgsfield | ambiente/locação/cenário | vários | ✓ | backgrounds |
| `cinematic_studio_2_5` | **Cinema Studio Image 2.5** | Higgsfield | **stills cinematográficos até 4k** | 1k/2k/4k | ✓ | dramatic, film |
| `seedream_v4_5` | Seedream 4.5 | Bytedance | 4k, controle preciso, transformações | basic/high | ✓ | editing |
| `seedream_v5_lite` | Seedream 5.0 lite | Bytedance | reasoning visual, edição por instrução | basic/high | ✓ | smart edit |
| `flux_2` | FLUX.2 (pro/flex/max) | BFL | aderência precisa ao prompt | 1k/2k | ✓ | variantes pro/flex/max |
| `flux_kontext` | FLUX context max | BFL | edição context-aware, style transfer, tipografia | — | ✓ | remix |
| `kling_omni_image` | Kling O1 Image | Kling | photoreal versátil | 1k/2k | ✓ | wide aspect |
| `gpt_image` / `gpt_image_2` | GPT Image 1.5 / 2 | OpenAI | **melhor text-rendering**, tipografia, logos | 1k/2k/4k | ✓ (v2) | infográfico, edição |
| `grok_image` | Grok Imagine | xAI | expressivo, alto contraste | std/quality | ✓ | bold/criativo |
| `recraft-v4-1` | Recraft 4.1 | Recraft | logos, ícones, vetor, product/mockup, paleta hex | 1k/2k | ✓ | brand assets, `colors[]` hex |
| `marketing_studio_image` | Marketing Studio Image | Higgsfield | **ad de produto one-click p/ social** | 1k/2k/4k | ✓ | marketing |
| `ms_image` | **DTC Ads** | Higgsfield | **ad image brand-kit-aware**, avatares, produtos | 1k/2k/4k | ✓ | exige `style_id` (via show_marketing_studio) |
| `z_image` | Z Image | Tongyi-MAI | super rápido, estilizado | — | ✓ | budget |
| `image_auto` | Auto | Higgsfield | auto-seleciona modelo por intenção | — | ✓ | roteamento |
| `autosprite` | AutoSprite | Higgsfield | sprite sheet de jogo | — | — | game |

**Ferramentas de pós/edição de imagem:** `color_grading_lut` (**grading real via LUT!**),
`outpaint` (expandir/uncrop), `image_background_remover`, `topaz_image` /
`topaz_image_generative` (upscale + face enhancement), `bytedance_image_upscale` (2k/4k).

## Modelos de VÍDEO (output_type=video)

| id | nome | provider | foco | durações | 9:16? | áudio | notas |
|---|---|---|---|---|---|---|---|
| `veo3_1_lite` | Veo 3.1 Lite | Google | rápido/budget, batch | 4/6/8 | ✓ | opt (custa+) | **modelo atual do produto**; 1080p exige dur=8 |
| `veo3` | Google Veo 3 | Google | cinematográfico confiável | — | ✓ | sim | preview/fast |
| `veo3_1` | **Google Veo 3.1** | Google | **ultra-realista, top-tier cinematográfico** | 4/6/8 | ✓ | sim | quality basic/high/ultra |
| `kling2_6` | Kling 2.6 | Kling | motion cinematográfico, física | 5/10 | ✓ | sim | start_image |
| `kling3_0` | **Kling 3.0** | Kling | **multi-shot, motion transfer, audio sync** | 3-15 | ✓ | on/off | std/pro/4k |
| `kling3_0_turbo` | Kling 3.0 Turbo | Kling | t2v/i2v rápido | 3-15 | ✓ | — | budget |
| `seedance_2_0` | **Seedance 2.0** | Bytedance | **reference-driven, identidade consistente, multi-SKU** | 4-15 | ✓ | sim | genre hint, 4k, start/end frame |
| `seedance_2_0_mini` | Seedance 2.0 Mini | Bytedance | budget rápido | 4-15 | ✓ | sim | 480/720p |
| `seedance1_5` | Seedance 1.5 Pro | Bytedance | motion confiável | 4/8/12 | ✓ | sim | — |
| `minimax_hailuo` | Minimax Hailuo | Hailuo | **física natural, emoção facial** | 6/10 | — | — | start/end frame |
| `wan2_7` | Wan 2.7 | Wan | áudio sincronizado, personagem consistente | 2-15 | ✓ | sim | — |
| `wan2_6` | Wan 2.6 Video | Wan | estilizado/experimental, open-weight | 5/10/15 | ✓ | refs | artístico |
| `grok_video` | Grok Imagine | xAI | t2v/i2v, áudio | 1-15 | ✓ | sim | — |
| `grok_video_v15` | Grok Imagine 1.5 | xAI | i2v cinematográfico, áudio nativo | 2-15 | — | sim | preview, camera-motion |
| `cinematic_studio_3_0` | **Cinema Studio Video 3.0** | Higgsfield | **modelo cinema-grade mais avançado (SOTA)** | 4-15 | ✓ | opt | best-quality |
| `cinematic_studio_video` | Cinema Studio Video | Higgsfield | cinematográfico, composições dramáticas | 5/10 | ✓ | sim | slow-motion |
| `cinematic_studio_video_v2` | Cinema Studio Video (v2) | Higgsfield | **câmera e cor refinadas, controle de gênero** | 3-12 | ✓ | on/off | genre: action/horror/comedy/western/suspense/intimate/spectacle |
| `marketing_studio_video` | Marketing Studio | Higgsfield | **ad de produto one-click, TikTok/Reels** | 12-15 | ✓ | sim | hooks/settings/ad_reference |
| `clipify` | Personal Clipper | Higgsfield | YouTube → clips com legenda | — | — | — | utilitário |
| `higgsfield_preset` | Higgsfield Preset | Higgsfield | i2v roteado por preset (viral/template) | — | ✓ | — | usa `presets_show` |

**Ferramentas de pós de vídeo:** `topaz_video` (upscale 1080p/2160p + frame interp),
`bytedance_video_upscale` (até 4k, presets aigc/ugc/old_film), `video_upscale`,
`video_deflicker`, `sam_3_video` (remove bg), `video_background_remover`.

---

## Implicações pro plano (a destilar com a pesquisa)

1. **O teto NÃO é capado pelo nano_banana+veo_lite.** Existem modelos cinema-grade
   dedicados (`soul_cinematic`, `cinematic_studio_2_5`, `cinematic_studio_3_0`,
   `veo3_1`) e de consistência de personagem (`soul_2`, `soul_cast`, `seedance_2_0`).
   O nível 100 provavelmente os exige — decisão de crédito do projeto, em runtime.
2. **A assessoria de modelo (Wave E) fica muito mais rica** que "free vs pago": é
   roteamento por intenção (personagem? cinema? produto/ad? rápido/batch?) × custo ×
   plano. A matriz acima é a espinha; cruzar com a pesquisa de qualidade (web) e custos.
3. **Grading real existe** (`color_grading_lut`, `cinematic_studio_video_v2` com cor
   refinada) — o "passe de cor plan-level" pode virar passe real se houver crédito disponível.
   Rever a pendência "grading real" do plano.
4. **Consistência de personagem como serviço** (`soul_cast`/`soul_id`) pode substituir
   o esquema unha-e-anchor em modo geração — repensar quando houver crédito.
5. **Áudio nativo** disponível em vários modelos de vídeo (hoje o pipeline trata clipes
   como mudos). Abre frente futura de som (fora do escopo atual).
6. **Modelos de ad dedicados** (`ms_image` DTC Ads, `marketing_studio_video`) podem
   curto-circuitar parte do pipeline pra certos casos — avaliar como alternativa/atalho.

**Custos:** todos AC via `higgsfield generate cost` / `custos.cjs` antes de qualquer
tabela de assessoria fechar número.

## Wave E operacional

A tabela de modelos/opcoes virou contrato executavel em `scripts/lib/model-advisor.cjs`.
Ele usa este catalogo vivo + `references/_pesquisa-nivel-100/modelos-comparativo.md` para mostrar
tradeoffs antes do preflight: modelo default do CLI, alternativas de teto, plano provavel e custo
AC. Atualize o script quando este catalogo for re-probado.
