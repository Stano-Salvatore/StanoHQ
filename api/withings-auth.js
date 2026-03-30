// api/withings-auth.js
// Redirects user to Withings OAuth authorization page

module.exports = async (req, res) => {
  const CLIENT_ID = process.env.WITHINGS_CLIENT_ID;
  const host = req.headers.host;
  const protocol = (host || '').includes('localhost') ? 'http' : 'https';
  const REDIRECT_URI = process.env.REDIRECT_URI || `${protocol}://${host}/api/withings-callback`;

  const state = Math.random().toString(36).substring(2);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: "user.info,user.metrics,user.activity,user.sleepevents",
    redirect_uri: REDIRECT_URI,
    state
  });

  const authUrl = `https://account.withings.com/oauth2_user/authorize2?${params.toString()}`;

  res.setHeader('Set-Cookie', `withings_state=${state}; Path=/; HttpOnly; SameSite=Lax`);
  res.writeHead(302, { Location: authUrl });
  res.end();
};
