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
