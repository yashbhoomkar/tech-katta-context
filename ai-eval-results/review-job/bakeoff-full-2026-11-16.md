# AI evaluator bake-off, full-2026-11-16

75 designs (ground-truth.json v2) × 3 runs per model, through Vercel AI Gateway. Gates: correct ≥ 90 %, fallbacks + errors ≤ 2 %, no good fact called a problem, no failing design praised, p95 ≤ 10 s.

| Rank | Model | Passes | Correct | Fault found | Same answer every run | Fallback + error | p95 | Per correct review | 1,000 reviews |
|---|---|---|---|---|---|---|---|---|---|
| 1 | meta/muse-ember@low | no: correct under 90 % | 88 % | 88 % | 80 % | 0.4 % | 4.9 s | $0.000938 | ₹83 |
| 2 | minimax/minimax-m3.1-flash@low | no: correct under 90 %; fallbacks and errors over 2 %; p95 over 10 s | 73.8 % | 73.8 % | 50.7 % | 12.9 % | 21.8 s | $0.0009346 | ₹82 |
| 3 | google/gemma-4-26b-a4b-it | no: correct under 90 %; fallbacks and errors over 2 % | 60.9 % | 60.9 % | 46.7 % | 15.1 % | 8.0 s | $0.0007923 | ₹70 |
| 4 | meta/llama-4-scout | no: correct under 90 %; fallbacks and errors over 2 % | 48.4 % | 48.4 % | 30.7 % | 39.6 % | 6.3 s | $0.0005818 | ₹51 |
| 5 | anthropic/claude-haiku-5.5@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % | 0 % | 0 % | 100 % | 0.6 s | $? | ? |
| 6 | openai/gpt-6-luna@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % | 0 % | 0 % | 100 % | 0.7 s | $? | ? |
| 7 | google/gemini-3.1-flash-lite@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % | 0 % | 0 % | 100 % | 0.7 s | $? | ? |
| 8 | zai/glm-5.3-flash@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % | 0 % | 0 % | 100 % | 0.7 s | $? | ? |
| 9 | deepseek/deepseek-v4.1-flash@none | no: correct under 90 %; fallbacks and errors over 2 % | 0 % | 0 % | 0 % | 100 % | 0.7 s | $? | ? |
| 10 | alibaba/qwen3.8-flash@none | no: correct under 90 %; fallbacks and errors over 2 % | 0 % | 0 % | 0 % | 100 % | 0.8 s | $? | ? |

Spent about $0.513. Read a sample of each passing model's reviews (the JSON files beside this one) before choosing: the scores check that it found the fault, not how well it explains it.
