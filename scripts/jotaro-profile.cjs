#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const parseArgs = require('./lib/parse-args.cjs');

const STATE_REL = path.join('.claude', 'state', '.jotaro-profile.json');

function statePath(root) {
  return path.resolve(root || '.', STATE_REL);
}

function emptyProfile() {
  return {
    versao: 1,
    primeiro_run_concluido: false,
    modo_expert: false,
    ultima_marca_usada: null,
    atualizado_em: new Date().toISOString(),
  };
}

function load(root) {
  const p = statePath(root);
  if (!fs.existsSync(p)) return emptyProfile();
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Object.assign(emptyProfile(), obj, { versao: 1 });
  } catch (_) {
    try {
      fs.copyFileSync(p, `${p}.corrupt-${Date.now()}`);
    } catch (_) {
      // ignore
    }
    return emptyProfile();
  }
}

function save(root, profile) {
  const p = statePath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  profile.atualizado_em = new Date().toISOString();
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(profile, null, 2) + '\n', 'utf8');
  // fallback copy+unlink NAO e atomico (aceitavel: state single-agent sequencial)
  try {
    fs.renameSync(tmp, p);
  } catch (e) {
    if (e.code === 'EXDEV') {
      fs.copyFileSync(tmp, p);
      fs.unlinkSync(tmp);
      process.stderr.write('[jotaro-profile] EXDEV: fallback copy+unlink para ' + p + '\n');
    } else {
      throw e;
    }
  }
  return profile;
}

function status(root) {
  return load(root);
}

function markRun(root, args) {
  const profile = load(root);
  profile.primeiro_run_concluido = true;
  if (args.marca) profile.ultima_marca_usada = args.marca;
  return save(root, profile);
}

function setExpert(root, value) {
  const profile = load(root);
  profile.modo_expert = value;
  return save(root, profile);
}

function reset(root) {
  return save(root, emptyProfile());
}

if (require.main === module) {
  const sub = process.argv[2] || 'status';
  const args = parseArgs(process.argv, 3);
  const root = args.root || '.';
  let result;
  switch (sub) {
    case 'status':
      result = status(root);
      break;
    case 'mark-run':
      result = markRun(root, args);
      break;
    case 'expert-on':
      result = setExpert(root, true);
      break;
    case 'expert-off':
      result = setExpert(root, false);
      break;
    case 'reset':
      result = reset(root);
      break;
    default:
      result = { erro: 'subcomando desconhecido', uso: 'status|mark-run|expert-on|expert-off|reset' };
  }
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  process.exit(result.erro ? 1 : 0);
}

module.exports = { STATE_REL, statePath, load, status, markRun, setExpert, reset };
