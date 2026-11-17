# 40 — The AI evaluator: every finding and every API response (2026-11-16)

Everything learned on 2026-11-16 while choosing a model for the AI evaluator (PR #370, `backend/ai-evals/`), with the
raw response of every model call saved beside it in `ai-eval-results/` (checksums in `ai-eval-results/SHA256SUMS`).
Written at the owner's request: "put all the findings, responses of every api call in the docs and ledgers".

## 1. What the AI evaluator is

- **Owner's decisions, in order:**
  - no chat; the AI only tells the learner where the faults are;
  - the AI must add what the deterministic judge **cannot** determine at runtime, not repeat the judge;
  - the model may see the learner's design and comment on it, each point tied to a line and shown as "the interviewer's view";
  - one platform with one key for testing: Vercel AI Gateway (the owner added a card for verification only);
  - the test set must be wider, each flawed design with its own finding.
- **The job:** the model reads the problem, the numbered design and the judge's findings, and returns at most three
  points (line, category, severity `problem` or `consider`, text of at most 50 words). An empty list is a good answer.
- **Marking:** a flawed design is caught when a `problem` point names its line in a fitting category; on a clean
  design any `problem` point is a false alarm. The bar: caught ≥ 80 %, false alarms ≤ 10 %, errors ≤ 2 %, p95 ≤ 10 s.

## 2. Two tests were run (and a trial)

| Test | Job | Calls | Cost | Raw responses |
|---|---|---|---|---|
| Review job, 10 models × 75 designs × 3 runs | The first idea: lead with the judge's finding | 2,250 | $0.51 | `ai-eval-results/review-job/bakeoff-full-2026-11-16-*.json` |
| Trial of Muse Ember, 2 efforts × 10 designs | Same | 20 | $0.02 | `review-job/bakeoff-trial-*.json` |
| **Interviewer's view, 8 models × 22 designs × 3 runs** | **The job above** | **528** | **$0.26** | `ai-eval-results/interviewers-view/observe-first-run-*.jsonl` |
| Mock reviewer (no network) | Offline check | 75 | $0 | `review-job/mock*.json` |

Total spent on Vercel on 2026-11-16: **$0.80** of the free monthly credit ($4.20 left). Nothing was charged to the card.
The review-job run is kept as the record of why the design changed (§4).

## 3. Results of the interviewer's view (8 free-credit models)

| Model (effort) | Flaws caught | False alarms on clean designs | Same answer every run | p95 | Cost, 66 answers | Per 1,000 correct |
|---|---|---|---|---|---|---|
| GPT-5 mini (low) | 70 % | 100 % | 82 % | 11.5 s | $0.095 | ₹398 |
| **Muse Ember (low)** | 67 % | **36 %** | 64 % | 6.4 s | $0.046 | **₹94** |
| gpt-oss-20b (low) | 53 % | 75 % | 55 % | 8.0 s | $0.006 | ₹22 |
| Gemini 2.5 Flash-Lite (low) | 53 % | 75 % | 68 % | 6.3 s | $0.038 | ₹134 |
| DeepSeek V3.1 | 43 % | 78 % | 59 % | 10.5 s | $0.021 | ₹88 |
| gpt-oss-120b (low) | 33 % | 56 % | 46 % | 3.8 s | $0.018 | ₹61 |
| Qwen 3.7 Flash (low) | 27 % | 53 % | 41 % | 18.1 s | $0.013 | ₹45 |
| Nemotron 3 Super | 23 % | 72 % | 41 % | 5.2 s | $0.024 | ₹134 |

**No model clears the bar.** Muse Ember is the front-runner (nearly the most catches, by far the fewest false alarms).

**Which flaw was caught** (runs caught of 3, per model, in the order of the table above):

| Finding | GPT-5 mini | Muse | oss-20b | Gemini | DeepSeek | oss-120b | Qwen | Nemotron |
|---|---|---|---|---|---|---|---|---|
| Time-bucket partition key, all traffic on one partition | 3 | 3 | 3 | 3 | 2 | 3 | 3 | 2 |
| Partition key is not the lookup key (chat keyed by message id) | 3 | 3 | 2 | 3 | 1 | 0 | 1 | 1 |
| Large blobs in a key-value store | 3 | 3 | 3 | 3 | 1 | 2 | 0 | 1 |
| Key too coarse, rows overwrite (seats keyed by show) | 3 | 3 | 1 | 2 | 2 | 2 | 2 | 1 |
| A handful of live entities hold all the traffic | 1 | 0 | 0 | 0 | 1 | 0 | 1 | 0 |
| Timestamp as primary key | 3 | 3 | 3 | 3 | 3 | 1 | 1 | 2 |
| CDN TTL far too short for content that never changes | 2 | 0 | 1 | 1 | 0 | 0 | 0 | 0 |
| Sequential ids on private pastes | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| A missing window column, so the limit never resets | 2 | 3 | 3 | 1 | 3 | 2 | 0 | 0 |
| Clients read the data store directly | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Why false alarms are high:** mostly the prompt, not the models. In the 528 answers the most common false alarms were:
- a `key_choice` point on the leaderboard reference (20 answers), the chat references (17 and 16), the ticket reference (15)
  and the rate-limiter reference (12). The models misread the notation: they treat a key-value `pk` as a unique key
  ("messages overwrite each other"), and ignore the `index(...)` that serves the lookup;
- capacity and availability points the judge already tests (workers and spikes on the notification reference).
Fair points that the answer key counts as false alarms and may deserve a rule: guessable ids on public promo links,
and whether `seat_id` is unique across shows (the problem does not say).

## 4. Findings that changed the design, in order

1. **The first test checked the wrong thing.** It marked whether a review cites the judge's own finding. The judge's
   findings already become a review without AI (the template review). The owner pointed this out; the job became
   the interviewer's view. Re-marking the review-job answers with a better answer key was free: answers are saved.
2. **A generated ground truth is not a ground truth.** `ground-truth.json` came from the judge's output, so it could
   not say whether advice was right. Reading all 75 designs by hand found: a wrong accepted fact
   (`ind-vs-pak/primary-only`), "add more servers" passing where a CDN is needed (3 designs), "a bigger database"
   passing where an index is missing, 3 designs with two faults, and a content issue (`rate-limiter/three-nodes`:
   the author blames the storage nodes, the judge blames the servers).
3. **The judge reports only the first failing test's findings,** so a second fault in a later test never reaches the
   model; two-fault designs must fail in the same test. Part names are limited to 24 characters (the
   instruction-in-a-name designs had to be shortened).
4. **Reasoning tokens are billed as output and cut answers off.** At effort low, Muse Ember thinks about 1,000 tokens;
   production's `AI_MAX_OUTPUT_TOKENS=1500` ended 3 of 5 answers with `finish_reason: length`. Use about 4,000
   for a reasoning model.
5. **Vercel's free tier allows 5 calls a minute per model** (a 429 names the limit). The test paces itself, waits
   out a 429 and runs models in parallel.
6. **Node's `fetch` ignores `HTTPS_PROXY`.** In this cloud session the key is injected by a proxy: run Node with
   `NODE_USE_ENV_PROXY=1` or every call answers 401.
7. **A stopped run lost every answer** (the first script saved only at the end). The current script appends each answer
   as it arrives and has `--resume`.

7. **Marking by line and category can credit a wrong reason.** In `41-AI-EVALUATOR-ANSWERS.md`, Qwen 3.7 Flash's run 1
   on `chat-message-store/messages-keyed-by-id` is marked caught (line 6, `key_choice`), but its reason is wrong: it
   blames a hot `chat_id`, while the flaw is partitioning by `message_id`. The catch rates in §3 are therefore an upper
   bound; before choosing a model, read its answers (all are in doc 41) or add a check on the reason.

## 5. What Vercel AI Gateway answered (the platform, not the models)

| Call | Response |
|---|---|
| First request with the saved key, before a card | `customer_verification_required`: "requires a valid credit card on file… to unlock your free credits" (every model, including the page's own examples `moonshotai/kimi-k3` and `openai/gpt-6-astra`) |
| After the card was added | 200 with an answer, for Muse Ember and Gemma 4 |
| Haiku 5.5, GPT-6 Luna, DeepSeek V4.1 Flash, Gemini 3.1 Flash-Lite, GLM-5.3 Flash, Qwen3.8 Flash | `403 Free tier users do not have access to this model. Upgrade to paid credits` (6 × 225 calls in the review-job run, all errors, cost 0) |
| Muse Ember, 6th call within a minute | `429 Rate limit exceeded for meta/muse-ember for provider meta: this team's limit of 5 requests per minute` |
| `GET /v1/credits` | balance 4.20, total used 0.80 at the end of the day |
| Request without the proxy flag | `401 Authentication failed. Create an API key…` (the key was never sent) |

**Probe of 86 cheap structured-output models (one tiny call each):** 57 are served on the free credit, 25 need bought
credit, 4 not found. The lists are in `ai-eval-results/platform-probes/`. Free and reasoning-capable: Muse Ember,
gpt-oss-120b, gpt-oss-20b, Qwen 3.7 Flash, GPT-5 nano and mini, Gemini 2.5 Flash-Lite, Nemotron 3 Super, DeepSeek V3.1,
MiniMax M3.1 Flash, GLM-4.7 Flash, Gemma 4 26B and others. Paid-only: Claude Haiku 5.5, GPT-6 Luna, DeepSeek V4/V4.1 Flash,
GLM-5.3 Flash, Gemini 3.1 Flash-Lite, Qwen3.8 Flash and 27B, Gemma 4 31B, MiniMax M3.

## 6. Platforms compared (catalogs counted on 2026-11-16)

Eden AI 1,309 models · AIML API 995 · Requesty 757 · NanoGPT 625 · Vercel AI Gateway 509 · OpenRouter 468 · LLM Gateway 320.
Closed models cost the same everywhere ($0.10 / $0.50 per million for Muse Ember, Haiku 5.5, GPT-6 Luna); open models
differ a lot (GLM-5.3 Flash $0.04 / $0.078 on OpenRouter against $0.15 / $0.50 on Vercel). Fees: Vercel none on tokens;
OpenRouter about 5.5 % and Eden AI 5.5 % on credit; Requesty and LLM Gateway 5 %. Cloudflare AI Gateway: 5 % on credit,
cards only, no Muse Ember. LiteLLM is a proxy you run yourself (still one key per company); LightLLM is a GPU serving
engine. GitHub Models was reported retired on 2026-07-30 (not confirmed first-hand). Details: spec 29 §12.

## 7. What is next (not done: owner said "Don't run new anything")

1. Prompt version 2: explain the notation (a nosql `pk` is a partition key holding many rows; `index(col)` serves the
   lookup; a sql `pk` is unique per row), no capacity or latency comments, read every route.
2. Re-run the top models (about $0.10): Muse Ember, GPT-5 mini, Gemini 2.5 Flash-Lite.
3. Then `observe-bakeoff.mjs --tier free-reasoning`: every free model that can reason, found at run time.
4. If no free model clears the bar, buy about $5 of credit (ends the free $5 a month) and test Haiku 5.5, GPT-6 Luna,
   DeepSeek V4.1 Flash and GLM-5.3 Flash.
5. Owner decisions waiting: is `seat_id` unique across shows; fix `rate-limiter/three-nodes`.
6. For production: raise `AI_MAX_OUTPUT_TOKENS`, add the section "The interviewer's view" to the Practice page, and ask
   the platform for providers that keep and train on nothing (on Vercel `zeroDataRetention`, which needs bought credit).

## 8. The saved responses

Every answer in readable form, per design and per model, with its mark: `41-AI-EVALUATOR-ANSWERS.md`. Its appendix gives each model's time, tokens and cost. The exact prompt and all 22 designs with line numbers: `43-AI-EVALUATOR-PROMPTS-AND-DESIGNS.md`. The older review-job test, answer by answer (1,515 answers, 6 models blocked by 403): `42-AI-EVALUATOR-REVIEW-JOB.md`.


`ai-eval-results/` holds one file per model per run:
- `interviewers-view/observe-first-run-<model>.jsonl`: one line per call: design, run, points as the model wrote them,
  the verifier's drops, the mark (caught / false alarms / why), `raw` (the model's JSON), tokens used, cost, time;
- `interviewers-view/observe-first-run.md`: the report; `review-job/`: the older job (`rows[]` with `raw`, `review`,
  `score`, `why`, `usage`, `cost`) and its reports; `platform-probes/`: the probe of Vercel's free tier and the catalog counts;
- `SHA256SUMS`: a checksum of each file (recorded in the MongoDB ledger).
The code that produced them is `backend/ai-evals/` in PR #370.

## 9. Update 2026-11-17: the second search

Prompt v2 and ground truth v3 (`44-AI-EVALUATOR-MODEL-SEARCH-PLAN.md`) replaced §3's test. The search ran on
2026-11-17 over 15 free-tier models (1,133 calls, $0.85): **no model clears the bar**. Best: GPT-5 mini 55.6 %
caught with 70.2 % false alarms; Muse Ember 40 % caught, 12.3 % false alarms, fast; Qwen 3.8 Omni Flash and Inkling 2
Small about 40 % caught with 5.3 % false alarms but too slow. Muse Ember's 67 % in §3 drops to 40 % mainly because a
catch now needs the right reason, as §4 item 7 warned. Results and the owner's choices: `45-AI-EVALUATOR-RUN-RESULTS.md`;
every answer: `46-AI-EVALUATOR-ANSWERS-V3.md`; raw responses: `ai-eval-results/interviewers-view-v3/`.

