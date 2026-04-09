"use client";

import dynamicImport from "next/dynamic";
import config from "../../../sanity.config";

export const dynamic = "force-dynamic";

const SanityStudio = dynamicImport(
  async () => {
    const { Studio } = await import("sanity");
    return { default: Studio };
  },
  { ssr: false, loading: () => <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>로딩 중...</div> }
);

export default function StudioPage() {
  return <SanityStudio config={config} />;
}
