// Netlify Function — AI proxy (avoids browser CORS issues)
exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  }

  try {
    const resp = await fetch('https://xiaoai.plus/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': event.headers['authorization'] || '',
        'User-Agent':    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':        'application/json',
        'Origin':        'https://xiaoai.plus',
      },
      body: event.body,
    });

    const data = await resp.text();
    // Include upstream status in body if error, for debugging
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { 'Content-Type': 'application/json', ...CORS },
        body: JSON.stringify({ error: { message: 'Upstream ' + resp.status + ': ' + data } }),
      };
    }
    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json', ...CORS },
      body: JSON.stringify({ error: { message: err.message } }),
    };
  }
};
