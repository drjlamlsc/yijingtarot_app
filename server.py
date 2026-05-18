#!/usr/bin/env python3
# 易經塔羅 — local dev server
# Usage: python3 server.py  →  http://localhost:8080

import http.server
import http.client
import ssl
import json
import os
import traceback

PORT       = 8080
DIR        = os.path.dirname(os.path.abspath(__file__))
CLAUDE_KEY = 'sk-W3iFOmFHkaXd63EewBuKyAaDmgQDrItDzH5I2DqvrY7NK6UM'
CLAUDE_HOST = 'xiaoai.plus'
CLAUDE_PATH = '/v1/messages'

MIME = {
    '.html':  'text/html; charset=utf-8',
    '.js':    'application/javascript; charset=utf-8',
    '.json':  'application/json',
    '.jpg':   'image/jpeg',
    '.jpeg':  'image/jpeg',
    '.png':   'image/png',
    '.css':   'text/css',
}

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f'  {self.address_string()}  {self.path}  →  {args[1]}')

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/':
            path = '/index.html'
        file_path = os.path.normpath(os.path.join(DIR, path.lstrip('/')))
        if not file_path.startswith(DIR) or not os.path.isfile(file_path):
            self.send_response(404)
            self._cors()
            self.end_headers()
            self.wfile.write(b'Not found')
            return
        ext  = os.path.splitext(file_path)[1].lower()
        mime = MIME.get(ext, 'application/octet-stream')
        with open(file_path, 'rb') as f:
            data = f.read()
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != '/proxy/claude':
            self.send_response(404)
            self.end_headers()
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length)

            ctx  = ssl._create_unverified_context()
            conn = http.client.HTTPSConnection(CLAUDE_HOST, context=ctx, timeout=120)
            conn.request('POST', CLAUDE_PATH, body=body, headers={
                'Content-Type':      'application/json',
                'x-api-key':         CLAUDE_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Length':    str(len(body)),
            })
            resp   = conn.getresponse()
            data   = resp.read()
            status = resp.status
            conn.close()

            self.send_response(status)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        except Exception as e:
            traceback.print_exc()
            err = json.dumps({'error': {'message': str(e)}}).encode()
            self.send_response(500)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(err)))
            self.end_headers()
            self.wfile.write(err)


if __name__ == '__main__':
    os.chdir(DIR)
    httpd = http.server.HTTPServer(('', PORT), Handler)
    print(f'\n  ☰ 易經塔羅  →  http://localhost:{PORT}\n  Ctrl+C 停止\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n  停止')
