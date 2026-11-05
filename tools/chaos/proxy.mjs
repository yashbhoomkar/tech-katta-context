// A TCP fault proxy for chaos tests: put it between the API and a dependency (MongoDB, the Google
// key server stand-in) and switch what the "network" does while traffic flows.
//   node proxy.mjs <listen port> <target host:port> <control port>
//   curl 'http://127.0.0.1:<control>/mode?m=pass'          normal
//   curl 'http://127.0.0.1:<control>/mode?m=delay&ms=3000'  every chunk waits 3 s each way
//   curl 'http://127.0.0.1:<control>/mode?m=blackhole'     connections open, nothing ever arrives
//   curl 'http://127.0.0.1:<control>/mode?m=reset'         existing connections cut, new ones refused at once
import net from 'node:net';
import http from 'node:http';

const [LISTEN, TARGET, CONTROL] = process.argv.slice(2);
const [thost, tport] = TARGET.split(':');
let mode = 'pass', delay = 0;
const live = new Set();

const pipe = (from, to) => from.on('data', (chunk) => {
  if (mode === 'blackhole') return;               // swallow it
  if (mode === 'delay') setTimeout(() => to.writable && to.write(chunk), delay);
  else to.write(chunk);
});

net.createServer((client) => {
  if (mode === 'reset') { client.destroy(); return; }
  const upstream = net.connect(Number(tport), thost);
  const pair = { client, upstream }; live.add(pair);
  pipe(client, upstream); pipe(upstream, client);
  const end = () => { client.destroy(); upstream.destroy(); live.delete(pair); };
  client.on('error', end); upstream.on('error', end); client.on('close', end); upstream.on('close', end);
}).listen(Number(LISTEN), '127.0.0.1');

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/mode') {
    mode = u.searchParams.get('m') || 'pass'; delay = Number(u.searchParams.get('ms') || 0);
    if (mode === 'reset') for (const { client, upstream } of live) { client.destroy(); upstream.destroy(); }
  }
  res.end(JSON.stringify({ mode, delay, connections: live.size }));
}).listen(Number(CONTROL), '127.0.0.1', () => console.log(`proxy ${LISTEN} → ${TARGET}, control on ${CONTROL}`));
