// npm run check:content — validate every file under content/ without a Next
// build (a few seconds). Runs the same validateAllContent() the build runs
// from src/app/sitemap.ts, so the rules and Korean messages are identical.
//
// The pre-commit hook (.githooks/pre-commit) sets CHECK_CONTENT_ROOT to a
// temporary copy of the *staged* content/, so what is checked is exactly
// what would be committed.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJiti } from "jiti";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// content/ is read from <cwd>/content (src/lib/content/load.ts).
process.chdir(process.env.CHECK_CONTENT_ROOT || repo);

const jiti = createJiti(import.meta.url, {
  alias: { "@": path.join(repo, "src") },
});

try {
  const { validateAllContent } = await jiti.import(path.join(repo, "src/lib/content/validate.ts"));
  validateAllContent();
  console.log("콘텐츠 검사 통과 (content/)");
} catch (e) {
  if (e && e.name === "ContentError") {
    console.error(e.message);
    console.error("\n위 파일을 고친 뒤 다시 시도해 주세요. 작성 규칙: content/README.md");
  } else {
    console.error("콘텐츠 검사를 실행하지 못했습니다:", e);
  }
  process.exit(1);
}
