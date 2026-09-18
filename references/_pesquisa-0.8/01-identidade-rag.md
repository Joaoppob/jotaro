# Etapa 1 — Identidade (rag): base teórica

> Pesquisa web executada em 2026-07-03. Todas as afirmações abaixo estão
> ancoradas nas fontes listadas na última seção.

## O que é e por que existe

A Etapa 1 do fluxo 0.8 lê o `RAG/` do projeto (marca.md, narrativa.md,
identidade-visual/ com fotos por personagem) e devolve a **identidade da marca**:
anchor (personagem/produto que ancora o reconhecimento), paleta, estilo e tom.
Ela existe porque as duas literaturas pesquisadas — branding em vídeo curto e
character consistency em geração por IA — convergem no mesmo ponto:

1. **Reconhecimento de marca em feed é pré-atencional e cumulativo.** O espectador
   decide em segundos; a marca só é reconhecida se os mesmos ativos visuais se
   repetirem em todo vídeo (Ant Creative; Superdirector/Ehrenberg-Bass).
2. **Modelos generativos não têm memória entre gerações.** Cada geração parte de
   ruído; descrição textual de identidade é reinterpretada do zero a cada vez
   (Oakgen; Higgsfield). Logo a identidade precisa entrar como **artefato estável**
   (referência visual + vocabulário fixo), não como prosa improvisada por shot.

A Etapa 1 é o mecanismo que transforma o RAG do cliente nesse artefato estável,
antes de qualquer prompt ser forjado.

## Base teórica (com as descobertas da pesquisa)

### 1. Identidade visual de marca em vídeo curto

- **Distinctive brand assets (Romaniuk & Sharp, Ehrenberg-Bass Institute):** cores,
  sons, personagens e padrões que, por repetição, viram "learned associations that
  help us to notice, recognise, remember and think of a brand". Teste de dois
  critérios: muita gente reconhece o ativo E o ativo aponta unicamente para uma
  marca. Um grade de cor que 100 outros criadores usam não é distintivo
  (superdirector.app/learn/brand-identity).
- **Cor é o ativo mais forte** porque o cérebro a processa pré-atencionalmente:
  paleta consistente em fundos, figurino e overlays + grade repetível (quente/fria,
  saturada/dessaturada) converte scroll em reconhecimento instantâneo
  (superdirector.app). Pesquisa acadêmica encontrou efeito em U da cor em vídeo
  curto sobre cliques e vendas — cor não é neutra, extremos prejudicam
  (Wen, Niu & Liao, Journal of Business Research 192, 2025).
- **Camadas de identidade em vídeo além da paleta:** enquadramento "home base",
  iluminação constante (soft = acessível, dura = dramática), ritmo de edição como
  assinatura, tipografia como impressão digital visual, estrutura repetível
  (Hook → Value → CTA) (superdirector.app; antcreative.net; hooksnap.io).
- **Sistema = elementos fixos + elementos variáveis.** Um brand system não é
  template rígido: fixa 2-3 cores de assinatura, uma fonte display, posição de
  logo, vocabulário de composição; varia emoção, cena e assunto. Template rígido
  demais vira armadilha visual e suprime engajamento (hooksnap.io).
- **Consistência paga em métricas:** thumbnails com esquema de cor e logo
  consistentes → +25% CTR; elementos de marca consistentes → até +30% em
  recognition clicks (dados Sprout Social/HubSpot 2026 agregados por hooksnap.io).
  Inconsistência de tom/visual/movimento sinaliza amadorismo e mina confiança
  (mypromovideos.com).
- **Style guide de vídeo dá regras, não só swatches:** propósito por cor, regra de
  contraste de texto sobre footage, look de color grading nomeado (warm/cool,
  muted/bright) com frames de exemplo do que é "correto" (newhorizons123.com).

### 2. Character consistency em geração por IA: referência > texto

