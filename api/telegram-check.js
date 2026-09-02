// Telegram wiring diagnostic. Exists because the failure it diagnoses cannot be
// investigated from a laptop without pasting the bot token into a browser URL,
// where it lands in history, in the address bar, and in any screenshot taken to
// ask someone for help. The token is already here in the environment, so the
// server can ask Telegram the same questions without the token ever moving.
//
//   /api/telegram-check?key=<CAL_WEBHOOK_SECRET>          diagnose only
//   /api/telegram-check?key=<CAL_WEBHOOK_SECRET>&test=1   also send a test message
//
// The key is CAL_WEBHOOK_SECRET rather than a variable of its own. That is a
// deliberate trade: a second secret would mean another value to set and another
// deploy to pick it up, which is exactly the manual round-trip this route
// exists to remove. It is reused as a shared secret, never as a signature.
//
// This is a troubleshooting tool, not a feature. Once Telegram is delivering,
// delete the file: an endpoint that reports on your alerting is one more thing
// to keep honest, and it has no reason to outlive the problem.

import { timingSafeEqual } from "node:crypto";
import { env } from "./_env.js";

const TIMEOUT_MS = 8000;

export default async function handler(req, res) {
  const secret = env("CAL_WEBHOOK_SECRET");
  if (!secret) return res.status(503).json({ error: "not_configured" });

  // Vercel's Node helpers populate req.query, but the route is also reachable
  // in contexts that do not, and a diagnostic that fails to parse its own input
  // is worse than useless. Falling back to the raw URL costs two lines.
  const query = req.query ?? Object.fromEntries(new URL(req.url, "http://x").searchParams);
  const key = typeof query.key === "string" ? query.key : "";
  if (!safeEqual(key, secret)) return res.status(401).json({ error: "bad_key" });

  const token = env("TELEGRAM_BOT_TOKEN");
  const chatId = env("TELEGRAM_CHAT_ID");
  if (!token) {
    return res.status(200).json({
      verdict: "TELEGRAM_BOT_TOKEN is not set in this environment. Nothing else can be checked.",
    });
  }

  const [me, webhook, updates] = await Promise.all([
    call(token, "getMe"),
    call(token, "getWebhookInfo"),
    call(token, "getUpdates"),
  ]);

  // Every distinct chat that has ever spoken to this bot inside Telegram's
  // retention window. This is the list the chat id has to come from, and being
  // able to see it is the entire point of the route.
  const chats = [];
  for (const update of updates?.result ?? []) {
    const chat = update?.message?.chat ?? update?.edited_message?.chat;
    if (!chat || chats.some((c) => c.id === chat.id)) continue;
    chats.push({
      id: chat.id,
      name: [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || null,
      type: chat.type,
    });
  }

  let sent = null;
  if (query.test === "1" && chatId) {
    sent = await call(token, "sendMessage", {
      chat_id: chatId,
      text: "Test from godolkin.dev. If you can read this, alerts are wired up correctly.",
    });
  }

  return res.status(200).json({
    bot: me?.ok ? { username: me.result.username, id: me.result.id } : { error: describe(me) },
    webhook_stealing_updates: Boolean(webhook?.result?.url),
    webhook_url: webhook?.result?.url || null,
    configured_chat_id: chatId || null,
    chats_that_have_messaged_this_bot: chats,
    test_message: sent === null ? "not requested" : sent?.ok ? "delivered" : describe(sent),
    verdict: verdict({ me, webhook, chatId, chats, sent }),
  });
}

// Plain sentences rather than raw API output. Whoever reads this is trying to
// find out what to change, not to learn the Telegram protocol.
function verdict({ me, webhook, chatId, chats, sent }) {
  if (!me?.ok) return "The bot token is not valid. Get the right one from BotFather with /mybots.";
  if (webhook?.result?.url) {
    return `A webhook is registered on this bot (${webhook.result.url}), which swallows every message before getUpdates can see it. That is why the update list keeps coming back empty. Remove it and the chats below will start appearing.`;
  }
  if (sent?.ok) return "Telegram is working. Alerts will reach you.";
  if (!chatId) return "TELEGRAM_CHAT_ID is not set. Pick the id below and add it in Vercel.";
  if (chats.length === 0) {
    return "No webhook is in the way, but the bot has no recent messages either. Telegram only keeps unread updates for about 24 hours. Send this bot a message now, then load this page again.";
  }
  const match = chats.find((c) => String(c.id) === String(chatId));
  if (match) {
    return sent
      ? `The configured chat id is correct, but the send still failed: ${describe(sent)}`
      : "The configured chat id matches a real conversation. Add &test=1 to this URL to prove a message actually arrives.";
  }
  return `TELEGRAM_CHAT_ID is set to ${chatId}, which is not one of the conversations below. Change it in Vercel to ${chats[0].id} and redeploy.`;
}

async function call(token, method, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    return await response.json();
  } catch (error) {
    return { ok: false, description: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

function describe(result) {
  if (!result) return "no response from Telegram";
  return result.description || `error ${result.error_code ?? "unknown"}`;
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
