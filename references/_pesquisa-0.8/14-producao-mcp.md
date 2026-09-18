# Etapa 14 — Produção MCP: base teórica

> Pesquisa web, 2026-07-03. Etapa 14 do fluxo Jotaro 0.8: executar a produção
> depois do token de aprovação, chamando ferramentas externas por MCP ou camada
> equivalente, com rastreabilidade, permissões e artefatos por geração.

## O que é e por que existe

A Produção MCP é a etapa que transforma prompt aprovado em chamada real de geração:
imagem, vídeo, áudio, upscaling, variação, download, registro de artefatos. Ela é
deliberadamente separada do Prompt-smith e da Aprovação Humana porque execução tem
riscos próprios:

- gasta crédito
- chama ferramenta externa
- cria artefato que pode ser confundido com versão aprovada
- pode falhar parcialmente
- precisa de logs para auditoria e crítica pós-render

MCP entra como padrão porque define uma forma comum de conectar aplicações de IA a
ferramentas, dados e workflows. O site oficial descreve MCP como padrão aberto para
conectar aplicações de IA a sistemas externos; Tools executam ações, Resources
fornecem contexto, Prompts oferecem templates reutilizáveis e Roots delimitam acesso
a filesystem.

## Base teórica

### 1. MCP separa contexto, ação e template

A especificação oficial define três primitivas relevantes:

- **Resources**: dados/contexto que o modelo pode ler.
- **Tools**: ações externas que o modelo pode invocar.
- **Prompts**: templates ou workflows parametrizados.

Para Jotaro:

- `project-brief`, identidade, prompt final e approval record são Resources.
- renderizar vídeo/imagem, salvar artefato, criar variação e exportar são Tools.
- "gerar vídeo 9:16 aprovado", "gerar still", "fazer variação A/B" são Prompts ou
  templates internos.

Essa separação impede que "produzir" vire uma chamada opaca. O pipeline sabe o que
foi lido, qual ferramenta foi chamada e com quais parâmetros.

### 2. Lifecycle importa em produção

O lifecycle MCP tem fases de inicialização, operação e shutdown com negociação de
capacidades. Isso é útil para o Jotaro porque o render não deve assumir que todo MCP
tem os mesmos recursos:

- quais ferramentas existem?
- quais schemas de input aceitam?
- suportam imagem de referência?
- suportam áudio?
- retornam job assíncrono ou arquivo direto?
- exigem aprovação explícita do host?

Produção robusta começa com capability discovery e falha antes de gastar crédito se
o servidor não suporta o contrato do prompt.

### 3. Tools são o lado de escrita; precisam de consentimento e escopo

WorkOS resume bem a distinção: Resources são leitura; Tools são escrita/ação. A
especificação de Tools diz que ferramentas interagem com sistemas externos e têm
metadata/schema. Isso coloca a Produção MCP dentro da mesma filozoe da Etapa 13:
sem token de aprovação, não chama Tool.

Regras práticas:

- tool call só depois de `approval.production_token`
- tool call deve estar allowlisted por projeto
- parâmetros devem ser gerados a partir do manifesto, não digitados livremente
- output deve ser salvo com job id, tool name, model, seed, custo e timestamp

### 4. Segurança MCP não é opcional

O crescimento do MCP trouxe uma superfície de risco nova: tool descriptions podem
induzir escolha errada, servidores podem expor ações perigosas, STDIO/HTTP mudam o
modelo de confiança, e permissões precisam ser explícitas. Fontes de segurança em
MCP recomendam autenticação, autorização, allowlists, escopo mínimo, revisão de tool
descriptions e controles de tenant.

Para Jotaro, isso significa que a Produção MCP deve ser "burra e estreita":

- não decide direção criativa
- não reescreve prompt aprovado
- não escolhe ferramenta fora do manifest
- não acessa pastas fora do projeto
- não executa ações sem ledger

### 5. Artefato de produção precisa ser reprodutível ou pelo menos auditável

Nem todo modelo generativo é reprodutível, mas todo job precisa ser auditável.
Registrar só o arquivo final é insuficiente. A etapa deve registrar:

- prompt final enviado
- prompt canônico que originou o dialetal
- modelo/ferramenta
- parâmetros
- seed, se existir
- input media/references
- output URLs/paths
- custo/tempo
- erro/retry
- hash do approval record

Isso é o que permite a Etapa 15 dizer por que um render falhou.

