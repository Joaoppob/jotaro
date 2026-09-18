# Narrativa: ExampleBrand

## A história
Um dia na vida do trio ExampleBrand: três rotinas, uma marca. O reel apresenta cada
personagem no seu próprio território — o risco calculado da Zara, o silêncio do Theo, o
calor da Ivy — e fecha convidando o público a escolher a sua rotina. Não há vilão; o
contraste é de **ritmo**, entre os três.

## Cenário
Cidade contemporânea em três recortes: a parede de escalada urbana ao amanhecer (Zara), o
ateliê de cerâmica (Theo), a floricultura de esquina (Ivy). Cada recorte tem sua luz e sua
cor de acento.

## Arco do reel (trio)
- **Gancho (Zara):** abre na parede de escalada — risco, foco, adrenalina no frame 1.
- **Desenvolvimento (Theo):** corta para o ateliê — silêncio, precisão, o avesso da Zara.
- **CTA (Ivy):** fecha na floricultura — calor, convite, espaço limpo para o call-to-action.

## Como o `prompt-smith` usa esta narrativa
Em modo biblioteca, cada cena seleciona o asset do personagem certo (consistência por
construção). Quando uma cena exige geração, o `prompt-smith` carrega os cues de persona do
personagem (do bloco `personas`) no prompt — o `persona-carry.cjs` cobra ≥2 cues por cena.
Corte seco entre rotinas; cada corte é nova informação (personagem, ritmo e cor de acento
novos).
