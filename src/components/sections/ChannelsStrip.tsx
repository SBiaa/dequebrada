import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/site";
import { stagger } from "@/lib/motion";
import { Section } from "@/components/ui/Section";
import { SocialIcon, platformOf } from "@/components/ui/SocialIcon";

export function ChannelsStrip() {
  return (
    <Section id="podcast" labelledBy="canais-titulo" tone="panel">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div data-reveal="">
          <p className="eyebrow mb-4">Podcast nº 1 do Alto Tietê</p>
          <h2 id="canais-titulo" className="h2-section">
            Eleito o podcast nº 1 três anos seguidos
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Ouça e assista onde for melhor pra você.
          </p>
          <Link href="/presenca-digital" className="btn btn-ghost mt-7">
            Ver canais e números
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {SOCIAL_LINKS.map((link, i) => {
            const icon = platformOf(link.label);
            return (
              <li key={link.label} data-reveal="" style={stagger(i, 90)}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lift flex min-h-20 items-center gap-4 rounded-xl border border-line bg-bg px-5 font-semibold"
                >
                  {icon && <SocialIcon platform={icon} className="h-7 w-7 shrink-0" />}
                  {link.label}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
