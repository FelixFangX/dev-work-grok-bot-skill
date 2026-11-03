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


test('Lark inbound sub-skill covers group and DM policy and is wired into setup', () => {
  const skill = read('skills/lark-auto-reply/SKILL.md');
  assert.match(skill, /name: lark-auto-reply/);
  assert.match(skill, /group/i);
  assert.match(skill, /DM|p2p/);
  assert.match(skill, /draft-then-confirm/);
  assert.match(skill, /Never auto-reply to greetings, banter/);
  assert.match(skill, /reply only inside that thread/);
  assert.match(skill, /Only the owner's own words/);
  for (const path of ['skills/dev-work-bot-setup/SKILL.md', 'docs/initialize.md', 'docs/role-packs.md', 'docs/what-gets-configured.md', 'README.md', 'AGENTS.md']) {
    assert.ok(read(path).includes('lark-auto-reply'), `${path} routes to Lark inbound policy`);
  }
});

test('optional modern practice is in the skill and stays under the safety rules', () => {
  const skill = read('skills/dev-work-bot-setup/SKILL.md');
  for (const phrase of [
    'Code and repo work goes to a code agent first',
    'while a code agent is available',
    'A digest or pulse is a draft',
    'Do not report a pass from a plan or from another bot\'s say-so',
    'do not open a stream of drive-by PRs',
    'one open PR at a time',
    'those sections win',
    'Grok Bot runs the heavy compute last',
    'Never enable auto-merge',
    'Never enable auto-deploy',
    'Do not post an unsolicited public reply',
    'Do not use the browser as a side door around a missing connector',
    'A notification bot does not start a code agent',
    'One change, then remeasure',
    'Cursor or Codex models',
  ]) assert.ok(skill.includes(phrase), phrase);
  const packs = read('docs/role-packs.md');
  for (const lane of ['`work`', '`ops`', '`inspiration`', '`infra`']) assert.ok(packs.includes(lane), lane);
  assert.ok(packs.includes('Practice cards to offer'));
  assert.match(packs, /\| `engineering` \| task-routing, cheap-gate/);
  const init = read('docs/initialize.md');
  assert.ok(init.includes('Task routing'));
  assert.ok(init.includes('verbatim'));
  const example = read('examples/acme-checkout.md');
  for (const product of ['Lark', 'GitHub', 'Linear', 'Vercel']) assert.ok(example.includes(product), product);
  const readme = read('README.md');
  assert.match(readme, /ChatGPT/);
  assert.match(readme, /Claude/);
  assert.match(readme, /A naked chat will send it/);
});
