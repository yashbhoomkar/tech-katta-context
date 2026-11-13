# 29 — A self-hosted model for the AI evaluator, on a ₹500–600 a month VPS

Written 2026-11-13 at the owner's request: "For the AI powered evaluator, instead of having the API calls to LLMs,
check if we can buy a VPS of 500-600 Indian rupees per month, host an LLM and route requests to it. Though there
will be a delay in response, it is acceptable if we are going to sell subscriptions of our website at 199 rupees /
month. Do full research and write a detailed .md file. Push it to tech-katta-context, not the private."

**Status: research only. Nothing is rented, installed or built. Decided the same day: hosted Claude Haiku 5.5, no VPS (see the next section and §11).** Every speed in this file is an **estimate**
(labelled so) until §9's benchmark is run on the real box. Prices are third-party snapshots from
September–November 2026 and move often (RAM prices pushed most VPS prices up in 2026, §3.1).

> **Public repository.** Spec 22 rule 6 says model names, prices and quotas stay out of the public repositories.
> The owner asked for this file to go here, so it names public market prices, candidate open models and the ₹199
> price the owner stated. It does **not** contain credit weights, per-pass limits or any number from the private
> notes; those stay in `tech-katta-private`. Rule 6 still holds for code: the model id and limits come from the
> environment.

---

## Decision (update, same day): at least 150 AI reviews per user per month

The owner then set the target: **"give the user at least 150 AI powered reviews per user per month. Check what
wins, and also decide on which LLM."** Section 11 has the working. The result:

- **The hosted API wins.** At 150 reviews a user, the money is about the same either way (~₹15 a subscriber a
  month), but the API answers in seconds instead of minutes, handles a learner doing ten reviews in a row, needs
  no extra machines as users grow (one ₹600 box serves only ~40 subscribers who use all 150), and costs almost
  nothing in the first months.
- **The model: Claude Haiku 5.5** for `review` (and `clarify`), effort `low`, thinking off to start, structured
  output, prompt caching on the system text and problem block. **₹0.05–0.14 a review; ₹7–21 a subscriber a month
  even if every subscriber uses all 150** (4–13 % of the ~₹164 we keep). `grade` also starts on Haiku 5.5 and
  moves to a larger model only if the evaluation set says so.
- **Do not rent the VPS for this.** Keep the client in one file so a self-hosted model can be tried later if the
  numbers change.

---

## 0. The answer in one page

| Question | Answer |
|---|---|
| Can ₹500–600 a month buy a VPS that runs a useful model? | **Yes, just.** In November 2026 the one plan in budget with enough cores is a **4 vCPU / 8 GB** box (Contabo Cloud VPS 10, Mumbai, about ₹450–600). Hostinger's ₹599 plan is 1 vCPU / 4 GB: too small for a 4B model. Oracle's free Arm box costs ₹0 and is good for testing, not as the only production path (§3) |
| Which model? | A **4B model at 4-bit** (Qwen3-4B first, Qwen3.5-4B and Phi-4-mini as alternatives), thinking switched off, JSON forced by a grammar. A 1.7–2B model for the simple `clarify` job (§4) |
| How long does a learner wait? | Estimate on a 4 vCPU box: **about 1.5–2 minutes per review** when the problem's prompt is already cached, **3–4 minutes** when it is not. With a queue at 70 % busy, the average wait is **about 4 minutes** at the evening peak (§5) |
| How many subscribers can one box serve? | Estimate: **about 150–350 paying subscribers** per 4 vCPU box, depending on how much they use the interviewer (§6). Beyond that, add a second box |
| Is it cheaper than calling an API? | **Not really, and it does not need to be.** At ₹199 we keep about ₹164 a subscriber. The cheapest current small hosted models cost **about ₹1–4 per subscriber per month** for the same work; the box costs ₹600 whatever happens. The box only beats an API priced like a mid-tier model (§7) |
| What is the real risk? | **Quality, not money.** A 4B model running on a CPU is much weaker at the `grade` job (does this answer make this point?) than a hosted model, and it is minutes slower. The verifier and the floor (spec 22 §12.4–12.5) keep it safe, but a weak model means more "from the report" fallbacks (§8) |
| Recommendation | **Build once, decide by measurement.** Write the AI client against one OpenAI-compatible interface with an async job queue (needed either way). Run spec 22's evaluation set (§19.3) on the 4B model and on one cheap hosted model. Expect to launch paying users on the hosted model and to use a self-hosted box where the evaluation says it is good enough (`clarify`, maybe `review`) or to give free users a taste at no cost per call. **Do not make a ₹600 box the only AI path for paying users** (§10) |

---

## 1. What the box would have to do

The AI layer is fixed by `22-EVALUATOR-V3.md` §12. It is not a chat. There are exactly four jobs, each one request
and one strict-JSON response, checked by a verifier, with a floor that needs no AI:

| Job | What the model does | Difficulty for a small model |
|---|---|---|
| `clarify` | Maps up to 5 learner questions to fact-sheet ids. Writes no prose | **Easy.** Classification into a short list. A 1.7–2B model can do it |
| `review` | Picks 2–5 facts from the pack in priority order, writes short items with `{{slots}}` and no digits, one next step | **Medium.** Choosing what matters is judgement; the format rules are strict |
| `grade` | For each authored point: is it present in the learner's answer, with a verbatim quote of 3+ words; contradictions of facts; two sentences of feedback | **Hard.** Entailment ("does this sentence make that point?") is where small models are lenient and inconsistent |
| `explain` (later) | One answer of at most 80 words tied to facts | Medium |

### 1.1 How big is one request

