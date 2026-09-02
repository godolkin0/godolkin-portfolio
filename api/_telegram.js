// Shared Telegram sender. The leading underscore is what keeps this file out of
// the routing table: Vercel treats api/_*.js as a module, not an endpoint.
//
// Environment, set in the Vercel project (never committed):
//   TELEGRAM_BOT_TOKEN   from @BotFather
//   TELEGRAM_CHAT_ID     the chat to deliver to. Message the bot once, then read
//                        it from https://api.telegram.org/bot<TOKEN>/getUpdates
// Both optional. Unset means no alert and no error: the enquiry still lands in
// the inbox, which is the delivery path that must never depend on this one.

// Callers are already inside a request that the visitor is waiting on. A slow
// or hanging Telegram API must not hold a form submission open, so the send
// gets its own short deadline and gives up quietly.
import { env } from "./_env.js";

const TIMEOUT_MS = 4000;

export async function notify(text) {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("[telegram] rejected:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[telegram] send failed:", error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// Telegram parses a small HTML subset, so anything interpolated into a message
// has to be escaped. The contact form is visitor-controlled text arriving from
// the open internet: without this, a name containing a tag breaks the message
// or, worse, gets rendered as markup.
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