- **Por que texto falha:** existem infinitas faces que satisfazem "mulher alta de
  cabelo escuro e olhos castanhos"; o modelo reinterpreta a descrição a cada
  geração e a face deriva (higgsfield.ai/blog; oakgen.ai). "You cannot describe a
  face precisely enough in text to guarantee perfect consistency. For
  pixel-accurate consistency, you need reference images" (oakgen.ai).
- **Como referência funciona:** as imagens entram como sinal de conditioning; o
  modelo "olha" para elas via mecanismos de atenção a cada passo do denoising, e a
  influência se estende ao clipe inteiro, não a um frame (mindstudio.ai sobre o
  reference system do Sora). Métodos como RefDrop (NeurIPS 2024) formalizam isso
  como reference feature guidance com força controlável, sem fine-tuning.
- **Escada de fidelidade** (do mais fraco ao mais forte, síntese Higgsfield):
  re-prompting textual < 1 imagem de referência por geração < identidade treinada
  (identity-adapter-like / Soul ID / Element). Referência única ancora UMA geração mas deriva
  ao longo de muitas; identidade treinada "aprende quem a pessoa é" e segura
  através de cenas, luz e ângulos (higgsfield.ai/blog/sould-id-best-character-consistency).
- **Boas práticas de refs (convergência entre fontes):**
  - Quantidade: 1 retrato limpo basta para clipe curto simples; 2-4 ângulos para
    multi-shot (magichour.ai; kling.ai); 4 ângulos distintos > 10 fotos frontais
    parecidas (oakgen.ai sobre FLUX.2); 10-20+ fotos para treinar identidade
    persistente (Higgsfield Soul ID).
  - Qualidade: alta resolução (mín. 1024x1024), luz frontal limpa e consistente,
    fundo neutro ou removido, um closeup frontal bem iluminado como âncora
    primária; evitar maquiagem pesada/óculos/luz extrema, a menos que sejam
    permanentes ao personagem (oakgen.ai; mindstudio.ai; higgsfield.ai).
  - Padrão-ouro: character turnaround sheet (frente, 3/4, perfil, costas)
    composto numa imagem única — "visual dictionary" completo (oakgen.ai).
  - Alinhamento prompt↔ref: se o prompt descreve uma coisa e a ref mostra outra,
    o modelo resolve o conflito de forma imprevisível — manter a descrição textual
    do personagem ESTÁVEL entre shots e coerente com a referência
    (mindstudio.ai; magichour.ai; kling.ai).
  - Divisão de trabalho: **referência cuida da aparência; texto cuida de ação,
    cenário e mood** (mindstudio.ai; docs.midjourney.com).
- **Limitações conhecidas:** detalhes finos (sardas específicas, logos em roupa)
  não reproduzem com exatidão (Midjourney docs); face é o caso mais forte — corpo
  e figurino ainda variam (mindstudio.ai); em vídeo, identidade e movimento são
  codificados nas mesmas features, então movimento intenso pode ser lido como
  mudança de identidade — drift aumenta com ação/câmera complexas; mitigação:
  aumentar força da ref, simplificar a ação, quebrar em clipes curtos
  (arxiv 2412.07750 "Multi-Shot Character Consistency"; magichour.ai). A meta
  realista é **continuidade perceptual**, não identidade pixel-perfeita
  (magichour.ai).

### 3. Como os sistemas atuais tratam identidade por referência

- **Higgsfield Soul ID / Characters:** treina identidade a partir de 10-20+ fotos
  (multi-ângulo, luz consistente, ~3-5 min de treino); vira "digital double"
  nomeável e reutilizável, selecionável na aba Character; a mesma identidade se
  aplica a imagem e vídeo (incl. Seedance 2.0, Kling 3.0, Veo 3.1). É modelo
  internalizado da face ("memória"), não lookup de uma foto — por isso segura em
  cenas, luzes e ângulos onde reference-matching quebra
  (higgsfield.ai/blog/Soul-ID-AI-Character-Consistency; higgsfield.ai/character).
