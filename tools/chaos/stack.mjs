// Local stack for chaos tests: a MongoDB on a fixed port that can be stopped and started again (data
// kept on disk), a stand-in for Google's key server, and a token mint.
//   node stack.mjs <google client id>          (run `npm ci` in tech-katta/backend first)
//   MongoDB on 127.0.0.1:27999 · keys at http://127.0.0.1:5291/certs · mint at /mint?sub=&email=&name=
//   control: GET http://127.0.0.1:5291/mongo/stop · /mongo/start · /mongo/status
import { createServer } from 'node:http';
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const BACKEND = process.env.TK_BACKEND || '/home/user/tech-katta/backend';
const { MongoMemoryServer } = await import(`${BACKEND}/node_modules/mongodb-memory-server/index.js`);

const CLIENT = process.argv[2] || 'chaos-test.apps.googleusercontent.com';
const dbPath = mkdtempSync(join(tmpdir(), 'tk-chaos-'));
const mongo = await MongoMemoryServer.create({ instance: { port: 27999, dbPath, storageEngine: 'wiredTiger' } });
let up = true;

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'chaos1', alg: 'RS256', use: 'sig' };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');

createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const json = (o) => { res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(o)); };
  if (u.pathname === '/certs') return json({ keys: [jwk] });
  if (u.pathname === '/mint') {
    const t = Math.floor(Date.now() / 1000), h = b64({ alg: 'RS256', kid: 'chaos1' });
    const p = b64({ iss: 'https://accounts.google.com', aud: CLIENT, sub: u.searchParams.get('sub') || '1', email: u.searchParams.get('email') || 'chaos@example.com', email_verified: true, name: u.searchParams.get('name') || 'Chaos', iat: t, exp: t + 3600 });
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
    return res.end(`${h}.${p}.${sign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url')}`);
  }
  if (u.pathname === '/mongo/stop') { if (up) { await mongo.stop({ doCleanup: false, force: false }); up = false; } return json({ mongo: 'down' }); }
  if (u.pathname === '/mongo/start') { if (!up) { await mongo.start(true); up = true; } return json({ mongo: 'up', uri: mongo.getUri() }); }
  if (u.pathname === '/mongo/status') return json({ mongo: up ? 'up' : 'down', uri: mongo.getUri() });
  res.writeHead(404); res.end();
}).listen(5291, '127.0.0.1', () => console.log('chaos stack ready', mongo.getUri()));
