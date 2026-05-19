#!/usr/bin/env python3
# Render.com proxy server — no timeout limit
import http.server, http.client, json, os

PORT     = int(os.environ.get('PORT', 8080))
API_KEY  = 'sk-W3iFOmFHkaXd63EewBuKyAaDmgQDrItDzH5I2DqvrY7NK6UM'
API_HOST = 'xiaoai.plus'
API_PATH = '/v1/messages'

CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): pass

    def _cors(self):
        for k, v in CORS.items():
            self.send_header(k, v)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path != '/proxy':
            self.send_response(404); self.end_headers(); return
        try:
            length = int(self.headers.get('Content-Length', 0))
            body   = self.rfile.read(length)
            conn   = http.client.HTTPSConnection(API_HOST, timeout=120)
            conn.request('POST', API_PATH, body=body, headers={
                'Content-Type':      'application/json',
                'x-api-key':         API_KEY,
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
            err = json.dumps({'error': {'message': str(e)}}).encode()
            self.send_response(500)
            self._cors()
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(err)))
            self.end_headers()
            self.wfile.write(err)

if __name__ == '__main__':
    httpd = http.server.HTTPServer(('0.0.0.0', PORT), Handler)
    print(f'Proxy on port {PORT}')
    httpd.serve_forever()
