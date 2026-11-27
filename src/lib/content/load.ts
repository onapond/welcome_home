import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { z } from "zod";
import { bodyImageProblems } from "./body";

// All content lives in <repo>/content. Pages are statically generated, so
// these reads happen at build time; a bad file fails the build (and Vercel
// keeps serving the previous deployment) instead of shipping a broken page.
export const CONTENT_DIR = path.join(process.cwd(), "content");

const ID_PATTERN = /^[0-9a-z][0-9a-z-]*$/;

export class ContentError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(
      `콘텐츠 파일 ${problems.length}곳에 문제가 있습니다:\n` +
        problems.map((p) => `  - ${p}`).join("\n"),
    );
    this.name = "ContentError";
    this.problems = problems;
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

/**
 * schema.safeParse(), but an unexpected exception inside a check becomes a
 * reported problem for this file, so one odd value never hides the others.
 */
function safeParse<S extends z.ZodType>(
  schema: S,
  data: unknown,
  file: string,
): { data: z.output<S> } | { problems: string[] } {
  try {
    const result = schema.safeParse(data);
    return result.success ? { data: result.data } : { problems: formatIssues(file, result.error) };
  } catch (e) {
    return { problems: [`${rel(file)} → 검사 중 예상 밖 오류가 났습니다 (${(e as Error).message}). 값의 형식을 확인해 주세요`] };
  }
}

// CORE_SCHEMA: plain strings, numbers, booleans, null, lists and maps only.
// Unlike the default schema it never turns `2026-11-23` into a Date, so the
// text the editor typed is what the schema validates (a bad date such as
// 2026-02-30 is rejected instead of silently becoming March 2).
function parseYaml(text: string): unknown {
  return yaml.load(text, { schema: yaml.CORE_SCHEMA });
}

/**
 * Split a Markdown file into YAML front matter and body. Hand-rolled on
 * purpose: generic front-matter libraries let the file choose its parser
 * (`---js`), which would evaluate code during the build.
 */
function splitFrontMatter(raw: string, file: string): { data: unknown; body: string } {
  const src = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const eol = src.indexOf("\n");
  const firstLine = eol === -1 ? src : src.slice(0, eol);
  if (firstLine !== "---") {
    if (firstLine.startsWith("---")) {
      throw new ContentError([
        `${rel(file)} → 첫 줄은 --- 만 적어야 합니다 (지금: '${firstLine}'). --- 뒤에 다른 글자를 붙일 수 없습니다`,
      ]);
    }
    throw new ContentError([`${rel(file)} → 파일 첫 줄이 --- 이어야 합니다 (머리말은 --- 와 --- 사이에 적습니다)`]);
  }
  const rest = src.slice(4);
  const close = /^---[ \t]*$/m.exec(rest);
  if (!close) throw new ContentError([`${rel(file)} → 머리말을 닫는 --- 줄이 없습니다`]);
  let data: unknown;
  try {
    data = parseYaml(rest.slice(0, close.index));
  } catch (e) {
    throw new ContentError([`${rel(file)} → 머리말(--- 사이) 문법 오류: ${(e as Error).message}`]);
  }
  return { data, body: rest.slice(close.index + close[0].length) };
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
    const result = safeParse(schema, data, file);
    if ("problems" in result) throw new ContentError(result.problems);
    return result.data;
  });
}

type Entry<S extends z.ZodType> = z.output<S> & { id: string; body: string };

// Besides `*.md` items a collection folder may hold templates/drafts (`_…`)
// and OS or git placeholder files. Anything else is reported.
const IGNORED_FILES = new Set([".gitkeep", ".DS_Store"]);

/**
 * Read every `*.md` in content/<dir>, validate front matter, and return the
 * items sorted by `sortKey` descending (newest first). Files starting with
 * `_` are ignored so templates can live next to real content. The folder must
 * exist (it may be empty), and unexpected files fail the build.
 */
export function loadCollection<S extends z.ZodType>(
  dir: string,
  schema: S,
  sortKey: (item: z.output<S>) => string,
  reserved: readonly string[] = [],
): Entry<S>[] {
  return memo(`col:${dir}`, () => {
    const folder = path.join(CONTENT_DIR, dir);
    if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
      throw new ContentError([`${rel(folder)} 폴더가 없습니다 (콘텐츠 폴더의 이름을 바꾸거나 지우면 안 됩니다)`]);
    }

    const problems: string[] = [];
    const items: Entry<S>[] = [];

    for (const name of fs.readdirSync(folder).sort()) {
      if (name.startsWith("_") || IGNORED_FILES.has(name)) continue;
      const file = path.join(folder, name);
      if (!name.endsWith(".md") || !fs.statSync(file).isFile()) {
        problems.push(
          `${rel(file)} → 이 폴더에는 .md 파일만 둡니다 (확장자는 소문자 .md. 쓰지 않을 파일은 이름 앞에 _ 를 붙입니다)`,
        );
        continue;
      }
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

      let parsed: { data: unknown; body: string };
      try {
        parsed = splitFrontMatter(fs.readFileSync(file, "utf8"), file);
      } catch (e) {
        if (!(e instanceof ContentError)) throw e;
        problems.push(...e.problems);
        continue;
      }

      // Front matter and body images are both checked, so one run lists every problem.
      const result = safeParse(schema, parsed.data, file);
      const body = parsed.body.trim();
      const bodyProblems = bodyImageProblems(body).map((p) => `${rel(file)} → ${p}`);
      if ("problems" in result || bodyProblems.length) {
        if ("problems" in result) problems.push(...result.problems);
        problems.push(...bodyProblems);
        continue;
      }
      items.push({ ...(result.data as object), id, body } as Entry<S>);
    }

    if (problems.length) throw new ContentError(problems);
    return items.sort((a, b) => sortKey(b).localeCompare(sortKey(a)) || b.id.localeCompare(a.id));
  });
}
