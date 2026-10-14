"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Filter, RefreshCw, X } from "lucide-react";
import { Panel } from "@/components/admin/UI";
import {
  CHOICE,
  NUMERIC,
  TEXT,
  type Question,
  type Survey,
  type SurveyResponse,
  TYPE_META,
  answerMatches,
  choiceCounts,
  dayKey,
  formatDuration,
  groupValues,
  histogram,
  isEmpty,
  npsSplit,
  numbersFor,
  numericStats,
  parseTs,
  pct,
  round1,
  scaleDistribution,
  scaleRange,
  topWords,
} from "@/lib/survey";
import { cn } from "@/lib/utils";
import { TYPE_ICON } from "./Builder";

// ---- Hover tooltip shared by every chart ------------------------------

type TipState = { x: number; y: number; lines: string[] } | null;
const TipCtx = createContext<(t: TipState) => void>(() => {});

/** Spread onto any mark to give it a tooltip. */
function useTip() {
  const set = useContext(TipCtx);
  return (...lines: string[]) => ({
    onMouseMove: (e: React.MouseEvent) => set({ x: e.clientX, y: e.clientY, lines }),
    onMouseLeave: () => set(null),
  });
}

function TipLayer({ tip }: { tip: TipState }) {
  if (!tip) return null;
  const left = Math.min(tip.x + 14, (typeof window !== "undefined" ? window.innerWidth : 9999) - 240);
  return (
    <div className="pointer-events-none fixed z-[90] max-w-56 bg-ink px-3 py-2 text-xs leading-relaxed text-white shadow-lg" style={{ left, top: tip.y + 14 }}>
      <p className="font-semibold">{tip.lines[0]}</p>
      {tip.lines.slice(1).map((l, i) => (
        <p key={i} className="text-white/75">
          {l}
        </p>
      ))}
    </div>
  );
}

// ---- Page ---------------------------------------------------------------

type Range = "all" | "7" | "30";
interface ActiveFilter {
  qid: string;
  value: string;
}

