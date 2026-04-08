import type { Metadata } from "next";
import VisitClient from "@/components/features/VisitClient";

export const metadata: Metadata = {
  title: "새가족 안내",
  description:
    "청파중앙교회에 처음 오시는 분을 환영합니다. 예배 시간, 오시는 길, 자녀 프로그램 등 방문 전 알아두실 내용을 안내합니다.",
  openGraph: {
    title: "새가족 안내 | 청파중앙교회",
    description:
      "청파중앙교회에 처음 오시는 분을 환영합니다. 예배 시간, 오시는 길, FAQ를 확인하세요.",
  },
};

export default function VisitPage() {
  return <VisitClient />;
}
