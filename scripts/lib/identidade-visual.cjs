#!/usr/bin/env node
'use strict';

/*
 * identidade-visual.cjs — deteccao da biblioteca de personagens (asset-first, Frente 2/4).
 *
 * Convencao de pastas (ver references/asset-first-architecture.md):
 *
 *   projects/<proj>/RAG/identidade-visual/
 *     marca/            # refs de marca (produto, logo, paleta) — NAO e personagem
 *     <personagem>/     # nina/ lea/ duda/ — shots de referencia da personagem
 *       <arquivo>.png
 *
 *   identidade-visual/ PLANO (imagens soltas, sem subpastas) = sujeito unico (o mago):
 *   retrocompat, modo `geracao`.
 *
 * Este helper e PURO (so filesystem, sem rede/ambiente). Fonte unica da deteccao
 * usada por intake-state.cjs (campos tem_personagem/personagens/modo_visual) e por
 * prestart.cjs (personagens/tem_biblioteca por projeto).
 */

const fs = require('fs');
const path = require('path');

const IMAGE_RE = /\.(png|jpg|jpeg|webp)$/i;
// subpasta reservada para refs de marca; nao conta como personagem.
const MARCA_DIR = 'marca';

function dirHasImage(dirAbs) {
  let entries;
  try {
    entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  } catch (_) {
    return false;
  }
  return entries.some((e) => e.isFile() && IMAGE_RE.test(e.name));
}

/*
 * Inspeciona <root>/RAG/identidade-visual/ e devolve:
 *   {
 *     existe: bool,                 // a pasta identidade-visual/ existe
 *     personagens: [string],        // subpastas (exceto marca/) que contem imagem, ordenadas
 *     tem_personagem: bool,         // personagens.length > 0
 *     tem_marca: bool,              // subpasta marca/ com imagem
 *     plano_tem_imagem: bool,       // imagens soltas na raiz (sujeito unico / mago)
 *     modo_visual: "biblioteca"|"geracao",
 *   }
 *
 * modo_visual = "biblioteca" sse ha ao menos uma subpasta de personagem populada;
 * senao "geracao" (legado/default, incl. pasta plana do mago e pasta vazia).
 */
function detect(root) {
  const baseAbs = path.resolve(root || '.', 'RAG', 'identidade-visual');
  const out = {
    existe: false,
    personagens: [],
    tem_personagem: false,
    tem_marca: false,
    plano_tem_imagem: false,
    modo_visual: 'geracao',
  };
  let entries;
  try {
    entries = fs.readdirSync(baseAbs, { withFileTypes: true });
  } catch (_) {
    return out; // pasta ausente: geracao por padrao
  }
  out.existe = true;
  out.plano_tem_imagem = entries.some((e) => e.isFile() && IMAGE_RE.test(e.name));

  const personagens = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const nome = e.name;
    const sub = path.join(baseAbs, nome);
    if (!dirHasImage(sub)) continue;
    if (nome.toLowerCase() === MARCA_DIR) {
      out.tem_marca = true;
      continue;
    }
    personagens.push(nome);
  }
  personagens.sort((a, b) => a.localeCompare(b));
  out.personagens = personagens;
  out.tem_personagem = personagens.length > 0;
  out.modo_visual = out.tem_personagem ? 'biblioteca' : 'geracao';
  return out;
}

module.exports = {
  IMAGE_RE,
  MARCA_DIR,
  dirHasImage,
  detect,
};
