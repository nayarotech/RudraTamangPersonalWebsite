import { Download, FileText } from "lucide-react";
import { formatDate, label, num, pick, t } from "@/lib/i18n";
import type { Item, Lang } from "@/lib/types";
import { fileExt } from "@/lib/utils";
import { DocPreview } from "./DocPreview";

export function DocumentRow({ doc, lang, compact }: { doc: Item; lang: Lang; compact?: boolean }) {
  const d = t(lang);
  const title = pick(doc, "title", lang);
  const file = typeof doc.file === "string" ? doc.file : "";
  const ext = fileExt(file);

  return (
    <li className="group grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-b border-line py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="relative flex h-14 w-11 flex-col items-center justify-center border border-line bg-white text-blue transition-colors group-hover:border-blue">
        <FileText className="size-5" strokeWidth={1.5} />
        <span className="mt-0.5 text-[9px] font-bold tracking-wider">{ext}</span>
        <span className="absolute -right-px -top-px size-3 border-b border-l border-line bg-paper" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-medium leading-snug text-ink">{title}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
          <span className="font-medium text-blue">{label(doc.category, lang)}</span>
          {doc.fiscal_year ? (
            <span>
              {d.transparency.fiscalYear} {num(doc.fiscal_year as string, lang)}
            </span>
          ) : null}
          {doc.published_at ? <span>{formatDate(doc.published_at, lang, { short: true })}</span> : null}
          {doc.reference ? <span>Ref. {String(doc.reference)}</span> : null}
        </p>
        {!compact && pick(doc, "description", lang) && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{pick(doc, "description", lang)}</p>}
      </div>
      {file && (
        <div className="col-start-2 flex items-center gap-2 sm:col-start-3">
          <DocPreview url={file} title={title} label={d.transparency.preview} downloadLabel={d.common.download} />
          <a
            href={file}
            download
            className="inline-flex h-10 items-center gap-2 bg-ink px-3.5 text-sm font-medium text-white transition-colors hover:bg-blue"
            aria-label={`${d.common.download}: ${title}`}
          >
            <Download className="size-4" /> <span className="hidden md:inline">{d.common.download}</span>
          </a>
        </div>
      )}
    </li>
  );
}
