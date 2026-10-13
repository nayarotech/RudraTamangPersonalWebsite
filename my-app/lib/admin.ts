"use client";

import type { CollectionDef, FieldDef } from "./types";

export class AdminError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Same-origin call to the backend (proxied by Next rewrites). */
export async function adm<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    credentials: "same-origin",
    ...rest,
    headers: json !== undefined ? { "Content-Type": "application/json", ...rest.headers } : rest.headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 401 && !path.startsWith("/auth/login")) {
    // Full reload so every piece of client state is dropped with the session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new AdminError("Session expired", 401);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminError(data.error ?? `Request failed (${res.status})`, res.status, data.fields);
  return data as T;
}

export interface UploadedFile {
  id: number;
  url: string;
  original_name: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
}

/** Upload with progress (fetch can't report upload progress). */
export function upload(files: File[], onProgress?: (pct: number) => void): Promise<UploadedFile[]> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: { files?: UploadedFile[]; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve(data.files ?? []);
      else reject(new Error(data.error ?? `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection."));
    xhr.send(form);
  });
}

export interface Schema {
  collections: CollectionDef[];
  settings: FieldDef[];
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
}

export function relativeTime(value: string) {
  const d = new Date(value.includes("T") ? value : value.replace(" ", "T") + "Z");
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
