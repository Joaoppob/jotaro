# Etapa 11 — Prompt-smith final (essencialismo): base teórica

> Pesquisa web, 2026-07-03. Etapa 11 do fluxo Jotaro 0.8: depois de todos os
> especialistas auditarem o rascunho, o PROMPT-SMITH FINAL não inventa uma nova
> direção; ele transforma as decisões aprovadas em um prompt enxuto, executável e
> fiel ao projeto.

## O que é e por que existe

A etapa PROMPT-SMITH FINAL é a passada de fechamento editorial. Ela recebe:

- `project-brief`
- identidade/RAG
- rascunho final dos especialistas
- vereditos de história, mundo, enredo, câmera, montagem, realismo e áudio
- constraints do modelo alvo de geração

Seu trabalho não é "embelezar" o prompt. É remover tudo que não serve ao projeto
específico e preservar só as decisões que aumentam controle de geração. A pesquisa
converge em três princípios:

1. **Prompt bom reduz ambiguidade.** OpenAI, Anthropic, Microsoft e Google Cloud
   repetem a mesma regra: instruções claras, específicas, com contexto suficiente e
   formato esperado reduzem variação indesejada.
2. **Prompt de mídia precisa de linguagem visual concreta.** Guias de geração de
   imagem/vídeo recomendam descrever sujeito, ação, ambiente, composição, luz,
   câmera, movimento e estilo com termos observáveis, não adjetivos genéricos.
3. **Controle não vem de prompt longo; vem de decisão precisa.** Runway e Bria
   enfatizam prompts simples, positivos e concretos. Pilhas de "ultra, masterpiece,
   8K, cinematic" não substituem direção real.

No 0.8, isso se encaixa perfeitamente no princípio do usuário: cada prompt é um
projeto individual, precisa sobreviver por si e conter apenas o essencial para a
cena.

## Base teórica

### 1. Prompt engineering é especificação operacional, não copy bonita

OpenAI define prompt engineering como escrita de instruções efetivas para obter
comportamento desejado do modelo. Em modelos de raciocínio, a recomendação é dar
objetivo e contexto; em modelos mais diretos, explicitar mais instruções, formato e
restrições. A versão prática para o Jotaro:

- O prompt final deve declarar o **resultado visual/audiovisual desejado**.
- Deve separar **contexto estável** de **instrução de execução**.
- Deve deixar claro o que o modelo deve priorizar quando houver conflito.
- Deve evitar conflito entre instruções globais e instruções por shot.

Anthropic reforça clareza, exemplos e estrutura como alavancas de consistência.
Microsoft Foundry resume a mesma ideia em termos de "restringir o espaço
operacional": quanto menos variáveis abertas, menor a chance de o modelo preencher
com clichê.

### 2. Structured output ensina uma lição: schema e prompt têm papéis diferentes

O guia de Structured Outputs da OpenAI é importante mesmo quando o produto final é
um prompt textual: ele mostra que formato deve ser controlado por contrato, e não por
esperança. Quando possível, a etapa 11 deve emitir duas coisas:

1. **Prompt final humano-legível**: texto pronto para o modelo de imagem/vídeo.
2. **Manifesto estruturado**: JSON/YAML com decisões auditáveis por shot.

Exemplo de manifesto:

```yaml
project_goal: "awareness"
primary_metric: "hook_rate"
generation_model: "veo|runway|kling|seedance|image"
shots:
  - id: 1
    beat: "hook"
    camera: "medium close-up, slow dolly in"
    lighting: "motivated window light"
    realism: "natural motion blur, imperfect handheld texture"
    audio: "room tone + short line"
```

Isso dá ao pipeline uma superfície que os gates mecânicos conseguem validar sem
interpretar poesia.

### 3. Prompts de imagem/vídeo são briefs cinematográficos compactos

Guias de OpenAI Image, Adobe Firefly, Runway, Google Veo e Amazon Nova Canvas
convergem em uma taxonomia prática:

