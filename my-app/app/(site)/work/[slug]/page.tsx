import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { AchievementCard, StatusDot } from "@/components/site/Cards";
import { PhotoGrid } from "@/components/site/Lightbox";
import { Markdown } from "@/components/site/Markdown";
import { Img } from "@/components/site/Media";
import { ShareLinks } from "@/components/site/ShareLinks";
import { list, one } from "@/lib/api";
import { label, num, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import type { GalleryImage } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const item = await one("achievements", slug);
  if (!item) return {};
  return {
    title: pick(item, "title", lang),
    description: pick(item, "summary", lang),
    openGraph: { images: typeof item.image === "string" && item.image ? [item.image] : undefined },
  };
}

export default async function AchievementPage({ params }: PageProps<"/work/[slug]">) {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const item = await one("achievements", slug);
  if (!item) notFound();
  const d = t(lang);
  const title = pick(item, "title", lang);
  const related = (await list("achievements", { category: item.category as string, limit: 4 })).items.filter((a) => a.id !== item.id).slice(0, 3);

  return (
    <article>
      <header className="border-b border-line bg-paper">
        <div className="wrap py-12 md:py-20">
          <Link href="/work" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> {d.work.title}
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="kicker">{label(item.category, lang)}</p>
              <h1 className="display mt-5 text-[clamp(2.4rem,5.5vw,4.25rem)]">{title}</h1>
              {pick(item, "summary", lang) && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted">{pick(item, "summary", lang)}</p>}
            </div>
            {item.metric ? (
              <div className="border-l-2 border-blue pl-6 lg:col-span-4">
                <p className="font-serif text-7xl leading-none tracking-tight">{num(item.metric as string, lang)}</p>
                <p className="mt-3 text-muted">{pick(item, "metric_label", lang)}</p>
              </div>
            ) : null}
          </div>
          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6 text-sm">
            {item.status ? (
              <div>
                <dt className="text-muted">{d.common.status}</dt>
                <dd className="mt-1 font-medium">
                  <StatusDot status={item.status} lang={lang} />
                </dd>
              </div>
            ) : null}
            {item.year ? (
              <div>
                <dt className="text-muted">{d.common.year}</dt>
                <dd className="mt-1 font-medium">{num(item.year as string, lang)}</dd>
              </div>
            ) : null}
            {pick(item, "ward", lang) && (
              <div>
                <dt className="text-muted">{d.common.ward}</dt>
                <dd className="mt-1 font-medium">{pick(item, "ward", lang)}</dd>
              </div>
            )}
          </dl>
        </div>
      </header>

      <div className="wrap py-14 md:py-20">
        {typeof item.image === "string" && item.image && <Img src={item.image} alt={title} eager className="mb-14 aspect-[16/8] w-full object-cover" />}
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Markdown>{pick(item, "body", lang)}</Markdown>
            {(item.gallery as GalleryImage[])?.length > 0 && (
              <div className="mt-14">
                <p className="kicker mb-6">{d.work.morePhotos}</p>
                <PhotoGrid photos={item.gallery as GalleryImage[]} alt={title} columns={2} />
              </div>
            )}
          </div>
          <aside className="space-y-6 lg:col-span-4">
            {typeof item.document === "string" && item.document && (
              <a href={item.document} download className="group flex items-center gap-4 border border-line p-5 transition-colors hover:border-blue">
                <FileText className="size-8 text-blue" strokeWidth={1.5} />
                <span className="flex-1">
                  <span className="block font-semibold">{d.work.supporting}</span>
                  <span className="text-sm text-muted">{d.common.download}</span>
                </span>
                <Download className="size-4 text-muted group-hover:text-blue" />
              </a>
            )}
            <ShareLinks title={title} label={d.common.share} />
          </aside>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-paper py-16 md:py-20">
          <div className="wrap">
            <p className="kicker">{d.work.related}</p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {related.map((a) => (
                <AchievementCard key={a.id} item={a} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
