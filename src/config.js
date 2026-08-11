// Central place for the deploy facts the site renders. Anything null is simply
// omitted from the UI, so filling these in later lights features up without
// touching components.

export const SITE = {
  // Live domain. If this ever changes, also update the canonical / og:url /
  // og:image / twitter:image tags in index.html to match.
  url: "https://godolkin.dev",

  repoUrl: "https://github.com/godolkin0/polymarket-weather-bot",

  // Deliberately skipped by choice, no demo video. "Watch it run" stays
  // hidden; the repo link (once public) carries the proof instead.
  videoUrl: null,

  email: "godolkin0@gmail.com",

  // Standing rule, confirmed again 2026-08-11: the site carries the Godolkin
  // brand only. The existing LinkedIn URL contains the real name in its slug,
  // so linking it would put the name back on the page through the address bar.
  // TODO(godolkin): a vanity URL that does not carry the name, or leave null.
  linkedin: null,

  // TODO(godolkin): Telegram username WITHOUT the @ (e.g. "godolkin").
  telegram: null,

  // No scheduler yet, confirmed 2026-08-11. The Book a call section renders its
  // styled placeholder and the contact form carries the real path. Dropping a
  // cal.com or Calendly URL in here is all it takes to swap the placeholder for
  // an embedded scheduler.
  bookingUrl: null,

  // Where the contact form posts. A Vercel serverless route, so the mail
  // provider's API key stays server-side and never reaches the browser.
  contactEndpoint: "/api/contact",

  timezone: "CET (Europe)",
};
