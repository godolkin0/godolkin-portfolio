# Outreach

## Where the 60 prospects come from (all free)

Work one city at a time. A list spread across Italy is useless; a list of 60
agencies in two provinces lets you say "I work with agencies in your area" and
have it be true by Friday.

| Source | What to pull | Notes |
|---|---|---|
| Google Maps | Search `agenzia immobiliare <città>`, walk the pins | Best source. Gives you site, phone, review count, and photos in one place |
| immobiliare.it / idealista agency directories | Agency name + site | High volume, but many share a portal template — check they have their *own* site |
| Instagram | `#agenziaimmobiliare<città>`, local geotags | An agency that posts weekly answers DMs. Prioritize these |
| LinkedIn | Search "titolare agenzia immobiliare" + city | Slower, but you reach the decision-maker directly |
| Facebook groups | Local buy/sell/rent groups — agents post listings there | Free, and reveals who's actively hustling |

**Adjacent niches with the identical problem**, if real estate runs dry:
property managers, mortgage brokers (*mediatori creditizi*), short-let/B&B
managers, renovation contractors, dental and aesthetic clinics. Same form, same
unread inbox, same engine. Do not switch niches before Day 5.

## The `signal` column is the whole system

For each prospect, spend 3–5 minutes and write one specific, verifiable
observation into the `signal` column. This is the sentence that proves a human
looked.

**Good signals** — earn a reply:

- `il form contatti manda solo una mail generica, nessuna risposta automatica`
- `47 annunci attivi ma il form non chiede budget né tempistiche`
- `pubblicano ogni giorno su IG ma il link in bio porta a una home page, non a un form`
- `tempo di risposta dichiarato "entro 24h" nella sezione contatti`
- `3 agenti nel team, nessun numero diretto sul sito`

**Dead signals** — mark the row and rewrite it:

- `bel sito` / `nice website`
- `sembrano professionali`
- anything you could write without opening their page

If you can't find a signal in 5 minutes, drop the prospect. A list of 40 with
real signals beats 100 without, and the tracker will prove it to you.

## Volume targets

| Day | New sends | Follow-ups | Running total |
|---|---|---|---|
| 2 | 25 email + 15 DM | — | 40 |
| 3 | 25 | 25 | 90 |
| 4 | 25 | 40 | 155 |
| 5 | remainder | remainder | ~200 touches, ~60 prospects |

A prospect gets a maximum of **4 touches across all channels**, then they're
done. Follow-up cadence: +2 days, +4 days, +7 days. After that, stop. Someone
who ignored four messages is not a lead, and pushing further costs you the
reputation you'll need in this same city next month.

## Channel rules

**Email** — to the publicly listed business address only. Plain text, no
images, no tracking pixels, no attachments, one link maximum. Subject lines
stay under 6 words and lowercase — they should look like a message from a
person, because they are one. Include a real one-line opt-out ("dimmi di no e
non ti scrivo più") and honor it instantly.

**Instagram DM** — no links in the first message; IG suppresses reach on them
and it reads as spam. Ask a question, get the reply, send the link second.

**LinkedIn** — connection request with a note under 300 characters. The note is
the pitch; assume they'll never accept and read it anyway.

**Phone** — the highest-converting channel and the one you'll avoid. Call the
agencies that opened your email and didn't reply. "Ti ho scritto ieri, ti rubo
trenta secondi" is a complete opening.

**WhatsApp** — only after they've replied on another channel or the number is
published as a business contact. It's the channel Italian SMBs actually live
in, which is exactly why abusing it burns you fastest.

## Compliance — read once, then it's automatic

You are contacting businesses at published business addresses about a service
relevant to their business. Under GDPR that's normally defensible as legitimate
interest, and Italian B2B practice supports it — **provided**:

- every message identifies who you are, plainly, with a real way to reply;
- every message contains a working opt-out and you honor it on the first ask;
- you never buy, scrape at scale, or mass-blast a purchased list;
- you keep volume low and each message individually written.

The system in this repo is built for that shape deliberately: it *generates*
personalized drafts for you to send by hand, one at a time, from your own
account. It does not send anything for you. Keep it that way. A blast tool gets
your domain blacklisted and your name known in a market of a few thousand
agencies.

## Using the tool

```bash
# copy the sample, then replace the rows with real prospects
cp growth/data/prospects.sample.csv growth/data/prospects.csv

# generate tonight's batch (writes growth/out/<channel>-<date>.md)
npm run growth:messages -- --channel=email --limit=25 --out

# same prospects, different channel — variants are assigned per channel
npm run growth:messages -- --channel=ig --limit=15 --out

# force a variant when you already know the winner
npm run growth:messages -- --channel=email --variant=B --limit=25 --out
```

Each generated message comes with the exact logging command underneath it.
Paste it after you send. If you don't log, the report is fiction and you'll
spend week 2 guessing again.

Variants are assigned deterministically from the prospect id, so re-running the
generator never reshuffles who got what. Attribution stays honest.
