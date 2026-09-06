# Hawkins Junk Removal (site)

Static marketing site deployed on Vercel from this repo (`main` -> production).

## Serverless webhooks

| Endpoint | Purpose |
|---|---|
| `/api/quote-webhook` | Forwards FormSubmit quote JSON to Cursor automation |
| `/api/vapi-call-webhook` | Forwards Vapi `end-of-call-report` to Cursor automation |

### Quote webhook env (Vercel)

- `HAWKINS_QUOTE_WEBHOOK_KEY` (or `HAWKINS_QUOTE_HOOK_KEY`) - Bearer token for Cursor. Never commit.

### Vapi call webhook env (Vercel)

- `HAWKINS_CALL_WEBHOOK_URL` - Cursor automation webhook URL (**required**; code leaves TARGET empty)
- `HAWKINS_CALL_WEBHOOK_KEY` - Bearer token for Cursor (**required**)
- `HAWKINS_VAPI_SHARED_SECRET` - optional; if set, incoming requests must send matching `Authorization: Bearer ...` or `X-Vapi-Secret`

Point Vapi Server URL / end-of-call-report webhook at:

`https://www.hawkinsjunkremoval.com/api/vapi-call-webhook`

Non-`end-of-call-report` message types are acknowledged with `{ ok: true, skipped: true }`. Upstream failures still return HTTP 200 to Vapi (informational webhook).