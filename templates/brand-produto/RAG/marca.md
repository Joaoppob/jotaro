# Marca: <nome da marca>

> Scaffold de marca **de produto físico**. Mantenha os títulos de seção para o agente `rag`
> extrair a identidade com previsibilidade.
>
> IMPORTANTE: o validador (`validate-rag.cjs`) checa cada seção por palavra-chave. Use as
> palavras em negrito no título. Enquanto o `project.json` estiver em `status: "rascunho"`,
> o verify não bloqueia este projeto.

## O que é

Descreva o produto e o que ele resolve em 3 a 6 linhas.

## Público

Quem compra? Idade, contexto de uso, desejo principal e a linguagem que funciona.

## Produto central: <nome do produto>

Liste os elementos visuais invariantes do produto. Prefira detalhes distintivos:
- forma e silhueta da embalagem;
- cores e acabamento (matte, metálico, etc.);
- rótulo, tampa, material;
- detalhe que não pode mudar entre cenas.

Anchor textual canônico (em inglês, como o modelo de imagem espera):

```
Same premium product from the reference images: <package shape>, <main colors>, <cap/label/
material details>, <finish>. Premium lifestyle product photography style, <palette>,
vertical 9:16 frame.
```

## Estilo visual

- Medium: fotografia de produto / lifestyle
- Cores:
- Tratamento:
- Formato:

## Tom da comunicação

Como o criativo fala: premium, aspiracional, prático, técnico etc.

## Como o `prompt-smith` usa esta marca

Quais traços do produto reaparecem em cada cena, e o que pode mudar (ângulo, fundo, lifestyle).
