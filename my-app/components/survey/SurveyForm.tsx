"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, CheckCircle2, Loader2, RotateCcw, Star } from "lucide-react";
import { type Answer, type PublicSurvey, type Question, isEmpty, scaleRange } from "@/lib/survey";
import type { Lang } from "@/lib/types";
import { cn } from "@/lib/utils";

const L = {
  en: {
    required: "Required",
    requiredNote: "* marks a required question",
    other: "Other",
    otherPlaceholder: "Write your answer",
    choose: "Choose…",
    answer: "Your answer",
    submit: "Submit",
    sending: "Sending…",
    thanks: "Thank you! Your response has been recorded.",
    another: "Submit another response",
    closed: "This survey is no longer accepting responses.",
    already: "You have already responded to this survey. Thank you!",
    preview: "Preview — answers are not saved.",
    network: "Couldn't reach the server. Check your connection and try again.",
    tooMany: "Too many submissions. Please wait a few minutes.",
    answered: (a: number, n: number) => `${a} of ${n} answered`,
    stars: (n: number) => `${n} star${n > 1 ? "s" : ""}`,
  },
  np: {
    required: "आवश्यक",
    requiredNote: "* चिन्ह भएका प्रश्न अनिवार्य छन्",
    other: "अन्य",
    otherPlaceholder: "आफ्नो उत्तर लेख्नुहोस्",
    choose: "छान्नुहोस्…",
    answer: "तपाईंको उत्तर",
    submit: "पेश गर्नुहोस्",
    sending: "पठाउँदै…",
    thanks: "धन्यवाद! तपाईंको उत्तर सुरक्षित भयो।",
    another: "अर्को उत्तर भर्नुहोस्",
    closed: "यो सर्वेक्षण अब बन्द भइसकेको छ।",
    already: "तपाईंले यो सर्वेक्षण पहिले नै भर्नुभएको छ। धन्यवाद!",
    preview: "पूर्वावलोकन — उत्तर सुरक्षित हुँदैन।",
    network: "सर्भरमा जोडिन सकिएन। इन्टरनेट जाँचेर फेरि प्रयास गर्नुहोस्।",
    tooMany: "धेरै पटक पठाइयो। केही मिनेटपछि प्रयास गर्नुहोस्।",
    answered: (a: number, n: number) => `${n} मध्ये ${a} उत्तर दिइयो`,
    stars: (n: number) => `${n} तारा`,
  },
};

type Values = Record<string, Answer>;
/** Text typed into the "Other" box, kept apart so ticking it on/off doesn't lose it. */
type OtherText = Record<string, string>;
const OTHER = "__other__";

