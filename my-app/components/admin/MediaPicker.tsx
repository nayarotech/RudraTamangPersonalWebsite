"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, FileText, Loader2, Search, Upload, X } from "lucide-react";
import { adm, upload, type UploadedFile } from "@/lib/admin";
import { cn, formatBytes } from "@/lib/utils";
import { useAdmin } from "./AdminContext";

export interface MediaRow extends UploadedFile {
  alt: string | null;
  created_at: string;
}

/** Drop zone + hidden input. Calls onUploaded with the saved files. */
export function Dropzone({
  accept,
  multiple,
  onUploaded,
  compact,
  label,
}: {
  accept?: string;
  multiple?: boolean;
  onUploaded: (files: UploadedFile[]) => void;
  compact?: boolean;
  label?: string;
}) {
  const { toast } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  async function send(list: FileList | null) {
    if (!list?.length) return;
    setProgress(0);
    try {
      const files = await upload(Array.from(list), setProgress);
      onUploaded(files);
      toast(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        send(e.dataTransfer.files);
      }}
      onClick={() => progress === null && input.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center border border-dashed text-center transition-colors",
        compact ? "gap-1 px-4 py-5" : "gap-2 px-6 py-10",
        drag ? "border-blue bg-blue-soft" : "border-[#c9d3e6] bg-white hover:border-blue hover:bg-blue-soft/40",
      )}
    >
      <input ref={input} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => send(e.target.files)} />
      {progress !== null ? (
        <>
          <Loader2 className="size-5 animate-spin text-blue" />
          <p className="text-sm font-medium">Uploading… {progress}%</p>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-soft">
            <div className="h-full bg-blue transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </>
      ) : (
        <>
          <Upload className="size-5 text-blue" />
          <p className="text-sm font-medium">{label ?? (multiple ? "Drop files here or click to upload" : "Drop a file here or click to upload")}</p>
          {!compact && <p className="text-xs text-muted">JPG, PNG, WebP, PDF, Word, Excel — up to 40 MB each</p>}
        </>
      )}
    </div>
  );
}

/** Modal for choosing existing files from the media library (or uploading new ones). */
export function MediaPicker({
  open,
  onClose,
  onPick,
  type,
  multiple,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (files: MediaRow[]) => void;
  type: "image" | "document" | "all";
  multiple?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ ...(type !== "all" ? { type } : {}), ...(q ? { q } : {}) });
    adm<{ items: MediaRow[] }>(`/admin/media?${qs}`)
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false));
  }, [type, q]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setSelected([]);
      load();
    }
    if (!open && el.open) el.close();
  }, [open, load]);

  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : multiple ? [...s, id] : [id]));

  return (
    <dialog ref={dialog} onClose={onClose} className="m-auto h-[85vh] w-[min(960px,94vw)] max-w-none bg-white p-0 backdrop:bg-ink/60">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <p className="font-semibold">Media library</p>
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search files…"
              className="field h-9 py-0 pl-9 text-sm"
            />
          </div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center hover:bg-paper" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <Dropzone
            compact
            multiple
            accept={type === "image" ? "image/*" : undefined}
            onUploaded={(files) => {
              load();
              setSelected((s) => (multiple ? [...s, ...files.map((f) => f.id)] : [files[0].id]));
            }}
          />
          {loading && <p className="py-10 text-center text-sm text-muted">Loading…</p>}
          {!loading && items.length === 0 && <p className="py-10 text-center text-sm text-muted">No files yet. Upload some above.</p>}
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {items.map((m) => {
              const on = selected.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggle(m.id)}
                  onDoubleClick={() => onPick([m])}
                  className={cn("group relative text-left outline-offset-2", on && "outline outline-2 outline-blue")}
                >
                  <div className="aspect-square overflow-hidden bg-paper">
                    {m.mime.startsWith("image/") ? (
                      <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-blue">
                        <FileText className="size-8" strokeWidth={1.25} />
                        <span className="text-[10px] font-bold">{m.url.split(".").pop()?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted">{m.original_name}</p>
                  {on && (
                    <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-blue text-white">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <p className="text-sm text-muted">{selected.length ? `${selected.length} selected` : multiple ? "Select one or more" : "Select a file"}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-outline h-10">
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected.length}
              onClick={() => onPick(selected.map((id) => items.find((i) => i.id === id)!).filter(Boolean))}
              className="btn btn-primary h-10 disabled:opacity-50"
            >
              Use {selected.length > 1 ? `${selected.length} files` : "file"}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function FileBadge({ url, size }: { url: string; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <FileText className="size-4 text-blue" />
      <a href={url} target="_blank" rel="noreferrer" className="truncate underline-offset-2 hover:underline">
        {url.split("/").pop()}
      </a>
      {size ? <span className="text-muted">{formatBytes(size)}</span> : null}
    </span>
  );
}
