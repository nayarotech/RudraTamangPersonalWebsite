"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { adm } from "@/lib/admin";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setLoading(true);
    setError("");
    try {
      await adm("/auth/login", { method: "POST", json: data });
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") && next !== "/admin/login" ? next : "/admin");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" autoFocus />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {error && <p className="bg-danger/5 px-3 py-2 text-sm text-danger">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? <Loader2 className="size-4 animate-spin" /> : null} Sign in {!loading && <ArrowRight className="size-4" />}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-deep p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="grid-lines absolute inset-0" aria-hidden />
        <span className="relative flex size-11 items-center justify-center bg-blue font-serif text-lg italic">RT</span>
        <div className="relative">
          <p className="display text-5xl">Everything on the website, managed from one place.</p>
          <p className="mt-6 max-w-md text-white/60">News, achievements, documents, photos and every message from citizens.</p>
        </div>
        <p className="relative text-sm text-white/40">Authorised team members only.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="display text-4xl">Sign in</h1>
          <p className="mt-2 text-muted">Use your team account to continue.</p>
          <div className="mt-10">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
