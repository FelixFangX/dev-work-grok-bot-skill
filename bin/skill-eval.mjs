#!/usr/bin/env node
// Usage: skill-eval [--adapter coverage|model] [--skill path] [--scenarios path] [--json] [--out file]
// model adapter: LLM_API_KEY or LLM_BASE_URL, LLM_MODEL (default gpt-4o-mini), LLM_MAX_TOKENS
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { coverage, openAICompatible, runModel, summarize } from '../src/evals.mjs';

const root = new URL('..', import.meta.url).pathname;
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const adapter = opt('--adapter', 'coverage');
const skillPath = resolve(opt('--skill', root + 'skills/dev-work-bot-setup/SKILL.md'));
const scenarios = JSON.parse(readFileSync(resolve(opt('--scenarios', root + 'evals/scenarios.json')), 'utf8'));
const skill = [readFileSync(skillPath, 'utf8'), ...(args.includes('--skill') ? [] : [readFileSync(root + 'skills/lark-auto-reply/SKILL.md', 'utf8')])].join('\n\n');

let results, model, modelMetadata;
if (adapter === 'coverage') results = coverage(skill, scenarios);
else if (adapter === 'model') {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey && !process.env.LLM_BASE_URL) { console.error('model adapter needs LLM_API_KEY or LLM_BASE_URL (and optionally LLM_MODEL, LLM_MAX_TOKENS)'); process.exit(2); }
  model = process.env.LLM_MODEL || 'gpt-4o-mini';
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.openai.com/v1';
  const tokenLimit = Number(process.env.LLM_MAX_TOKENS);
  const maxTokens = Number.isSafeInteger(tokenLimit) && tokenLimit > 0 ? tokenLimit : undefined;
  modelMetadata = { date: new Date().toISOString().slice(0, 10), baseUrlHost: new URL(baseUrl).host, ...(maxTokens !== undefined ? { maxTokens } : {}), temperature: 0 };
  results = await runModel(scenarios, skill, openAICompatible({ apiKey, baseUrl, model, maxTokens }));
} else { console.error(`unknown adapter ${adapter}`); process.exit(2); }

const summary = { adapter, ...(model ? { model, ...modelMetadata } : {}), scenarios: scenarios.length, ...summarize(results) };
const outFile = opt('--out');
if (outFile) writeFileSync(resolve(outFile), JSON.stringify({ ...summary, results }, null, 2) + '\n');
if (args.includes('--json')) console.log(JSON.stringify(summary));
else {
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.id}${r.pass ? '' : '  ' + (r.missing?.join('; ') || r.reasons?.join('; ') || r.error)}`);
  console.log(`${adapter}: ${summary.passed}/${summary.total} passed (${(summary.passRate * 100).toFixed(1)}%)`);
}
process.exit(summary.passed === summary.total ? 0 : 1);
