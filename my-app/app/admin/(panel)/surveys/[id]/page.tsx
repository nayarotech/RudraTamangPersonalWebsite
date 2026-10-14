"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, ExternalLink, Loader2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Badge } from "@/components/admin/UI";
import { Analysis } from "@/components/admin/survey/Analysis";
import { Builder } from "@/components/admin/survey/Builder";
import { Responses } from "@/components/admin/survey/Responses";
import { Share } from "@/components/admin/survey/Share";
import { SurveyForm } from "@/components/survey/SurveyForm";
import { adm } from "@/lib/admin";
import { statusLabel, type Survey, type SurveyResponse } from "@/lib/survey";
import { cn } from "@/lib/utils";

const TABS = [
  ["questions", "Questions"],
  ["preview", "Preview"],
  ["share", "Share & settings"],
  ["responses", "Responses"],
  ["analysis", "Analysis"],
] as const;
type Tab = (typeof TABS)[number][0];

export default function SurveyEditorPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}

function Editor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useAdmin();
  const tab = (TABS.find(([k]) => k === params.get("tab"))?.[0] ?? "questions") as Tab;

  const [saved, setSaved] = useState<Survey | null>(null);
  const [draft, setDraft] = useState<Survey | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [responses, setResponses] = useState<SurveyResponse[] | null>(null);
  const [loadedAt, setLoadedAt] = useState(0);

  useEffect(() => {
    adm<Survey>(`/admin/surveys/${id}`)
      .then((s) => {
        setSaved(s);
        setDraft(s);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const loadResponses = useCallback(() => {
    return adm<{ items: SurveyResponse[] }>(`/admin/surveys/${id}/responses`).then((d) => {
      setResponses(d.items);
      setLoadedAt(Date.now());
    });
  }, [id]);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  // Keep the analysis live while the tab is open.
  useEffect(() => {
    if (tab !== "analysis" && tab !== "responses") return;
    const t = setInterval(() => document.visibilityState === "visible" && loadResponses(), 30_000);
    return () => clearInterval(t);
  }, [tab, loadResponses]);

  const dirty = !!draft && !!saved && JSON.stringify(strip(draft)) !== JSON.stringify(strip(saved));

  const save = useCallback(
    async (patch: Partial<Survey> = {}) => {
      if (!draft) return;
      setSaving(true);
      try {
        const next = await adm<Survey>(`/admin/surveys/${id}`, { method: "PUT", json: { ...draft, ...patch } });
        setSaved(next);
        setDraft(next);
        toast(patch.status === "open" ? "Survey is live — share the link!" : patch.status === "closed" ? "Survey closed" : "Saved");
        return next;
      } catch (e) {
        toast((e as Error).message, "error");
      } finally {
        setSaving(false);
      }
    },
    [draft, id, toast],
  );

  // Ctrl/Cmd+S saves; warn before leaving with unsaved edits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [dirty, save]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!draft || !saved) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-6 animate-spin text-blue" />
      </div>
    );
  }

  const setTab = (t: Tab) => router.replace(`/admin/surveys/${id}${t === "questions" ? "" : `?tab=${t}`}`, { scroll: false });
  const status = statusLabel(saved);
  const count = responses?.length ?? 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link href="/admin/surveys" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-3.5" /> All surveys
          </Link>
          <h1 className="mt-2 truncate font-serif text-[2rem] leading-tight">{saved.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
            <Badge>{status}</Badge>
            <span>
              {count.toLocaleString()} response{count === 1 ? "" : "s"}
            </span>
            {saved.status !== "draft" && (
              <a href={`/survey/${saved.slug}`} target="_blank" className="inline-flex items-center gap-1 text-blue hover:text-navy">
                /survey/{saved.slug} <ExternalLink className="size-3" />
              </a>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save()}
            disabled={!dirty || saving}
            className="btn btn-outline h-10 text-sm disabled:border-line disabled:text-muted disabled:hover:bg-transparent"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : dirty ? null : <Check className="size-4" />}
            {dirty ? "Save changes" : "Saved"}
          </button>
          {saved.status === "draft" || status === "Closed" ? (
            <button type="button" onClick={() => save({ status: "open" }).then((s) => s && setTab("share"))} disabled={saving} className="btn btn-primary h-10 text-sm">
              {saved.status === "draft" ? "Publish & get link" : "Reopen"}
            </button>
          ) : (
            <button type="button" onClick={() => confirm("Stop accepting responses?") && save({ status: "closed" })} disabled={saving} className="btn btn-outline h-10 text-sm">
              Close survey
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === k ? "border-blue text-blue" : "border-transparent text-muted hover:text-ink",
            )}
          >
            {label}
            {k === "responses" && count > 0 && <span className="ml-1.5 rounded-full bg-blue-soft px-1.5 py-px text-[11px] text-blue">{count}</span>}
          </button>
        ))}
      </div>

      {tab === "questions" && <Builder survey={draft} onChange={setDraft} hasResponses={count > 0} />}
      {tab === "preview" && (
        <div className="mx-auto max-w-3xl bg-paper p-4 md:p-8">
          <header className="border-t-4 border-blue bg-white px-5 py-8 md:px-10">
            <h2 className="display text-[2rem] md:text-[2.5rem]">{draft.title}</h2>
            {draft.description && <p className="mt-3 whitespace-pre-line text-muted">{draft.description}</p>}
          </header>
          <div className="mt-4">
            <SurveyForm key={JSON.stringify(draft.questions)} survey={draft} lang="np" preview />
          </div>
        </div>
      )}
      {tab === "share" && <Share survey={draft} saved={saved} onChange={setDraft} />}
      {tab === "responses" && <Responses survey={saved} responses={responses} reload={loadResponses} />}
      {tab === "analysis" && <Analysis survey={saved} responses={responses} now={loadedAt} reload={loadResponses} />}
    </>
  );
}

/** Fields the server computes; ignored when deciding if there are unsaved edits. */
const COMPUTED = new Set(["accepting", "updated_at", "created_at"]);
function strip(s: Survey) {
  return Object.fromEntries(Object.entries(s).filter(([k]) => !COMPUTED.has(k)));
}
