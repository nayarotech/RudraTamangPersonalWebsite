import type { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

const paths: Record<string, string> = {
  facebook:
    "M13.5 21v-7.5h2.5l.4-3H13.5V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z",
  instagram:
    "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM21 8.3c0-1.3-.4-2.6-1.3-3.5S17.5 3.5 16.2 3.5C14.9 3.4 9.1 3.4 7.8 3.5 6.5 3.5 5.2 3.9 4.3 4.8S3 7 3 8.3c-.1 1.3-.1 7.1 0 8.4 0 1.3.4 2.6 1.3 3.5s2.2 1.3 3.5 1.3c1.3.1 7.1.1 8.4 0 1.3 0 2.6-.4 3.5-1.3s1.3-2.2 1.3-3.5c.1-1.3.1-7.1 0-8.4Z",
  x: "M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3Zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5Z",
  tiktok:
    "M16.6 3h-3.2v12.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.5h-.8a5.9 5.9 0 1 0 5.9 5.9V9.1a7.6 7.6 0 0 0 4.4 1.4V7.3a4.4 4.4 0 0 1-4.4-4.3Z",
};

export const SOCIALS = ["facebook", "youtube", "instagram", "x", "tiktok"] as const;

export function SocialLinks({ site, className, iconClass }: { site: Item; className?: string; iconClass?: string }) {
  const links = SOCIALS.filter((k) => typeof site[k] === "string" && site[k]);
  if (!links.length) return null;
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {links.map((k) => (
        <li key={k}>
          <a
            href={site[k] as string}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={k === "x" ? "X (Twitter)" : k[0].toUpperCase() + k.slice(1)}
            className={cn("flex size-9 items-center justify-center transition-colors", iconClass)}
          >
            <svg viewBox="0 0 24 24" className="size-[18px] fill-current" aria-hidden>
              <path d={paths[k]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
