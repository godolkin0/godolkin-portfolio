import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal.jsx";
import { useI18n } from "../i18n.jsx";
import { SITE } from "../config.js";
import { ArrowMark } from "./ui.jsx";
import { track, trackOnce } from "../lib/analytics.js";

// A real form, not a mailto. The old CTAs pointed at mail.google.com, which
// forces every visitor through a Gmail login screen: Outlook, Libero and PEC
// users simply got nothing. This posts to a server route so the mail provider's
// key stays server-side, and it keeps a plain mailto: as the failure path.
export function BookCall() {
  const { t } = useI18n();
  const s = t.book;
  const f = s.form;
  const [state, setState] = useState("idle");
  const [interests, setInterests] = useState([]);
  const schedulerRef = useRef(null);

  // The scheduler is a cross-origin iframe, so a booking made inside it is
  // invisible from this side: no click, no submit, no callback. What IS
  // observable is the window losing focus to that frame, which means the
  // visitor started interacting with the scheduler rather than merely scrolling
  // past it. Treat it as intent and nothing more. The confirmed booking arrives
  // server-side, signed, at /api/cal-webhook, and that is the real number.
  useEffect(() => {
    if (!SITE.bookingUrl) return;
    const onBlur = () => {
      if (document.activeElement === schedulerRef.current) trackOnce("booking_widget_focused");
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, []);

  const toggleInterest = (id) =>
    setInterests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const onSubmit = async (event) => {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");

    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch(SITE.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // POST body, never a query string: none of this belongs in a URL.
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          message: data.get("message"),
          interests,
        }),
      });
      setState(response.ok ? "sent" : "error");
      // Count and shape only. Not the name, not the address, not a word of the
      // message: those went to the inbox, which is where they belong, and an
      // analytics table is not a second copy of the enquiry.
      track(response.ok ? "contact_submitted" : "contact_failed", { interests: interests.length });
    } catch {
      setState("error");
      track("contact_failed", { interests: interests.length, reason: "network" });
    }
  };

  return (
    <section id="book" className="wash wash-b grain relative">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-10 sm:py-32">
        <Reveal>
          <p className="t-label text-[var(--color-muted)]">{s.kicker}</p>
          <h2 className="t-display mt-5 max-w-3xl">
            {s.titleA}
            <br />
            <span className="t-display-soft">{s.titleB}</span>
          </h2>
          <p className="t-body mt-6 max-w-xl text-[var(--color-muted)]">{s.lede}</p>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            {SITE.bookingUrl ? (
              <iframe
                ref={schedulerRef}
                title={s.kicker}
                src={SITE.bookingUrl}
                // Deferred until it is nearly in view. The scheduler is a whole
                // third-party app at the bottom of a long page, and loading it
                // up front costs every visitor bandwidth and third-party
                // cookies before they have shown any intent to book.
                loading="lazy"
                className="h-[42rem] w-full rounded-2xl border border-[var(--color-line)]/70 bg-white/60"
              />
            ) : (
              // Styled placeholder rather than a dead embed. Dropping a URL into
              // config.js swaps this for the real scheduler with no code change.
              <div className="flex h-full min-h-[16rem] flex-col justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-white/40 p-8">
                <p className="t-body text-[var(--color-muted)]">{s.schedulerPlaceholder}</p>
              </div>
            )}
          </Reveal>

          <Reveal>
            {state === "sent" ? (
              <p className="t-body rounded-2xl border border-[var(--color-line)]/70 bg-white/60 p-8">{f.sent}</p>
            ) : (
              <form onSubmit={onSubmit} className="space-y-6">
                <Field name="name" label={f.name} required requiredLabel={f.required} />
                <Field name="email" label={f.email} type="email" required requiredLabel={f.required} />
                <Field name="company" label={f.company} />

                <fieldset>
                  <legend className="t-label text-[var(--color-muted)]">{f.interest}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.interests.map((option) => {
                      const checked = interests.includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className={`t-label cursor-pointer rounded-full border px-4 py-2.5 transition-colors ${
                            checked
                              ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                              : "border-[var(--color-line)] text-[var(--color-muted)] hover:border-[var(--color-ink)]/40"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() => toggleInterest(option.id)}
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="message" className="t-label text-[var(--color-muted)]">
                    {f.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder={f.messagePlaceholder}
                    className="t-body mt-3 w-full resize-none rounded-xl border border-[var(--color-line)] bg-white/70 p-4 text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-ink)]/40 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="t-label inline-flex items-center gap-2.5 rounded-full bg-[var(--color-dark)] px-7 py-4 text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {state === "sending" ? f.sending : f.submit}
                  <ArrowMark />
                </button>

                {state === "error" && (
                  <p className="t-secondary">
                    {f.error}{" "}
                    <a href={`mailto:${SITE.email}`} className="text-[var(--color-ink)] underline underline-offset-4">
                      {SITE.email}
                    </a>
                  </p>
                )}
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ name, label, type = "text", required = false, requiredLabel }) {
  return (
    <div>
      <label htmlFor={name} className="t-label text-[var(--color-muted)]">
        {label}
        {required && <span className="sr-only"> ({requiredLabel})</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={type === "email" ? "email" : name === "name" ? "name" : "organization"}
        className="t-body mt-3 w-full rounded-xl border border-[var(--color-line)] bg-white/70 px-4 py-3 text-[var(--color-ink)] focus:border-[var(--color-ink)]/40 focus:outline-none"
      />
    </div>
  );
}
