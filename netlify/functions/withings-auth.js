// netlify/functions/withings-auth.js
// Redirects user to Withings OAuth authorization page

exports.handler = async (event, context) => {
  const CLIENT_ID = process.env.WITHINGS_CLIENT_ID;
  const REDIRECT_URI = "https://healthconsolesalvatore.netlify.app/.netlify/functions/withings-callback";
  const state = Math.random().toString(36).substring(2);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: "user.info,user.metrics,user.activity,user.sleepevents",
    redirect_uri: REDIRECT_URI,
    state: state
  });

  const authUrl = `https://account.withings.com/oauth2_user/authorize2?${params.toString()}`;

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      "Set-Cookie": `withings_state=${state}; Path=/; HttpOnly; SameSite=Lax`
    },
    body: ""
  };
};
