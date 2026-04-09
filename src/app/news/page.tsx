import Link from "next/link";
import { FileText, Download, Megaphone, Newspaper, BookHeart, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { getAllPosts, getAllBulletins } from "@/lib/sanity/queries";
import type { Post, Bulletin } from "@/lib/sanity/types";

// ISR: 1시간마다 재생성
export const revalidate = 3600;

export const metadata = {
  title: "소식",
  description: "청파중앙교회 공지사항, 교회 소식, 주보를 확인하세요.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

const CATEGORY_MAP: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  notice: { label: "공지", Icon: Megaphone, color: "var(--color-primary)" },
  news:   { label: "소식", Icon: Newspaper, color: "var(--color-secondary)" },
  testimony: { label: "간증", Icon: BookHeart, color: "var(--color-accent)" },
};

// ─── Fallback data (Sanity 미연동 시) ────────────────────────────────────────

const FALLBACK_POSTS: Post[] = [
  {
    _id: "1", _type: "post",
    title: "2026년 봄 수련회 안내",
    slug: { current: "2026-spring-retreat" },
    category: "notice",
    date: "2026-04-01T09:00:00+09:00",
    featured: true,
  },
  {
    _id: "2", _type: "post",
    title: "4월 교회 소식",
    slug: { current: "2026-april-news" },
    category: "news",
    date: "2026-04-01T08:00:00+09:00",
    featured: false,
  },
  {
    _id: "3", _type: "post",
    title: "새가족 환영 안내",
    slug: { current: "new-member-welcome" },
    category: "notice",
    date: "2026-03-30T09:00:00+09:00",
    featured: true,
  },
  {
    _id: "4", _type: "post",
    title: "3월 선교 헌금 보고",
    slug: { current: "march-mission-report" },
    category: "news",
    date: "2026-03-25T09:00:00+09:00",
    featured: false,
  },
  {
    _id: "5", _type: "post",
    title: "세례 교육 안내 (4월)",
    slug: { current: "baptism-april" },
    category: "notice",
    date: "2026-03-20T09:00:00+09:00",
    featured: false,
  },
];

const FALLBACK_BULLETINS: Bulletin[] = [
  { _id: "b1", _type: "bulletin", date: "2026-04-06" },
  { _id: "b2", _type: "bulletin", date: "2026-03-30" },
  { _id: "b3", _type: "bulletin", date: "2026-03-23" },
  { _id: "b4", _type: "bulletin", date: "2026-03-16" },
  { _id: "b5", _type: "bulletin", date: "2026-03-09" },
];

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const cat = CATEGORY_MAP[post.category] ?? CATEGORY_MAP.notice;
  const CatIcon = cat.Icon;

  return (
    <Link
      href={post.slug?.current ? `/news/${post.slug.current}` : "#"}
      className="group flex items-start gap-4 rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: "var(--color-white)",
        border: "1px solid rgba(43,58,140,0.07)",
      }}
    >
      {/* Icon box */}
      <div
        className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl mt-0.5"
        style={{ backgroundColor: "var(--color-bg-warm)" }}
      >
        <CatIcon className="w-5 h-5" style={{ color: cat.color }} strokeWidth={1.75} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: cat.color }}
          >
            {cat.label}
          </span>
          {post.featured && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "var(--color-dark)" }}
            >
              주요
            </span>
          )}
        </div>
        <p
          className="text-sm font-semibold leading-snug group-hover:underline underline-offset-2"
          style={{ color: "var(--color-dark)" }}
        >
          {post.title}
        </p>
        <p className="text-xs mt-1.5" style={{ color: "var(--color-dark-soft)" }}>
          {fmtDate(post.date)}
        </p>
      </div>
    </Link>
  );
}

// ─── BulletinRow ─────────────────────────────────────────────────────────────

function BulletinRow({ bulletin }: { bulletin: Bulletin }) {
  const label = new Date(bulletin.date).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  }) + " 주보";

  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
      style={{
        backgroundColor: "var(--color-white)",
        border: "1px solid rgba(43,58,140,0.07)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ backgroundColor: "var(--color-bg-warm)" }}
        >
          <FileText className="w-4 h-4" style={{ color: "var(--color-primary)" }} strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium" style={{ color: "var(--color-dark)" }}>
          {label}
        </span>
      </div>

      {bulletin.pdfUrl ? (
        <a
          href={bulletin.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:brightness-110"
          style={{ backgroundColor: "var(--color-primary)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="w-3.5 h-3.5" />
          PDF 보기
        </a>
      ) : (
        <span
          className="text-xs px-4 py-2 rounded-full"
          style={{
            color: "var(--color-dark-soft)",
            border: "1px solid rgba(43,58,140,0.12)",
          }}
        >
          준비 중
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsPage() {
  const [posts, bulletins] = await Promise.all([
    getAllPosts(),
    getAllBulletins(),
  ]);

  const displayPosts = posts.length > 0 ? posts : FALLBACK_POSTS;
  const displayBulletins = bulletins.length > 0 ? bulletins : FALLBACK_BULLETINS;

  const featured = displayPosts.filter((p) => p.featured).slice(0, 3);
  const rest = displayPosts.filter((p) => !p.featured);

  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-4"
        style={{
          minHeight: "36vh",
          background:
            "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 60%, var(--color-secondary) 100%)",
        }}
        aria-label="소식 히어로"
      >
        <div className="flex flex-col items-center gap-4 max-w-xl">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-[4px] uppercase"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "var(--color-accent)",
              border: "1px solid rgba(212,168,67,0.35)",
            }}
          >
            소식
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            교회 소식
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            공지사항, 행사 안내, 주보를 확인하세요.
          </p>
        </div>
      </section>

      {/* ── 주요 소식 ── */}
      {featured.length > 0 && (
        <section className="py-16 lg:py-20" style={{ backgroundColor: "var(--color-primary)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <p
              className="text-xs font-semibold uppercase tracking-[5px] mb-8 text-center"
              style={{ color: "var(--color-secondary)" }}
            >
              주요 소식
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {featured.map((post) => {
                const cat = CATEGORY_MAP[post.category] ?? CATEGORY_MAP.notice;
                const CatIcon = cat.Icon;
                return (
                  <Link
                    key={post._id}
                    href={post.slug?.current ? `/news/${post.slug.current}` : "#"}
                    className="group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-200 hover:brightness-110"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CatIcon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-accent)" }} strokeWidth={1.75} />
                      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--color-accent)" }}>
                        {cat.label}
                      </span>
                    </div>
                    <p className="font-serif text-sm font-bold text-white leading-snug group-hover:underline underline-offset-2">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-auto">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.45)" }} strokeWidth={1.75} />
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                        {fmtDate(post.date)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 공지사항 & 소식 ── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="공지 & 소식" title="전체 소식" align="left" className="mb-8" />
          {rest.length > 0 ? (
            <div className="flex flex-col gap-3">
              {rest.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayPosts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── 주보 ── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: "var(--color-white)" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="주보" title="주보 아카이브" align="center" className="mb-8" />
          <p className="text-sm text-center mb-10" style={{ color: "var(--color-dark-soft)" }}>
            매주 주일 주보를 PDF로 다운로드하실 수 있습니다.
          </p>
          <div className="flex flex-col gap-3">
            {displayBulletins.map((b) => (
              <BulletinRow key={b._id} bulletin={b} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
