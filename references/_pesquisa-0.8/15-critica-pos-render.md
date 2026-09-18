# Etapa 15 — Crítica pós-render: base teórica

> Pesquisa web, 2026-07-03. Etapa 15 do fluxo Jotaro 0.8: depois da produção,
> avaliar se o artefato renderizado entregou o projeto aprovado, diagnosticar falhas
> e decidir próxima ação.

## O que é e por que existe

A crítica pós-render não é uma opinião estética solta. É uma revisão dirigida pelo
brief e pelo prompt aprovado:

- O render comunica o que o projeto dizia que deveria comunicar?
- A primeira cena segura atenção?
- História, mundo, enredo, câmera, montagem, realismo e áudio sobreviveram ao modelo?
- A peça está pronta, precisa de variação, precisa de novo prompt ou precisa reabrir
  brief?

Essa etapa fecha o loop de qualidade. Sem ela, Jotaro só sabe que "gerou". Com ela,
Jotaro aprende se o pipeline funcionou.

## Base teórica

### 1. Crítica precisa separar aderência criativa de performance prevista

Google organiza vídeo ads no framework ABCD: Attention, Branding, Connection,
Direction. TikTok recomenda estrutura hook, body e close, com atenção crítica nos
primeiros segundos. Ferramentas de creative analytics como Motion separam métricas em
atenção, retenção e conversão.

Para Jotaro, isso vira duas avaliações diferentes:

1. **Aderência ao projeto**: o render segue prompt, brief e identidade?
2. **Potencial de performance**: a peça tem hook, retenção, clareza e CTA esperados?

Uma peça pode ser fiel ao prompt e fraca como anúncio. Também pode ser performática
mas trair o projeto. A crítica precisa nomear qual problema aconteceu.

### 2. Os primeiros segundos têm peso desproporcional

TikTok e Google destacam o início do vídeo como zona de maior impacto. TikTok fala em
priorizar hook nos primeiros segundos e estruturar conteúdo em hook/body/close. Google
ABCD começa por Attention. Guias de creative metrics tratam hook rate como diagnóstico
do primeiro trecho: se ninguém passa do começo, o restante da peça não tem chance de
performar.

No 0.8, a crítica pós-render deve revisar o frame/beat inicial separadamente:

- existe movimento ou tensão visual imediata?
- o sujeito/produto/problema aparece cedo o bastante?
- o áudio ajuda ou atrapalha o hook?
- o primeiro corte chega antes de perder atenção?
- o render gerou "slow establishing" quando o brief pedia scroll-stop?

### 3. Métricas de criativo dão linguagem para diagnóstico

Mesmo antes de publicar, a crítica pode usar a lógica de métricas:

- **Hook rate / thumbstop**: força dos primeiros 2-3 segundos.
- **Hold rate**: se o corpo sustenta curiosidade.
- **Completion / VCR**: se a estrutura é curta e recompensadora.
- **CTR / CTA clarity**: se direção final é clara.
- **CPA/ROAS**: só depois de mídia real, mas o prompt já pode preparar hipótese.

Motion e outros guias de creative analytics recomendam decompor performance por
estágio: atenção, engajamento, conversão. A crítica pós-render deve devolver uma
hipótese por estágio, não um "bom/ruim" genérico.

### 4. Pós-render também é QA visual e sonoro

Além da lógica de marketing, a crítica precisa identificar falhas de geração:

- deformação de rosto, mãos, texto, produto
- inconsistência de identidade entre shots
- luz sem fonte
- câmera que não executou movimento pedido
- corte com timing errado
- áudio sem sincronia, fala estranha, música conflitante
- realismo artificial demais
- objeto/produto fora de foco quando deveria ser hero

Essas falhas voltam para etapas diferentes. Se o problema é luz, volta para Etapa 9?
Não: no fluxo fechado, luz está embutida em câmera/mundo/realismo conforme agente
definido. A crítica precisa mapear falha para **a menor etapa responsável**:

- mundo genérico → etapa 5
- ação confusa → etapa 6
- plano errado → etapa 7
- ritmo ruim → etapa 8
- artificialidade → etapa 9
- som/fala → etapa 10
- prompt ambíguo → etapa 11
- problema de ferramenta/parâmetro → etapa 14

### 5. Crítica boa vira memória do sistema

O resultado renderizado é evidência. O 0.8 precisa guardar:

- render aprovado/reprovado
- motivo
- falhas por etapa
- decisão de próxima ação
- prompt que originou o render
- ferramenta/modelo usado
- imagens/vídeo de referência
- aprendizados reutilizáveis para próximos prompts

Isso transforma falha em melhoria de processo. Sem esse ledger, o time descobre a
mesma coisa toda rodada.

## Opções de decisão pós-render

| Decisão | Quando usar | Próxima ação |
|---|---|---|
| Aprovar artefato | Render entrega projeto e está publicável | Exportar/entregar |
| Variação leve | Ideia funciona, execução tem pequeno ajuste | Produção MCP com mesmo prompt ajustado |
| Reforjar prompt | Prompt não controlou o modelo | Voltar etapa 11 |
| Ajustar especialista | Falha pertence a uma dimensão clara | Voltar etapa específica |
| Trocar ferramenta/modelo | Prompt está bom, ferramenta não executou | Voltar etapa 14 |
| Reabrir brief | Artefato revela que objetivo era ruim | Voltar etapa 2 |
| Rejeitar | Render não serve e não vale iterar | Encerrar geração |

