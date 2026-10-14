"use client";

import { useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Copy,
  Hash,
  Heading,
  Mail,
  Phone,
  Plus,
  SlidersHorizontal,
  Star,
  Trash2,
  Type,
  X,
  type LucideIcon,
} from "lucide-react";
import { type Question, type QuestionType, type Survey, CHOICE, TYPE_META, blankQuestion, scaleRange } from "@/lib/survey";
import { cn } from "@/lib/utils";

export const TYPE_ICON: Record<QuestionType, LucideIcon> = {
  short: Type,
  long: AlignLeft,
  single: CircleDot,
  multi: CheckSquare,
  dropdown: ChevronDown,
  rating: Star,
  scale: SlidersHorizontal,
  number: Hash,
  date: Calendar,
  email: Mail,
  phone: Phone,
  section: Heading,
};

const ORDER: QuestionType[] = ["single", "multi", "dropdown", "short", "long", "rating", "scale", "number", "date", "phone", "email", "section"];

export function Builder({ survey, onChange, hasResponses }: { survey: Survey; onChange: (s: Survey) => void; hasResponses: boolean }) {
  const [active, setActive] = useState<string | null>(survey.questions[0]?.id ?? null);
  const [adding, setAdding] = useState<number | null>(null);
  const qs = survey.questions;

  const setQuestions = (questions: Question[]) => onChange({ ...survey, questions });
  const update = (i: number, patch: Partial<Question>) => setQuestions(qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  function insert(at: number, type: QuestionType) {
    const q = blankQuestion(type);
    setQuestions([...qs.slice(0, at), q, ...qs.slice(at)]);
    setActive(q.id);
    setAdding(null);
    setTimeout(() => document.getElementById(`title-${q.id}`)?.focus(), 30);
  }
  function move(i: number, d: number) {
    const next = [...qs];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    setQuestions(next);
  }
  function duplicate(i: number) {
    const copy = { ...qs[i], id: Math.random().toString(36).slice(2, 10), options: qs[i].options ? [...qs[i].options!] : undefined };
    setQuestions([...qs.slice(0, i + 1), copy, ...qs.slice(i + 1)]);
    setActive(copy.id);
  }
  function remove(i: number) {
    if (hasResponses && qs[i].type !== "section" && !confirm("Responses already include answers to this question. Delete it anyway? Its answers will no longer appear in the analysis.")) return;
    setQuestions(qs.filter((_, j) => j !== i));
  }

  let number = 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-t-4 border-blue bg-white p-5 md:p-7">
        <input
          className="w-full border-b border-transparent bg-transparent pb-1 font-serif text-[1.9rem] leading-tight outline-none focus:border-blue"
          value={survey.title}
          onChange={(e) => onChange({ ...survey, title: e.target.value })}
          placeholder="Survey title"
          aria-label="Survey title"
        />
        <textarea
          className="mt-3 w-full resize-y border-b border-transparent bg-transparent text-[15px] text-muted outline-none focus:border-blue"
          rows={Math.max(2, (survey.description ?? "").split("\n").length)}
          value={survey.description ?? ""}
          onChange={(e) => onChange({ ...survey, description: e.target.value })}
          placeholder="Intro shown at the top of the form: what it's for, how long it takes, whether answers are anonymous."
          aria-label="Description"
        />
      </div>

      <div className="mt-3 space-y-3">
        {qs.map((q, i) => {
          if (q.type !== "section") number++;
          const isActive = active === q.id;
          return (
            <div key={q.id}>
              <div
                onClick={() => !isActive && setActive(q.id)}
                className={cn(
                  "border bg-white transition-colors",
                  isActive ? "border-blue shadow-[inset_4px_0_0_var(--color-blue)]" : "cursor-pointer border-line hover:border-[#c4cfe2]",
                  q.type === "section" && !isActive && "bg-paper",
                )}
              >
                {isActive ? (
                  <Editor q={q} index={i} onChange={(p) => update(i, p)} />
                ) : (
                  <Summary q={q} n={number} />
                )}
                {isActive && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-2.5">
                    {q.type !== "section" ? (
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="checkbox" checked={!!q.required} onChange={(e) => update(i, { required: e.target.checked })} className="size-4 accent-[var(--color-blue)]" />
                        Required
                      </label>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-0.5 text-muted">
                      <Tool label="Move up" icon={ArrowUp} disabled={i === 0} onClick={() => move(i, -1)} />
                      <Tool label="Move down" icon={ArrowDown} disabled={i === qs.length - 1} onClick={() => move(i, 1)} />
                      <Tool label="Duplicate" icon={Copy} onClick={() => duplicate(i)} />
                      <Tool label="Delete" icon={Trash2} onClick={() => remove(i)} danger />
                    </div>
                  </div>
                )}
              </div>
              {isActive && <AddBar open={adding === i + 1} onToggle={() => setAdding(adding === i + 1 ? null : i + 1)} onPick={(t) => insert(i + 1, t)} />}
            </div>
          );
        })}
      </div>

      {(active === null || qs[qs.length - 1]?.id !== active) && (
        <AddBar open={adding === qs.length} onToggle={() => setAdding(adding === qs.length ? null : qs.length)} onPick={(t) => insert(qs.length, t)} big />
      )}
    </div>
  );
}

function AddBar({ open, onToggle, onPick, big }: { open: boolean; onToggle: () => void; onPick: (t: QuestionType) => void; big?: boolean }) {
  return (
    <div className={cn(big ? "mt-4" : "my-2")}>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-center gap-2 border border-dashed text-sm font-medium transition-colors",
          big ? "py-4" : "py-2",
          open ? "border-blue bg-blue-soft text-blue" : "border-line text-muted hover:border-blue hover:text-blue",
        )}
      >
        {open ? <X className="size-4" /> : <Plus className="size-4" />} {open ? "Cancel" : "Add question"}
      </button>
      {open && (
        <div className="reveal grid grid-cols-2 gap-px border border-t-0 border-line bg-line sm:grid-cols-3">
          {ORDER.map((t) => {
            const I = TYPE_ICON[t];
            return (
              <button key={t} type="button" onClick={() => onPick(t)} className="flex items-start gap-3 bg-white px-4 py-3 text-left hover:bg-[#f8faff]">
                <I className="mt-0.5 size-4 shrink-0 text-blue" />
                <span>
                  <span className="block text-sm font-medium">{TYPE_META[t].label}</span>
                  <span className="block text-xs text-muted">{TYPE_META[t].hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Tool({ label, icon: I, onClick, disabled, danger }: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick} className={cn("p-2 disabled:opacity-30", danger ? "hover:text-danger" : "hover:text-blue")}>
      <I className="size-4" />
    </button>
  );
}

function Summary({ q, n }: { q: Question; n: number }) {
  const I = TYPE_ICON[q.type];
  if (q.type === "section") {
    return (
      <div className="px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Section</p>
        <p className="font-serif text-xl">{q.title || <span className="text-muted">Untitled section</span>}</p>
      </div>
    );
  }
  const opts = q.options ?? [];
  return (
    <div className="flex gap-4 px-5 py-4">
      <span className="w-6 shrink-0 pt-0.5 text-right font-serif text-lg text-muted">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {q.title || <span className="text-muted">Untitled question</span>}
          {q.required && <span className="ml-1 text-danger">*</span>}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
          <I className="size-3.5" /> {TYPE_META[q.type].label}
          {CHOICE.has(q.type) && ` · ${opts.length} option${opts.length === 1 ? "" : "s"}${q.allowOther ? " + Other" : ""}`}
          {(q.type === "rating" || q.type === "scale") && ` · ${scaleRange(q).min}–${scaleRange(q).max}`}
        </p>
      </div>
    </div>
  );
}

function Editor({ q, index, onChange }: { q: Question; index: number; onChange: (p: Partial<Question>) => void }) {
  function changeType(type: QuestionType) {
    const patch: Partial<Question> = { type };
    if (CHOICE.has(type) && !(q.options ?? []).length) patch.options = ["Option 1", "Option 2"];
    if (type === "rating") patch.max = Math.min(Math.max(q.max ?? 5, 3), 10);
    if (type === "scale") {
      patch.min = q.min === 0 ? 0 : 1;
      patch.max = q.max ?? 10;
    }
    onChange(patch);
  }

  return (
    <div className="space-y-4 p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={`title-${q.id}`}
          className={cn("field flex-1", q.type === "section" && "font-serif text-lg")}
          value={q.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder={q.type === "section" ? "Section heading" : `Question ${index + 1}`}
        />
        <select className="field sm:w-52" value={q.type} onChange={(e) => changeType(e.target.value as QuestionType)} aria-label="Question type">
          {ORDER.map((t) => (
            <option key={t} value={t}>
              {TYPE_META[t].label}
            </option>
          ))}
        </select>
      </div>
      <input className="field py-2 text-sm" value={q.help ?? ""} onChange={(e) => onChange({ help: e.target.value })} placeholder="Help text (optional)" />

      {CHOICE.has(q.type) && <OptionsEditor q={q} onChange={onChange} />}

      {q.type === "rating" && (
        <label className="flex items-center gap-3 text-sm">
          Number of stars
          <select className="field w-24 py-2" value={scaleRange(q).max} onChange={(e) => onChange({ max: Number(e.target.value) })}>
            {[3, 4, 5, 6, 7, 10].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      )}

      {q.type === "scale" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            From
            <select className="field w-20 py-2" value={scaleRange(q).min} onChange={(e) => onChange({ min: Number(e.target.value) })}>
              <option>0</option>
              <option>1</option>
            </select>
            to
            <select className="field w-20 py-2" value={scaleRange(q).max} onChange={(e) => onChange({ max: Number(e.target.value) })}>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div />
          <input className="field py-2 text-sm" value={q.minLabel ?? ""} onChange={(e) => onChange({ minLabel: e.target.value })} placeholder={`Label for ${scaleRange(q).min} (optional)`} />
          <input className="field py-2 text-sm" value={q.maxLabel ?? ""} onChange={(e) => onChange({ maxLabel: e.target.value })} placeholder={`Label for ${scaleRange(q).max} (optional)`} />
        </div>
      )}
      {q.type === "rating" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="field py-2 text-sm" value={q.minLabel ?? ""} onChange={(e) => onChange({ minLabel: e.target.value })} placeholder="Label under 1 star (optional)" />
          <input className="field py-2 text-sm" value={q.maxLabel ?? ""} onChange={(e) => onChange({ maxLabel: e.target.value })} placeholder="Label under top rating (optional)" />
        </div>
      )}

      {q.type === "number" && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          Allowed range
          <input type="number" className="field w-28 py-2" value={q.min ?? ""} placeholder="min" onChange={(e) => onChange({ min: e.target.value === "" ? undefined : Number(e.target.value) })} />
          to
          <input type="number" className="field w-28 py-2" value={q.max ?? ""} placeholder="max" onChange={(e) => onChange({ max: e.target.value === "" ? undefined : Number(e.target.value) })} />
        </div>
      )}
    </div>
  );
}

function OptionsEditor({ q, onChange }: { q: Question; onChange: (p: Partial<Question>) => void }) {
  const options = q.options ?? [];
  const [bulk, setBulk] = useState<string | null>(null);
  const set = (next: string[]) => onChange({ options: next });
  const Mark = q.type === "multi" ? "rounded-sm" : q.type === "dropdown" ? "" : "rounded-full";
  const dupes = new Set(options.filter((o, i) => o.trim() && options.findIndex((x) => x.trim() === o.trim()) !== i));

  if (bulk !== null) {
    return (
      <div>
        <textarea className="field font-mono text-sm" rows={Math.max(5, bulk.split("\n").length + 1)} value={bulk} onChange={(e) => setBulk(e.target.value)} autoFocus />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="btn btn-primary h-9 text-sm"
            onClick={() => {
              set(bulk.split("\n").map((s) => s.trim()).filter(Boolean));
              setBulk(null);
            }}
          >
            Use these options
          </button>
          <button type="button" className="h-9 px-3 text-sm text-muted hover:text-ink" onClick={() => setBulk(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-1.5">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-3">
            {q.type === "dropdown" ? (
              <span className="w-4 text-right text-xs text-muted">{i + 1}.</span>
            ) : (
              <span className={cn("size-4 shrink-0 border-2 border-[#c4cfe2]", Mark)} />
            )}
            <input
              className={cn("field flex-1 py-2", dupes.has(o) && "border-warn")}
              value={o}
              onChange={(e) => set(options.map((x, j) => (j === i ? e.target.value : x)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const row = e.currentTarget.parentElement;
                  set([...options.slice(0, i + 1), "", ...options.slice(i + 1)]);
                  setTimeout(() => row?.nextElementSibling?.querySelector("input")?.focus(), 20);
                }
              }}
              aria-label={`Option ${i + 1}`}
            />
            <button type="button" onClick={() => set(options.filter((_, j) => j !== i))} className="p-1.5 text-muted hover:text-danger" aria-label="Remove option">
              <X className="size-4" />
            </button>
          </div>
        ))}
        {q.allowOther && (
          <div className="flex items-center gap-3">
            <span className={cn("size-4 shrink-0 border-2 border-[#c4cfe2]", q.type === "dropdown" ? "invisible" : Mark)} />
            <span className="flex-1 border-b border-dashed border-line py-2 text-sm text-muted">Other… (people type their own answer)</span>
            <button type="button" onClick={() => onChange({ allowOther: false })} className="p-1.5 text-muted hover:text-danger" aria-label="Remove Other">
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
      {dupes.size > 0 && <p className="mt-2 text-xs text-warn">Two options have the same text — their answers will be counted together.</p>}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <button type="button" onClick={() => set([...options, `Option ${options.length + 1}`])} className="font-medium text-blue hover:text-navy">
          + Add option
        </button>
        {!q.allowOther && (
          <button type="button" onClick={() => onChange({ allowOther: true })} className="font-medium text-blue hover:text-navy">
            + Add “Other”
          </button>
        )}
        <button type="button" onClick={() => setBulk(options.join("\n"))} className="text-muted hover:text-ink">
          Paste a list
        </button>
      </div>
    </div>
  );
}
