# Example: engineering work bot (fictional)

Acme Widgets, its people, repos, and URLs are invented. The connectors are the ones a work bot actually uses: Lark, GitHub, Linear, and Vercel. Nothing here is a secret. Nothing was sent.

Role pack: `engineering`. Lane: `work`.

## Interview answers

| Question | Saved answer |
|---|---|
| Focus area | Checkout redesign. Done when Linear `CHK-100` and its sub-issues are closed |
| Repos and branches | `acme/web-app`, `acme/payments-api`. Integration branch `checkout-v2`. One open PR: `acme/web-app` #128 |
| Voice | Gricean card, English |
| Team chat | Lark. Signature `— Sam (via bot)`. Replies stay in the thread |
| Key people | Priya Rao, eng lead: one context line. Leo Martins, design: include the preview |
| Silent bots | `deploy-bot`, `ci-notify` |
| Testing | Vercel preview `https://web-app-git-<branch>-acme.example.app`. Payments API tests, then the cart flow in the browser. Bypass secret only through secure input |

## Connectors

Accepted connect cards: GitHub (`gh`), Linear team `CHK`, Lark (URL and QR, then `lark-auto-reply`), Vercel for the preview URL.

Not connected: Sentry. The owner said no.

Secrets file, values never shown: `~/.config/dev-work/preview.env`, mode 600, directory mode 700.

## Cards copied into memory

Accepted: task-routing, cheap-gate, execution-rigor, gricean, one-open-pr, connector-first, morning digest, CI red pulse.

Declined: inspiration bot, end-of-day summary, webhook wake, a pulse into the partners group.

Auto-merge off. Auto-deploy off. No unsolicited public reply.

### Handoff the bot wrote for Cursor

Repo `acme/web-app`, base `checkout-v2`, one change: round the cart total to the cent. Prove it with the payments API tests and the cart flow on the Vercel preview. Bring back the diff and the test output. No credentials in the task.

The bot did not edit the repo itself. Grok Bot was not asked to run the suite.

### What "fixed" required

`gh pr checks` on #128, the diff, and the cart flow opened on the Vercel preview. The bot did not say "tests passed" from the plan.

### Morning digest draft, still in Sam's private Lark chat

Checkout is one open PR. Payments API tests are red.

- GitHub: `acme/web-app` #128 open. No second PR.
- Linear: `CHK-100` in progress.
- Lark: no new mentions.
- Vercel: preview URL is up. Cart flow not checked after the red tests.

Sam has not confirmed it. It was not posted to the group.

### CI red pulse draft, same private chat

`payments-api` failed on #128. Log URL came from `gh pr checks`. No code agent was started. `ci-notify` in the Lark group was closed.

### Draft for Priya, not sent

> Priya, context: cart totals were off by one cent on the preview.
> The diff is on #128. API tests are red (9/12). The cart flow is not checked yet.
> — Sam (via bot)

The reply target is Priya's thread, not the main group.
