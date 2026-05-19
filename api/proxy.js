// Vercel Edge Function — 25s timeout, runs at edge globally
export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST')   return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const body     = await req.text();
    const upstream = await fetch('https://xiaoai.plus/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         (req.headers.get('authorization') || '').replace('Bearer ', ''),
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      { status: 502, headers: { 'Content-Type': 'application/json', ...CORS } }
    );
  }
}
