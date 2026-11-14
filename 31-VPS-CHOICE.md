# 31 — Choosing the API server (monthly, India), November 2026

Written 2026-11-14. Owner: "Check for the cheapest plan in India per month only for one month. Also check for AWS
Lightsail if it suits us the best." Context: the Bluehost Standard VPS NVMe 2 (₹392 + 18 % GST = ₹462.56 a month,
bought 2026-10-04) expired on 2026-11-04 and runs on grace. Changing servers is now cheap
(`tech-katta/ops/README.md`), so this choice can be revisited any month.

## 1. What the API needs

One Node 22 process (no runtime dependencies), Nginx, two judge pools on worker threads, content as JSON files (66
articles), the database in MongoDB Atlas (not on the server). Traffic is pre-launch. So: **1–2 vCPU, 1–2 GB memory
(the setup script adds 2 GB of swap below 3 GB), about 20 GB disk, a fixed public IPv4 address, an India region**,
billed **month to month with no prepayment**. CPU is idle most of the time and bursts when a design is judged.

## 2. Prices found (one-month term, India region)

Prices change often and many listings are third-party; confirm at checkout. At about ₹88 per US dollar; AWS India
bills add 18 % GST, Indian hosts usually quote with or without GST as noted.

| Provider and plan | Specs | About ₹ a month | Billing | Notes |
|---|---|---|---|---|
| Small Indian hosts (Vyom Cloud Starter; HeavenCloud) | 1–2 vCPU / 2 GB / 15–50 GB | **₹360–390** (+GST?) | monthly (to confirm) | Cheapest found, but from one blog / own listing; unknown reliability, support and exit terms |
| MilesWeb Mumbai V2 | 2 vCPU / 2 GB / 50 GB | ₹730 incl. GST | monthly | Third-party comparison |
| **AWS Lightsail $7 (Mumbai)** | 2 vCPU (10 % baseline, bursts) / 1 GB / 40 GB / 1 TB | **≈ ₹620 + GST ≈ ₹730** | hourly, capped at the monthly price; delete any time | Official price list |
| **AWS Lightsail $12 (Mumbai)** | 2 vCPU (20 % baseline) / 2 GB / 60 GB / 1.5 TB | ≈ ₹1,060 + GST ≈ **₹1,250** | same | Official price list |
| DigitalOcean (Bangalore) | 1 GB $6, 2 GB $12 | ≈ ₹530 / ₹1,060 + tax | per second | Third-party listings |
| Vultr (Mumbai, Delhi, Bangalore) | 1 vCPU / 2 GB | ≈ ₹900–1,060 + tax | hourly | Listings disagree ($10 vs $12) |
| Contabo Cloud VPS 10 (Mumbai) | 4 vCPU / 8 GB / 75–100 GB | ≈ $4.5–5 + India fee ≈ $4.20 ≈ **₹800** + a setup fee on short terms | monthly | Most machine per rupee; setup fee amount not confirmed; slower support by reputation |
| Hostinger KVM 1 (India) | 1 vCPU / 4 GB / 50 GB | ₹599 only on 24-month prepay; 1-month price not listed (list ₹1,649) | prepaid terms | Not a monthly option |
| Bluehost NVMe 2 (current) | — | ₹463 incl. GST | monthly | Expired; leaving |

Lightsail in Mumbai: same prices as other regions, half the data-transfer allowance (still 1–1.5 TB a month; the
API uses a tiny fraction). Lightsail advertises **three months free on the $5, $7 and $12 Linux bundles** for
eligible accounts that start using Lightsail (terms on the AWS pricing page; one bundle per account; check at sign-up).

## 3. Does Lightsail suit us?

**Yes, best for now.**
- Monthly with no commitment (hourly, capped), delete any time: exactly "one month at a time".
- AWS reliability and a Mumbai region, free static IP while attached, snapshots, GST invoice from AWS India.
- Possibly the first three months free.
- Burstable CPU fits an API that is idle most of the time; 20 % sustained on the $12 plan, 10 % on the $7 plan,
  per vCPU, with credits for bursts.
- Against it: costs more than the smallest Indian hosts and Bluehost; AWS account setup needs a card and KYC.

**Choice:** **Lightsail Mumbai, $12 / 2 GB** if the three free months apply (free until February, then ≈ ₹1,250 a
month). If the budget must stay near the old ₹463: **Lightsail $7 / 1 GB** (≈ ₹730 with GST) runs the API with the
setup script's swap; move up later with a snapshot or by running the five-step move again. The cheapest small
Indian hosts (₹360–390) are fine to try for a month now that switching takes 15 minutes, but are a reliability risk
for launch.

## 4. Sources

AWS Lightsail pricing (aws.amazon.com/lightsail/pricing), Lightsail baseline CPU performance
(docs.aws.amazon.com/lightsail/latest/userguide/baseline-cpu-performance.html), Hostinger India VPS page
(hostinger.com/in/vps-hosting), and third-party comparisons: cybernews.com, techplained.com, vyomcloud.com,
heavencloud.in, valebyte.com, aiccloud.in, cloudzero.com, cloudburn.io. Contabo's own site blocked automated reading.
