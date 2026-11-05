// Backend chaos experiments against a local copy of the API (never production).
//   1. node stack.mjs                              MongoDB :27999 (stoppable), Google keys :5291
//   2. node proxy.mjs 27998 127.0.0.1:27999 5292   the network to MongoDB
//   3. node proxy.mjs 5293 127.0.0.1:5291 5294     the network to Google's key server
//   4. node backend.mjs                            starts the API itself (so it can restart it) and runs:
// baseline · MongoDB stops and comes back · MongoDB unreachable (black hole) · MongoDB slow (3 s) ·
// Google keys unreachable on a cold start · a traffic spike · an event flood · junk input · bad content
// on reload. Prints what clients saw (status, time) and how long recovery took.
import { spawn } from 'node:child_process';
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const REPO = process.env.TK_REPO || '/home/user/tech-katta';
const API = 'http://127.0.0.1:5280', ORIGIN = 'http://localhost:5281', STACK = 'http://127.0.0.1:5291';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const note = (exp, what, value, ok) => { results.push({ exp, what, value, ok }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${exp} · ${what}: ${value}`); };
const control = (port, q) => fetch(`http://127.0.0.1:${port}${q}`).then((r) => r.json());

// content is copied so experiment 9 can break it without touching the repo
const contentDir = mkdtempSync(join(tmpdir(), 'tk-chaos-content-'));
cpSync(join(REPO, 'content'), contentDir, { recursive: true });
let api;
async function startApi() {
  api = spawn(process.execPath, ['backend/src/server.js'], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env,
    HOST: '127.0.0.1', PORT: '5280', CONTENT_DIR: contentDir, FRONTEND_ORIGIN: ORIGIN, GOOGLE_CLIENT_ID: 'chaos-test.apps.googleusercontent.com',
    MONGODB_URI: 'mongodb://127.0.0.1:27998/?directConnection=true', ACCOUNTS_DB: 'tk_chaos', SESSION_SECRET: 'c'.repeat(48), COOKIE_SECURE: '0',
    GOOGLE_JWKS_URL: 'http://127.0.0.1:5293/certs' } });
  api.stderr.on('data', (d) => { const s = String(d); if (!/Account request failed/.test(s)) process.stderr.write('[api] ' + s); });
  for (let i = 0; i < 100; i += 1) { try { if ((await fetch(API + '/health')).ok) return; } catch {} await sleep(100); }
  throw new Error('API did not start');
}
const stopApi = async () => { api.kill('SIGTERM'); await new Promise((r) => api.once('exit', r)); };

