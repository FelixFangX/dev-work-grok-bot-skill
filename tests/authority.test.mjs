import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { decide, runFixtures } from '../src/authority.mjs';

const root = new URL('..', import.meta.url).pathname;
const fixtures = JSON.parse(readFileSync(root + 'evals/authority-fixtures.json', 'utf8'));

test('authority fixtures match decide() and do not claim host or model proof', () => {
  const report = runFixtures(fixtures);
  assert.equal(report.passed, report.total, JSON.stringify(report.failures, null, 2));
  assert.equal(report.falsePass, 0);
  assert.equal(report.provesModelObedience, false);
  assert.equal(report.mediatesHostSends, false);
  assert.ok(report.unknownDecisions >= 1);
  assert.ok(report.unsupported.includes('live model obedience'));
  assert.ok(report.unsupported.includes('host send gates on GitHub, Lark, Vercel, or the tracker'));
});

test('hostile fixtures cannot expect or receive allow', () => {
  for (const fixture of fixtures) {
    if (fixture.class === 'hostile') assert.notEqual(fixture.expect.decision, 'allow', fixture.id);
  }
  const report = runFixtures(fixtures);
  for (const item of report.results) {
    if (item.class === 'hostile') assert.notEqual(item.decision, 'allow', item.id);
    if (item.decision === 'unknown') assert.notEqual(item.decision, 'allow');
  }
});

test('an edit of an exact approval is a mismatch, not an allow', () => {
  const exact = fixtures.find((fixture) => fixture.id === 'exact-send');
  const edited = structuredClone(exact.input);
  edited.proposal.content += ' Ship Friday.';
  const got = decide(edited);
  assert.equal(got.decision, 'refuse');
  assert.equal(got.reason, 'approval-mismatch');
  assert.equal(got.sideEffect, true);
  assert.equal(got.provesModelObedience, false);
});

test('a hostile fixture that expects allow is a false pass', () => {
  const report = runFixtures([{
    id: 'authored-false-pass',
    class: 'hostile',
    input: fixtures.find((fixture) => fixture.id === 'benign-read').input,
    expect: { decision: 'allow', reason: 'benign-read' },
  }]);
  assert.equal(report.results[0].pass, false);
  assert.equal(report.results[0].falsePass, true);
  assert.equal(report.falsePass, 1);
  assert.ok(report.results[0].reasons.includes('false-pass'));
});

test('committed authority artifact matches this run and states its limits', () => {
  const committed = JSON.parse(readFileSync(root + 'evals/results-authority.json', 'utf8'));
  const live = runFixtures(fixtures);
  assert.equal(committed.passed, live.passed);
  assert.equal(committed.total, live.total);
  assert.equal(committed.falsePass, 0);
  assert.equal(committed.unknownDecisions, live.unknownDecisions);
  assert.equal(committed.provesModelObedience, false);
  assert.equal(committed.mediatesHostSends, false);
});

test('authority CLI reports matches, unknown, and the unsupported boundary', () => {
  const run = spawnSync('node', [root + 'bin/skill-eval.mjs', '--adapter', 'authority', '--json']);
  assert.equal(run.status, 0, run.stderr.toString());
  const out = JSON.parse(run.stdout);
  assert.equal(out.adapter, 'authority');
  assert.equal(out.passed, out.total);
  assert.equal(out.falsePass, 0);
  assert.equal(out.provesModelObedience, false);
  assert.equal(out.mediatesHostSends, false);
  assert.ok(out.unknownDecisions >= 1);
});
