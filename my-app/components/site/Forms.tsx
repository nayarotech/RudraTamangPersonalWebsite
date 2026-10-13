"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Copy, Loader2, Paperclip, Search } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import { formatDate } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { cn } from "@/lib/utils";

type Errors = Record<string, string>;

function useSubmit(endpoint: string, multipart = false) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Record<string, unknown>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setErrors({});
    setMessage("");
    try {
      const res = await fetch(`/api/public/${endpoint}`, multipart
        ? { method: "POST", body: data }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(json.fields ?? {});
        setMessage(res.status === 429 ? "Too many attempts. Please try again in a few minutes." : (json.error ?? "Something went wrong."));
        setState("idle");
        return;
      }
      setResult(json);
      setState("done");
      form.reset();
    } catch {
      setMessage("Couldn't reach the server. Check your connection and try again.");
      setState("idle");
    }
  }
  return { state, errors, message, result, submit, reset: () => setState("idle") };
}

function Field({
  name,
  label,
  error,
  optional,
  optionalLabel,
  className,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="field-label">
        {label} {optional && <span className="font-normal text-muted">({optionalLabel})</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

/** Hidden from people, irresistible to bots. */
const Honeypot = () => (
  <div className="absolute -left-[9999px]" aria-hidden>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" />
  </div>
);

function Submit({ sending, label, sendingLabel }: { sending: boolean; label: string; sendingLabel: string }) {
  return (
    <button type="submit" disabled={sending} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto">
      {sending ? <Loader2 className="size-4 animate-spin" /> : null}
      {sending ? sendingLabel : label}
      {!sending && <ArrowRight className="size-4" />}
    </button>
  );
}

function Success({ children }: { children: React.ReactNode }) {
  return (
    <div className="reveal border border-success/30 bg-[#f1faf5] p-8">
      <CheckCircle2 className="size-8 text-success" />
      <div className="mt-4 text-lg leading-relaxed">{children}</div>
    </div>
  );
}

export function ContactForm({ d }: { d: Dict }) {
  const f = useSubmit("contact");
  if (f.state === "done") return <Success>{d.contact.sent}</Success>;
  return (
    <form onSubmit={f.submit} className="relative grid gap-5 sm:grid-cols-2" noValidate>
      <Honeypot />
      <Field name="name" label={d.contact.name} error={f.errors.name} className="sm:col-span-2">
        <input id="name" name="name" required autoComplete="name" className="field" aria-invalid={!!f.errors.name} />
      </Field>
      <Field name="email" label={d.contact.email} error={f.errors.email} optional optionalLabel={d.common.optional}>
        <input id="email" name="email" type="email" autoComplete="email" className="field" aria-invalid={!!f.errors.email} />
      </Field>
      <Field name="phone" label={d.contact.phone} error={f.errors.phone} optional optionalLabel={d.common.optional}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" />
      </Field>
      <Field name="subject" label={d.contact.subject} className="sm:col-span-2">
        <input id="subject" name="subject" className="field" />
      </Field>
      <Field name="message" label={d.contact.message} error={f.errors.message} className="sm:col-span-2">
        <textarea id="message" name="message" rows={6} required className="field resize-y" aria-invalid={!!f.errors.message} />
      </Field>
      {f.message && <p className="text-sm text-danger sm:col-span-2">{f.message}</p>}
      <div className="sm:col-span-2">
        <Submit sending={f.state === "sending"} label={d.contact.send} sendingLabel={d.common.sending} />
      </div>
    </form>
  );
}

export function VolunteerForm({ d }: { d: Dict }) {
  const f = useSubmit("volunteer");
  const [picked, setPicked] = useState<string[]>([]);
  if (f.state === "done") return <Success>{d.volunteer.sent}</Success>;
  return (
    <form onSubmit={f.submit} className="relative grid gap-5 sm:grid-cols-2" noValidate>
      <Honeypot />
      <Field name="name" label={d.contact.name} error={f.errors.name} className="sm:col-span-2">
        <input id="name" name="name" autoComplete="name" className="field" aria-invalid={!!f.errors.name} />
      </Field>
      <Field name="phone" label={d.contact.phone} error={f.errors.phone}>
        <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" aria-invalid={!!f.errors.phone} />
      </Field>
      <Field name="ward" label={d.common.ward}>
        <select id="ward" name="ward" className="field">
          <option value="">—</option>
          {Array.from({ length: 9 }, (_, i) => (
            <option key={i} value={String(i + 1)}>
              {d.common.ward} {i + 1}
            </option>
          ))}
          <option value="Outside Urlabari">Other</option>
        </select>
      </Field>
      <Field name="email" label={d.contact.email} error={f.errors.email} optional optionalLabel={d.common.optional} className="sm:col-span-2">
        <input id="email" name="email" type="email" autoComplete="email" className="field" />
      </Field>
      <fieldset className="sm:col-span-2">
        <legend className="field-label">{d.volunteer.interests}</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {d.volunteer.areas.map((a) => {
            const on = picked.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => setPicked((p) => (on ? p.filter((x) => x !== a) : [...p, a]))}
                className={cn("h-10 border px-4 text-sm font-medium transition-colors", on ? "border-blue bg-blue text-white" : "border-line hover:border-ink")}
                aria-pressed={on}
              >
                {a}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="interests" value={picked.join(", ")} />
      </fieldset>
      <Field name="message" label={d.contact.message} optional optionalLabel={d.common.optional} className="sm:col-span-2">
        <textarea id="message" name="message" rows={4} className="field resize-y" />
      </Field>
      {f.message && <p className="text-sm text-danger sm:col-span-2">{f.message}</p>}
      <div className="sm:col-span-2">
        <Submit sending={f.state === "sending"} label={d.volunteer.send} sendingLabel={d.common.sending} />
      </div>
    </form>
  );
}

const CATEGORY_VALUES = ["Road & transport", "Water & sanitation", "Electricity", "Health", "Education", "Agriculture", "Social security", "Corruption", "Other"];

export function GrievanceForm({ d }: { d: Dict }) {
  const f = useSubmit("grievance", true);
  const [fileName, setFileName] = useState("");
  const [copied, setCopied] = useState(false);

  if (f.state === "done") {
    const code = String(f.result.code ?? "");
    return (
      <Success>
        <p>{d.grievance.sent}</p>
        <p className="mt-2 text-base text-muted">{d.grievance.keepCode}</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="border-2 border-ink bg-white px-5 py-3 font-mono text-2xl font-bold tracking-[0.2em]">{code}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
            }}
            className="flex size-12 items-center justify-center border border-line bg-white hover:border-ink"
            aria-label="Copy code"
          >
            {copied ? <CheckCircle2 className="size-5 text-success" /> : <Copy className="size-5" />}
          </button>
        </div>
      </Success>
    );
  }

  return (
    <form onSubmit={f.submit} className="relative grid gap-5 sm:grid-cols-2" noValidate>
      <Honeypot />
      <Field name="g-name" label={d.contact.name} optional optionalLabel={d.common.optional}>
        <input id="g-name" name="name" autoComplete="name" className="field" />
      </Field>
      <Field name="g-phone" label={d.contact.phone} error={f.errors.phone}>
        <input id="g-phone" name="phone" type="tel" autoComplete="tel" className="field" aria-invalid={!!f.errors.phone} />
      </Field>
      <Field name="g-category" label={d.common.category}>
        <select id="g-category" name="category" className="field">
          {CATEGORY_VALUES.map((v, i) => (
            <option key={v} value={v}>
              {d.grievance.categories[i]}
            </option>
          ))}
        </select>
      </Field>
      <Field name="g-ward" label={d.common.ward}>
        <select id="g-ward" name="ward" className="field">
          <option value="">—</option>
          {Array.from({ length: 9 }, (_, i) => (
            <option key={i} value={String(i + 1)}>
              {d.common.ward} {i + 1}
            </option>
          ))}
        </select>
      </Field>
      <Field name="g-subject" label={d.grievance.subject} error={f.errors.subject} className="sm:col-span-2">
        <input id="g-subject" name="subject" className="field" aria-invalid={!!f.errors.subject} />
      </Field>
      <Field name="g-message" label={d.grievance.details} error={f.errors.message} className="sm:col-span-2">
        <textarea id="g-message" name="message" rows={6} className="field resize-y" aria-invalid={!!f.errors.message} />
      </Field>
      <div className="sm:col-span-2">
        <span className="field-label">
          {d.grievance.attachment} <span className="font-normal text-muted">({d.common.optional})</span>
        </span>
        <label className="flex cursor-pointer items-center gap-3 border border-dashed border-line px-4 py-4 text-sm transition-colors hover:border-blue">
          <Paperclip className="size-4 text-blue" />
          <span className={fileName ? "text-ink" : "text-muted"}>{fileName || d.grievance.attachmentHelp}</span>
          <input type="file" name="attachment" accept="image/*,application/pdf" className="sr-only" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")} />
        </label>
      </div>
      <Field name="g-email" label={d.contact.email} error={f.errors.email} optional optionalLabel={d.common.optional} className="sm:col-span-2">
        <input id="g-email" name="email" type="email" autoComplete="email" className="field" />
      </Field>
      {f.message && <p className="text-sm text-danger sm:col-span-2">{f.message}</p>}
      <div className="sm:col-span-2">
        <Submit sending={f.state === "sending"} label={d.grievance.file} sendingLabel={d.common.sending} />
      </div>
    </form>
  );
}

interface Tracked {
  code: string;
  subject: string;
  category: string;
  status: string;
  response: string | null;
  created_at: string;
  updated_at: string;
}

const STEPS = ["Received", "In review", "In progress", "Resolved"];

export function GrievanceTracker({ d, lang }: { d: Dict; lang: Lang }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<Tracked | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    const res = await fetch(`/api/public/grievance/${encodeURIComponent(code.trim())}`);
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(json.error ?? "Not found.");
    setData(json);
  }

  const step = data ? (data.status === "Closed" ? STEPS.length - 1 : STEPS.indexOf(data.status)) : -1;

  return (
    <div>
      <form onSubmit={check} className="flex gap-2">
        <label htmlFor="track" className="sr-only">
          {d.grievance.code}
        </label>
        <input
          id="track"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="UR-XXXXXX"
          className="field h-12 font-mono tracking-widest"
        />
        <button type="submit" className="btn btn-primary h-12 shrink-0" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          <span className="hidden sm:inline">{d.grievance.check}</span>
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      {data && (
        <div className="reveal mt-6 border border-line bg-white p-6">
          <p className="font-mono text-sm text-muted">{data.code}</p>
          <p className="mt-1 text-lg font-semibold">{data.subject}</p>
          <ol className="mt-6 grid grid-cols-4 gap-1">
            {STEPS.map((s, i) => (
              <li key={s}>
                <div className={cn("h-1", i <= step ? "bg-blue" : "bg-line")} />
                <p className={cn("mt-2 text-xs", i <= step ? "font-semibold text-ink" : "text-muted")}>{d.grievance.statuses[s] ?? s}</p>
              </li>
            ))}
          </ol>
          {data.status === "Closed" && <p className="mt-3 text-sm text-muted">{d.grievance.statuses.Closed}</p>}
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">{d.grievance.filed}</dt>
              <dd className="font-medium">{formatDate(data.created_at.replace(" ", "T"), lang)}</dd>
            </div>
            <div>
              <dt className="text-muted">{d.grievance.updated}</dt>
              <dd className="font-medium">{formatDate(data.updated_at.replace(" ", "T"), lang)}</dd>
            </div>
          </dl>
          {data.response && (
            <div className="mt-6 border-l-2 border-blue bg-paper p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue">{d.grievance.response}</p>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{data.response}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
