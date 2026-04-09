import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    url: "https://chungpa21.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "청파중앙교회",
    description: "서울 용산구 청파동에 위치한 청파중앙교회입니다.",
  },
  metadataBase: new URL("https://chungpa21.org"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
