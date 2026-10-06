# 01 — Architecture

## High-level system

Current intended architecture:

```
                         Internet
                            |
                         Cloudflare
                       /           \
                      /             \
             tech.katta.cc       tech-api.katta.cc
                  |                    |
                Vercel                VPS
                  |                    |
             React/Vite             Express
                  |                    |
                  |              MongoDB Atlas
                  |
              Browser
```

The frontend is static/client-rendered and is deployed independently from the API.

The API is a Node/Express process running on a VPS under systemd.

## Frontend

Repository location:

`frontend/`

Primary technologies:

- React
- Vite
- React Router
- CSS
- static assets in `frontend/public/`

Production:

`https://tech.katta.cc`

Vercel project:

- project ID: `prj_7GIELC6DNWbKJSaluZwo373Pn8ZF`
- team ID: `team_ESVBoCGScxPRCW4TxwcTeJCg`
- team slug/scope: `yashbhoomkars-projects`

The Vercel MCP has historically had a scope-authorization problem in one conversation session. A different ChatGPT conversation was able to access the same Vercel account, proving the account authorization itself can work. Do not confuse this with an application deployment failure.

## Backend

Repository location:

`backend/`

Production API:

`https://tech-api.katta.cc`

VPS:

- IP: `129.121.133.47`
- application directory: `/opt/tech-katta`
- systemd service: `tech-katta-api`
- service user: `techkatta`
- database: MongoDB Atlas, database `techkatta`

The service listens locally and is exposed through the API domain/proxy.

## Database

MongoDB Atlas stores article/unit content.

Database name:

`techkatta`

The backend has content compatibility/normalization logic so legacy MongoDB content can render through the current frontend model without mutating the existing database.

This distinction matters: when a rendering problem can be solved safely at the application normalization layer, do not modify production MongoDB content merely to fit the UI.

## Request flow

Typical article request:

```
Browser
  -> tech.katta.cc
  -> React route /learn/<slug>
  -> frontend API request
  -> tech-api.katta.cc
  -> Express
  -> MongoDB Atlas
  -> normalized article response
  -> React article renderer
```

## Backend hardening

The API currently includes:

- explicit production CORS origin
- disabled `x-powered-by`
- trusted proxy configuration
- JSON body size limit of 50 KB
- security response headers
- rate limiting
- search regex escaping
- input length limits
- slug validation
- graceful shutdown
- startup error handling
- unhandled rejection/exception logging

See `03-backend.md`.

## Overflow/failover direction

A VPS-first overflow foundation exists.

The desired policy is NOT ordinary active-active load balancing.

Desired behavior:

```
Normal:
100% -> VPS

VPS approaching saturation/unhealthy:
new traffic can overflow -> secondary

VPS healthy again:
traffic returns -> VPS
```

The overflow monitor uses:

- CPU
- local health checks
- failure count
- healthy recovery count
- hysteresis

Current monitor thresholds:

- enter overflow at CPU >= 85%
- exit at CPU <= 65%
- 3 failed health checks to enter
- 5 healthy checks plus CPU <= 65% to recover
- health check interval: 30 seconds

Important: the monitor was deliberately designed to be disabled unless a real secondary upstream is configured. It does not by itself modify Nginx routing.

## Secondary Render work

An older Render service named `lifewithyash` exists, but it is primarily the Life With Yash backend and should not be casually treated as a Tech Katta secondary.

A temporary migration attempt copied Tech Katta backend code into that repository's `working` branch. Intermediate Render deploys failed because GitHub files were being replaced one at a time. Do not infer that Render is a production Tech Katta failover merely from those historical changes.

A proper Tech Katta Render secondary should be a separately controlled service with its own environment and deployment verification.

## DNS/proxy principle

Preferred long-term topology:

```
Internet
   |
Cloudflare
   +-- tech.katta.cc ------> Vercel
   |
   +-- tech-api.katta.cc --> routing/proxy --> VPS primary
                                      |
                                      +--> secondary only on overflow/failover
```

A future implementation should ensure attackers cannot simply bypass the edge layer by directly reaching the origin IP.