function deviceId() {
  try {
    let id = localStorage.getItem("survey_device");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("survey_device", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

const doneKey = (slug: string) => `survey_done_${slug}`;

function alreadyDone(slug: string) {
  try {
    return !!localStorage.getItem(doneKey(slug));
  } catch {
    return false;
  }
}

const noSubscribe = () => () => {};
const secondsSince = (t: number) => Math.round((Date.now() - t) / 1000);

export function SurveyForm({ survey, lang, preview = false }: { survey: PublicSurvey; lang: Lang; preview?: boolean }) {
  const t = L[lang];
  const [values, setValues] = useState<Values>({});
  const [other, setOther] = useState<OtherText>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "already">("idle");
  const doneBefore = useSyncExternalStore(noSubscribe, () => !preview && survey.one_per_device && alreadyDone(survey.slug), () => false);
  const [thanks, setThanks] = useState("");
  const startedAt = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const questions = survey.questions;
  const answerable = questions.filter((q) => q.type !== "section");

  /** Merge the "Other" text into the answer that gets sent. */
  function finalValue(q: Question): Answer | undefined {
    const v = values[q.id];
    const o = (other[q.id] ?? "").trim();
    if (q.type === "multi") {
      const arr = (Array.isArray(v) ? v : []).filter((x) => x !== OTHER);
      if (Array.isArray(v) && v.includes(OTHER) && o) arr.push(o);
      return arr;
    }
    if ((q.type === "single" || q.type === "dropdown") && v === OTHER) return o;
    return v;
  }

  const answeredCount = answerable.filter((q) => !isEmpty(finalValue(q))).length;

  function set(q: Question, v: Answer) {
    setValues((s) => ({ ...s, [q.id]: v }));
    if (errors[q.id]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== q.id)));
  }

  function scrollToFirstError(errs: Record<string, string>) {
    const first = questions.find((q) => errs[q.id]);
    if (first) document.getElementById(`q-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const answers: Values = {};
    const errs: Record<string, string> = {};
    for (const q of answerable) {
      const v = finalValue(q);
      if (isEmpty(v)) {
        if (q.required) errs[q.id] = lang === "np" ? "यो प्रश्नको उत्तर आवश्यक छ।" : "This question is required.";
      } else answers[q.id] = v!;
    }
    setErrors(errs);
    setMessage("");
    if (Object.keys(errs).length) return scrollToFirstError(errs);
    if (preview) {
      setThanks(survey.thank_you || "");
      setState("done");
      return;
    }

    setState("sending");
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      const res = await fetch(`/api/public/surveys/${encodeURIComponent(survey.slug)}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          lang,
          website,
          device_id: deviceId(),
          duration_sec: secondsSince(startedAt.current),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) return setState("already");
        setErrors(json.fields ?? {});
        setMessage(res.status === 429 ? t.tooMany : (json.error ?? "Something went wrong."));
        setState("idle");
        if (json.fields) scrollToFirstError(json.fields);
        return;
      }
      if (survey.one_per_device) {
        try {
          localStorage.setItem(doneKey(survey.slug), "1");
        } catch {}
      }
      setThanks(json.thank_you || "");
      setState("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setMessage(t.network);
      setState("idle");
    }
  }

  function again() {
    setValues({});
    setOther({});
    setErrors({});
    startedAt.current = Date.now();
    setState("idle");
  }

  if (!survey.accepting && !preview) return <Notice>{t.closed}</Notice>;
  if (state === "already" || (doneBefore && state !== "done")) return <Notice>{t.already}</Notice>;
  if (state === "done") {
    return (
      <div className="reveal border border-success/30 bg-[#f1faf5] p-8 md:p-10">
        <CheckCircle2 className="size-9 text-success" />
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed">{thanks || t.thanks}</p>
        {(!survey.one_per_device || preview) && (
          <button type="button" onClick={again} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue hover:text-navy">
            <RotateCcw className="size-4" /> {t.another}
          </button>
        )}
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="relative">
      <div className="absolute -left-[9999px]" aria-hidden>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {preview && <p className="mb-5 border border-dashed border-blue/40 bg-blue-soft px-4 py-2.5 text-sm text-blue">{t.preview}</p>}
      {answerable.some((q) => q.required) && <p className="mb-5 text-sm text-danger">{t.requiredNote}</p>}

      <div className="space-y-4">
        {questions.map((q, i) =>
          q.type === "section" ? (
            <div key={q.id} className={cn("pb-1", i > 0 && "pt-6")}>
              <h2 className="display text-2xl md:text-[1.75rem]">{q.title}</h2>
              {q.help && <p className="mt-1.5 text-muted">{q.help}</p>}
            </div>
          ) : (
            <fieldset
              key={q.id}
              id={`q-${q.id}`}
              className={cn("scroll-mt-28 border bg-white p-5 transition-colors md:p-7", errors[q.id] ? "border-danger/60" : "border-line")}
            >
              <legend className="contents">
                <span className="block text-[1.05rem] font-semibold leading-snug">
                  {q.title || "—"}
                  {q.required && <span className="ml-1 text-danger" aria-label={t.required}>*</span>}
                </span>
              </legend>
              {q.help && <p className="mt-1 text-sm text-muted">{q.help}</p>}
              <div className="mt-4">
                <Input q={q} t={t} value={values[q.id]} otherText={other[q.id] ?? ""} onChange={(v) => set(q, v)} onOther={(s) => setOther((o) => ({ ...o, [q.id]: s }))} invalid={!!errors[q.id]} />
              </div>
              {errors[q.id] && <p className="mt-3 text-sm text-danger">{errors[q.id]}</p>}
            </fieldset>
          ),
        )}
      </div>

      {message && <p className="mt-5 text-sm text-danger">{message}</p>}
      <div className="sticky bottom-0 z-10 -mx-1 mt-6 flex items-center justify-between gap-4 border-t border-line bg-white/95 px-1 py-4 backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{t.answered(answeredCount, answerable.length)}</p>
          <div className="mt-1.5 h-1 max-w-56 overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-blue transition-[width]" style={{ width: `${answerable.length ? (answeredCount / answerable.length) * 100 : 0}%` }} />
          </div>
        </div>
        <button type="submit" disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">
          {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
          {state === "sending" ? t.sending : t.submit}
          {state !== "sending" && <ArrowRight className="size-4" />}
        </button>
      </div>
    </form>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="border border-line bg-paper p-8 text-lg leading-relaxed md:p-10">{children}</div>;
}

type T = (typeof L)["en"];

function Input({
  q,
  t,
  value,
  otherText,
  onChange,
  onOther,
  invalid,
}: {
  q: Question;
  t: T;
  value: Answer | undefined;
  otherText: string;
  onChange: (v: Answer) => void;
  onOther: (s: string) => void;
  invalid: boolean;
}) {
  const id = `in-${q.id}`;
  const options = q.options ?? [];

  switch (q.type) {
    case "short":
    case "email":
    case "phone":
    case "number":
    case "date":
      return (
        <input
          id={id}
          type={q.type === "short" ? "text" : q.type === "phone" ? "tel" : q.type}
          inputMode={q.type === "number" ? "decimal" : q.type === "phone" ? "tel" : undefined}
          min={q.type === "number" ? q.min : undefined}
          max={q.type === "number" ? q.max : undefined}
          autoComplete={q.type === "email" ? "email" : q.type === "phone" ? "tel" : "off"}
          className="field max-w-xl"
          placeholder={q.type === "date" ? undefined : t.answer}
          aria-invalid={invalid}
          value={(value as string | number | undefined) ?? ""}
          onChange={(e) => onChange(q.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value)}
        />
      );
    case "long":
      return (
        <textarea
          id={id}
          rows={4}
          className="field resize-y"
          placeholder={t.answer}
          aria-invalid={invalid}
          value={(value as string | undefined) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "dropdown":
      return (
        <div className="max-w-xl space-y-3">
          <select id={id} className="field" aria-invalid={invalid} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
            <option value="">{t.choose}</option>
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
            {q.allowOther && <option value={OTHER}>{t.other}</option>}
          </select>
          {value === OTHER && <OtherBox t={t} value={otherText} onChange={onOther} />}
        </div>
      );
    case "single":
    case "multi": {
      const multi = q.type === "multi";
      const selected = multi ? ((value as string[] | undefined) ?? []) : [(value as string | undefined) ?? ""];
      const toggle = (o: string) => {
        if (!multi) return onChange(o);
        onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
      };
      const all = [...options, ...(q.allowOther ? [OTHER] : [])];
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {all.map((o) => {
            const on = selected.includes(o);
            return (
              <label
                key={o}
                className={cn(
                  "flex cursor-pointer items-center gap-3 border px-4 py-3 text-[15px] transition-colors",
                  on ? "border-blue bg-blue-soft" : "border-line hover:border-[#c4cfe2]",
                  o === OTHER && on && "sm:col-span-2",
                )}
              >
                <input
                  type={multi ? "checkbox" : "radio"}
                  name={q.id}
                  checked={on}
                  onChange={() => toggle(o)}
                  className="size-4 shrink-0 accent-[var(--color-blue)]"
                />
                <span className="min-w-0 flex-1">
                  {o === OTHER ? t.other : o}
                  {o === OTHER && on && (
                    <span className="mt-2 block" onClick={(e) => e.preventDefault()}>
                      <OtherBox t={t} value={otherText} onChange={onOther} />
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      );
    }
    case "rating": {
      const { max } = scaleRange(q);
      const v = typeof value === "number" ? value : 0;
      return (
        <div>
          <div className="flex flex-wrap gap-1" role="radiogroup">
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={v === n}
                aria-label={t.stars(n)}
                onClick={() => onChange(n)}
                className="p-1.5 transition-transform hover:scale-110"
              >
                <Star className={cn("size-8", n <= v ? "fill-[#f5b301] text-[#e0a300]" : "text-[#c4cfe2]")} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <ScaleLabels q={q} />
        </div>
      );
    }
    case "scale": {
      const { min, max } = scaleRange(q);
      const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      return (
        <div>
          <div className="flex flex-wrap gap-1.5" role="radiogroup">
            {points.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value === n}
                onClick={() => onChange(n)}
                className={cn(
                  "flex size-11 items-center justify-center border text-[15px] font-semibold transition-colors",
                  value === n ? "border-blue bg-blue text-white" : "border-line hover:border-blue hover:text-blue",
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <ScaleLabels q={q} />
        </div>
      );
    }
    default:
      return null;
  }
}

function ScaleLabels({ q }: { q: Question }) {
  if (!q.minLabel && !q.maxLabel) return null;
  return (
    <p className="mt-2 flex max-w-xl justify-between gap-4 text-xs text-muted">
      <span>{q.minLabel}</span>
      <span className="text-right">{q.maxLabel}</span>
    </p>
  );
}

function OtherBox({ t, value, onChange }: { t: T; value: string; onChange: (s: string) => void }) {
  return <input className="field py-2" placeholder={t.otherPlaceholder} value={value} onChange={(e) => onChange(e.target.value)} />;
}
