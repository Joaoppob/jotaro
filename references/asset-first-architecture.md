# Arquitetura asset-first + correção dos 4 erros de um run real de produção

> **⚠️ LEGADO / HISTÓRICO (0.7).** Este documento descreve a arquitetura **asset-first** do
> 0.5/0.6 — seleção de asset por cena, shot-list per-cena, montagem. No **0.7 essa arquitetura
> foi retirada**: a forja produz **um único prompt** (`prompt-forge`) → **um job MCP**, a
> identidade vem da **referência (Element `<<<element_id>>>`)**, não de curadoria per-cena, e
> não há montagem. Continua valendo como **registro histórico** dos 4 erros do run de produção
> e como spec da regra de path-safety `fonte`↔`asset_path` (guard de proteção ainda testado pelo
> verify). Para o fluxo vigente, veja `CLAUDE.md`, `references/team-reference.md` e
> `RAG/prompts/exemplos-prompt-forge.md`.

> Spec canônico (do 0.5/0.6). Pura arquitetura: nada aqui executa o gerador nem gasta crédito.

## Contexto: o que quebrou (run de produção real, 2026-06-26)

Quatro falhas reais, todas com causa-raiz confirmada em evidência:

1. **Abertura seca, sem alma.** O `CLAUDE.md` tem tom/proatividade bons, mas soterrados sob
   a pilha de invariantes e marcados como "espírito, adapte". O modelo comprimiu a alma.
2. **Não-proativo (A2).** O Invariante 3 manda o Jotaro *coletar perguntando*. Não existe
   passo de "leia o material do projeto e proponha antes de perguntar". Com 50 roteiros e um
   dossiê de personas no projeto, ele perguntou o objetivo no escuro.
3. **`/importa` perdeu os rostos (gravíssimo).** `raw-ingest.cjs` lista lotes de forma
   **não-recursiva** (`listLoteFiles`, só `d.isFile()`); subpastas aninhadas de personagem
   são invisíveis ao `plan`. E `finalize` faz `rm -rf` recursivo do lote — ou seja, refs
   aninhadas não só são ignoradas, seriam **destruídas**.
4. **Qualidade péssima (A1/A3).** `.pipeline-state.json` prova: as 6 cenas usaram as MESMAS 2
   refs (os potes `Produto real 01/02`). Nenhum rosto foi enviado. A skill `gera-imagem` lê
   refs **só de `RAG/identidade-visual/`** (pasta plana, máx 4, iguais pra toda cena): não tem
   noção de "qual personagem aparece nesta cena". Funciona pro mago (1 personagem), quebra numa
   marca de 3. E `tem_personagem` ficou `false` com dezenas de rostos no projeto.

## Virada conceitual: gerador → gerador + curador

Quando a marca já chega com uma **biblioteca de personagens pronta e consistente** (uma
marca real, ~16 shots por personagem, on-brand, com product placement correto), **gerar é
desperdício de crédito e perda de qualidade**. O produto passa a ter dois modos, e detecta
em qual está:

- **`biblioteca` (curadoria):** cada beat do roteiro mapeia pra melhor imagem **já existente**
  da personagem certa. Custo de imagem: zero. Consistência: perfeita (é a própria personagem).
- **`geracao` (legado/default):** poucas refs de marca; cada cena é gerada. Se houver múltiplos
  personagens, usa as refs **por personagem** como `--image` (consistência via condicionamento).

O modo é o *default* do projeto; o que **dirige a skill** é o campo `fonte` por cena (uma cena
de um projeto `biblioteca` ainda pode ser `geracao` se nenhum asset servir — o "buraco").

---

## Convenção de pastas (refs por personagem)

```
projects/<proj>/RAG/identidade-visual/
  marca/                 # refs de marca usadas em qualquer cena (produto, logo, paleta)
  <personagem>/          # nina/  lea/  duda/  — shots de referência da personagem
    <arquivo>.png
```

- **Retrocompat:** `identidade-visual/` plano (imagens soltas, sem subpastas) = projeto de
  sujeito único (o mago). Todas as imagens são o "elenco". Continua válido.
- **Multi-personagem:** subpastas nomeadas por personagem. O nome da subpasta é a chave de
  personagem usada em `storyboard.personagem` e na resolução de refs.
