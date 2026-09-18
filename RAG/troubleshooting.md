# Guia de troubleshooting do gerador

> Leitor primario: Jotaro. Use como referencia rapida quando algo falhar.
> Cada entrada tem: sintoma → causa provavel → o que dizer ao usuario → proximo passo.

## Conexao e autenticacao (Higgsfield MCP-first)

> No 0.7 o Higgsfield e **MCP-first**: a auth e o **connector do Claude Code** (o usuario conecta
> o Higgsfield uma vez no connector e a sessao herda a conta). O **CLI** (`higgsfield`/`hf`) e o
> **fallback**. Voce (Jotaro) confere conta/saldo e conduz o fallback **sozinho, sem reiniciar o
> Claude Code**. O clique de conectar/login e do usuario; conferir e seguir e seu.

### Connector nao conectado (nada de video/imagem)

**Sintoma:** `mcp__higgsfield__balance` nao retorna saldo (tool indisponivel/erro de auth do
connector); nenhuma tool `mcp__higgsfield__*` responde.

**Causa:** o Higgsfield ainda nao foi conectado no connector do Claude Code (ou a conexao caiu).

**Resposta:** "O Higgsfield ainda nao esta conectado aqui. Conecta ele uma vez no connector do
Claude Code (eu te guio no `/setup`) e a sessao ja herda sua conta — sem reiniciar nada."

**Proximo passo:** `/setup` (conectar o connector) → `mcp__higgsfield__balance` confirma saldo.
Fallback: `higgsfield auth login` (CLI) se o connector nao estiver disponivel.

### Saldo nao bate / conta errada

**Sintoma:** `mcp__higgsfield__balance` mostra saldo/conta diferente do esperado.

**Causa:** o connector esta herdando outra conta, ou o usuario trocou de conta no site do
Higgsfield e o connector ainda aponta pra anterior.

**Resposta:** "Aqui eu ainda estou vendo `<N>` creditos nessa conta. Voce trocou de conta no
Higgsfield? Reconecta o connector na conta certa (ou eu disparo o fallback `higgsfield auth
login`) e eu confirmo o saldo na hora, sem reiniciar."

**Proximo passo:** reconferir a conta do connector (MCP) e re-conectar; fallback CLI
`higgsfield auth login` na conta nova → `mcp__higgsfield__balance` confirma.

### Erro de auth no meio do fluxo

**Sintoma:** uma tool `mcp__higgsfield__*` retorna erro de auth depois de ja ter funcionado.

**Causa:** a sessao do connector expirou (sessao muito longa ou token vencido).

**Resposta:** "A conexao com o Higgsfield expirou no meio do caminho. Reconecta o connector (ou
eu disparo o fallback de login) e seguimos. Se tinha um run em andamento, relaxa: o checkpoint
salvou o que ja foi gerado."

**Proximo passo:** reconectar o connector (ou `higgsfield auth login` no fallback) →
`mcp__higgsfield__balance` confirma → `/gerarvideo` retoma do save-crystal.

---

## Credito e custo

### Saldo insuficiente detectado no preflight (job unico)

**Sintoma:** `pode_prosseguir: false` no preflight, com `custo > saldo`. No 0.7 e um **job unico**:
a forja produz um prompt -> um job; o custo vem do `get_cost` do MCP (`generate_*` com
`get_cost:true`), o saldo do `mcp__higgsfield__balance`.

**Resposta:** "Esse video custa [X] creditos (confirmei no get_cost), mas voce tem [Y] agora. No
plano free sao 10 creditos por dia. Opcoes: (1) esperar o pool renovar (24h), (2) simplificar o
job pra caber, (3) assinar um plano pago no Higgsfield."

**Proximo passo:** deixar o usuario escolher. Nunca inventar preco: o numero vem do `get_cost`.

### Erro de credito ao disparar a producao

**Sintoma:** `mcp__higgsfield__generate_video`/`generate_image` retorna erro de credito.

**Causa:** o saldo real ficou abaixo do custo do job entre o preflight e o disparo (o balance pode
variar). Disparo recusado por falta de credito **nao cobra**.

**Resposta:** "O saldo nao cobre o job agora — e o disparo recusado nao gastou nada. Quando o pool
renovar (24h) ou voce topar um plano, eu disparo de novo. O plano (prompt-forge) esta salvo."

**Proximo passo:** reconferir `balance`, aguardar renovacao/plano → redisparar o `generate_*`.

---

## Producao (MCP) — imagem, video e audio

> No 0.7 nao ha FFmpeg nem montagem: o video multishot ja sai pronto do modelo (kling3_0/
> seedance_2_0) num so job. A producao vai pelas tools `mcp__higgsfield__*`; o CLI e fallback.

### get_cost nao retorna (nao sei o preco do job)

**Sintoma:** `mcp__higgsfield__generate_*` com `get_cost:true` nao devolve o custo, ou o connector
nao responde a chamada de custo.

