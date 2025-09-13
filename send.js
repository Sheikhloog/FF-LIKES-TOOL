import fetch from 'node-fetch';

const CF_SECRET = process.env.CF_SECRET_KEY;
const PROVIDER_URL = process.env.PROVIDER_URL || "https://proapis.hlgamingofficial.com/main/games/freefire/likes/api";
const PROVIDER_AUTH_STYLE = (process.env.PROVIDER_AUTH_STYLE || "field").toLowerCase();
const PROVIDER_API_FIELD = process.env.PROVIDER_API_FIELD || "api";
const ATTEMPT_LIMIT = Math.max(1, parseInt(process.env.ATTEMPT_LIMIT || "12", 10));
const RATE_MS = Math.max(50, parseInt(process.env.RATE_MS || "700", 10));

function loadTokensFromEnv(){
  const raw = process.env.TOKENS_JSON || "";
  if(!raw) return [];
  try{
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed)) return parsed.map((t,i)=>({ id: t.uid || t.id || `src-${i+1}`, token: String(t.token || t.key || t.api || ""), region: t.region || "IN" })).filter(x=>x.token && x.token.length>0);
    return [];
  }catch(e){
    console.error("TOKENS_JSON parse error:", e.message);
    return [];
  }
}

async function verifyTurnstile(token){
  if(!CF_SECRET) return { success:false, error:"Missing CF_SECRET_KEY on server" };
  const body = new URLSearchParams({ secret: CF_SECRET, response: token });
  try{
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method:"POST", body });
    return await r.json();
  }catch(err){
    return { success:false, error: "Turnstile verify error: "+err.message };
  }
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
function pickAmount(clientAmount){ if(Number.isInteger(clientAmount) && clientAmount>0) return clientAmount; return Math.floor(Math.random()*11)+190; } // 190-200

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error:"Method not allowed" });
  try{
    const body = req.body || {};
    const targetUid = body.ff_uid || body.uid || body.targetUid;
    const targetRegion = body.region || body.targetRegion || "PK";
    const cfToken = body.cfToken || body['cf-turnstile-response'];
    const clientAmount = body.amount ? Number(body.amount) : 0;

    if(!targetUid) return res.status(400).json({ error:"Missing target UID (ff_uid / uid / targetUid)" });
    if(!cfToken) return res.status(400).json({ error:"Missing Cloudflare Turnstile token (cfToken)" });

    const cf = await verifyTurnstile(cfToken);
    if(!cf || !cf.success) return res.status(403).json({ error:"Turnstile verification failed", detail: cf });

    const TOKENS = loadTokensFromEnv();
    if(!TOKENS || TOKENS.length === 0) return res.status(500).json({ error:"No tokens configured (TOKENS_JSON empty on server)" });

    const candidates = TOKENS.slice(0, ATTEMPT_LIMIT);
    const attempts = [];

    for(let i=0;i<candidates.length;i++){
      const src = candidates[i];
      const amount = pickAmount(clientAmount);
      const payload = {};

      if(PROVIDER_AUTH_STYLE === "field"){
        payload.useruid = src.id;
        payload[PROVIDER_API_FIELD] = src.token;
        payload.region = targetRegion;
        payload.ff_uid = Number(targetUid);
        payload.amount = amount;
      } else {
        payload.uid = targetUid;
        payload.amount_of_likes = amount;
        payload.region = targetRegion;
      }

      const attempt = { sourceId: src.id, httpStatus:null, summary:null, raw:null };
      try{
        const options = { method: "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) };
        if(PROVIDER_AUTH_STYLE === "bearer") options.headers["Authorization"] = `Bearer ${src.token}`;
        const r = await fetch(PROVIDER_URL, options);
        const text = await r.text();
        attempt.httpStatus = r.status;
        attempt.raw = text.slice(0,2000);
        try{
          const j = JSON.parse(text);
          if(j && (j.status === 200 && j.sent && j.sent !== "0 likes")){ attempt.summary = "SUCCESS"; attempts.push(attempt); return res.status(200).json({ ok:true, attempts }); }
          else if(j && j.status === 200 && j.sent === "0 likes"){ attempt.summary = "ALREADY_CLAIMED"; }
          else if(j && (j.error || j.message)){ attempt.summary = String(j.error || j.message).slice(0,200); }
          else { attempt.summary = ("resp:"+JSON.stringify(j)).slice(0,200); }
        }catch(e){
          attempt.summary = text.slice(0,200);
        }
      }catch(err){
        attempt.httpStatus = 0;
        attempt.summary = "Network error: "+err.message;
      }

      attempts.push(attempt);
      await sleep(RATE_MS);
    }

    return res.status(200).json({ ok:false, attempts });

  }catch(err){
    console.error("api/send error", err);
    return res.status(500).json({ error:"Server error: "+(err.message||String(err)) });
  }
}
