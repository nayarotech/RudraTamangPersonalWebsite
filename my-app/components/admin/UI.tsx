"use client";

import { cn } from "@/lib/utils";
import type { EditLang } from "./Fields";

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-serif text-[2rem] leading-tight text-ink">{title}</h1>
        {description && <p className="mt-1 text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("border border-line bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function LangSwitch({ lang, onChange }: { lang: EditLang; onChange: (l: EditLang) => void }) {
  return (
    <div className="inline-flex border border-line bg-white p-0.5 text-sm font-medium" role="tablist" aria-label="Editing language">
      {(
        [
          ["np", "नेपाली"],
          ["en", "English"],
        ] as const
      ).map(([k, label]) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={lang === k}
          onClick={() => onChange(k)}
          className={cn("px-4 py-1.5 transition-colors", lang === k ? "bg-ink text-white" : "text-muted hover:text-ink")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const tones: Record<string, string> = {
  New: "bg-blue-soft text-blue",
  Received: "bg-blue-soft text-blue",
  "In review": "bg-[#fff4e0] text-warn",
  "In progress": "bg-[#fff4e0] text-warn",
  Contacted: "bg-[#fff4e0] text-warn",
  Read: "bg-paper text-muted",
  Replied: "bg-[#e7f6ee] text-success",
  Resolved: "bg-[#e7f6ee] text-success",
  Active: "bg-[#e7f6ee] text-success",
  Completed: "bg-[#e7f6ee] text-success",
  Ongoing: "bg-[#fff4e0] text-warn",
  Closed: "bg-paper text-muted",
  Archived: "bg-paper text-muted",
  Inactive: "bg-paper text-muted",
  Draft: "bg-paper text-muted",
  Published: "bg-[#e7f6ee] text-success",
  Open: "bg-[#e7f6ee] text-success",
  Scheduled: "bg-[#fff4e0] text-warn",
};

export function Badge({ children }: { children: React.ReactNode }) {
  const key = String(children);
  return <span className={cn("inline-flex whitespace-nowrap rounded-sm px-2 py-0.5 text-[11.5px] font-semibold", tones[key] ?? "bg-paper text-ink/70")}>{children}</span>;
}
