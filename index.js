const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "success", message: "API is running perfectly!" });
});

app.get("/likes/:uid", (req, res) => {
  const { uid } = req.params;
  res.json({
    status: "success",
    uid,
    likes: Math.floor(Math.random() * 1000),
  });
});

app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
