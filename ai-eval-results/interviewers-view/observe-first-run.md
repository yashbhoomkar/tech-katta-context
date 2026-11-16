# Interviewer's view: model test first-run

22 designs (10 flawed, each with its own finding the judge cannot see; 12 clean) × 3 runs, through Vercel AI Gateway.
The bar: catches ≥ 80 %, false alarms ≤ 10 %, errors ≤ 2 %, p95 ≤ 10 s. Then the cheapest correct answer.

| Rank | Model | Clears the bar | Catches | False alarms | Same every run | Errors | p95 | Per correct answer | 1,000 answers |
|---|---|---|---|---|---|---|---|---|---|
| 1 | openai/gpt-5-mini@low | no: catches under 80 %; false alarms over 10 %; p95 over 10 s | 70 % | 100 % | 81.8 % | 0 % | 11.5 s | $0.0045227 | ₹398 |
| 2 | meta/muse-ember@low | no: catches under 80 %; false alarms over 10 % | 66.7 % | 36.1 % | 63.6 % | 0 % | 6.4 s | $0.0010654 | ₹94 |
| 3 | openai/gpt-oss-20b@low | no: catches under 80 %; false alarms over 10 % | 53.3 % | 75 % | 54.5 % | 1.5 % | 8.0 s | $0.0002481 | ₹22 |
| 4 | google/gemini-2.5-flash-lite@low | no: catches under 80 %; false alarms over 10 % | 53.3 % | 75 % | 68.2 % | 0 % | 6.3 s | $0.0015186 | ₹134 |
| 5 | deepseek/deepseek-v3.1 | no: catches under 80 %; false alarms over 10 %; p95 over 10 s | 43.3 % | 77.8 % | 59.1 % | 0 % | 10.5 s | $0.0009952 | ₹88 |
| 6 | openai/gpt-oss-120b@low | no: catches under 80 %; false alarms over 10 % | 33.3 % | 55.6 % | 45.5 % | 0 % | 3.8 s | $0.0006966 | ₹61 |
| 7 | alibaba/qwen3.7-flash@low | no: catches under 80 %; false alarms over 10 %; p95 over 10 s | 26.7 % | 52.8 % | 40.9 % | 0 % | 18.1 s | $0.0005151 | ₹45 |
| 8 | nvidia/nemotron-3-super-120b-a12b | no: catches under 80 %; false alarms over 10 % | 23.3 % | 72.2 % | 40.9 % | 1.5 % | 5.2 s | $0.0015251 | ₹134 |

## Which model caught which flaw (runs caught / runs)

| Finding | openai/gpt-5-mini@low | meta/muse-ember@low | openai/gpt-oss-20b@low | google/gemini-2.5-flash-lite@low | deepseek/deepseek-v3.1 | openai/gpt-oss-120b@low | alibaba/qwen3.7-flash@low | nvidia/nemotron-3-super-120b-a12b |
|---|---|---|---|---|---|---|---|---|
| A time-bucket partition key sends all current traffic to one partition | 3/3 | 3/3 | 3/3 | 3/3 | 2/3 | 3/3 | 3/3 | 2/3 |
| The partition key is not the lookup key, so every read asks every node | 3/3 | 3/3 | 2/3 | 3/3 | 1/3 | 0/3 | 1/3 | 1/3 |
| Large blobs kept in a key-value store | 3/3 | 3/3 | 3/3 | 3/3 | 1/3 | 2/3 | 0/3 | 1/3 |
| A key too coarse for the rows, so they overwrite each other | 3/3 | 3/3 | 1/3 | 2/3 | 2/3 | 2/3 | 2/3 | 1/3 |
| A handful of live entities hold all the traffic | 1/3 | 0/3 | 0/3 | 0/3 | 1/3 | 0/3 | 1/3 | 0/3 |
| A timestamp as primary key, so rows made in the same instant collide | 3/3 | 3/3 | 3/3 | 3/3 | 3/3 | 1/3 | 1/3 | 2/3 |
| A CDN TTL far too short for content that never changes | 2/3 | 0/3 | 1/3 | 1/3 | 0/3 | 0/3 | 0/3 | 0/3 |
| Sequential ids let anyone read private data by counting up | 1/3 | 2/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 |
| A missing column, so the limit never resets | 2/3 | 3/3 | 3/3 | 1/3 | 3/3 | 2/3 | 0/3 | 0/3 |
| Clients reach the data store directly, with no server in between | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 | 0/3 |

Every answer is in the .jsonl files beside this report. Read a sample of the best models' points before choosing:
the marking checks the line and category, not how well the point is explained.
