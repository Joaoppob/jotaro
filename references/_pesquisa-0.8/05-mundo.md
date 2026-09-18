# Etapa 5 — Mundo (world-building): base teórica

> Pesquisa web, 2026-07-03. Fontes web verificadas listadas ao final.
> Papel no fluxo 0.8: o agente MUNDO audita o rascunho do prompt perguntando
> "o personagem vive num mundo construído e coerente com o projeto — ou flutua
> num fundo genérico?" e mantém um `mundo.md` persistente por projeto.

## O que é e por que existe

O problema que a etapa resolve tem dois lados, um narrativo e um técnico:

1. **Lado narrativo — o fundo genérico não caracteriza ninguém.** Em teoria do
   cinema, cenário não é container da ação: é mise-en-scène — "a soma total de
   escolhas na criação de uma diegese coerente e crível", onde sets, figurino e
   props formam "um conjunto denso de pistas visuais comunicando continuamente
   traços de personagem, detalhes narrativos e significado temático"
   (Oklahoma State, *Introduction to Film & TV*). Um personagem num fundo
   genérico perde o canal não-verbal inteiro de caracterização.

2. **Lado técnico — modelos de geração não têm memória de mundo.** "Não existe
   'world memory' nativa a menos que você a forneça. Se cada frame parte do
   zero, o modelo otimiza plausibilidade local, não continuidade global"
   (Nat Currier, *AI Environment Consistency*). O mesmo prompt textual
   "apartamento da Sarah, sala" descreve milhares de salas possíveis — três
   clipes, três salas inventadas (AI Tools Guidebook). Sem um registro
   canônico, o cenário é re-sorteado a cada geração.

O `mundo.md` persistente por projeto é a resposta aos dois lados de uma vez:
é o "location bible" que dá caracterização (lado 1) e ancoragem verbatim
(lado 2). Exemplo real do projeto: uma personagem (marca de gomas) tem academia,
quarto e café — esses três lugares precisam ser os mesmos lugares em todos
os vídeos da campanha, com a mesma luz, os mesmos props, a mesma geografia.

## Base teórica (com as descobertas da pesquisa)

### Mise-en-scène e production design: o cenário é psicologia externalizada

- "O set funciona como um mapa da psicologia do personagem. Um quarto bagunçado
  diz que o personagem é caótico; um quarto estéril, que é reprimido"
  (Film & Philosophy, *Introduction to Film Studies 4*). O exemplo canônico é
  Xanadu em *Cidadão Kane*: o acúmulo de objetos caros simboliza o vazio de
  Kane — "o prop vira símbolo do homem".
- O production designer existe exatamente para garantir que o setting inteiro
  sirva a uma visão estética única — set design + set decoration + figurino +
  luz alinhados (Humanities LibreTexts, *Moving Pictures* §1.3). "Todo objeto
  colocado no set adiciona à mise-en-scène e ajuda a contar a história" — dos
  porta-retratos no fundo ao copo de whisky na mão.
- Detalhe importante para o auditor: esses são "os detalhes que não devemos
  notar" (LibreTexts). O mundo bem construído é invisível ao espectador e
  gritante na ausência.

### Environmental storytelling: props comunicam classe, época, personalidade

- Definição de Bart Stewart (Game Developer): "a arte de arranjar uma seleção
  cuidadosa de objetos de modo que sugiram uma história a quem os vê". Mostra
  o desfecho de eventos e deixa o espectador reconstruir a causa — mais
  colaborativo que expositivo.
- Objetos codificam sociologia: "materiais usados dizem o avanço tecnológico
  da sociedade, o design das casas diz o estilo de vida e o status econômico
  dos ocupantes" (Game Developer, *What you Give is What you Get*).
- Método Bethesda/Starfield: antes de decorar um espaço, definir quem o habita
  — profissão, hobbies, comida preferida — e derivar os objetos disso.
  "Escritório mais minimalista e organizado; casa mais desarrumada, com
  quinquilharias à mostra" (Xbox UK / Starfield clutter). É literalmente o
  fluxo do agente MUNDO: personagem primeiro, espaço derivado.
- Desgaste = tempo vivido: "sola de bota gasta, trilha batida na grama, marcas
  na parede implicam presença contínua do personagem" (selfielab). Seletividade
  é a regra: "props demais criam ruído visual, de menos parece estéril" —
  escolher objetos que multitarefam (arma bem cuidada = prontidão + disciplina).
- Avalanche/Generation Zero: tratar o mundo como "personagem principal" — cada
  vila com nome, lógica e moradores fictícios com casa e ocupação, mesmo que
  nunca apareçam. Placas de estrada com distâncias reais fazem o lugar parecer
  um lugar.

