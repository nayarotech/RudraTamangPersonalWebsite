"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, ExternalLink, Mail, MessageCircle, Share2, Smartphone } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Panel } from "@/components/admin/UI";
import { publicLink, type Survey, type SurveyStatus } from "@/lib/survey";
import { cn } from "@/lib/utils";

const STATUS: { value: SurveyStatus; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Only you can see it. The link doesn't work yet." },
  { value: "open", label: "Open", hint: "Anyone with the link can respond." },
  { value: "closed", label: "Closed", hint: "The link shows a “no longer accepting responses” message." },
];

export function Share({ survey, saved, onChange }: { survey: Survey; saved: Survey; onChange: (s: Survey) => void }) {
  const { toast } = useAdmin();
  const [qr, setQr] = useState("");
  const link = publicLink(saved.slug);
  const live = saved.status !== "draft";

  useEffect(() => {
    QRCode.toDataURL(link, { width: 640, margin: 2, color: { dark: "#0b1b36", light: "#ffffff" } }).then(setQr);
  }, [link]);

  const message = `${saved.title}\n${link}`;
  const enc = encodeURIComponent;
  const shares = [
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${enc(message)}` },
    { label: "Facebook", icon: Share2, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(link)}` },
    { label: "Viber", icon: Smartphone, href: `viber://forward?text=${enc(message)}` },
    { label: "SMS", icon: Smartphone, href: `sms:?&body=${enc(message)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${enc(saved.title)}&body=${enc(message)}` },
  ];

  async function copy() {
    await navigator.clipboard.writeText(link);
    toast("Link copied");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className="space-y-6 xl:col-span-3">
        <Panel title="Share link">
          <div className="p-5">
            {!live && (
              <p className="mb-4 border border-[#f0d9b5] bg-[#fff8ec] px-4 py-3 text-sm text-warn">
                This survey is still a draft. Click <b>Publish &amp; get link</b> at the top to make the link work.
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="field flex-1 font-mono text-sm" aria-label="Survey link" />
              <button type="button" onClick={copy} className="btn btn-primary h-auto py-2.5 text-sm">
                <Copy className="size-4" /> Copy
              </button>
              <a href={link} target="_blank" className="btn btn-outline h-auto py-2.5 text-sm">
                <ExternalLink className="size-4" /> Open
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {shares.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener" className="inline-flex items-center gap-2 border border-line px-3 py-2 text-sm hover:border-blue hover:text-blue">
                  <s.icon className="size-4" /> {s.label}
                </a>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Settings">
          <div className="space-y-6 p-5">
            <div>
              <p className="field-label">Status</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {STATUS.map((s) => (
                  <label
                    key={s.value}
                    className={cn("cursor-pointer border p-3 transition-colors", survey.status === s.value ? "border-blue bg-blue-soft" : "border-line hover:border-[#c4cfe2]")}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <input type="radio" name="status" checked={survey.status === s.value} onChange={() => onChange({ ...survey, status: s.value })} className="accent-[var(--color-blue)]" />
                      {s.label}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-muted">{s.hint}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="closes_at" className="field-label">
                  Close automatically at <span className="font-normal text-muted">(Nepal time, optional)</span>
                </label>
                <input
                  id="closes_at"
                  type="datetime-local"
                  className="field"
                  value={survey.closes_at ?? ""}
                  onChange={(e) => onChange({ ...survey, closes_at: e.target.value || null })}
                />
              </div>
              <div>
                <label htmlFor="slug" className="field-label">
                  Link ending
                </label>
                <div className="flex items-center border border-line focus-within:border-blue">
                  <span className="pl-3 text-sm text-muted">/survey/</span>
                  <input
                    id="slug"
                    className="w-full px-1 py-3 text-[0.95rem] outline-none"
                    value={survey.slug}
                    onChange={(e) => onChange({ ...survey, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                  />
                </div>
                {live && survey.slug !== saved.slug && <p className="mt-1.5 text-xs text-warn">The old link will stop working once you save.</p>}
              </div>
            </div>

            <label className="flex cursor-pointer gap-3">
              <input type="checkbox" checked={survey.one_per_device} onChange={(e) => onChange({ ...survey, one_per_device: e.target.checked })} className="mt-1 size-4 accent-[var(--color-blue)]" />
              <span>
                <span className="block text-sm font-semibold">One response per phone / computer</span>
                <span className="block text-xs text-muted">
                  Leave off if volunteers will fill in forms for many people from one phone while going door to door.
                </span>
              </span>
            </label>

            <div>
              <label htmlFor="thanks" className="field-label">
                Thank-you message <span className="font-normal text-muted">(shown after submitting)</span>
              </label>
              <textarea
                id="thanks"
                rows={3}
                className="field resize-y"
                placeholder="धन्यवाद! तपाईंको उत्तर सुरक्षित भयो।"
                value={survey.thank_you ?? ""}
                onChange={(e) => onChange({ ...survey, thank_you: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted">Changes here are saved with the “Save changes” button at the top.</p>
          </div>
        </Panel>
      </div>

      <Panel title="QR code" className="self-start xl:col-span-2">
        <div className="p-5 text-center">
          <p className="text-sm text-muted">Print it on posters and pamphlets, or show it at ward meetings — people scan it with their phone camera.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {qr && <img src={qr} alt={`QR code for ${link}`} className={cn("mx-auto mt-4 w-full max-w-64", !live && "opacity-40")} />}
          <a href={qr} download={`${saved.slug}-qr.png`} className="btn btn-outline mt-4 h-10 text-sm">
            <Download className="size-4" /> Download PNG
          </a>
        </div>
      </Panel>
    </div>
  );
}
