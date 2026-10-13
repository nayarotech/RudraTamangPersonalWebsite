import type { Metadata } from "next";
import { AchievementCard } from "@/components/site/Cards";
import { FilterChips } from "@/components/site/Filters";
import { Empty, PageHero } from "@/components/site/Section";
import { list } from "@/lib/api";
import { label, num, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang).work.title };
}

export default async function WorkPage({ searchParams }: PageProps<"/work">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const [lang, all] = await Promise.all([getLang(), list("achievements", { limit: 500 })]);
  const d = t(lang);
  const items = category ? all.items.filter((a) => a.category === category) : all.items;

  const counts = new Map<string, number>();
  all.items.forEach((a) => typeof a.category === "string" && counts.set(a.category, (counts.get(a.category) ?? 0) + 1));
  const completed = all.items.filter((a) => a.status === "Completed").length;
  const ongoing = all.items.filter((a) => a.status === "Ongoing").length;

  return (
    <>
      <PageHero kicker={d.work.kicker} title={d.work.title} lead={d.work.lead}>
        <dl className="flex flex-wrap gap-x-12 gap-y-4">
          {[
            [num(all.total, lang), d.common.all],
            [num(completed, lang), d.work.completed],
            [num(ongoing, lang), d.work.ongoing],
          ].map(([v, k]) => (
            <div key={k}>
              <dd className="font-serif text-4xl text-ink">{v}</dd>
              <dt className="mt-1 text-sm text-muted">{k}</dt>
            </div>
          ))}
        </dl>
      </PageHero>
      <section className="wrap py-14 md:py-20">
        <FilterChips
          base="/work"
          param="category"
          current={category}
          allLabel={d.common.all}
          options={[...counts.entries()].map(([value, count]) => ({ value, label: label(value, lang), count }))}
        />
        {items.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <AchievementCard key={a.id} item={a} lang={lang} />
            ))}
          </div>
        ) : (
          <Empty>{d.common.noItems}</Empty>
        )}
      </section>
    </>
  );
}
