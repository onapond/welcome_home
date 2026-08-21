import type { Metadata } from "next";
import ContactClient from "@/components/features/ContactClient";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "문의",
  description:
    "청파중앙교회 문의 안내. 전화 02-714-0041~3, 서울특별시 용산구 청파로73길 58. 예배·새가족 등록·대관 문의를 남겨주세요.",
  openGraph: {
    title: "문의 | 청파중앙교회",
    description:
      "청파중앙교회에 궁금한 점을 문의해 주세요. 전화, 주소, 오시는 길을 함께 안내합니다.",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
