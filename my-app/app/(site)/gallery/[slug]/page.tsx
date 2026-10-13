import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PhotoGrid } from "@/components/site/Lightbox";
import { Empty } from "@/components/site/Section";
import { one } from "@/lib/api";
import { formatDate, num, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import type { GalleryImage } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const album = await one("albums", slug);
  if (!album) return {};
  const photos = (album.photos as GalleryImage[]) ?? [];
  const cover = (album.cover as string) || photos[0]?.url;
  return { title: pick(album, "title", lang), description: pick(album, "description", lang), openGraph: { images: cover ? [cover] : undefined } };
}

export default async function AlbumPage({ params }: PageProps<"/gallery/[slug]">) {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const album = await one("albums", slug);
  if (!album) notFound();
  const d = t(lang);
  const photos = (album.photos as GalleryImage[]) ?? [];
  const title = pick(album, "title", lang);

  return (
    <>
      <header className="wrap pb-10 pt-12 md:pt-20">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> {d.gallery.title}
        </Link>
        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h1 className="display text-[clamp(2.4rem,5.5vw,4.25rem)] lg:col-span-8">{title}</h1>
          <p className="text-muted lg:col-span-4 lg:text-right">
            {formatDate(album.date, lang)}
            {pick(album, "location", lang) && <> · {pick(album, "location", lang)}</>}
            <br />
            {num(photos.length, lang)} {d.common.photos}
          </p>
        </div>
        {pick(album, "description", lang) && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{pick(album, "description", lang)}</p>}
      </header>
      <section className="wrap pb-20">{photos.length ? <PhotoGrid photos={photos} alt={title} /> : <Empty>{d.common.noItems}</Empty>}</section>
    </>
  );
}
