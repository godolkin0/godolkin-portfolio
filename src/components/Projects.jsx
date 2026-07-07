import { PROJECTS } from "../data/projects";
import { useI18n } from "../i18n";
import { Reveal } from "./Reveal";
import { Badge } from "./ui";

export default function Projects() {
  const { lang, t } = useI18n();
  return (
    <section id="projects" className="border-t border-line py-16">
      <Reveal>
        <h2 className="text-2xl font-bold text-fg">{t.projects.heading}</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-dim">{t.projects.subhead}</p>
      </Reveal>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <ProjectCard project={p} lang={lang} t={t} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project, lang, t }) {
  const isLive = !!project.url;
  const Wrapper = isLive ? "a" : "div";
  const wrapperProps = isLive ? { href: project.url, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-panel transition duration-300 ${
        isLive
          ? "hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_40px_-16px_rgba(52,211,153,0.25)]"
          : ""
      }`}
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden border-b border-line bg-gradient-to-br from-panel-2 to-panel">
        {project.thumb ? (
          <img src={project.thumb} alt={project.name} className="h-full w-full object-cover" />
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(52,211,153,0.16),transparent_60%)]" />
            <span className="font-mono text-4xl font-bold text-fg/80">
              {project.initial}
              <span className="text-accent">_</span>
            </span>
          </>
        )}
        <span className="absolute right-3 top-3">
          {isLive ? (
            <Badge tone="accent">
              <span className="size-1.5 animate-pulse rounded-full bg-accent" />
              {t.projects.liveBadge}
            </Badge>
          ) : (
            <Badge tone="dim">{t.projects.privateBadge}</Badge>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2">
          <Badge tone="cyan">{project.sector[lang]}</Badge>
        </div>
        <h3 className="text-lg font-bold text-fg">{project.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-dim">{project.blurb[lang]}</p>
        {isLive && (
          <span className="mt-4 font-mono text-xs text-accent transition group-hover:text-accent-2">
            {t.projects.viewLive} →
          </span>
        )}
      </div>
    </Wrapper>
  );
}