### Iceberg principle: saiba 100%, mostre 10%

- Hemingway (*Death in the Afternoon*, 1932): "a dignidade de movimento de um
  iceberg se deve a apenas um oitavo dele estar acima da água. Um escritor que
  omite coisas porque não as conhece só cria buracos ocos na escrita".
- Aplicado a worldbuilding: o autor mantém um "World Bible privado" (história,
  economia, geografia) e a narrativa pública mostra só a menor referência
  oblíqua que funcione (Rafiul Alam, *Iceberg Theory*). O leitor sente a
  profundidade sem vê-la.
- Regra de consistência: "profundidade que contradiz a superfície é pior que
  não ter profundidade — o leitor sente a inconsistência mesmo sem conseguir
  apontá-la" (Obsidian Tavern). Tradução direta pro 0.8: o `mundo.md` é o
  iceberg submerso; o prompt final carrega só a fatia visível — mas essa fatia
  nunca pode contradizer o `mundo.md`.

### Consistência espacial em geração de vídeo: anchor visual > descrição livre

- Diagnóstico central: "para conseguir consistência você precisa de uma âncora
  visual do cômodo, não de uma descrição verbal" livre (AI Tools Guidebook).
  Causas de drift, por taxa de incidência: (1) descrição livre sem âncora,
  (2) nenhum establishing shot gerado antes dos clipes de ação, (3) descrições
  de luz variando entre cortes, (4) props mencionados de forma inconsistente,
  (5) gerações em sessões/ferramentas diferentes.
- Workflow "panorama first" (Nat Currier): gerar o lugar VAZIO primeiro (wide
  ou panorâmica = "World Source"), depois inserir o personagem. "Um personagem
  sem casa é um adesivo. Um personagem num mundo persistente é uma história."
- Bloco de cena verbatim: escrever UM scene block (SCENE / SET / LIGHT) e colar
  idêntico, palavra por palavra, em todo prompt do mesmo lugar. Variar "warm
  afternoon light" ↔ "cozy interior light" ↔ "morning light" já produz três
  salas (AI Tools Guidebook).
- Âncoras por prompt (Seedance 2.0 multi-shot, PromeAI): todo prompt carrega
  2 tipos de âncora — âncora de personagem/produto e âncora de ambiente
  ("pale oak desk, off-white wall, single monstera plant left background,
  soft morning window light from camera-right"). 3–7 identificadores nítidos;
  travar piso + material de parede + luz em interiores.
- Luz como lógica física: "nomeie a fonte de luz (letreiro neon, porta
  entreaberta, céu nublado) — isso dá ao modelo uma lógica física de
  iluminação que estabiliza sombras" (Invideo, guia Veo 3.1). Tratar o
  ambiente "como sistema, não como pano de fundo": hora do dia, o que há no
  ar (névoa, calor, chuva), o que o fundo está fazendo.