- **Sujeito**: quem/que objeto aparece.
- **Ação**: o que acontece agora.
- **Ambiente**: onde a cena vive.
- **Composição**: framing, posição, escala, 9:16.
- **Luz**: tipo, direção, fonte, clima.
- **Câmera**: shot size, ângulo, movimento, lente/look.
- **Materialidade/realismo**: textura, imperfeição, grão, motion blur.
- **Áudio**: fala, música, som ambiente, silêncio.
- **Restrições**: o que não pode aparecer ou não pode ser inferido.

O agente final não precisa repetir tudo. Ele precisa decidir quais desses eixos são
relevantes para o projeto específico. Se a luz já é central para a cena, entra. Se a
paleta não muda nada, sai.

### 4. Positivo primeiro; negativo só quando reduz risco real

Runway e Bria recomendam linguagem positiva e concreta. Em vez de depender de
negações como "não parecer IA", o prompt deve dizer o comportamento desejado:

- "natural handheld micro-shake" em vez de "not too perfect"
- "motivated window light from camera-left" em vez de "not studio lighting"
- "subtle shutter motion blur on hand movement" em vez de "not frozen"
- "real skin texture, uneven pores, natural asymmetry" em vez de "not plastic skin"

Negativos continuam úteis quando há falha recorrente ou risco de modelo:

- "no text overlays unless specified"
- "no extra fingers"
- "no floating product labels"
- "no glossy studio light"

Mas a regra do 0.8 deve ser: **negativo é controle de risco, não direção criativa**.

### 5. Prompt final precisa ser dialetal por modelo, mas não pode virar refém do modelo

Cada modelo entende melhor um dialeto:

- **Runway Gen-4**: tende a funcionar melhor com prompt simples, foco em movimento,
  ação e câmera.
- **Google Veo**: aceita direção audiovisual mais rica, incluindo câmera, ambiente,
  fala e som.
- **Adobe Firefly/OpenAI Image**: imagem estática favorece sujeito, composição, luz,
  estilo e materiais.
- **Amazon Nova Canvas**: documenta subject/action/environment/lighting/style/camera
  como elementos úteis e alerta sobre limite de prompt.

Logo, o Prompt-smith final deve ter duas camadas:

1. **Direção canônica do Jotaro**: a intenção criativa aprovada.
2. **Tradução para o modelo alvo**: compactação e vocabulário compatível.

Isso evita que o projeto seja reescrito para agradar um modelo específico antes de
se saber se o modelo alvo mudou.

## Opções que o agente deve conhecer

### Formatos de saída

| Uso | Formato recomendado | Quando usar |
|---|---|---|
| Texto-para-vídeo simples | Parágrafo curto + lista de shots | Quando o modelo aceita prompt livre |
| Vídeo multi-shot | Blocos `Shot 1`, `Shot 2`, `Shot 3` | Quando há sequência/corte |
| Imagem estática | Uma sentença visual densa | Quando só existe um frame |
| Render com API | Manifesto estruturado + prompt | Quando o MCP precisa de parâmetros |
| Auditoria | Prompt + diff de cortes | Quando precisa justificar remoções |

### Hierarquia de essencialismo

O agente deve preservar, nessa ordem:

1. Objetivo do projeto e métrica primária.
2. Ação/beat que comunica o objetivo.
3. Identidade inegociável do personagem/marca/produto.
4. Mundo/ambiente necessário para a cena.
5. Câmera e montagem quando alteram percepção.
6. Luz quando sustenta realismo ou sentido.
7. Áudio quando afeta entendimento, emoção ou plataforma.
8. Restrições negativas de risco recorrente.

Tudo abaixo disso é candidato a corte.

### Cortes típicos

- Superlativos vazios: "ultra realistic", "masterpiece", "stunning", "award-winning".
- Duplicação de intenção: repetir "cinematic" em todo shot.
- Contradições: "handheld documentary" + "perfectly stable studio dolly".
- Detalhes de mundo que não aparecem no frame.
- Metadados internos que não ajudam o modelo.
- Longas justificativas que deveriam viver no `.md`, não no prompt.

