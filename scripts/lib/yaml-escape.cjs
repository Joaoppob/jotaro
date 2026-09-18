'use strict';

/**
 * yaml-escape.cjs — helper unico de escaping para valores livres interpolados
 * em escalares YAML entre aspas duplas (`"..."`).
 *
 * PROBLEMA QUE RESOLVE: approve-generation.cjs (toYamlApprovalRecord) e
 * production-job.cjs (toYaml) escreviam campos de texto livre (--approved-by,
 * --notes, mensagens de erro de MCP) direto dentro de `"..."` sem nenhum
 * escaping. Um valor contendo `"` e uma quebra de linha fabrica chaves YAML
 * extras/duplicadas quando o arquivo e relido por scripts/lib/yaml-lite.cjs
 * (que usa semantica de ultima-chave-vence em duplicatas) — buraco de
 * integridade num artefato que deveria ser auditavel.
 *
 * scripts/lib/yaml-lite.cjs e um parser minimo, sem dependencia externa, que
 * ate a correcao deste bug nao interpretava NENHUMA sequencia de escape (so
 * fazia `value.slice(1, -1)` pra tirar as aspas). Corrigimos os dois lados:
 * este helper escapa na escrita (backslash primeiro, depois aspas duplas,
 * depois quebras de linha viram `\n` literal de 2 caracteres) e
 * yaml-lite.cjs agora desescapa `\\`, `\"` e `\n`/`\t` na leitura — assim o
 * round-trip devolve exatamente a string original, e uma quebra de linha ou
 * aspas dupla embutida no valor nunca mais quebra a estrutura do arquivo em
 * linhas/chaves extras.
 *
 * Uso: sempre que um campo de texto livre (nao gerado pelo proprio sistema,
 * ex.: vindo de CLI args ou de uma mensagem de erro externa) for interpolado
 * dentro de um escalar `"..."` em YAML escrito a mao por este projeto.
 */

function escapeYamlDoubleQuoted(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\\/g, '\\\\') // backslash primeiro, senao dobra os escapes seguintes
    .replace(/"/g, '\\"') // aspas duplas: fecham o escalar se nao escapadas
    .replace(/\r\n/g, '\\n') // CRLF -> \n literal (2 chars), nunca quebra de linha real
    .replace(/\n/g, '\\n') // LF -> \n literal
    .replace(/\r/g, '\\n') // CR solto -> \n literal
    .replace(/\t/g, '\\t'); // tab -> \t literal, por seguranca/legibilidade
}

module.exports = { escapeYamlDoubleQuoted };
