export default function handler(req, res) {
  const clientId = process.env.WITHINGS_CLIENT_ID;
  const redirectUri = process.env.WITHINGS_REDIRECT_URI || 'https://stano-hq.vercel.app/api/withings-callback';

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'user.info,user.metrics,user.activity,user.sleepevents',
    redirect_uri: redirectUri,
    state: 'stanohq'
  });

  res.redirect(`https://account.withings.com/oauth2_user/authorize2?${params}`);
}
