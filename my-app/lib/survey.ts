/** Mirrors backend/src/lib/surveys.ts. */

export type QuestionType =
  | "short"
  | "long"
  | "single"
  | "multi"
  | "dropdown"
  | "rating"
  | "scale"
  | "number"
  | "date"
  | "email"
  | "phone"
  | "section";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  help?: string;
  required?: boolean;
  options?: string[];
  allowOther?: boolean;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}

export type SurveyStatus = "draft" | "open" | "closed";

export interface Survey {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  questions: Question[];
  status: SurveyStatus;
  thank_you: string | null;
  closes_at: string | null;
  one_per_device: boolean;
  accepting: boolean;
  created_at: string;
  updated_at: string;
}

/** What the public page receives. */
export type PublicSurvey = Pick<Survey, "slug" | "title" | "description" | "questions" | "thank_you" | "one_per_device" | "accepting">;

export type Answer = string | number | string[];

export interface SurveyResponse {
  id: number;
  answers: Record<string, Answer>;
  duration_sec: number | null;
  device_id: string | null;
  ip_hash: string | null;
  lang: string | null;
  created_at: string;
}

export const statusLabel = (s: Pick<Survey, "status" | "accepting">) =>
  s.status === "draft" ? "Draft" : s.status === "open" && s.accepting ? "Open" : "Closed";

/** Browser only. */
export const publicLink = (slug: string) => `${window.location.origin}/survey/${slug}`;

export const TYPE_META: Record<QuestionType, { label: string; hint: string }> = {
  short: { label: "Short answer", hint: "One line of text" },
  long: { label: "Paragraph", hint: "Longer written answer" },
  single: { label: "Multiple choice", hint: "Pick one option" },
  multi: { label: "Checkboxes", hint: "Pick several options" },
  dropdown: { label: "Dropdown", hint: "Pick one from a list" },
  rating: { label: "Star rating", hint: "1 to 5 stars" },
  scale: { label: "Linear scale", hint: "e.g. 0 to 10" },
  number: { label: "Number", hint: "Age, family size…" },
  date: { label: "Date", hint: "A calendar date" },
  email: { label: "Email", hint: "Checked for format" },
  phone: { label: "Phone", hint: "Checked for format" },
  section: { label: "Section heading", hint: "Splits the form into parts" },
};

export const CHOICE = new Set<QuestionType>(["single", "multi", "dropdown"]);
export const NUMERIC = new Set<QuestionType>(["rating", "scale", "number"]);
export const TEXT = new Set<QuestionType>(["short", "long"]);

export function scaleRange(q: Pick<Question, "type" | "min" | "max">) {
  if (q.type === "rating") return { min: 1, max: Math.min(Math.max(q.max ?? 5, 3), 10) };
  const min = q.min === 0 ? 0 : 1;
  return { min, max: Math.min(Math.max(q.max ?? 10, min + 1), 10) };
}

/** Server timestamps are UTC "YYYY-MM-DD HH:MM:SS". */
export const parseTs = (s: string) => new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");