Spec 22 §12.2 fixes the order: system text, then the problem block (the same for every request about one
problem), then the request block. Estimates for one `review`:

| Part | Tokens (estimate) | Changes between requests? |
|---|---|---|
| System text | ~1,200 | Never (until `PROMPT_VERSION` changes) |
| Problem block (statement, constraints, glossary, lessons, all decision cards, deep dives) | ~3,000–5,000 | Only when the problem changes |
| Request block (up to 60 facts as compact lines, job, schema) | ~1,500–2,500 | Every request |
| **Input total** | **~6,000–8,000**, of which ~5,000 is a stable prefix | |
| Output (strict JSON) | ~350–500 | |

`grade` is similar in size (answers of up to 1,200 characters each replace most of the facts). This shape matters
more than anything else on a CPU, because **reading the prompt (prefill) is the slow part** (§5.1), and the stable
5,000-token prefix can be cached.

### 1.2 What "acceptable delay" changes

Spec 22 §12.7 assumes a hosted API: one synchronous call, a **25-second** hard timeout. A CPU box takes minutes, so
self-hosting needs an **asynchronous job**: the learner presses "Ask the interviewer", gets "Reading your design,
about 2 minutes, 1 ahead of you", can leave the page, and the result appears when ready. §8.4 lists the spec
changes this needs.

---

## 2. Why not a GPU

A GPU would answer in seconds, but the cheapest Indian GPU clouds start around **₹30–50 an hour** for an entry
card (E2E Networks advertises "from ₹49/hr"; Cyfuture lists a V100 at ₹39/hr). Always on, that is
**₹22,000–36,000 a month**, forty to sixty times the budget. Renting one for an hour a night to process a queue
would fit the budget but turns a 2-minute wait into a next-day answer. **No GPU option exists at ₹500–600.**
Everything below is CPU only.

---

## 3. The boxes that fit the budget (November 2026)

### 3.1 Prices went up in 2026

DRAM and NVMe prices rose sharply from late 2025 because of AI data-centre demand. Hetzner raised cloud prices
twice in 2026 (up to 37 % on 1 April; a second round on 15 June hit x86 plans much harder, CX23 to €5.49) and
one source reports its cost-optimised CX and CAX plans could not be created at all through October 2026. Contabo
raised Cloud VPS 10 and 20 in mid-2026. Hostinger India's entry VPS moved from about ₹399 early in 2026 to ₹599.
**Older blog posts listing "8 GB for ₹500" are out of date.**

### 3.2 The candidates

Prices exclude 18 % GST (Indian sellers add it; for a foreign seller a GST-registered business pays it under
reverse charge). Euro prices converted at about ₹100 to the euro. **Check every price on the seller's own page
before buying.**

