// First-party event capture. The point of this file is one question: which of
// the six systems does a visitor look at before they book, and which ones do
// they scroll straight past. Nothing else here is worth the bytes.
//
// WHAT IS DELIBERATELY NOT COLLECTED, and why this needs no cookie banner:
//   - no cookies, ever. The session id lives in sessionStorage and dies with
//     the tab, so there is no way to recognise a returning visitor.
//   - nothing the visitor types. The triage demo takes free text and the
//     contact form takes a name and an email; neither is ever an event
//     property. Only the fact that a thing ran is recorded.
//   - no IP address. The server route drops it (see api/event.js).
//   - referrer HOST only, never the full URL, which keeps other people's query
//     strings out of the table.
// That leaves genuinely anonymous, aggregate counts. Keep it that way: the
// moment an event carries something that identifies a person, this stops being
// analytics and starts being a GDPR obligation.

const ENDPOINT = "/api/event";

// An allowlist on the client as well as the server, so a typo in a call site
// shows up here as a dropped event rather than as a mystery row in the table.
// Keep in sync with EVENTS in api/event.js.
export const EVENTS = new Set([
  "page_view",
  "section_view",
  "demo_run",
  "system_opened",
  "cta_clicked",
  "language_switched",
  "booking_widget_focused",
  "contact_submitted",
  "contact_failed",
  "page_leave",
]);

// Opt out honoured on the two signals that are actually still transmitted by
// real browsers. DNT is mostly historical; GPC is the one with legal weight in
// some jurisdictions. Both cost one line to respect.
function optedOut() {
  try {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
  } catch {
    return false;
  }
}

// Per-tab, not per-person. This exists only to stitch "ran the triage demo"
// to "submitted the form" inside a single visit; without it the table is a
// pile of disconnected counts and cannot answer the question above.
function sessionId() {
  try {
    const key = "godolkin-sid";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    // Private mode, storage disabled, or a sandboxed iframe. Events still send,
    // they just cannot be stitched together.
    return null;
  }
}

function referrerHost() {
  try {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).host;
    // Our own navigations are not referrers worth counting.
    return host === location.host ? null : host;
  } catch {
    return null;
  }
}

// Coarse buckets, not pixel widths: "did the phone layout get used" is a real
// question, "was the window 1287px" is not, and the precise number is one more
// bit of fingerprint for no gain.
function viewport() {
  if (typeof window === "undefined") return null;
  const w = window.innerWidth;
  if (w < 640) return "phone";
  if (w < 1024) return "tablet";
  return "desktop";
}

// Fired-once guard for view events. Scrolling up and down a long page crosses
// the same section boundary repeatedly, and each crossing is not a new fact.
const fired = new Set();

export function trackOnce(name, props) {
  const key = `${name}:${JSON.stringify(props ?? {})}`;
  if (fired.has(key)) return;
  fired.add(key);
  track(name, props);
}

export function track(name, props) {
  if (typeof window === "undefined" || optedOut()) return;
  if (!EVENTS.has(name)) {
    // Loud in development, silent in production: a bad event name is a bug in
    // a call site, and it should be found while the call site is being written.
    if (import.meta.env?.DEV) console.warn(`[analytics] unknown event: ${name}`);
    return;
  }

  const payload = JSON.stringify({
    name,
    props: props ?? {},
    session: sessionId(),
    path: location.pathname,
    referrer: referrerHost(),
    lang: document.documentElement.lang || null,
    viewport: viewport(),
  });

  try {
    // sendBeacon first: it is the only send that reliably survives the page
    // being closed, which is exactly when page_leave fires. It also cannot be
    // blocked by the unload handler being cut short.
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([payload], { type: "application/json" }))) return;
    // keepalive gives fetch the same survives-unload property, minus the
    // guarantee. Anything past this point is best effort.
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // An analytics failure must never surface to a visitor or break a demo.
    // There is no retry: a lost event is cheaper than a retry storm.
  }
}

// Module-level rather than per-install, so the exit summary is sent once per
// page even when the effect that installed it ran twice. React's StrictMode
// mounts, unmounts and remounts every effect in development, and a guard living
// in the closure would give a doubled listener a second, independent "have I
// sent this yet" answer.
let leaveSent = false;

// Page view plus the exit summary, installed once from App.jsx.
//
// Time on page and depth reached are the two numbers that say whether the long
// scrolling page is doing its job, and neither can be derived from the other
// events. visibilitychange is the reliable exit hook: on phones an unload event
// often never fires at all, because the tab is frozen rather than closed.
export function installPageTracking() {
  if (typeof window === "undefined" || optedOut()) return () => {};

  // trackOnce, for the same StrictMode reason as leaveSent above.
  trackOnce("page_view");

  const started = Date.now();
  let deepest = 0;

  const onScroll = () => {
    const scrollable = document.body.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / document.body.scrollHeight) * 100));
    if (depth > deepest) deepest = depth;
  };

  const onHidden = () => {
    if (document.visibilityState !== "hidden" || leaveSent) return;
    // Once only. A visitor who tabs away and back would otherwise post a
    // "leave" per switch and inflate every count that follows.
    leaveSent = true;
    track("page_leave", { seconds: Math.round((Date.now() - started) / 1000), depth: deepest });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onHidden);
  return () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onHidden);
  };
}
