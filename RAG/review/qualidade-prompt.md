# Checklist de qualidade de prompt

Use antes de produzir (chamar `generate_*` via MCP). No 0.7 os gates leem o **prompt-forge**
(`<PROJ>/output/prompt-forge.json`) — o **prompt único** multishot —, nao mais uma shot-list
per-cena.

Gate mecanico: salve o prompt-forge em `<PROJ>/output/prompt-forge.json` e arme o bundle
pré-crédito com `node scripts/preflight-gate.cjs --root <PROJ>`. Ele roda de uma vez os gates de
texto. Para diagnostico avulso:

```bash
node scripts/lib/dp-quality.cjs shotlist <PROJ>/output/prompt-forge.json
node scripts/lib/critique.cjs <PROJ>/output/prompt-forge.json
```

O `dp-quality.cjs` bloqueia shots sem cinematografia verificavel: luz motivada, composicao 9:16
com safe-zone central (Y=220-1440 / middle 60%), um movimento de camera por shot, cor/grading e
anti-IA concreto. O `critique.cjs` aplica proxies da `RAG/review/rubrica-nivel-100.md` (16
criterios, anti-IA C8-C11) antes de gastar credito.

## Prompt bom (os campos do prompt-forge)

O `prompt` (prosa) cobre as camadas canônicas; o `shots[]` estruturado dá variedade; a identidade
vem do Element. Um bom prompt-forge:

- **`prompt` (prosa) cobre as camadas** — abre com medium/estilo; nomeia enquadramento e ângulo;
  descreve ação, cenário, luz e paleta; termina com `vertical 9:16`. As 7 camadas canônicas
  (subject, action, environment, composition, lighting, camera/lens, rendering/style) com as 3
  críticas obrigatórias (subject, composition, lighting) — o `scripts/lib/prompt-structure.cjs`
  cobra ao menos 5 das 7 e as 3 críticas.
- **identidade via Element**, não descrita à força — a personagem entra ancorada como
  `<<<element_id>>>`; o texto **não repete traços por cena** para "segurar" a personagem. O
  `element_id` está preenchido no prompt-forge.
- **cenas como beats** dentro do prompt único, com blocos de direção nomeados: visual style,
  editing style, mood, camera direction, avoid, e decupagem cronometrada (0-4 / 4-8 / 8-12).
- **`shots[]` tem variedade de plano** — tamanho de plano e ângulo variam entre beats (o
  `angle-variety.cjs` reprova 4+ shots com menos de 3 tamanhos distintos, ou beats adjacentes com
  plano E ângulo idênticos). Cada shot preserva `cinematografia`: safe-zone central, luz
  motivada, uma câmera, grading nomeado.
- **narrativa** com hook no primeiro frame (sem logo/fade), clímax por volta de 70% da duração e
  CTA no fechamento (o `narrative-quality.cjs` cobra).
- **negative curto** — se houver `negative_prompt`, 0-15 tokens, targeted, mirando artefatos
  observados; nunca listas preset (o `negative-prompt-discipline.cjs` reprova).
- paths de referência relativos ao repo; não pede texto/logo/UI dentro da imagem, exceto quando
  a cena for explicitamente sobre uma interface.

## Alertas

- prompt muito curto ou generico (menos de ~200 chars de prosa, ou só as cenas sem os blocos de
  direção);
- quality-words vazias: `8K`, `ultra-realistic`, `photoreal`, `masterpiece`, `best quality`,
  `cinematic` como atalho e `supersaturated`;
- **texto travando a identidade** ("everything else holds", "consistent identity, one continuous
  shot") em vez de confiar no Element — é o anti-padrão de plano único morto (ver
  `RAG/prompts/exemplos-prompt-forge.md`);
- `element_id` ausente quando o formato exige a personagem ancorada;
- shots todos no mesmo plano/ângulo (monotonia — mata o ritmo);
- cena vaga sem acao visual;
- CTA sem espaco limpo para legenda;
- termos contraditorios, como "close-up full body";
- `negative_prompt` longo ou com listas genericas estilo SDXL.

Se houver alerta, ajuste o prompt-forge antes de gerar. Nao queime credito para descobrir um
problema que ja esta visivel no texto — volte ao `prompt-smith` ou ao `storyboard-director`.
