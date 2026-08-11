import { Reveal } from "./Reveal.jsx";
import { useI18n } from "../i18n.jsx";

// The one tonal break in the page. It marks the shift from "what I build" to
// "who builds it", and it stops a long light page from flattening out.
// Inverted section, so the tokens flip: near-black ground, white type.
export function About() {
  const { t } = useI18n();
  const s = t.about;

  return (
    <section id="about" className="relative bg-[var(--color-dark)] text-white">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-10 sm:py-32">
        <Reveal>
          <p className="t-label text-white/65">{s.kicker}</p>
          <h2 className="t-display mt-5 max-w-3xl">
            {s.titleA}
            <br />
            <span className="font-light text-white/50">{s.titleB}</span>
          </h2>
          <p className="t-body mt-8 max-w-2xl text-white/75">{s.intro}</p>
        </Reveal>

        <div className="mt-20 grid gap-x-12 gap-y-12 sm:grid-cols-2">
          {s.principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="border-t border-white/15 pt-6">
                <p className="t-mono text-white/60">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-display-sm mt-3">{p.title}</h3>
                <p className="t-body mt-3 text-white/65">{p.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-20 border-t border-white/15 pt-6">
            <p className="t-label text-white/65">{s.stackLabel}</p>
            <p className="t-mono mt-3 text-white/75">{s.stack}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