- `/importa` roteia uma subpasta-de-imagens aninhada do Raw para `identidade-visual/<nome>/`.

---

## Frente 1 — `/importa` recursivo + cofre de dados (corrige #3)

### `scripts/raw-ingest.cjs`

1. **`plan` recursivo.** `listLoteFiles` passa a ter um modo recursivo que desce em subpastas
   do lote. Cada arquivo vem com seu subpath relativo ao lote (`subdir`), e a classificação
   por extensão se mantém. Saída do `plan` por lote ganha, além de `arquivos`, um agrupamento
   `subpastas: [{ nome, n_imagens, n_textos, n_outros }]` para o Jotaro reconhecer um conjunto
   de personagem (subpasta majoritariamente de imagens) e propor o destino `identidade-visual/<nome>/`.
   - Guard MAX_PATH: subpaths longos continuam sob o limite de nome já existente; validar o
     componente final como hoje (`validProjectName` não se aplica a arquivo, mas manter o teto
     de comprimento por componente para Windows).
2. **`move` aninhado.** Já aceita path arbitrário via `resolveInside` (profundidade livre, path-safe).
   Nenhuma mudança de segurança necessária; só passa a ser exercido com `--de Raw/<tema>/<sub>/x.png`
   e `--para projects/<proj>/RAG/identidade-visual/<sub>/x.png`.
3. **`finalize` à prova de apagar não-movido (o cofre).** Hoje `finalize` checa sobras com
   `listLoteFiles` **não-recursivo** → um lote com imagens aninhadas remanescentes é visto como
   "vazio" e sofre `rm -rf`. CORRIGIR: a checagem de sobras passa a ser **recursiva**. Se
   QUALQUER arquivo não-esqueleto sobrar em qualquer profundidade, `finalize` **recusa apagar**,
   retorna `ok:false` e lista `sobraram` (com destaque para imagens). `rm` só acontece quando a
   varredura recursiva não acha nenhum arquivo real. Esta é a regra-cofre: **nunca apagar dado
   não-processado.**

### `.claude/commands/importa.md`
- Refletir: o `plan` agora enxerga subpastas; o Jotaro reconhece um conjunto de personagem e
  **mostra no plano** ("achei a personagem `nina` com 16 imagens → vai pra `identidade-visual/nina/`");
  move arquivo a arquivo (inclui os aninhados); e a garantia de que **nada é apagado sem ter sido
  movido** (se o finalize recusar, o Jotaro investiga, não force).

### `scripts/verify.cjs` (checks novos)
- `plan` recursivo enxerga uma imagem aninhada (fixture sintético: `Raw/<tema>/<sub>/x.png`).
- `finalize` recusa apagar um lote com imagem aninhada remanescente (retorna `ok:false`, lista a sobra).
- `finalize` só apaga quando a varredura recursiva está limpa.

---

## Frente 2 — intake lê e sugere (corrige A2) + detecta personagem

### `.claude/commands/roteiro.md`
- Novo **passo 0 da intake: varredura do material.** Antes de perguntar qualquer lacuna, o
  Jotaro lê o que o projeto já tem (`RAG/`): roteiros (`*roteiro*`, `*.md` de roteiro), dossiês
  de persona, biblioteca de personagens (`identidade-visual/<char>/`). Em vez de perguntar no
  escuro, ele **surfa e propõe**: "você tem 50 roteiros prontos e 3 personas (Nina, Lea,
  Duda). Quero te sugerir os 3 ganchos mais fortes — ou você já tem um em mente?". Só depois
  preenche as lacunas que sobraram. Perguntar continua valendo para o que o material não responde.

### `scripts/intake-state.cjs` + `schemas/intake.schema.json`
- `tem_personagem` deixa de ser default `false`: passa a ser **detectado** da presença de
  `identidade-visual/<char>/` com imagens. Nunca gravar `false` quando há biblioteca de personagem.
- Novo campo `modo_visual: "biblioteca" | "geracao"` (default detectado; ver Frente 4).
- `personagens: [string]` — nomes detectados da biblioteca (chaves de subpasta).

### `scripts/prestart.cjs`
- Incluir na leitura de situação a contagem de personagens/biblioteca por projeto (alimenta o
  passo 0 da intake e a detecção de modo).

---

