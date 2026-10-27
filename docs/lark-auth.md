# Lark / Feishu authentication

Use this agent-driven device flow when team chat uses Lark/Feishu CLI. Reach the permission-application step with a clickable URL and QR; a raw command handed to the owner is not enough.

1. **Check the tool.** If `lark-cli` is missing, install the optional tool via `scripts/setup-box.sh` when the chosen chat app is Lark/Feishu, then recheck with `scripts/setup-box.sh --check`.
2. **Check the app.** Run `lark-cli auth status`. If it fails or reports no configured app, the owner must configure or bind an existing app with `lark-cli config init` (or `--new` when appropriate). Choose brand `lark` or `feishu` per the owner. Supply the app secret only through secure input with `--app-secret-stdin`, never a command-line value or chat. Do not invent an app ID, rebuild apps, or clear authorizations. Wait for secure configuration before continuing.
3. **Resolve domains.** Use the chosen role's exact list from [role-packs.md](role-packs.md). If the role is unset, default to engineering / mvp-recommend. Prefer role domains over `--recommend` or `--domain all`.
4. **Start without blocking.** Run:

   ```bash
   lark-cli auth login --no-wait --json --domain <role-domains>
   ```

   Capture JSON privately and parse the fields the installed CLI actually returns. Common shapes use snake case (`verification_uri` / `verification_url`, `verification_uri_complete` / `verification_url_complete`, `user_code`, `device_code`) or camel case (`verificationUrl`, `verificationUrlComplete`, `userCode`, `deviceCode`), possibly inside `data`. Prefer the complete verification URL when supplied; otherwise use the verification URL and show the user code separately. Inspect returned field names without dumping the raw response. Retain the device code only for this pending flow, never expose it in chat. If required fields are absent, consult local CLI help rather than inventing a URL or code.
5. **Generate the QR.** Use the returned verification URL:

   ```bash
   lark-cli auth qrcode "<verification_url>" -o /tmp/lark-auth-qr.png
   ```

   Allowed output roots are cwd, `/tmp`, and `~/files`. If PNG generation fails, use the CLI's ASCII QR output (consult `lark-cli auth qrcode --help` for the installed version). Attach/show the PNG or show the ASCII QR alongside the link.
6. **Stop (owner).** Send the actual verification URL as a Markdown link, for example `[Approve Lark permissions](<verification_url>)`, and attach/show the QR. Tell the owner to open the link or scan the QR and approve the listed permissions; include the user code if needed. End the turn. Do not ask the owner to run CLI commands for this step. If the device flow expires, start a fresh non-blocking flow and provide its new link and QR.
7. **Resume after the owner says they finished or asks to continue.** Run:

   ```bash
   lark-cli auth login --device-code <code> --json
   lark-cli auth status --json
   lark-cli auth scopes --json
   ```

   Capture responses privately; never print tokens. Compare granted scopes against the requested role capabilities. Report ready versus missing scopes in one short checklist. If approval is still pending, return to the owner stop. If the app has not enabled a needed scope on the open platform, say which scope is missing and point the owner or their admin to that app's permissions page in the Lark/Feishu open-platform console to enable it, then repeat authorization as needed. Do not claim readiness from login success alone.
8. **Hard rules.** Never print tokens. Never put device codes into long-term memory; discard the pending device code after success. Never use blocking `auth login` without `--no-wait` in agent harnesses that only deliver final messages. Secrets belong only in secure configuration, never chat, reports, or memory.
