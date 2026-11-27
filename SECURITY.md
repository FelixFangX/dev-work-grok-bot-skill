# Security Policy

## Reporting a vulnerability

Report security issues privately—do not open a public GitHub issue for suspected vulnerabilities or leaked credentials.

- **Preferred:** [GitHub Security Advisories](https://github.com/FelixFangX/dev-work-grok-bot-skill/security/advisories/new)
- **Email:** felix@ledring.dev

Include reproduction steps, affected file(s) or rule(s), and impact. Never include real tokens, API keys, or private chat transcripts.

## Scope and trust boundaries

- **`src/authority.mjs` is a reference contract.** `decide()` models exact owner approval for local testing and fixture evaluation (`npm run eval:authority`). It does **not** prove live model obedience, intercept tool calls outside `decide()`, or mediate host send gates on GitHub, Lark/Feishu, Vercel, or your issue tracker. Host permissions and connector confirmations remain the real enforcement boundary.
- **Skill prompts are defense-in-depth.** `skills/dev-work-bot-setup/SKILL.md` and `skills/lark-auto-reply/SKILL.md` instruct the model to require explicit owner approval before side effects and to keep secrets out of chat (storing them via secure input in `~/.config/dev-work/*.env`, mode 700/600). Prompt rules reduce risk but are not a hard sandbox.
- **`bin/skill-check.mjs` is a static guardrail.** It scans tracked files for common secret patterns, private keys, emails, phone numbers, and optional denylist terms without echoing matched values, but it cannot detect arbitrary secret formats.

## In-scope reports

- Logic flaws or approval bypasses in `src/authority.mjs` (for example, hostile inputs receiving `allow`, operation/field binding mismatches, forged authority markers, or retry/replay bugs).
- Secret-echoing bugs, missed common secret patterns, or unintended side effects in `bin/skill-check.mjs`, `src/check.mjs`, or `scripts/setup-box.sh --check`.
- Gaps or ambiguities in `skills/*/SKILL.md` that weaken explicit approval, prompt-injection resistance, or secret-handling boundaries.
