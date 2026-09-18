# Checklist de regeneracao de cena

Use quando uma imagem ou clipe nao ficou bom.

## Antes de regerar

1. Identifique a cena pelo `n` e `tag`.
2. Veja se o problema e de identidade, composicao, acao, corte ou estilo.
3. Mantenha as mesmas referencias visuais.
4. Preserve o anchor textual quando o personagem aparece.
5. Altere so o trecho do prompt que explica o problema.

## Regra de custo

Regerar custa credito. No 0.7 e um job unico (um prompt-forge -> um job): re-rodar o
`generate_*` re-cobra o job inteiro — nao ha re-render per-cena nem remontagem sem custo.
Avise antes; e prefira ajustar o prompt-forge e rearmar o gate a queimar credito no chute.

## Resposta curta

"A cena X falhou por [motivo]. Vou ajustar [parte do prompt] e manter [refs/anchor]. Isso custa
[custo] credito(s). Posso seguir?"
