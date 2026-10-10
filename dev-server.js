// Unified single-tunnel server: serves the React build and proxies API calls to the Express backend.
// Usage: node dev-server.js [port]   then: ngrok http 5501
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.argv[2] || process.env.PORT || 5501);
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const BACKEND_PORT = Number(process.env.BACKEND_PORT || 5000);
const PROXY_PREFIXES = [
  '/api/recommend', '/api/yield', '/api/weather', '/api/predict',
  '/api/iot', '/api/chatbot', '/api', '/users',
];

// Works whether run from the project root or from inside the frontend folder.
const candidates = [__dirname, process.cwd(), path.join(process.cwd(), 'frontend'), path.join(process.cwd(), 'smart farm', 'frontend')];
const FRONTEND_DIR = candidates.find((d) => fs.existsSync(path.join(d, 'package.json'))) || __dirname;
const STATIC_DIR = fs.existsSync(path.join(FRONTEND_DIR, 'build')) ? path.join(FRONTEND_DIR, 'build') : null;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.map': 'application/json',
};

function isApi(urlPath) {
  return PROXY_PREFIXES.some((x) => urlPath === x || urlPath.startsWith(x + '/'));
}

function proxy(req, res) {
  const headers = { ...req.headers };
  delete headers.origin;
  headers.host = `${BACKEND_HOST}:${BACKEND_PORT}`;
  const upstream = http.request(
    { host: BACKEND_HOST, port: BACKEND_PORT, method: req.method, path: req.url, headers },
    (up) => {
      res.writeHead(up.statusCode || 502, up.headers);
      up.pipe(res);
    }
  );
  upstream.on('error', (err) => {
    if (res.headersSent) return res.destroy();
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Backend unavailable',
      message: `Backend unavailable on port ${BACKEND_PORT}: ${err.code || err.message}`,
    }));
  });
  req.pipe(upstream);
}

function sendFile(res, file) {
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  // Hashed build assets are immutable; HTML must always revalidate.
  const cache = file.includes(`${path.sep}static${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache';
  const stream = fs.createReadStream(file);
  stream.on('open', () => {
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': cache });
    stream.pipe(res);
  });
  stream.on('error', () => {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });
}

function serveStatic(req, res, rawPath) {
  if (!STATIC_DIR) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    return res.end('No build folder found. Run "npm run build" in the frontend folder first.');
  }
  let urlPath;
  try {
    urlPath = decodeURIComponent(rawPath);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }
  if (urlPath === '/favicon.ico') {
    const icon = ['favicon.ico', 'favicon.jpeg'].map((f) => path.join(STATIC_DIR, f)).find(fs.existsSync);
    if (icon) return sendFile(res, icon);
    res.writeHead(204);
    return res.end();
  }
  const file = path.normalize(path.join(STATIC_DIR, urlPath));
  if (file !== STATIC_DIR && !file.startsWith(STATIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.stat(file, (err, st) => {
    if (!err && st.isFile()) return sendFile(res, file);
    sendFile(res, path.join(STATIC_DIR, 'index.html')); // SPA fallback for React Router
  });
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  if (isApi(urlPath)) return proxy(req, res);
  serveStatic(req, res, urlPath);
});

// No host given: listens dual-stack (IPv4 + IPv6) so ngrok/localhost both connect

server.listen(PORT, () => {
  console.log(`Unified server on http://localhost:${PORT}`);
  console.log(`Static: ${STATIC_DIR || '(missing build folder)'}`);
  console.log(`Proxy:  /api/*, /users/* -> http://${BACKEND_HOST}:${BACKEND_PORT}`);
  console.log(`Tunnel: ngrok http ${PORT}`);
});