**Causa:** o connector caiu ou a tool de custo esta indisponivel. **Nunca invente preco** nem use
tabela fixa — sem `get_cost` confiavel, nao dispare.

**Resposta:** "Nao consegui confirmar o custo do job agora (o get_cost nao respondeu). Nao vou
disparar no escuro — a gente reconecta o Higgsfield e eu confirmo o preco antes de gastar."

**Proximo passo:** reconferir o connector (`mcp__higgsfield__balance`) e repetir o `generate_*`
com `get_cost:true`; so disparar de verdade depois que o custo voltar.

### Job em processamento / polling (job_status)

**Sintoma:** o `generate_*` retornou um `job_id` mas o resultado ainda nao chegou.

**Causa:** a producao e assincrona — o job leva alguns minutos.

**Resposta:** "Seu video esta sendo produzido no Higgsfield. Vou acompanhar o job ate concluir —
isso pode levar alguns minutos, nao gasta credito extra."

**Proximo passo:** acompanhar com `mcp__higgsfield__job_status` (ou `show_generations`) ate o
job concluir. Se falhar apos concluir a criacao, ler o erro do job antes de re-disparar.

### Element/referencia expirado (run retomado dias depois)

**Sintoma:** o `generate_*` recusa a referencia num run retomado depois de dias; o `element_id`
do `project.json` nao e mais aceito.

**Causa:** o Element (ou o upload da referencia) expirou no Higgsfield entre as sessoes.

**Resposta:** "A referencia/Element da sua marca expirou no Higgsfield desde a ultima sessao. Vou
re-subir as imagens de referencia (salvas aqui na sua maquina) e retreinar o Element — isso nao
gasta credito, so a producao em si cobra."

**Proximo passo:** re-subir as refs de `projects/<projeto>/RAG/identidade-visual/<personagem>/`
com `mcp__higgsfield__media_upload`/`media_confirm`, retreinar o Element, atualizar o `element_id`
no `project.json`, e re-disparar o `generate_*`. Upload nao cobra credito.

### Modelo de producao recusado pelo plano

**Sintoma:** `mcp__higgsfield__generate_video` com um modelo de teto pago retorna erro de plano.

**Causa:** o modelo escolhido exige plano pago/verificacao. Os executaveis do 0.7 sao
`kling3_0`/`seedance_2_0` (video) e `nano_banana_2` (imagem).

**Resposta:** "Esse modelo so roda em plano pago. Pra este job eu uso o `kling3_0` (video) ou o
`nano_banana_2` (imagem), que sao os do fluxo padrao — o `model-advisor` mostra o tradeoff."

**Proximo passo:** rodar `node scripts/lib/model-advisor.cjs <image|video> ...`, escolher um
modelo executavel MCP, e re-disparar.

---

## RAG e identidade

### Pasta RAG vazia

**Sintoma:** `projects/<projeto>/RAG/identidade-visual/` nao tem imagens. `validate-rag.cjs --project <projeto>` falha.

**Resposta:** "A pasta de referencias visuais deste projeto esta vazia. Para gerar com a cara da sua marca, coloque de 1 a 4 imagens do seu personagem ou produto em `projects/<projeto>/RAG/identidade-visual/`. Sem isso, eu gero imagem generica, sem consistencia entre cenas."

**Proximo passo:** usuario coloca imagens → `validate-rag.cjs --project <projeto>` para conferir.

### Marca ou narrativa incompletas

**Sintoma:** `validate-rag.cjs` reporta secoes faltando em `marca.md` ou `narrativa.md`.

**Resposta:** "Sua marca ainda esta incompleta: [listar o que falta, ex: 'falta a secao de estilo visual', 'a narrativa so tem 1 secao, precisa de pelo menos 3']. Os moldes em `templates/brand-*/RAG/` (marca.md e narrativa.md) servem de base para preencher."

**Proximo passo:** usuario completa → `validate-rag.cjs` para conferir.

---

## Pipeline e retomada

### Run interrompido (save-crystal)

**Sintoma:** `projects/<projeto>/output/.pipeline-state.json` existe com cenas ja geradas.

**Resposta:** "Tem um run em andamento neste projeto com [N] cenas ja geradas. Quer retomar de onde parou (sem regerar o que ja foi feito, credito gasto nao volta) ou comecar um run novo?"

**Proximo passo:** se retomar, pular cenas com `existe: true` no save-crystal. Se comecar novo, apagar `projects/<projeto>/output/.pipeline-state.json`.

### Cadencia de revisao bloqueando

**Sintoma:** `review-cadence.cjs status` retorna `pode_iniciar_fluxo: false`.

**Resposta:** "Antes de gerar, preciso rodar uma revisao rapida do sistema — e uma checagem de seguranca que evita gerar com alguma coisa quebrada. Rode `/revisao` e em 1 minuto a gente segue."

**Proximo passo:** `/revisao` → se passar, fluxo liberado.

---

## Ambiente

### Windows: espaco no nome do diretorio

**Sintoma:** comandos quebram com paths contendo "Jotaro Image and Video Generator".

