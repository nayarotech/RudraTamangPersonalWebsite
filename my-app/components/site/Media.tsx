/* eslint-disable @next/next/no-img-element -- uploads are served by the API, not bundled */
import { Play } from "lucide-react";
import type { Lang } from "@/lib/types";
import { cn, videoPlatform, youtubeId } from "@/lib/utils";

/**
 * Uploaded images. Plain <img> because files come from the content API at
 * runtime; dimensions are stored on upload so layout doesn't jump.
 */
export function Img({
  src,
  alt,
  className,
  width,
  height,
  eager,
}: {
  src: unknown;
  alt: string;
  className?: string;
  width?: number | null;
  height?: number | null;
  eager?: boolean;
}) {
  if (typeof src !== "string" || !src) return null;
  return (
    <img
      src={src}
      alt={alt}
      width={width ?? undefined}
      height={height ?? undefined}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : undefined}
      className={className}
    />
  );
}

/** Shown where a photo hasn't been uploaded yet: a typographic panel, not a broken image. */
export function Placeholder({ label, className, tone = "soft" }: { label?: string; className?: string; tone?: "soft" | "navy" }) {
  const initials = (label ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden",
        tone === "navy" ? "bg-navy text-white/90 grid-lines" : "bg-blue-soft text-blue/70",
        className,
      )}
      aria-hidden
    >
      <span className="font-serif text-[clamp(2rem,6vw,4.5rem)] italic leading-none">{initials || "·"}</span>
    </div>
  );
}

export function Cover({
  src,
  alt,
  className,
  imgClassName,
  eager,
  tone,
}: {
  src: unknown;
  alt: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  tone?: "soft" | "navy";
}) {
  // `relative` would override an `absolute` passed in (Tailwind emits it later)
  // and collapse the box to zero height, hiding the photo.
  const positioned = /(^|\s)(absolute|fixed|sticky)(\s|$)/.test(className ?? "");
  return (
    <div className={cn(!positioned && "relative", "overflow-hidden bg-paper", className)}>
      {typeof src === "string" && src ? (
        <Img src={src} alt={alt} eager={eager} className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)} />
      ) : (
        <Placeholder label={alt} tone={tone} className="absolute inset-0" />
      )}
    </div>
  );
}

/**
 * A video: YouTube plays in place; Facebook, TikTok and other links show the
 * uploaded thumbnail with a play button and open the original in a new tab.
 */
export function VideoTile({ url, thumbnail, title, lang }: { url: unknown; thumbnail: unknown; title: string; lang: Lang }) {
  const id = youtubeId(url);
  const thumb = typeof thumbnail === "string" && thumbnail ? thumbnail : null;
  if (id) {
    return (
      <div className="aspect-video bg-ink">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }
  const platform = videoPlatform(url);
  const label = lang === "np" ? (platform ? `${platform} मा हेर्नुहोस्` : "भिडियो हेर्नुहोस्") : platform ? `Watch on ${platform}` : "Watch video";
  return (
    <a href={String(url)} target="_blank" rel="noopener noreferrer" className="group relative block aspect-video overflow-hidden bg-navy text-white" aria-label={`${title} — ${label}`}>
      {thumb ? (
        <Img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <div className="grid-lines absolute inset-0" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/20 to-transparent" />
      <span className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy shadow-lg transition-transform group-hover:scale-110 md:size-20">
        <Play className="ml-1 size-7 fill-current md:size-8" />
      </span>
      <span className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy">{label} ↗</span>
    </a>
  );
}
