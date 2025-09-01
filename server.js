// server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/likes', async (req, res) => {
  try {
    const { uid, region } = req.query;
    if (!uid || !region) {
      return res.status(400).json({ error: 'uid and region required' });
    }

    const url = `https://likes.ffgarena.cloud/api/v2/likes?uid=${encodeURIComponent(uid)}&amount_of_likes=100&auth=trial-7d&region=${encodeURIComponent(region)}`;
    const r = await fetch(url);
    const data = await r.json();

    res.set('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'proxy_failed', message: String(err) });
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
