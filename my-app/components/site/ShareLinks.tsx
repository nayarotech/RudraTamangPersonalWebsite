"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

const targets = {
  Facebook: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  WhatsApp: (url: string, title: string) => `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  X: (url: string, title: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
};

export function ShareLinks({ title, label }: { title: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const item = "flex h-10 items-center border border-line px-3.5 text-sm font-medium transition-colors hover:border-ink";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</span>
      {Object.entries(targets).map(([name, build]) => (
        <button
          key={name}
          type="button"
          className={item}
          onClick={() => window.open(build(window.location.href, title), "_blank", "noopener,noreferrer,width=640,height=560")}
        >
          {name}
        </button>
      ))}
      <button
        type="button"
        className={item}
        onClick={async () => {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        aria-label="Copy link"
      >
        {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
