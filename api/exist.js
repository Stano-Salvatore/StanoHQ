// api/exist.js
// Proxy for Exist.io API

const EX_TOKEN = 'e3e663d4892217654ab94bbf242428d11eaf1105';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const qs = new URLSearchParams(req.query || {}).toString();
  const url = `https://exist.io/api/2/attributes/with-values/?${qs}`;

  try {
    const resp = await fetch(url, {
      headers: { 'Authorization': 'Token ' + EX_TOKEN }
    });
    const data = await resp.text();
    res.status(resp.status).send(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
