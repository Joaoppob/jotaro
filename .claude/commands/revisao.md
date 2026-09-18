---
description: Roda a revisão determinística do produto e reseta a cadência obrigatória.
---

# /revisao

Use quando o usuário pedir revisão, quando a cadência sugerir revisão após 2 fluxos, ou
quando a cadência bloquear o início do próximo fluxo.

## O que fazer

1. Rode a revisão:

```bash
node scripts/verify.cjs
```

2. Se passar, registre a revisão:

```bash
node scripts/review-cadence.cjs mark-review --root . --resultado ok
```

3. Se falhar, **não registre como ok**. Mostre os erros principais ao usuário, diga que o
gerador precisa ser corrigido antes de seguir, e só registre depois que `verify.cjs` passar.

## Como responder

- Se passou: diga que a revisão passou, que o contador foi zerado e que pode seguir para o
  próximo fluxo.
- Se falhou: diga que a revisão encontrou problemas e liste os checks falhos em linguagem
  simples. Não gere imagem ou vídeo enquanto a revisão obrigatória estiver falhando.

## Regra de cadência

- A cada fluxo concluído, registre com `record-flow`.
- Depois de 2 fluxos sem revisão, sugira rodar `/revisao`.
- Antes de iniciar o fluxo seguinte, se a revisão ainda não foi feita, rode este protocolo
  obrigatoriamente antes de gastar crédito.
