import type { Metadata } from "next";
import Link from "next/link";
import { Cover, VideoTile } from "@/components/site/Media";
import { Empty, PageHero } from "@/components/site/Section";
import { list } from "@/lib/api";
import { formatDate, num, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import type { GalleryImage } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang).gallery.title };
}

export default async function GalleryPage() {
  const [lang, albums, videos] = await Promise.all([getLang(), list("albums"), list("videos")]);
  const d = t(lang);

  return (
    <>
      <PageHero kicker={d.gallery.kicker} title={d.gallery.title} />
      <section className="wrap py-14 md:py-20">
        <h2 className="kicker">{d.gallery.albums}</h2>
        {albums.items.length === 0 ? (
          <div className="mt-8">
            <Empty>{d.gallery.empty}</Empty>
          </div>
        ) : (
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {albums.items.map((a) => {
              const photos = (a.photos as GalleryImage[]) ?? [];
              const title = pick(a, "title", lang);
              return (
                <Link key={a.id} href={`/gallery/${a.slug ?? a.id}`} className="group block">
                  <div className="relative">
                    <Cover src={(a.cover as string) || photos[0]?.url} alt={title} className="aspect-[4/3]" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute right-3 top-3 bg-white/95 px-2.5 py-1 text-xs font-semibold tabular-nums">
                      {num(photos.length, lang)} {d.common.photos}
                    </span>
                  </div>
                  <p className="mt-4 text-[13px] text-muted">
                    {formatDate(a.date, lang)}
                    {pick(a, "location", lang) && ` · ${pick(a, "location", lang)}`}
                  </p>
                  <h3 className="mt-1.5 font-serif text-2xl leading-tight">
                    <span className="link-draw">{title}</span>
                  </h3>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {videos.items.length > 0 && (
        <section id="videos" className="scroll-mt-24 border-t border-line bg-paper py-14 md:py-20">
          <div className="wrap">
            <h2 className="kicker">{d.gallery.videos}</h2>
            <div className="mt-8 grid gap-x-6 gap-y-12 md:grid-cols-2">
              {videos.items.map((v) => {
                return (
                  <div key={v.id}>
                    <VideoTile url={v.url} thumbnail={v.thumbnail} title={pick(v, "title", lang)} lang={lang} />
                    <p className="mt-4 text-[13px] text-muted">{formatDate(v.date, lang)}</p>
                    <h3 className="mt-1 text-lg font-semibold">{pick(v, "title", lang)}</h3>
                    {pick(v, "description", lang) && <p className="mt-2 text-muted">{pick(v, "description", lang)}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
