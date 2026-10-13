"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { FormFields, type EditLang, type Values } from "@/components/admin/Fields";
import { Badge, LangSwitch, Panel } from "@/components/admin/UI";
import { AdminError, adm, relativeTime } from "@/lib/admin";
import type { Item } from "@/lib/types";

const PUBLIC_PATH: Record<string, string> = { achievements: "/work/", posts: "/news/", albums: "/gallery/" };

export default function EditItem() {
  const { collection, id } = useParams<{ collection: string; id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const { schema, toast, refreshUnread } = useAdmin();
  const def = schema.collections.find((c) => c.key === collection);

  const [values, setValues] = useState<Values>({ published: true });
  const [loaded, setLoaded] = useState<Item | null>(null);
  const [lang, setLang] = useState<EditLang>("np");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isNew || !def) return;
    adm<Item>(`/admin/c/${def.key}/${id}`).then((item) => {
      setValues(item);
      setLoaded(item);
      // Opening an unread message marks it as read.
      if (def.key === "messages" && item.status === "New") {
        adm(`/admin/c/messages/${id}`, { method: "PUT", json: { status: "Read" } }).then(() => {
          setValues((v) => ({ ...v, status: "Read" }));
          refreshUnread();
        });
      }
    });
  }, [def, id, isNew, refreshUnread]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!def) return <p>Unknown section.</p>;
  if (!isNew && !loaded) return <p className="text-sm text-muted">Loading…</p>;

  const hasLocalized = def.fields.some((f) => f.localized);
  const title = String(values[def.titleField] || values[`${def.titleField}_np`] || "") || (isNew ? `New ${def.singular.toLowerCase()}` : `#${id}`);

  async function save(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const saved = await adm<Item>(isNew ? `/admin/c/${def!.key}` : `/admin/c/${def!.key}/${id}`, {
        method: isNew ? "POST" : "PUT",
        json: values,
      });
      setDirty(false);
      toast("Saved");
      refreshUnread();
      if (isNew) router.replace(`/admin/c/${def!.key}/${saved.id}`);
      else {
        setValues(saved);
        setLoaded(saved);
      }
    } catch (err) {
      if (err instanceof AdminError && Object.keys(err.fields).length) {
        setErrors(err.fields);
        if (Object.keys(err.fields).some((k) => !k.endsWith("_np"))) setLang("en");
      }
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this permanently?")) return;
    await adm(`/admin/c/${def!.key}/${id}`, { method: "DELETE" });
    toast("Deleted");
    refreshUnread();
    router.replace(`/admin/c/${def!.key}`);
  }

  // Inbox items: submitted fields are read-only context; status and notes are editable.
  const editable = def.kind === "inbox" ? def.fields.filter((f) => ["status", "response", "internal_note"].includes(f.name)) : def.fields;
  const readonly = def.kind === "inbox" ? def.fields.filter((f) => !editable.includes(f)) : [];

  return (
    <form onSubmit={save} className="pb-24">
      <Link href={`/admin/c/${def.key}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> {def.label}
      </Link>
      <div className="mb-8 mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="line-clamp-2 font-serif text-[2rem] leading-tight">{title}</h1>
        {hasLocalized && def.kind === "content" && <LangSwitch lang={lang} onChange={setLang} />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {readonly.length > 0 && (
            <Panel title="Submitted by visitor">
              <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">
                {readonly.map((f) => {
                  const v = values[f.name];
                  if (v === null || v === undefined || v === "") return null;
                  const wide = f.type === "textarea";
                  return (
                    <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{f.label}</dt>
                      <dd className="mt-1 whitespace-pre-line text-[15px]">
                        {f.type === "file" ? (
                          <a href={String(v)} target="_blank" rel="noreferrer" className="text-blue underline">
                            Open attachment
                          </a>
                        ) : f.type === "email" ? (
                          <a href={`mailto:${v}`} className="text-blue">
                            {String(v)}
                          </a>
                        ) : f.name === "phone" ? (
                          <a href={`tel:${v}`} className="text-blue">
                            {String(v)}
                          </a>
                        ) : (
                          String(v)
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Panel>
          )}
          <Panel title={def.kind === "inbox" ? "Follow-up" : undefined}>
            <div className="p-5 md:p-7">
              <FormFields
                fields={editable}
                values={values}
                lang={lang}
                errors={errors}
                onChange={(k, v) => {
                  setValues((prev) => ({ ...prev, [k]: v }));
                  setDirty(true);
                }}
              />
            </div>
          </Panel>
        </div>

        <aside className="space-y-4">
          <Panel title="Publish">
            <div className="space-y-4 p-5 text-sm">
              {def.kind === "content" && (
                <label className="flex cursor-pointer items-center justify-between">
                  <span>Visible on website</span>
                  <input
                    type="checkbox"
                    checked={Boolean(values.published)}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, published: e.target.checked }));
                      setDirty(true);
                    }}
                    className="size-4 accent-[var(--color-blue)]"
                  />
                </label>
              )}
              {def.slugFrom && !isNew && (
                <div>
                  <label htmlFor="slug" className="text-xs font-semibold text-muted">
                    URL slug
                  </label>
                  <input
                    id="slug"
                    value={String(values.slug ?? "")}
                    onChange={(e) => {
                      setValues((v) => ({ ...v, slug: e.target.value }));
                      setDirty(true);
                    }}
                    className="field mt-1 py-2 font-mono text-xs"
                  />
                </div>
              )}
              {loaded && (
                <dl className="space-y-1.5 text-[13px] text-muted">
                  <div className="flex justify-between">
                    <dt>Created</dt>
                    <dd>{relativeTime(String(loaded.created_at))}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Updated</dt>
                    <dd>{relativeTime(String(loaded.updated_at))}</dd>
                  </div>
                  {def.kind === "inbox" && typeof loaded.status === "string" && (
                    <div className="flex justify-between">
                      <dt>Status</dt>
                      <dd>
                        <Badge>{loaded.status}</Badge>
                      </dd>
                    </div>
                  )}
                </dl>
              )}
              {loaded && PUBLIC_PATH[def.key] && loaded.published && (
                <a href={`${PUBLIC_PATH[def.key]}${loaded.slug ?? loaded.id}`} target="_blank" className="inline-flex items-center gap-1.5 font-medium text-blue">
                  View on website <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </Panel>
          {hasLocalized && def.kind === "content" && (
            <p className="px-1 text-[12.5px] leading-relaxed text-muted">
              Switch between <b>नेपाली</b> and <b>English</b> at the top. The site shows Nepali by default and falls back to English wherever Nepali is left empty.
            </p>
          )}
          {!isNew && (
            <button type="button" onClick={remove} className="inline-flex items-center gap-2 px-1 text-sm text-danger hover:underline">
              <Trash2 className="size-4" /> Delete
            </button>
          )}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-8">
          {dirty && <span className="mr-auto text-sm text-warn">Unsaved changes</span>}
          <Link href={`/admin/c/${def.key}`} className="btn btn-outline h-10">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn btn-primary h-10 min-w-28 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} {isNew ? "Create" : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
