/* eslint-disable @next/next/no-img-element -- uploads are served by the API, not bundled */
import { cn } from "@/lib/utils";

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
  return (
    <div className={cn("relative overflow-hidden bg-paper", className)}>
      {typeof src === "string" && src ? (
        <Img src={src} alt={alt} eager={eager} className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)} />
      ) : (
        <Placeholder label={alt} tone={tone} className="absolute inset-0" />
      )}
    </div>
  );
}
