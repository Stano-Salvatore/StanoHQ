// netlify/functions/withings-data.js
// Proxy: receives POST JSON {endpoint, params, access_token} → forwards to Withings API

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let parsed;
  try {
    parsed = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { endpoint, params, access_token } = parsed;

  if (!access_token) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "No access_token in request body" }) };
  }

  if (!endpoint) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "No endpoint specified" }) };
  }

  const url = `https://wbsapi.withings.net${endpoint}`;
  const formBody = new URLSearchParams(params || {});

  console.log("[withings-data] Calling:", url, "action:", (params || {}).action);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${access_token}`
      },
      body: formBody.toString()
    });

    const data = await response.json();
    console.log("[withings-data] Response status:", data.status);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error("[withings-data] Error:", err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
