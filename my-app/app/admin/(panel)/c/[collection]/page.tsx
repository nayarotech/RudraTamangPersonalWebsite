"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Download, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Badge, PageTitle, Panel } from "@/components/admin/UI";
import { adm, relativeTime } from "@/lib/admin";
import type { FieldDef, Item, List } from "@/lib/types";
import { cn } from "@/lib/utils";

const PUBLIC_PATH: Record<string, string> = {
  achievements: "/work/",
  posts: "/news/",
  albums: "/gallery/",
};

function cell(f: FieldDef, item: Item) {
  const v = item[f.name] ?? item[`${f.name}_np`];
  if (v === null || v === undefined || v === "") return <span className="text-muted/50">—</span>;
  if (f.type === "boolean") return v ? <Badge>Featured</Badge> : <span className="text-muted/50">—</span>;
  if (f.type === "select") return <Badge>{String(v)}</Badge>;
  if (f.type === "datetime") return new Date(String(v)).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
  if (f.type === "date") return new Date(String(v)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return <span className="line-clamp-1">{String(v)}</span>;
}

export default function CollectionList() {
  const { collection } = useParams<{ collection: string }>();
  const router = useRouter();
  const { schema, toast, refreshUnread } = useAdmin();
  const def = schema.collections.find((c) => c.key === collection);
  const [data, setData] = useState<List | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const statusField = def?.fields.find((f) => f.name === "status" && f.type === "select");
  const columns = (def?.fields.filter((f) => f.column && f.name !== def.titleField) ?? []).slice(0, 4);
  const thumbField = def?.fields.find((f) => f.type === "image" || f.type === "gallery");
  const sortable = def && ["ideas", "timeline", "testimonials"].includes(def.key);

  const key = def?.key;
  const [version, setVersion] = useState(0);
  const load = () => setVersion((v) => v + 1);

  useEffect(() => {
    if (!key) return;
    const qs = new URLSearchParams({ limit: "500", ...(q ? { q } : {}), ...(status ? { status } : {}) });
    const t = setTimeout(() => adm<List>(`/admin/c/${key}?${qs}`).then(setData), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [key, q, status, version]);

  if (!def) return <p>Unknown section.</p>;

  async function togglePublished(item: Item) {
    await adm(`/admin/c/${def!.key}/${item.id}`, { method: "PUT", json: { published: !item.published } });
    toast(item.published ? "Hidden from the website" : "Published");
    load();
  }
  async function remove(item: Item) {
    if (!confirm(`Delete "${String(item[def!.titleField] ?? item.id)}"? This can't be undone.`)) return;
    await adm(`/admin/c/${def!.key}/${item.id}`, { method: "DELETE" });
    toast("Deleted");
    load();
    refreshUnread();
  }
  async function move(index: number, delta: number) {
    if (!data) return;
    const items = [...data.items];
    const [x] = items.splice(index, 1);
    items.splice(index + delta, 0, x);
    setData({ ...data, items });
    await adm(`/admin/c/${def!.key}/reorder`, { method: "POST", json: { ids: items.map((i) => i.id) } });
  }

  const thumb = (item: Item) => {
    if (!thumbField) return null;
    const v = item[thumbField.name];
    const src = Array.isArray(v) ? (v[0] as { url: string })?.url : typeof v === "string" ? v : (item.cover as string);
    return (
      <div className="size-10 shrink-0 overflow-hidden bg-paper">
        {src ? <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" /> : null}
      </div>
    );
  };

  return (
    <>
      <PageTitle
        title={def.label}
        description={def.description}
        actions={
          <>
            {def.kind === "inbox" && (
              <a href={`/api/admin/c/${def.key}/export.csv`} className="btn btn-outline h-10">
                <Download className="size-4" /> Export CSV
              </a>
            )}
            {def.kind === "content" && (
              <Link href={`/admin/c/${def.key}/new`} className="btn btn-primary h-10">
                <Plus className="size-4" /> New {def.singular.toLowerCase()}
              </Link>
            )}
          </>
        }
      />

      <Panel>
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}…`} className="field h-10 py-0 pl-9 text-sm" />
          </div>
          {statusField && (
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {["", ...(statusField.options ?? [])].map((s) => (
                <button
                  key={s || "all"}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn("h-9 shrink-0 px-3 text-[13px] font-medium", status === s ? "bg-ink text-white" : "text-muted hover:bg-paper hover:text-ink")}
                >
                  {s || "All"}
                </button>
              ))}
            </div>
          )}
        </div>

        {!data ? (
          <p className="p-10 text-center text-sm text-muted">Loading…</p>
        ) : data.items.length === 0 ? (
          <div className="p-14 text-center">
            <p className="font-medium">{q || status ? "No matches." : `No ${def.label.toLowerCase()} yet.`}</p>
            {def.kind === "content" && !q && (
              <Link href={`/admin/c/${def.key}/new`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue">
                <Plus className="size-4" /> Add the first one
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11.5px] font-semibold uppercase tracking-wider text-muted">
                  {sortable && <th className="w-16 px-3 py-3" />}
                  <th className="px-4 py-3">{def.fields.find((f) => f.name === def.titleField)?.label ?? "Title"}</th>
                  {columns.map((c) => (
                    <th key={c.name} className="hidden px-4 py-3 md:table-cell">
                      {c.label}
                    </th>
                  ))}
                  <th className="hidden px-4 py-3 lg:table-cell">{def.kind === "inbox" ? "Received" : "Updated"}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => {
                  const title = String(item[def.titleField] || item[`${def.titleField}_np`] || `#${item.id}`);
                  const unread = def.kind === "inbox" && (item.status === "New" || item.status === "Received");
                  return (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/admin/c/${def.key}/${item.id}`)}
                      className={cn("cursor-pointer border-b border-line last:border-0 hover:bg-[#f8faff]", !item.published && def.kind === "content" && "opacity-60")}
                    >
                      {sortable && (
                        <td className="px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex">
                            <button type="button" disabled={i === 0 || !!q} onClick={() => move(i, -1)} className="flex size-7 items-center justify-center text-muted hover:text-ink disabled:opacity-20" aria-label="Move up">
                              <ArrowUp className="size-3.5" />
                            </button>
                            <button type="button" disabled={i === data.items.length - 1 || !!q} onClick={() => move(i, 1)} className="flex size-7 items-center justify-center text-muted hover:text-ink disabled:opacity-20" aria-label="Move down">
                              <ArrowDown className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {thumb(item)}
                          <div className="min-w-0">
                            <p className={cn("line-clamp-1", unread ? "font-semibold" : "font-medium")}>
                              {unread && <span className="mr-2 inline-block size-2 rounded-full bg-blue-bright align-middle" />}
                              {title}
                            </p>
                            {def.kind === "content" && !item.published && <p className="text-xs text-muted">Hidden</p>}
                          </div>
                        </div>
                      </td>
                      {columns.map((c) => (
                        <td key={c.name} className="hidden max-w-56 px-4 py-3 text-ink/80 md:table-cell">
                          {cell(c, item)}
                        </td>
                      ))}
                      <td className="hidden whitespace-nowrap px-4 py-3 text-muted lg:table-cell">
                        {relativeTime(String(def.kind === "inbox" ? item.created_at : item.updated_at))}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-0.5">
                          {def.kind === "content" && (
                            <button
                              type="button"
                              onClick={() => togglePublished(item)}
                              className="flex size-8 items-center justify-center text-muted hover:bg-paper hover:text-ink"
                              title={item.published ? "Hide from website" : "Publish"}
                            >
                              {item.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                            </button>
                          )}
                          {PUBLIC_PATH[def.key] && item.published && (
                            <a href={`${PUBLIC_PATH[def.key]}${item.slug ?? item.id}`} target="_blank" className="hidden h-8 items-center px-2 text-xs font-medium text-blue hover:bg-paper sm:flex">
                              View
                            </a>
                          )}
                          <button type="button" onClick={() => remove(item)} className="flex size-8 items-center justify-center text-muted hover:bg-paper hover:text-danger" title="Delete">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && data.items.length > 0 && <p className="border-t border-line px-4 py-3 text-xs text-muted">{data.total} total</p>}
      </Panel>
    </>
  );
}
