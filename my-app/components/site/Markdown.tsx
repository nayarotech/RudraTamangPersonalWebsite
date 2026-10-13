import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Renders dashboard-written markdown. Raw HTML is never rendered. */
export function Markdown({ children, className }: { children: unknown; className?: string }) {
  if (typeof children !== "string" || !children.trim()) return null;
  return (
    <div className={cn("prose-site", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