- **Kling Elements / Element Library 3.0 / Subject Binding:** Element é um asset
  composto de 2-4 imagens (1 principal + até 3 suplementares de ângulos
  diferentes: frente, lado, costas, detalhe) ou um vídeo de 3-8s do qual extrai
  aparência, movimento e voz; vídeo suporta até 7 elementos de referência, imagem
  até 10; "Subject Binding" trava faces, texturas de roupa e voz através de shots
  (kling.ai/quickstart/klingai-element-library-3-user-guide;
  kling.ai/blog/kling-3-subject-binding-character-consistency). Elements não são
  só personagens: props, cenas e figurinos também podem ser elementos.
- **Runway References:** uma imagem de referência = âncora visual de UM conceito
  por vez (personagem, locação ou estilo); o prompt descreve o que muda, a ref
  mantém o que fica. Recomenda testar 3-5 candidatas de ref com prompt idêntico e
  guardar a vencedora em biblioteca nomeada (runwayml.com/resources).
- **Midjourney:** `--cref/--cw` (V6, legado) e Omni Reference `--oref/--ow` (V7):
  "put THIS in my image" para personagens, objetos e veículos; peso 0-1000
  (default 100; acima de ~400 imprevisível); pesos altos preservam roupa/face,
  pesos baixos permitem mudar estilo; exige prompt textual junto da ref
  (docs.midjourney.com; updates.midjourney.com/omni-reference-oref).
- **Sora (OpenAI):** três tipos de referência — character, style, setting — como
  conditioning; multi-ângulo fortalece; refs limpas (fundo removido) funcionam
  melhor (mindstudio.ai).
- **Padrão comum a todos:** o sistema separa **identidade (referência visual)** de
  **direção (texto)** — exatamente a arquitetura do 0.8 (Element para identidade,
  prompt forjado para ação/cena/câmera).

## Opções e vocabulário que o agente tem à disposição

Vocabulário canônico que a Etapa 1 deve extrair do RAG e devolver:

- **Anchor**: o distinctive brand asset central — personagem, mascote ou produto
  que aponta unicamente para a marca (critério Romaniuk: reconhecível + único).
  É o que vira Element no Higgsfield.
- **Paleta**: 2-3 cores de assinatura COM regra de uso (dominante / acento /
  neutro de fundo), não só hex codes soltos.
- **Grade/look**: temperatura (warm/cool), saturação (saturated/muted), contraste
  (bright-airy/moody) — o color grading nomeado que une os shots.
- **Estilo**: fotografia real / UGC-selfie / cinematic / ilustrado / cartoon —
  define coerência entre a ref e o que o prompt pede.
- **Tom**: registro emocional e de voz (educacional, divertido, aspiracional...) —
  alimenta narrativa e CTA das etapas seguintes.
- **Iluminação de casa**: soft/natural (acessível) vs. dura/alto-contraste
  (dramática) — deve ficar constante entre shots do mesmo vídeo.
- **Refs por personagem**: quais fotos de `identidade-visual/` servem como Element
  (avaliadas por: resolução, luz, ângulo, fundo, ausência de oclusões).
- **Elementos fixos vs. variáveis**: o que NUNCA muda (anchor, paleta, tipografia,
  estilo) vs. o que varia por vídeo (cena, ação, emoção) — evita o template rígido
  que a literatura aponta como armadilha.

## Como aplicar no fluxo 0.8 (prático, direto)

1. **Ler o RAG inteiro antes de decidir**: marca.md (ativos declarados),
   narrativa.md (tom/estrutura), identidade-visual/ (refs disponíveis).
2. **Nomear o anchor explicitamente** no output — um por vídeo. Referenciar um
   elemento por vez é o padrão dos sistemas (Runway); múltiplos anchors no mesmo
   Element diluem a ancoragem.
