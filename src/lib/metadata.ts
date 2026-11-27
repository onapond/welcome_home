// ──────────────────────────────────────────
// 페이지 메타데이터 — 모든 페이지가 이 함수로 title · canonical · 공유 태그를 만든다.
// canonical과 og:url이 같은 경로에서 나오므로 서로 어긋나지 않는다.
// 교회 이름 접미사(" | 청파중앙교회")는 루트 layout의 title 템플릿이 한 번만 붙인다.
// ──────────────────────────────────────────

import type { Metadata } from "next";
import { getSite, type Site } from "@/lib/content";
import { latestMotto } from "@/lib/content/site-format";
import { DEFAULT_OG_IMAGE } from "@/lib/jsonld";

export interface PageMetadataInput {
  /** 페이지 제목만. 비우면 홈 — 교회 이름이 제목이 된다. */
  title?: string;
  description: string;
  /** "/sermons/2026-04-05"처럼 /로 시작하는 경로 (metadataBase 기준으로 풀린다) */
  path: string;
  /** 공유 미리보기 이미지 (경로 또는 https 주소) */
  image?: string;
  /** 공유 미리보기에만 쓰는 설명. 없으면 description */
  ogDescription?: string;
  /** 설교 · 소식 같은 상세 글은 "article" */
  type?: "website" | "article";
}

/** <link rel="alternate" type="application/rss+xml"> (src/app/rss.xml/route.ts) */
export function rssAlternate(site: Site) {
  return { types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} 소식 · 설교` }] } };
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  ogDescription,
  type = "website",
}: PageMetadataInput): Metadata {
  const site = getSite();
  const shareTitle = title ? `${title} | ${site.name}` : site.name;
  const shareDescription = ogDescription ?? description;
  // No image → the default share image (src/app/opengraph-image.tsx). It has to
  // be named here: a page's openGraph replaces the parent's as a whole, so the
  // root file image is not inherited once openGraph is set.
  const images = image
    ? [{ url: image }]
    : [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${site.name} — ${latestMotto(site)?.text ?? site.description}`,
        },
      ];

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path, ...rssAlternate(site) },
    openGraph: {
      type,
      locale: "ko_KR",
      siteName: site.name,
      title: shareTitle,
      description: shareDescription,
      url: path,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images,
    },
  };
}
