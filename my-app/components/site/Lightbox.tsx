"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { GalleryImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Masonry-style photo grid with a keyboard- and swipe-friendly lightbox. */
export function PhotoGrid({ photos, alt, columns = 3 }: { photos: GalleryImage[]; alt: string; columns?: 2 | 3 | 4 }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (index !== null && !el.open) el.showModal();
    if (index === null && el.open) el.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  if (!photos.length) return null;
  const current = index !== null ? photos[index] : null;
  const cols = { 2: "sm:columns-2", 3: "sm:columns-2 lg:columns-3", 4: "sm:columns-3 lg:columns-4" }[columns];

  return (
    <>
      <div className={cn("columns-1 gap-3", cols)}>
        {photos.map((p, i) => (
          <button
            key={p.url + i}
            type="button"
            onClick={() => setIndex(i)}
            className="group relative mb-3 block w-full overflow-hidden bg-paper"
            aria-label={`Open photo ${i + 1}`}
          >
            <img
              src={p.url}
              alt={p.caption || alt}
              width={p.width ?? undefined}
              height={p.height ?? undefined}
              loading="lazy"
              decoding="async"
              className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {p.caption && (
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-navy-deep/90 to-transparent p-4 pt-10 text-left text-sm text-white transition-transform duration-300 group-hover:translate-y-0">
                {p.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setIndex(null)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-navy-deep/[0.97] p-0 text-white backdrop:bg-transparent"
      >
        {current && (
          <div
            className="flex h-full flex-col"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              touchX.current = null;
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 text-sm text-white/70">
              <span className="tabular-nums">
                {index! + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-1">
                <a href={current.url} download className="flex size-10 items-center justify-center hover:text-white" aria-label="Download">
                  <Download className="size-5" />
                </a>
                <button type="button" onClick={() => setIndex(null)} className="flex size-10 items-center justify-center hover:text-white" aria-label="Close">
                  <X className="size-6" />
                </button>
              </div>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
              <img key={current.url} src={current.url} alt={current.caption || alt} className="reveal max-h-full max-w-full object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center border border-white/20 hover:bg-white/10 md:flex" aria-label="Previous">
                    <ChevronLeft className="size-6" />
                  </button>
                  <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center border border-white/20 hover:bg-white/10 md:flex" aria-label="Next">
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>
            <p className="min-h-16 px-5 py-5 text-center text-white/80">{current.caption}</p>
          </div>
        )}
      </dialog>
    </>
  );
}
