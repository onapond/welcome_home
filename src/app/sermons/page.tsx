import { getAllSermons } from "@/lib/sanity/queries";
import SermonsClient from "@/components/features/SermonsClient";

// ISR: 1시간마다 재생성
export const revalidate = 3600;

export const metadata = {
  title: "설교 아카이브",
  description: "청파중앙교회 설교 말씀 아카이브입니다. 시리즈별, 날짜별로 검색하고 유튜브로 시청하세요.",
};

export default async function SermonsPage() {
  const sermons = await getAllSermons();
  return <SermonsClient sermons={sermons} />;
}