/** `now` is when the responses were fetched, so every chart agrees on what "today" is. */
export function Analysis({ survey, responses, now, reload }: { survey: Survey; responses: SurveyResponse[] | null; now: number; reload: () => Promise<void> }) {
  const [tip, setTip] = useState<TipState>(null);
  const [range, setRange] = useState<Range>("all");
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [sortByCount, setSortByCount] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const questions = survey.questions.filter((q) => q.type !== "section");
  const groupable = questions.filter((q) => CHOICE.has(q.type) || q.type === "rating" || q.type === "scale");

  const rows = useMemo(() => {
    if (!responses) return [];
    const since = range === "all" ? 0 : now - Number(range) * 86400_000;
    return responses.filter((r) => {
      if (since && parseTs(r.created_at).getTime() < since) return false;
      return filters.every((f) => {
        const q = questions.find((x) => x.id === f.qid);
        return q ? answerMatches(q, r, f.value) : true;
      });
    });
  }, [responses, range, filters, questions, now]);

  if (!responses) return <p className="py-16 text-center text-sm text-muted">Loading responses…</p>;
  if (responses.length === 0) {
    return (
      <Panel>
        <div className="px-6 py-16 text-center">
          <p className="font-serif text-2xl">No responses to analyse yet</p>
          <p className="mt-2 text-sm text-muted">Charts appear here as soon as the first person submits the form. This page refreshes itself every 30 seconds.</p>
        </div>
      </Panel>
    );
  }

  async function refresh() {
    setRefreshing(true);
    await reload().finally(() => setRefreshing(false));
  }
  const addFilter = (qid: string, value: string) =>
    setFilters((f) => (f.some((x) => x.qid === qid && x.value === value) ? f : [...f.filter((x) => x.qid !== qid), { qid, value }]));

  return (
    <TipCtx.Provider value={setTip}>
      {/* Filters: one row above everything they affect. */}
      <div className="sticky top-16 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-line bg-[#f4f6fa]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="inline-flex border border-line bg-white p-0.5 text-sm" role="tablist" aria-label="Date range">
          {(
            [
              ["all", "All time"],
              ["30", "30 days"],
              ["7", "7 days"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={range === k} onClick={() => setRange(k)} className={cn("px-3 py-1.5", range === k ? "bg-ink text-white" : "text-muted hover:text-ink")}>
              {label}
            </button>
          ))}
        </div>
        <AddFilter questions={groupable} responses={responses} onAdd={addFilter} />
        {filters.map((f) => {
          const q = questions.find((x) => x.id === f.qid);
          return (
            <span key={f.qid} className="inline-flex items-center gap-1.5 bg-blue px-2.5 py-1.5 text-xs font-medium text-white">
              <span className="max-w-40 truncate opacity-75">{q?.title}:</span> {f.value}
              <button type="button" onClick={() => setFilters(filters.filter((x) => x !== f))} aria-label="Remove filter">
                <X className="size-3.5" />
              </button>
            </span>
          );
        })}
        {filters.length > 1 && (
          <button type="button" onClick={() => setFilters([])} className="text-xs text-muted hover:text-ink">
            Clear all
          </button>
        )}
        <div className="ml-auto flex items-center gap-3">
          <label className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
            <input type="checkbox" checked={sortByCount} onChange={(e) => setSortByCount(e.target.checked)} className="accent-[var(--color-blue)]" />
            Sort options by count
          </label>
          <button type="button" onClick={refresh} className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink" title="Refreshes automatically every 30s">
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} /> Refresh
          </button>
        </div>
      </div>

      <Kpis now={now} all={responses} rows={rows} questions={questions} filtered={filters.length > 0 || range !== "all"} />

      {rows.length === 0 ? (
        <Panel className="mt-6">
          <p className="px-6 py-14 text-center text-muted">No responses match these filters.</p>
        </Panel>
      ) : (
        <>
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <Panel title="Responses per day" className="xl:col-span-2">
              <Timeline rows={rows} now={now} />
            </Panel>
            <Panel title="Time of day people respond">
              <Hours rows={rows} />
            </Panel>
          </div>

          <h2 className="mb-3 mt-10 font-serif text-2xl">Question by question</h2>
          <div className="grid gap-6 xl:grid-cols-2">
            {questions.map((q, i) => (
              <QuestionCard key={q.id} q={q} n={i + 1} rows={rows} sortByCount={sortByCount} onFilter={(v) => addFilter(q.id, v)} />
            ))}
          </div>

          {groupable.length >= 2 && <CrossTab questions={groupable} rows={rows} />}
        </>
      )}
      <TipLayer tip={tip} />
    </TipCtx.Provider>
  );
}

