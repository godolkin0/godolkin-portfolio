# The Offer

Lock this. Do not redesign it mid-week. The only thing you're allowed to change
before Day 7 is the *message*, never the *offer* — otherwise the tracker can't
tell you anything.

## The product

**Lead Rescue** — an inbound lead never sits unread again.

A prospect fills the form on the agency's site. Within one second:

1. The lead is deduplicated against everyone who already wrote in.
2. It's scored **hot / warm / cold** on urgency, budget signals, and intent.
3. It's matched against the agency's live listings for genuine fits.
4. It lands on the agent's phone via Telegram/WhatsApp with the score, the
   matched listings, and a one-tap "call now" link.
5. A row is appended to a Google Sheet the agency owner already knows how to read.

You have built this. It is the Lead-to-Listing Matcher in `src/data/projects.js`.
You are not inventing a product this week — you are selling one twice.

## The price ladder

| Tier | Price | Delivery | Purpose |
|---|---|---|---|
| **Lite** | €197 one-off | 48h | Down-sell. Triage + Telegram + Sheet only, no listing match |
| **Pilot** | €397 one-off | 72h | **Your default ask.** Full Lead Rescue on their real site |
| **Care** | €149/mo | ongoing | The seed of everything in `04-scale-to-11k.md` |

$400 ≈ €370. **One Pilot clears the week.** Two Lites also clear it. Nothing
else needs to happen.

Care is offered *after* delivery, never in the first conversation. Selling a
subscription to a stranger is a hard sell; selling it to someone who just
watched a hot lead hit their phone is not.

## The guarantee

> "Live on your site within 72 hours, or you don't pay. If it's live and you
> don't want it, tell me within 7 days and I refund you in full and remove it."

Say this early and plainly. It costs you nothing — your delivery time is ~4
hours (see `03-close-and-deliver.md`) — and it removes the single biggest
objection a small agency has: *"I've been burned by a web guy before."*

## The one-liner

Memorize this. It is what you say when someone asks what you do.

> **IT:** "Faccio in modo che i lead del sito arrivino sul telefono dell'agente
> già qualificati, in un secondo, invece di restare in una casella di posta
> fino a sera."

> **EN:** "I make the leads from your website land on your agent's phone
> already qualified, in one second, instead of sitting in an inbox until
> evening."

No "AI". No "automation". Those words make an agency owner think *expensive*
and *complicated*. Describe the outcome; let them discover it's AI when they
see the score.

## Scope — write this in the message, not just in your head

**Included:** form connection, dedup, scoring, Telegram/WhatsApp delivery,
Google Sheet, listing match (Pilot only), 30 days of fixes if something breaks.

**Not included:** a new website, SEO, ad campaigns, CRM migration, writing
their listings. When asked for these, the answer is: *"Not in the pilot. Let's
get the leads working first, then we talk."* Scope creep is what turns a €397
job into a 20-hour job and kills your hourly rate.

## Objections, answered

**"How much?"** — "€397, one time, and you don't pay until it's live on your
site." Never delay the price. Delaying it signals it's high.

**"We already have a CRM."** — "Good — this feeds it. The CRM tells you what
happened yesterday. This tells your agent to call someone *now*, while they're
still on the site."

**"Send me some information."** — "I'll do better — I'll send you a working
version with your listings in it. If it's useful we talk, if not you keep the
link." Then actually send it. This objection is where most people die and where
you win.

**"Who else have you done this for?"** — Name the private build honestly: "An
agency I built this for privately — I can't share their name, but I can show
you the exact same engine running live." Then send godolkin.dev. Never invent a
client. One real anonymous reference beats five fake logos, and fake logos are
a business-ending mistake in a market this small.

**"I need to think about it."** — "Of course. One thing though: is it the €397,
or is it that you're not sure it'll work?" Then handle the real objection. If
it's price, offer Lite. If it's doubt, offer to build it first and take payment
on delivery — you're already guaranteeing that anyway.

**"Can you do it cheaper?"** — "I can do less for less." Offer Lite at €197.
Never discount the Pilot; change the scope instead. A discounted Pilot teaches
the client that your prices are fiction.

## Payment (Italy — verify with a commercialista)

- First sales can typically be handled as *prestazione occasionale* with a
  *ricevuta con ritenuta d'acconto*. There is an annual ceiling (commonly cited
  around €5,000 gross) above which regular activity requires a *partita IVA*.
- Free rails to get paid: bank transfer (bonifico) with the receipt attached,
  PayPal, or Revolut. Stripe costs nothing to set up and takes cards.
- Get paid **on delivery, not after 30 days**. "Bonifico when it goes live" is
  a normal, professional ask at this size.

This is not tax advice. Confirm the specifics before your third sale, not your
tenth.
