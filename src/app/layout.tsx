import type { Metadata } from "next";
import { preload } from "react-dom";
// Noto Serif KR is vendored (scripts/fonts/fetch-noto-serif-kr.mjs) so the
// build never downloads fonts. Imported before globals.css like next/font was.
import "./fonts/noto-serif-kr.css";
import { NOTO_SERIF_KR_PRELOAD } from "./fonts/noto-serif-kr";
// Pretendard is vendored the same way (scripts/fonts/fetch-pretendard.mjs).
import "./fonts/pretendard.css";
import { PRETENDARD_PRELOAD } from "./fonts/pretendard";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SiteProvider } from "@/components/layout/SiteProvider";
import { getSite } from "@/lib/content";
import { JsonLd, websiteJsonLd } from "@/lib/jsonld";
import { rssAlternate } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import { buildSiteSummary } from "@/lib/site-summary";

// Same file next/font preloaded before (the latin subset), from the same
// content-versioned folder as the CSS. Korean slices are fetched on demand
// through unicode-range.
const SERIF_PRELOAD = NOTO_SERIF_KR_PRELOAD;

export function generateMetadata(): Metadata {
  const site = getSite();
  const codes = site.verification;
  return {
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    keywords: [site.name, site.nameEn, site.denomination, "용산구", "청파동", "교회", "서울교회", "용산교회"],
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: site.name,
      title: site.name,
      description: site.description,
      // og:url은 페이지마다 pageMetadata()가 자기 경로로 넣는다(src/lib/metadata.ts).
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
    },
    metadataBase: new URL(SITE_URL),
    // RSS only; pages add the same link next to their canonical (pageMetadata).
    alternates: rssAlternate(site),
    ...(codes?.google || codes?.naver
      ? {
          verification: {
            ...(codes.google ? { google: codes.google } : {}),
            ...(codes.naver ? { other: { "naver-site-verification": codes.naver } } : {}),
          },
        }
      : {}),
    // canonical은 페이지마다 달라야 하므로 여기에 두지 않는다.
    // 루트에 두면 모든 하위 페이지가 홈을 canonical로 선언해 색인에서 빠진다.
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  preload(SERIF_PRELOAD, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  // The body-text slice with the most common menu/heading syllables.
  preload(PRETENDARD_PRELOAD, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <SiteProvider site={buildSiteSummary(getSite())}>
          <Header />
          {/* Pages render their own <main>; a second one here would nest landmarks. */}
          <div className="flex-1">{children}</div>
          {/* 빌드한 해를 넘겨 서버 HTML과 첫 클라이언트 렌더의 연도를 맞춘다 */}
          <Footer buildYear={new Date().getFullYear()} />
        </SiteProvider>
        <JsonLd data={websiteJsonLd(getSite())} />
      </body>
    </html>
  );
}