## Frente 3 — alma do Jotaro (corrige #1)

### `CLAUDE.md`
- **Front-load.** Mover/realçar Tom + Proatividade + Abertura para que a alma não fique
  soterrada sob os 7 invariantes. A energia é **piso, não teto**.
- O molde de abertura deixa de ser "espírito, adapte à vontade" e passa a ter um **exemplo
  concreto do nível de energia esperado** como referência obrigatória (calorosa, institucional,
  apresenta-se, descreve o sistema em alto nível, mostra o quadro, oferece caminhos, fecha com
  pergunta). "Adapte ao estado" continua, mas **sem permissão pra comprimir a alma**.
- Sem em-dash no texto corrido (preferência do projeto). Tom institucional do produto.

> Restrição de escopo: NÃO enfraquecer scope/recusa/anti-jailbreak nem os invariantes. A alma
> é aditiva à segurança, como o Invariante 7 é aditivo aos 1-6.

---

## Frente 4 — asset-first / curadoria (corrige A1/A3, o coração)

### `schemas/storyboard.schema.json` (campos novos por cena)
```jsonc
{
  "cena": 1,
  "beat": "...",                       // já existe
  "personagem": "nina",               // NOVO: chave de personagem | "trio" | null
  "fonte": "biblioteca",               // NOVO: "biblioteca" | "geracao"
  "asset_path": "RAG/identidade-visual/nina/zoe_05_....png", // NOVO: obrigatório quando fonte=biblioteca
  "o_que_aparece": "...", "mood": "...", "quem_em_quadro": "..." // já existem
}
```
- Regra: `fonte=biblioteca` exige `asset_path` (existente, dentro de `RAG/identidade-visual/`);
  `fonte=geracao` exige `asset_path:null` e deixa o prompt pro `prompt-smith`.

