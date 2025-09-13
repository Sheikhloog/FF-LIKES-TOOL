# Secure Free Fire Likes Tool (Vercel-ready)

This package contains a frontend and serverless backend that uses your **server-side** tokens (kept secret in Vercel env) to send Free Fire likes.

## Files in this ZIP
- `index.html` - Frontend: keep UI as-is; calls `/api/send` on submit.
- `api/send.js` - Serverless function (Vercel) that reads `TOKENS_JSON` from environment, verifies Cloudflare Turnstile, and attempts likes using tokens.
- `tokens_one_line.json` - Your merged tokens (one-line). **DO NOT commit this file to a public repo.** Use it to paste into Vercel env or keep locally.

## Setup (recommended, secure)
1. Create a new private GitHub repo and push `index.html` and `api/send.js` (do NOT push `tokens_one_line.json`).
2. Import the repo into Vercel and deploy.
3. In Vercel Project > Settings > Environment Variables add:
   - `CF_SECRET_KEY` = your Cloudflare Turnstile **secret** key
   - `TOKENS_JSON` = paste the entire contents of `tokens_one_line.json` (one-line JSON array). **Paste as value, no extra quotes.**
   - `PROVIDER_URL` = default is `https://proapis.hlgamingofficial.com/main/games/freefire/likes/api`
   - `PROVIDER_AUTH_STYLE` = `field` (default) or `bearer`
   - `PROVIDER_API_FIELD` = `api` (when using field style)
   - Optional: `ATTEMPT_LIMIT` (e.g. 12), `RATE_MS` (ms between attempts, e.g. 700)

## Notes & Security
- Do NOT put `TOKENS_JSON` in your public repo. Use Vercel environment variables to keep tokens secret.
- `tokens_one_line.json` is included here for convenience so you can easily copy-paste into Vercel env; delete it after use.
- The function defaults to sending 190-200 likes (randomized). Adjust code if provider expects different params.
- Monitor Vercel logs for errors (invalid auth, rate limits, etc.).

## Quick deploy
1. Push to GitHub (exclude tokens_one_line.json).
2. Link repo to Vercel, deploy.
3. Add env vars as above.
4. Open site, enter a target UID, verify Turnstile, click Submit.
