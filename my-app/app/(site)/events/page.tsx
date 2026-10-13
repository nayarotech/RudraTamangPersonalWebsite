import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { EventRow } from "@/components/site/Cards";
import { Markdown } from "@/components/site/Markdown";
import { Cover } from "@/components/site/Media";
import { Empty, PageHero } from "@/components/site/Section";
import { api, list } from "@/lib/api";
import { dateParts, formatDate, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import type { Item } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang).events.title };
}

export default async function EventsPage() {
  const [lang, upcoming, all] = await Promise.all([getLang(), api<{ items: Item[] }>("/events/upcoming?limit=30"), list("events", { limit: 60 })]);
  const d = t(lang);
  const upcomingIds = new Set((upcoming?.items ?? []).map((e) => e.id));
  const past = all.items.filter((e) => !upcomingIds.has(e.id));

  return (
    <>
      <PageHero kicker={d.events.kicker} title={d.events.title} />
      <section className="wrap py-14 md:py-20">
        <h2 className="kicker">{d.events.upcoming}</h2>
        {upcoming?.items.length ? (
          <div className="mt-8 space-y-5">
            {upcoming.items.map((e) => (
              <article key={e.id} className="grid border border-line md:grid-cols-12">
                <div className="flex flex-col justify-center bg-navy p-8 text-white md:col-span-3">
                  <CalendarDays className="size-5 text-[#9db8ff]" />
                  <p className="mt-4 font-serif text-2xl leading-tight">{formatDate(e.starts_at, lang)}</p>
                  <p className="mt-1 text-white/70">{dateParts(e.starts_at, lang).time}</p>
                </div>
                <div className="p-8 md:col-span-6">
                  <h3 className="font-serif text-3xl leading-tight">{pick(e, "title", lang)}</h3>
                  {pick(e, "location", lang) && (
                    <p className="mt-3 inline-flex items-center gap-2 text-muted">
                      <MapPin className="size-4" /> {pick(e, "location", lang)}
                    </p>
                  )}
                  <Markdown className="mt-5 text-base">{pick(e, "description", lang)}</Markdown>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {typeof e.register_url === "string" && e.register_url && (
                      <a href={e.register_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary h-11">
                        {d.events.register} <ArrowUpRight className="size-4" />
                      </a>
                    )}
                    {typeof e.map_url === "string" && e.map_url && (
                      <a href={e.map_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-11">
                        <MapPin className="size-4" /> {d.events.map}
                      </a>
                    )}
                  </div>
                </div>
                {typeof e.image === "string" && e.image ? <Cover src={e.image} alt={pick(e, "title", lang)} className="min-h-56 md:col-span-3" /> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <Empty>{d.events.none}</Empty>
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-20">
            <h2 className="kicker">{d.events.past}</h2>
            <ul className="mt-4 grid md:grid-cols-2 md:gap-x-12">
              {past.map((e) => (
                <EventRow key={e.id} item={e} lang={lang} />
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
