export default async function handler(req, res) {
  const { code, error } = req.query;
  const redirectUri = process.env.WITHINGS_REDIRECT_URI || 'https://stano-hq.vercel.app/api/withings-callback';
  const clientId = process.env.WITHINGS_CLIENT_ID;
  const clientSecret = process.env.WITHINGS_CLIENT_SECRET;

  if (error || !code) {
    return res.redirect(`/?withings_error=${encodeURIComponent(error || 'no_code')}`);
  }

  try {
    const body = new URLSearchParams({
      action: 'requesttoken',
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    });

    const response = await fetch('https://wbsapi.withings.net/v2/oauth2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    });

    const data = await response.json();

    if (data.status !== 0) {
      return res.redirect(`/?withings_error=${encodeURIComponent('token_error_' + data.status)}`);
    }

    const { access_token, refresh_token, expires_in, userid } = data.body;

    // Pass tokens back to frontend via query params
    const params = new URLSearchParams({
      withings_token: access_token,
      withings_refresh: refresh_token,
      withings_expires: Date.now() + expires_in * 1000,
      withings_userid: userid
    });

    res.redirect(`/?${params}`);

  } catch (err) {
    res.redirect(`/?withings_error=${encodeURIComponent(err.message)}`);
  }
}
