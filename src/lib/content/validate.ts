import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIR, ContentError } from "./load";
import {
  getAlbums,
  getBulletins,
  getEvents,
  getHistory,
  getNews,
  getPraise,
  getSermons,
  getSite,
  getStaff,
} from "./index";
import { PAGE_GETTERS } from "./pages";
import { getListPage, listsSchema } from "./lists";

const IGNORED_FILES = new Set([".gitkeep", ".DS_Store"]);

/**
 * content/pages/ holds a fixed set of files, one per page. A file nobody reads
 * (e.g. a copy named extra.yaml) would silently change nothing, so it is an
 * error that names the files that are read.
 */
function checkPagesFolder(): void {
  const supported = [...Object.keys(PAGE_GETTERS), "lists"].map((n) => `${n}.yaml`).sort();
  const folder = path.join(CONTENT_DIR, "pages");
  if (!fs.existsSync(folder)) return; // reported by the page getters ("파일이 없습니다")
  const problems = fs
    .readdirSync(folder)
    .filter((name) => !IGNORED_FILES.has(name) && !supported.includes(name))
    .sort()
    .map(
      (name) =>
        `${path.relative(process.cwd(), path.join(folder, name))} → 쓰지 않는 파일입니다. pages/ 폴더에는 ${supported.join(" · ")}만 둡니다 (페이지 문구는 이 중 해당 파일을 고칩니다)`,
    );
  if (problems.length) throw new ContentError(problems);
}

/**
 * Read and validate every content file, including ones no page renders yet
 * (e.g. events). Called from src/app/sitemap.ts, which every build generates,
 * so a broken file anywhere under content/ fails the build. All problems are
 * collected and reported together.
 */
export function validateAllContent(): void {
  const getters: (() => unknown)[] = [
    getSite,
    getHistory,
    getStaff,
    getSermons,
    getPraise,
    getNews,
    getBulletins,
    getAlbums,
    getEvents,
    checkPagesFolder,
    ...Object.values(PAGE_GETTERS),
    ...listsSchema.keyof().options.map((key) => () => getListPage(key)),
  ];
  const problems: string[] = [];
  for (const get of getters) {
    try {
      get();
    } catch (e) {
      if (!(e instanceof ContentError)) throw e;
      for (const p of e.problems) if (!problems.includes(p)) problems.push(p);
    }
  }
  if (problems.length) throw new ContentError(problems);
}
