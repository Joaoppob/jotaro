# Checklist de consistencia de personagem

Use depois de gerar imagens, antes de animar. O objetivo e decidir se vale gastar credito de
video ou se uma cena deve ser regerada.

Antes de gerar, use tambem o gate textual:

```bash
node scripts/lib/identity-quality.cjs identity <PROJ>/output/identity-preflight.json
node scripts/lib/identity-quality.cjs shotlist <PROJ>/output/shotlist-preflight.json
```

Ele pega refs ausentes, refs inseguras, anchor generico e mistura de refs por personagem antes
de gastar credito.

## Gate rapido

Uma cena passa se preserva, de forma reconhecivel:

- silhueta geral do personagem ou produto;
- cores principais da marca;
- detalhes distintivos do anchor;
- acessorio, roupa, embalagem ou elemento visual que identifica a marca;
- estilo visual descrito em `RAG/marca.md`;
- formato vertical 9:16 sem corte ruim do sujeito principal.

## Decisao (N = número de cenas do reel; use a fração real, não o /6 fixo)

- **No máximo 1 cena falha (N/N ou (N-1)/N):** seguir para video.
  Ex.: 6/6 ou 5/6 · 4/4 ou 3/4 · 5/5 ou 4/5.
- **2+ falhas, mas a maioria passou (> N/2 boas):** regerar apenas as cenas falhas, mantendo
  refs e anchor. Ex.: 4/6 ou 3/6 · 2/4* · 3/5.
- **Metade ou mais falhou (≤ N/2 boas):** pausar; revisar `RAG/marca.md`, refs e prompt antes
  de gastar mais credito.

> *Em reels curtos (N=4), 2/4 já está no limite — trate como sinal de pausar se as falhas
> forem de identidade (anchor), não de composição.

## Como responder ao usuario

Explique a decisao em linguagem simples: quais cenas passaram, quais falharam e o que sera
ajustado no prompt.
