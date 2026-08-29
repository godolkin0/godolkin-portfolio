---
name: new-client-build
description: Scaffold and structure a new client automation for the Godolkin practice using the seven-step pipeline (signal in, normalise, classify, decide, act, notify, log). Use this whenever work starts on a new client system, an automation, a bot, a scraper, an intake or triage flow, a reporting job, or a scheduled check, and also when quoting or scoping one, when adding a system to the portfolio graph, or when someone describes a manual process they want taken off their hands, even if they never say the words "pipeline" or "automation".
---

# New client build

Every system this practice sells has the same seven steps. The client changes,
the sector changes, the tools change; the shape does not. That is the actual
product, and it is what makes the fourth build take two days instead of two
weeks.

This skill is how a new build gets that shape from the first commit, rather than
having it retrofitted after it is already three bespoke scripts in a trench coat.

## The seven steps

Every build is these, in order. A step can be trivial, but skipping one is a
decision to be made out loud and written down, never a thing that just happens.

| Step | What it does | Skipped only when |
|------|--------------|-------------------|
| **signal in** | Something happens: a form, an email, a file, a schedule, a webhook | never |
| **normalise** | Duplicates collapse, formats align, missing fields get filled | input is already one canonical shape |
| **classify** | The record gets labelled: what it is, how urgent, whose desk | there is only one kind of record |
| **decide** | A rule picks what happens next, including doing nothing | the action is unconditional |
| **act** | The work: draft the reply, price the thing, build the report | never |
| **notify** | A person is told, where that person already is | nobody needs to know in real time |
| **log** | Every decision written down, skips included | never |

**log is not optional and not an afterthought.** It is the step that lets you
answer "is this still right?" six months later, and it is the step that makes a
retainer defensible: a client who can see what the system did this week does not
cancel it. Log the skips especially. A pipeline that records only its actions
tells you what it did and hides what it decided not to do, and the second one is
where the bugs live.

## Start with the config, not the code

Before writing logic, write the config file the client's whole build reads from.
If a second client could not be onboarded by copying that file and changing
values, the shape is wrong and it will cost real days later.

Follow the pattern in `src/config.js`: a single exported object, comments
explaining what each value is for, and `null` meaning "this feature is simply
absent" rather than "this is broken". Anything null must degrade to nothing
rendered and nothing thrown.

```js
export const CLIENT = {
  name: "...",
  // Where signals arrive from. Each needs its own intake, so adding one here
  // is a real change, not a config tweak.
  sources: { form: "...", inbox: null, schedule: null },
  // Who hears about it, and where they already are. Not where it is easy to
  // send to: a notification in a place nobody looks is the same as no system.
  notify: { telegram: null, email: "..." },
  // Thresholds live in config because they are the thing the client will want
  // changed, and they should never require a deploy to change.
  thresholds: { urgent: 0.8 },
};
```

## Secrets and failure

Two rules, both learned the expensive way and both visible in `api/`:

**Keys live server-side.** Anything with an API key runs in a serverless
function, never in the browser. `api/contact.js` exists as a whole endpoint for
exactly this reason.

**Every external call degrades.** A missing key logs loudly and returns a
truthful failure; it never throws into the client's face and never silently
pretends to have worked. A dead database must not take a working page down with
it. Look at how `api/event.js` handles unset Supabase variables: it accepts,
logs, drops, and the site carries on.

Fail closed on anything where the failure would be a security hole
(`api/cal-webhook.js` refuses every delivery when its secret is unset), and fail
open on anything where the failure would just be a missing nicety.

## Rules before models

Reach for a rules engine first. `src/lib/triage.js` classifies leads with
keyword rules in both languages and it beats a metered LLM call on latency,
cost, and being able to explain itself to a client who asks why a lead was
marked urgent.

Use a model where the input is genuinely open-ended: summarising, drafting prose,
extracting from messy documents. Do not use one to check whether a number is
above a threshold. When a system is sold on being deterministic, the portfolio
graph asserts it in `scripts/verify-logic.mjs`, and that assertion is the promise
being kept.

## Prove it before the client sees it

This repo runs `npm run verify` on every deploy, ahead of the build, and it is
not a formality: it asserts that each demo's logic produces the outcome the copy
promises. Carry that habit into client work. Write the checks that would catch
the system quietly lying, and wire them into the build so a wrong answer cannot
ship.

The checks worth writing are the ones about meaning, not syntax: this input
produces this decision; this threshold still holds; this claim on the page still
matches what the code does.

## Making it visible

Build the client's view of the system as part of the system, not as a later
project. It is what turns a one-off invoice into a monthly one, and it is nearly
free once `log` is being done properly: the log is the data, and the view is a
few queries over it.

Lead with time saved and decisions made, not with request counts. "37 enquiries
triaged, 6 escalated to you" is the sentence a client renews on. "12,400 API
calls" is not.

## Adding a system to the portfolio

When a build is real and shippable, it earns a node in the graph on
godolkin.dev. That means, in this repo:

1. An entry in `SYSTEMS` in `src/data/graph.js`, with a badge that is honest:
   `LIVE` runs and is clickable, `REPLAY` is real logic over historical data,
   `PRIVATE BUILD` is real but only described.
2. Its capabilities in `SYSTEM_CAPABILITIES`, naming real capability nodes. The
   graph is a set of claims about what each system is built from; a wrong edge
   is a system pretending to be something it is not.
3. A card in `src/copy.js` in **both** English and Italian. Parity is asserted,
   so a missing Italian key fails the build rather than rendering `undefined` at
   a visitor.
4. No em-dashes in anything a visitor reads, in either language. This is a
   standing house rule and `scripts/verify-logic.mjs` enforces it.
5. If the demo runs in the page, route it through `usePipeline` and give it a
   `name` matching its system id, so it is measured from day one.

Then run `npm run verify`. It will tell you which of the above was missed.

## Scoping conversations

When scoping, walk the client through the seven steps in their own vocabulary
and write down what fills each one. The steps they cannot answer are the real
scope risk, and they are almost always **normalise** (how messy is the input,
really) and **decide** (what should happen in the cases nobody has thought
about yet).

Quote the shape, not the hours. The pitch is that the shape is already built.
