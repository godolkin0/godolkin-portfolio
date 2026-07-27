# Close and Deliver

## The 15-minute call

Never longer. A short call signals you do this often. Book them back to back.

**0:00 — Frame (15 seconds)**

> "Grazie del tempo. Ti rubo un quarto d'ora: cinque minuti di domande, poi ti
> faccio vedere una cosa, e se non ti serve ci salutiamo senza problemi."

Giving them permission to say no makes them stop defending.

**0:15 — Diagnose (5 minutes). Ask, then shut up.**

1. "Quando arriva una richiesta dal sito, dove finisce esattamente?"
2. "Chi la vede per primo, e dopo quanto?"
3. "Su dieci richieste, quante sono davvero interessanti?"
4. "Cosa succede a quelle che arrivano il sabato sera?"

Question 4 is the one that sells. Nearly every small agency loses weekend leads
to Monday morning, and they know it. Let the silence after it do the work.

**5:00 — Show, don't tell (4 minutes)**

Share your screen. Fill in the form on their own site — or on the demo you
cloned for them — and let them watch the scored lead hit your phone in one
second. Say almost nothing while it happens. The single second between submit
and notification is your entire pitch.

**9:00 — Price, flat (1 minute)**

> "€397, una tantum. Lo metto live sul tuo sito entro 72 ore. Se non è live,
> non paghi. Se è live e non ti convince, entro 7 giorni te li restituisco e lo
> tolgo."

Then stop talking. Completely. The first person who speaks after a price
concedes something, and it should not be you.

**10:00 — Handle whatever comes.** Answers are in `00-offer.md`. If it's price,
go to Lite at €197. If it's doubt, build first and take payment on delivery.

**13:00 — Close on a next action, not a feeling**

> "Ti mando adesso il link per il pagamento e il modulo con tre domande —
> logo, numero dell'agente, e il link agli annunci. Se me li mandi stasera, sei
> live giovedì."

Send the payment link **while still on the call.** Deals that get sent "later"
lose roughly a third of their close rate for no reason other than delay.

## What you need from them (the 3-question intake)

Send as a short message, not a form:

1. Logo + the exact agency name as it should appear.
2. The mobile number(s) that should receive the alerts, and who's on them.
3. The URL where the listings live, and the page with the contact form.

That's it. Every extra question you ask is another day they take to answer.

## Delivery SOP — ~4 hours

| Step | Time | What |
|---|---|---|
| 1 | 20 min | Clone the Valora/matcher build, swap branding, agency name, city |
| 2 | 40 min | Wire their form. If it's a WordPress/Contact Form 7 site, use the webhook; if the form is a portal iframe you can't touch, install your own form on the same page — it converts better anyway and it's a selling point, not a compromise |
| 3 | 45 min | Point the triage rules at their vocabulary. `src/lib/triage.js` already carries Italian keyword rules — extend `URGENCY_RULES` and `CATEGORY_RULES` with the terms their market actually uses (*mutuo*, *rogito*, *trilocale*, *sopralluogo*) |
| 4 | 30 min | Telegram/WhatsApp delivery to the agent's phone, Google Sheet appended per lead |
| 5 | 40 min | Listing match (Pilot only) — pull their listings, match on budget band, zone, and rooms |
| 6 | 30 min | Test with 6 fake leads: one hot, one cold, one duplicate, one nonsense, one in dialect/typos, one at 3am. Fix what breaks |
| 7 | 25 min | Handover: a 3-minute Loom-style screen recording, and one page explaining what to do when a hot lead arrives |

Step 6 is not optional. The duplicate and the 3am lead are what a client tests
in front of a colleague on day two, and what makes them trust or distrust you
permanently.

## The 24-hour follow-through

Message them the day after go-live with the first real lead the system caught:

> "Primo lead vero preso stanotte alle 23:12 — segnato hot, budget 250k, zona
> centro. È già sul telefono di Marco."

This message is what converts a €397 one-off into €149/mo. Do it before you ask
for anything.

## Then, and only then, the three asks

1. **Testimonial** — "Trenta secondi col telefono, dici solo cosa fa. Non serve
   che venga bene." A shaky phone video from a real agency owner outperforms
   anything you could produce.
2. **Referral** — "Chi conosci che gestisce un'agenzia e ha lo stesso problema?"
   Ask for a specific number of names: "due nomi" gets you two; "qualcuno" gets
   you none.
3. **Care** — "Lo tengo io in piedi, monitorato, con le modifiche incluse e un
   report mensile: €149 al mese, tariffa fondatore, bloccata finché resti."

If they say no to Care, nothing is lost. If they say yes, you just started the
machine in `04-scale-to-11k.md`.
