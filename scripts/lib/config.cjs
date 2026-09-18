'use strict';

/**
 * config.cjs — knobs editaveis por quem redistribui o produto.
 *
 * Ao contrario de custos.cjs (FATO fixo do free tier, ancorado no verify),
 * estes valores sao CONFIG: quem publicar uma copia do gerador pode ajusta-los
 * sem quebrar nenhum check. NAO sao ancorados no verify de proposito —
 * ancorar tiraria a editabilidade.
 *
 *   REVIEW_SUGGEST_AFTER — apos quantos fluxos sem revisao a cadencia passa a
 *     sugerir/obrigar a revisao (review-cadence.cjs). Default 2.
 */
module.exports = { REVIEW_SUGGEST_AFTER: 2 };
