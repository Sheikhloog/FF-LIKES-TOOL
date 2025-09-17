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

    // Merge all token parts from ENV
    let tokens = [];
    try {
      tokens = [
        ...JSON.parse(process.env.TOKENS_PART1 || "[]"),
        ...JSON.parse(process.env.TOKENS_PART2 || "[]"),
        ...JSON.parse(process.env.TOKENS_PART3 || "[]"),
      ];
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse token ENV" });
    }

    if (tokens.length === 0) {
      return res.status(500).json({ error: "No tokens found in ENV" });
    }

    // Pick a random token for this request
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];

    const apiUrl = `https://likes.ffgarena.cloud/api/v2/likes?uid=${uid}&amount_of_likes=${Math.floor(Math.random() * 11) + 190}&auth=${randomToken.token}&region=${region}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
