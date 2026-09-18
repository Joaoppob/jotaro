---
description: Guia o setup de primeira vez: conectar o Higgsfield (MCP connector) e conferir o saldo. O CLI é fallback; FFmpeg não é mais necessário.
---

# /setup

Guie o usuário pela configuração inicial, passo a passo, esperando ele confirmar cada etapa
antes de seguir. É a primeira vez dele: não assuma nada, explique o porquê de cada coisa.
Mantenha o tom animado e proativo — e termine cada passo oferecendo o próximo.

## Passo 0: interface gráfica

Confirme com o usuário que ele está rodando o Claude Code num computador com tela e navegador
(não num servidor sem interface). Conectar/logar o Higgsfield abre uma página no navegador, então
precisa de ambiente gráfico. Se for terminal puro sem GUI, pare aqui: o login não vai funcionar.

## Passo 1: conectar o Higgsfield (MCP connector — primário)

O Higgsfield é o serviço que gera os vídeos e as imagens. No 0.7 a gente usa o **MCP connector**
do Higgsfield: você conecta a conta uma vez no Claude Code, e a partir daí eu produzo (gerar
vídeo/imagem/áudio) e confiro o custo direto pelas tools do Higgsfield, sem senha guardada no
projeto.

### 1a. Conectar

Conecte o Higgsfield no Claude Code (connector do MCP). A conexão é por conta do usuário, via
login no navegador. Depois de conectado, a sessão herda a conta.

### 1b. Confirmar a conexão e a conta

Confira o saldo pela tool do MCP:

```
mcp__higgsfield__balance
```

Se devolver o saldo, está conectado. Eu confiro com você: "conectou com `<N>` créditos — é essa
conta mesmo?". Se for a conta errada, reconecte na conta certa (a que tem os créditos).

### 1c. Fallback CLI (só se o connector não estiver disponível)

Se por algum motivo o connector MCP não estiver ativo, dá pra usar o **CLI** como fallback:

```bash
higgsfield --version        # se "command not found": npm install -g @higgsfield/cli
higgsfield auth login       # abre o navegador; você aprova na conta certa (sem reiniciar)
higgsfield account status   # mostra email, plano e créditos
```

O CLI é caminho de contingência; o primário é o connector MCP. Aliases: `higgsfield`, `higgs`, `hf`.

## Passo 2: conferir o saldo

Rode `/creditos` (ou a tool `mcp__higgsfield__balance`) para confirmar que o Higgsfield responde
e ver o saldo. É um teste de conexão, não gasta crédito.

## Fechamento

Confirme que está pronto: Higgsfield conectado (na conta certa) e saldo conferido. **Não é mais
preciso FFmpeg** — o vídeo multishot sai pronto do Higgsfield, sem montagem por fora. Diga ao
usuário que o próximo passo é escolher (ou criar) um projeto em `projects/` e colocar as imagens
da marca em `projects/<projeto>/RAG/identidade-visual/` (veja `RAG/README.md` e
`templates/README.md` pra começar uma marca nova), e então pedir um vídeo com `/gerarvideo`. Feche
oferecendo: "quer que eu já te mostre os projetos, ou prefere um tour rápido com o `/tutorial`?".

## Se a conexão falhar — ou se você trocar de conta

Esta é a parte que eu resolvo, sem você reiniciar nada:

- **Não conectado / connector caiu:** reconecte o Higgsfield no Claude Code (ou, no fallback, rode
  `higgsfield auth login`), e a gente segue na hora.
- **Você trocou de conta (e o saldo não bateu):** reconecte na conta nova. Eu confiro com
  `mcp__higgsfield__balance` (ou `higgsfield account status` no fallback) que os créditos agora
  são os certos, e a gente dispara o run. Tudo na mesma sessão.
- **Saldo zerado:** toda conta free começa em 0 e repõe crédito conforme usa. Se a conta certa
  está zerada, é esperar o pool renovar (amanhã) ou assinar um plano pago.
