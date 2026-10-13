"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminContext";
import { Badge, PageTitle, Panel } from "@/components/admin/UI";
import { adm, relativeTime } from "@/lib/admin";

interface Member {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  last_login_at: string | null;
}

export default function TeamPage() {
  const { user, toast } = useAdmin();
  const [items, setItems] = useState<Member[]>([]);
  const [editing, setEditing] = useState<Partial<Member> | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    adm<{ items: Member[] }>("/admin/users").then((r) => setItems(r.items));
  }, []);
  useEffect(load, [load]);

  if (user.role !== "admin") return <p>Only administrators can manage the team.</p>;

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setError("");
    try {
      await adm(editing?.id ? `/admin/users/${editing.id}` : "/admin/users", { method: editing?.id ? "PUT" : "POST", json: data });
      toast(editing?.id ? "Team member updated" : "Team member added");
      setEditing(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove(m: Member) {
    if (!confirm(`Remove ${m.name}'s access?`)) return;
    try {
      await adm(`/admin/users/${m.id}`, { method: "DELETE" });
      toast("Removed");
      load();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  return (
    <>
      <PageTitle
        title="Team"
        description="Admins can do everything. Editors manage content and the inbox, but not the team."
        actions={
          <button type="button" onClick={() => setEditing({ role: "editor" })} className="btn btn-primary h-10">
            <Plus className="size-4" /> Add member
          </button>
        }
      />
      <Panel>
        <ul>
          {items.map((m) => (
            <li key={m.id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
              <span className="flex size-10 items-center justify-center rounded-full bg-blue-soft text-sm font-semibold text-blue">
                {m.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {m.name} {m.id === user.id && <span className="text-xs text-muted">(you)</span>}
                </p>
                <p className="truncate text-sm text-muted">{m.email}</p>
              </div>
              <span className="hidden text-xs text-muted sm:block">{m.last_login_at ? `Last seen ${relativeTime(m.last_login_at)}` : "Never signed in"}</span>
              <Badge>{m.role === "admin" ? "Admin" : "Editor"}</Badge>
              <button type="button" onClick={() => setEditing(m)} className="flex size-8 items-center justify-center text-muted hover:bg-paper hover:text-ink" aria-label="Edit">
                <Pencil className="size-4" />
              </button>
              {m.id !== user.id && (
                <button type="button" onClick={() => remove(m)} className="flex size-8 items-center justify-center text-muted hover:bg-paper hover:text-danger" aria-label="Remove">
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="reveal w-full max-w-md bg-white">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <p className="font-semibold">{editing.id ? "Edit member" : "Add team member"}</p>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="field-label" htmlFor="m-name">Name</label>
                <input id="m-name" name="name" defaultValue={editing.name} required className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="m-email">Email</label>
                <input id="m-email" name="email" type="email" defaultValue={editing.email} required className="field" />
              </div>
              <div>
                <label className="field-label" htmlFor="m-role">Role</label>
                <select id="m-role" name="role" defaultValue={editing.role} className="field">
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="m-pass">{editing.id ? "New password (leave empty to keep)" : "Password"}</label>
                <input id="m-pass" name="password" type="password" minLength={8} required={!editing.id} autoComplete="new-password" className="field" />
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
            </div>
            <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
              <button type="button" onClick={() => setEditing(null)} className="btn btn-outline h-10">Cancel</button>
              <button type="submit" className="btn btn-primary h-10">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
