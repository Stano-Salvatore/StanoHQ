// api/withings-data.js
// Proxy: receives POST JSON {endpoint, params, access_token} → forwards to Withings API

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { endpoint, params, access_token } = req.body || {};

  if (!access_token) return res.status(401).json({ error: "No access_token in request body" });
  if (!endpoint) return res.status(400).json({ error: "No endpoint specified" });

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
    return res.status(200).json(data);
  } catch (err) {
    console.error("[withings-data] Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
