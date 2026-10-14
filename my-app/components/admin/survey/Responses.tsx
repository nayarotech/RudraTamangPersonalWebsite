"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Download, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Panel } from "@/components/admin/UI";
import { adm, relativeTime } from "@/lib/admin";
import { type Survey, type SurveyResponse, formatAnswer, formatDuration, isEmpty, parseTs } from "@/lib/survey";

const PAGE = 50;

export function Responses({ survey, responses, reload }: { survey: Survey; responses: SurveyResponse[] | null; reload: () => Promise<void> }) {
  const { toast } = useAdmin();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const questions = survey.questions.filter((x) => x.type !== "section");
  const cols = questions.slice(0, 4);

  const filtered = useMemo(() => {
    if (!responses) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return responses;
    return responses.filter((r) => Object.values(r.answers).some((v) => formatAnswer(v).toLowerCase().includes(needle)) || String(r.id) === needle);
  }, [responses, q]);

  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE);
  const current = open === null ? null : filtered.findIndex((r) => r.id === open);
  const detail = current !== null && current >= 0 ? filtered[current] : null;

  async function remove(r: SurveyResponse) {
    if (!confirm(`Delete response #${r.id}? This can't be undone.`)) return;
    await adm(`/admin/surveys/${survey.id}/responses/${r.id}`, { method: "DELETE" });
    toast("Response deleted");
    setOpen(null);
    reload();
  }
  async function clearAll() {
    if (!responses?.length) return;
    const typed = prompt(`This deletes all ${responses.length} responses permanently. Type DELETE to confirm.`);
    if (typed !== "DELETE") return;
    await adm(`/admin/surveys/${survey.id}/responses`, { method: "DELETE" });
    toast("All responses deleted");
    reload();
  }
  async function refresh() {
    setRefreshing(true);
    await reload().finally(() => setRefreshing(false));
  }

  if (!responses) return <p className="py-16 text-center text-sm text-muted">Loading responses…</p>;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            className="field py-2 pl-9 text-sm"
            placeholder="Search answers…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={refresh} className="btn btn-outline h-9 text-sm">
            <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} /> Refresh
          </button>
          <a href={`/api/admin/surveys/${survey.id}/export.csv`} className="btn btn-outline h-9 text-sm">
            <Download className="size-4" /> Export CSV (Excel)
          </a>
          {responses.length > 0 && (
            <button type="button" onClick={clearAll} className="h-9 px-3 text-sm text-muted hover:text-danger">
              Delete all
            </button>
          )}
        </div>
      </div>

      <Panel>
        {responses.length === 0 ? (
          <p className="px-6 py-16 text-center text-muted">No responses yet. Share the link from the “Share &amp; settings” tab.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">Submitted</th>
                  {cols.map((c) => (
                    <th key={c.id} className="max-w-56 px-3 py-3 font-semibold">
                      <span className="line-clamp-1">{c.title}</span>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right font-semibold">Answered</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const answered = questions.filter((x) => !isEmpty(r.answers[x.id])).length;
                  return (
                    <tr key={r.id} onClick={() => setOpen(r.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-[#f8faff]">
                      <td className="px-5 py-3 font-mono text-xs text-muted">{r.id}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{relativeTime(r.created_at)}</td>
                      {cols.map((c) => (
                        <td key={c.id} className="max-w-56 px-3 py-3">
                          <span className="line-clamp-1">{formatAnswer(r.answers[c.id]) || <span className="text-muted/50">—</span>}</span>
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right text-muted">
                        {answered}/{questions.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > PAGE && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-sm text-muted">
            <span>
              {page * PAGE + 1}–{Math.min((page + 1) * PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-1">
              <button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="p-1.5 disabled:opacity-30" aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </button>
              <button type="button" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)} className="p-1.5 disabled:opacity-30" aria-label="Next page">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </Panel>

      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={() => setOpen(null)}>
          <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <p className="font-serif text-2xl">Response #{detail.id}</p>
                <p className="text-xs text-muted">
                  {parseTs(detail.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                  {detail.duration_sec != null && ` · took ${formatDuration(detail.duration_sec)}`}
                  {detail.lang && ` · ${detail.lang === "np" ? "Nepali" : "English"} page`}
                </p>
              </div>
              <div className="flex items-center text-muted">
                <button type="button" disabled={current === 0} onClick={() => setOpen(filtered[current! - 1].id)} className="p-2 hover:text-ink disabled:opacity-30" aria-label="Newer">
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" disabled={current === filtered.length - 1} onClick={() => setOpen(filtered[current! + 1].id)} className="p-2 hover:text-ink disabled:opacity-30" aria-label="Older">
                  <ChevronRight className="size-4" />
                </button>
                <button type="button" onClick={() => setOpen(null)} className="p-2 hover:text-ink" aria-label="Close">
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <dl className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {questions.map((x) => (
                <div key={x.id}>
                  <dt className="text-xs font-semibold text-muted">{x.title}</dt>
                  <dd className="mt-1 whitespace-pre-line">{formatAnswer(detail.answers[x.id]) || <span className="text-muted/50">No answer</span>}</dd>
                </div>
              ))}
            </dl>
            <div className="border-t border-line px-6 py-3">
              <button type="button" onClick={() => remove(detail)} className="inline-flex items-center gap-2 text-sm text-danger">
                <Trash2 className="size-4" /> Delete this response
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
