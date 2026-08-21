import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { SITE_URL } from "@/lib/site";

const notoSerifKR = Noto_Serif_KR({
  variable: "--font-noto-serif-kr",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "청파중앙교회",
    template: "%s | 청파중앙교회",
  },
  description:
    "서울 용산구 청파동에 위치한 청파중앙교회입니다. 21세기 지도자를 길러내는 대한예수교 장로회 교회.",
  keywords: ["청파중앙교회", "용산구", "청파동", "장로교", "교회", "서울교회", "용산교회"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "청파중앙교회",
    title: "청파중앙교회",
    description:
      "서울 용산구 청파동에 위치한 청파중앙교회입니다. 21세기 지도자를 길러내는 교회.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "청파중앙교회",
    description: "서울 용산구 청파동에 위치한 청파중앙교회입니다.",
  },
  metadataBase: new URL(SITE_URL),
  // canonical은 페이지마다 달라야 하므로 여기에 두지 않는다.
  // 루트에 두면 모든 하위 페이지가 홈을 canonical로 선언해 색인에서 빠진다.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
