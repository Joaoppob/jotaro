---
description: Recebe uma pergunta livre ("como faço X?") e devolve um how-to guiado, passo a passo.
argument-hint: "[o que você quer fazer]"
---

# /comofazer

O usuário quer saber como fazer algo específico. A pergunta vem no argumento. Dê um how-to
guiado, em passos numerados, que ele consiga seguir.

## Antes de responder

Entenda o estado do sistema, para o how-to bater com a realidade dele:
- Qual projeto em `projects/`? `projects/<projeto>/RAG/identidade-visual/` tem imagens?
  `projects/<projeto>/RAG/marca.md` está preenchido?
- Higgsfield conectado (connector MCP)? O Element da personagem já existe?
- Há um run em andamento (`projects/<projeto>/output/.pipeline-state.json`)?

Se faltar um pré-requisito para o que ele quer, diga isso primeiro e aponte o passo que
resolve. Não dê um how-to que vai esbarrar num bloqueio no meio.

## Como montar a resposta

1. Repita em uma linha o que entendeu que ele quer (confirma o entendimento).
2. Liste o pré-requisito que falta, se faltar (e como resolver).
3. Dê os passos numerados, cada um uma ação concreta.
4. Aponte o comando ou a fala que dispara cada passo.

## Mapa de objetivos comuns

- **"Como crio uma marca nova?"** Copie o molde do tipo certo de `templates/`
  (`brand-personagem`/`brand-produto`/`brand-servico`) para `projects/<sua-marca>/`, preencha
  o `RAG/`, ponha as refs que a marca tiver (uma ou mais, quantas precisar; em projeto
  multi-personagem, uma subpasta por personagem em `RAG/identidade-visual/<personagem>/`) e
  troque o `status` do `project.json`
  para `"ativo"`. Detalhe em `templates/README.md`.
- **"Como troco o personagem do exemplo pelo meu?"** Não mexa no demo example-brand — crie um
  projeto novo (acima). Se quiser mesmo reaproveitar, copie `projects/example-brand/` para um
  nome seu, troque as imagens em `RAG/identidade-visual/` e reescreva `RAG/marca.md` e
  `RAG/narrativa.md` mantendo os títulos de seção.
- **"Como gero só uma imagem de teste?"** Use `/gerarimagem`, escolha o projeto e descreva a
  cena. Eu forjo o prompt (formato imagem), confiro o custo do job, gero via Higgsfield, e mostro
  onde salvei.
- **"Como faço um vídeo completo?"** Use `/gerarvideo`. Eu pergunto o projeto, confiro as imagens
  da RAG dele, conduzo a forja do prompt único (com os três portões), confiro o custo do job, e
  produzo o vídeo multishot num só job no Higgsfield.
- **"O vídeo pode ter locução?"** Pode. Quando o formato é `video` (não `video_mudo`), o
  prompt-forge leva uma locução cronometrada, gerada como áudio no Higgsfield junto do vídeo.
- **"Como retomo um vídeo que parou no meio?"** Rode `/gerarvideo` de novo e escolha o mesmo
  projeto. Se eu achar um run em andamento nele, pergunto se você quer retomar de onde parou
  (reaproveitando o prompt já forjado, sem refazer a Etapa 1).

Se a pergunta não cair em nenhum desses, monte o how-to do zero seguindo a estrutura acima.
