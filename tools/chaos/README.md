# Chaos tests

Break what Tech Katta depends on and check it fails gracefully and recovers on its own.
**Never point the backend tests at production**: they run a local copy of the API.

## Backend (local copy)
```bash
cd tech-katta/backend && npm ci
node tools/chaos/stack.mjs                              # MongoDB :27999 (stoppable) + Google keys stand-in :5291
node tools/chaos/proxy.mjs 27998 127.0.0.1:27999 5292   # fault switch on the network to MongoDB
node tools/chaos/proxy.mjs 5293 127.0.0.1:5291 5294     # fault switch on the network to Google's keys
node tools/chaos/backend.mjs                            # starts the API itself and runs the experiments
```
Experiments: baseline · MongoDB stopped and restarted · MongoDB black hole · MongoDB 3 s slow · Google keys
unreachable on a cold start · 2,000-request spike · event flood from one address · junk input to every
write · SIGKILL and restart · broken content on SIGHUP. Exit code 1 if any check fails.

## Browser (safe on production)
```bash
node tools/chaos/frontend.js https://tech.katta.cc
```
Faults are injected inside the test browser only (Playwright interception): API down then back, API slower
than the timeout, one article erroring, offline in the Lab, storage blocked, Google's script blocked, a
stale chunk after a deploy.

## Results, 2026-11-05 (#169)
Backend 18/20 at first: a MongoDB black hole made sign-ins wait ~40 s, and an unreachable Google key server
hung sign-in for over 70 s. Fixed (socket/connect timeouts; 5 s on the key fetch): **20/20**. Browser
**11/11** on production.