### `.claude/agents/storyboard-director.md`
- Recebe, além de roteiro+identidade+plataforma, o **inventário de assets** por personagem
  (lista de paths de `identidade-visual/<char>/`). Para cada beat: escolhe a personagem,
  **seleciona o melhor asset existente** pelo nome semântico do arquivo (ex.: beat "café com
  notebook" → `zoe_05_cafe_artesanal_notebook_pote_mesa.png`) e marca `fonte:biblioteca` +
  `asset_path`. Só quando nenhum asset serve, marca `fonte:geracao` (o buraco) e descreve o
  visual a gerar. Continua folha (Read/Glob/Grep), não gera nada.

### `schemas/shotlist.schema.json` (campos novos por cena)
- `fonte: "biblioteca" | "geracao"`.
- `biblioteca`: `{ cena, fonte, personagem, asset_path, salvar_em }` (sem prompt).
- `geracao`: `{ cena, fonte, personagem, prompt, referencias_obrigatorias:[paths por personagem], salvar_em }`.
- O exemplo `exemplo-shotlist-mago.json` (sujeito único, `geracao`) precisa continuar válido:
  `fonte` default `"geracao"`, `personagem` opcional/nulo no caso de sujeito único. Adicionar os
  campos como opcionais com default que preserve o mago.

### `.claude/agents/prompt-smith.md`
- Cena `biblioteca`: **pass-through** — repassa `asset_path`/`personagem`/`salvar_em`, sem prompt.
- Cena `geracao`: monta o prompt forte (como hoje) E resolve `referencias_obrigatorias` para as
  refs **da personagem da cena** (`identidade-visual/<char>/...`) + refs de marca. Não mistura
  personagens.

### `.claude/skills/gera-imagem/SKILL.md` (passa a "produzir a imagem da cena")
- Branch por `fonte`:
  - **`biblioteca`:** seleção, não geração. Copia `asset_path` → `output/imagens/cena-NN-tag.png`
    (com guard de download/cópia e save-crystal). `job_id: "selected-from-library"`,
    **0 créditos, sem entrada no ledger**. Idempotência igual.
  - **`geracao`:** como hoje, mas as refs vêm de `referencias_obrigatorias` (por personagem),
    não da pasta plana. Sobe as refs da personagem da cena como `--image`. 2 cr.
- Descrição da skill atualizada: "seleciona da biblioteca OU gera a imagem da cena".

### `.claude/skills/gera-video/SKILL.md`
- Aceitar **still local como start-frame** além do `job_id` gerado:
  - cena veio da biblioteca (sem job Higgsfield) → sobe o still local (`higgsfield upload create`)
    e usa como `--start-image`/`--image` no image-to-video.
  - cena gerada → reusa o `job_id` como hoje (sem re-upload).
- Custo de vídeo inalterado (4 cr com `--duration 4`).

### Detecção de modo (`modo_visual`) e confirmação
- Auto-detecta: projeto com `identidade-visual/<char>/` populado (biblioteca real) → default
  `biblioteca`; senão → `geracao`. Gravado no `project.json` (`schemas/project.schema.json` ganha
  `modo_visual` opcional) e/ou intake. **O Jotaro confirma com o usuário** antes de seguir
  ("seu projeto já tem biblioteca de personagens; eu monto o reel selecionando dela, sem gastar
  crédito de imagem — fechado?"). Sem flag manual obrigatório.

### `CLAUDE.md` (documentar os dois modos)
- Seção "O que o gerador faz": explicar curadoria vs geração e a detecção. Ajustar o Invariante 1
  (preflight) pra contar custo real por modo (biblioteca → 0 de imagem). Ajustar Invariante 2
  (RAG check) pra entender refs por personagem (não só a pasta plana).

### `scripts/verify.cjs` (checks novos)
- `storyboard.schema`/`shotlist.schema`: `fonte=biblioteca` exige `asset_path` válido; `geracao`
  exige refs. Exemplo do mago continua validando.
- `asset_path` resolve dentro de `RAG/identidade-visual/` (path-safety, sem escapar do projeto).
- Resolução de refs por personagem: uma cena de `nina` puxa refs de `identidade-visual/nina/`.

---

## Princípio sobre limites (decisão do projeto)

Nenhum limite pode capar o que o usuário cria. Todo limite duro tem que **proteger de um dano
real** ou **refletir uma restrição real do mundo**, e tem que ser honesto sobre qual dos dois é.
Um cap silencioso que só trunca expressão (ex.: `maxItems` em referências) reprova nesse teste.
Três famílias:

1. **Teto de criação (proibido).** Capa o que se pode expressar sem proteger nada. Removidos:
   `maxItems:3` em `shotlist.referencias_obrigatorias` e em `identity.refs`, e a guia "1-4 refs"
   na prosa. Junto, o `pattern` de `identity.refs` foi solto para aceitar subpasta por personagem
   (`identidade-visual/<char>/...`), fechando uma lacuna do asset-first no contrato do `rag`.
2. **Piso de completude (mantido).** `minItems:1`, `minLength`, `minimum` garantem que o campo
   não venha vazio ou raso. É a favor da qualidade, não contra. Não são tetos.
3. **Guard-rail de proteção e restrição do mundo (mantidos).** Path-safety, regra-cofre do
   finalize, guard de arquivo não-vazio, não-gerar-sem-confirmar-custo, anti-jailbreak, o bound
   no conteúdo não-confiável da web (`pesquisa.schema` `maxItems:5` + `trecho<=500`, vetor de
   maior risco), e o teto free do Higgsfield (restrição externa). Esses protegem ou refletem o
   mundo; removê-los expõe o usuário, não o liberta.

Pendência honesta: se o próprio `nano_banana_2` limitar o número de `--image` por geração, isso
é restrição do mundo e deve ser **documentada**, não capada em silêncio. Verificar contra o CLI
quando formos rodar, em vez de assumir.

## Invariantes da reescrita (não quebrar)

- **Zero execução do gerador.** Nada nesta frente roda Higgsfield nem gasta crédito.
- **Gate verde.** `node scripts/verify.cjs` continua passando; cada frente ADICIONA checks.
  O exemplo do mago (sujeito único, modo geração) continua válido em todos os schemas.
- **Segurança intacta.** scope-guard, anti-jailbreak, path-safety do raw-ingest, fronteira da
  pesquisa-web: nada enfraquece. A regra-cofre do finalize FORTALECE a segurança de dados.
- **Retrocompat.** Projeto de sujeito único (mago) segue funcionando em modo `geracao` com a
  pasta plana. Os campos novos são aditivos com default que preserva o legado.
- **Sem em-dash** no texto corrido novo; voz institucional do produto.
