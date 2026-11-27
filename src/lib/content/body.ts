import Markdown from "react-markdown";
import { decodeMarkdownSrc, mediaPathProblem } from "@/lib/media";

/**
 * Every image destination in a Markdown body, exactly as the renderer
 * (components/ui/Markdown.tsx) sees it. Runs the same react-markdown parser
 * without rendering: urlTransform is called once per URL attribute.
 */
function bodyImageSources(body: string): string[] {
  const out: string[] = [];
  Markdown({
    children: body,
    urlTransform: (url, key, node) => {
      if (key === "src" && node.tagName === "img") out.push(url);
      return url;
    },
  });
  return out;
}

/**
 * Body images follow the same path rules as front-matter photos.
 * Returns "본문 사진 N번째 (…): 사유" lines; the caller prefixes the file.
 */
export function bodyImageProblems(body: string): string[] {
  if (!body.includes("![")) return []; // every image (inline or reference) starts with ![
  return bodyImageSources(body).flatMap((src, i) => {
    const key = decodeMarkdownSrc(src);
    const problem = key === null ? mediaPathProblem("%") : mediaPathProblem(key);
    return problem ? [`본문 사진 ${i + 1}번째 (${key ?? src}): ${problem}`] : [];
  });
}
