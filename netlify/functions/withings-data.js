// netlify/functions/withings-data.js
// Proxy to fetch Withings measurements (weight, body fat, heart rate, BP, steps, sleep)

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "No token" }) };
  }

  const token = authHeader.replace("Bearer ", "");
  const { action, ...params } = event.queryStringParameters || {};

  // Default: fetch measurements (weight, body fat, heart rate, BP)
  const apiAction = action || "getmeas";
  let url, body;

  if (apiAction === "getmeas") {
    url = "https://wbsapi.withings.net/measure";
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
    body = new URLSearchParams({
      action: "getmeas",
      meastype: params.meastype || "1,6,11,10,9",
      category: "1",
      startdate: params.startdate || thirtyDaysAgo.toString(),
      enddate: params.enddate || now.toString()
    });
  } else if (apiAction === "getactivity") {
    url = "https://wbsapi.withings.net/v2/measure";
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    body = new URLSearchParams({
      action: "getactivity",
      startdateymd: params.startdateymd || thirtyDaysAgo,
      enddateymd: params.enddateymd || today
    });
  } else if (apiAction === "getsleep") {
    url = "https://wbsapi.withings.net/v2/sleep";
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;
    body = new URLSearchParams({
      action: "getsummary",
      startdateymd: params.startdateymd || new Date((now - 7 * 24 * 60 * 60) * 1000).toISOString().split("T")[0],
      enddateymd: params.enddateymd || new Date().toISOString().split("T")[0]
    });
  } else {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`
      },
      body: body.toString()
    });

    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
