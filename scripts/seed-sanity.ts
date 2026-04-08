/**
 * Sanity 초기 샘플 데이터 시딩 스크립트
 *
 * 사용법:
 *   1. .env.local 에 SANITY_API_WRITE_TOKEN 설정
 *   2. npx tsx scripts/seed-sanity.ts
 *
 * 필요 패키지: npx tsx (또는 ts-node)
 *   npm install -D tsx
 */

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

// ─── Helper ──────────────────────────────────────────────────────────────────

async function createDoc(doc: Record<string, unknown>) {
  const result = await client.create(doc);
  console.log(`✓ Created [${doc._type}] "${doc.title ?? doc.date}" → ${result._id}`);
  return result;
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

async function seedSermonSeries() {
  console.log("\n📚 Seeding sermon series...");

  const series = [
    {
      _type: "sermonSeries",
      title: "요한복음",
      description: "생명의 말씀, 요한복음을 통해 예수 그리스도를 깊이 알아갑니다.",
      startDate: "2026-01-05",
    },
    {
      _type: "sermonSeries",
      title: "산상수훈",
      description: "팔복과 산상수훈을 통해 천국 시민의 삶을 배웁니다.",
      startDate: "2026-02-02",
      endDate: "2026-02-28",
    },
    {
      _type: "sermonSeries",
      title: "특별설교",
      description: "절기 및 특별 주일 설교 모음입니다.",
      startDate: "2026-01-01",
    },
  ];

  const results: Record<string, string> = {};
  for (const s of series) {
    const r = await createDoc(s);
    results[s.title] = r._id;
  }
  return results;
}

async function seedSermons(seriesIds: Record<string, string>) {
  console.log("\n🎤 Seeding sermons...");

  const sermons = [
    {
      title: "새 하늘과 새 땅",
      date: "2026-04-06",
      preacher: "김항우 목사",
      scripture: "요한계시록 21:1-8",
      series: { _type: "reference", _ref: seriesIds["특별설교"] },
      summary: "하나님이 예비하신 새 하늘과 새 땅을 바라보며 현재의 삶을 살아가는 소망에 대한 말씀.",
    },
    {
      title: "두려워하지 말라, 내가 너와 함께 함이라",
      date: "2026-03-30",
      preacher: "김항우 목사",
      scripture: "이사야 41:10",
      summary: "하나님께서 우리와 함께하심을 약속하시는 말씀을 통해 두려움을 넘어서는 믿음을 갖습니다.",
    },
    {
      title: "주 안에서 항상 기뻐하라",
      date: "2026-03-23",
      preacher: "김항우 목사",
      scripture: "빌립보서 4:4-7",
      summary: "어떠한 상황에서도 주 안에서 기뻐할 수 있는 비결을 빌립보서를 통해 배웁니다.",
    },
    {
      title: "일어나 함께 가자",
      date: "2026-03-16",
      preacher: "김항우 목사",
      scripture: "미가 6:8",
      series: { _type: "reference", _ref: seriesIds["특별설교"] },
      summary: "2026년 표어 '일어나 함께가자'의 의미를 미가서를 통해 선포합니다.",
    },
    {
      title: "우리가 사랑함은 그가 먼저 사랑하셨음이라",
      date: "2026-03-09",
      preacher: "김항우 목사",
      scripture: "요한일서 4:19",
      summary: "하나님의 선행적 사랑이 우리 사랑의 근원임을 확인하는 말씀.",
    },
    {
      title: "하나님의 전신 갑주를 입으라",
      date: "2026-03-02",
      preacher: "김항우 목사",
      scripture: "에베소서 6:10-18",
      summary: "영적 전쟁을 위해 하나님이 예비하신 전신 갑주의 의미와 적용.",
    },
    {
      title: "믿음의 주요 온전하게 하시는 이",
      date: "2026-02-23",
      preacher: "김항우 목사",
      scripture: "히브리서 12:1-3",
      summary: "예수님을 바라보며 달려가는 신앙의 경주에 대한 말씀.",
    },
    {
      title: "너희는 세상의 빛이라",
      date: "2026-02-16",
      preacher: "김항우 목사",
      scripture: "마태복음 5:14-16",
      series: { _type: "reference", _ref: seriesIds["산상수훈"] },
      summary: "그리스도인이 이 세상에서 빛으로 살아가야 하는 사명에 대한 말씀.",
    },
    {
      title: "선한 목자이신 예수님",
      date: "2026-02-09",
      preacher: "김항우 목사",
      scripture: "요한복음 10:11-15",
      series: { _type: "reference", _ref: seriesIds["요한복음"] },
      summary: "양을 위해 목숨을 내어주시는 선한 목자 예수님을 묵상합니다.",
    },
    {
      title: "은혜 위에 은혜러라",
      date: "2026-02-02",
      preacher: "김항우 목사",
      scripture: "요한복음 1:16",
      series: { _type: "reference", _ref: seriesIds["요한복음"] },
      summary: "하나님의 은혜의 충만함, 곧 은혜 위에 은혜를 받은 성도의 삶에 대한 말씀.",
    },
  ];

  for (const s of sermons) {
    await createDoc({ _type: "sermon", ...s });
  }
}

async function seedEvents() {
  console.log("\n📅 Seeding events...");

  const events = [
    {
      _type: "event",
      title: "2026 봄 수련회",
      category: "retreat",
      date: "2026-04-18T09:00:00+09:00",
      endDate: "2026-04-19T18:00:00+09:00",
      location: "수련원 (미정)",
      description: [],
    },
    {
      _type: "event",
      title: "부활절 연합 예배",
      category: "worship",
      date: "2026-04-05T11:00:00+09:00",
      location: "본당",
    },
    {
      _type: "event",
      title: "청년부 United 정기 모임",
      category: "education",
      date: "2026-04-12T15:00:00+09:00",
      location: "청년부실",
    },
    {
      _type: "event",
      title: "선교 후원의 날",
      category: "mission",
      date: "2026-04-26T12:30:00+09:00",
      location: "교회 식당",
    },
  ];

  for (const e of events) {
    await createDoc(e);
  }
}

async function seedPosts() {
  console.log("\n📝 Seeding posts...");

  const posts = [
    {
      _type: "post",
      title: "2026년 봄 수련회 안내",
      slug: { _type: "slug", current: "2026-spring-retreat" },
      category: "notice",
      date: "2026-04-01T09:00:00+09:00",
      featured: true,
    },
    {
      _type: "post",
      title: "4월 교회 소식",
      slug: { _type: "slug", current: "2026-april-news" },
      category: "news",
      date: "2026-04-01T08:00:00+09:00",
      featured: false,
    },
    {
      _type: "post",
      title: "새가족 환영 안내",
      slug: { _type: "slug", current: "new-member-welcome" },
      category: "notice",
      date: "2026-03-30T09:00:00+09:00",
      featured: true,
    },
  ];

  for (const p of posts) {
    await createDoc(p);
  }
}

async function seedBulletins() {
  console.log("\n📄 Seeding bulletins...");

  const dates = ["2026-04-06", "2026-03-30", "2026-03-23"];
  for (const date of dates) {
    await createDoc({ _type: "bulletin", date });
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting Sanity seed...");
  console.log(`   Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production"}`);

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error("\n❌ NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Aborting.");
    process.exit(1);
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    console.error("\n❌ SANITY_API_WRITE_TOKEN is not set. Aborting.");
    process.exit(1);
  }

  const seriesIds = await seedSermonSeries();
  await seedSermons(seriesIds);
  await seedEvents();
  await seedPosts();
  await seedBulletins();

  console.log("\n✅ Seed complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
