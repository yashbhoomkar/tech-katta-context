# 06 — Deployment

## Source control

Main application repository:

`yashbhoomkar/tech-katta`

Branch:

`main`

The frontend and backend live in the same repository.

## Frontend deployment

Frontend is deployed to Vercel.

Known project:

- project: `tech-katta`
- project ID: `prj_7GIELC6DNWbKJSaluZwo373Pn8ZF`
- team ID: `team_ESVBoCGScxPRCW4TxwcTeJCg`
- team slug: `yashbhoomkars-projects`
- production domain: `tech.katta.cc`

The deployment is Git-connected, so pushes to the appropriate branch trigger deployments.

## Known production deployment

Latest known mobile-swipe deployment:

- deployment: `dpl_ChCm2jSLemuXxaqcNKGUBYFNB7xX`
- state: READY
- target: production
- commit: `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`

## Backend deployment

Backend is deployed to a VPS through GitHub Actions.

The workflow:

`.github/workflows/deploy-backend.yml`

The deployment uses SSH credentials stored in GitHub Actions secrets.

The workflow installs a systemd production drop-in, seeds MongoDB, restarts the service, checks health, and runs public smoke tests.

## CI validation

Node 22 is used in the backend workflow.

The workflow runs:

```
npm ci
node --check src/server.js
node --check src/db.js
node --check src/seed.js
```

Then deployment and smoke tests.

## TLS test exception

The GitHub runner encountered a TLS interception issue during public smoke testing:

`DEPTH_ZERO_SELF_SIGNED_CERT`

The test runner was therefore invoked with:

```
NODE_TLS_REJECT_UNAUTHORIZED=0
```

This is a **test-runner-only workaround**.

It must not be copied into production Node configuration.

## Production smoke-test history

Known successful runs included:

- GitHub Actions run `37333745634`
- GitHub Actions run `37333860593`
- deployment workflow `37467540239`

These are historical identifiers. Check GitHub Actions before using them as current status.

## Vercel MCP troubleshooting

A recurring issue in one ChatGPT conversation:

```
403 Forbidden
Not authorized: Trying to access resource under scope
"yashbhoomkars-projects"
```

The error appeared even for read-only deployment inspection.

A separate ChatGPT conversation under the same account was able to access Vercel, proving the Vercel account/team authorization itself can work.

Therefore:

- do not diagnose this as application failure
- do not repeatedly redeploy because of this error
- do not rotate application code to solve it
- treat it as an MCP session/scope authorization problem

## Deployment discipline

Never deploy repeatedly just to see whether a tiny UI change propagated.

For a frontend change:

1. inspect
2. edit
3. run build/static checks
4. commit
5. wait for the connected deployment
6. inspect deployment result
7. test production
8. only then make another change

This reduces noise and makes rollback easier.

## Rollback

Git history is the primary rollback mechanism.

The MongoDB commit ledger provides a searchable mapping:

```
Git commit SHA -> human description
```

See `10-github-and-mongodb-ledger.md`.
