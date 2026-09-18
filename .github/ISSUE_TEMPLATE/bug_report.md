---
name: Bug report
about: Reporte um problema no gerador (Jotaro)
title: "[bug] "
labels: bug
assignees: ""
---

## Descrição do problema

Descreva o que aconteceu, de forma clara e objetiva.

## Passos para reproduzir

1. Comando ou frase usada (ex.: `/roteiro`, `/gerarvideo`, "quero um vídeo de...")
2. Projeto usado (`example-brand`, o demo embarcado, ou um projeto próprio — se próprio, descreva
   o `tipo_marca` sem anexar material privado)
3. Etapa em que o problema apareceu (intake, Portão -1, especialista, gate, aprovação,
   produção, crítica pós-render)
4. O que você esperava que acontecesse
5. O que aconteceu de fato

## Saída relevante

Se o problema for de gate/validação, cole a saída de:

```bash
node scripts/verify.cjs
```

Se for de execução de um script específico, cole o comando e a saída completa.

## Ambiente

- Versão do Node.js: `node -v`
- Sistema operacional:
- Claude Code: versão/canal
- Higgsfield conectado via: MCP connector / CLI fallback

## Contexto adicional

Qualquer outra informação relevante (screenshots, trecho de manifesto sem dados
sensíveis, etc.). **Não inclua credenciais, tokens ou saldo/conta do Higgsfield.**
