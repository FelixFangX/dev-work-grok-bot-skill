# Contributing

Node 20+ only, zero dependencies. CI runs on Node 20 and 22.

## Run checks before opening a PR

```bash
npm test                 # node:test unit & doc-sync specs
npm run check            # frontmatter, secret/PII scan, box-environment sync
npm run eval             # 100% scenario rule-string coverage across shipped skills
npm run eval:authority   # decide() exact-approval fixtures (fails on any false pass)
```

For machine-readable output, pass `--json` to `node bin/skill-check.mjs .` or `node bin/skill-eval.mjs`.

Optional local privacy check (never commit the denylist file):

```bash
node bin/skill-check.mjs . --denylist my-private-terms.txt
```

Optional live-model eval against an OpenAI-compatible endpoint:

```bash
LLM_API_KEY=... LLM_MODEL=gpt-4o-mini npm run eval:model
LLM_BASE_URL=http://localhost:11434/v1 LLM_MODEL=local-model LLM_MAX_TOKENS=512 npm run eval:model
```

Only publish model eval numbers from a real run, and review saved replies before committing or sharing them.

## Rules for changes

- **Keep skills and docs generic.** No personal names, tokens, internal URLs, phone numbers, or email addresses (`npm run check` enforces this; `SECURITY.md` is the only file exempted for a security contact email).
- **Safety rules and coverage stay in sync.** If you change a safety rule in `skills/dev-work-bot-setup/SKILL.md` or `skills/lark-auto-reply/SKILL.md`, update `evals/scenarios.json` in the same PR and regenerate `evals/results-coverage.json`:
  ```bash
  node bin/skill-eval.mjs --out evals/results-coverage.json
  ```
- **Authority fixtures stay honest.** `src/authority.mjs` (`decide()`) is a local reference contract. Any hostile fixture returning `allow` is a false pass. Never claim `authority` or `coverage` proves live model obedience or mediates host send gates.
- **Box environment stays in sync.** Tool lists and tiers in `scripts/setup-box.sh` and `docs/box-environment.md` must match (`npm run check` fails on drift). `setup-box.sh --check` must never install anything or print token values.
- **Keep tests offline.** Fake LLM calls in `tests/`.
- **PR hygiene.** Keep PRs focused, with English titles and commit messages. See [AGENTS.md](AGENTS.md) for repo conventions.