| Provider and plan | vCPU / RAM / disk | Price a month | India data centre | Fit |
|---|---|---|---|---|
| **Contabo Cloud VPS 10** | 3–4 vCPU (sources disagree; the India page says 4) / 8 GB / 75 GB NVMe | €4.40 first term, €5.50–5.75 renewal: **about ₹450–600** | Mumbai | **Best fit in budget.** Enough RAM for a 4B model with an 8k context; 4 cores. Check the Mumbai location surcharge and setup fee. Contabo cores are shared and speeds vary between boxes, so benchmark the one you get |
| Contabo Cloud VPS 20 | 6 vCPU / 12 GB / 100 GB NVMe | €6.00–8.95: **about ₹600–900** | Mumbai | Best value just above budget: ~50 % more throughput than VPS 10 |
| Hostinger KVM 1 | 1 vCPU / 4 GB / 50 GB NVMe | **₹599** first term (24-month prepay), **₹999** renewal | Yes | **Too small for 4B.** 4 GB cannot hold a 4B model plus an 8k context with headroom; 1 core makes a review ~5–12 minutes. Fits only a 1.7–2B model for `clarify` |
| Hostinger KVM 2 | 2 vCPU / 8 GB / 100 GB NVMe | **₹799** first term, **₹1,199** renewal | Yes | Over budget. Works, at about half the speed of a 4 vCPU box. UPI and GST invoices are easy |
| Hetzner CX23 / CAX21 | 2 vCPU / 4 GB; 4 Arm / 8 GB | CX23 €5.49 after June; CAX not creatable (reported) | No (EU, US, Singapore) | **Not now.** Price hikes and availability. (Distance does not matter for an async job; the price does) |
| **Oracle Cloud Always Free, Ampere A1** | 4 Arm cores / 24 GB (several 2026 sources say cut to 2 / 12 GB from 15 June 2026; unverified) | **₹0** | Mumbai, Hyderabad (only in the account's home region) | **Best for testing.** Free and big enough for a 4B model, even a 30B mixture-of-experts model if 24 GB is still offered. Not as the only production path: free capacity is often "out of capacity" in busy regions, idle free instances can be reclaimed, and the allowance changed in 2026. Upgrading the account to Pay As You Go keeps the free allowance and makes it safer |

**Do not put the model on the production API VPS.** Inference pins every core for minutes. The API, the judge
workers (`JUDGE_WORKERS`) and Submit must stay quick, and that box is locked to Cloudflare's ranges (spec 15).
The model gets its own box.

### 3.3 What fits in 8 GB

For Qwen3-4B (36 layers, 8 key-value heads of 128): the key-value cache is ~144 KB per token at 16-bit, so an
8,192-token context needs ~1.2 GB (~0.6 GB with an 8-bit cache).

| Item | 8 GB box |
|---|---|
| Ubuntu, sshd, the small proxy | ~0.5 GB |
| Model weights, Qwen3-4B Q4_K_M | ~2.5 GB |
| Key-value cache, 8k context, 16-bit | ~1.2 GB |
| Compute buffers | ~0.3 GB |
| **Total** | **~4.5 GB**, leaving room for the page cache and a second slot |

A 4 GB box fits the same model only with an 8-bit cache and almost no headroom; use a 1.7–2B model there.

---

## 4. The model

### 4.1 What the job needs from a model

1. **Follows a long system text** and strict format rules (slots, no digits, ids only from the pack).
2. **Produces valid JSON every time.** On our own box this is guaranteed by **grammar-constrained decoding**:
   llama.cpp turns a JSON schema into a grammar and the model *cannot* emit anything else (§8.2).
3. **Judgement in short form**: which issue matters most; does this sentence make that point.
4. **Runs fast on 4 CPU cores**: in practice 1.5–4B parameters at 4-bit.
5. **A licence that allows commercial use.**
6. **Prefix caching works** (§5.2). This rules against some new architectures on CPU today.

### 4.2 Shortlist

| Model | File at Q4_K_M | Licence | Notes |
|---|---|---|---|
| **Qwen3-4B** (dense, 2025) | ~2.5 GB | Apache 2.0 | **First candidate.** Plain transformer, so prefix caching works normally in llama.cpp. Has a thinking switch: run it with thinking **off** (thinking adds hundreds of tokens, i.e. minutes, on a CPU). Good at JSON and instruction following for its size |
| Qwen3.5-4B (March 2026) | ~2.5–3 GB | Apache 2.0 | Newer and stronger on paper. **Hybrid architecture** (Gated DeltaNet linear attention mixed 3:1 with full attention). llama.cpp has had issues reusing the cache for hybrid and recurrent models (full prompt re-processing). **Check in the server log that the prefix is reused** before choosing it; if not, every request pays the full prefill |
| Gemma 4 E4B | larger than its name (E2B alone is ~4.6 GB per one guide) | Check the current Gemma terms | Native structured output. Uses sliding-window attention: in llama.cpp prefix reuse needs `--swa-full`, which costs memory. Second look, not first |
| Phi-4-mini (3.8B) | ~2.5 GB | MIT | Widely recommended for CPU. Plain transformer. Good fallback candidate |
| Qwen3-1.7B / Qwen3.5-2B | ~1.1–1.3 GB | Apache 2.0 | **`clarify` only**, or a 4 GB box. About twice as fast; too weak for `grade` |
| Qwen3-30B-A3B (mixture of experts) | ~18 GB | Apache 2.0 | Only on a 24 GB box (Oracle free, if still 4/24). 3B parameters active per token, so roughly 4B-like speed with clearly better quality. On Oracle's Arm cores, prefill may be slow (§5.3) |

Llama 3.2 3B is not on the list: weaker than the above and a more restrictive licence.

**The choice is made by spec 22 §19.3's evaluation set, not by this table.** Run the top two plus one hosted model
through it (§9.3).

---

## 5. How long a request takes

### 5.1 Two phases

- **Prefill** (reading the prompt) is **compute-bound**: about 2 × parameters floating-point operations per token.
  On a CPU it runs at tens of tokens a second for a 4B model, so a 7,000-token prompt takes minutes.
- **Decode** (writing the answer) is **memory-bandwidth-bound**: each new token reads all the weights once. A
  2.5 GB model on a VPS's share of ~10–20 GB/s gives ~4–8 tokens a second.

So for our jobs (long prompt, short answer) **prefill dominates**, and caching the prompt prefix is the single
biggest speed lever.

### 5.2 Prefix caching

llama-server keeps each slot's key-value cache. When a new request starts with the same tokens as the last one in
that slot, it skips prefill for the shared part (`cache_prompt` is on by default). Spec 22 already puts the system
text and the problem block first so that a hosted API can cache them; the same order works here. Three things make
it work on one box:

1. **One slot per box for prefill speed** (`-np 1`); everything else waits in our queue, not in llama-server.
2. **Group the queue by problem**: if three jobs are waiting, run the two about the same problem back to back.
3. **Save and restore a slot per problem** (`--slot-save-path`, then the `/slots/0?action=save|restore`
   endpoints): the cache for one problem's prefix is ~0.4–0.8 GB on disk and reloads from NVMe in about a second,
   instead of a minute or more of prefill. Keep the 10–20 most used problems saved.

Check in the first days that the server log shows the prefix reused. If it does not, something at the start of the
prompt is changing (a timestamp, an unsorted object), the same failure spec 22 §12.7 warns about for a hosted API.

### 5.3 Estimates

**These are estimates from published CPU results and first principles, not measurements on our box.** Assumptions:
x86 vCPUs with AVX2, shared; prefill ~11 tokens/s per vCPU for a 4B model; decode 4–8 tokens/s; a `review` of
7,000 input tokens, 5,200 of them cacheable, and 450 output tokens. The published points behind them: a 7B model
plateaued at ~3.6 tokens/s decode on a 4 vCPU Xeon; Qwen3.5-4B decoded ~8.5 tokens/s on a 16-core EPYC; a 30B-A3B
model prefilled ~23 tokens/s on a 7-thread Arm board.

| Box | Model | Prefill tok/s | Decode tok/s | Review, prefix cached | Review, not cached |
|---|---|---|---|---|---|
| 1 vCPU / 4 GB (Hostinger KVM 1) | 4B | ~11 | ~4 | ~4.5 min | ~12 min |
| 2 vCPU / 8 GB (Hostinger KVM 2) | 4B | ~22 | ~6 | ~2.6 min | ~6.5 min |
| **4 vCPU / 8 GB (Contabo VPS 10)** | **4B** | **~45** | **~7** | **~1.7 min** | **~3.7 min** |
| 4 vCPU / 8 GB | 1.7–2B | ~100 | ~15 | ~50 s | ~1.7 min |
| 4 Arm / 24 GB (Oracle free) | 4B | ~25–35 | ~6–8 | ~2 min | ~4–5 min |
| 4 Arm / 24 GB (Oracle free) | 30B-A3B MoE | ~13–20 | ~5 | ~3.5 min | ~7–10 min |
| *Hosted small model, for comparison* | — | — | — | *~2–6 s* | *~2–6 s* |

A `clarify` job is much shorter (a few hundred new tokens, ~60 tokens out): ~15–30 s on the 4 vCPU box.

---

## 6. How many subscribers one box serves

Usage is a guess until there are users (spec 22 §14.9 records the events that will tell us). Three profiles,
counting every AI job (a mock interview counts as several):

| Profile | AI jobs a month | Jobs on an active evening hour (12 % of a day's jobs) |
|---|---|---|
| Light | 8 | 0.032 per subscriber |
| Typical | 18 | 0.072 per subscriber |
| Heavy | 40 | 0.16 per subscriber |

A box should run at **at most 70 % busy at the peak hour**: then, for a queue with fixed job times, the average
wait in the queue is about 1.2 job times, so the learner waits about **2.2 job times** in all. At 90 % busy, the
wait is about 5.5 job times and grows quickly.

| Box and model | Jobs an hour (cached) | Wait at 70 % busy | Subscribers: light | typical | heavy |
|---|---|---|---|---|---|
| 1 vCPU, 4B | ~13 | ~10 min | ~280 | ~125 | ~55 |
| 2 vCPU, 4B | ~23 | ~6 min | ~500 | ~225 | ~100 |
| **4 vCPU, 4B** | **~35** | **~4 min** | **~770** | **~340** | **~150** |
| 4 vCPU, 1.7–2B | ~75 | ~2 min | ~1,600 | ~730 | ~330 |

Cache hits (spec 22 §12.6: the same design asked twice costs nothing) lower the load further. Above these numbers,
**add a second box** (another ₹600; the queue sends jobs to whichever box is free) or move up to a 6–8 vCPU plan.

---

## 7. Money at ₹199 a month

### 7.1 What a subscriber leaves us

| | ₹ |
|---|---|
| Price paid, GST included | 199.00 |
| GST inside the price (18/118) | −30.36 |
| Payment gateway (~2 % + 18 % GST on the fee) | −4.70 |
| **Kept per subscriber, before any server** | **≈ 164** |

### 7.2 What the AI costs per subscriber

**Self-hosted:** fixed. One box at ~₹600 a month, whatever the usage, up to its capacity:

| Paying subscribers | Box cost per subscriber | Share of the ₹164 |
|---|---|---|
| 10 | ₹60 | 37 % |
| 50 | ₹12 | 7 % |
| 100 | ₹6 | 3.7 % |
| 200 | ₹3 | 1.8 % |
| 340 (one box full, typical use) | ₹1.8 | 1.1 % |

**Hosted API:** per call. One `review` = 7,000 input + 450 output tokens, ₹88 to the dollar, no caching discount
counted (caching makes the hosted prices lower still). Prices from Anthropic's model table (Haiku, Sonnet) and
third-party aggregators (the others); check the provider's page before relying on them:

| Hosted model class | Price per million tokens (in / out) | Per job | Per subscriber a month (typical, 18 jobs) |
|---|---|---|---|
| Claude Haiku 5.5 | $0.10 / $0.50 | ~₹0.08 | **~₹1.5** |
| DeepSeek V4 Flash (aggregator) | ~$0.14 / $0.40 | ~₹0.10 | ~₹1.8 |
| Gemini 3.1 Flash-Lite (aggregator) | ~$0.25 / $1.50 | ~₹0.21 | ~₹3.8 |
| A mid-tier model, e.g. Claude Sonnet 5.5 | $2 / $10 | ~₹1.6 | ~₹29 |

### 7.3 Where the box wins

The box is cheaper than the API when ₹600 ÷ subscribers falls below the API's cost per subscriber:

| Against | The box is cheaper above | One box's capacity (typical) |
|---|---|---|
| The cheapest small hosted models (~₹1.5–2 a subscriber) | ~300–400 subscribers | ~340 |
| A Flash-Lite-class model (~₹3.8) | ~160 subscribers | ~340 |
| A mid-tier model (~₹29) | ~21 subscribers | ~340 |

**Reading this:** against the cheapest hosted small models, a box is never meaningfully cheaper before it is
full. It only saves real money against mid-priced models, and those are the ones a 4B model is furthest behind
in quality. **At ₹199 the AI is affordable either way** (about 1–2 % of what we keep on a cheap hosted model), so the
decision should be made on quality, speed and independence, not on the bill.

### 7.4 Costs that are not on the invoice

| | Self-hosted | Hosted API |
|---|---|---|
| Cost with no users | ₹600 a month | ₹0 |
| Cost at launch with ~20 users | ₹600 (₹30 a user) | ~₹30–80 in all |
| Your time | Set-up (a day), then patches, model updates, watching a second machine | An API key and a spend limit |
| Paying for it | INR, UPI (Hostinger) or a card in EUR (Contabo) | A card in USD; GST under reverse charge; forex markup |
| Outages | One box; when it is down, everyone gets the floor | The provider's uptime; the floor if it fails |
| Data | Learner text never leaves our machines: "processed on our own server" | "Sent to our AI provider" (spec 22 §12.8) |
| Free users | Spare capacity is free: free users could get a small taste of the interviewer at no cost per call | Every free call costs money, so the free tier gets the floor only |

---

## 8. Quality and safety on a small model

### 8.1 What to expect

- `clarify`: fine on a 4B, probably fine on 2B.
- `review`: workable on a 4B. Expect the order of importance to be weaker than a hosted model's and the
  verifier to drop more items (R3 slots, R4 digits). Dropped items are replaced with fact sentences; under two
  items, the template review is shown. Spec 22 §19.4 already tracks this rate.
- `grade`: the weak spot. Small models tend to mark a point "met" when the answer only mentions the topic. R7
  rejects invented quotes, but cannot catch a real quote judged wrongly. This job decides marks the learner sees,
  so it needs the best model the evaluation set allows.
- **Thinking off** on a CPU (it costs minutes). That removes the main way small models improve on hard judgement.

### 8.2 What self-hosting does better: the grammar

llama-server accepts a JSON schema (`response_format` with `json_schema`) and compiles it to a grammar, so the
output is **always** valid JSON of the right shape (spec 22 R1). Our own box also allows a **custom grammar
per request**, which a hosted API does not:

- fact ids limited to an **enum of the ids actually in the pack** (R2 cannot fail);
- slot fields limited to the fields that fact has (R3 mostly cannot fail);
- prose strings that **cannot contain a digit except inside `{{…}}`** (R4 cannot fail).

The verifier stays exactly as it is (it is the rule; the grammar only makes failures rarer). Temperature 0 and a
fixed seed make results repeatable, which spec 22 V7 wants.

### 8.3 Safety

- Prompt injection is no worse than with a hosted model: the model has no tools and the verifier checks every
  output (spec 22 §12.8). Small models are *more* easily steered by injected text, so the evaluation set's
  injection cases (ship rule: zero successes) matter more.
- The model box holds no user data at rest. Turn off prompt logging in llama-server; log only the numbers spec 22
  §12.7 lists (tokens, milliseconds, outcome).
- The box is reachable **only from the API VPS** (§9.2), never from the internet.

### 8.4 Changes to spec 22 if self-hosting is chosen

| Spec 22 | Now | With a self-hosted model |
|---|---|---|
| §12.7 client | One synchronous call, 25 s timeout, one retry | An **async job**: `POST` creates it and returns `{ job, position, eta }`; the browser polls (or uses server-sent events); the worker calls the model with a timeout of ~10 minutes |
| §12.7 configuration | `AI_API_KEY`, `AI_MODEL` | Add `AI_BASE_URL` (OpenAI-compatible endpoint: llama-server, or a provider), `AI_PROVIDER` (`local` / `hosted`), `AI_ROUTE` (which job goes where), `AI_MAX_QUEUE_WAIT` |
| §12.8 privacy | "Sent to our AI provider" | "Processed on our own server" for local jobs |
| §17.2 collections | `practice_ai` (results) | Add `practice_ai_jobs`: `{ key, job, problem, status, position, created, started, finished, outcome }` |
| §18 credits | Reserve, call, settle | Reserve on enqueue; settle when the job ends; return the credit if the job falls back to the floor or is dropped from a full queue |
| §14.3 review card | Appears after a short spinner | "Reading your design · about 2 minutes · 1 ahead of you"; the learner may leave; a dot on the Practice tab when it is ready |

**Floor when the queue is long:** if the estimated wait is above `AI_MAX_QUEUE_WAIT` (say 15 minutes) or the box
is down, answer at once with the floor ("The interviewer is busy; here is the report's version") and return the
credit, or send the job to the hosted model if `AI_ROUTE` allows overflow.

---

## 9. How it would be set up

### 9.1 Shape

```
Browser ──► Cloudflare ──► API VPS (Node 22, tech-api.katta.cc)
                             │  judge, evidence pack, verifier, credits     (unchanged)
                             │  AI queue: practice_ai_jobs, one worker loop
                             │
                             │  HTTPS over a WireGuard tunnel (or firewall allow-list + API key)
                             ▼
                           LLM VPS (no public ports except SSH and WireGuard)
                             llama-server on 127.0.0.1:8080 / tunnel address
                             one model, one slot, slot cache files on NVMe
```

The API side talks to the model through **one OpenAI-compatible endpoint** (`/v1/chat/completions`). llama-server
serves that API; so do most hosted providers. Switching between local and hosted is a configuration change, not a
rewrite. This matches spec 22 §12.7's rule that one file (`backend/src/ai/client.js`) talks to the model.

### 9.2 The box

1. Ubuntu 24.04 LTS, unattended security updates, SSH keys only, `ufw` default deny.
2. WireGuard between the API VPS and the LLM VPS; llama-server listens only on the tunnel address. If WireGuard
   is too much at first: listen on the public interface, `ufw allow from <API VPS IP> to any port 8080`, and
   `--api-key` (a secret in the environment, never in a repository).
3. Build llama.cpp from a pinned release tag (CPU build). Download the model's GGUF file once, check its SHA-256
   against the Hugging Face listing, keep it in `/var/lib/llm/models/`.
4. Run llama-server under systemd with `Restart=always`, a dedicated user, `MemoryMax` a little under the box's RAM.

Flags to start from (check every flag against `llama-server --help` of the pinned build; they change):

```
llama-server \
  -m /var/lib/llm/models/<model>.gguf \
  -c 8192 -np 1 -t <physical cores> \
  --host <tunnel address> --port 8080 \
  --jinja \
  --reasoning-budget 0 \
  --slot-save-path /var/lib/llm/slots \
  --metrics \
  --no-webui
```

`--jinja` uses the model's own chat template; `--reasoning-budget 0` turns thinking off (for Qwen3 the template
switch `enable_thinking=false` does the same); `--metrics` serves Prometheus-style counters at `/metrics`. The API
key comes from the environment (`LLAMA_API_KEY` or `--api-key-file`, per the build's help), never from a file in a
repository.

### 9.3 The benchmark to run first (phase P0)

Run on the box actually rented, at a quiet hour and again at a busy one (shared cores vary):

```
# raw speed: prompt processing at 512 and 4096 tokens, generation of 128 tokens
llama-bench -m <model>.gguf -p 512,4096 -n 128 -t <cores> -r 5

# the real shape: send 3 real review requests for 2 problems through llama-server,
# first cold, then with the prefix cached, and record:
#   prompt tokens, cached tokens, prefill ms, decode ms, total ms, JSON valid?, verifier outcome
```

Write the measured numbers into §5.3 and §6 of this file, replacing the estimates, with the date, the plan, the
CPU model (`lscpu`) and the llama.cpp build.

### 9.4 Watching it

From `/metrics` and our own job log: queue length, wait p50/p95, job time p50/p95, prefix-cache hit share,
verifier outcome (`ok`, `verifier-partial`, `fallback`), box CPU and RAM. Alert when the p95 wait passes 10
minutes on two evenings in a row: that is the signal for a second box.

---

## 10. Recommendation and plan

### 10.1 Recommendation

1. **Build the async queue and the OpenAI-compatible client in any case.** Both a hosted and a local model use
   them, and the queue also protects the hosted path from bursts.
2. **Decide per job by measurement**, with spec 22 §19.3's evaluation set:
   - send a job to the self-hosted model only if its score is within ~5 points of the hosted model, its injection
     successes are zero, its fallback rate is under 10 %, and its p95 wait at the expected peak is under 5 minutes;
   - otherwise send it to the hosted model.
3. **Expected outcome** (to be confirmed by the evaluation): `clarify` on the box, `review` possibly on the box,
   `grade` on a hosted model. Paying users never depend on the box alone; when it is busy or down, jobs go to the
   hosted model or to the floor.
4. **Use the box's spare capacity for free users** (for example one interviewer review a week), which a hosted
   API would charge for. This is the self-hosted box's clearest advantage at ₹199.
5. If the owner prefers **no hosted provider at all**: it works, with a 4 vCPU box per ~150–340 subscribers,
   waits of a few minutes at peak, and a weaker `grade`. Say so on the "How you are evaluated" page.

### 10.2 Phases

| Phase | Work | Done when |
|---|---|---|
| P0 | Claim an Oracle free A1 box (₹0) or rent one month of Contabo VPS 10; run §9.3 with Qwen3-4B and one alternative | Measured numbers are in this file |
| P1 | Async job queue + provider-agnostic client + the spec changes of §8.4 | Works with `AI_ENABLED=false` (floor only) and with a stub model in tests |
| P2 | Evaluation set (§19.3) run on the local candidates and one hosted model | Scores, injection results, fallback rates and times in a table here |
| P3 | Choose `AI_ROUTE` per job by §10.1's rule; rent the production box if any job goes local | Owner approves |
| P4 | `AI_ALLOW` testers in production for a week | p95 wait, fallback rate and cost per user measured |
| P5 | Open to paying users; free-user taste if capacity allows | |

### 10.3 For the owner to decide

| # | Decision | Recommendation |
|---|---|---|
| 1 | Self-hosted only, hosted only, or split by job | Split by job, decided by the evaluation set |
| 2 | Which box for P0 | Oracle free A1 (₹0) if it can be claimed in Mumbai/Hyderabad; else one month of Contabo Cloud VPS 10 |
| 3 | The longest acceptable wait before falling back | 15 minutes; show the estimate before the learner presses the button |
| 4 | Do free users get any AI from spare capacity? | Yes, a small weekly allowance, only from the self-hosted box |
| 5 | Is "processed on our own server" worth saying in marketing? | Yes, if every job a user can reach runs locally |

---

## 11. Update: at least 150 AI reviews per user per month

Owner, 2026-11-13: "I want to give the user at least 150 AI powered reviews per user per month. Check what wins,
and also decide on which LLM."

150 a month is about **5 reviews a day** per subscriber, eight times the "typical" profile of §6. Not everyone will
use the whole allowance, so each row below is worked twice: **everyone uses all 150** (the worst case, which must
still be safe) and **40 % use** (60 reviews, a planning guess until §14.9's events give the real figure).

### 11.1 Self-hosted at 150 a user

With 5 reviews a day and 12 % of a day's reviews in the evening peak hour, each subscriber sends ~0.6 reviews in
that hour. A 4 vCPU box running a 4B model does ~35 cached reviews an hour and should stay under 70 % busy (§6):

| Use of the 150 | Subscribers per ₹600 box | Box cost per subscriber | Boxes for 100 / 500 / 1,000 subscribers |
|---|---|---|---|
| All 150 | **~40** | **~₹15** | 3 / 13 / 25 |
| 60 % (90) | ~70 | ~₹9 | 2 / 8 / 15 |
| 40 % (60) | ~100 | ~₹6 | 1 / 5 / 10 |

And what the numbers hide:

- **Bursts.** A learner practising does several reviews in one sitting. Ten reviews on one box is ~17 minutes of
  that box's time; everyone behind them waits. An API runs them side by side.
- **Many machines.** 1,000 subscribers at full use is 25 boxes to patch, watch and route between.
- **Small scale.** With 20 subscribers the one box still costs ₹600: ₹30 each, more than the API at full use.
- **A smaller model to go faster** (1.7–2B, about twice the capacity) is too weak for `review` (§8.1).

### 11.2 Hosted at 150 a user

Haiku 5.5 counts the same text as ~30 % more tokens than older tokenizers, so one review is ~9,100 input tokens
(~6,800 of them the cacheable system text and problem block) and ~450 output tokens with thinking off (~1,000
with thinking at `low`). Prices from Anthropic's model table: $0.10 input, $0.50 output per million tokens; cache
reads ~0.1× input, 5-minute cache writes 1.25× input; minimum cacheable prefix 512 tokens. ₹88 to the dollar.

| Claude Haiku 5.5, one review | Thinking off | Thinking `low` |
|---|---|---|
| Prefix already cached | ₹0.05 | ₹0.07 |
| No cache | ₹0.10 | ₹0.12 |
| Cache written this time | ₹0.12 | ₹0.14 |
| **150 reviews, per subscriber a month** | **₹7–17** | **₹11–21** |
| 60 reviews (40 % use) | ₹3–7 | ₹4–8 |

Other hosted models, same review (their own tokenizers, no cache, prices from aggregators except Sonnet):

| Model | Per review | 150 a month | 60 a month | Note |
|---|---|---|---|---|
| **Claude Haiku 5.5** | ₹0.05–0.14 | **₹7–21** | ₹3–8 | Price checked on the provider's own table |
| DeepSeek V4 Flash | ~₹0.10 | ~₹15 | ~₹6 | Similar cost; learner text goes to a provider in China, which is a privacy question for an Indian learner's answers |
| Gemini 3.1 Flash-Lite | ~₹0.21 | ~₹32 | ~₹13 | About twice the cost |
| Claude Sonnet 5.5 | ~₹1.6 | ~₹245 | ~₹98 | **Loses money at 150** (more than the ₹164 we keep). Only for `grade`, if needed, with its own small limit |

### 11.3 What wins

| | Self-hosted 4 vCPU box, 4B model | Hosted, Claude Haiku 5.5 |
|---|---|---|
| Cost per subscriber, all 150 used | ~₹15 (≈9 % of ₹164) | ₹7–21 (4–13 %) |
| Cost per subscriber, 60 used | ~₹6 | ₹3–8 |
| Cost with 20 subscribers | ₹600 (₹30 each) | ₹60–420 in all |
| Wait per review | ~2 min alone, ~4 min at peak, much longer behind a burst | A few seconds |
| Ten reviews in a row | Minutes each, and others wait | Seconds each |
| Quality | A 4B model on a CPU, thinking off | A much larger model; effort can be raised per job |
| Growing to 1,000 subscribers | 10–25 boxes to run | A spend limit and a rate-limit tier |
| Worst case | Queues grow; learners get the floor | Bounded: ₹21 a subscriber even if all use 150 with no cache |
| Independence and privacy | Better: nothing leaves our servers | Text goes to the provider (spec 22 §12.8 wording) |

**The hosted model wins.** The cost is a tie within a few rupees either way, and on everything else the hosted
model is ahead. The self-hosted box only wins on independence, and at 150 reviews a user it would have no spare
capacity left to give free users, which was its other advantage in §10.1.

### 11.4 Which model: Claude Haiku 5.5

**Decision: Claude Haiku 5.5** (`claude-haiku-5-5`, set through `AI_MODEL` in the server's environment, never in
code).

Why: the lowest price per review among the options checked, with the price confirmed on the provider's own page;
prompt caching from a 512-token prefix, which suits spec 22's fixed system text and problem block; structured
(schema-constrained) output, which spec 22 §12.3 needs; a 1M context; seconds per answer. The cheapest models from
other providers either cost about twice as much or send learner text to a provider in China.

How to run it:

| Setting | Start with | Why |
|---|---|---|
| Effort | `low` | Spec 22 §12.7: the lowest effort that passes the evaluation set |
| Thinking | Off (`{type: "disabled"}`, accepted at effort `high` or below); compare with adaptive at `low` in the evaluation | Thinking tokens are billed as output; turn it on only where it raises the score |
| Output | Structured output with the job's JSON schema | R1 cannot fail; the verifier still runs |
| Caching | `cache_control` at the end of the problem block; 5-minute cache; check `cache_read_input_tokens` is not zero | Most of the input is the same for every review of a problem |
| Refusals | `stop_reason: "refusal"` is a failure: show the floor, return the credit | There is no server-side fallback for Haiku 5.5 |
| `grade` | Haiku 5.5 first; Claude Sonnet 5.5 only if Haiku misses the evaluation set's bar, with a separate low limit | `grade` is rarer than `review`; Sonnet at 150 a month would lose money |
| Batches (50 % off) | Not now | It would halve the cost, but answers can take up to a day; keep it for a "review by tomorrow" option if ever wanted |

The evaluation set (spec 22 §19.3) still runs before launch. Run it on Haiku 5.5 and one other model (DeepSeek V4
Flash or Gemini Flash-Lite) as a check. Change the decision only if Haiku 5.5 misses the bar and the other model
passes.

### 11.5 Limits to go with 150

The numbers below are the owner's to set (spec 22 §18). These are the guards the design needs:

- **150 reviews a month per subscriber**, plus a daily cap (for example 20) so a script cannot spend a month in an
  hour.
- **A cache hit is free** (spec 22 §12.6): the same design asked twice does not count.
- **A credit is spent only on a verified AI result**; the floor gives it back.
- **`AI_DAILY_TOKEN_CAP`** for the whole site, set to about twice the expected daily use, so a bug cannot run up a
  bill.
- A **spend limit** on the provider account.

### 11.6 What changes in this file's plan

- Phase P0 (renting or claiming a box) is **dropped**. P1 (one-file client, async-capable jobs) and P2 (evaluation
  set) stay, P2 run on Haiku 5.5 and one comparison model.
- The async queue of §8.4 is no longer required for speed (Haiku answers within spec 22's 25-second timeout). Keep
  spec 22 §12.7 as written.
- §10.3 decision 1 is taken: **hosted, Claude Haiku 5.5**. Decisions 2 and 4 (a box for P0, free users on spare
  capacity) fall away; 3 and 5 no longer apply.

---

## 12. Sources

Checked 2026-11-13. Most price sources are third-party snapshots; the provider's own page is authoritative.

VPS prices and the 2026 increases:
- Hostinger India: [Zoutons, Aug 2026](https://zoutons.com/news/hostinger-vps-hosting-price-india-2026), [FindStack, Aug 2026](https://findstack.com/resources/best-vps-hosting-india), [HostAdvice renewal prices](https://hostadvice.com/hosting-company/hostinger-reviews/hostinger-india-pricing/), [Valebyte, Nov 2026](https://valebyte.com/en/vps/india/?provider=hostinger)
- Contabo: [India location page](https://www.contabo.com/en/locations/india), [PricingSaaS, 2026 Q2 changes](https://pricingsaas.com/companies/contabo.main/diffs/2026Q2), [VPSBenchmarks, Cloud VPS 20](https://www.vpsbenchmarks.com/hosters/contabo/plans/cloud-vps-20)
- Hetzner: [Tom's Hardware, April increase](https://www.tomshardware.com/tech-industry/hetzner-to-raise-prices-by-up-to-37-percent-from-april-1), [WZ-IT, June increase](https://wz-it.com/en/blog/hetzner-price-increase-june-2026-cpx-ccx-alternatives/), [Capital & Compute, all three waves](https://capitalandcompute.net/blog/hetzner-price-increase-2026/), [365i, RAM shortage](https://www.365i.co.uk/news/2026/02/27/cloud-hosting-prices-surging-ai-ram-shortage/)
- Oracle free tier: [Oracle docs, Always Free resources](https://docs.oracle.com/iaas/Content/FreeTier/resourceref.htm), [InfoQ, July 2026 limits](https://infoq.com/news/2026/07/oracle-cloud-free-tier-limits/), [reclamation rules](https://oracommit.blogspot.com/2026/02/understanding-oci-always-free-compute.html), [Space-Node, limits and capacity](https://space-node.net/blog/oracle-cloud-always-free-limits-2026)
- GPU prices in India: [E2E Networks pricing](https://www.e2enetworks.com/pricing.md), [Cyfuture, GPU rent in India](https://cyfuture.cloud/kb/howto/how-much-does-it-cost-to-rent-a-gpu-in-india), [Techplained, self-hosting LLMs from India](https://www.techplained.com/self-host-llms-india)

CPU inference:
- [geerlingguy/ai-benchmarks](https://github.com/geerlingguy/ai-benchmarks) and [edge-cpu-inference](https://github.com/nandan2003/edge-cpu-inference) (4 vCPU Xeon, 7B plateau ~3.6 tok/s)
- [Qwen3.5 small models on a 16-core EPYC](https://bkataru.github.io/igllama/showcase/qwen35-small/)
- [Radxa forum, llama.cpp on Arm](https://forum.radxa.com/t/llama-cpp-benchmarks/27813)
- [Oracle, Llama on Ampere A1](https://blogs.oracle.com/ai-and-datascience/post/democratizing-generative-ai-with-cpu-based-inference)
- [llama.cpp, KV cache reuse with llama-server](https://github.com/ggml-org/llama.cpp/discussions/13606), [cache issue with hybrid/SWA models](https://github.com/ggml-org/llama.cpp/issues/18497), [cache_prompt on by default](https://cdn04132025.gitlink.org.cn/replica/llama.cpp/commit/47f931c8f9a26c072d71224bc8013cc66ea9e445)
- [llama.cpp cheat sheet, thread sweeps](https://computingforgeeks.com/llama-cpp-cheat-sheet/)

Models:
- [Qwen3.5 small models (NYU Shanghai RITS)](https://rits.shanghai.nyu.edu/ai/qwen-3-5-small-models-9b-parameters-that-beat-120b/), [VentureBeat](https://venturebeat.com/technology/alibabas-small-open-source-qwen3-5-9b-beats-openais-gpt-oss-120b-and-can-run)
- [Best CPU-only LLMs 2026](https://www.popularai.org/p/best-cpu-only-local-llm-2026), [PromptQuorum CPU guide](https://www.promptquorum.com/local-llms/best-cpu-only-llm), [Hugging Face, open models to run locally](https://huggingface.co/blog/daya-shankar/open-source-llm-models-to-run-locally)

Hosted API prices:
- Anthropic model table and prompt-caching reference (Claude Haiku 5.5 $0.10 / $0.50 per million tokens for prompts up to 100K, tokenizer ~30 % more tokens than Haiku 4.5, cache reads ~0.1× input, 5-minute writes 1.25×, 512-token minimum prefix, no server-side refusal fallback; Claude Sonnet 5.5 $2 / $10; as of 2026-11-03)
- [Morph, LLM API prices Nov 2026](https://www.morphllm.com/llm-api), [BenchLM pricing](https://benchlm.ai/llm-pricing), [Gemini 3.1 Flash-Lite pricing](https://pricepertoken.com/pricing-page/model/google-gemini-3.1-flash-lite)
