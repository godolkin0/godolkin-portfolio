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

  // SETTLED, not a to-do: no LinkedIn link. The site carries the Godolkin brand
  // only, and the one LinkedIn URL available has the real name in its slug, so
  // linking it would put the name back on the page through the address bar.
  // The footer hides the link entirely while this is null.
  linkedin: null,

  // Booking link, confirmed 2026-08-12. The Book a call section embeds this in
  // place of its placeholder. Fifteen minutes, matching what the copy promises.
  bookingUrl: "https://cal.com/godolkin0/15min",

  // Where the contact form posts. A Vercel serverless route, so the mail
  // provider's API key stays server-side and never reaches the browser.
  contactEndpoint: "/api/contact",

  timezone: "CET (Europe)",
};
