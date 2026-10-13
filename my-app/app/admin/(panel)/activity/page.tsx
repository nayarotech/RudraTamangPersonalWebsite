"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { PageTitle, Panel } from "@/components/admin/UI";
import { adm } from "@/lib/admin";

interface Entry {
  id: number;
  user_name: string;
  action: string;
  collection: string | null;
  item_title: string | null;
  created_at: string;
}

export default function ActivityPage() {
  const { schema } = useAdmin();
  const [items, setItems] = useState<Entry[]>([]);
  useEffect(() => {
    adm<{ items: Entry[] }>("/admin/activity?limit=300").then((r) => setItems(r.items));
  }, []);
  const labelOf = (k: string | null) => schema.collections.find((c) => c.key === k)?.singular.toLowerCase() ?? k ?? "";

  return (
    <>
      <PageTitle title="Activity log" description="Who changed what, and when. Kept for accountability." />
      <Panel>
        <table className="w-full text-sm">
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0">
                <td className="whitespace-nowrap px-5 py-3 text-muted">
                  {new Date(a.created_at.replace(" ", "T") + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-5 py-3">
                  <b className="font-semibold">{a.user_name}</b> {a.action} {a.collection && a.item_title && <span className="text-muted">{labelOf(a.collection)}</span>}{" "}
                  {a.item_title && <span>“{a.item_title}”</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <p className="p-10 text-center text-sm text-muted">Nothing yet.</p>}
      </Panel>
    </>
  );
}
