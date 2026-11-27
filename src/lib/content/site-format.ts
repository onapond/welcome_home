// Pure helpers over site.yaml data. No file access and no imports of other
// content modules, so the loaders and the site summary can both use them
// without an import cycle.

import type { Site } from "./schema";

/** "도로명 (상세)" 한 줄 주소 */
export function fullAddress(address: Site["address"]): string {
  return address.detail ? `${address.road} (${address.detail})` : address.road;
}

export function latestMotto(site: Site): Site["mottos"][number] | undefined {
  return [...site.mottos].sort((a, b) => b.year - a.year)[0];
}

/**
 * 주일 실시간 예배 주소: site.yaml의 sns.live, 없으면 유튜브 채널 주소 + /live
 * (채널 · @핸들 주소일 때만). 둘 다 없으면 undefined.
 */
export function liveUrl(site: Site): string | undefined {
  if (site.sns.live) return site.sns.live;
  const yt = site.sns.youtube;
  if (!yt) return undefined;
  const m = yt.match(/^(https:\/\/(?:www\.)?youtube\.com\/(?:channel\/[\w-]+|@[\w.-]+))\/?$/);
  return m ? `${m[1]}/live` : undefined;
}