3. **Auditar as refs de cada personagem contra o checklist**: resolução ≥1024px,
   luz frontal limpa, fundo simples, 2-4 ângulos distintos, um closeup frontal
   como âncora primária, sem óculos/maquiagem pesada não-permanentes. Refs
   reprovadas = sinalizar, não usar em silêncio.
4. **Emitir a descrição textual estável do personagem** (uma frase canônica) que
   TODAS as etapas seguintes reutilizam verbatim no prompt — mudança de wording
   entre shots causa reinterpretação de identidade mesmo com ref ativa.
5. **Separar responsabilidades no output**: identidade → Element/ref (nunca tentar
   descrever a face no prompt); ação/cenário/câmera/mood → texto do prompt.
6. **Paleta e grade viram vocabulário obrigatório do prompt multishot**: cada shot
   do prompt único deve citar as cores de assinatura e o look nomeado, porque o
   Element preserva o personagem mas não a atmosfera — atmosfera é trabalho do
   texto.
7. **Fixar a iluminação de casa** e repeti-la em todos os shots de um mesmo vídeo;
   variar luz entre shots é o vetor nº 1 de quebra de coesão percebida.
8. **Prever drift em shots de ação intensa**: se o roteiro pede movimento forte do
   anchor, preferir shots mais curtos/ação simplificada naquele trecho (limitação
   estrutural: features de identidade e movimento se confundem em vídeo).

## Mudanças sugeridas ao fluxo 0.8

1. **Adicionar auditoria de qualidade das refs como sub-passo formal da Etapa 1**,
   com o checklist acima e status por personagem (aprovada / aprovada-com-ressalva
   / reprovada). A literatura é unânime: qualidade da ref determina consistência
   mais do que o prompt. Hoje o desenho assume que as fotos do RAG servem.
2. **Output da Etapa 1 deve incluir a "frase canônica" de cada personagem** —
   descrição textual estável reutilizada verbatim pelas etapas seguintes. O
   desenho atual devolve anchor/paleta/estilo/tom mas não fixa o wording, e
   wording instável entre shots reinterpreta identidade mesmo com Element ativo.
3. **Distinguir elementos fixos de variáveis no output** (sistema, não template):
   fixos = anchor, paleta, grade, tipografia, iluminação de casa; variáveis =
   cena, ação, emoção. Dá às etapas seguintes liberdade controlada em vez de
   rigidez.
4. **Considerar múltiplas refs por Element quando o Higgsfield suportar** (padrão
   Kling: 1 principal + até 3 suplementares de ângulos distintos; Soul ID: 10-20+
   para identidade treinada). Se o pipeline hoje envia 1 foto por Element,
   priorizar na seleção o closeup frontal bem iluminado, e catalogar as demais
   como suplementares para quando o slot existir. `[a verificar: quantas imagens
   o Element do Higgsfield aceita no pipeline atual do 0.8]`
5. **Registrar limitação esperada no dossiê**: corpo/figurino/logos em roupa podem
   variar mesmo com Element — se o produto tem logo estampado crítico, sinalizar
   risco na Etapa 1 em vez de descobrir no render.

## Fontes (URLs completas)

- https://superdirector.app/learn/brand-identity — distinctive brand assets
  (Romaniuk & Sharp / Ehrenberg-Bass), camadas de identidade em vídeo (cor,
  framing, luz, ritmo), dado Buffer 2026.
- https://antcreative.net/video-branding-strategy-how-to-build-a-strong-brand-identity-with-short-form-video-marketing/
  — sistema de identidade visual em short-form, formatos repetíveis, consistência→confiança.
- https://www.hooksnap.io/blog/youtube-thumbnail-brand-system-visual-consistency
  — brand system = fixos+variáveis; métricas de CTR/recognition (Sprout Social,
  HubSpot 2026); armadilha do template rígido.
- https://mypromovideos.com/blog/video-marketing-strategy-guide/brand-consistency-with-video/
  — inconsistência mina credibilidade; style guide de vídeo como ferramenta.
