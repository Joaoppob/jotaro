'use strict';

const SPECIALIST_ORDER = [
  'historia',
  'mundo',
  'enredo',
  'camera',
  'montagem',
  'realismo',
  'audio',
];

function getIndex(stage) {
  const idx = SPECIALIST_ORDER.indexOf(stage);
  if (idx === -1) throw new Error(`Etapa desconhecida: ${stage}`);
  return idx;
}

function nextStage(stage) {
  const idx = getIndex(stage);
  return SPECIALIST_ORDER[idx + 1] || 'prompt-smith';
}

function prevStage(stage) {
  const idx = getIndex(stage);
  return idx > 0 ? SPECIALIST_ORDER[idx - 1] : null;
}

function isFirst(stage) {
  return getIndex(stage) === 0;
}

function isLast(stage) {
  return getIndex(stage) === SPECIALIST_ORDER.length - 1;
}

function chainOrder() {
  return [...SPECIALIST_ORDER];
}

function stagePosition(stage) {
  const ord = chainOrder();
  return { index: getIndex(stage), total: ord.length, next: nextStage(stage), prev: prevStage(stage) };
}

const CHAIN = { order: chainOrder, getIndex, nextStage, prevStage, isFirst, isLast, stagePosition };
module.exports = CHAIN;
