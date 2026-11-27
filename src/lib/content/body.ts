import Markdown from "react-markdown";
import { mediaPathProblem, mediaUrl } from "@/lib/media";

// Minimal mdast shape (the Markdown syntax tree before HTML conversion).
type MdNode = { type: string; url?: string; identifier?: string; value?: string; children?: MdNode[] };

// `![설명](경로)` left as plain text: the parser did not accept it as an image
// (typically a space in the path), so the visitor would see the raw text.
const UNPARSED_IMAGE = /!\[[^\]\n]*\]\(([^)\n]*)\)/g;

/**
 * Every image destination in a Markdown body, as the editor wrote it: the
 * syntax-tree url, read before the renderer percent-encodes it. Runs the same
 * react-markdown parser as components/ui/Markdown.tsx without rendering.
 * Covers inline images `![a](x)` and reference images `![a][r]` + `[r]: x`,
 * plus image syntax the parser rejected (returned as `{ broken }`).
 */
function bodyImageSources(body: string): ({ url: string } | { broken: string })[] {
  const found: ({ url: string } | { ref: string } | { broken: string })[] = [];
  const definitions = new Map<string, string>();
  const collect = () => (tree: unknown) => {
    const walk = (n: MdNode) => {
      if (n.type === "image") found.push({ url: n.url ?? "" });
      else if (n.type === "imageReference") found.push({ ref: n.identifier ?? "" });
      else if (n.type === "text" && n.value) {
        for (const m of n.value.matchAll(UNPARSED_IMAGE)) found.push({ broken: m[1] });
      }
      else if (n.type === "definition" && n.identifier !== undefined && !definitions.has(n.identifier)) {
        definitions.set(n.identifier, n.url ?? ""); // first definition wins, as in rendering
      }
      n.children?.forEach(walk);
    };
    walk(tree as MdNode);
  };
  Markdown({ children: body, remarkPlugins: [collect] });
  return found.flatMap((f) => {
    if (!("ref" in f)) return [f];
    const url = definitions.get(f.ref);
    return url === undefined ? [] : [{ url }];
  });
}

/**
 * Body images follow exactly the front-matter rule (mediaPathProblem), applied
 * to the destination as written — never to a decoded form.
 * Returns "본문 사진 N번째 (…): 사유" lines; the caller prefixes the file.
 */
export function bodyImageProblems(body: string): string[] {
  if (!body.includes("![")) return []; // every image (inline or reference) starts with ![
  return bodyImageSources(body).flatMap((f, i) => {
    const src = "url" in f ? f.url : f.broken;
    const problem =
      mediaPathProblem(src) ??
      ("broken" in f ? "사진 문법으로 읽히지 않아 글자 그대로 보입니다. ![설명](경로) 형식을 확인해 주세요" : null);
    // JSON escaping makes tabs or line breaks in the path visible.
    return problem ? [`본문 사진 ${i + 1}번째 (${JSON.stringify(src).slice(1, -1)}): ${problem}`] : [];
  });
}

/**
 * The URLs of the images a body actually draws (same parse and same mediaUrl
 * as the renderer), for comparing against front-matter photos. Text that only
 * mentions a path, or a link to the file, is not an image and is not listed.
 */
export function bodyImageUrls(body: string): Set<string> {
  if (!body.includes("![")) return new Set();
  return new Set(bodyImageSources(body).flatMap((f) => ("url" in f && f.url ? [imageUrlKey(f.url)] : [])));
}

/**
 * A comparable form of an image path: mediaUrl, and for an https:// address
 * the WHATWG serialization, so "예배.webp" and "%EC%98%88%EB%B0%B0.webp" match
 * (already-encoded bytes, "%2F" and the query are left as they are).
 */
export function imageUrlKey(src: string): string {
  const url = mediaUrl(src);
  if (!url.startsWith("https://")) return url;
  try {
    return new URL(url).href;
  } catch {
    return url;
  }
}
