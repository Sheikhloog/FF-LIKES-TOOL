export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'likes.json');

  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const { uid, region, amount } = req.body;
  if (!uid) {
    return res.status(400).json({ error: 'UID required' });
  }

  if (!data[uid]) {
    data[uid] = { likes: 0, region };
  }
  data[uid].likes += Number(amount) || 0;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  return res.status(200).json({ status: 'ok', uid, region, likes: data[uid].likes });
}
