// Every environment variable in this project is read through here.
//
// The reason is a real afternoon lost. A bot token pasted into the Vercel
// dashboard arrived with invisible whitespace on it, and Telegram answered
// "Not Found" for a token that worked perfectly when pasted into a browser.
// Nothing in the failure pointed at whitespace: the value looks correct on
// screen, it looks correct in the dashboard, and the error blames the token.
//
// These values are all typed or pasted by a human into a web form. Trailing
// newlines come free with a double-click selection, a copy out of a terminal,
// or a paste that caught the line ending. Trimming costs nothing and removes
// the failure mode permanently.
//
// Returns "" rather than undefined for a missing variable, so every caller can
// treat absent and empty as the same thing, which they always are here.
export function env(name) {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}
