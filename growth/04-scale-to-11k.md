# From One Pilot to $11K/Month

$11,000/month ≈ **€10,200/month**. Here is what that is actually made of, how
long it takes, and the equation that decides whether it happens.

## The composition at target

| Line | Volume | Unit | Monthly |
|---|---|---|---|
| Care subscriptions | 28 clients | €249/mo | €6,972 |
| New Pilots | 6 / month | €397 | €2,382 |
| White-label reseller | 1 network | €1,200/mo | €1,200 |
| | | **Total** | **€10,554 ≈ $11,400** |

Care is €149/mo only for your first five *founding* clients. Everyone after
pays €249. Founding rates are a real closing tool and a permanent tax on your
revenue if you never stop offering them.

## The equation that governs the whole business

Everything above reduces to three numbers:

```
steady-state Care clients  =  (pilots per month × pilot→Care conversion) ÷ monthly churn
```

At 6 pilots/month, 60% conversion, 5% churn: `(6 × 0.6) / 0.05 = 72 clients`.

Growth toward that ceiling: `N(t) = 72 × (1 − e^(−0.05t))`, which crosses 28
clients at **month ~10**. That is where "6–12 months" comes from — not a
feeling.

### What each lever is worth

| Change | Effect on time to 28 clients |
|---|---|
| Pilots 6 → 9 per month | ~10 months → ~6 months |
| Conversion 60% → 40% | ~10 months → ~17 months |
| Churn 5% → 10% | ceiling drops to 36 clients, target barely reachable |
| Care price €249 → €349 | 28 clients → 20 clients needed |

**Churn is the one that kills you.** Ten percent monthly churn halves your
ceiling and no amount of outreach fixes it. Which is why the boring parts of
`03-close-and-deliver.md` — the 24-hour follow-through, the monthly report —
are not niceties. They're the business.

## The real constraint is not demand

The ceiling above says 72 clients are available. You cannot serve 72.

| Load at 28 Care clients | Hours/month |
|---|---|
| Care maintenance (45 min/client) | 21 |
| Pilot delivery (6 × 4h) | 24 |
| Sales and calls | 20 |
| Content | 10 |
| **Total** | **75 h/mo ≈ 2.5 h/day** |

That fits your 3 hours — with no slack, no holidays, and no bad weeks. So the
business hits a **labor wall around 30 clients**, well before it runs out of
market. Everything in the ladder below exists to move that wall.

## The ladder

**Months 1–2 — Prove it repeats.** 4–6 Pilots. Same niche, same city cluster.
Do not diversify. The goal is a delivery you can do half-asleep, and one
client who'll take a reference call.

**Months 2–4 — Templatize.** Turn delivery from 4 hours into 90 minutes: one
config file per client, shared triage rules, a scripted deploy. This is the
highest-ROI engineering you will do all year, and you're already halfway there
— `src/config.js` is exactly the right pattern for it, applied to clients
instead of sites.

**Months 3–6 — Productize the front end.** A self-serve page where an agency
enters their site URL and gets a live demo with their own listings in it,
automatically. Your outreach stops needing you in it. This is Valora, pointed
at strangers.

**Months 4–8 — Sell the second product to the same list.** Your existing
clients are the cheapest revenue you will ever find. Obvious next products
given what you've built: the OMI-backed instant valuation widget (Valora as a
standalone €99/mo add-on), and the monthly performance report — `src/lib/report.js`
already computes it.

**Months 6–12 — The reseller.** One deal with a franchise network, a portal, or
a *mediatore creditizio* group who resells to their own members. One signature
replaces 5 clients of sales effort and pays like 5 clients. Price it as a
platform fee (€1,200/mo for up to 15 sub-accounts), never per seat.

**Month 9+ — Buy back hours.** A contractor doing Step 2 and Step 4 of the
delivery SOP at ~€25/h costs you ~€300/month and returns ~12 hours. Do this the
month you first miss a delivery date, not the month you feel ready.

## What "faceless" actually means here

Your last commit removed your real name from the site and kept the Godolkin
brand. That was the right instinct — hold it.

Faceless works when the *product* is the proof: screen recordings of a lead
being scored, a phone buzzing, a Sheet filling in. It fails when it means an
anonymous account posting generic advice, because you have no reason to be
believed. You are not selling your personality, you are selling a thing that
visibly works. Show the thing.

The one place to stay non-anonymous is the sale itself. Agency owners buy from
a person on a call. Faceless brand, human close.

## Monthly review — 30 minutes, first of the month

1. `npm run growth:report` — cost per client acquired, by channel.
2. Churn: who left, and the real reason. Ask them. It's never the price.
3. Delivery hours per Pilot. If it's not falling month over month, you skipped
   the templatizing step and your ceiling is dropping.
4. One number to improve next month. One. Pick the lever from the table above
   with the worst current value.
