'use strict';

const crypto = require('crypto');

function sha256(content) {
  return crypto.createHash('sha256').update(String(content), 'utf8').digest('hex');
}

function sha256File(filepath) {
  const fs = require('fs');
  return sha256(fs.readFileSync(filepath, 'utf8'));
}

function hashArtifact(root, relativePath) {
  const path = require('path');
  return { path: relativePath, hash: sha256File(path.join(root, relativePath)) };
}

function hashArtifacts(root, paths) {
  return paths.map((p) => hashArtifact(root, p));
}

function combinedHash(hashes) {
  return sha256(hashes.map((h) => `${h.path}:${h.hash}`).sort().join('\n'));
}

module.exports = { sha256, sha256File, hashArtifact, hashArtifacts, combinedHash };
