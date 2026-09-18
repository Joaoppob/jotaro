# Metodologia: projeto dentro de projeto

> Registrado em 2026-07-03, a partir de 3 roteiros-exemplo colados no Penpot (mulher/
> sociedade, raquete de tênis, apresentação de personagem) e do debate que se seguiu. Este é o
> método — a forma de pensar toda geração e toda cena dela. Ainda não é o schema/agente que
> aplica o método (isso é a próxima etapa); é a referência canônica do que esse molde exige.

## O princípio

Uma geração não é um prompt técnico que acontece de ter várias cenas. É um **projeto**. E cada
**cena dentro dela também é um projeto** — não um fragmento técnico do projeto maior (um shot
com câmera/luz/duração), mas uma unidade completa com a mesma anatomia do projeto inteiro, só
que em escala menor.

Isso é fractal: a mesma pergunta, nas mesmas 6 formas, se aplica em dois níveis —

- **Projeto mãe** = a geração inteira (15s, 3 cenas).
- **Projeto filho** = cada cena dentro dela (5s, com sua própria progressão interna).

Uma cena que só serve tecnicamente ao todo (bonita, bem enquadrada, mas sem objetivo e mensagem
próprios) não é um projeto — é um fragmento. O método existe pra garantir que isso não aconteça:
toda cena precisa **sobreviver por si**, mesmo sendo parte de algo maior.

## As 6 perguntas (aplicam-se aos dois níveis: geração e cena)

1. **Qual o objetivo desta unidade?** — o que ela precisa realizar (awareness, conversão,
   introduzir um personagem, revelar uma verdade).
2. **O que ela comunica?** — a mensagem, o conteúdo central.
3. **Qual o método de comunicação desse projeto?** — a ideia/dispositivo criativo escolhido pra
   comunicar isso (contraste, espelho/bookend, listagem íntima, testemunho direto, escalada).
   **Método é estratégia, não execução** — é a decisão de "como estruturar a comunicação",
   antes de decidir câmera ou corte.
4. **Como ela comunica isso?** — a execução técnica que realiza o método: câmera, luz, corte,
   performance, música. Aqui entram as decisões que hoje já pertencem a `camera`/`montagem`/
   `realismo`/`audio`.
5. **Qual o arco começo-meio-fim dela mesma?** — mesmo em 5 segundos, a unidade tem uma
   progressão interna. Não é estática.
6. **Ela sobrevive sozinha?** — o teste vampiro: se você isolasse essa unidade e mostrasse só
   ela, ainda comunicaria algo completo e coerente? (Hoje o `historia.md` já roda uma versão
   disso — Teste 3 — mas só no nível do projeto inteiro. O método pede o mesmo teste por cena.)

Método (3) e como (4) são deliberadamente separados: método é a ideia criativa/estrutural
(perto de quem pensa a estratégia — `objetivo-do-projeto`/`historia`/`enredo`); como é a
execução técnica que realiza essa ideia (perto de quem executa — `camera`/`montagem`/
`realismo`/`audio`).

## As 6 perguntas aplicadas aos 3 roteiros-exemplo

### Roteiro 1 — mulher/sociedade

**Nível projeto (geração):**
1. Objetivo: awareness/conexão emocional de marca.
2. O que comunica: a pressão social crescente sobre uma mulher a entregar cada vez mais de si,
   e o sofrimento silencioso por trás da aparência de estar bem.
3. Método: contraste — três vozes diferentes repetindo a mesma exigência, escalando, até
   ruptura abrupta em silêncio.
4. Como: zoom em bocas específicas, corte seco, música que acelera e para de vez, choro contido
   atrás de um sorriso forçado.
5. Arco: identificação (pressão) → escalada (esforço frenético) → colapso/verdade (vulnerabilidade).
6. Sobrevive sozinha: sim — mesmo como fragmento isolado, a cena 3 (o colapso) comunica algo
   completo por si.

**Nível cena (exemplo — Cena 1, 0-5s):**
1. Objetivo da cena: estabelecer a exigência da sociedade como uma força vinda de todos os lados.
2. O que comunica: "não importa quem seja, sempre vai pedir mais de você".
3. Método da cena: repetição escalando — a mesma palavra ("More!") dita por três vozes de idade
   diferente, cada corte aumentando a pressão.
4. Como: zoom profissional na boca de cada pessoa, corte seco entre elas, sem pausa.
5. Arco da cena: homem → mulher mais velha → criança, intensidade crescente a cada corte.
6. Sobrevive sozinha: sim — mesmo sem o resto do vídeo, esses 5s já comunicam "todo mundo exige
   mais de você".

### Roteiro 2 — produto (raquete de tênis)

1. Objetivo: conversão/consideração de produto.
2. O que comunica: a raquete não te deixa na mão — dedicação silenciosa é recompensada.
3. Método: espelho/bookend — abre e fecha no mesmo registro visual (mundo vazio, treino
   solitário), ancorando o produto no meio como a prova que sustenta esse ciclo. Testemunho
   direto no fechamento sela a mensagem.
4. Como: câmera segue a bola, depois a raquete, zoom no suor, narração calma, ela fala direto
   pra câmera, câmera se afasta no final.
5. Arco: contexto/isolamento (world building) → esforço focado (a ação) → recompensa/reafirmação
   (testemunho + volta ao mundo).
6. Sobrevive sozinha: sim — mesmo a Cena 3 isolada ("eu amo a raquete muralha", câmera se afasta)
   já comunica a relação pessoal com o produto.

### Roteiro 3 — apresentação de personagem (Duda)

1. Objetivo: awareness/afinidade de marca via personagem.
2. O que comunica: quem é a Duda — sua vida, o que ama, com o produto entrando como parte
   natural do dia dela, não como venda.
3. Método: listagem íntima em primeira pessoa — cada coisa que ela ama é revelada em sequência
   (trabalho, pet, produto), como quem te apresenta a própria vida.
4. Como: corte rápido estilo UGC (~14 cortes em 15s), fala direta à câmera, zoom em detalhes
   específicos (bíceps, rosto do cachorro, pote).
5. Arco: quem eu sou (trabalho) → o que eu amo (o pet) → o que não vivo sem (o produto) — cada
   cena revela uma camada nova da mesma pessoa, sem obstáculo/virada clássica, mas com
   progressão real de intimidade.
6. Sobrevive sozinha: sim — mesmo a Cena 2 isolada (ela e o negresco) já comunica algo completo
   sobre quem ela é, mesmo fora do contexto do vídeo inteiro.

## O que isso muda no sistema (mapeamento, não implementação ainda)

Este documento é só o método. A aplicação dele no sistema real é a próxima etapa — mas fica
registrado aqui pra onde ela deve mirar:

- `project-brief.schema.json` hoje tem `o_que_comunica`/`como_comunica` no nível da geração —
  esses dois campos precisam de um terceiro companheiro (`metodo_comunicacao`, a pergunta 3),
  e o `como_comunica` atual deveria estreitar pro sentido da pergunta 4 (execução, não mais
  misturado com método).
- Não existe hoje um `cena-brief` — um objeto com a mesma forma do `project-brief`, por cena,
  que os especialistas leem e auditam junto do brief da geração inteira. As 6 perguntas
  aplicadas por cena são o contrato desse objeto.
- O teste vampiro (`historia.md`, Teste 3) roda hoje só no nível do projeto inteiro. Precisa de
  uma versão por cena.
- O `enredo` já audita causalidade entre cenas (a ordem, o ritmo) — mas não audita se cada cena,
  isoladamente, tem objetivo/mensagem/método nomeados e sobrevive sozinha. Essa auditoria por
  cena é nova.