**Causa:** O repo tem espaco no nome. Os scripts locais ja tratam isso com aspas nos comandos.

**Resposta:** (interno — Jotaro nao reporta isso ao usuario) Use aspas duplas em todos os paths de
shell (ex.: `node "scripts/verify.cjs"`). A producao vai por MCP (sem paths de shell).

---

## Resposta pronta do Jotaro para "algo deu errado"

Use esta formula quando nenhuma entrada acima cobrir o erro:

1. Diga o que aconteceu em linguagem simples (sem jargao).
2. Diga se o erro consumiu credito ou nao.
3. Se ha checkpoint, diga que o que ja foi gerado esta salvo.
4. Ofereca o proximo passo concreto (nao "tente de novo", mas "roda X", "confere Y", "aguarda Z").
5. Se for erro desconhecido, seja honesto: "Esse erro e novo para mim. Vou registrar e voce pode tentar [acao segura] enquanto investigo."

Exemplo:

> "A geracao da cena 3 falhou por um erro de conexao com o Higgsfield. Isso nao consumiu credito — o disparo foi recusado antes de cobrar. As cenas 1 e 2 continuam salvas no checkpoint. Vamos tentar de novo? Se falhar de novo, sugiro aguardar alguns minutos e testar a conexao com `/creditos`."

---

## Recuperacao de crash / power loss (sessao interrompida)

Se o computador cair, o terminal fechar ou o Claude Code reiniciar no meio de uma geracao,
o que ja foi gerado **nao esta perdido** — mas requer um procedimento de recuperacao.

### O que sobrevive a um crash

| Artefato | Sobrevive? | Notas |
|----------|-----------|-------|
| Imagens ja geradas em `output/imagens/` | Sim (arquivos em disco) | |
| Clipes ja gerados em `output/clips/` | Sim (arquivos em disco) | |
| `pipeline-state.json` | Sim, com backup | Se corrompido, ha `.corrupt-*` de backup |
| `pipeline-state.json.lock` | Pode travar | Remova manualmente se o lock sobreviveu ao crash |
| `credit-ledger.jsonl` | Sim (append-only) | Linhas gravadas antes do crash estao salvas |
| Jobs do Higgsfield em andamento | **Depende** | Se o `generate create` retornou `job_id`, o job continua no servidor |

### Procedimento de recuperacao

1. **Reabra o Claude Code na pasta do projeto.** O Jotaro deve detectar o estado via `/inicio`.

2. **Remova locks orfaos se necessario:**
   O `pipeline-state.cjs` usa lock file (`pipeline-state.json.lock`). Se o crash
   ocorreu durante uma gravacao, o lock pode ter ficado. Remova manualmente:
   ```bash
   rm projects/<projeto>/output/.pipeline-state.json.lock   # Linux/macOS
   del projects\<projeto>\output\.pipeline-state.json.lock   # Windows
   ```

3. **Verifique a integridade do state:**
   ```bash
   node scripts/pipeline-state.cjs dump --root projects/<projeto>
   ```
   Se o JSON for valido (lista `cenas` com `job_id` + `path`), o state esta integro.
   Se o dump falhar com erro de parse, o arquivo `.corrupt-*` mais recente contem
   o backup pre-crash — renomeie-o removendo o sufixo `.corrupt-*` para restaurar.

4. **Recupere jobs orfaos do Higgsfield:**
   Um job cujo `generate_*` (MCP) retornou `job_id` mas o resultado nunca chegou continua
   processando (ou ja terminou) no servidor do Higgsfield. Verifique com
   `mcp__higgsfield__job_status` (ou `show_generations`). Se o job completou, o proprio MCP
   entrega o asset; se ainda processa, acompanhe ate concluir. (Fallback CLI:
   `higgsfield generate get <JOB_ID> --json`.)

5. **Retome de onde parou:**
   O Jotaro, ao rodar `/gerarvideo` ou `/gerarimagem`, consulta o checkpoint
   (`pipeline-state.cjs get`) e pula cenas ja geradas (credito NAO e regasto).
   A geracao continua da proxima cena pendente.

### Sinais de que o state esta corrompido

- `pipeline-state.cjs dump` retorna erro de JSON.
- `pipeline-state.cjs get --cena N` retorna `existe: false` mas o arquivo existe no disco.
- O arquivo `pipeline-state.json` tem 0 bytes (gravacao interrompida).

Em qualquer caso, o `pipeline-state.cjs` **tenta recuperar automaticamente** (funcao
`rescueCenas`) os `job_id` e `path` de cada cena do JSON danificado. Se conseguir,
salva em `.recovered-*` e zera o state (para evitar usar dados parciais). Nesse caso,
**compare** o que o recovery salvou com o que existe no disco e reconstrua manualmente
com `pipeline-state.cjs set`.

---

## Atualizacao deste guia

Quando um erro novo aparecer em producao e for resolvido, adicione uma entrada aqui.
O guia cresce com a experiencia real de uso.
