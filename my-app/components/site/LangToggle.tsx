"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Lang } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LangToggle({ lang, className }: { lang: Lang; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next = lang === "en" ? "np" : "en";

  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
        start(() => router.refresh());
      }}
      className={cn("inline-flex items-center gap-2 transition-opacity", pending && "opacity-50", className)}
      aria-label={next === "np" ? "नेपालीमा हेर्नुहोस्" : "View in English"}
    >
      <span className={cn(lang === "np" ? "opacity-100" : "opacity-50")}>नेपाली</span>
      <span className="h-3 w-px bg-current opacity-30" />
      <span className={cn(lang === "en" ? "opacity-100" : "opacity-50")}>EN</span>
    </button>
  );
}
