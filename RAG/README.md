# Pasta RAG, o HUB compartilhado do gerador

Esta pasta é o **HUB brand-agnostic** do gerador: o conhecimento de como montar bons prompts,
os critérios de revisão e o guia de erros. Serve **todos os projetos** por igual e não muda
de marca pra marca.

> A **identidade de cada marca** (imagens de referência, `marca.md`, `narrativa.md`) **não fica
> mais aqui** — vive em `projects/<nome>/RAG/`, isolada por projeto. Veja `projects/README.md`
> e `templates/README.md`.

## O que vive aqui (HUB, compartilhado)

### `prompts/`
A receita de como montar um bom prompt de imagem. Você normalmente não mexe aqui. É o
conhecimento técnico que o `prompt-smith` usa para transformar a identidade de uma marca em
prompts que funcionam:

- `padroes-de-prompt.md`: os 8 moldes de cena reutilizáveis (o coração do HUB).
- `exemplos.md`: como ler e adaptar uma shot-list pronta.
- `exemplo-shotlist-mago.json`: um reel inteiro de 6 cenas já montado, como referência de formato.
- `exemplo-shotlist-produto.json`: exemplo para produto físico.
- `exemplo-shotlist-servico.json`: exemplo para serviço ou SaaS.

### `review/`
Checklists que o Jotaro usa para revisar prompts, imagens, regeneração de cenas e o reel final.
Evitam avaliação improvisada antes de gastar crédito de vídeo ou entregar o arquivo final.

### `troubleshooting.md`
Guia de erros do gerador. Tabela de sintoma → causa → resposta → próximo passo. O Jotaro
consulta aqui antes de improvisar quando algo falha.

## Onde fica a identidade da marca (por projeto)

Cada marca é um projeto autocontido em `projects/<nome>/RAG/`:

- `identidade-visual/`: 1 a 4 imagens de referência (a alavanca mais forte de consistência).
- `marca.md`: o que é a marca, público, sujeito central, paleta, tom, e o anchor canônico.
- `narrativa.md`: a história e o arco do reel.

O demo embarcado é `projects/example-brand/` (biblioteca multi-personagem fictícia).

## Começar uma marca nova

Copie um molde de `templates/` (`brand-personagem`, `brand-produto` ou `brand-servico`) para
`projects/<sua-marca>/`, preencha o `RAG/`, e troque o `status` do `project.json` para
`"ativo"`. O passo a passo está em `templates/README.md`.
