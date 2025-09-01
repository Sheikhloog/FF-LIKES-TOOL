import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { uid, region } = req.query;

  if (!uid || !region) {
    return res.status(400).json({ error: 'Missing uid or region' });
  }

  try {
    const apiUrl = `https://likes.ffgarena.cloud/api/v2/likes?uid=${uid}&amount_of_likes=100&auth=trial-7d&region=${region}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
}
