# 세 번째 판정 요청 — 두 번째 지적 수정 · 랜딩 사진 · m5 옛 주소 연결

## 범위
- 커밋 `56bd65f..70f973e` (`git log --oneline 56bd65f..70f973e`). 제품 코드 · 스크립트 중심: `src/**` · `scripts/**` · `next.config.ts` · `.vercelignore` · `content/pages/*.yaml` · `content/site.yaml`.
- 지난 지적: `docs/reviews/2026-11-27-migration-prep-codex-2.md`. 기준: `docs/검토규칙.md`, `CLAUDE.md`(디자인 시스템 · 비용 0). 제품 코드는 고치지 않는다.
- `content/` 이전 데이터 · `public/bulletins/` PDF의 개인정보 관점 지적은 하지 않는다(사용자 결정 — 새 사이트에서 다시 검토).

## 할 일
1. 지난 지적 각각 **고쳐짐 / 덜 고쳐짐 / 안 고쳐짐** + 근거(파일:줄).
2. 새 코드:
   - m5 `src/app/modu/[...path]/route.ts` · `src/lib/legacy-redirect.ts`: 열린 리디렉션 여부, 쿼리 대소문자 · 여분 파라미터 · 이상한 값, 308/302 선택, CDN 캐시 헤더가 잘못된 응답을 오래 붙잡을 위험, `outputFileTracingIncludes`로 함수에 content가 실제 들어가는지(빌드 뒤 `.next/server/app/modu/[...path]/route.js.nft.json`), 함수 비용(일반 페이지 요청에 돌지 않는지), 주보 한 주 여러 개 처리. 검사 = `node scripts/check-legacy-redirects.mjs`(빌드 뒤).
   - 랜딩 사진(`public/images/site/*.webp`, `content/pages/home.yaml` · `community.yaml` · `about.yaml`): next/image 사용 · alt · 크기 · LCP(히어로 첫 장 priority).
   - 소식 상세의 사진 중복 제거(`src/app/news/[id]/page.tsx`): 본문에 이미 있는 사진 판정(인코딩 · thumb · 상대 경로).
   - `.vercelignore` 허용 목록: 빌드에 필요한 파일이 빠지지 않았는지(`content/`, `public/`, 설정 파일, `scripts/` 중 빌드가 부르는 것).
   - 머리글 설명 글자 대비, 모바일 방문 단계 세로선(`VisitClient.tsx`).
3. 가능하면 실행해 확인: `npx tsc --noEmit && npm run lint && npm run build`, `node scripts/check-legacy-redirects.mjs`, `npx next start -p 3125`로 표본 curl. 3000번 서버는 Claude가 띄운 것이니 건드리지 않는다(빌드로 끊겨도 Claude가 다시 띄운다). 임시 파일은 지우고 `content/` 원본을 바꾼 채로 두지 않는다.

## 결과 파일
- `docs/reviews/2026-11-27-migration-prep-codex-3.md` 하나만. 맨 위 `판정: 통과` 또는 `판정: 고칠 것 있음`, ① 지난 지적 표 ② 새 지적(심각도 · 파일:줄 · 실패 장면 · 고칠 방향) ③ 미확인.

## 정한 설계 (지적하지 말 것)
- 첫 · 두 번째 요청서(`2026-11-27-migration-prep-request.md`, `-request-2.md`)의 「정한 설계」 전부.
- 옛 사진 보관소 = Cloudflare R2, 정식 도메인 전까지 r2.dev 임시 주소(사용자 결정 11/27). 아직 연결 전이라 옛 사진(`/media/...`)이 로컬에서 깨지는 것은 지적하지 않는다.
- 랜딩 사진 8장은 저장소(`public/images/site/`)에 둔다. 담임목사 사진이 작은(185×219) 것은 교회에서 큰 사진을 받을 때까지 그대로.
- m5: 옮기지 않은 게시판(새가족소개 → `/visit`, 중보기도 → `/contact`), 일정(`s_board_5`) → `/news`(일정 페이지 없음), 찬양 → 찬양 목록(상세 없음), 대문자 `/MODU/`와 `/modu/` 밖 옛 주소는 404.
- 배포는 CLI만(Git 연동 없음), Vercel Hobby.
- 심각도 「낮음」만 남으면 `통과`.
