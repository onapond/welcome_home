import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import Image from "next/image";
import { mediaUrl } from "@/lib/media";

// Safe mode only: no raw HTML (rehype-raw is intentionally not used).
const components: Components = {
  h1: ({ children }) => (
    <h2 className="font-serif text-2xl font-bold mt-10 mb-4" style={{ color: "var(--color-dark)" }}>
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-xl font-bold mt-10 mb-3" style={{ color: "var(--color-dark)" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-lg font-bold mt-8 mb-2" style={{ color: "var(--color-dark)" }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-[0.95rem] leading-8 my-4" style={{ color: "var(--color-dark)" }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-1.5 leading-8">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-1.5 leading-8">{children}</ol>,
  li: ({ children }) => (
    <li className="text-[0.95rem]" style={{ color: "var(--color-dark)" }}>
      {children}
    </li>
  ),
  a: ({ href, children }) => {
    const external = typeof href === "string" && /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className="underline underline-offset-2 font-medium"
        style={{ color: "var(--color-primary)" }}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote
      className="my-6 pl-5 py-1"
      style={{ borderLeft: "3px solid var(--color-secondary)", color: "var(--color-dark-soft)" }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8" style={{ borderColor: "rgba(43,58,140,0.12)" }} />,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  // Body images use the same path rules as front matter (store key, /path,
  // https://) via mediaUrl(). Size is unknown, so width/height are only
  // placeholders and CSS keeps the real aspect ratio.
  img: ({ src, alt }) =>
    typeof src === "string" && src ? (
      <Image
        src={mediaUrl(src)}
        alt={alt ?? ""}
        width={1600}
        height={1067}
        sizes="(max-width: 768px) 100vw, 768px"
        className="my-6 rounded-xl w-full h-auto"
      />
    ) : null,
};

export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
