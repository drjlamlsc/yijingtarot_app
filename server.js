// 易經塔羅 — local dev server
// Serves static files + proxies Claude API to avoid CORS
// Usage: node server.js
// Then open: http://localhost:8080

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 8080;
const DIR  = __dirname;

const CLAUDE_API_KEY = 'sk-W3iFOmFHkaXd63EewBuKyAaDmgQDrItDzH5I2DqvrY7NK6UM';
const CLAUDE_HOST    = 'xiaoai.plus';
const CLAUDE_PATH    = '/v1/messages';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.css':  'text/css',
};

http.createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Claude proxy ─────────────────────────────────────────
  if (req.url === '/proxy/claude' && req.method === 'POST') {
    var body = '';
    req.on('data', function (chunk) { body += chunk; });
    req.on('end', function () {
      var apiReq = https.request({
        hostname: CLAUDE_HOST,
        path:     CLAUDE_PATH,
        method:   'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length':    Buffer.byteLength(body)
        }
      }, function (apiRes) {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
        apiRes.pipe(res);
      });
      apiReq.on('error', function (e) {
        res.writeHead(502);
        res.end(JSON.stringify({ error: { message: e.message } }));
      });
      apiReq.write(body);
      apiReq.end();
    });
    return;
  }

  // ── Static files ─────────────────────────────────────────
  var urlPath  = req.url.split('?')[0];
  var filePath = path.join(DIR, urlPath === '/' ? 'index.html' : urlPath);

  // Safety: stay within DIR
  if (filePath.indexOf(DIR) !== 0) { res.writeHead(403); res.end(); return; }

  fs.readFile(filePath, function (err, data) {
    if (err) { res.writeHead(404); res.end('Not found: ' + urlPath); return; }
    var ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });

}).listen(PORT, function () {
  console.log('');
  console.log('  ☰ 易經塔羅');
  console.log('  http://localhost:' + PORT);
  console.log('');
  console.log('  Ctrl+C 停止');
});