function AddFilter({ questions, responses, onAdd }: { questions: Question[]; responses: SurveyResponse[]; onAdd: (qid: string, v: string) => void }) {
  const [qid, setQid] = useState("");
  const q = questions.find((x) => x.id === qid);
  if (!questions.length) return null;
  return (
    <div className="inline-flex items-center gap-1">
      <Filter className="ml-1 size-3.5 text-muted" />
      <select className="border border-line bg-white px-2 py-1.5 text-sm" value={qid} onChange={(e) => setQid(e.target.value)} aria-label="Filter by question">
        <option value="">Filter by answer…</option>
        {questions.map((x) => (
          <option key={x.id} value={x.id}>
            {x.title.length > 50 ? x.title.slice(0, 50) + "…" : x.title}
          </option>
        ))}
      </select>
      {q && (
        <select
          className="border border-line bg-white px-2 py-1.5 text-sm"
          value=""
          autoFocus
          onChange={(e) => {
            if (e.target.value) onAdd(q.id, e.target.value);
            setQid("");
          }}
          aria-label="Answer"
        >
          <option value="">is…</option>
          {groupValues(q, responses).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

// ---- Headline numbers --------------------------------------------------

function Kpis({ now, all, rows, questions, filtered }: { now: number; all: SurveyResponse[]; rows: SurveyResponse[]; questions: Question[]; filtered: boolean }) {
  const inWindow = (r: SurveyResponse, from: number, to: number) => {
    const t = now - parseTs(r.created_at).getTime();
    return t >= from * 86400_000 && t < to * 86400_000;
  };
  const week = rows.filter((r) => inWindow(r, 0, 7)).length;
  const prevWeek = rows.filter((r) => inWindow(r, 7, 14)).length;
  const durations = rows.map((r) => r.duration_sec).filter((d): d is number => d != null && d > 0 && d < 3 * 3600);
  const medianTime = numericStats(durations)?.median;
  const completion = rows.length && questions.length ? rows.reduce((a, r) => a + questions.filter((q) => !isEmpty(r.answers[q.id])).length / questions.length, 0) / rows.length : 0;

  // Same device or same network more than once: worth a look, not proof of cheating.
  const devices = new Map<string, number>();
  for (const r of rows) if (r.device_id) devices.set(r.device_id, (devices.get(r.device_id) ?? 0) + 1);
  const repeat = [...devices.values()].filter((n) => n > 1).reduce((a, n) => a + n, 0);
  const fast = durations.filter((d) => d < Math.max(8, questions.length * 1.5)).length;

  const delta = week - prevWeek;
  const tiles = [
    { label: filtered ? "Matching responses" : "Total responses", value: rows.length.toLocaleString(), sub: filtered ? `of ${all.length.toLocaleString()} (${pct(rows.length / all.length)})` : "" },
    { label: "Last 7 days", value: week.toLocaleString(), sub: prevWeek || week ? `${delta >= 0 ? "▲" : "▼"} ${Math.abs(delta)} vs previous 7 days` : "" },
    { label: "Median time to finish", value: medianTime ? formatDuration(medianTime) : "—", sub: `${durations.length} timed` },
    { label: "Questions answered", value: pct(completion), sub: "average per response" },
    {
      label: "Same-device responses",
      value: repeat.toLocaleString(),
      sub: fast ? `${fast} finished suspiciously fast` : repeat ? "normal if volunteers canvass" : "none",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {tiles.map((t, i) => (
        <div key={t.label} className={cn("border px-5 py-4", i === 0 ? "col-span-2 border-navy bg-navy text-white lg:col-span-1" : "border-line bg-white")}>
          <p className={cn("text-sm", i === 0 ? "text-white/60" : "text-muted")}>{t.label}</p>
          <p className="mt-1 font-serif text-4xl leading-none">{t.value}</p>
          {t.sub && <p className={cn("mt-2 text-xs", i === 0 ? "text-white/60" : "text-muted")}>{t.sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ---- Time charts -------------------------------------------------------

function Columns({ data, height = 140, labelEvery = 1 }: { data: { key: string; label: string; count: number; tip: string }[]; height?: number; labelEvery?: number }) {
  const tip = useTip();
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex items-end gap-[2px] border-b border-line" style={{ height }}>
        {data.map((d) => (
          <div key={d.key} className="group flex h-full flex-1 items-end" {...tip(d.tip, `${d.count.toLocaleString()} response${d.count === 1 ? "" : "s"}`)}>
            <div
              className="w-full rounded-t-[4px] bg-blue transition-colors group-hover:bg-navy"
              style={{ height: d.count ? `${Math.max((d.count / max) * 100, 2)}%` : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px] text-[10.5px] text-muted">
        {data.map((d, i) => (
          <span key={d.key} className="flex-1 overflow-visible whitespace-nowrap text-center">
            {i % labelEvery === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function Timeline({ rows, now }: { rows: SurveyResponse[]; now: number }) {
  const counts = new Map<string, number>();
  let first = now;
  for (const r of rows) {
    const d = parseTs(r.created_at);
    first = Math.min(first, d.getTime());
    counts.set(dayKey(d), (counts.get(dayKey(d)) ?? 0) + 1);
  }
  const days = Math.min(Math.max(Math.ceil((now - first) / 86400_000) + 1, 7), 90);
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date(now - (days - 1 - i) * 86400_000);
    const k = dayKey(d);
    return {
      key: k,
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      count: counts.get(k) ?? 0,
      tip: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }),
    };
  });
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);
  return (
    <div className="p-5">
      <Columns data={data} labelEvery={Math.ceil(days / 7)} />
      {peak.count > 0 && (
        <p className="mt-3 text-xs text-muted">
          Busiest day: <b className="text-ink">{peak.tip}</b> with {peak.count} responses. {days === 90 && "Showing the last 90 days."}
        </p>
      )}
    </div>
  );
}

function Hours({ rows }: { rows: SurveyResponse[] }) {
  const counts = Array(24).fill(0) as number[];
  for (const r of rows) counts[parseTs(r.created_at).getHours()]++;
  const fmt = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
  const data = counts.map((count, h) => ({ key: String(h), label: fmt(h), count, tip: `${fmt(h)}–${fmt((h + 1) % 24)}` }));
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), data[0]);
  return (
    <div className="p-5">
      <Columns data={data} labelEvery={6} />
      <p className="mt-3 text-xs text-muted">
        Most active around <b className="text-ink">{peak.tip}</b> — a good time to post the link.
      </p>
    </div>
  );
}

// ---- Per-question cards ------------------------------------------------

function QuestionCard({ q, n, rows, sortByCount, onFilter }: { q: Question; n: number; rows: SurveyResponse[]; sortByCount: boolean; onFilter: (v: string) => void }) {
  const answered = rows.filter((r) => !isEmpty(r.answers[q.id])).length;
  const I = TYPE_ICON[q.type];
  return (
    <section className={cn("border border-line bg-white", TEXT.has(q.type) && "xl:col-span-2")}>
      <header className="border-b border-line px-5 py-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <I className="size-3.5" /> Q{n} · {TYPE_META[q.type].label}
        </p>
        <h3 className="mt-1 font-medium leading-snug">{q.title}</h3>
        <p className="mt-1 text-xs text-muted">
          {answered.toLocaleString()} answered · {(rows.length - answered).toLocaleString()} skipped
        </p>
      </header>
      <div className="p-5">
        {answered === 0 ? (
          <p className="text-sm text-muted">No answers yet.</p>
        ) : CHOICE.has(q.type) ? (
          <ChoiceChart q={q} rows={rows} sortByCount={sortByCount} onFilter={onFilter} />
        ) : q.type === "rating" || q.type === "scale" ? (
          <ScaleChart q={q} rows={rows} onFilter={onFilter} />
        ) : q.type === "number" ? (
          <NumberChart q={q} rows={rows} />
        ) : TEXT.has(q.type) ? (
          <TextAnswers q={q} rows={rows} />
        ) : q.type === "date" ? (
          <DateChart q={q} rows={rows} />
        ) : (
          <ContactList q={q} rows={rows} />
        )}
      </div>
    </section>
  );
}

function Bars({ items, onClick }: { items: { label: string; count: number; share: number; note?: string }[]; onClick?: (label: string) => void }) {
  const tip = useTip();
  const max = Math.max(...items.map((i) => i.share), 0.0001);
  return (
    <ul className="space-y-2.5">
      {items.map((it) => (
        <li key={it.label}>
          <button
            type="button"
            disabled={!onClick}
            onClick={() => onClick?.(it.label)}
            className="group block w-full text-left"
            {...tip(it.label, `${it.count.toLocaleString()} · ${pct(it.share)}${it.note ?? ""}`, ...(onClick ? ["Click to filter by this answer"] : []))}
          >
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate group-enabled:group-hover:text-blue">{it.label}</span>
              <span className="shrink-0 tabular-nums">
                <b className="font-semibold">{pct(it.share)}</b> <span className="text-xs text-muted">({it.count.toLocaleString()})</span>
              </span>
            </span>
            <span className="mt-1 block h-2.5 bg-paper">
              <span className="block h-full rounded-r-[4px] bg-blue transition-colors group-hover:bg-navy" style={{ width: `${(it.share / max) * 100}%` }} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ChoiceChart({ q, rows, sortByCount, onFilter }: { q: Question; rows: SurveyResponse[]; sortByCount: boolean; onFilter: (v: string) => void }) {
  const { items, answered, picks, otherAnswers } = choiceCounts(q, rows);
  const [showOther, setShowOther] = useState(false);
  const sorted = sortByCount ? [...items].sort((a, b) => Number(!!a.other) - Number(!!b.other) || b.count - a.count) : items;
  const top = [...items].filter((i) => !i.other).sort((a, b) => b.count - a.count)[0];
  return (
    <>
      {top && top.count > 0 && (
        <p className="mb-4 text-sm">
          <b>{pct(top.share)}</b> chose <b className="text-blue">“{top.label}”</b>
          {q.type === "multi" && <span className="text-muted"> · people picked {round1(picks / answered)} options on average</span>}
        </p>
      )}
      <Bars items={sorted} onClick={onFilter} />
      {q.type === "multi" && <p className="mt-3 text-xs text-muted">Percentages are of people who answered; they add up to more than 100% because several options can be picked.</p>}
      {otherAnswers.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <button type="button" onClick={() => setShowOther(!showOther)} className="text-xs font-medium text-blue">
            {showOther ? "Hide" : "Show"} {otherAnswers.length} “Other” answer{otherAnswers.length === 1 ? "" : "s"}
          </button>
          {showOther && (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-sm">
              {otherAnswers.map(([text, n]) => (
                <li key={text} className="flex justify-between gap-3">
                  <span>{text}</span>
                  {n > 1 && <span className="text-xs text-muted">×{n}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

function ScaleChart({ q, rows, onFilter }: { q: Question; rows: SurveyResponse[]; onFilter: (v: string) => void }) {
  const tip = useTip();
  const values = numbersFor(q, rows);
  const stats = numericStats(values)!;
  const dist = scaleDistribution(q, values);
  const { min, max } = scaleRange(q);
  const peak = Math.max(1, ...dist.map((d) => d.count));
  const nps = min === 0 && max === 10 ? npsSplit(values) : null;
  return (
    <>
      <div className="flex items-end gap-6">
        <div>
          <p className="font-serif text-5xl leading-none">{round1(stats.mean)}</p>
          <p className="mt-1 text-xs text-muted">
            average out of {max}
            {q.type === "rating" && " stars"}
          </p>
        </div>
        <div className="pb-1 text-xs text-muted">
          <p>
            Median <b className="text-ink">{round1(stats.median)}</b>
          </p>
          <p>
            Gave {max - 1}–{max} <b className="text-ink">{pct(values.filter((v) => v >= max - 1).length / values.length)}</b>
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-end gap-[2px] border-b border-line" style={{ height: 110 }}>
        {dist.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => onFilter(String(d.value))}
            className="group flex h-full flex-1 items-end"
            {...tip(`${d.value}${q.type === "rating" ? " ★" : ""}`, `${d.count} · ${pct(d.count / values.length)}`, "Click to filter")}
          >
            <span className="block w-full rounded-t-[4px] bg-blue group-hover:bg-navy" style={{ height: d.count ? `${Math.max((d.count / peak) * 100, 2)}%` : 0 }} />
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px] text-center text-xs text-muted">
        {dist.map((d) => (
          <span key={d.value} className="flex-1">
            {d.value}
          </span>
        ))}
      </div>
      {(q.minLabel || q.maxLabel) && (
        <p className="mt-1 flex justify-between text-[11px] text-muted">
          <span>{q.minLabel}</span>
          <span>{q.maxLabel}</span>
        </p>
      )}
      {nps && (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-sm">
            Net score <b className="font-serif text-2xl">{nps.score > 0 ? `+${nps.score}` : nps.score}</b>{" "}
            <span className="text-xs text-muted">(% scoring 9–10 minus % scoring 0–6, from −100 to +100)</span>
          </p>
          <div className="mt-2 flex h-2.5 gap-[2px]">
            {[
              { n: nps.low, c: "bg-danger", label: "0–6 (critics)" },
              { n: nps.mid, c: "bg-[#b9c3d6]", label: "7–8 (neutral)" },
              { n: nps.high, c: "bg-blue", label: "9–10 (strong supporters)" },
            ].map((s) =>
              s.n ? <span key={s.label} className={cn(s.c, "first:rounded-l-[4px] last:rounded-r-[4px]")} style={{ width: `${(s.n / nps.n) * 100}%` }} {...tip(s.label, `${s.n} · ${pct(s.n / nps.n)}`)} /> : null,
            )}
          </div>
          <p className="mt-2 flex flex-wrap gap-x-4 text-xs text-muted">
            <span>
              <i className="mr-1 inline-block size-2 bg-danger" />
              Critics {pct(nps.low / nps.n)}
            </span>
            <span>
              <i className="mr-1 inline-block size-2 bg-[#b9c3d6]" />
              Neutral {pct(nps.mid / nps.n)}
            </span>
            <span>
              <i className="mr-1 inline-block size-2 bg-blue" />
              Strong supporters {pct(nps.high / nps.n)}
            </span>
          </p>
        </div>
      )}
    </>
  );
}

function NumberChart({ q, rows }: { q: Question; rows: SurveyResponse[] }) {
  const tip = useTip();
  const values = numbersFor(q, rows);
  const s = numericStats(values)!;
  const bins = histogram(values);
  const peak = Math.max(1, ...bins.map((b) => b.count));
  const label = (b: { from: number; to: number }) => (b.from === b.to ? round1(b.from) : `${round1(b.from)}–${round1(b.to)}`);
  return (
    <>
      <dl className="grid grid-cols-4 gap-3 text-center">
        {[
          ["Average", s.mean],
          ["Median", s.median],
          ["Lowest", s.min],
          ["Highest", s.max],
        ].map(([k, v]) => (
          <div key={k as string} className="bg-paper py-2.5">
            <dt className="text-[11px] text-muted">{k}</dt>
            <dd className="font-serif text-2xl">{round1(v as number)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-end gap-[2px] border-b border-line" style={{ height: 100 }}>
        {bins.map((b) => (
          <div key={b.from} className="group flex h-full flex-1 items-end" {...tip(label(b), `${b.count} response${b.count === 1 ? "" : "s"}`)}>
            <span className="block w-full rounded-t-[4px] bg-blue group-hover:bg-navy" style={{ height: b.count ? `${Math.max((b.count / peak) * 100, 2)}%` : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px] text-center text-[10.5px] text-muted">
        {bins.map((b) => (
          <span key={b.from} className="flex-1 truncate">
            {label(b)}
          </span>
        ))}
      </div>
    </>
  );
}

function TextAnswers({ q, rows }: { q: Question; rows: SurveyResponse[] }) {
  const texts = rows.map((r) => r.answers[q.id]).filter((v): v is string => typeof v === "string" && v.trim() !== "");
  const words = topWords(texts);
  const [word, setWord] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(12);
  const needle = (word || search).toLowerCase();
  const shown = needle ? texts.filter((t) => t.toLowerCase().includes(needle)) : texts;
  const maxW = words[0]?.count ?? 1;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <p className="field-label">Most mentioned words</p>
        {words.length === 0 ? (
          <p className="text-sm text-muted">Not enough answers to find patterns yet.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {words.map((w) => (
              <button
                key={w.word}
                type="button"
                onClick={() => setWord(word === w.word ? "" : w.word)}
                className={cn("border px-2 py-1 transition-colors", word === w.word ? "border-blue bg-blue text-white" : "border-line hover:border-blue")}
                style={{ fontSize: `${12 + (w.count / maxW) * 6}px` }}
                title={`${w.count} answers mention “${w.word}”`}
              >
                {w.word} <span className={cn("text-[11px]", word === w.word ? "text-white/70" : "text-muted")}>{w.count}</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-muted">Click a word to read the answers that mention it.</p>
      </div>
      <div className="lg:col-span-3">
        <div className="mb-3 flex items-center gap-2">
          <input
            className="field py-2 text-sm"
            placeholder={`Search ${texts.length} answers…`}
            value={word || search}
            onChange={(e) => {
              setWord("");
              setSearch(e.target.value);
            }}
          />
          {needle && <span className="shrink-0 text-xs text-muted">{shown.length} found</span>}
        </div>
        <ul className="max-h-96 divide-y divide-line overflow-y-auto border border-line">
          {shown.slice(0, limit).map((t, i) => (
            <li key={i} className="whitespace-pre-line px-4 py-2.5 text-sm leading-relaxed">
              {t}
            </li>
          ))}
        </ul>
        {shown.length > limit && (
          <button type="button" onClick={() => setLimit(limit + 30)} className="mt-2 text-xs font-medium text-blue">
            Show more ({shown.length - limit} left)
          </button>
        )}
      </div>
    </div>
  );
}

function DateChart({ q, rows }: { q: Question; rows: SurveyResponse[] }) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = r.answers[q.id];
    if (typeof v === "string" && v.length >= 7) counts.set(v.slice(0, 7), (counts.get(v.slice(0, 7)) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const items = [...counts]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, count]) => ({ label: new Date(`${k}-01T00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" }), count, share: count / total }));
  return <Bars items={items} />;
}

function ContactList({ q, rows }: { q: Question; rows: SurveyResponse[] }) {
  const values = [...new Set(rows.map((r) => r.answers[q.id]).filter((v): v is string => typeof v === "string" && v !== ""))];
  const [copied, setCopied] = useState(false);
  return (
    <>
      <p className="font-serif text-4xl leading-none">{values.length.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted">unique {q.type === "email" ? "email addresses" : "phone numbers"} collected</p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(values.join("\n"));
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="btn btn-outline mt-4 h-9 text-sm"
      >
        {copied ? "Copied!" : "Copy all"}
      </button>
    </>
  );
}

// ---- Cross-tabulation --------------------------------------------------

function CrossTab({ questions, rows }: { questions: Question[]; rows: SurveyResponse[] }) {
  const tip = useTip();
  const [rowQ, setRowQ] = useState(questions[0].id);
  const [colQ, setColQ] = useState(questions[1].id);
  const [mode, setMode] = useState<"row" | "count">("row");
  const a = questions.find((q) => q.id === rowQ) ?? questions[0];
  const b = questions.find((q) => q.id === colQ) ?? questions[1];
  const rowVals = groupValues(a, rows);
  const colVals = groupValues(b, rows);

  const table = rowVals.map((rv) => {
    const inRow = rows.filter((r) => answerMatches(a, r, rv));
    const answeredB = inRow.filter((r) => !isEmpty(r.answers[b.id])).length;
    return { rv, total: inRow.length, answeredB, cells: colVals.map((cv) => inRow.filter((r) => answerMatches(b, r, cv)).length) };
  });
  const maxCount = Math.max(1, ...table.flatMap((t) => t.cells));
  return (
    <Panel title="Compare two questions" className="mt-10">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-4 text-sm">
        Break down
        <QuestionSelect questions={questions} value={colQ} onChange={setColQ} label="Answers to" />
        by
        <QuestionSelect questions={questions} value={rowQ} onChange={setRowQ} label="Grouped by" />
        <div className="ml-auto inline-flex border border-line p-0.5 text-xs">
          {(
            [
              ["row", "% of row"],
              ["count", "Counts"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setMode(k)} className={cn("px-2.5 py-1", mode === k ? "bg-ink text-white" : "text-muted")}>
              {l}
            </button>
          ))}
        </div>
      </div>
      {a.id === b.id ? (
        <p className="p-8 text-center text-sm text-muted">Pick two different questions.</p>
      ) : (
        <div className="overflow-x-auto p-5">
          <table className="w-full border-separate border-spacing-[2px] text-sm">
            <thead>
              <tr>
                <th className="min-w-32 text-left text-xs font-semibold text-muted">{a.title.slice(0, 40)}</th>
                {colVals.map((cv) => (
                  <th key={cv} className="min-w-16 px-1 pb-1 text-center align-bottom text-xs font-medium">
                    {cv}
                  </th>
                ))}
                <th className="px-2 text-right text-xs font-semibold text-muted">People</th>
              </tr>
            </thead>
            <tbody>
              {table.map((t) => (
                <tr key={t.rv}>
                  <th className="py-2 pr-3 text-left font-medium">{t.rv}</th>
                  {t.cells.map((c, i) => {
                    const share = t.answeredB ? c / t.answeredB : 0;
                    const intensity = mode === "row" ? share : c / maxCount;
                    return (
                      <td
                        key={colVals[i]}
                        className={cn("rounded-[2px] px-2 py-2 text-center tabular-nums", intensity > 0.55 ? "text-white" : "text-ink")}
                        style={{ background: c ? `rgb(29 76 204 / ${0.08 + intensity * 0.82})` : "var(--color-paper)" }}
                        {...tip(`${t.rv} → ${colVals[i]}`, `${c} people`, `${pct(share)} of “${t.rv}”`)}
                      >
                        {mode === "row" ? (c ? pct(share) : "–") : c || "–"}
                      </td>
                    );
                  })}
                  <td className="px-2 text-right text-xs text-muted">{t.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">
            Each row shows how people in that group answered. Darker = larger share. {NUMERIC.has(b.type) ? "" : "Checkbox questions can add up to more than 100%."}
          </p>
        </div>
      )}
    </Panel>
  );
}

function QuestionSelect({ questions, value, onChange, label }: { questions: Question[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <select className="field w-auto max-w-72 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
      {questions.map((q) => (
        <option key={q.id} value={q.id}>
          {q.title.length > 60 ? q.title.slice(0, 60) + "…" : q.title}
        </option>
      ))}
    </select>
  );
}
