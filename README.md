# FF-like-simulator (Demo)

This project is a **legal demo** that simulates adding "likes" to a UID inside this website's database only.
It does **not** interact with or modify any external Free Fire accounts or use any third-party tokens.

## Features
- Users submit UID and receive +100 internal likes (per-UID 24-hour cooldown).
- View current likes for any UID.
- Simple admin endpoint to list top UIDs.

## Run locally
1. Install Node.js (v18+ recommended)
2. `npm install`
3. `npm start`
4. Open `http://localhost:3000`

## Deploying (Vercel / Render / Railway)
- Vercel: Vercel prefers serverless functions; this project is a long-running server. For Vercel you can either:
  - Use a Docker deployment (Vercel Pro) or
  - Use Render / Railway / Fly / DigitalOcean App for an easy Node server deployment.
- For quick free deployment, try Render.com or Railway.app (create a new Node service and push this repo).

## Important production notes
- Add reCAPTCHA to prevent bot abuse.
- Protect admin endpoints with authentication.
- Use TLS (HTTPS) and secure headers.
- Consider migrating sqlite to Postgres/MySQL for scale.

## License & Ethics
This repo is provided for educational and legal demo use only. Do not use it to perform unauthorized actions on third-party services.
