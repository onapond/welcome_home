import { ContentError } from "./load";
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
