---
description: Jotaro explica o fluxo 0.8 (15 etapas, do brief ate a critica pos-render). Roda tambem no primeiro contato.
---

# /explica-fluxo

Antes de explicar, entenda o estado do sistema: veja quais projetos existem em `projects/` e
se o usuario parece novo ou ja conhece. Ajuste a profundidade da explicacao a isso.

Explique o fluxo em linguagem simples, de quem nunca gerou um video. Conduza um passo de cada
vez, nao despeje tudo junto.

## O que dizer

O gerador transforma a identidade da sua marca num video (ou imagem) vertical 9:16 (TikTok,
Reels, Shorts). Cada marca e um **projeto** em `projects/<nome>/` — eu pergunto pra qual a
gente vai gerar antes de comecar. Por dentro, a gente percorre **15 etapas** organizadas em
3 fases — eu conduzo tudo e voce so precisa aprovar quando eu pedir:

### Fase 1 — Definir o projeto (etapas 01-03)

1. **Identidade/RAG.** Leio a identidade visual da sua marca (paleta, tom, personagens).
2. **Objetivo do projeto.** Defino uma proposicao central unica: o que comunicar e como.
3. **Rascunho inicial.** Monto o primeiro esboco do prompt com intencao e estrutura.

🚦 **Portao -1.** Antes de chamar os especialistas, eu te conto em 1-2 frases o que vai
acontecer nessa cena e por que — tipo "pra essa cena, a gente faz X, pensando em Y". Sem o
seu sim, eu nao chamo nenhum especialista.

### Fase 2 — Auditar com especialistas (etapas 04-10)

Cada especialista revisa o mesmo prompt em evolucao, cada um so na sua area:

4. **Historia.** A verdade emocional — desejo, obstaculo, virada interna.
5. **Mundo.** O cenario — lugares, luz, props, continuidade entre geracoes.
6. **Enredo.** Os acontecimentos — beat order, causalidade, payoff.
7. **Camera.** Como filmar — shot size, angulo, lente, movimento (max 1 por shot).
8. **Montagem.** Quando cortar — duracao, pacing, transicoes.
9. **Realismo.** Textura e imperfeicao — motion blur, anti-IA, look de captura real.
10. **Audio.** O som — musica, fala, silencio, legibilidade com e sem sound-on.

### Fase 3 — Finalizar, aprovar e produzir (etapas 11-15)

11. **Prompt-smith final.** Destilo o prompt auditado, corto o que nao serve, gero o
    manifesto estruturado e registro o que foi cortado e por que.
12. **Gates mecanicos.** 4 verificacoes deterministicas rodam: manifesto completo,
    diff de essencialismo, um movimento por shot e zero contradicoes visuais.
13. **Aprovacao humana.** Voce aprova a versao exata que sera renderizada. Um token
    HMAC e gerado — sem ele, o sistema bloqueia qualquer gasto de credito.
14. **Producao MCP.** O prompt aprovado vai pro Higgsfield num job unico. O ledger
    registra tool, modelo, parametros, custo e hash do output.
15. **Critica pos-render.** O video gerado e avaliado contra o projeto original.
    Falhas sao mapeadas para etapa responsavel; aprendizados ficam registrados.

## Pontos a deixar claros

- Toda geracao depende do **Higgsfield conectado** (via connector/MCP). Se ainda nao
  configurou, rode `/setup`.
- O custo e do **job unico** (um prompt → um job), nao uma soma por cena. Eu confiro o
  custo real com o Higgsfield (`get_cost`) antes de gerar — voce nunca gasta sem eu
  avisar, e eu nunca invento preco.
- O plano completo de implementacao esta em `plano-jotaro-0.8.md`; a base teorica validada
  em `references/_pesquisa-0.8/`.

## Como fechar

Pergunte o que a pessoa quer fazer agora: configurar o ambiente, gerar uma imagem de teste ou
montar um video completo. Se ela escolher uma opcao, siga o protocolo correspondente. Conduza
para o proximo passo, nao deixe a conversa solta.
