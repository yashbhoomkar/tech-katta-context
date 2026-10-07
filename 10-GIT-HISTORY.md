# Git History and Important Rollback Points

## Current main

Current main:

`main = 5c2e975d9c1a43a29dff9f781df1bfcc3d4cf4e3`

Latest application commit:
**feat(backend): add Vercel MCP server**

Previous Vercel control commits:
- `c3ef3c23e5c7450ef4e409765f2b767eb60071c5` — add environment-backed Vercel REST client
- `d896750ba7cd321302c66e8f84da7aae7cf31e21` — add Vercel control CLI
- `6710e4f81615a7087a92b6292bf38144ee625858` — add Vercel control package script
- `2ff980493796e063c09ce7f5dd84969d5c32e905` — fix Vercel control CLI ESM syntax
- `7145519d78d786a80cdfb5b30bb3dd7079f8e16a` — add CI syntax checks for Vercel tooling

Latest application implementation point:
`5c2e975d9c1a43a29dff9f781df1bfcc3d4cf4e3`

The Vercel MCP is implemented but its token-authenticated remote execution is not yet verified from the current environment.

## Project origin

Important early commits:
- `7bf8fa831e3f112b68a8c43ffbd14b8e6b2e7f76` — chore: initialize Tech Katta
- `1e3ca0d3506e0f50fb643f4bfb9d4afc9228bcd5` — feat: build dark Tech Katta knowledge base
- `fa76611655ab5baf6b2a0cfc0f43631d24330a47` — chore: polish deployment scaffold

## Content architecture

Important milestones:
- Kafka Basics article introduced.
- Generalized article section rendering introduced.
- Distributed Systems Concepts introduced.
- Distributed System Components introduced.
- Library restructured into units/topics and chapters/notes.
- General article authoring schema documented.
- MongoDB seeding introduced.
- Article content schema migrated toward version 2.

## Static diagram work

Important commits include:
- `300cfafeb608a0e787595214fcfc793a96e34bda` — register static distributed architecture diagram
- `d79177421da37b6a57ab334f037ebd0f21eb2aa3` — render distributed systems architecture as static diagram
- `7e8b9eb83b64b2fff2d1de5b7247a19272576643` — render legacy distributed architecture as static diagram
- `a4c1b0741d4c3c5e1952f0e0e3a9713903d9d571` — pass article slug to content normalization

The legacy ASCII architecture is normalized to a static diagram at API response time without mutating the MongoDB document.

## Humanization work

Key commits:
- `f101d1c9f66d4de7f7ddf3d60fe3928e1e9e090c` — humanize navigation and homepage copy
- `fe05fcc1fee6980fb2b096d526f40b7ad20ea834` — give site a more editorial human feel
- `1b125dfea6ed7113cd5e7ad8909cd60143711c30` — humanize article interface language
- `fce4de930fe7923dce243543964c06cbff974535` — simplify breadcrumb language
- `acd55bc933089394edfd9268df33e1d0a9a2b15b` — tighten positioning/language

## SEO work

- `457b3f2df92b89b26ab38101d8e22fa1fd43e98b` — social metadata/crawler fallback
- `67630a1bcc3b8c17a03067610f924afb7085be22` — article metadata/language
- `4a946b0402a7ec407df6981c34d2ba46f7db6120` — crawler directives/sitemap
- `a8bae4f6fbd839542ff66977d7829c547b2d813f` — explicit sitemap
- `4c5b9f1babd86806fc4ccc515a3ddd0d14dc1e2e` — social preview image
- `c09c34c07e69acbfdbc05e19c16b0586813b55b9` — point social previews at SVG artwork

## VPS overflow work

- `414444f97c8e6d1b2d116b6c966f64f3984f3c9f` — add disabled-by-default overflow controller with hysteresis
- `bdef2d1cc4a2a74e7736811d0dcc0c49cbee8d75` — make overflow monitor safe until secondary exists
- `61d446573bc8edc1617b73b2dc592b579c5a7740` — install monitor during backend deployments

## Deployment color test

A temporary orange deployment test was performed:
- `afc182319596404bed64d548449b64d1f45ea831`

It was later restored. The important final restoration point was:
- `feb1e02b8f05c872498f56900b819d3bfe11c8e8`

Do not interpret temporary test commits as intended final design.

## Mobile swipe history

- `13c11e23898af5b5a61d6098edfc540a691cc065` — initial swipe navigation
- `f3a4058c48f928c33e939bce9762040e6602711a` — runtime fix
- `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1` — home right swipe opens sidebar

## Git ledger policy

Every future application commit must be recorded in MongoDB:
- key = full SHA
- value = change description

The ledger is documented in `11-MONGODB-COMMIT-LEDGER.md`.

## Rollback discipline

When reverting:
1. identify the last known-good commit
2. inspect the diff between good and bad state
3. prefer a normal revert when history should remain explicit
4. if restoring exact files, document why
5. deploy
6. validate
7. update the ledger for the new rollback commit

Do not rewrite public history casually.
