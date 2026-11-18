# AI evaluator bake-off trial, marked again against the hand-written answer key (answer-key.mjs) and ground truth v2

Gates: correct ≥ 90 %, fallbacks + errors ≤ 2 %, no good fact called a problem, no failing design praised, p95 ≤ 10 s.

| Rank | Model | Passes | Correct (before) | Fault found | Right fix | Wrong advice | Same answer every run | Fallback + error | p95 | Per correct review | 1,000 reviews |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | meta/muse-ember@low | yes | 90 % (90 %) | 100 % | 90 % | 0 | 90 % | 0 % | 4.7 s | $0.000952 | ₹84 |
| 2 | meta/muse-ember@minimal | no: correct under 90 %; fallbacks and errors over 2 % | 70 % (80 %) | 80 % | 70 % | 0 | 70 % | 20 % | 5.0 s | $0.0007394 | ₹65 |
