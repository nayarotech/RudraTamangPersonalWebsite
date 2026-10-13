"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { adm, type Schema, type SessionUser } from "@/lib/admin";

interface Ctx {
  user: SessionUser;
  schema: Schema;
  unread: { messages: number; volunteers: number; grievances: number };
  refreshUnread: () => void;
  toast: (message: string, tone?: "success" | "error") => void;
}

const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin outside AdminProvider");
  return ctx;
}

type Toast = { id: number; message: string; tone: "success" | "error" };

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [schema, setSchema] = useState<Schema | null>(null);
  const [unread, setUnread] = useState({ messages: 0, volunteers: 0, grievances: 0 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [failed, setFailed] = useState("");

  const refreshUnread = useCallback(() => {
    adm<{ unread: Ctx["unread"] }>("/admin/overview")
      .then((o) => setUnread(o.unread))
      .catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([adm<{ user: SessionUser }>("/auth/me"), adm<Schema>("/admin/schema")])
      .then(([me, s]) => {
        setUser(me.user);
        setSchema(s);
        refreshUnread();
      })
      .catch((e) => setFailed(e.message));
  }, [refreshUnread]);

  const toast = useCallback((message: string, tone: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  if (failed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper p-6 text-center">
        <div>
          <p className="font-semibold">Couldn&apos;t load the dashboard.</p>
          <p className="mt-2 text-sm text-muted">{failed}. Is the backend running?</p>
        </div>
      </div>
    );
  }
  if (!user || !schema) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="size-6 animate-spin rounded-full border-2 border-blue border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminCtx.Provider value={{ user, schema, unread, refreshUnread, toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`reveal pointer-events-auto min-w-64 max-w-sm px-4 py-3 text-sm font-medium text-white shadow-lg ${t.tone === "error" ? "bg-danger" : "bg-ink"}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </AdminCtx.Provider>
  );
}