## Opções que a etapa deve conhecer

### Modos de produção

| Modo | Uso | Risco principal |
|---|---|---|
| Texto → imagem | still, key visual, thumbnail | prompt visual insuficiente |
| Imagem → vídeo | cena com referência visual | movimento contradiz imagem |
| Texto → vídeo | geração livre | baixa aderência e variação alta |
| Vídeo → áudio | sound design / trilha | áudio não segue intenção |
| Variação | A/B de hook, câmera ou áudio | perder rastreabilidade |
| Upscale/export | entrega final | confundir melhoria técnica com novo render |

### Contrato mínimo de job

```yaml
production_job:
  generation_id: ""
  approval_token: ""
  tool_server: ""
  tool_name: ""
  model: ""
  input_prompt_path: ""
  input_manifest_path: ""
  references: []
  params:
    aspect_ratio: "9:16"
    duration_seconds: 8
    seed: null
  status: "queued|running|succeeded|failed"
  outputs: []
  cost_estimate: null
  started_at: ""
  finished_at: ""
```

### Retry policy

- **Falha de rede**: retry técnico, mesmo prompt, mesmo parâmetros.
- **Falha de schema**: parar e corrigir tradutor MCP.
- **Falha criativa**: não retry cego; enviar para crítica pós-render.
- **Falha parcial**: preservar artefato e log, não sobrescrever.

## Perguntas de auditoria da etapa

1. Existe aprovação válida para o `prompt_hash`?
2. O servidor MCP foi inicializado e capacidades foram negociadas?
3. A tool chamada está allowlisted para este projeto?
4. Os parâmetros vieram do manifesto aprovado?
5. A chamada alterou o prompt final? Se sim, por quê e onde está registrado?
6. O output foi salvo em pasta própria da geração?
7. O ledger tem job id, tool, modelo, seed e custo?
8. O retry preserva rastreabilidade?
9. O job falhou antes ou depois de gastar crédito?
10. A crítica pós-render recebe todos os inputs necessários?

## Mudanças sugeridas ao fluxo 0.8

1. **Criar `production-job.yaml`** por geração.
2. **Separar `render-adapter` de agentes criativos**: adapter só traduz manifesto para
   ferramenta.
3. **Allowlist por projeto/ferramenta** antes de tool call.
4. **Ledger obrigatório de tool calls** com prompt hash, approval hash e output hash.
5. **Pasta estrutural por geração**: `projects/<marca>/generations/<id>/production/`.

## Direção em uma frase (chip)

**"Produção MCP não decide; executa a versão aprovada com escopo mínimo, ledger completo e artefato rastreável."**

## Fontes (URLs completas)

- https://modelcontextprotocol.io/docs/getting-started/intro — introdução oficial ao MCP.
- https://modelcontextprotocol.io/specification/2025-06-18 — especificação oficial MCP 2025-06-18.
- https://modelcontextprotocol.io/specification/2025-06-18/server/tools — Tools como ações externas invocáveis.
- https://modelcontextprotocol.io/specification/2025-06-18/server/resources — Resources como contexto/dados.
- https://modelcontextprotocol.io/specification/2025-06-18/client/roots — Roots como limites de filesystem.
- https://modelcontextprotocol.io/specification/2025-06-18/client/sampling — Sampling e controle do cliente sobre acesso a modelos.
- https://modelcontextprotocol.io/specification/2025-03-26/basic/lifecycle — lifecycle MCP: inicialização, operação e shutdown.
- https://www.anthropic.com/news/model-context-protocol — anúncio original do MCP pela Anthropic.
- https://www.anthropic.com/engineering/code-execution-with-mcp — MCP como padrão para conectar agentes a ferramentas/sistemas.
- https://adk.dev/tools-custom/mcp-tools/ — visão prática de MCP tools em agentes.
- https://workos.com/blog/everything-your-team-needs-to-know-about-mcp-in-2026 — distinção Tools/Resources e implicações para times.
- https://www.cerbos.dev/blog/mcp-authorization — autorização e RBAC para servidores MCP.
- https://protectai.com/blog/mcp-security-101 — riscos e controles de segurança em MCP.
- https://www.coalitionforsecureai.org/wp-content/uploads/2026/03/model-context-protocol-security-1.pdf — segurança MCP e padrões de deployment.
- https://arxiv.org/html/2602.14878v1 — pesquisa sobre tool descriptions em MCP e impacto na seleção de ferramentas.

