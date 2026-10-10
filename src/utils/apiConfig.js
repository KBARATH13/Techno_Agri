// Standalone CRA dev server (port 3000) talks to the backend directly;
// the unified proxy / ngrok tunnel uses relative paths.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_URL = isLocal && window.location.port === '3000' ? 'http://localhost:5000' : '';
