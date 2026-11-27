"use client";

import { createContext, useContext } from "react";
import type { SiteSummary } from "@/lib/site-summary";

const SiteContext = createContext<SiteSummary | null>(null);

/** 루트 layout(서버)이 site.yaml에서 뽑은 값을 클라이언트 컴포넌트에 내려 준다. */
export function SiteProvider({ site, children }: { site: SiteSummary; children: React.ReactNode }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteSummary {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite는 SiteProvider 안에서만 쓸 수 있습니다.");
  return site;
}
