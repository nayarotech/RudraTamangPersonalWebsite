"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { FormFields, type EditLang, type Values } from "@/components/admin/Fields";
import { LangSwitch, PageTitle, Panel } from "@/components/admin/UI";
import { adm } from "@/lib/admin";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { schema, toast } = useAdmin();
  const [values, setValues] = useState<Values | null>(null);
  const [lang, setLang] = useState<EditLang>("np");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const groups = useMemo(() => [...new Set(schema.settings.map((f) => f.group ?? "General"))], [schema.settings]);
  const [group, setGroup] = useState(groups[0]);

  useEffect(() => {
    adm<Values>("/admin/settings").then(setValues);
  }, []);

  async function save() {
    setSaving(true);
    try {
      setValues(await adm<Values>("/admin/settings", { method: "PUT", json: values }));
      setDirty(false);
      toast("Settings saved — the website is updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <PageTitle title="Settings" description="Name, home page, biography, contact details and social links." actions={<LangSwitch lang={lang} onChange={setLang} />} />
      <div className="no-scrollbar mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {groups.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={cn("-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium", group === g ? "border-blue text-blue" : "border-transparent text-muted hover:text-ink")}
          >
            {g}
          </button>
        ))}
      </div>
      <Panel>
        <div className="p-5 md:p-7">
          {!values ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <FormFields
              fields={schema.settings.filter((f) => (f.group ?? "General") === group)}
              values={values}
              lang={lang}
              onChange={(k, v) => {
                setValues((prev) => ({ ...prev, [k]: v }));
                setDirty(true);
              }}
            />
          )}
        </div>
      </Panel>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-8">
          {dirty && <span className="mr-auto text-sm text-warn">Unsaved changes</span>}
          <button type="button" onClick={save} disabled={saving || !values} className="btn btn-primary h-10 min-w-32 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
