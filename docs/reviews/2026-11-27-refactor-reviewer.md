판정: 고칠 것 있음

harness:reviewer 대립 검토 · 범위 494d7d4..72b75d7 · 기준 docs/검토규칙.md · CLAUDE.md (빌드·시험은 돌리지 않음)

1. 높음 · 운영 모델 · ⑤ — next.config.ts remotePatterns에 유튜브만 있다. HeroSlider:69 · NewHereSection:84 · CommunitySection:38 · about/page:148·417 · community/page:95의 next/image에 R2 주소나 https 주소를 넣으면 "hostname not configured" 오류. 고치려면 next.config를 건드려야 해서 content/만 고친다는 운영 모델이 깨진다. HANDOFF는 「next/image 최적화 안 씀」인데 실제로는 쓰는 곳이 있다.
2. 중간 · ⑤ — news/[id]/page:65 · Markdown:58 · VideoCard:55 · GalleryClient:59 · PhotoGrid:64·102: <img> 6곳 + eslint-disable no-img-element. 규칙에 예외 조항 없음.
3. 중간 · 운영 모델 — Markdown:59 본문 이미지 src가 mediaUrl()을 거치지 않는다. `![](albums/x.webp)`가 /news/albums/x.webp로 깨진다. 빌드가 못 잡는다.
4. 중간 · ⑯ — 화면 변경의 브라우저 확인 기록 없음(HANDOFF:59). 헤더 · 라이트박스 키보드 미확인.
5. 낮음 · ⑦ — news/[id]/page:65 소식 사진 alt="" 고정, 스키마에 설명 칸 없음.
6. 낮음 · 운영 모델 — content/pages/*.yaml의 {{ }} 사용법을 src/lib/content/pages.ts로 넘긴다. 직원이 src/를 열어야 한다.

미확인: API 라우트가 요청 시 content/*.yaml을 fs로 읽음 — Vercel 함수 번들에 content/가 포함되는지(outputFileTracingIncludes 없음). 샘플 설교에 실제 담임목사 이름. 저장소 공개 여부(→ 확인함: PUBLIC).