// one request, with a client-side cap so a hang shows up as a number
async function timed(path, { method = 'GET', body, cookie, cap = 70_000, ip } = {}) {
  const t0 = Date.now();
  try {
    const r = await fetch(API + path, { method, signal: AbortSignal.timeout(cap), headers: { Origin: ORIGIN, ...(ip ? { 'CF-Connecting-IP': ip } : {}), ...(cookie ? { Cookie: cookie } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });
    await r.arrayBuffer();
    return { status: r.status, ms: Date.now() - t0, cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
  } catch (e) { return { status: e.name === 'TimeoutError' ? 'hung' : 'error', ms: Date.now() - t0 }; }
}
let ipN = 0; const freshIp = () => `10.9.${(ipN += 1) >> 8 & 255}.${ipN & 255}`;
const token = (sub) => fetch(`${STACK}/mint?sub=${sub}`).then((r) => r.text());
const signIn = async (sub, cap) => timed('/v1/auth/google', { method: 'POST', body: { termsAccepted: true, credential: await token(sub) }, cap, ip: freshIp() });
const event = (ip) => timed('/v1/events', { method: 'POST', body: { visitor: 'v'.repeat(20), events: [{ name: 'page_view', props: { section: 'home' } }] }, ip });
async function recovery(check, limitMs = 60_000) { const t0 = Date.now(); while (Date.now() - t0 < limitMs) { if (await check()) return Date.now() - t0; await sleep(500); } return null; }
const pct = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

await startApi();
await control(5292, '/mode?m=pass'); await control(5294, '/mode?m=pass');

// 0. baseline
{ const s = await signIn('base'); note('0 baseline', 'sign-in', `${s.status} in ${s.ms} ms`, s.status === 200);
  const c = await timed('/v1/articles'); note('0 baseline', 'articles', `${c.status} in ${c.ms} ms`, c.status === 200); }

// 1. MongoDB stops, then comes back
{ await fetch(`${STACK}/mongo/stop`);
  const c = await timed('/v1/articles'), s = await signIn('m1'), e = await event(freshIp()), h = await timed('/health');
  note('1 MongoDB stopped', 'articles (no database needed)', `${c.status} in ${c.ms} ms`, c.status === 200 && c.ms < 1000);
  note('1 MongoDB stopped', 'sign-in fails cleanly', `${s.status} in ${s.ms} ms`, s.status === 503 && s.ms < 10_000);
  note('1 MongoDB stopped', 'events fail cleanly', `${e.status} in ${e.ms} ms`, (e.status === 503 || e.status === 204) && e.ms < 10_000);
  note('1 MongoDB stopped', 'health answers', `${h.status} in ${h.ms} ms`, h.status === 200);
  await fetch(`${STACK}/mongo/start`);
  const back = await recovery(async () => (await signIn('m1b', 15_000)).status === 200);
  note('1 MongoDB back', 'sign-in works again without restarting the API', back === null ? 'no recovery in 60 s' : `after ${back} ms`, back !== null); }

// 2. MongoDB unreachable: connections open but nothing arrives (a network black hole)
{ await control(5292, '/mode?m=blackhole');
  const t0 = Date.now(); const signins = Promise.all(Array.from({ length: 20 }, (_, i) => signIn('bh' + i)));
  await sleep(300); const during = []; for (let i = 0; i < 20; i += 1) during.push((await timed('/v1/site')).ms);
  const ss = await signins;
  note('2 MongoDB black hole', 'articles while 20 sign-ins wait (p95)', `${pct(during, 0.95)} ms`, pct(during, 0.95) < 500);
  note('2 MongoDB black hole', 'sign-ins fail, not hang', `${[...new Set(ss.map((s) => s.status))].join('/')} · slowest ${Math.max(...ss.map((s) => s.ms))} ms`, ss.every((s) => s.status === 503) && Math.max(...ss.map((s) => s.ms)) < 20_000);
  await control(5292, '/mode?m=pass');
  const back = await recovery(async () => (await signIn('bhb', 15_000)).status === 200);
  note('2 MongoDB back', 'recovers on its own', back === null ? 'no recovery in 60 s' : `after ${back} ms`, back !== null); }

// 3. MongoDB slow: every packet 3 s late
{ await control(5292, '/mode?m=delay&ms=3000');
  const s = await signIn('slow'), c = await timed('/v1/articles');
  note('3 MongoDB slow (3 s)', 'sign-in slower but works or fails cleanly', `${s.status} in ${s.ms} ms`, (s.status === 200 || s.status === 503) && s.ms < 40_000);
  note('3 MongoDB slow (3 s)', 'articles unaffected', `${c.status} in ${c.ms} ms`, c.ms < 500);
  await control(5292, '/mode?m=pass'); await recovery(async () => (await signIn('slowb', 15_000)).status === 200); }

// 4. Google's key server unreachable when the API has just started (keys not cached yet)
{ await stopApi(); await control(5294, '/mode?m=blackhole'); await startApi();
  const s = await signIn('gk', 70_000);
  note('4 Google keys unreachable', 'sign-in fails in seconds, not minutes', `${s.status} in ${s.ms} ms`, s.status !== 'hung' && s.ms < 15_000);
  await control(5294, '/mode?m=pass');
  const back = await recovery(async () => (await signIn('gkb', 15_000)).status === 200);
  note('4 Google keys back', 'sign-in recovers', back === null ? 'no recovery in 60 s' : `after ${back} ms`, back !== null); }

// 5. traffic spike: 2,000 article requests, 200 at a time
{ const ms = [], st = {}; const t0 = Date.now();
  for (let b = 0; b < 10; b += 1) { const rs = await Promise.all(Array.from({ length: 200 }, () => timed(b % 2 ? '/v1/articles' : '/v1/articles/sharding'))); for (const r of rs) { ms.push(r.ms); st[r.status] = (st[r.status] || 0) + 1; } }
  note('5 traffic spike', '2,000 requests (200 at a time)', `${JSON.stringify(st)} · p50 ${pct(ms, 0.5)} ms · p99 ${pct(ms, 0.99)} ms · ${Math.round(2000 / ((Date.now() - t0) / 1000))}/s`, (st[200] || 0) === 2000); }

// 6. one address floods the events endpoint
{ const rs = []; for (let i = 0; i < 80; i += 1) rs.push((await event('203.0.113.50')).status);
  const other = await event('203.0.113.51');
  note('6 event flood (one address)', 'first 60 accepted, then 429', `${rs.filter((s) => s === 204).length} accepted, ${rs.filter((s) => s === 429).length} refused`, rs.filter((s) => s === 204).length === 60 && rs.filter((s) => s === 429).length === 20);
  note('6 event flood (one address)', 'other visitors unaffected', String(other.status), other.status === 204); }

// 7. junk input to every write
{ const junk = ['', '{', 'null', '[]', '"x"', '{"visitor":1e400}', '{"events":{"length":1e9}}', '{"__proto__":{"admin":true}}', '{"designs":[null,1,"x",{"id":{}}]}', '{"credential":["a"],"termsAccepted":true}', 'x'.repeat(70_000), '\u0000\u0001'];
  const paths = ['/v1/events', '/v1/auth/google', '/v1/me/lab', '/v1/me/consent', '/v1/auth/signout'];
  const signed = await signIn('junk'); const st = {};
  for (const p of paths) for (const j of junk) { const r = await timed(p, { method: 'POST', body: j, cookie: signed.cookie, ip: freshIp() }); st[r.status] = (st[r.status] || 0) + 1; }
  const h = await timed('/health');
  note('7 junk input', `${paths.length * junk.length} bad requests`, JSON.stringify(st), !Object.keys(st).some((s) => s >= 500 && s !== '503') && h.status === 200); }

// 8. the API is killed hard and started again
{ api.kill('SIGKILL'); await new Promise((r) => api.once('exit', r)); const t0 = Date.now(); await startApi();
  const s = await signIn('restart'); note('8 API killed (SIGKILL)', 'back up and signing in', `${s.status}, ${Date.now() - t0} ms after restart`, s.status === 200); }

// 9. broken content on reload (SIGHUP): keeps serving the last good release
{ const before = await (await fetch(API + '/health')).json();
  writeFileSync(join(contentDir, 'site.json'), '{ broken');
  api.kill('SIGHUP'); await sleep(800);
  const c = await timed('/v1/site'), after = await (await fetch(API + '/health')).json();
  note('9 bad content reload', 'still serving the last good content', `${c.status}, release ${after.content.release === before.content.release ? 'unchanged' : 'changed'}`, c.status === 200 && after.content.release === before.content.release); }

await stopApi();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed${failed.length ? '\nFAILED:\n' + failed.map((r) => `- ${r.exp} · ${r.what}: ${r.value}`).join('\n') : ''}`);
process.exit(failed.length ? 1 : 0);
