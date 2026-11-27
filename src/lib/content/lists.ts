import { z } from "zod";
import { getSite } from "./index";
import { ContentError, loadYaml } from "./load";
import { transportMap } from "./pages";
import { fillTokens } from "./tokens";

// content/pages/lists.yaml — 설교 · 찬양 · 소식 · 주보 · 갤러리 · 영상 목록 페이지의 머리글 문구.

const FILE = "pages/lists.yaml";

const text = z.string().trim().min(1, "비워 둘 수 없습니다");

const listPageSchema = z
  .object({
    label: text,
    title: text,
    heading: text.optional(),
    intro: text,
    description: text,
  })
  .strict();

export const listsSchema = z
  .object({
    sermons: listPageSchema,
    praise: listPageSchema,
    news: listPageSchema,
    bulletin: listPageSchema,
    gallery: listPageSchema,
    videos: listPageSchema,
  })
  .strict();

export type ListKey = keyof z.infer<typeof listsSchema>;

export interface ListPage {
  label: string;
  /** 페이지 제목 (메타데이터 · 탭) */
  title: string;
  /** 머리글 큰 제목 */
  heading: string;
  intro: string;
  description: string;
}

/**
 * {{ }} 자리표시는 다른 pages/*.yaml과 같은 공통 치환기(tokens.ts)를 쓴다.
 * 파일 전체를 치환하므로 어느 목록을 부르든 잘못된 표시는 모두 함께 알린다.
 */
export function getListPage(key: ListKey): ListPage {
  const problems: string[] = [];
  const all = fillTokens(
    loadYaml(FILE, listsSchema),
    { site: getSite(), transport: transportMap() },
    `content/${FILE}`,
    problems,
  );
  if (problems.length) throw new ContentError(problems);
  const raw = all[key];
  return { ...raw, heading: raw.heading ?? raw.title };
}