/** Local calendar day key, used to bucket responses by day. */
export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function isEmpty(v: Answer | undefined) {
  return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

export function formatAnswer(v: Answer | undefined) {
  if (isEmpty(v)) return "";
  return Array.isArray(v) ? v.join(", ") : String(v);
}

// ---- Analysis ----------------------------------------------------------

export interface Count {
  label: string;
  count: number;
  /** Share of people who answered this question (0–1). */
  share: number;
  other?: boolean;
}

/** Counts every option (in the order the form lists them), then "Other" answers. */
export function choiceCounts(q: Question, rows: SurveyResponse[]) {
  const options = q.options ?? [];
  const counts = new Map<string, number>(options.map((o) => [o, 0]));
  const others = new Map<string, number>();
  let answered = 0;
  let picks = 0;
  for (const r of rows) {
    const v = r.answers[q.id];
    if (isEmpty(v)) continue;
    answered++;
    for (const x of Array.isArray(v) ? v : [String(v)]) {
      picks++;
      if (counts.has(x)) counts.set(x, counts.get(x)! + 1);
      else others.set(x, (others.get(x) ?? 0) + 1);
    }
  }
  const otherTotal = [...others.values()].reduce((a, b) => a + b, 0);
  const items: Count[] = [...counts].map(([label, count]) => ({ label, count, share: answered ? count / answered : 0 }));
  if (otherTotal) items.push({ label: "Other", count: otherTotal, share: otherTotal / answered, other: true });
  const otherAnswers = [...others].sort((a, b) => b[1] - a[1]);
  return { items, answered, picks, otherAnswers };
}

export function numericStats(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mid = Math.floor(sorted.length / 2);
  return {
    n: sorted.length,
    mean: sum / sorted.length,
    median: sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

export function numbersFor(q: Question, rows: SurveyResponse[]) {
  const out: number[] = [];
  for (const r of rows) {
    const v = r.answers[q.id];
    const n = typeof v === "number" ? v : typeof v === "string" && v !== "" ? Number(v) : NaN;
    if (Number.isFinite(n)) out.push(n);
  }
  return out;
}

/** Distribution over every point on a rating/scale, including zeros. */
export function scaleDistribution(q: Question, values: number[]) {
  const { min, max } = scaleRange(q);
  const counts = Array.from({ length: max - min + 1 }, (_, i) => ({ value: min + i, count: 0 }));
  for (const v of values) if (v >= min && v <= max) counts[v - min].count++;
  return counts;
}

/** Net-promoter-style split for 0–10 scales: 0–6 / 7–8 / 9–10. */
export function npsSplit(values: number[]) {
  const n = values.length;
  if (!n) return null;
  const low = values.filter((v) => v <= 6).length;
  const high = values.filter((v) => v >= 9).length;
  return { low, mid: n - low - high, high, n, score: Math.round(((high - low) / n) * 100) };
}

/** Equal-width bins for free numbers. */
export function histogram(values: number[], bins = 8) {
  const s = numericStats(values);
  if (!s) return [];
  if (s.min === s.max) return [{ from: s.min, to: s.max, count: values.length }];
  const intOnly = values.every(Number.isInteger);
  let width = (s.max - s.min) / bins;
  if (intOnly) width = Math.max(1, Math.ceil(width));
  const count = Math.ceil((s.max - s.min + (intOnly ? 1 : 0)) / width) || 1;
  const out = Array.from({ length: count }, (_, i) => ({ from: s.min + i * width, to: s.min + (i + 1) * width - (intOnly ? 1 : 0), count: 0 }));
  for (const v of values) out[Math.min(Math.floor((v - s.min) / width), count - 1)].count++;
  return out;
}

const STOP = new Set(
  (
    "the a an and or of to in on for is are was were be been it this that with as at by from not no yes i we you they he she my our your their " +
    "छ छन् हो र पनि मा को का की ले लाई त्यो यो यस भएको गर्न गर्नु गर्नुपर्छ हुन्छ हुनुपर्छ हुने भन्दा तथा वा एक जस्तै धेरै अझै छैन नै सबै हामी हाम्रो तपाईं म मेरो उहाँ गरेर गरी"
  ).split(" "),
);

/** Most common words in text answers. Works for Nepali and English. */
export function topWords(texts: string[], limit = 24) {
  const counts = new Map<string, number>();
  for (const t of texts) {
    const seen = new Set<string>();
    for (const raw of t.toLowerCase().split(/[\s,.;:!?।()"'“”‘’\-–—/\\]+/u)) {
      const w = raw.trim();
      if (w.length < 2 || STOP.has(w) || /^\d+$/.test(w) || seen.has(w)) continue;
      seen.add(w);
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
  }
  return [...counts]
    .filter(([, n]) => n > 1 || counts.size < 15)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/** Values a respondent can be grouped by: options of choice questions, scale points. */
export function groupValues(q: Question, rows: SurveyResponse[]) {
  if (CHOICE.has(q.type)) return choiceCounts(q, rows).items.filter((i) => !i.other).map((i) => i.label).concat(
    rows.some((r) => {
      const v = r.answers[q.id];
      return !isEmpty(v) && (Array.isArray(v) ? v : [String(v)]).some((x) => !(q.options ?? []).includes(x));
    })
      ? ["Other"]
      : [],
  );
  if (q.type === "rating" || q.type === "scale") return scaleDistribution(q, []).map((d) => String(d.value));
  return [];
}

/** Does this response's answer to `q` include `value`? ("Other" = anything off-list.) */
export function answerMatches(q: Question, r: SurveyResponse, value: string) {
  const v = r.answers[q.id];
  if (isEmpty(v)) return false;
  const list = Array.isArray(v) ? v : [String(v)];
  if (value === "Other" && CHOICE.has(q.type)) return list.some((x) => !(q.options ?? []).includes(x));
  return list.includes(value);
}

export const pct = (share: number) => `${Math.round(share * 100)}%`;
export const round1 = (n: number) => (Math.round(n * 10) / 10).toLocaleString("en-US");

export function formatDuration(sec: number) {
  if (sec < 60) return `${Math.round(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function blankQuestion(type: QuestionType): Question {
  const id = Math.random().toString(36).slice(2, 10);
  const base: Question = { id, type, title: "", help: "", required: false };
  if (CHOICE.has(type)) return { ...base, options: ["Option 1", "Option 2"] };
  if (type === "rating") return { ...base, max: 5 };
  if (type === "scale") return { ...base, min: 1, max: 10, minLabel: "", maxLabel: "" };
  return base;
}
