import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { dateParts, formatDate, label, num, pick } from "@/lib/i18n";
import type { Item, Lang } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Cover } from "./Media";

const statusTone: Record<string, string> = {
  Completed: "bg-success",
  Ongoing: "bg-blue-bright",
  Planned: "bg-muted",
};

export function StatusDot({ status, lang }: { status: unknown; lang: Lang }) {
  if (typeof status !== "string" || !status) return null;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", statusTone[status] ?? "bg-muted")} />
      {label(status, lang)}
    </span>
  );
}

/** Achievement card: led by the headline figure, photo optional. */
export function AchievementCard({ item, lang, large }: { item: Item; lang: Lang; large?: boolean }) {
  const title = pick(item, "title", lang);
  const hasImage = typeof item.image === "string" && item.image;
  return (
    <Link href={`/work/${item.slug ?? item.id}`} className="group flex h-full flex-col border border-line bg-white transition-[border-color,box-shadow] duration-300 hover:border-blue/40 hover:shadow-[0_20px_50px_-25px_rgb(10_42_102/0.35)]">
      {hasImage ? (
        <Cover src={item.image} alt={title} className={large ? "aspect-[16/10]" : "aspect-[16/9]"} imgClassName="transition-transform duration-700 group-hover:scale-[1.03]" />
      ) : null}
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex items-center justify-between text-[12.5px] text-muted">
          <span className="font-semibold uppercase tracking-[0.12em] text-blue">{label(item.category, lang)}</span>
          <span>{num(item.year as string, lang)}</span>
        </div>
        {item.metric ? (
          <p className={cn("mt-6 font-serif leading-none tracking-tight text-ink", large ? "text-6xl md:text-7xl" : "text-5xl")}>
            {num(item.metric as string, lang)}
          </p>
        ) : null}
        {pick(item, "metric_label", lang) && <p className="mt-2 text-sm text-muted">{pick(item, "metric_label", lang)}</p>}
        <h3 className={cn("mt-6 font-semibold leading-snug text-ink", large ? "text-xl" : "text-[1.05rem]")}>
          <span className="link-draw">{title}</span>
        </h3>
        {large && pick(item, "summary", lang) && <p className="mt-3 leading-relaxed text-muted">{pick(item, "summary", lang)}</p>}
        <div className="mt-auto flex items-center justify-between pt-6 text-[13px] text-muted">
          <span className="flex items-center gap-4">
            <StatusDot status={item.status} lang={lang} />
            {pick(item, "ward", lang) && <span>{pick(item, "ward", lang)}</span>}
          </span>
          <ArrowUpRight className="size-4 text-ink/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue" />
        </div>
      </div>
    </Link>
  );
}

export function PostCard({ item, lang, large }: { item: Item; lang: Lang; large?: boolean }) {
  const title = pick(item, "title", lang);
  return (
    <Link href={`/news/${item.slug ?? item.id}`} className="group block">
      {typeof item.cover === "string" && item.cover ? (
        <Cover
          src={item.cover}
          alt={title}
          className={cn("mb-5", large ? "aspect-[16/10]" : "aspect-[3/2]")}
          imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="mb-5 h-[3px] w-12 bg-blue transition-[width] duration-500 group-hover:w-24" aria-hidden />
      )}
      <div className="flex items-center gap-3 text-[12.5px] text-muted">
        <span className="font-semibold uppercase tracking-[0.12em] text-blue">{label(item.type, lang)}</span>
        <span className="h-3 w-px bg-line" />
        <time>{formatDate(item.published_at, lang)}</time>
      </div>
      <h3 className={cn("mt-3 font-serif leading-tight text-ink", large ? "text-[clamp(1.6rem,2.6vw,2.2rem)]" : "text-[1.45rem]")}>
        <span className="link-draw">{title}</span>
      </h3>
      {pick(item, "excerpt", lang) && <p className={cn("mt-3 leading-relaxed text-muted", !large && "line-clamp-3")}>{pick(item, "excerpt", lang)}</p>}
    </Link>
  );
}

export function EventRow({ item, lang, dark }: { item: Item; lang: Lang; dark?: boolean }) {
  const { day, month, time } = dateParts(item.starts_at, lang);
  return (
    <li className={cn("flex gap-5 border-b py-5", dark ? "border-white/10" : "border-line")}>
      <div className={cn("flex w-16 shrink-0 flex-col items-center justify-center border py-2", dark ? "border-white/20" : "border-line")}>
        <span className={cn("font-serif text-3xl leading-none", dark ? "text-white" : "text-ink")}>{day}</span>
        <span className={cn("mt-1 text-[11px] font-semibold uppercase tracking-wider", dark ? "text-[#9db8ff]" : "text-blue")}>{month}</span>
      </div>
      <div className="min-w-0">
        <p className={cn("font-semibold leading-snug", dark ? "text-white" : "text-ink")}>{pick(item, "title", lang)}</p>
        <p className={cn("mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px]", dark ? "text-white/60" : "text-muted")}>
          {time && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {time}
            </span>
          )}
          {pick(item, "location", lang) && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {pick(item, "location", lang)}
            </span>
          )}
        </p>
      </div>
    </li>
  );
}
