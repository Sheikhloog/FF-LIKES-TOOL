import fs from "fs";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const { uid } = req.query;
  const file = "/tmp/likes.json";

  // file initialize
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}));
  }

  let data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (!data[uid]) {
    data[uid] = { likes: 0, nickname: `Player_${uid}` };
  }

  let likes_before = data[uid].likes;
  let likes_sent = 100;
  let likes_after = likes_before + likes_sent;

  // update
  data[uid].likes = likes_after;

  fs.writeFileSync(file, JSON.stringify(data));

  res.status(200).json({
    status: 200,
    uid,
    nickname: data[uid].nickname,
    likes_before,
    likes_sent,
    likes_after,
  });
}
