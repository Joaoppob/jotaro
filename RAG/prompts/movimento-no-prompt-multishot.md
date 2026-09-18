# Movimento dentro do prompt multishot (kling3_0 / seedance_2_0)

> Nota de conhecimento do 0.7. No 0.7 não há mais image-to-video per-cena nem
> `motion-prompt-smith`: a forja produz **um único prompt multishot** (`prompt-forge`) e o
> vídeo sai pronto do modelo (kling3_0/seedance_2_0) num só job. O movimento não é uma folha
> à parte — ele **vive dentro do prompt**, descrito shot a shot. Esta página guarda as 4 leis
> transferíveis de direção de movimento; a mecânica antiga de I2V/veo3 foi retirada.

## As 4 leis de movimento (transferíveis ao prompt multishot)

Ao descrever o movimento de cada shot dentro do `prompt` (o campo prosa do `prompt-forge`),
valem quatro disciplinas — as mesmas que faziam um clipe render bem, agora aplicadas por shot:

### Lei 1 — um movimento de câmera por shot
Cada shot carrega **um** movimento: "push-in lento" OU "pan suave" OU "tilt", nunca a soma.
Empilhar movimentos num mesmo shot ("push-in and pan and orbit") produz jitter — a câmera briga
consigo mesma. O campo `movimento_camera` de cada shot do `prompt-forge` já força um só; a prosa
deve honrar isso.

### Lei 2 — só frase positiva
Descreva **o que você quer**, nunca o que não quer. Negativo pode causar o oposto: "no camera
shake" pode introduzir shake. Estabilidade vira positivo — em vez de "no movement in the
background", diga "everything else holds, stable framing". (O `negative_prompt`, se houver, é um
campo curto e targeted à parte — ver `negative-prompt-discipline`; a prosa do movimento é positiva.)

### Lei 3 — nunca palavra-vazia
"Cinematic", "8K", "4K", "masterpiece", "hyperrealistic", "photorealistic", "best quality" não
dizem nada em linguagem de movimento — são ruído herdado de prompts de imagem (o `dp-quality` e o
`critique` já reprovam quality-words). Se quer um look, **diga em linguagem de câmera**: "slow
push-in", "shallow depth of field holds", "soft natural light unchanged".

### Lei 4 — cue de estabilidade / continuidade
Diga, em positivo, o que **não** muda entre shots: identidade, luz, enquadramento
("stable framing, consistent identity, the existing light unchanged"). É o que ancora a
personagem (que também está travada pelo Element `<<<element_id>>>`) e mantém a continuidade do
reel multishot. Sem cue de estabilidade, o modelo fica livre para derivar entre cortes.

## Vocabulário de câmera (um por shot)

| Movimento | O que faz |
|-----------|-----------|
| push-in | a câmera se aproxima lentamente do sujeito (intimidade, ênfase) |
| pull-back / pull-out | a câmera se afasta (revelação de contexto, respiro) |
| dolly | desliza para frente/trás num eixo |
| pan | gira na horizontal a partir de um ponto fixo |
| tilt | gira na vertical (de baixo pra cima ou o inverso) |
| tracking / track | acompanha o sujeito em movimento |
| arc / orbit | circula ao redor do sujeito |
| crane | sobe/desce verticalmente no espaço |
| zoom | aproxima/afasta pela lente (não pelo corpo da câmera) |
| handheld / gimbal | textura de mão (handheld) ou estabilizada (gimbal) |
| static / locked-off | a câmera não se move; só o sujeito (ou nada) se move |

Escolha **um por shot**. O `angle-variety` garante que os shots variem plano/ângulo entre si; a
disciplina de movimento garante que cada corte tenha um gesto de câmera legível, não uma sopa.

## Disciplina de experimento: uma variável por iteração

Se um render não saiu como esperado, **mude uma coisa de cada vez**: troque o movimento de um
shot, OU ajuste a micro-ação, OU reforce o cue de estabilidade — nunca os três juntos. Mudar tudo
de uma vez torna impossível saber o que corrigiu (ou quebrou). É a mesma disciplina do
parar-e-inspecionar antes de mutar.
