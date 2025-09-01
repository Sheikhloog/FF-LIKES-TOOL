export default async function handler(req, res) {
  const { uid, region } = req.query || {};
  if (!uid || !region) {
    return res.status(400).json({ status: 400, error: 'missing_parameters', message: 'uid and region are required' });
  }

  const targetUrl = `https://likes.ffgarena.cloud/api/v2/likes?uid=${encodeURIComponent(uid)}&amount_of_likes=100&auth=trial-7d&region=${encodeURIComponent(region)}`;

  try {
    // Try to call remote API
    const response = await fetch(targetUrl, { method: 'GET' });
    const text = await response.text();

    // Attempt to parse JSON, otherwise return a safe JSON wrapper
    try {
      const data = JSON.parse(text);
      return res.status(response.status || 200).json(data);
    } catch (err) {
      // Remote returned non-JSON (HTML or text). Return a JSON wrapper and indicate fallback.
      return res.status(200).json({
        status: response.status,
        error: 'non_json_response',
        message: 'Remote returned non-JSON content. Returning wrapper. If auth invalid, frontend will show mock.',
        remote_snippet: text.slice(0, 800)
      });
    }
  } catch (error) {
    // Network error or fetch failed; respond with useful JSON so frontend can show mock.
    return res.status(200).json({
      status: 200,
      error: 'fetch_failed',
      message: 'Failed to contact remote API. Returning safe mock response.',
      details: String(error)
    });
  }
}
