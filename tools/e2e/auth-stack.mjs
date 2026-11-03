// Usage: node auth-stack.mjs <google client id> <file to write the MongoDB URI to>   (run `npm ci` in backend/ first)
// Local stack for the sign-in browser test: MongoDB (in memory), a stand-in for Google's JWKS, and a
// token mint at /mint?sub=..&name=..&email=.. (signed with the key the JWKS publishes).
const BACKEND = process.env.TK_BACKEND || '/home/user/tech-katta/backend';  // its node_modules has mongodb-memory-server
const { MongoMemoryServer } = await import(`${BACKEND}/node_modules/mongodb-memory-server/index.js`);
import { createServer } from 'node:http';
import { generateKeyPairSync, sign } from 'node:crypto';
import { writeFileSync } from 'node:fs';
const CLIENT = process.argv[2];
const mongo = await MongoMemoryServer.create();
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'local1', alg: 'RS256', use: 'sig' };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const srv = createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/certs') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ keys: [jwk] })); }
  if (u.pathname === '/mint') { const t = Math.floor(Date.now() / 1000), h = b64({ alg: 'RS256', kid: 'local1' }), p = b64({ iss: 'https://accounts.google.com', aud: CLIENT, sub: u.searchParams.get('sub'), email: u.searchParams.get('email'), email_verified: true, name: u.searchParams.get('name'), iat: t, exp: t + 3600 });
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' }); return res.end(`${h}.${p}.${sign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url')}`); }
  res.writeHead(404); res.end();
});
srv.listen(5191, '127.0.0.1', () => { writeFileSync(process.argv[3], mongo.getUri()); console.log('stack ready', mongo.getUri()); });
