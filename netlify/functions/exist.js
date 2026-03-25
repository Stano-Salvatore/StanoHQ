const EX_TOKEN = 'e3e663d4892217654ab94bbf242428d11eaf1105';

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const qs = new URLSearchParams(params).toString();
  const url = `https://exist.io/api/2/attributes/with-values/?${qs}`;

  try {
    const resp = await fetch(url, {
      headers: { 'Authorization': 'Token ' + EX_TOKEN }
    });
    const data = await resp.text();
    return {
      statusCode: resp.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
