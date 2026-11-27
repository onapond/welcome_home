// /llms.txt — AI 검색 · 챗봇이 읽는 교회 요약 (https://llmstxt.org 형식).
// 빌드 때 content/ 파일에서 한 번 만든다.
import { getSermons, getSite } from "@/lib/content";
import { fullAddress } from "@/lib/content/site-format";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const PAGES: [name: string, path: string, note: string][] = [
  ["새가족 안내", "/visit", "처음 오시는 분 안내 · 자주 묻는 질문 · 방문 예약"],
  ["예배 안내", "/visit/service-times", "정기 예배와 특별 예배 시간 · 장소"],
  ["교회소개", "/about", "비전 · 담임목사 · 연혁"],
  ["설교", "/sermons", "설교 영상과 본문"],
  ["소식 & 공지", "/news", "교회 공지와 소식"],
  ["주보", "/news/bulletin", "주간 주보"],
  ["공동체", "/community", "청년부 · 청소년부 · 선교"],
  ["문의", "/contact", "연락처와 문의"],
];

export function GET() {
  const site = getSite();
  const latest = getSermons().slice(0, 5);
  const lines = [
    `# ${site.name} (${site.nameEn})`,
    "",
    `> ${site.description}`,
    "",
    `- 교단: ${site.denomination}`,
    `- 담임목사: ${site.pastor}`,
    `- 설립: ${site.founded}년`,
    `- 비전: ${site.vision}`,
    `- 주소: ${fullAddress(site.address)}`,
    `- 전화: ${site.phone}${site.fax ? ` · 팩스 ${site.fax}` : ""}`,
    ...(site.email ? [`- 이메일: ${site.email}`] : []),
    ...(site.sns.youtube ? [`- 유튜브: ${site.sns.youtube}`] : []),
    ...(site.sns.instagram ? [`- 인스타그램: ${site.sns.instagram}`] : []),
    "",
    "## 예배 시간",
    "",
    ...site.services.map((s) => `- ${s.name}: ${s.day} ${s.time}${s.place ? ` · ${s.place}` : ""}`),
    ...site.specialServices.map((s) => `- ${s.name}: ${s.schedule}`),
    "",
    "## 주요 페이지",
    "",
    ...PAGES.map(([name, path, note]) => `- [${name}](${absoluteUrl(path)}): ${note}`),
    ...(latest.length
      ? [
          "",
          "## 최근 설교",
          "",
          ...latest.map(
            (s) => `- [${s.title}](${absoluteUrl(`/sermons/${s.id}`)}): ${s.date}${s.scripture ? ` · ${s.scripture}` : ""}`,
          ),
        ]
      : []),
    "",
    "## Optional",
    "",
    `- [사이트맵](${absoluteUrl("/sitemap.xml")})`,
    `- [RSS](${absoluteUrl("/rss.xml")}): 소식 · 설교 · 영상 최신 50건`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
