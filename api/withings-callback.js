// api/withings-callback.js
// Handles Withings OAuth callback and exchanges code for tokens

module.exports = async (req, res) => {
  const CLIENT_ID = process.env.WITHINGS_CLIENT_ID;
  const CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET;
  const host = req.headers.host;
  const protocol = (host || '').includes('localhost') ? 'http' : 'https';
  const REDIRECT_URI = process.env.REDIRECT_URI || `${protocol}://${host}/api/withings-callback`;

  const { code, error } = req.query || {};
  console.log("[withings-callback] Received:", { hasCode: !!code, error });
  console.log("[withings-callback] Credentials present — CLIENT_ID:", !!CLIENT_ID, "CLIENT_SECRET:", !!CLIENT_SECRET);

  const redirect = (url) => { res.writeHead(302, { Location: url }); res.end(); };

  if (error) {
    console.log("[withings-callback] Auth error from Withings:", error);
    return redirect(`/?withings_error=${encodeURIComponent(error)}`);
  }
  if (!code) return redirect("/?withings_error=no_authorization_code");
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("[withings-callback] Missing env vars!");
    return redirect("/?withings_error=missing_server_credentials");
  }

  try {
    const formBody = new URLSearchParams({
      action: "requesttoken",
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI
    });

    const response = await fetch("https://wbsapi.withings.net/v2/oauth2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString()
    });

    const data = await response.json();
    console.log("[withings-callback] Withings response status:", data.status, "| error field:", data.error);

    if (data.status !== 0) throw new Error(`Withings API error ${data.status}: ${data.error || "unknown"}`);

    const { access_token, refresh_token, expires_in, userid } = data.body;
    if (!access_token) throw new Error("No access_token returned by Withings");

    console.log("[withings-callback] Token exchange successful! userid:", userid);

    const redirectUrl = `/?withings_token=${encodeURIComponent(access_token)}&withings_refresh=${encodeURIComponent(refresh_token || "")}&withings_expires=${Date.now() + (expires_in || 10800) * 1000}&withings_userid=${encodeURIComponent(userid || "")}`;
    return redirect(redirectUrl);
  } catch (err) {
    console.error("[withings-callback] Token exchange failed:", err.message);
    return redirect(`/?withings_error=${encodeURIComponent(err.message)}`);
  }
};
