// ──────────────────────────────────────────
// 지도 앱 길찾기 링크 — 앱 키 없이 쓰는 공개 주소만 쓴다.
//
// 카카오맵: map.kakao.com/link/to/<이름>,<위도>,<경도> 는 교회를 목적지로 둔 길찾기를 연다.
//           좌표(site.yaml geo)가 없으면 link/search/<주소> 검색 결과로 연결한다.
// 네이버 지도: map.naver.com/p/search/<주소> 검색 결과(장소 카드에서 길찾기).
//           좌표로 목적지를 넣는 공개 주소 형식은 확인하지 못해 검색만 쓴다.
// 티맵: 앱 키 없이 웹에서 여는 길찾기 주소가 확인되지 않아 넣지 않는다.
// 화면 속 지도: 구글 지도 embed(output=embed)는 키 없이 iframe으로 띄울 수 있다 (사용자 결정 11/28).
//           카카오 · 네이버 지도를 화면에 넣으려면 앱 키가 필요하다.
// ──────────────────────────────────────────

import type { Site } from "@/lib/content/schema";

export function kakaoDirectionsUrl(site: Pick<Site, "name" | "address" | "geo">): string {
  if (site.geo) {
    const name = encodeURIComponent(site.name.replace(/,/g, " "));
    return `https://map.kakao.com/link/to/${name},${site.geo.lat},${site.geo.lng}`;
  }
  return `https://map.kakao.com/link/search/${encodeURIComponent(site.address.mapQuery)}`;
}

export function naverMapUrl(site: Pick<Site, "address">): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(site.address.mapQuery)}`;
}

/** Keyless Google Maps iframe src. Name + address shows the church's place card, not a bare street number. */
export function googleMapEmbedUrl(site: Pick<Site, "name" | "address" | "geo">): string {
  const q = site.geo ? `${site.geo.lat},${site.geo.lng}` : `${site.name} ${site.address.mapQuery}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=ko&z=17&output=embed`;
}
