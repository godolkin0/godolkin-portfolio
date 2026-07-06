// Central place for the personal/deploy facts the site renders. Anything null
// is simply omitted from the UI, so filling these in later lights features up
// without touching components.

export const SITE = {
  // Live domain. If this ever changes, also update the canonical / og:url /
  // og:image / twitter:image tags in index.html to match.
  url: "https://godolkin.dev",

  repoUrl: "https://github.com/godolkin0/polymarket-weather-bot",

  // Deliberately skipped by choice, no demo video. "Watch it run" stays
  // hidden; the repo link (once public) carries the proof instead.
  videoUrl: null,

  linkedin: "https://www.linkedin.com/in/blenard-kola-godolkin/",

  // TODO(blenard): Telegram username WITHOUT the @ (e.g. "godolkin").
  telegram: null,

  // TODO(blenard): cal.com / Calendly link for a 15-minute intro call.
  bookingUrl: null,

  // TODO(blenard): confirm; defaulted from this machine's clock (UTC+1).
  timezone: "CET (Europe)",
};
