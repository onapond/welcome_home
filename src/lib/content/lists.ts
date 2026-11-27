import { z } from "zod";
import { getSite } from "./index";
import { ContentError, loadYaml } from "./load";

// content/pages/lists.yaml — 설교 · 찬양 · 소식 · 주보 · 갤러리 목록 페이지의 머리글 문구.

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

const TOKEN = /\{\{\s*([^}]*?)\s*\}\}/g;

/** {{name}}만 교회 이름으로 바꾼다. 다른 표시는 파일 · 필드와 함께 오류로 알린다. */
function fill(value: string, field: string, name: string): string {
  return value.replace(TOKEN, (_, token: string) => {
    if (token === "name") return name;
    throw new ContentError([
      `content/${FILE} → ${field}: '{{${token}}}'는 쓸 수 없는 표시입니다 (목록 문구에는 {{name}}만 쓸 수 있습니다)`,
    ]);
  });
}

export function getListPage(key: ListKey): ListPage {
  const raw = loadYaml(FILE, listsSchema)[key];
  const name = getSite().name;
  const f = (field: keyof typeof raw, value: string) => fill(value, `${key}.${field}`, name);
  return {
    label: f("label", raw.label),
    title: f("title", raw.title),
    heading: f(raw.heading ? "heading" : "title", raw.heading ?? raw.title),
    intro: f("intro", raw.intro),
    description: f("description", raw.description),
  };
}
