function generateRandomKey(deviceId='') {
  const random = Math.random().toString(36).substring(2) + Date.now().toString(36);
  return deviceId ? `${deviceId}-${random}` : random;
}

document.getElementById('generate').onclick = () => {
  const deviceId = document.getElementById('device').value.trim();
  const key = generateRandomKey(deviceId);
  document.getElementById('output').innerText = key;
};
