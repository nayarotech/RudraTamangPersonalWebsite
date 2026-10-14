"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Copy, CopyPlus, ExternalLink, FileText, Loader2, Plus, Trash2, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Badge, PageTitle, Panel } from "@/components/admin/UI";
import { adm, relativeTime } from "@/lib/admin";
import { publicLink, statusLabel, type Survey } from "@/lib/survey";

type Row = Omit<Survey, "questions" | "one_per_device"> & {
  responses: number;
  today: number;
  last_response_at: string | null;
  question_count: number;
};

interface Template {
  key: string;
  name: string;
  description: string;
  count: number;
}

export default function SurveysPage() {
  const router = useRouter();
  const { toast } = useAdmin();
  const [items, setItems] = useState<Row[] | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState("");
  const [version, setVersion] = useState(0);

  useEffect(() => {
    adm<{ items: Row[] }>("/admin/surveys").then((d) => setItems(d.items));
  }, [version]);
  useEffect(() => {
    adm<{ items: Template[] }>("/admin/survey-templates").then((d) => setTemplates(d.items));
  }, []);

  async function create(template: string) {
    setCreating(template);
    try {
      const s = await adm<Survey>("/admin/surveys", { method: "POST", json: { template } });
      router.push(`/admin/surveys/${s.id}`);
    } catch (e) {
      toast((e as Error).message, "error");
      setCreating("");
    }
  }
  async function duplicate(s: Row) {
    await adm(`/admin/surveys/${s.id}/duplicate`, { method: "POST" });
    toast("Survey duplicated as a draft");
    setVersion((v) => v + 1);
  }
  async function remove(s: Row) {
    if (!confirm(`Delete “${s.title}” and all ${s.responses} responses? This can't be undone.`)) return;
    await adm(`/admin/surveys/${s.id}`, { method: "DELETE" });
    toast("Survey deleted");
    setVersion((v) => v + 1);
  }
  async function copy(s: Row) {
    await navigator.clipboard.writeText(publicLink(s.slug));
    toast("Link copied");
  }

  const totals = items?.reduce((a, s) => ({ responses: a.responses + s.responses, today: a.today + s.today, open: a.open + (statusLabel(s) === "Open" ? 1 : 0) }), { responses: 0, today: 0, open: 0 });

  return (
    <>
      <PageTitle
        title="Surveys"
        description="Build a form, share the link, and watch the answers come in."
        actions={
          <button type="button" onClick={() => setPicking(true)} className="btn btn-primary h-10 text-sm">
            <Plus className="size-4" /> New survey
          </button>
        }
      />

      {totals && items!.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Open surveys", totals.open],
            ["Total responses", totals.responses],
            ["Responses in last 24h", totals.today],
          ].map(([label, value]) => (
            <div key={label} className="border border-line bg-white px-5 py-4">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-1 font-serif text-4xl leading-none">{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <Panel>
        {!items && <p className="p-10 text-center text-sm text-muted">Loading…</p>}
        {items?.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-2xl">No surveys yet</p>
            <p className="mt-2 text-sm text-muted">Start from a ready-made template or a blank form.</p>
            <button type="button" onClick={() => setPicking(true)} className="btn btn-primary mt-6 h-10 text-sm">
              <Plus className="size-4" /> Create your first survey
            </button>
          </div>
        )}
        {!!items?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-semibold">Survey</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 text-right font-semibold">Responses</th>
                  <th className="hidden px-3 py-3 font-semibold md:table-cell">Last response</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0 hover:bg-[#f8faff]">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/surveys/${s.id}`} className="font-medium hover:text-blue">
                        {s.title}
                      </Link>
                      <span className="block text-xs text-muted">
                        {s.question_count} questions · /survey/{s.slug}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <Badge>{statusLabel(s)}</Badge>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <Link href={`/admin/surveys/${s.id}?tab=analysis`} className="font-serif text-xl hover:text-blue">
                        {s.responses.toLocaleString()}
                      </Link>
                      {s.today > 0 && <span className="block text-[11px] text-success">+{s.today} today</span>}
                    </td>
                    <td className="hidden px-3 py-3.5 text-muted md:table-cell">{s.last_response_at ? relativeTime(s.last_response_at) : "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1 text-muted">
                        {s.status !== "draft" && (
                          <>
                            <IconBtn label="Copy link" onClick={() => copy(s)} icon={Copy} />
                            <a href={`/survey/${s.slug}`} target="_blank" className="p-2 hover:text-blue" title="Open form">
                              <ExternalLink className="size-4" />
                            </a>
                          </>
                        )}
                        <IconBtn label="Duplicate" onClick={() => duplicate(s)} icon={CopyPlus} />
                        <IconBtn label="Delete" onClick={() => remove(s)} icon={Trash2} danger />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {picking && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-4 md:items-center" onClick={() => !creating && setPicking(false)}>
          <div className="reveal w-full max-w-3xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="font-serif text-2xl">Start a new survey</h2>
                <p className="text-sm text-muted">Pick a template — every question can be edited afterwards.</p>
              </div>
              <button type="button" onClick={() => setPicking(false)} className="p-2 text-muted hover:text-ink" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {templates.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  disabled={!!creating}
                  onClick={() => create(t.key)}
                  className="group flex gap-4 border border-line p-4 text-left transition-colors hover:border-blue disabled:opacity-60"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center bg-blue-soft text-blue">
                    {creating === t.key ? <Loader2 className="size-4 animate-spin" /> : t.key === "blank" ? <Plus className="size-4" /> : <FileText className="size-4" />}
                  </span>
                  <span>
                    <span className="block font-semibold group-hover:text-blue">{t.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-muted">{t.description}</span>
                    {t.key !== "blank" && <span className="mt-2 block text-xs text-muted">{t.count} questions · in Nepali</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconBtn({ label, onClick, icon: I, danger }: { label: string; onClick: () => void; icon: typeof Copy; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={danger ? "p-2 hover:text-danger" : "p-2 hover:text-blue"}>
      <I className="size-4" />
    </button>
  );
}
