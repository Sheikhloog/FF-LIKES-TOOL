export default async function handler(req, res) {
  try {
    // Body ya query dono handle karo
    const { uid, region, amount_of_likes } = req.method === "POST" ? req.body : req.query;

    if (!uid || !region) {
      return res.status(400).json({
        status: 400,
        message: "Missing UID or region",
      });
    }

    // Tokens JSON env variable se lo
    const tokens = JSON.parse(process.env.TOKENS_JSON || "[]");
    if (!tokens.length) {
      return res.status(500).json({
        status: 500,
        message: "No tokens available on server",
      });
    }

    // Random token choose karo
    const token = tokens[Math.floor(Math.random() * tokens.length)];

    // External Free Fire Likes API
    const apiUrl = `https://likes.ffgarena.cloud/api/v2/likes?uid=${uid}&amount_of_likes=${
      amount_of_likes || 100
    }&auth=${token}&region=${region}`;

    const ffRes = await fetch(apiUrl); // 👈 global fetch, no node-fetch needed
    const text = await ffRes.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        status: 500,
        message: "Invalid response from Free Fire API",
        raw: text,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: err.message,
    });
  }
}
