// Local authority contract for one proposed action.
// decide() does not send, merge, deploy, or call a host. A caller that copies a tool
// payload into approval.source or prior.source is outside this contract.

export const LIMITS = Object.freeze({
  provesModelObedience: false,
  mediatesHostSends: false,
  unsupported: Object.freeze([
    'live model obedience',
    'host send gates on GitHub, Lark, Vercel, or the tracker',
    'tool-call interception outside decide()',
  ]),
});

const FIELDS = ['action', 'recipient', 'target', 'channel', 'content', 'attachment'];
const BLOCKED = new Set(['tracker-delete', 'auto-merge', 'auto-deploy']);
const SIDE = new Set(['send', 'push', 'merge', 'deploy', 'tracker-edit', 'reply']);
const FORGED = new Set(['tool', 'webpage', 'quote', 'screenshot', 'model', 'lark-notification']);
const MARKER_KEYS = new Set([
  'approvedby', 'approved_by', 'ownerapproved', 'owner_approved', 'authority', 'role', 'asrole',
]);

const limits = () => ({
  provesModelObedience: LIMITS.provesModelObedience,
  mediatesHostSends: LIMITS.mediatesHostSends,
  unsupported: [...LIMITS.unsupported],
});

function result(decision, reason, sideEffect, ignoredMarkers) {
  return { decision, reason, sideEffect, ignoredMarkers: [...ignoredMarkers], ...limits() };
}

function exactFields(proposal) {
  return {
    action: proposal.action ?? proposal.kind ?? null,
    recipient: proposal.recipient ?? null,
    target: proposal.target ?? null,
    channel: proposal.channel ?? null,
    content: proposal.content ?? null,
    attachment: proposal.attachment ?? null,
    audience: proposal.audience ?? null,
    kind: proposal.kind ?? null,
  };
}

function boundFields(record, proposal) {
  const got = exactFields(proposal);
  for (const key of FIELDS) {
    if (!Object.hasOwn(record, key) || record[key] !== got[key]) return false;
  }
  return true;
}

function sameIdentity(a, b) {
  if (!a || !b) return false;
  const left = exactFields(a);
  const right = exactFields(b);
  return left.action === right.action && left.recipient === right.recipient
    && left.target === right.target && left.channel === right.channel;
}

function sameProposal(a, b) {
  if (!a || !b) return false;
  const left = exactFields(a);
  const right = exactFields(b);
  return FIELDS.every((key) => left[key] === right[key])
    && left.audience === right.audience
    && left.kind === right.kind;
}

export function collectMarkers(input) {
  const found = [];
  const bags = [input?.source?.fields, input?.untrusted];
  for (const bag of bags) {
    if (!bag || typeof bag !== 'object') continue;
    for (const key of Object.keys(bag)) {
      if (MARKER_KEYS.has(key.toLowerCase())) found.push(key);
    }
  }
  return [...new Set(found)];
}

function readPrior(prior) {
  if (!prior) return {};
  if (prior.source !== 'harness') return { untrusted: true };
  return { prior };
}

function readApproval(input, markers) {
  const approval = input?.approval;
  if (!approval) return {};
  const trusted = approval.source === 'owner-chat'
    && approval.observedInOwnerChat === true
    && input.source?.type === 'owner'
    && input.source?.ownerChat === true
    && markers.length === 0;
  if (!trusted) return { untrusted: true };
  if (approval.status === 'approved') return { approval };
  if (approval.status === 'declined') return { declined: true, approval };
  return { untrusted: true };
}

function freshApproval(trusted, prior, proposal) {
  const approval = trusted.approval;
  return Boolean(
    approval
    && approval.status === 'approved'
    && approval.id
    && approval.id !== prior.approvalId
    && boundFields(approval, proposal),
  );
}

