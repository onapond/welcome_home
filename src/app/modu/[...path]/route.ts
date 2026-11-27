import { legacyTarget } from "@/lib/legacy-redirect";

// Old chungpa21.org addresses all live under /modu/ and are told apart by the
// query string (read.asp?board_seq=6&seq=…), which next.config redirects can
// only express one rule per post (~1,500, near Vercel's route limit). This
// handler runs for /modu/* only — ordinary page views never invoke it — and
// the CDN caches each answer, so a repeated old link costs no function call.
export function GET(request: Request): Response {
  const url = new URL(request.url);
  const { to, permanent } = legacyTarget(url.pathname, url.searchParams);
  return new Response(null, {
    status: permanent ? 308 : 302,
    headers: {
      // `to` is always a site path, so the redirect never leaves this host.
      Location: new URL(to, url.origin).toString(),
      "Cache-Control": permanent
        ? "public, max-age=86400, s-maxage=31536000"
        : "public, max-age=0, s-maxage=3600",
    },
  });
}

export const HEAD = GET;
