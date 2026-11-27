import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SiteProvider } from "@/components/layout/SiteProvider";
import { getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { buildSiteSummary } from "@/lib/site-summary";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export function generateMetadata(): Metadata {
  const site = getSite();
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
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: site.name,
      description: site.description,
    },
    metadataBase: new URL(SITE_URL),
    // canonical은 페이지마다 달라야 하므로 여기에 두지 않는다.
    // 루트에 두면 모든 하위 페이지가 홈을 canonical로 선언해 색인에서 빠진다.
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteProvider site={buildSiteSummary(getSite())}>
          <Header />
          {/* Pages render their own <main>; a second one here would nest landmarks. */}
          <div className="flex-1">{children}</div>
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
