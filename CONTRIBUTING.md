# Contribuindo

Obrigado pelo interesse em contribuir com o **Jotaro Video Generator**. Este
documento cobre o essencial para abrir uma issue ou um pull request.

## Setup de desenvolvimento

```bash
git clone <url-do-repositorio>
cd jotaro-video-generator
./setup.sh
```

Requisitos: Node.js >= 18 (o CI roda em Node 20). O projeto é CommonJS puro, sem
dependências externas — não há `npm install` a fazer.

Antes de abrir um PR, rode o verificador do produto:

```bash
node scripts/verify.cjs
```

Ele roda centenas de checks: sintaxe de todos os `.cjs`, contratos de schema
(`schemas/*.schema.json`), os gates mecânicos do pipeline (Wave 4-9), RBAC dos agentes,
e a estrutura dos projetos demo. Um PR que quebra `verify.cjs` não é aceito.

## Fluxo de branch e PR

1. Crie um branch a partir de `main` com um nome descritivo (`feat/...`, `fix/...`, `docs/...`).
2. Faça commits pequenos e focados.
3. Rode `node scripts/verify.cjs` localmente antes de abrir o PR.
4. Abra o PR com uma descrição do que mudou e por quê. Se alterar comportamento do
   pipeline (agentes, gates, schemas), descreva o efeito observável.
5. O CI (`.github/workflows/verify.yml`) roda `npm test` automaticamente em cada PR.

## Convenção de commit

Este projeto usa **Conventional Commits**:

```
tipo(escopo): descrição curta no imperativo

fix(gates): corrige validacao de essentialism-diff em manifesto vazio
feat(agentes): adiciona especialista de audio a cadeia da Fase 2
docs(readme): atualiza instrucoes de setup do Higgsfield
test(scripts): cobre preflight-gate-0.8 com fixture de cena sem brief
```

Tipos comuns: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`. O escopo (entre
parênteses) é opcional, mas ajuda a localizar a mudança (ex.: `gates`, `agentes`,
`schemas`, `readme`).

## Estilo de código

- **CommonJS puro** (`require`/`module.exports`), sem ESM, sem TypeScript.
- `const` sobre `let`; nunca `var`.
- Nomes de arquivo em `lowercase-com-hifen.cjs`.
- Scripts e hooks ficam em `scripts/` (helpers reutilizáveis em `scripts/lib/`).
- Agentes, comandos e skills são Markdown com frontmatter YAML, em `.claude/agents/`,
  `.claude/commands/` e `.claude/skills/`.
- Todo hook deve sair com `exit 0` em erros não-críticos — nunca travar o Claude Code
  por um problema secundário.

## Estrutura do que pode ser alterado

- **`scripts/`, `scripts/lib/`**: lógica determinística (gates, validadores, helpers).
  Mudanças aqui precisam de teste correspondente (o `verify.cjs` é o test runner).
- **`.claude/agents/`, `.claude/commands/`**: a definição de cada agente/comando do
  Jotaro (Markdown + frontmatter). Mudar aqui muda o comportamento conversacional.
- **`schemas/`**: contratos JSON Schema que os gates validam. Mudança de schema exige
  atualizar os validadores e os testes que dependem dele.
- **`projects/example-brand/`**: o demo embarcado versionado —
  mudanças aqui devem manter o projeto rodável como referência.
- **`templates/`**: moldes em branco para novos projetos de marca.

Não é necessário (nem esperado) editar `CLAUDE.md` para adicionar uma feature pequena —
ele é a fonte de verdade da arquitetura e só muda quando a arquitetura muda de fato.

## Relatando problemas

Abra uma issue usando os templates em `.github/ISSUE_TEMPLATE/`. Para bugs, inclua:

- O comando ou fluxo que você rodou (`/roteiro`, `/gerarvideo`, etc.).
- A saída de `node scripts/verify.cjs` se o problema for de gate/validação.
- Se possível, o projeto de exemplo usado (`example-brand`, o demo embarcado) para reproduzir
  sem depender de material privado.

Não inclua credenciais, tokens ou saldo/conta do Higgsfield em issues públicas.

## Usando Claude Code

Este repositório é pensado para ser trabalhado dentro do **Claude Code**. Ao abrir a
pasta, o Claude Code carrega `CLAUDE.md` automaticamente e você já fala com o Jotaro
(o agente de produto). Para trabalhar no *código* do gerador (agentes, gates, schemas),
descreva a mudança técnica desejada — o `CLAUDE.md` documenta toda a arquitetura, o RBAC
(`.claude/rbac.md`) documenta quem pode chamar quem, e `plano-jotaro-0.8.md` documenta o
histórico de decisão por wave.