- Ecossistema Higgsfield/Kling: consistência estrutural via referências —
  Elements (âncora de identidade) + Scene Images (âncora de ambiente: "luz e
  paleta, arquitetura e detalhes do ambiente, estilo visual geral") que
  persistem entre shots de um multi-shot (Venice API, *Reference to Video*).
  O 0.8 já é MCP-first com identidade via Element; o mundo é o análogo
  ambiental do Element.
- Checklist de auditoria pós-geração (Nat Currier): a âncora arquitetônica
  dominante está no lugar esperado? A direção de luz bate com os shots
  anteriores? Escala de objetos e altura de câmera são plausíveis? Um editor
  cortaria esse shot na sequência sem confusão?

## Opções e vocabulário que o agente tem à disposição

Elementos que constituem um mundo (o cardápio do agente ao construir/auditar):

**Geografia e layout (o esqueleto — o que não pode andar):**
- Tipo de lugar e posição relativa: portas, janelas, parede dominante, móvel-âncora
- Relação entre lugares do projeto (o café fica na rua da academia? vista da janela do quarto?)
- Escala e altura de câmera plausível para o espaço (9:16 favorece verticais: janelas altas, corredores, espelhos de corpo inteiro)

**Materiais e paleta (a pele do lugar):**
- Acabamento de parede, tipo de piso, texturas dominantes, 2–3 cores canônicas
- Idade e desgaste: novo/impecável vs vivido/gasto (classe social e tempo)

**Props (a sociologia do lugar):**
- Props imutáveis ("prop continuity"): objetos que SEMPRE aparecem — o abajur de latão, a monstera, o anel de luz do espelho da academia
- Props de mão: o que o personagem pega (a garrafa, o pote de gomas, o celular)
- Props de caracterização: o que os objetos dizem — profissão, hobby, renda, época, cultura
- Marcas de uso: trilhas, arranhões, organização vs bagunça (personalidade)

**Luz natural do lugar (a assinatura, sempre com fonte nomeada):**
- Fonte + direção + hora: "luz de janela camera-left, fim de tarde"
- Temperatura de cor e qualidade: "5500K, suave e difusa" / "tungstênio quente, dura"
- Practicals do lugar: neon do letreiro, luminária, tela do laptop

**Atmosfera e som do lugar (o ar):**
- O que há no ar: vapor do café, poeira em contraluz na academia, chuva na janela
- Ambiente sonoro diegético (Kling Native Audio aceita): "burburinho de café e máquina de espresso", "ferro batendo e playlist abafada na academia", "silêncio de quarto com ventilador"
- O que o fundo faz: movimento distante, passantes, reflexos

**Lista de drift proibido ("forbidden drift list", por lugar):**
- Enumeração explícita do que NÃO pode mudar entre gerações (janela não muda de parede, sofá não muda de cor, hora do dia não muda dentro da mesma cena)

## Como aplicar no fluxo 0.8 (prático)

### Estrutura sugerida do `mundo.md` (por projeto)

```markdown
# Mundo — [Projeto/Personagem]

## Visão geral
[1 parágrafo: que mundo é esse, cidade/bairro/clima, e o que ele diz
sobre o personagem — o iceberg submerso. Nunca vai inteiro pro prompt.]

## Relação entre lugares
[mapa verbal: o que fica perto do quê, o que se vê de onde]

## Lugar: [nome — ex. Academia da Duda]
- **scene-block (verbatim, colar identico no prompt):**
  SCENE: [uma linha]
  SET: [3-7 âncoras: móvel-âncora, materiais, props imutáveis, posições]
  LIGHT: [fonte + direção + temperatura + qualidade, uma frase fixa]
- **som do lugar:** [ambiente diegético, uma frase fixa]
- **props de mão disponíveis:** [o que o personagem pode pegar aqui]
- **forbidden drift:** [o que nunca muda entre gerações]
- **referência visual:** [path do establishing shot / Scene Image, se gerado]
- **notas de continuidade:** [aprendizados de gerações passadas]

## Lugar: [próximo lugar...]
```

Regras de manutenção do arquivo:
- O scene-block é **canônico e verbatim** — o agente reutiliza as mesmas
  palavras, nunca parafraseia (paráfrase = re-sorteio do cenário).
- Só o scene-block + som + props relevantes ao shot entram no prompt
  (iceberg: mostra 10%, sabe 100%; visão geral e relações ficam submersas).
- Lugar novo aparece no rascunho → agente cria a entrada ANTES de aprovar o
  prompt (método Bethesda: quem vive aqui? o que faz? derive os props disso).
- Geração aprovada revela detalhe novo do lugar → agente promove o detalhe a
  cânone no `mundo.md` (o mundo cresce por acreção, não por reinvenção).

### Perguntas de auditoria do agente MUNDO (sobre o rascunho de prompt)

1. **Existência:** o lugar do shot tem entrada no `mundo.md`? Se não — criar antes de prosseguir.
2. **Genérico vs construído:** o ambiente do rascunho descreveria mil lugares diferentes ("num café aconchegante") ou UM lugar ("o café da Duda: balcão de madeira clara, neon rosa 'BREW', banco alto na janela camera-right")?
3. **Verbatim:** o scene-block foi colado idêntico, ou parafraseado?
4. **Luz:** a fonte de luz está nomeada, com direção e temperatura, e bate com a assinatura fixa do lugar? Hora do dia coerente entre shots da mesma cena?
5. **Caracterização:** os props do shot dizem algo sobre o personagem (classe, hábito, época), ou são decoração aleatória? Há ao menos 1 prop imutável do lugar visível?
6. **Contradição de cânone:** algo no rascunho contradiz o `mundo.md`? (contradição é pior que omissão — Obsidian Tavern)
7. **Coerência entre shots (multishot):** os shots no mesmo lugar compartilham âncoras, luz e direcionalidade? Um editor cortaria a sequência sem confusão?
8. **Drift proibido:** algum item da forbidden-drift list foi alterado ou omitido?
9. **Som:** o ambiente sonoro diegético do lugar está no prompt (quando o modelo suporta áudio nativo)?

## Mudanças sugeridas ao fluxo 0.8

1. **Establishing shot como asset de mundo:** para cada lugar recorrente, gerar
   um wide do lugar VAZIO (sem personagem) uma vez, salvar como referência
   canônica e registrar o path no `mundo.md`. É a correção nº 1 e nº 2 da
   literatura de drift (âncora visual > texto; "panorama first"). Se o
   Higgsfield aceitar Scene Image/start frame no fluxo multishot, usar; senão,
   o scene-block verbatim é o fallback.
2. **Scene-block verbatim como contrato:** o output do agente MUNDO para as
   etapas seguintes não deve ser "sugestões de ambiente" — deve ser o bloco
   literal a colar. Etapas posteriores não têm permissão de reescrever o bloco,
   só de adicionar ação/câmera ao redor dele.
3. **Acreção de cânone pós-render:** adicionar um passo leve pós-aprovação —
   se o vídeo aprovado estabeleceu um detalhe novo do lugar, o agente MUNDO
   registra no `mundo.md`. Sem isso o arquivo fossiliza e diverge do material
   já publicado da marca.
4. **Som do lugar no schema:** incluir campo de ambiente sonoro diegético por
   lugar no `mundo.md` — modelos com áudio nativo (Kling 3.0 e afins) usam, e
   o som é metade da sensação de "mesmo lugar" entre vídeos.

## Fontes (URLs completas)

- https://open.library.okstate.edu/introfilmtv/part/mise-en-scene/ — mise-en-scène como criação de diegese coerente; sets/props como pistas visuais densas
- https://www.filmandphilosophy.com/lessons/introduction-to-film-studies-4-mise-en-scene/ — set como mapa da psicologia do personagem; Xanadu/Cidadão Kane
- https://human.libretexts.org/Bookshelves/Theater_Film_and_Storytelling/Moving_Pictures_-_An_Introduction_to_Cinema_(Sharman)/01%3A_An_Introduction_to_Cinema/01.3%3A_Mise-en-Scene — production designer, set design vs set decoration, props
- https://en.m.wikipedia.org/wiki/Mise-en-sc%C3%A8ne — definição e escopo do termo
- https://www.gamedeveloper.com/design/environmental-storytelling — Bart Stewart: definição canônica de environmental storytelling
- https://www.gamedeveloper.com/design/what-you-give-is-what-you-get-environmental-storytelling-in-games — objetos/arquitetura comunicando cultura, tecnologia, status econômico
- https://www.gamedeveloper.com/design/game-design-deep-dive-environmental-storytelling-in-i-generation-zero-i- — mundo como "personagem principal"; lugares com nome e lógica
- https://www.xboxuk.com/starfield-clutter-and-the-story-behind-bethesdas-love-of-junk/ — método Bethesda: derivar props da persona do habitante
- https://selfielab.me/blog/character-design-through-environmental-storytelling-and-visual-context-20260128 — desgaste como história vivida; seletividade de props; 3 camadas de ambiente
- https://obsidiantavern.com/iceberg-worldbuilding — iceberg 90/10; contradição de cânone pior que omissão
- https://alamrafiul.com/blogs/iceberg-theory-show-ten-know-hundred/ — World Bible privado vs narrativa pública; Hemingway 1932
- https://writelifeworkshops.com/2026/02/hemingways-iceberg-theory-enriches-fantasy-writing/ — citação original de Death in the Afternoon; Tolkien bottom-up vs Lewis top-down
- https://nat.io/blog/consistent-environment-generation-guide — world persistence, panorama-first, location bible, forbidden drift list, checklist de auditoria
- https://aitoolsguidebook.com/en/articles/ai-video-scene-inconsistency/ — causas de drift ranqueadas; scene-block verbatim SCENE/SET/LIGHT; establishing shot canônico
- https://www.promeai.pro/blog/seedance-2-0-multi-shot-consistency-planning/ — âncoras de personagem + ambiente por prompt; 3–7 identificadores; checklist multi-shot
- https://docs.venice.ai/guides/media/reference-to-video — Elements + Scene Images; referências persistindo entre shots de multi-shot
- https://magichour.ai/blog/how-to-use-reference-images-in-image-to-video — first-frame lock; identidade vs estilo; drift de composição
- https://help.runwayml.com/hc/en-us/articles/42460036199443-Text-to-Video-Prompting-Guide — componentes visuais vs de movimento; estrutura de prompt
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1 — fórmula 5 partes; ingredients-to-video com imagem do setting
- https://invideo.io/blog/google-veo-prompt-guide/ — ambiente como sistema; nomear fonte de luz para lógica física
- https://kling.ai/blog/kling-ai-prompt-guide — multi-shot: definir setting primeiro; áudio ambiente diegético
- https://www.atlascloud.ai/blog/guides/kling-ai-video-prompt-guide — fórmula oficial Kling; câmera vaga como causa nº 1 de inconsistência
