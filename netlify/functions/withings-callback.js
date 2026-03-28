// netlify/functions/withings-callback.js
// Handles OAuth redirect, exchanges code for access + refresh tokens

exports.handler = async (event, context) => {
  const CLIENT_ID = process.env.WITHINGS_CLIENT_ID;
  const CLIENT_SECRET = process.env.WITHINGS_CLIENT_SECRET;
  const REDIRECT_URI = "https://healthconsolesalvatore.netlify.app/.netlify/functions/withings-callback";

  const { code, error } = event.queryStringParameters;

  if (error) {
    return {
      statusCode: 302,
      headers: { Location: `/?withings_error=${encodeURIComponent(error)}` },
      body: ""
    };
  }

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No authorization code received" })
    };
  }

  try {
    const body = new URLSearchParams({
      action: "requesttoken",
      grant_type: "authorization_code",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: REDIRECT_URI
    });

    const response = await fetch("https://wbsapi.withings.net/v2/oauth2", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString()
    });

    const data = await response.json();

    if (data.status !== 0) {
      throw new Error(`Withings error: ${data.error}`);
    }

    const { access_token, refresh_token, expires_in, userid } = data.body;

    // Redirect back to HQ with tokens in URL fragment (never hits server)
    const redirectUrl = `/#withings_token=${encodeURIComponent(access_token)}`
      + `&withings_refresh=${encodeURIComponent(refresh_token)}`
      + `&withings_expires=${Date.now() + expires_in * 1000}`
      + `&withings_userid=${userid}`;

    return {
      statusCode: 302,
      headers: { Location: redirectUrl },
      body: ""
    };
  } catch (err) {
    return {
      statusCode: 302,
      headers: { Location: `/?withings_error=${encodeURIComponent(err.message)}` },
      body: ""
    };
  }
};
