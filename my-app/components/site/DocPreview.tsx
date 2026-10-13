"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, X } from "lucide-react";

/** Opens a PDF in an in-page viewer; other file types just download. */
export function DocPreview({ url, title, label, downloadLabel }: { url: string; title: string; label: string; downloadLabel: string }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const isPdf = url.toLowerCase().endsWith(".pdf");

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!isPdf) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 border border-line px-3.5 text-sm font-medium text-ink transition-colors hover:border-ink"
      >
        <Eye className="size-4" /> {label}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialog.current && setOpen(false)}
        className="m-auto h-[92vh] w-[min(1100px,94vw)] max-w-none bg-white p-0 backdrop:bg-navy-deep/80 backdrop:backdrop-blur-sm"
      >
        {open && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
              <p className="truncate font-medium">{title}</p>
              <div className="flex shrink-0 items-center gap-2">
                <a href={url} download className="btn btn-primary h-9 px-3 text-sm">
                  <Download className="size-4" /> {downloadLabel}
                </a>
                <button type="button" onClick={() => setOpen(false)} className="flex size-9 items-center justify-center hover:bg-paper" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <iframe src={`${url}#view=FitH`} title={title} className="w-full flex-1 bg-paper" />
          </div>
        )}
      </dialog>
    </>
  );
}
