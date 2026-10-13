"use client";

import { useState } from "react";
import { useAdmin } from "@/components/admin/AdminContext";
import { PageTitle, Panel } from "@/components/admin/UI";
import { adm } from "@/lib/admin";

export default function AccountPage() {
  const { user, toast } = useAdmin();
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setError("");
    if (data.next !== data.confirm) return setError("The new passwords don't match.");
    try {
      await adm("/auth/password", { method: "POST", json: { current: data.current, next: data.next } });
      toast("Password changed");
      form.reset();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageTitle title="Your account" description={`${user.name} · ${user.email}`} />
      <Panel title="Change password" className="max-w-lg">
        <form onSubmit={submit} className="space-y-4 p-6">
          {[
            ["current", "Current password", "current-password"],
            ["next", "New password (8+ characters)", "new-password"],
            ["confirm", "Repeat new password", "new-password"],
          ].map(([name, label, ac]) => (
            <div key={name}>
              <label className="field-label" htmlFor={name}>{label}</label>
              <input id={name} name={name} type="password" required minLength={name === "current" ? 1 : 8} autoComplete={ac} className="field" />
            </div>
          ))}
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary h-10">Update password</button>
        </form>
      </Panel>
    </>
  );
}
