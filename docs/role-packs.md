# Role packs

Choose and save one stable role id during question 0. Every role shares team chat (Lark/Feishu or Slack/Teams), draft-then-confirm messaging, the skill safety rules, and secrets in `~/.config/dev-work` (directory mode 700, env files mode 600). Required connectors describe the role workflow; offer optional connectors only when the work needs them. For team chat, use a connector/plugin or Lark/Feishu CLI when that is the chosen app.

| Role id | Focus of work | Required connectors / CLIs | Optional connectors / CLIs | Interview emphasis (questions 1–6) | Testing posture |
|---|---|---|---|---|---|
| `product` | Prioritize outcomes, shape requirements, and coordinate delivery. | tracker; team chat | GitHub; Mixpanel | 1, 3–5 emphasized; 2 and 6 light | light |
| `engineering` | Build and review software, investigate failures, and validate delivery. | GitHub; tracker; team chat | Sentry; Vercel; Mixpanel | 1–6 emphasized | full preview API+UI |
| `qa` | Assess release quality, reproduce defects, and track coverage. | tracker; team chat | GitHub; Sentry; Vercel | 1, 2, 4–6 emphasized; 3 light | full preview API+UI |
| `ops` | Maintain service reliability and coordinate incident response and operations. | tracker; team chat | GitHub; Sentry; Vercel | 1, 4–6 emphasized; 2 and 3 light | light |
| `growth` | Measure acquisition and conversion, and coordinate growth and advertising experiments. | tracker; team chat | Mixpanel; GitHub | 1, 3–5 emphasized; 2 light; 6 analytics only | analytics-only |
| `marketing` | Plan campaigns, prepare content, and coordinate launches and communications. | team chat | tracker; GitHub; Mixpanel | 1, 3–5 emphasized; 2 and 6 optional | none |

## Interview and testing

Questions are 1 focus area, 2 repos and branches, 3 voice, 4 team chat, 5 reply rules, and 6 testing. Ask question 0 (role) first. Save answers to profile memory. Light questions need only enough detail for the work; skip optional questions when irrelevant and record that choice. Full preview API+UI means API tests against PR previews and browser checks; light means targeted checks for the task; analytics-only means validating metrics and experiment data; none means no default testing setup. The owner can refine the posture.

## Lark domain presets

Pass the selected comma-separated list to `lark-cli auth login --domain …` via [lark-auth.md](lark-auth.md). Prefer the role pack over `--recommend` or `--domain all` so non-engineering roles do not over-request. If role is unset, use engineering / mvp-recommend, then confirm and save the role during the interview.

### mvp-recommend

Default full work pack, mirrored from a real engineering work bot’s granted domains:

`application,approval,base,calendar,contact,docs,drive,im,mail,minutes,sheets,slides,task,vc,wiki`

### product

`im,docs,drive,calendar,contact,task,sheets,wiki,base,slides,minutes,approval`

### engineering

`application,approval,base,calendar,contact,docs,drive,im,mail,minutes,sheets,slides,task,vc,wiki`

### qa

`im,docs,drive,calendar,contact,task,sheets,wiki,base`

### ops

`im,docs,drive,calendar,contact,task,approval,wiki`

### growth

`im,docs,drive,calendar,contact,sheets,base,task,wiki`

### marketing

`im,docs,drive,calendar,contact,sheets,slides,wiki,task`

`board`/`search`/`offline_access` may appear on tokens but are not `--domain` values; do not list them as domains. Domain selection requests permissions; verify the actual granted scopes after approval.
