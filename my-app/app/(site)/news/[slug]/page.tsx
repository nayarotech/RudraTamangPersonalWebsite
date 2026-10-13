import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Download } from "lucide-react";
import { PostCard } from "@/components/site/Cards";
import { Markdown } from "@/components/site/Markdown";
import { Img } from "@/components/site/Media";
import { ShareLinks } from "@/components/site/ShareLinks";
import { list, one } from "@/lib/api";
import { formatDate, label, pick, t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const post = await one("posts", slug);
  if (!post) return {};
  return {
    title: pick(post, "title", lang),
    description: pick(post, "excerpt", lang),
    openGraph: { type: "article", images: typeof post.cover === "string" && post.cover ? [post.cover] : undefined },
  };
}

export default async function PostPage({ params }: PageProps<"/news/[slug]">) {
  const [{ slug }, lang] = await Promise.all([params, getLang()]);
  const post = await one("posts", slug);
  if (!post) notFound();
  const d = t(lang);
  const title = pick(post, "title", lang);
  const more = (await list("posts", { limit: 4 })).items.filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article>
      <header className="wrap max-w-4xl pb-10 pt-12 md:pt-20">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> {d.news.title}
        </Link>
        <div className="mt-10 flex items-center gap-3 text-sm text-muted">
          <span className="font-semibold uppercase tracking-[0.12em] text-blue">{label(post.type, lang)}</span>
          <span className="h-3 w-px bg-line" />
          <time>{formatDate(post.published_at, lang)}</time>
        </div>
        <h1 className="display mt-5 text-[clamp(2.4rem,5.5vw,4.25rem)]">{title}</h1>
        {pick(post, "excerpt", lang) && <p className="mt-6 text-xl leading-relaxed text-muted">{pick(post, "excerpt", lang)}</p>}
      </header>
      {typeof post.cover === "string" && post.cover && (
        <div className="wrap">
          <Img src={post.cover} alt={title} eager className="aspect-[16/8] w-full object-cover" />
        </div>
      )}
      <div className="wrap max-w-4xl py-12 md:py-16">
        <div className="max-w-[42rem]">
          <Markdown>{pick(post, "body", lang)}</Markdown>
          {Boolean(post.attachment || post.source_url) && (
            <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
              {typeof post.attachment === "string" && post.attachment && (
                <a href={post.attachment} download className="btn btn-outline h-11">
                  <Download className="size-4" /> {d.news.attachment}
                </a>
              )}
              {typeof post.source_url === "string" && post.source_url && (
                <a href={post.source_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline h-11">
                  {d.news.source}: {String(post.source_name || new URL(post.source_url).hostname)} <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          )}
          <div className="mt-10">
            <ShareLinks title={title} label={d.common.share} />
          </div>
        </div>
      </div>
      {more.length > 0 && (
        <section className="border-t border-line bg-paper py-16 md:py-20">
          <div className="wrap">
            <p className="kicker">{d.home.newsTitle}</p>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.id} item={p} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
