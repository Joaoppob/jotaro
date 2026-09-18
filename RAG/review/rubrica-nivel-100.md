# Rubrica Nível-100 — fonte única de "o que é bom"

> Leitor primário: o agente `critic` (loop de crítica) + os portões humanos (Invariante 7).
> Destilada da pesquisa de benchmark (`references/_pesquisa-nivel-100/benchmark-nivel-100.md`).
> Pesos = ponto de partida calibrado com o time. Esta é a métrica que o sistema otimiza.

## Tese (o que "100" significa)

Premium = **autoridade visual por coerência total** (cognitive fluency: nada faz o olho
tropeçar) + **ausência total de tells de IA**. Não é acúmulo de craft — é restrição e
inevitabilidade. "Cara de barato" é o somatório de micro-erros que o espectador não articula
mas que o faz rolar e descontar a marca. Pontuar = detectar **ausência de tell** E **presença
de escolha deliberada** em cada eixo.

## Os 16 critérios (0 / 50 / 100)

Âncoras condensadas; detalhe completo no dossiê de benchmark.

| # | Critério | 0 | 50 | 100 |
|---|---|---|---|---|
| C1 | Motivação de luz | luz de lugar nenhum, "tarde nublada" default | uma fonte plausível, direção inconsistente | fonte nomeável; direção/cor/spill seguem a lógica |
| C2 | Direção/qualidade de luz | frontal chapada, 2D, sem sombra | lateral fraca, separação parcial | lateral/contra revela textura; chiaroscuro/rim; sujeito descola |
| C3 | Razão de contraste | extremo simétrico (estourado+esmagado) = IA | ok mas genérico | serve o tom (baixa p/ luxo, alta p/ drama) |
| C4 | Paleta/grading | super-saturado video-game, pele laranja, sem grade | razoável mas sat alta / blacks puros | coesa, blacks +3-8%, sat reduzida em highlights, cross sutil |
| C5 | Profundidade de campo | tudo borrado/nítido sem razão | shallow padrão previsível | DoF é escolha: raso isola, profundo dá contexto |
| C6 | Composição/camadas | dead-center, chapado, produto 100% do frame | competente sem profundidade | camadas+paralaxe, leading lines, negative space ativo |
| C7 | Movimento de câmera | aleatório OU "flight simulator" liso | motivado genérico / leve flutuação | cada move serve narrativa; micro-jitter crível |
| C8 | Física do movimento | flutuante, desliza, fumaça surge/some | peso quase sempre, 1 quebra | inércia crível, elementos seguem causa |
| C9 | Textura de superfície | plástico/ceroso, sem poros, "slop" | textura levemente over-smoothed | história física: poros, fibras na luz, micro-variação |
| C10 | Estabilidade temporal | morphing, mãos erradas, flicker, texto garbled | majoritariamente estável, 1 artefato menor | mãos corretas, reflexos coerentes, sem flicker |
| C11 | Continuidade entre cortes | cada corte = outro mundo | geral com 1 quebra | mundo coerente em todos os cortes |
| C12 | Hook (frame 1) | abre com logo/black/fade/establishing lento | sobe energia devagar | frame 1 = interrupt/reveal; loop aberto |
| C13 | Ritmo/micro-pacing | establishing longos, ângulos repetidos | competente, 1-2 momentos longos | remoção implacável; cada corte = nova info |
| C14 | Direção de arte/styling | props aleatórios, set estéril | ok com ruído | restrição: ≤3 props, paleta/wardrobe reforçam marca |
| C15 | Casting/sujeito | rígido, plástico, uncanny, soulless | genérico sem nuance | presença e nuance emocional crível |
| C16 | Coerência global | polido mas "off", snags visíveis | coeso, 1 elemento estranho | nada faz o olho tropeçar; tudo inevitável |

## Pesos e gate

| Grupo | Critérios | Peso |
|---|---|---|
| **Realismo / anti-IA** (gate forte) | C8, C9, C10, C11 | **30%** |
| Luz e cor | C1, C2, C3, C4 | 25% |
| Composição e câmera | C5, C6, C7 | 15% |
| Estrutura de ad vertical | C12, C13 | 15% |
| Direção de arte / sujeito / coerência | C14, C15, C16 | 15% |

**REGRA DE GATE:** qualquer critério do grupo **anti-IA (C8-C11) ≤ 20 → output REPROVADO**,
independente da média ponderada. Um único tell forte (mão morphing, física quebrada, reflexo
errado) anula todo o premium aos olhos do espectador. A pesquisa é unânime nisso.

## Como a rubrica é aplicada (3 altitudes)

1. **Pré-crédito, no PLANO-texto (Tier-1 mecânico `critique.cjs` + Tier-2 `critic` LLM):**
   pontua o que dá pra inferir do plano (roteiro/storyboard/cinematografia/shotlist) SEM gerar:
   C1-C7 (a intenção foi declarada? luz nomeada, composição com razão, DoF deliberado, move
   com propósito), C12-C16 (hook no frame 1, ritmo, restrição de arte, coerência), e os
   **proxies anti-IA**: o prompt evita quality-words que puxam o look plástico, nomeia direção
   de luz (mata o tell de luz chapada), enumera traços do anchor (defende C10). 0 crédito.
2. **Pós-render, no STILL/CLIPE (Tier-3 advisory):** o grupo anti-IA "de verdade" (C8 física,
   C9 textura, C10 estabilidade, C11 continuidade) **só é observável na imagem renderizada** —
   exige geração. O `critic` pontua o still/clipe e dispara o gate. Por isso o gate anti-IA
   **depende de modelo capaz**: no free tier ele pode reprovar sempre (ver crux T3 do ADHD).
3. **Portão humano (Invariante 7):** Portão 1 e 2 apresentam o score + esta checklist junto do
   artefato; o humano aprova contra critérios explícitos, não vibe. Terceiro checkpoint
   advisory após o reel.

## Limites honestos

- **Áudio fora de escopo:** o gerador não tem som hoje; tells de áudio não entram. Mas a
  ausência de som é gap conhecido — o premium faz "metade do trabalho emocional" no som.
- **C11 continuidade é estrutural:** cena gerada isolada quebra continuidade; nenhuma prosa
  conserta — precisa carry de referência / modelo de personagem (`soul_cast`) / end-frame
  chaining. É decisão de arquitetura, não de prompt.
- **Goodhart:** a rubrica é diagnóstica; o portão humano permanece pra evitar que o output
  gameie a métrica (ex.: injetar "film grain" sem qualidade real).
- **Calibração viva:** pesos ajustáveis pelo time conforme rodamos pilotos reais.
