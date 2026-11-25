# AI evaluator bake-off, trial

10 designs (ground-truth.json v1) × 1 runs per model, through Vercel AI Gateway. Gates: correct ≥ 90 %, fallbacks + errors ≤ 2 %, no good fact called a problem, no failing design praised, p95 ≤ 10 s.

| Rank | Model | Passes | Correct | Fault found | Same answer every run | Fallback + error | p95 | Per correct review | 1,000 reviews |
|---|---|---|---|---|---|---|---|---|---|
| 1 | meta/muse-ember@low | yes | 90 % | 90 % | 90 % | 0 % | 4.7 s | $0.000952 | ₹84 |
| 2 | meta/muse-ember@minimal | no: correct under 90 %; fallbacks and errors over 2 % | 80 % | 80 % | 80 % | 20 % | 5.0 s | $0.000647 | ₹57 |

Spent about $0.014. Read a sample of each passing model's reviews (the JSON files beside this one) before choosing: the scores check that it found the fault, not how well it explains it.
