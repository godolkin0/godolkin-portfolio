// Meta Pixel, consent-gated. This is the ONE part of the site that sets
// cookies (_fbp, and _fbc on ad clicks), and under the Garante's cookie
// guidelines (10 June 2021) a marketing pixel needs opt-in consent BEFORE any
// request reaches Meta. So nothing in this file touches the network until the
// visitor presses "Accept":
//   - the fbevents.js script is injected only by grantConsent() / on load when
//     a stored "granted" exists. No script tag in index.html.
//   - no <noscript> image fallback: it fires on page load, before any consent.
//   - "Reject" is stored too, so the banner does not reappear on every visit.
//   - GPC is honoured as a rejection, same as the first-party analytics.
//
// The first-party analytics in analytics.js are untouched and stay cookie-free.

export const PIXEL_ID = "2637952030000054";
const KEY = "godolkin-consent";
// Bump when the purposes change, so old answers are asked again.
const VERSION = 1;

export const CONSENT_EVENT = "godolkin:consent-open";

function gpc() {
  try {
    return navigator.globalPrivacyControl === true;
  } catch {
    return false;
  }
}

export function readConsent() {
  if (typeof window === "undefined") return "denied";
  if (gpc()) return "denied";
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.v === VERSION && (raw.value === "granted" || raw.value === "denied")) return raw.value;
  } catch {
    /* private mode, corrupted value: treat as unanswered */
  }
  return null;
}

function writeConsent(value) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, value, at: new Date().toISOString() }));
  } catch {
    /* the choice still applies for this page view */
  }
}

let loaded = false;

function loadPixel() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable */
  window.fbq("consent", "grant");
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
}

// Called once from App.jsx. Only a stored, current "granted" loads anything.
export function initPixel() {
  if (readConsent() === "granted") loadPixel();
}

export function grantConsent() {
  writeConsent("granted");
  loadPixel();
}

export function denyConsent() {
  writeConsent("denied");
  if (loaded && window.fbq) {
    // Stops further hits this page view. Cookies already set by Meta are
    // first-party _fbp; clear it so withdrawal is real, not cosmetic.
    window.fbq("consent", "revoke");
    for (const name of ["_fbp", "_fbc"]) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname.replace(/^www\./, "")}`;
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}

// Standard events only (Lead, Schedule, Contact). No-op without consent.
// Never pass form contents here: event name only.
export function pixelTrack(name) {
  if (!loaded || typeof window === "undefined" || !window.fbq) return;
  try {
    window.fbq("track", name);
  } catch {
    /* a pixel failure must never break the page */
  }
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
