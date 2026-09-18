# projects/ — um projeto por marca

Cada subpasta é um **projeto autocontido**: a identidade da marca, as saídas, o checkpoint e
a trilha de crédito vivem todos dentro dela. Projetos não se misturam — o crédito de um nunca
cai no output de outro.

```
projects/<nome>/
  RAG/
    marca.md              identidade da marca (o que é, público, anchor, estilo, tom)
    narrativa.md          história e arco do reel
    identidade-visual/    1 a 4 imagens de referência (a alavanca de consistência)
  output/
    imagens/ clips/ reels/    saídas geradas (não versionadas)
    .pipeline-state.json      checkpoint de retomada (não versionado)
    .credit-ledger.jsonl      trilha de auditoria de crédito (não versionada)
  project.json            { nome, tipo_marca, status: ativo|rascunho|arquivado }
```

## status (em project.json)

- **ativo** — pronto e validado por inteiro pelo `verify` (precisa de refs + anchor canônico).
- **rascunho** — em construção; o `verify` não bloqueia (refs ainda podem faltar).
- **arquivado** — ignorado pelo scan do `verify`.

## Trocar o projeto do momento

O Jotaro pergunta qual projeto gerar a cada fluxo e confirma antes de gastar crédito — não há
"projeto fixo" escondido. Para um projeto novo, copie um molde de `templates/` (ver
`templates/README.md`).

O produto suporta um demo single-character (um personagem só, refs reais) nesse mesmo formato, mas este repositório público embarca só o demo de biblioteca (`example-brand/`).

`example-brand/` é o **demo de biblioteca multi-personagem** (trio Zara/Theo/Ivy).
