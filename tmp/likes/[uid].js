const fs = require("fs");
const path = require("path");

module.exports = async function (req, res) {
  const filePath = path.join(process.cwd(), "likes.json");

  if (!fs.existsSync(filePath)) {
    return res.status(200).json({});
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const { uid } = req.query;
  const record = data[uid];

  if (!record) {
    return res.status(404).json({ error: "UID not found" });
  }

  return res.status(200).json(record);
};
