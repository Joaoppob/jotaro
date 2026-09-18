---
description: Pré-início da sessão — leitura de situação (Raw, projetos, setup) antes de perguntar o que criar. Roda automático na abertura e re-invocável a qualquer momento.
---

# /inicio

Use no começo da sessão (ou quando a pessoa pedir "panorama", "situação", "por onde começo",
"o que dá pra fazer") pra fazer uma **leitura de situação** antes de perguntar. Em vez de abrir
no genérico, você primeiro **olha o estado real** — o que tem no `Raw/`, quais projetos existem,
se o setup está pronto — e só então monta um **quadro de situação** e pergunta a intenção da
sessão. É orientação pura: **nada de geração, nada de custo aqui**.

Esta é a mesma leitura que roda **automática na primeira mensagem da sessão** (ver a seção
"Onboarding (proativo)" do CLAUDE.md); o `/inicio` existe pra **re-rodar** isso quando a pessoa
quiser um novo panorama.

## Fluxo

### 1. Leitura determinística (filesystem) — `prestart.cjs`

Rode o agregador puro, que lê Raw + projetos + perfil de uma vez:

```bash
node scripts/prestart.cjs --root .
```

Devolve:

```
{
  "raw": { "tem_conteudo": <bool>, "lotes": [{ tema, n_arquivos, n_imagens, n_textos, n_outros }] },
  "projetos": [{
    nome, tipo_marca, status,
    personagens: [nome], tem_biblioteca, modo_visual,
    elenco: [{ nome, n_refs }], n_refs_plano,
    conteudo: { n_roteiros, tem_intake, tem_shotlist, n_imagens, n_clipes, n_reels }
  }],
  "perfil": { "primeira_vez": <bool>, "expert": <bool> }
}
```

- **raw**: o que está esperando na caixa de entrada `Raw/` (cada lote = um tema; um projeto em
  potencial). `tem_conteudo:false` = Raw vazio.
- **projetos**: as marcas/campanhas já montadas em `projects/`, com tipo e status (`ativo` =
  pronto pra gerar; `rascunho` = em construção). **Agora vem com conteúdo, não só metadados:**
  - **elenco**: personagens da biblioteca com contagem de refs (`[{nome, n_refs}]`) — use pra
    abrir proativo ("vi que o <projeto> tem Duda com 16 refs, Lea com 15...").
  - **n_refs_plano**: refs soltas na pasta plana (sujeito único, ex.: o mago).
  - **conteudo**: `n_roteiros` (roteiros/storyboards que a marca trouxe ou o pipeline salvou),
    `tem_intake`/`tem_shotlist` (onde o pipeline parou) e `n_imagens`/`n_clipes`/`n_reels`
    (o que já foi gerado). Use pra dizer onde retomar ("o reel tem 5 cenas geradas, faltam 1").
- **perfil**: `primeira_vez:true` = pessoa nova (guie do zero); `expert:true` = modo enxuto.

**Proatividade-sobre-conteúdo (obrigatório):** quando houver projeto ativo, não pergunte no
escuro. Reporte o elenco e os roteiros que o `prestart` devolveu e ofereça os caminhos:
"Certo! No <projeto> a gente tem <personagens com refs> e <n_roteiros> roteiros — quer continuar
um deles ou começar algo novo?". É o exemplo canônico da proatividade que a marca espera.

Este script é **puro** (só filesystem, sem rede). Os sinais de **setup** vêm no passo 2.

### 2. Sinais de setup (runtime — não trava se faltar)

Colete os sinais que dependem de ambiente/rede, com a mesma lógica do `/setup` e do `/creditos`.
**Não bloqueie** se algo faltar — só sinalize no quadro e aponte pro `/setup`:

- **Higgsfield conectado?** Confira o saldo com a tool `mcp__higgsfield__balance`. Se devolver o
  saldo, a conexão está ok e você já sabe o **saldo** (a conta que vai pagar). Se não retornar,
  marque o setup como **pendente** e aponte pro `/setup` (conectar o Higgsfield). No fallback CLI,
  `higgsfield account status` também serve.

Este sinal **não** entra no `prestart.cjs` de propósito (ele é puro/testável sem rede). O quadro
final é a soma do JSON do passo 1 com o que você coletou aqui.

### 3. Monte o QUADRO DE SITUAÇÃO (no seu tom)

Apresente um panorama curto, caloroso e concreto — ancorado no estado real, não em texto fixo.
Cubra os três blocos:

- **Raw:** "tem material esperando no Raw: tema **<tema>** (N arquivos: X imagens, Y textos)" —
  ou, se `tem_conteudo:false`, "o Raw está vazio por enquanto".
- **Projetos:** liste os projetos com status: "projetos: **<A>** (ativo), **<B>** (rascunho)" —
  ou, se não houver nenhum, "ainda não tem nenhum projeto montado".
- **Setup:** "setup: Higgsfield conectado (saldo **<N>**)" — ou, se estiver pendente, "setup
  pendente: Higgsfield desconectado — a gente resolve com o `/setup` antes de gastar qualquer
  crédito".

Adapte pelo **perfil**:

- `primeira_vez:true` → tom de boas-vindas, guia do zero, ofereça o tour (`/tutorial`) e o setup
  primeiro. Não despeje o manual; engaje.
- `primeira_vez:false` → "bom te ver de novo!" e vá direto pro "o que vamos criar hoje?".
- `expert:true` → quadro mais enxuto, menos explicação, mais direto ao ponto.

### 4. Pergunte a intenção e ofereça os caminhos certos PRO ESTADO

Sempre termine com uma pergunta (regra de ouro). Ofereça os caminhos que **fazem sentido pro
estado atual**, não uma lista genérica:

- **Tem material no Raw** → ofereça `/importa` ("quer que eu organize esse material num projeto?").
- **Tem projeto ativo** → ofereça `/roteiro` (começar a Etapa 1) ou `/gerarvideo` / `/gerarimagem`
  ("a gente já começa um roteiro pro **<projeto>**, ou parte pra um reel?").
- **Setup pendente** → ofereça `/setup` antes de qualquer geração.
- **Nada montado (sem Raw, sem projeto)** → ofereça criar um projeto novo (seção "Projetos" +
  `templates/README.md`) ou um tour sem custo (`/tutorial`).
- **Primeira vez** → ofereça o tour guiado (`/tutorial`) e o setup, com calma.

### 5. Conduza pro fluxo escolhido

Depois que a pessoa escolher, **conduza** pro fluxo correspondente (o roteiro de cada um está
no seu arquivo em `.claude/commands/`). Aqui no `/inicio` você só orienta — a geração e o custo
vivem nos comandos de produção, sempre com os 7 invariantes (preflight, confirmação de projeto e
de custo) no caminho.

## Regras

- **Estado primeiro, pergunta depois.** Leia (`prestart.cjs` + sinais de setup) antes de oferecer.
- **Nada de geração nem custo aqui.** `/inicio` é orientação; quem gera são os comandos de produção.
- **Não trave por setup faltando.** Sinalize e aponte pro `/setup`; a leitura de situação sempre
  acontece.
- **Sempre feche com uma pergunta.** A regra de ouro do Jotaro vale aqui também.
