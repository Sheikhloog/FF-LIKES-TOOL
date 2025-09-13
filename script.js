import tokens from './tokens.json' assert { type: 'json' };

const form = document.getElementById('likeForm');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const uid = document.getElementById('uid').value.trim();
  if (!uid) return;

  // pick random token from list
  const token = tokens[Math.floor(Math.random() * tokens.length)];

  // dummy response simulation (replace with real API call)
  result.textContent = `UID: ${uid}\nUsing token: ${token.substring(0,20)}...`;
});
