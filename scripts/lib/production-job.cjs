'use strict';

const path = require('path');
const hasher = require('./hash-artifact.cjs');
const { escapeYamlDoubleQuoted } = require('./yaml-escape.cjs');

function createJob({ project_id, generation_id, approval_token_hash, prompt_hash, tool_name, model, input_prompt_path, input_manifest_path, params }) {
  return {
    project_id,
    generation_id,
    approval_token_hash,
    prompt_hash: prompt_hash || null,
    tool_server: 'higgsfield',
    tool_name,
    model,
    input_prompt_path,
    input_manifest_path,
    params: {
      aspect_ratio: params.aspect_ratio || '9:16',
      duration_seconds: params.duration_seconds || null,
      seed: params.seed || null,
    },
    status: 'queued',
    attempts: [],
    outputs: [],
  };
}

function startAttempt(job) {
  const attempt = {
    started_at: new Date().toISOString(),
    status: 'running',
    output_paths: [],
    cost: null,
    error: null,
  };
  return { ...job, status: 'running', attempts: [...(job.attempts || []), attempt] };
}

function finishAttempt(job, { status, output_paths, cost, error }) {
  const attempts = [...(job.attempts || [])];
  if (attempts.length === 0) return job;
  const last = { ...attempts[attempts.length - 1] };
  last.status = status;
  last.finished_at = new Date().toISOString();
  if (output_paths) last.output_paths = output_paths;
  if (cost !== undefined) last.cost = cost;
  if (error) last.error = error;
  attempts[attempts.length - 1] = last;
  return {
    ...job,
    status: status === 'succeeded' ? 'succeeded' : status === 'failed' ? 'failed' : 'running',
    attempts,
  };
}

function recordOutput(job, outputPath, sha256) {
  const existing = (job.outputs || []).filter((o) => o.path !== outputPath);
  return {
    ...job,
    outputs: [...existing, { path: outputPath, sha256: sha256 || hasher.sha256File(outputPath) }],
  };
}

function canRetry(job, maxAttempts) {
  const max = maxAttempts || 3;
  if (job.status === 'succeeded') return false;
  if (job.status === 'cancelled') return false;
  const attempts = job.attempts || [];
  const failures = attempts.filter((a) => a.status === 'failed');
  return failures.length < max;
}

function toYaml(job) {
  const esc = escapeYamlDoubleQuoted;
  const lines = [];
  lines.push(`production_job:`);
  lines.push(`  project_id: ${job.project_id}`);
  lines.push(`  generation_id: ${job.generation_id}`);
  lines.push(`  approval_token_hash: "${esc(job.approval_token_hash)}"`);
  if (job.prompt_hash) lines.push(`  prompt_hash: "${esc(job.prompt_hash)}"`);
  lines.push(`  tool_server: ${job.tool_server}`);
  lines.push(`  tool_name: ${job.tool_name}`);
  lines.push(`  model: ${job.model}`);
  lines.push(`  input_prompt_path: "${esc(job.input_prompt_path)}"`);
  lines.push(`  input_manifest_path: "${esc(job.input_manifest_path)}"`);
  lines.push(`  params:`);
  lines.push(`    aspect_ratio: "${esc(job.params.aspect_ratio)}"`);
  if (job.params.duration_seconds) lines.push(`    duration_seconds: ${job.params.duration_seconds}`);
  if (job.params.seed) lines.push(`    seed: ${job.params.seed}`);
  lines.push(`  status: ${job.status}`);
  if (job.attempts.length > 0) {
    lines.push(`  attempts:`);
    for (const a of job.attempts) {
      lines.push(`    - started_at: "${esc(a.started_at)}"`);
      if (a.finished_at) lines.push(`      finished_at: "${esc(a.finished_at)}"`);
      lines.push(`      status: ${a.status}`);
      if (a.cost !== null && a.cost !== undefined) lines.push(`      cost: ${a.cost}`);
      if (a.error) lines.push(`      error: "${esc(a.error)}"`);
    }
  }
  if (job.outputs.length > 0) {
    lines.push(`  outputs:`);
    for (const o of job.outputs) {
      lines.push(`    - path: ${o.path}`);
      lines.push(`      sha256: "${esc(o.sha256)}"`);
    }
  }
  return lines.join('\n');
}

function serializeMetadataForVerify(job) {
  return {
    project_id: job.project_id,
    generation_id: job.generation_id,
    tool_name: job.tool_name,
    model: job.model,
    status: job.status,
    attempt_count: (job.attempts || []).length,
    output_count: (job.outputs || []).length,
    has_token_hash: !!(job.approval_token_hash && job.approval_token_hash.length >= 8),
  };
}

const PRODUCTION_JOB = { createJob, startAttempt, finishAttempt, recordOutput, canRetry, toYaml, serializeMetadataForVerify };
module.exports = PRODUCTION_JOB;
