export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, params, access_token, refresh_token } = req.body;
  const clientId = process.env.WITHINGS_CLIENT_ID;
  const clientSecret = process.env.WITHINGS_CLIENT_SECRET;

  // Helper to call Withings API
  async function withingsCall(token, ep, p) {
    const body = new URLSearchParams({ action: ep.split('/').pop(), ...p });
    const response = await fetch(`https://wbsapi.withings.net${ep}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: body.toString()
    });
    return response.json();
  }

  try {
    let token = access_token;
    let data = await withingsCall(token, endpoint, params);

    // If token expired (status 401), try refresh
    if (data.status === 401 && refresh_token) {
      const refreshBody = new URLSearchParams({
        action: 'requesttoken',
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token
      });

      const refreshRes = await fetch('https://wbsapi.withings.net/v2/oauth2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: refreshBody.toString()
      });

      const refreshData = await refreshRes.json();

      if (refreshData.status === 0) {
        token = refreshData.body.access_token;
        data = await withingsCall(token, endpoint, params);
        // Return new tokens along with data
        return res.json({
          ...data,
          new_token: token,
          new_refresh: refreshData.body.refresh_token,
          new_expires: Date.now() + refreshData.body.expires_in * 1000
        });
      }
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
