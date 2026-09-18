# Checklist do reel final

> **Legado (0.7):** no 0.7 não há montagem — o vídeo multishot sai pronto do modelo (um job MCP),
> sem `editor-video` nem FFmpeg. Este checklist vale como referência de qualidade do **output
> renderizado**; a crítica pós-render vive em `scripts/lib/post-render-critique.cjs`.

## Verificar

- arquivo final existe em `output/reels/`;
- resolucao e `1080x1920`;
- duracao bate com a soma real dos clipes;
- ordem das cenas segue a narrativa;
- legenda, se usada, aparece no intervalo certo;
- legenda nao cobre rosto, produto ou acao principal;
- o reel fica compreensivel mesmo sem som.

## Entrega

Ao entregar, diga:

- path do reel;
- que os clipes do free sao mudos;
- se houve alguma cena com qualidade limiar;
- proximo passo sugerido: aprovar, regerar cena especifica, ou adicionar trilha fora do
  gerador.
