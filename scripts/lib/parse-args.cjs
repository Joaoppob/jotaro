'use strict';

/**
 * parse-args.cjs — parser comum de flags --chave [valor] dos scripts do gerador.
 *
 * Convencao identica a que estava duplicada em 5 scripts:
 *   --chave valor   -> { chave: "valor" }
 *   --flag          -> { flag: true }   (quando o proximo token e outra flag ou o fim)
 *
 * startIndex controla a partir de qual argv comeca o parse:
 *   3 -> scripts que reservam argv[2] para o subcomando (pipeline-state,
 *        review-cadence, jotaro-profile)
 *   2 -> scripts sem subcomando (preflight, video-join)
 *
 * @param {string[]} argv         normalmente process.argv
 * @param {number}   [startIndex] indice inicial (default 2)
 * @returns {Object<string, string|true>}
 */
module.exports = function parseArgs(argv, startIndex = 2) {
  const out = {};
  for (let i = startIndex; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
};
