import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type { z } from "zod";

// All content lives in <repo>/content. Pages are statically generated, so
// these reads happen at build time; a bad file fails the build (and Vercel
// keeps serving the previous deployment) instead of shipping a broken page.
export const CONTENT_DIR = path.join(process.cwd(), "content");

const ID_PATTERN = /^[0-9a-z][0-9a-z-]*$/;

export class ContentError extends Error {
  constructor(problems: string[]) {
    super(
      `콘텐츠 파일 ${problems.length}곳에 문제가 있습니다:\n` +
        problems.map((p) => `  - ${p}`).join("\n"),
    );
    this.name = "ContentError";
  }
}

function rel(file: string): string {
  return path.relative(process.cwd(), file);
}

function formatIssues(file: string, error: z.ZodError): string[] {
  return error.issues.map((i) => {
    const where = i.path.length ? i.path.join(".") : "(파일 전체)";
    return `${rel(file)} → ${where}: ${i.message}`;
  });
}

// js-yaml turns unquoted `2026-11-23` into a UTC Date; the schema
// preprocessors in schema.ts normalize those back to strings.
function parseYaml(text: string): unknown {
  return yaml.load(text);
}

const cache = new Map<string, unknown>();

function memo<T>(key: string, load: () => T): T {
  // Cache only in production builds so `next dev` picks up edits immediately.
  if (process.env.NODE_ENV !== "production") return load();
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as T;
}

/** Read one YAML file (e.g. content/site.yaml) and validate it. */
export function loadYaml<S extends z.ZodType>(name: string, schema: S): z.output<S> {
  return memo(`yaml:${name}`, () => {
    const file = path.join(CONTENT_DIR, name);
    if (!fs.existsSync(file)) throw new ContentError([`${rel(file)} 파일이 없습니다`]);
    let data: unknown;
    try {
      data = parseYaml(fs.readFileSync(file, "utf8"));
    } catch (e) {
      throw new ContentError([`${rel(file)} → YAML 문법 오류: ${(e as Error).message}`]);
    }
    const result = schema.safeParse(data);
    if (!result.success) throw new ContentError(formatIssues(file, result.error));
    return result.data;
  });
}

type Entry<S extends z.ZodType> = z.output<S> & { id: string; body: string };

/**
 * Read every `*.md` in content/<dir>, validate front matter, and return the
 * items sorted by `sortKey` descending (newest first). Files starting with
 * `_` are ignored so templates can live next to real content.
 */
export function loadCollection<S extends z.ZodType>(
  dir: string,
  schema: S,
  sortKey: (item: z.output<S>) => string,
  reserved: readonly string[] = [],
): Entry<S>[] {
  return memo(`col:${dir}`, () => {
    const folder = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(folder)) return [];

    const problems: string[] = [];
    const items: Entry<S>[] = [];

    for (const name of fs.readdirSync(folder).sort()) {
      if (!name.endsWith(".md") || name.startsWith("_")) continue;
      const file = path.join(folder, name);
      const id = name.slice(0, -3);

      if (!ID_PATTERN.test(id)) {
        problems.push(
          `${rel(file)} → 파일 이름은 영문 소문자·숫자·하이픈만 씁니다 (예: 2026-11-23.md, 2026-11-23-2.md)`,
        );
        continue;
      }
      if (reserved.includes(id)) {
        problems.push(`${rel(file)} → '${id}'는 페이지 주소로 이미 쓰이는 이름이라 파일 이름으로 쓸 수 없습니다`);
        continue;
      }

      let parsed: matter.GrayMatterFile<string>;
      try {
        parsed = matter(fs.readFileSync(file, "utf8"), {
          engines: { yaml: (s: string) => parseYaml(s) as object },
        });
      } catch (e) {
        problems.push(`${rel(file)} → 머리말(--- 사이) 문법 오류: ${(e as Error).message}`);
        continue;
      }

      const result = schema.safeParse(parsed.data);
      if (!result.success) {
        problems.push(...formatIssues(file, result.error));
        continue;
      }
      items.push({ ...(result.data as object), id, body: parsed.content.trim() } as Entry<S>);
    }

    if (problems.length) throw new ContentError(problems);
    return items.sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || b.id.localeCompare(a.id));
  });
}
