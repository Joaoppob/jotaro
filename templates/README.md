# templates/ — scaffolds para começar um projeto novo

Cada pasta `brand-*` é um **molde de projeto** pronto pra copiar. Não são projetos: o
`verify` só confere que existem e têm a forma certa, nunca valida o conteúdo (são
`<placeholders>`).

| Template | Para |
|----------|------|
| `brand-personagem/` | marca com personagem/mascote (ex.: o mago do ExampleHero) |
| `brand-produto/` | produto físico (embalagem, objeto) |
| `brand-servico/` | serviço — identidade visual sem personagem literal |

## Como criar um projeto novo

1. Copie o template do tipo certo para `projects/`, com o nome do seu projeto:
   ```bash
   cp -r "templates/brand-personagem" "projects/MinhaMarca"
   ```
2. Preencha `projects/MinhaMarca/RAG/marca.md` e `RAG/narrativa.md` (troque os `<placeholders>`).
3. Coloque 1 a 4 imagens de referência em `projects/MinhaMarca/RAG/identidade-visual/`.
4. Edite `projects/MinhaMarca/project.json`: ajuste `nome` e troque `status` para `"ativo"`.
5. Valide: `node scripts/validate-rag.cjs --project projects/MinhaMarca`.

Enquanto `status` for `"rascunho"`, o `verify` não bloqueia o projeto incompleto. Ao virar
`"ativo"`, ele passa a ser validado por inteiro (precisa ter refs e o anchor canônico).

O Jotaro pergunta qual projeto gerar a cada fluxo — ele lista os de `projects/`.
