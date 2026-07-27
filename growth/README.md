# Godolkin — Revenue System

An execution system, not a course. Everything here is free-tool-only, runnable
tonight, and built on assets that already exist in this repo.

## The thesis in one line

You already built and shipped AI lead automation for real estate agencies —
so sell that exact thing to more agencies, with the demo built **before** the
pitch, and let a tracker tell you which pitch converts instead of guessing.

## Why this play and not another

| Asset you already have | What it buys you |
|---|---|
| `Valora` live at valora-landing-10417c.netlify.app | A working demo you can clone per prospect in ~40 min |
| Lead-to-Listing Matcher (private client build) | Proof you've delivered this to a paying business before |
| Bilingual EN/IT + CET timezone | The Italian SMB market: high demand, low AI-automation saturation, and you speak the language natively |
| godolkin.dev with 3 interactive demos | Credibility link that costs you nothing to send |
| `polymarket-weather-bot` public repo | "See the real code" proof for technical buyers |

Cold outreach fails because it's generic. Yours won't be, because you can send
a **working thing with their name on it** in the first message. That is the
entire edge. Protect it.

## Honest expectations

- **$400 in 7 days:** realistic. One `Pilot` sale at €397 clears it. Requires
  ~100 personalized touches across days 2–5. It is a probability play, not a
  guarantee — the contingency if you're at zero by Day 5 is in
  `01-seven-day-plan.md`.
- **Faceless content in 7 days:** will produce €0. It's a month 2+ asset.
  Started on Day 7 anyway, because it compounds and the outbound doesn't.
- **$11K/month:** 6–12 months, capacity-bound, composition in
  `04-scale-to-11k.md`. Anyone selling you a 90-day version of this is selling
  you the course, not the business.

## File map

| File | What it's for |
|---|---|
| `00-offer.md` | The exact offer, price, scope, guarantee, objection answers |
| `01-seven-day-plan.md` | Hour-by-hour for 7 evenings × 3h |
| `02-outreach.md` | Where to source prospects free, how to research, channel rules |
| `03-close-and-deliver.md` | Call script, payment, 4-hour delivery SOP |
| `04-scale-to-11k.md` | The ladder from one pilot to recurring revenue |
| `05-content-engine.md` | The faceless machine, 30 hooks, production SOP |
| `data/templates/` | Message templates, IT + EN, three variants per channel |
| `tools/outreach.mjs` | Merges prospects × templates → paste-ready messages |
| `tools/pipeline.mjs` | Logs every touch, tells you what converts |

## Tools

Zero dependencies, Node only, same idiom as `scripts/verify-logic.mjs`.

```bash
npm run growth:messages -- --channel=email --limit=25   # generate tonight's sends
npm run growth:log -- --id=agenzia-rossi --event=sent --channel=email --variant=A
npm run growth:report                                   # what's converting
npm run growth:next                                     # who needs a follow-up today
```

Run `npm run growth:messages -- --help` for every flag.

## Data privacy

`growth/data/prospects.csv` and `growth/data/log.csv` are gitignored. They hold
third-party business contact details and your pitch history — this repo is your
public portfolio, so that data must never land in a commit. Only
`prospects.sample.csv` (fictional rows) is tracked.
