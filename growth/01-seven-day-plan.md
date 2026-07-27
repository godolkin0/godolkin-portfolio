# The 7 Evenings

3 hours each. Phone work is marked 📱 — do it on breaks during the day so the
laptop hours stay for the work only a laptop can do.

Rule for the whole week: **no new tools, no new offers, no redesigns.** Every
minute spent optimizing is a minute not spent contacting a business.

---

## Day 1 — Load the gun

**Goal: 60 researched prospects and a payment rail. Zero messages sent.**

| Time | Task |
|---|---|
| 0:00–0:20 | Set the rails: free cal.com 15-min booking link, Stripe or PayPal account, a Gmail signature with godolkin.dev in it. Put the cal.com URL into `src/config.js` → `bookingUrl`, and your Telegram handle into `telegram`. Both are `TODO` right now and the site hides those buttons until they're filled. |
| 0:20–0:35 | Read `00-offer.md` out loud once. Say the one-liner ten times until it's automatic. You will say it on a phone call this week under pressure. |
| 0:35–2:40 | Build the list. 60 rows in `growth/data/prospects.csv`. Sourcing and the research method are in `02-outreach.md`. This is the longest block of the week and the one that decides the outcome. Do not shortcut it. |
| 2:40–3:00 | `npm run growth:messages -- --channel=email --limit=5` and read what comes out. Fix any template line that sounds like a template. |

**Done when:** 60 rows, each with a real `signal` column. If you have 40 good
rows and 20 lazy ones, delete the 20.

---

## Day 2 — First contact

**Goal: 25 sends.**

| Time | Task |
|---|---|
| 0:00–0:10 | `npm run growth:messages -- --channel=email --limit=25 --out` |
| 0:10–1:30 | Send them. One at a time, from your own Gmail, no BCC, no mail-merge tool. Log each one as you go — the generated file gives you the exact `growth:log` command per message to paste. |
| 1:30–2:30 | Build one **speculative demo** for the single best prospect on the list. Clone Valora, put their logo and city in it, send it unprompted. This is your highest-conversion single action of the week. |
| 2:30–3:00 | 📱 15 IG DMs to agencies from the same list, using the `ig-dm` template. Different channel, same prospects, different variant — the tracker will separate them. |

**Done when:** 25 emails + 15 DMs logged. Expect 0 replies tonight. That's normal.

---

## Day 3 — Volume and the first calls

**Goal: 25 more sends, first booked call.**

| Time | Task |
|---|---|
| 0:00–0:15 | `npm run growth:report`. Too early to mean anything — look anyway, so you know what the numbers look like when they're empty. |
| 0:15–0:30 | `npm run growth:next` → send follow-up #1 to everyone from Day 2 with no reply. |
| 0:30–1:45 | 25 new sends, next 25 prospects. |
| 1:45–2:30 | Reply to everyone who replied, within minutes, from your phone if needed. Speed of reply is the highest-leverage variable in the whole system. Push every positive reply toward a 15-minute call, not an email thread. |
| 2:30–3:00 | Write the delivery checklist you'll follow when someone says yes (`03-close-and-deliver.md` has it — read it now, not when you're panicking). |

---

## Day 4 — Read the data, kill the loser

**Goal: know which variant wins. Take calls.**

| Time | Task |
|---|---|
| 0:00–0:20 | `npm run growth:report`. If a variant has ≥15 sends and zero replies, kill it: stop sending it. If the tool says "not enough data", believe it and keep all variants running. |
| 0:20–2:00 | Calls, and the next 25 sends between them. Use the script in `03-close-and-deliver.md`. Do not improvise. |
| 2:00–2:45 | Follow-up #1 for Day 3's batch, follow-up #2 for Day 2's. |
| 2:45–3:00 | 📱 Second speculative demo for the best new prospect. |

---

## Day 5 — Close

**Goal: first paid Pilot.**

| Time | Task |
|---|---|
| 0:00–0:15 | `npm run growth:report`. Now you should have a directional winner. Send only that variant from here on. |
| 0:15–2:15 | Calls and closes. When someone says yes: send the payment link *on the call*, before hanging up. "I'll send it over later" loses about a third of closed deals. |
| 2:15–3:00 | Remaining sends to hit 100 touches total. |

### ⚠️ Contingency — read this if you have zero calls booked by end of Day 5

Do not conclude the offer is broken. Three failure modes, in order of likelihood:

1. **The list was weak** (most common). You emailed `info@` addresses that
   nobody reads. Fix: switch to IG DM and phone, and target agencies with an
   active social presence — a business that posts is a business that answers.
2. **No signal in the message.** If your `signal` column says "nice website",
   you sent a generic email with extra steps. Fix: 5 minutes of real research
   per prospect, referencing something only someone who looked would know.
3. **Price friction.** Lead with Lite at €197 for the remaining sends.

And widen the niche by one step, not ten: from real estate agencies to
*property managers, mortgage brokers, and B&B/short-let managers* — same
problem, same engine, same city.

---

## Day 6 — Deliver, get paid, extract the multiplier

| Time | Task |
|---|---|
| 0:00–2:00 | Deliver. The SOP is ~4 hours end to end; you've already done part of it if you built a speculative demo for this client. |
| 2:00–2:15 | Get the money in. Payment on go-live, as promised. |
| 2:15–2:45 | The two asks, in this order, while they're delighted: **(1)** "Would you record 30 seconds on your phone saying what it does?" **(2)** "Who else do you know running an agency who'd want this?" A referral at this moment converts many times better than any cold message you sent all week. |
| 2:45–3:00 | Offer Care at €149/mo as the *founding rate*. This is the first euro of the $11K. |

---

## Day 7 — Convert the week into a machine

| Time | Task |
|---|---|
| 0:00–0:30 | `npm run growth:report` for the full week. Write down: which channel, which variant, which niche, which signal type produced the reply. That's your locked-in configuration. |
| 0:30–1:00 | Delete every template that lost. Duplicate the winner into two new variants that are small mutations of it — next week you test *within* the winner, not against it. |
| 1:00–2:30 | Record the first 5 faceless videos. `05-content-engine.md` has the hooks and the production SOP. Screen recording of the real thing firing, no face, no voice needed. |
| 2:30–3:00 | Set week 2's target: 150 touches, 3 Pilots, 2 Care subscriptions. Book the evenings in your calendar as if they were client calls. |

---

## The numbers this plan is built on

100 personalized touches → 8–12 replies → 3–5 calls → 1–2 Pilots. These are
plausible rates for hyper-personalized B2B outreach carrying a working demo,
not guarantees. If your reply rate lands under 4%, the problem is the list or
the signal, not the offer — go back to `02-outreach.md` before changing
anything else.
