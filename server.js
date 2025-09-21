// Simple Express server for "Give 100 Likes" (internal-only likes)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, 'db');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);
const DB_PATH = path.join(DB_DIR, 'likes.db');

const db = new sqlite3.Database(DB_PATH);

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// basic rate limiter: 100 reqs per hour per IP
const limiter = rateLimit({
  windowMs: 60*60*1000,
  max: 100,
  message: { error: 'Too many requests, wait and try again.' }
});
app.use(limiter);

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    likes INTEGER DEFAULT 0,
    last_given INTEGER DEFAULT 0
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uid TEXT,
    action TEXT,
    ip TEXT,
    ts INTEGER
  )`);
});

// Helper to get timestamp
const nowTs = () => Date.now();

// Endpoint: give 100 likes to a UID (with per-UID 24h cooldown)
app.post('/api/give100', (req, res) => {
  try {
    const uid = String(req.body.uid || '').trim();
    if (!uid) return res.status(400).json({ error: 'UID required' });
    if (uid.length < 2 || uid.length > 64) return res.status(400).json({ error: 'Invalid UID length' });

    const now = nowTs();
    const DAY = 24*60*60*1000;

    db.get('SELECT likes, last_given FROM users WHERE uid = ?', [uid], (err, row) => {
      if (err) return res.status(500).json({ error: 'DB error' });

      if (!row) {
        // new user
        db.run('INSERT INTO users(uid, likes, last_given) VALUES(?,?,?)', [uid, 100, now], function(e2) {
          if (e2) return res.status(500).json({ error: 'DB error' });
          db.run('INSERT INTO logs(uid,action,ip,ts) VALUES(?,?,?,?)', [uid,'give100', req.ip, now]);
          return res.json({ uid, likes: 100, message: '100 likes added' });
        });
      } else {
        if (now - row.last_given < DAY) {
          const nextAllowed = row.last_given + DAY;
          return res.status(429).json({ error: 'Already granted recently. Try later.', next_allowed: nextAllowed });
        }
        const newLikes = row.likes + 100;
        db.run('UPDATE users SET likes = ?, last_given = ? WHERE uid = ?', [newLikes, now, uid], function(e3) {
          if (e3) return res.status(500).json({ error: 'DB error' });
          db.run('INSERT INTO logs(uid,action,ip,ts) VALUES(?,?,?,?)', [uid,'give100', req.ip, now]);
          return res.json({ uid, likes: newLikes, message: '100 likes added' });
        });
      }
    });
  } catch (ex) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint: get likes for a UID
app.get('/api/likes/:uid', (req, res) => {
  const uid = String(req.params.uid || '').trim();
  db.get('SELECT likes FROM users WHERE uid = ?', [uid], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json({ uid, likes: row ? row.likes : 0 });
  });
});

// Simple admin endpoint: list top 50 UIDs by likes (no auth - for demo only; add auth in production)
app.get('/admin/top', (req, res) => {
  db.all('SELECT uid, likes FROM users ORDER BY likes DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    return res.json({ top: rows });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on port', PORT));
