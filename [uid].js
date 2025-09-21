import fs from "fs";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const { uid } = req.query;
  const file = "/tmp/likes.json";

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}));
  }

  let data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (!data[uid]) {
    data[uid] = { likes: 0 };
  }

  data[uid].likes += 100;

  fs.writeFileSync(file, JSON.stringify(data));

  res.status(200).json({
    status: 200,
    uid,
    sent: "100 likes",
    total_likes: data[uid].likes,
  });
}
