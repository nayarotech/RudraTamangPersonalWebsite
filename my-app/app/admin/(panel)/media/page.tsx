"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { Copy, FileText, Search, Trash2, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Dropzone, type MediaRow } from "@/components/admin/MediaPicker";
import { PageTitle, Panel } from "@/components/admin/UI";
import { adm, relativeTime } from "@/lib/admin";
import { cn, formatBytes } from "@/lib/utils";

export default function MediaPage() {
  const { toast } = useAdmin();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [type, setType] = useState<"" | "image" | "document">("");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<MediaRow | null>(null);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ ...(type ? { type } : {}), ...(q ? { q } : {}) });
    adm<{ items: MediaRow[] }>(`/admin/media?${qs}`).then((r) => setItems(r.items));
  }, [type, q]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function remove(m: MediaRow) {
    if (!confirm(`Delete "${m.original_name}"? Anything that uses this file will show nothing in its place.`)) return;
    await adm(`/admin/media/${m.id}`, { method: "DELETE" });
    setActive(null);
    toast("File deleted");
    load();
  }

  async function saveAlt(m: MediaRow, alt: string) {
    await adm(`/admin/media/${m.id}`, { method: "PATCH", json: { alt } });
    toast("Description saved");
    load();
  }

  return (
    <>
      <PageTitle title="Media library" description="Every photo and document uploaded to the site." />
      <Dropzone multiple onUploaded={load} />
      <Panel className="mt-6">
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name…" className="field h-10 py-0 pl-9 text-sm" />
          </div>
          <div className="flex gap-1">
            {(
              [
                ["", "All"],
                ["image", "Images"],
                ["document", "Documents"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setType(k)} className={cn("h-9 px-3 text-[13px] font-medium", type === k ? "bg-ink text-white" : "text-muted hover:bg-paper")}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <button key={m.id} type="button" onClick={() => setActive(m)} className="group text-left">
              <div className="aspect-square overflow-hidden border border-line bg-paper">
                {m.mime.startsWith("image/") ? (
                  <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-blue">
                    <FileText className="size-9" strokeWidth={1.25} />
                    <span className="text-[10px] font-bold">{m.url.split(".").pop()?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <p className="mt-1.5 truncate text-xs font-medium">{m.original_name}</p>
              <p className="text-[11px] text-muted">{formatBytes(m.size)}</p>
            </button>
          ))}
        </div>
        {items.length === 0 && <p className="p-10 text-center text-sm text-muted">No files.</p>}
      </Panel>

      {active && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={() => setActive(null)}>
          <aside className="reveal h-full w-full max-w-md overflow-y-auto bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="truncate font-semibold">{active.original_name}</p>
              <button type="button" onClick={() => setActive(null)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-5 p-5">
              {active.mime.startsWith("image/") ? (
                <img src={active.url} alt="" className="w-full border border-line" />
              ) : active.mime === "application/pdf" ? (
                <iframe src={active.url} title={active.original_name} className="h-80 w-full border border-line" />
              ) : null}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Size</dt>
                  <dd>{formatBytes(active.size)}</dd>
                </div>
                {active.width && (
                  <div>
                    <dt className="text-muted">Dimensions</dt>
                    <dd>
                      {active.width} × {active.height}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">Uploaded</dt>
                  <dd>{relativeTime(active.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Type</dt>
                  <dd>{active.mime.split("/").pop()}</dd>
                </div>
              </dl>
              <div>
                <label className="field-label" htmlFor="alt">
                  Description (for screen readers and search)
                </label>
                <input id="alt" defaultValue={active.alt ?? ""} onBlur={(e) => e.target.value !== (active.alt ?? "") && saveAlt(active, e.target.value)} className="field" />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + active.url);
                    toast("Link copied");
                  }}
                  className="btn btn-outline h-10 flex-1"
                >
                  <Copy className="size-4" /> Copy link
                </button>
                <button type="button" onClick={() => remove(active)} className="btn h-10 border border-danger/30 text-danger hover:bg-danger hover:text-white">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
