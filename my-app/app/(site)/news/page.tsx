import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/site/Cards";
import { FilterChips } from "@/components/site/Filters";
import { Empty, PageHero } from "@/components/site/Section";
import { list } from "@/lib/api";
import { label, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

const PER_PAGE = 12;
const TYPES = ["News", "Press release", "Article", "Speech", "Interview"];

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang).news.title };
}

export default async function NewsPage({ searchParams }: PageProps<"/news">) {
  const sp = await searchParams;
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const [lang, posts] = await Promise.all([getLang(), list("posts", { type, limit: PER_PAGE, offset: (page - 1) * PER_PAGE })]);
  const d = t(lang);
  const pages = Math.ceil(posts.total / PER_PAGE);
  const [first, ...rest] = posts.items;

  return (
    <>
      <PageHero kicker={d.news.kicker} title={d.news.title} lead={d.news.lead} />
      <section className="wrap py-14 md:py-20">
        <FilterChips base="/news" param="type" current={type} allLabel={d.common.all} options={TYPES.map((v) => ({ value: v, label: label(v, lang) }))} />
        {!first && <Empty>{d.common.noItems}</Empty>}
        {first && (
          <div className="mt-12 border-b border-line pb-14">
            <PostCard item={first} lang={lang} large />
          </div>
        )}
        {rest.length > 0 && (
          <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <PostCard key={p.id} item={p} lang={lang} />
            ))}
          </div>
        )}
        {pages > 1 && (
          <nav className="mt-16 flex justify-center gap-2" aria-label="Pages">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/news?${new URLSearchParams({ ...(type ? { type } : {}), page: String(n) })}`}
                className={`flex size-10 items-center justify-center border text-sm font-medium ${n === page ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </section>
    </>
  );
}