## Rubrica sugerida

### Aderência ao projeto

| Critério | Pergunta | Nota |
|---|---|---|
| Objetivo | O render comunica a proposição única? | 0-2 |
| Identidade | Marca/personagem/produto permanecem reconhecíveis? | 0-2 |
| Mundo | Ambiente parece vivido e coerente? | 0-2 |
| Enredo | A ação é compreensível sem explicação externa? | 0-2 |
| Câmera | Planos e movimento servem ao projeto? | 0-2 |
| Montagem | Ritmo sustenta a intenção? | 0-2 |
| Realismo | Imperfeição fotográfica parece capturada, não defeito? | 0-2 |
| Áudio | Som/fala/música reforçam a cena? | 0-2 |

### Potencial de performance

| Critério | Pergunta | Nota |
|---|---|---|
| Attention | Hook visual/sonoro nos primeiros segundos? | 0-2 |
| Branding | Identidade aparece cedo e organicamente? | 0-2 |
| Connection | Existe tensão, emoção ou prova que prende? | 0-2 |
| Direction | Próxima ação/payoff está claro? | 0-2 |

## Formato de saída sugerido

```yaml
post_render_critique:
  generation_id: ""
  render_id: ""
  verdict: "approved|variation|revise_prompt|revise_stage|rerender_tool|reopen_brief|reject"
  project_alignment_score: 0
  performance_hypothesis_score: 0
  failures:
    - stage: "camera"
      severity: "medium"
      evidence: "Shot 2 rendered as static close-up instead of tracking movement."
      next_action: "Return to camera stage and simplify movement."
  next_action: ""
  reusable_learning: ""
```

## Perguntas de auditoria da etapa

1. O artefato foi comparado com o prompt aprovado, não com gosto pessoal?
2. O primeiro beat foi avaliado separadamente?
3. A falha foi mapeada para a menor etapa responsável?
4. O problema é de prompt, modelo, parâmetro ou brief?
5. A crítica preserva evidência observável?
6. Existe decisão de próxima ação?
7. Aprendizado reutilizável foi registrado?
8. A variação proposta muda só uma variável?
9. O artefato aprovado está ligado ao job de produção?
10. A crítica fecha o ledger da geração?

## Mudanças sugeridas ao fluxo 0.8

1. **Criar `post-render-critique.yaml`** por render.
2. **Adicionar rubrica ABCD + hook/body/close** à crítica.
3. **Mapear falhas para etapa responsável** em vez de "melhorar prompt" genérico.
4. **Guardar aprendizados em memória do projeto**: `references/render-learnings.md`.
5. **Criar decisão `trocar ferramenta/modelo`** quando o prompt está correto mas a
   ferramenta não executa.

## Direção em uma frase (chip)

**"A crítica pós-render não pergunta se ficou bonito; pergunta se o render provou o projeto ou revelou onde o pipeline falhou."**

## Fontes (URLs completas)

- https://support.google.com/google-ads/answer/14783551?hl=en — Google Ads: ABCDs de anúncios em vídeo.
- https://business.google.com/us/resources/articles/abcds-of-effective-video-ads/ — Google/YouTube: Attention, Branding, Connection, Direction.
- https://business.google.com/us/think/future-of-marketing/youtube-video-ad-creative/ — Think with Google: aplicação dos ABCDs.
- https://www.thinkwithgoogle.com/_qs/documents/8472/ABCD_Complete_V7b_HR_1.pdf — playbook ABCD completo.
- https://ads.tiktok.com/help/article/creative-best-practices — TikTok Ads Manager: hook nos primeiros segundos, USP e CTA.
- https://ads.tiktok.com/business/en-US/blog/creative-best-practices-top-performing-ads — TikTok For Business: estrutura hook/body/close e recall inicial.
- https://ads.tiktok.com/business/library/AUNZ_Creative_Starter_Pack_TakeItToTikTok.pdf — TikTok Creative Starter Pack: primeiros 3-6 segundos.
- https://motionapp.com/blog/key-creative-performance-metrics — Motion: hook rate, hold rate, CTR, CPA, ROAS.
- https://motionapp.com/blog/how-to-build-a-high-volume-ad-production-system-for-meta-and-tiktok-in-2026 — checklist de criativo para Meta/TikTok.
- https://www.nine.am/insights/how-hook-rate-beats-ctr — modelo hook/hold/completion/CTR para análise criativa.
- https://admanage.ai/blog/what-is-a-good-hook-rate-for-facebook-ads — benchmarks e diagnóstico de hook rate.
- https://billo.app/blog/hook-rate-to-hold-rate/ — hook rate + hold rate como diagnóstico de criativo.
- https://benly.ai/learn/meta-ads/video-ads-guide — categorias de métricas de vídeo e quedas por quartil.
- https://www.leadsbridge.com/blog/meta-ads-best-practices/ — boas práticas de atenção rápida e som/caption para Meta.

