import { CountUp } from "@/components/motion/CountUp";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { CHANNELS, type Channel } from "@/data/channels";
import { stagger } from "@/lib/motion";

/** Cards dos canais (fonte: src/data/channels.ts). */
export function ChannelCards({
  channels = CHANNELS,
  showMetrics = true,
}: {
  channels?: Channel[];
  showMetrics?: boolean;
}) {
  return (
        <ul className="grid gap-5 md:grid-cols-2">
          {channels.map((c, i) => {
            return (
              <li key={c.href} data-reveal="" style={stagger(i % 2, 100)}>
                <article className="lift group relative flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-6">
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                      <SocialIcon platform={c.platform} className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="eyebrow">{c.label}</p>
                      <h3 className="mt-2 text-xl font-bold leading-tight tracking-tight [overflow-wrap:anywhere]">
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="after:absolute after:inset-0"
                        >
                          {c.handle}
                          <span className="sr-only"> (abre em nova aba)</span>
                        </a>
                      </h3>
                      <p className="mt-1 text-muted">{c.description}</p>
                    </div>
                  </div>
                  {showMetrics && c.metrics.length > 0 && (
                    <dl className="flex gap-10 border-t border-line pt-5">
                      {c.metrics.map((m) => (
                        <div key={m.label}>
                          <dd className="display text-4xl text-ink">
                            <CountUp value={m.value} />
                          </dd>
                          <dt className="text-sm text-muted">{m.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
  );
}
