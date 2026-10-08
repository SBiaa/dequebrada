import Link from "next/link";
import { LEGAL_LINKS, NAV_LINKS, SITE, SOCIAL_LINKS } from "@/lib/site";
import { Ph } from "@/components/ui/Marked";
import { Year } from "@/components/ui/Year";
import { Logo } from "./Logo";

const heading = "mb-4 text-sm font-bold uppercase tracking-[0.14em] text-ink";
const link = "text-muted transition-colors hover:text-accent";

export function Footer() {
  const { address } = SITE;
  return (
    <footer className="border-t border-line bg-surface px-5 pb-24 pt-16 xl:pb-14">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-muted">
            Podcast, estúdio, portal de notícias e consultoria digital, direto de Ferraz de
            Vasconcelos.
          </p>
          <p className="mt-4 text-sm text-muted">CNPJ {SITE.cnpj}</p>
        </div>

        <nav aria-label="Páginas do site">
          <h2 className={heading}>Navegue</h2>
          <ul className="space-y-2">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={heading}>Legal</h2>
          <ul className="space-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className={`${heading} mt-8`}>Redes</h2>
          <ul className="space-y-2">
            {SOCIAL_LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {l.label}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={heading}>Contato</h2>
          <address className="space-y-3 not-italic text-muted">
            <p>
              {address.street}, {address.district}
              <br />
              {address.city} {address.region}, {address.postalCode}
            </p>
            <p>
              <a className={link} href={`tel:${SITE.phoneE164}`}>
                {SITE.phoneDisplay}
              </a>
            </p>
            <p>
              <Ph>{SITE.emailPlaceholder}</Ph>
            </p>
          </address>
        </div>
      </div>

      <p className="mx-auto mt-14 max-w-6xl border-t border-line pt-6 text-sm text-muted">
        © <Year /> De Quebrada. Todos os direitos reservados.
      </p>
    </footer>
  );
}
