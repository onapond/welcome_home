// Default share image (카카오톡 · 페이스북 · X 미리보기). Rendered once at
// build time; every page without its own photo inherits it. Text comes from
// content/site.yaml (교회 이름 · 영문 이름 · 최신 표어).
//
// Font: a Noto Serif KR Bold subset (scripts/fonts/fetch-og-font.mjs) — next/og
// cannot read the woff2 files the site serves. Logo: the brush mark of
// logo-mark.png recolored white for the navy background.

import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getSite } from "@/lib/content";
import { latestMotto } from "@/lib/content/site-format";

export const alt = `${getSite().name} — ${latestMotto(getSite())?.text ?? getSite().description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ASSET_DIR = path.join(process.cwd(), "src", "assets", "og");

const NAVY = "#2B3A8C";
const SKY = "#6EC6E6";
const SKY_LIGHT = "#8FD7EF";
const GOLD = "#D4A843";

/**
 * The subset comes in several files. Satori uses only one font per family
 * name, so each file gets its own name and the text lists them all as a
 * font-family fallback chain (each character is drawn by the first file that has it).
 */
function loadFonts() {
  const files = fs
    .readdirSync(ASSET_DIR)
    .filter((n) => /^noto-serif-kr-700-\d+\.woff$/.test(n))
    .sort();
  return files.map((n, i) => ({
    name: `OG Serif ${i}`,
    data: fs.readFileSync(path.join(ASSET_DIR, n)),
    weight: 700 as const,
    style: "normal" as const,
  }));
}

/** Characters the bundled subset does not cover (they would render blank). */
function uncovered(text: string): string[] {
  const covered = new Set(fs.readFileSync(path.join(ASSET_DIR, "chars.txt"), "utf8"));
  return [...new Set(text)].filter((c) => !/\s/.test(c) && !covered.has(c));
}

export default function OpengraphImage() {
  const site = getSite();
  const motto = latestMotto(site);
  const missing = uncovered([site.name, site.nameEn, motto?.text ?? "", "표어"].join(""));
  if (missing.length) {
    console.warn(
      `[공유 이미지] 글꼴에 없는 글자가 있어 빈칸으로 나옵니다: ${missing.join(" ")} — ` +
        "node scripts/fonts/fetch-og-font.mjs 의 글자 목록에 더한 뒤 다시 실행해 주세요",
    );
  }
  const fonts = loadFonts();
  const logo = `data:image/png;base64,${fs.readFileSync(path.join(ASSET_DIR, "logo-mark-white.png")).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          position: "relative",
          backgroundColor: NAVY,
          fontFamily: fonts.map((f) => `"${f.name}"`).join(", "),
          color: "#FFFFFF",
          padding: "0 96px",
        }}
      >
        {/* Ripples echoing the logo's concentric rings */}
        <div
          style={{
            position: "absolute",
            right: -220,
            bottom: -260,
            width: 900,
            height: 520,
            borderRadius: "50%",
            border: `2px solid ${SKY}`,
            opacity: 0.22,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -100,
            bottom: -170,
            width: 640,
            height: 360,
            borderRadius: "50%",
            border: `2px solid ${SKY}`,
            opacity: 0.32,
          }}
        />
        <img src={logo} width={300} height={251} alt="" style={{ marginRight: 72 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {motto && (
            <div style={{ display: "flex", fontSize: 28, color: GOLD, letterSpacing: 6 }}>
              {`${motto.year} 표어`}
            </div>
          )}
          {motto && (
            <div style={{ display: "flex", fontSize: 84, lineHeight: 1.2, marginTop: 14 }}>{motto.text}</div>
          )}
          <div style={{ display: "flex", width: 96, height: 4, backgroundColor: SKY, margin: "36px 0 30px" }} />
          <div style={{ display: "flex", fontSize: 46 }}>{site.name}</div>
          <div style={{ display: "flex", fontSize: 24, color: SKY_LIGHT, marginTop: 10, letterSpacing: 1 }}>
            {site.nameEn}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