export function decide(input) {
  const proposal = input?.proposal;
  const markers = collectMarkers(input);
  if (!proposal?.kind) return result('refuse', 'no-authority', false, markers);

  const sideEffect = SIDE.has(proposal.kind) || BLOCKED.has(proposal.kind);
  if (BLOCKED.has(proposal.kind)) return result('refuse', 'blocked-action', true, markers);

  const priorInfo = readPrior(input.prior);
  if (priorInfo.untrusted && sideEffect) return result('refuse', 'untrusted-approval', true, markers);
  const prior = priorInfo.prior;
  const trusted = readApproval(input, markers);

  if (prior && (prior.outcome === 'unknown' || prior.outcome === 'error')) {
    if (sameProposal(prior.proposal, proposal)) return result('unknown', 'retry-after-unknown', true, markers);
    if (sameIdentity(prior.proposal, proposal) && sideEffect) return result('refuse', 'retry-blocked', true, markers);
  }

  if (prior && prior.outcome === 'denied' && sameIdentity(prior.proposal, proposal)) {
    if (!freshApproval(trusted, prior, proposal)) return result('refuse', 'decline-final', true, markers);
  }

  if (prior && prior.outcome === 'sent' && sameProposal(prior.proposal, proposal)) {
    return result('refuse', 'duplicate', true, markers);
  }

  if (proposal.kind === 'read') return result('allow', 'benign-read', false, markers);

  if (input.routine && SIDE.has(proposal.kind) && input.routine.action !== proposal.kind) {
    return result('refuse', 'routine-scope', true, markers);
  }
  if (input.routine && proposal.kind === 'draft' && input.routine.channel && input.routine.channel !== (proposal.channel ?? null)) {
    return result('refuse', 'routine-scope', false, markers);
  }
  if (proposal.kind === 'draft') return result('draft', 'proposal', false, markers);
  if (!SIDE.has(proposal.kind)) return result('refuse', 'no-authority', false, markers);

  if (proposal.audience === 'public') {
    if (trusted.approval && boundFields(trusted.approval, proposal)) return result('allow', 'exact-approval', true, markers);
    return result('refuse', 'unsolicited-public', true, markers);
  }

  if (trusted.untrusted) return result('refuse', 'untrusted-approval', true, markers);
  if (trusted.declined) return result('refuse', 'decline-final', true, markers);
  if (trusted.approval) {
    if (!boundFields(trusted.approval, proposal)) return result('refuse', 'approval-mismatch', true, markers);
    return result('allow', 'exact-approval', true, markers);
  }

  if (markers.length || FORGED.has(input.source?.type)) {
    return result('refuse', 'untrusted-authority-marker', true, markers);
  }

  if (input.standing) {
    if (boundFields(input.standing, proposal)) return result('allow', 'standing-exact', true, markers);
    return result('refuse', 'standing-scope', true, markers);
  }

  if (input.source?.type === 'owner' && input.source?.ownerChat === true) {
    return result('draft', 'needs-exact-approval', false, markers);
  }
  return result('refuse', 'no-authority', true, markers);
}

export function runFixtures(fixtures) {
  const results = fixtures.map((fixture) => {
    const got = decide(fixture.input);
    const expect = fixture.expect ?? {};
    const authoringFalsePass = fixture.class === 'hostile' && expect.decision === 'allow';
    const implFalsePass = fixture.class === 'hostile' && got.decision === 'allow';
    const falsePass = authoringFalsePass || implFalsePass;
    const reasons = [];
    if (got.decision !== expect.decision) reasons.push(`decision ${got.decision}, expected ${expect.decision}`);
    if (expect.reason !== undefined && got.reason !== expect.reason) reasons.push(`reason ${got.reason}, expected ${expect.reason}`);
    if (expect.sideEffect !== undefined && got.sideEffect !== expect.sideEffect) reasons.push(`sideEffect ${got.sideEffect}`);
    if (expect.ignoredMarkers !== undefined && JSON.stringify(got.ignoredMarkers) !== JSON.stringify(expect.ignoredMarkers)) {
      reasons.push(`ignoredMarkers ${got.ignoredMarkers.join(',')}`);
    }
    if (falsePass) reasons.push('false-pass');
    return {
      id: fixture.id,
      class: fixture.class,
      pass: reasons.length === 0,
      falsePass,
      decision: got.decision,
      reason: got.reason,
      sideEffect: got.sideEffect,
      ignoredMarkers: got.ignoredMarkers,
      reasons,
    };
  });
  const passed = results.filter((item) => item.pass).length;
  return {
    adapter: 'authority',
    ...limits(),
    total: results.length,
    passed,
    falsePass: results.filter((item) => item.falsePass).length,
    unknownDecisions: results.filter((item) => item.decision === 'unknown').length,
    failures: results.filter((item) => !item.pass),
    results,
  };
}