## Perguntas de auditoria do Prompt-smith final

1. O prompt final comunica uma única intenção principal?
2. Cada frase muda algo que o modelo deve renderizar, mover, iluminar, enquadrar ou
   sonorizar?
3. Há alguma decisão de especialista que foi perdida na compactação?
4. Há alguma decisão repetida em linguagem diferente?
5. Há conflito entre câmera, luz, mundo, realismo ou áudio?
6. O prompt cabe no dialeto e limite do modelo alvo?
7. Os shots têm ordem temporal clara?
8. O hook aparece nos primeiros segundos?
9. A marca/personagem/produto aparece na medida exigida pelo brief?
10. O negativo prompt combate falhas reais ou só expressa ansiedade?
11. O manifesto estruturado contém o que os gates precisam validar?
12. O prompt "sobrevive por si" se lido sem o dossiê?

## Formato de saída sugerido

```markdown
## Prompt final
[texto pronto para render]

## Manifesto de geração
```yaml
model_target: ...
aspect_ratio: "9:16"
duration_seconds: ...
primary_metric: ...
shots: [...]
negative_controls: [...]
```

## Diff de essencialismo
- Cortado: ...
- Preservado: ...
- Motivo: ...
```

## Mudanças sugeridas ao fluxo 0.8

1. **Adicionar `prompt_manifest.yaml`** como artefato obrigatório antes dos gates.
2. **Criar gate `essentialism-diff`**: exige que o Prompt-smith declare o que cortou
   e por quê.
3. **Separar prompt canônico de prompt dialetal**: `prompt.canonical.md` e
   `prompt.<model>.md`.
4. **Adicionar lint de contradição visual**: detectar pares como "handheld" +
   "perfectly stable", "natural light" + "studio softbox" sem justificativa.
5. **Negativos por risco, não por estética**: negativo prompt deve ter motivo
   associado.

## Direção em uma frase (chip)

**"O prompt final não soma camadas; ele corta até sobrar só a direção executável do projeto."**

## Fontes (URLs completas)

- https://developers.openai.com/api/docs/guides/prompt-engineering — guia oficial de prompt engineering da OpenAI.
- https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api — boas práticas oficiais de prompt engineering.
- https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt — clareza, especificidade e refinamento iterativo.
- https://developers.openai.com/api/docs/guides/structured-outputs — structured outputs e separação entre instrução e contrato.
- https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide — guia de prompting para modelos de imagem OpenAI.
- https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices — boas práticas Anthropic: clareza, exemplos, estrutura.
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — contexto como evolução de prompt engineering.
- https://learn.microsoft.com/en-us/azure/foundry/openai/concepts/prompt-engineering — Microsoft: especificidade e restrição do espaço operacional.
- https://cloud.google.com/discover/what-is-prompt-engineering — Google Cloud: definição e função do prompt engineering.
- https://www.promptingguide.ai/ — guia amplo de técnicas de prompt engineering.
- https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide — Runway Gen-4: estrutura, movimento, prompt simples.
- https://help.runwayml.com/hc/en-us/articles/35694045317139-Gen-4-Image-Prompting-Guide — Runway Gen-4 Image: controle estilístico e visual.
- https://helpx.adobe.com/firefly/web/work-with-images/generate-images/writing-effective-text-prompts.html — Adobe Firefly: prompts específicos e descritivos.
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1 — Google Veo 3.1: direção audiovisual e controle criativo.
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide — guia de prompt para Veo em plataforma Google.
- https://docs.aws.amazon.com/nova/latest/userguide/prompting-image-generation.html — Amazon Nova Canvas: elementos de prompt de imagem e limite.
- https://docs.bria.ai/image-generation-best-practices — Bria: controles concretos superam superlativos vagos.

