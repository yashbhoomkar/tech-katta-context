# AI evaluator bake-off full-2026-11-16, marked again against the hand-written answer key (answer-key.mjs) and ground truth v2

Gates: correct ≥ 90 %, fallbacks + errors ≤ 2 %, no good fact called a problem, no failing design praised, p95 ≤ 10 s.

| Rank | Model | Passes | Correct (before) | Fault found | Right fix | Wrong advice | Same answer every run | Fallback + error | p95 | Per correct review | 1,000 reviews |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | meta/muse-ember@low | no: correct under 90 % | 70.7 % (88 %) | 95.1 % | 75.1 % | 7 | 58.7 % | 0.4 % | 4.9 s | $0.001168 | ₹103 |
| 2 | minimax/minimax-m3.1-flash@low | no: correct under 90 %; fallbacks and errors over 2 %; p95 over 10 s | 60.4 % (73.8 %) | 76 % | 70.7 % | 5 | 32 % | 12.9 % | 21.8 s | $0.0011408 | ₹100 |
| 3 | google/gemma-4-26b-a4b-it | no: correct under 90 %; fallbacks and errors over 2 % | 45.8 % (60.9 %) | 80.4 % | 47.6 % | 3 | 33.3 % | 15.1 % | 8.0 s | $0.0010538 | ₹93 |
| 4 | meta/llama-4-scout | no: correct under 90 %; fallbacks and errors over 2 % | 28.4 % (48.4 %) | 54.2 % | 32.4 % | 0 | 18.7 % | 39.6 % | 6.3 s | $0.0009908 | ₹87 |
| 5 | alibaba/qwen3.8-flash@none | no: correct under 90 %; fallbacks and errors over 2 % | 0 % (0 %) | 0 % | 0 % | 0 | 0 % | 100 % | 0.8 s | $? | ? |
| 6 | anthropic/claude-haiku-5.5@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % (0 %) | 0 % | 0 % | 0 | 0 % | 100 % | 0.6 s | $? | ? |
| 7 | deepseek/deepseek-v4.1-flash@none | no: correct under 90 %; fallbacks and errors over 2 % | 0 % (0 %) | 0 % | 0 % | 0 | 0 % | 100 % | 0.7 s | $? | ? |
| 8 | google/gemini-3.1-flash-lite@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % (0 %) | 0 % | 0 % | 0 | 0 % | 100 % | 0.7 s | $? | ? |
| 9 | openai/gpt-6-luna@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % (0 %) | 0 % | 0 % | 0 | 0 % | 100 % | 0.7 s | $? | ? |
| 10 | zai/glm-5.3-flash@low | no: correct under 90 %; fallbacks and errors over 2 % | 0 % (0 %) | 0 % | 0 % | 0 | 0 % | 100 % | 0.7 s | $? | ? |
