import "server-only";
import { cookies } from "next/headers";
import type { Lang } from "./types";

export const LANG_COOKIE = "lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  // Nepali by default; English only when the visitor has chosen it.
  return store.get(LANG_COOKIE)?.value === "en" ? "en" : "np";
}