- https://newhorizons123.com/brand-video-style-guide/ — regras (não swatches):
  propósito por cor, contraste de texto, look de grading nomeado.
- https://ideas.repec.org/a/eee/jbrese/v192y2025ics0148296325001018.html — Wen,
  Niu & Liao (2025), efeito em U da cor em short-form video (JBR 192).
- https://oakgen.ai/blog/ai-character-consistency-guide — por que texto falha,
  checklist de refs, turnaround sheet, FLUX.2 multi-ref (ângulos distintos > volume).
- https://www.mindstudio.ai/blog/what-is-sora-reference-system-character-consistency
  — conditioning por atenção no denoising; refs limpas; alinhamento prompt↔ref;
  face forte / corpo variável.
- https://runwayml.com/resources/ai-character-references-tips — um conceito por
  ref; teste de 3-5 candidatas; biblioteca de refs nomeada.
- https://magichour.ai/blog/how-to-keep-characters-consistent-in-ai-video —
  método de ref primeiro, 2-4 ângulos, continuidade perceptual como meta realista.
- https://magichour.ai/blog/how-to-use-reference-images-in-image-to-video — três
  tipos de ref (identity/style/composition), força de ref, drift por ação complexa.
- https://proceedings.neurips.cc/paper_files/paper/2024/file/3b057de5a2e38bd8fa10201866c20dbf-Paper-Conference.pdf
  — RefDrop (NeurIPS 2024): reference feature guidance controlável.
- https://arxiv.org/html/2412.07750v1 — Multi-Shot Character Consistency for T2V:
  identidade e movimento compartilham features; conflito estrutural em vídeo.
- https://higgsfield.ai/blog/Soul-ID-AI-Character-Consistency — Soul ID: 20+ fotos,
  escada re-prompting < ref única < identidade treinada.
- https://higgsfield.ai/blog/SOUL-ID-Superior-Level-of-AI-Character-Consistency —
  walkthrough Soul ID; evitar óculos/maquiagem pesada; variedade de ângulos.
- https://higgsfield.ai/blog/sould-id-best-character-consistency — ref = lookup vs.
  identidade treinada = memória; aplica a imagem E vídeo (Seedance 2.0, Kling 3.0, Veo 3.1).
- https://higgsfield.ai/blog/how-to-turn-photo-into-consistent-ai-persona-creator —
  por que modelos não têm memória entre gerações.
- https://higgsfield.ai/character — página do produto Characters (multi-ângulo).
- https://docs.midjourney.com/hc/en-us/articles/32162917505293-Character-Reference
  — --cref/--cw; limitações (sardas, logos); texto continua obrigatório.
- https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference —
  --oref/--ow (V7); pesos; reforço de estilo.
- https://updates.midjourney.com/omni-reference-oref/ — anúncio Omni-Reference,
  semântica "put THIS in my image".
- https://kling.ai/quickstart/ai-video-character-consistency — Elements 1.6: 1-4
  imagens, subjects como elementos.
- https://kling.ai/quickstart/klingai-element-library-3-user-guide — Element =
  asset composto (2-4 imgs), até 7 refs em vídeo / 10 em imagem, voz vinculável.
- https://kling.ai/blog/kling-3-subject-binding-character-consistency — Subject
  Binding: 4 ângulos (frente/lado/costas/detalhe) ou vídeo 3-8s; "Visual DNA".
- https://kling.ai/quickstart/klingai-video-3-model-user-guide — element binding
  no VIDEO 3.0; estabilidade sob movimento de câmera.
- https://kling.ai/blog/ai-character-consistency-guide — ordem fixa de prompt
  (personagem→cena→estilo), templates de prompt, Character ID.
- https://piapi.ai/docs/kling-api/kling-elements — spec API Elements (1-4 imgs,
  ≥300px, 9:16 suportado).
