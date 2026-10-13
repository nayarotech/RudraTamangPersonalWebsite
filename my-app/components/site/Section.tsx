import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHead({
  kicker,
  title,
  lead,
  href,
  hrefLabel,
  light,
  className,
}: {
  kicker: string;
  title: string;
  lead?: string;
  href?: string;
  hrefLabel?: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <p className={cn("kicker", light && "kicker-light")}>{kicker}</p>
        <h2 className={cn("display mt-4 text-[clamp(2rem,4.2vw,3.25rem)]", light ? "text-white" : "text-ink")}>{title}</h2>
        {lead && <p className={cn("mt-4 text-lg leading-relaxed", light ? "text-white/70" : "text-muted")}>{lead}</p>}
      </div>
      {href && hrefLabel && (
        <Link
          href={href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 text-sm font-semibold",
            light ? "text-white" : "text-blue",
          )}
        >
          <span className="link-draw">{hrefLabel}</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

/** Header band for inner pages. */
export function PageHero({
  kicker,
  title,
  lead,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 border-l border-line lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#c9d4ea_1px,transparent_0)] [background-size:22px_22px] opacity-60" />
      </div>
      <div className="wrap relative py-16 md:py-24">
        <p className="kicker reveal">{kicker}</p>
        <h1 className="display reveal reveal-delay-1 mt-5 max-w-4xl text-[clamp(2.5rem,6vw,4.75rem)] text-ink">{title}</h1>
        {lead && <p className="reveal reveal-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">{lead}</p>}
        {children && <div className="reveal reveal-delay-3 mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="border border-dashed border-line px-6 py-16 text-center text-muted">{children}</p>;
}
