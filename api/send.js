// api/send.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { uid, region } = req.body;

    if (!uid || !region) {
      return res.status(400).json({ error: "Missing uid or region" });
    }

    // Merge tokens from ENV
    let tokens = [];
    try {
      const part1 = process.env.TOKENS_PART1 ? JSON.parse(process.env.TOKENS_PART1) : [];
      const part2 = process.env.TOKENS_PART2 ? JSON.parse(process.env.TOKENS_PART2) : [];
      const part3 = process.env.TOKENS_PART3 ? JSON.parse(process.env.TOKENS_PART3) : [];
      tokens = [...part1, ...part2, ...part3];
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse token ENV", details: e.message });
    }

    if (!tokens || tokens.length === 0) {
      return res.status(500).json({ message: "No tokens available" });
    }

    // Pick random token
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

    // Random likes between 190–200
    const amount = Math.floor(Math.random() * 11) + 190;

    const apiUrl = `https://likes.ffgarena.cloud/api/v2/likes?uid=${uid}&amount_of_likes=${amount}&auth=${randomToken.token}&region=${region}`;

    const response = await fetch(apiUrl);
    let data = null;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      return res.status(500).json({ error: "Invalid JSON response", raw: text });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
      }
