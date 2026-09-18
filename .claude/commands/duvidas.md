---
description: Jotaro responde dúvidas sobre o sistema, o fluxo, custos e como tudo funciona.
---

# /duvidas

O usuário tem uma dúvida sobre o gerador. Responda com clareza, sem jargão, de quem nunca
mexeu nisso.

## Antes de responder

Entenda o estado do sistema para responder com precisão:
- Quais projetos existem em `projects/` e qual o usuário tem em mente? (cada marca é um projeto)
- O `projects/<projeto>/RAG/identidade-visual/` tem imagens? (afeta "posso gerar agora?")
- O Higgsfield está conectado? (afeta "por que não gera?")
- Existe `projects/<projeto>/output/.pipeline-state.json`? (afeta "tenho um run em andamento?")

Use o que for relevante à pergunta. Não despeje diagnóstico que ninguém pediu.

## Dúvidas comuns e como responder

- **"Quanto custa?"** O custo é do **job único** (um prompt → um job), não uma soma por cena.
  O número real vem do Higgsfield (`get_cost`) quando o prompt estiver forjado — dá pra ver sem
  gastar, é só rodar `/simular`. Sempre confiro o custo antes de gerar e nunca invento preço.
- **"Por que preciso do Higgsfield?"** É o serviço que gera os vídeos e as imagens. Sem ele
  conectado (via connector MCP), eu não consigo gerar nada. A conexão é por conta do usuário, sem
  segredo guardado no projeto.
- **"Onde coloco minhas imagens?"** Em `projects/<seu-projeto>/RAG/identidade-visual/`. De 1 a
  4 imagens do mesmo personagem ou produto. São o que mantém a cara igual entre as cenas. (Cada
  marca é um projeto; pra começar uma nova, copie um molde de `templates/`.)
- **"Por que ele fica igual entre os shots?"** Porque a personagem entra ancorada numa
  **referência forte** — o Element do Higgsfield, montado a partir das suas imagens. É o Element
  que carrega o rosto e o corpo; a identidade não depende de descrever traços no texto.
- **"O vídeo tem som?"** Pode ter: quando o formato é `video` (não `video_mudo`), o prompt-forge
  pode levar locução cronometrada, gerada via áudio no Higgsfield. Se você quiser mudo, é o
  formato `video_mudo`.
- **"Posso usar para outra coisa que não jogo?"** Sim. Os moldes cobrem produto e lifestyle
  também (e-commerce, serviço). Crie um projeto novo a partir do molde do tipo certo em
  `templates/` (`brand-produto`, `brand-servico`).

## Se a dúvida for sobre setup ou erro

Conduza pelo protocolo certo: configuração inicial → `/setup`; saldo e plano → `/creditos`;
como fazer uma coisa específica → `/comofazer`. Não jogue o comando no colo do usuário e
pare; se for algo que você consegue conduzir agora, conduza. Peça confirmação só quando
houver custo de crédito.
