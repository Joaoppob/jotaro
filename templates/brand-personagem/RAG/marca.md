# Marca: <nome da marca>

> Scaffold de marca **com personagem/mascote**. Mantenha os títulos de seção para o agente
> `rag` extrair a identidade com previsibilidade.
>
> IMPORTANTE: o validador (`validate-rag.cjs`) checa cada seção por palavra-chave. Use as
> palavras em negrito no título de cada seção — o resto do título você pode adaptar. Enquanto
> o `project.json` estiver em `status: "rascunho"`, o verify não bloqueia este projeto.

## O que é

Descreva o jogo, app ou marca em 3 a 6 linhas.

## Público

Quem deve assistir ao reel? Idade, contexto de uso, desejo principal e o tipo de linguagem
que funciona para esse público.

## Personagem central: <nome do personagem>

Liste os elementos visuais invariantes do personagem. Prefira detalhes distintivos:
- silhueta ou formato;
- cores principais;
- roupa, acessórios, marcas únicas;
- detalhe que não pode sumir entre cenas.

Anchor textual canônico (em inglês, como o modelo de imagem espera):

```
Same <character> from the reference images: <distinctive silhouette>, <main colors>,
<clothing/accessories/unique marks>. <visual style>, <palette>, vertical 9:16 frame.
```

## Estilo visual

- Medium:
- Cores:
- Tratamento:
- Formato:

## Tom da comunicação

Como o criativo fala: direto, divertido, épico, energético, calmo etc.

## Como o `prompt-smith` usa esta marca

Qual parte do anchor deve aparecer sempre, e quais detalhes podem mudar por cena.
