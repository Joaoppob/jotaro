'use strict';

/**
 * custos.cjs — fonte unica de custos do gerador (free tier Higgsfield).
 *
 * Confirmados ao vivo no Higgsfield CLI (2026-06-18):
 *   - imagem (nano_banana_2)             = 2 creditos
 *   - video  (veo3_1_lite, --duration 4) = 4 creditos (default duration=8 = 8 cr!)
 *   - teto free = 10 creditos/dia (pool compartilhado img+video)
 *   - cada cena = 4 segundos de video
 *
 * Quem precisa desses numeros importa daqui — nao recodifica o literal.
 */
module.exports = { IMAGEM: 2, VIDEO: 4, TETO_DIA: 10, DURACAO_CENA_SEG: 4 };
