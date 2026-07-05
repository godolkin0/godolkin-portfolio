// Central place for the personal/deploy facts the site renders. Anything null
// is simply omitted from the UI, so filling these in later lights features up
// without touching components.

export const SITE = {
  // TODO(blenard): set to the real domain once you have one (e.g. "https://godolkin.dev").
  // Also update the og:url / og:image / canonical URLs in index.html to match.
  url: null,

  // TODO(blenard): public GitHub repo URL of the real Polymarket bot.
  // Until it's public, the "See the real code" link stays hidden.
  repoUrl: null,

  // TODO(blenard): Loom/YouTube link showing the bot firing a real Telegram
  // alert on schedule. Until set, the "Watch it run" link stays hidden.
  videoUrl: null,

  // TODO(blenard): Telegram username WITHOUT the @ (e.g. "godolkin").
  telegram: null,

  // TODO(blenard): cal.com / Calendly link for a 15-minute intro call.
  bookingUrl: null,

  // TODO(blenard): confirm; defaulted from this machine's clock (UTC+1).
  timezone: "CET (Europe)",
};
