"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Bold, FolderOpen, Heading2, ImagePlus, Italic, Link2, List, Plus, Quote, Trash2, X } from "lucide-react";
import { Markdown } from "@/components/site/Markdown";
import { bsString } from "@/lib/i18n";
import type { FieldDef, GalleryImage, Stat } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Dropzone, FileBadge, MediaPicker } from "./MediaPicker";

export type Values = Record<string, unknown>;
export type EditLang = "en" | "np";

const col = (f: FieldDef, lang: EditLang) => (f.localized && lang === "np" ? `${f.name}_np` : f.name);

/** Renders a list of schema fields as a form. */
export function FormFields({
  fields,
  values,
  onChange,
  lang,
  errors = {},
}: {
  fields: FieldDef[];
  values: Values;
  onChange: (key: string, value: unknown) => void;
  lang: EditLang;
  errors?: Record<string, string>;
}) {
  return (
    <div className="grid gap-x-5 gap-y-6 md:grid-cols-2">
      {fields.map((f) => {
        const key = col(f, lang);
        const other = f.localized ? (lang === "np" ? f.name : `${f.name}_np`) : null;
        const otherFilled = other ? hasValue(values[other]) : false;
        const wide = !f.half || ["richtext", "gallery", "stats", "textarea", "list"].includes(f.type);
        return (
          <div key={f.name} className={cn(wide && "md:col-span-2")}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor={key} className="text-[13px] font-semibold text-ink">
                {f.label}
                {f.required && (!f.localized || lang === "en") && <span className="ml-0.5 text-danger">*</span>}
              </label>
              {f.localized && (
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-px text-[10.5px] font-semibold",
                    lang === "np" ? "bg-blue-soft text-blue" : "bg-paper text-muted",
                  )}
                  title={otherFilled ? "The other language is filled in" : "The other language is empty"}
                >
                  {lang === "np" ? "नेपाली" : "EN"}
                  <span className={cn("ml-1", otherFilled ? "text-success" : "text-muted/60")}>· {lang === "np" ? "EN" : "NP"} {otherFilled ? "✓" : "—"}</span>
                </span>
              )}
            </div>
            <FieldInput field={f} id={key} value={values[key]} onChange={(v) => onChange(key, v)} lang={lang} />
            {errors[key] ? (
              <p className="mt-1.5 text-[13px] text-danger">{errors[key]}</p>
            ) : f.help ? (
              <p className="mt-1.5 text-[12.5px] text-muted">{f.help}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function hasValue(v: unknown) {
  if (Array.isArray(v)) return v.length > 0;
  return v !== null && v !== undefined && String(v).trim() !== "";
}

function FieldInput({ field, id, value, onChange, lang }: { field: FieldDef; id: string; value: unknown; onChange: (v: unknown) => void; lang: EditLang }) {
  const str = typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
  const devanagari = lang === "np" && field.localized ? "font-[family-name:var(--font-sans-deva)]" : "";

  switch (field.type) {
    case "textarea":
      return <textarea id={id} rows={4} value={str} onChange={(e) => onChange(e.target.value)} className={cn("field resize-y", devanagari)} />;
    case "richtext":
      return <MarkdownEditor id={id} value={str} onChange={onChange} className={devanagari} />;
    case "number":
      return <input id={id} type="number" step="any" value={str} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="field" />;
    case "date":
    case "datetime":
      return (
        <div>
          <input
            id={id}
            type={field.type === "date" ? "date" : "datetime-local"}
            value={field.type === "date" ? str.slice(0, 10) : str.slice(0, 16)}
            onChange={(e) => onChange(e.target.value)}
            className="field"
          />
          {str && bsString(str) && <p className="mt-1 text-[12.5px] font-medium text-blue">= {bsString(str)} (वि.सं.)</p>}
        </div>
      );
    case "select":
      return (
        <select id={id} value={str} onChange={(e) => onChange(e.target.value || null)} className="field">
          <option value="">— Select —</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    case "boolean":
      return (
        <label className="inline-flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={Boolean(value)}
            id={id}
            onClick={() => onChange(!value)}
            className={cn("relative h-6 w-11 rounded-full transition-colors", value ? "bg-blue" : "bg-[#cfd8e8]")}
          >
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", value ? "translate-x-[22px]" : "translate-x-0.5")} />
          </button>
          <span className="text-sm text-muted">{value ? "Yes" : "No"}</span>
        </label>
      );
    case "image":
      return <ImageField value={str} onChange={onChange} />;
    case "file":
      return <FileField value={str} onChange={onChange} />;
    case "gallery":
      return <GalleryField value={(value as GalleryImage[]) ?? []} onChange={onChange} />;
    case "list":
      return (
        <textarea
          id={id}
          rows={5}
          value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          placeholder="One item per line"
          className={cn("field resize-y", devanagari)}
        />
      );
    case "stats":
      return <StatsField value={(value as Stat[]) ?? []} onChange={onChange} />;
    default:
      return (
        <input
          id={id}
          type={field.type === "email" ? "email" : field.type === "url" ? "url" : "text"}
          value={str}
          onChange={(e) => onChange(e.target.value)}
          className={cn("field", devanagari)}
          placeholder={field.type === "url" ? "https://" : undefined}
        />
      );
  }
}

function ImageField({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  const [picker, setPicker] = useState(false);
  return (
    <div>
      {value ? (
        <div className="group relative inline-block border border-line bg-paper">
          <img src={value} alt="" className="block max-h-56 max-w-full object-contain" />
          <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={() => setPicker(true)} className="flex h-8 items-center gap-1.5 bg-white px-2.5 text-xs font-medium shadow">
              <FolderOpen className="size-3.5" /> Replace
            </button>
            <button type="button" onClick={() => onChange(null)} className="flex size-8 items-center justify-center bg-white text-danger shadow" aria-label="Remove image">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Dropzone compact accept="image/*" onUploaded={(f) => onChange(f[0]?.url)} label="Upload an image" />
          <button type="button" onClick={() => setPicker(true)} className="flex items-center justify-center gap-2 border border-line bg-white px-4 text-sm font-medium hover:border-ink">
            <FolderOpen className="size-4" /> Library
          </button>
        </div>
      )}
      <MediaPicker
        open={picker}
        type="image"
        onClose={() => setPicker(false)}
        onPick={(files) => {
          onChange(files[0]?.url);
          setPicker(false);
        }}
      />
    </div>
  );
}

function FileField({ value, onChange }: { value: string; onChange: (v: unknown) => void }) {
  const [picker, setPicker] = useState(false);
  return (
    <div>
      {value ? (
        <div className="flex items-center justify-between gap-3 border border-line bg-white px-4 py-3">
          <FileBadge url={value} />
          <div className="flex shrink-0 gap-1">
            <button type="button" onClick={() => setPicker(true)} className="h-8 px-2.5 text-xs font-medium hover:bg-paper">
              Replace
            </button>
            <button type="button" onClick={() => onChange(null)} className="flex size-8 items-center justify-center text-danger hover:bg-paper" aria-label="Remove file">
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Dropzone compact onUploaded={(f) => onChange(f[0]?.url)} label="Upload a file (PDF, Word, Excel…)" />
          <button type="button" onClick={() => setPicker(true)} className="flex items-center justify-center gap-2 border border-line bg-white px-4 text-sm font-medium hover:border-ink">
            <FolderOpen className="size-4" /> Library
          </button>
        </div>
      )}
      <MediaPicker
        open={picker}
        type="document"
        onClose={() => setPicker(false)}
        onPick={(files) => {
          onChange(files[0]?.url);
          setPicker(false);
        }}
      />
    </div>
  );
}

function GalleryField({ value, onChange }: { value: GalleryImage[]; onChange: (v: unknown) => void }) {
  const [picker, setPicker] = useState(false);
  const add = (imgs: { url: string; width?: number | null; height?: number | null }[]) =>
    onChange([...value, ...imgs.map((i) => ({ url: i.url, width: i.width, height: i.height, caption: "" }))]);
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((img, i) => (
            <li key={img.url + i} className="group border border-line bg-white">
              <div className="relative aspect-[4/3] bg-paper">
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute left-1.5 top-1.5 bg-ink/70 px-1.5 text-[11px] font-semibold text-white">{i + 1}</span>
                <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {i > 0 && (
                    <button type="button" onClick={() => move(i, -1)} className="flex size-7 items-center justify-center bg-white shadow" aria-label="Move earlier">
                      <ArrowUp className="size-3.5 -rotate-90" />
                    </button>
                  )}
                  {i < value.length - 1 && (
                    <button type="button" onClick={() => move(i, 1)} className="flex size-7 items-center justify-center bg-white shadow" aria-label="Move later">
                      <ArrowDown className="size-3.5 -rotate-90" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((_, j) => j !== i))}
                    className="flex size-7 items-center justify-center bg-white text-danger shadow"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <input
                value={img.caption ?? ""}
                onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                placeholder="Caption"
                className="w-full border-t border-line px-2.5 py-2 text-[13px] outline-none focus:bg-blue-soft/40"
              />
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <Dropzone compact multiple accept="image/*" onUploaded={add} label="Drop photos here or click to upload (select many at once)" />
        <button type="button" onClick={() => setPicker(true)} className="flex items-center justify-center gap-2 border border-line bg-white px-4 text-sm font-medium hover:border-ink">
          <FolderOpen className="size-4" /> Library
        </button>
      </div>
      {value.length > 0 && <p className="text-xs text-muted">{value.length} photos · hover a photo to reorder or remove it</p>}
      <MediaPicker
        open={picker}
        type="image"
        multiple
        onClose={() => setPicker(false)}
        onPick={(files) => {
          add(files);
          setPicker(false);
        }}
      />
    </div>
  );
}

function StatsField({ value, onChange }: { value: Stat[]; onChange: (v: unknown) => void }) {
  const set = (i: number, k: keyof Stat, v: string) => onChange(value.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[8rem_1fr_1fr_2.5rem] gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted sm:grid">
        <span>Figure</span>
        <span>Caption (English)</span>
        <span>Caption (नेपाली)</span>
      </div>
      {value.map((s, i) => (
        <div key={i} className="grid gap-2 border border-line bg-white p-2 sm:grid-cols-[8rem_1fr_1fr_2.5rem] sm:border-0 sm:bg-transparent sm:p-0">
          <input value={s.value ?? ""} onChange={(e) => set(i, "value", e.target.value)} placeholder="70,908" className="field py-2" />
          <input value={s.label ?? ""} onChange={(e) => set(i, "label", e.target.value)} placeholder="residents" className="field py-2" />
          <input value={s.label_np ?? ""} onChange={(e) => set(i, "label_np", e.target.value)} placeholder="बासिन्दा" className="field py-2" />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="flex items-center justify-center text-muted hover:text-danger" aria-label="Remove">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      {value.length < 4 && (
        <button type="button" onClick={() => onChange([...value, { value: "", label: "", label_np: "" }])} className="inline-flex items-center gap-1.5 text-sm font-medium text-blue">
          <Plus className="size-4" /> Add figure
        </button>
      )}
    </div>
  );
}

const TOOLS = [
  { icon: Bold, label: "Bold", action: "bold" },
  { icon: Italic, label: "Italic", action: "italic" },
  { icon: Heading2, label: "Heading", action: "heading" },
  { icon: List, label: "List", action: "list" },
  { icon: Quote, label: "Quote", action: "quote" },
  { icon: Link2, label: "Link", action: "link" },
  { icon: ImagePlus, label: "Image", action: "image" },
];

function MarkdownEditor({ id, value, onChange, className }: { id: string; value: string; onChange: (v: unknown) => void; className?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [picker, setPicker] = useState(false);

  function wrap(before: string, after = before, placeholder = "text") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  }
  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
    requestAnimationFrame(() => el.focus());
  }
  function insert(text: string) {
    const el = ref.current;
    const s = el?.selectionStart ?? value.length;
    onChange(value.slice(0, s) + text + value.slice(s));
  }

  function run(action: string) {
    if (action === "bold") wrap("**");
    else if (action === "italic") wrap("*");
    else if (action === "heading") linePrefix("## ");
    else if (action === "list") linePrefix("- ");
    else if (action === "quote") linePrefix("> ");
    else if (action === "link") wrap("[", "](https://)", "link text");
    else if (action === "image") setPicker(true);
  }

  return (
    <div className="border border-line bg-white focus-within:border-blue focus-within:shadow-[0_0_0_3px_rgb(29_76_204/0.12)]">
      <div className="flex items-center justify-between border-b border-line px-1.5">
        <div className="flex">
          {TOOLS.map((t) => (
            <button key={t.label} type="button" onClick={() => run(t.action)} disabled={tab === "preview"} className="flex size-9 items-center justify-center text-ink/70 hover:bg-paper hover:text-ink disabled:opacity-30" title={t.label} aria-label={t.label}>
              <t.icon className="size-4" />
            </button>
          ))}
        </div>
        <div className="flex text-xs font-medium">
          {(["write", "preview"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn("px-3 py-2.5 capitalize", tab === t ? "text-blue" : "text-muted hover:text-ink")}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === "write" ? (
        <textarea
          ref={ref}
          id={id}
          rows={12}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("block w-full resize-y px-4 py-3 font-mono text-[13.5px] leading-relaxed outline-none", className)}
          placeholder="Write here. Use the toolbar for headings, lists and links."
        />
      ) : (
        <div className="min-h-[18rem] px-5 py-4">{value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm text-muted">Nothing to preview.</p>}</div>
      )}
      <MediaPicker
        open={picker}
        type="image"
        onClose={() => setPicker(false)}
        onPick={(files) => {
          insert(`\n![${files[0].alt ?? ""}](${files[0].url})\n`);
          setPicker(false);
        }}
      />
    </div>
  );
}
