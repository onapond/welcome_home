import type { Metadata } from "next";
import { getPrivacyPage } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/metadata";

export function generateMetadata(): Metadata {
  const { meta } = getPrivacyPage();
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    ogDescription: meta.ogDescription,
    path: "/privacy",
  });
}

/** "2026-11-27" → "2026년 11월 27일" */
function koreanDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

export default function PrivacyPage() {
  const page = getPrivacyPage();

  return (
    <main style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-20">
        <header className="pb-8 border-b" style={{ borderColor: "rgba(43,58,140,0.12)" }}>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug" style={{ color: "var(--color-dark)" }}>
            {page.title}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed mt-4" style={{ color: "var(--color-dark-soft)" }}>
            {page.intro}
          </p>
        </header>

        <div className="mt-10 flex flex-col gap-10">
          {page.sections.map((section, i) => (
            <section key={section.title} aria-labelledby={`privacy-${i + 1}`}>
              <h2
                id={`privacy-${i + 1}`}
                className="font-serif text-lg sm:text-xl font-bold mb-3"
                style={{ color: "var(--color-primary)" }}
              >
                제{i + 1}조 {section.title}
              </h2>
              {section.paragraphs.map((p) => (
                <p key={p} className="text-sm sm:text-[15px] leading-relaxed mb-3" style={{ color: "var(--color-dark)" }}>
                  {p}
                </p>
              ))}
              {section.items.length > 0 && (
                <ul className="flex flex-col gap-2 mb-3 pl-5 list-disc marker:text-[var(--color-primary-light)]">
                  {section.items.map((item) => (
                    <li key={item} className="text-sm sm:text-[15px] leading-relaxed" style={{ color: "var(--color-dark)" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <p
          className="mt-12 pt-6 border-t text-sm font-semibold"
          style={{ borderColor: "rgba(43,58,140,0.12)", color: "var(--color-dark-soft)" }}
        >
          시행일: {koreanDate(page.effectiveDate)}
        </p>
      </div>
    </main>
  );
}
