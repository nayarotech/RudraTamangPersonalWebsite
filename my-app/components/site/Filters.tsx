import Link from "next/link";
import { cn } from "@/lib/utils";

/** Link-based filter chips: work without JavaScript and are shareable. */
export function FilterChips({
  base,
  param,
  current,
  options,
  allLabel,
  extra = {},
}: {
  base: string;
  param: string;
  current?: string;
  options: { value: string; label: string; count?: number }[];
  allLabel: string;
  extra?: Record<string, string | undefined>;
}) {
  const href = (value?: string) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(extra)) if (v) qs.set(k, v);
    if (value) qs.set(param, value);
    return qs.size ? `${base}?${qs}` : base;
  };
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-10 shrink-0 items-center gap-2 border px-4 text-sm font-medium transition-colors",
      active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink/80 hover:border-ink hover:text-ink",
    );
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
      <Link href={href()} scroll={false} className={chip(!current)}>
        {allLabel}
      </Link>
      {options.map((o) => (
        <Link key={o.value} href={href(o.value)} scroll={false} className={chip(current === o.value)}>
          {o.label}
          {o.count !== undefined && <span className={cn("text-xs", current === o.value ? "text-white/60" : "text-muted")}>{o.count}</span>}
        </Link>
      ))}
    </div>
  );
}
