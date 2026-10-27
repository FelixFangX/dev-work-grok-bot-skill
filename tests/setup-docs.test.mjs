import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const full = 'application,approval,base,calendar,contact,docs,drive,im,mail,minutes,sheets,slides,task,vc,wiki';
const presets = {
  'mvp-recommend': full,
  engineering: full,
  product: 'im,docs,drive,calendar,contact,task,sheets,wiki,base,slides,minutes,approval',
  qa: 'im,docs,drive,calendar,contact,task,sheets,wiki,base',
  ops: 'im,docs,drive,calendar,contact,task,approval,wiki',
  growth: 'im,docs,drive,calendar,contact,sheets,base,task,wiki',
  marketing: 'im,docs,drive,calendar,contact,sheets,slides,wiki,task',
};

test('role packs expose all stable role ids and exact domain presets', () => {
  const doc = read('docs/role-packs.md');
  for (const [id, domains] of Object.entries(presets)) {
    const section = doc.split(`### ${id}\n`)[1]?.split('\n### ')[0];
    assert.ok(section?.includes(`\`${domains}\``), `${id} domains`);
    if (id !== 'mvp-recommend') assert.ok(doc.includes(`| \`${id}\` |`), `${id} table row`);
    assert.ok(!domains.split(',').some((d) => ['board', 'search', 'offline_access'].includes(d)));
  }
});

test('Lark auth documents non-blocking login, QR handoff, and scope verification', () => {
  const doc = read('docs/lark-auth.md');
  for (const command of [
    'auth login --no-wait --json --domain <role-domains>',
    'auth qrcode "<verification_url>" -o /tmp/lark-auth-qr.png',
    'auth login --device-code <code> --json',
    'auth status --json',
    'auth scopes --json',
  ]) assert.ok(doc.includes(command), command);
  assert.ok(doc.includes('[Approve Lark permissions](<verification_url>)'));
  assert.ok(doc.includes('End the turn.'));
  for (const path of ['docs/initialize.md', 'docs/box-environment.md', 'skills/dev-work-bot-setup/SKILL.md']) {
    assert.ok(read(path).includes('lark-auth.md'), `${path} routes to Lark flow`);
    assert.ok(read(path).includes('role-packs.md'), `${path} routes to role packs`);
  }
});
