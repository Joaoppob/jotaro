#!/usr/bin/env bash
set -euo pipefail

# Jotaro Video Generator — setup inicial
# Uso: ./setup.sh

echo "=== Jotaro Video Generator — Setup ==="
echo ""

# --- Node.js ---
if ! command -v node >/dev/null 2>&1; then
  echo "Erro: Node.js nao encontrado. Instale Node.js >= 18 (recomendado 20+): https://nodejs.org"
  exit 1
fi

NODE_MAJOR="$(node -e 'console.log(process.versions.node.split(".")[0])')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Erro: Node.js >= 18 e necessario (encontrado: $(node -v))."
  exit 1
fi
echo "Node.js OK: $(node -v)"

# --- Sem dependencias externas: CommonJS puro, sem npm install necessario ---
echo "Este projeto e CommonJS puro, sem dependencias externas (nao ha node_modules a instalar)."

# --- Roda o verificador do produto ---
echo ""
echo "Rodando o verificador (node scripts/verify.cjs)..."
if node scripts/verify.cjs; then
  echo ""
  echo "Verificacao OK."
else
  echo ""
  echo "Aviso: a verificacao encontrou falhas. Revise a saida acima antes de usar em producao."
fi

echo ""
echo "=== Setup concluido! ==="
echo ""
echo "Proximos passos:"
echo "  1. Abra esta pasta no Claude Code (interface grafica, com navegador disponivel)."
echo "  2. Dentro do Claude Code, rode: /setup"
echo "     (conecta o Higgsfield via MCP connector e confere seu saldo de creditos)"
echo "  3. Rode: /creditos"
echo "     (confirma a conta conectada e o saldo disponivel)"
echo "  4. Fale com o Jotaro: descreva o video ou a imagem que voce quer gerar."
echo "  5. Quer so ver como funciona sem gastar credito? Rode /tutorial ou /simular."
echo ""
echo "Veja CLAUDE.md para o contexto completo do sistema, e README.md para o guia de uso."
