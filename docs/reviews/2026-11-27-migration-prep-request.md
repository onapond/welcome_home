# 판정 요청 — 이전 준비분 (글꼴 · Vimeo · m1 · 사진 스크립트)

## 범위
- 커밋 `8cb5884..e15c5bf` (`git log --oneline 8cb5884..e15c5bf`). 주로 `src/**` · `scripts/fonts/` · `scripts/migrate/photos.py` · `scripts/migrate/resize.mjs` · `next.config.ts` · `content/README.md` · `content/**/_template*`
- 볼 기준: `docs/검토규칙.md`(특히 ⑱ 갱신분), `CLAUDE.md`(디자인 시스템 · 운영 모델 · 비용 0), `docs/migration-plan.md`. 배경은 `docs/reviews/2026-11-27-refactor-request.md`와 같다. 제품 코드는 고치지 않는다.

## 볼 것
1. **Vimeo · `video:`** (`src/lib/content/schema.ts` · `src/lib/media.ts` · `VideoCard.tsx` · 설교 상세): 주소 해석이 틀리는 입력(다른 호스트, 숫자 아닌 ID, 비밀값 형식), iframe `src`에 주입되는 값, `youtube:`와의 공존 규칙, 직원이 보는 오류 문구.
2. **`thumb:` 필드** (m1): 목록은 `thumb ?? src`, 크게 보기 · og는 `src`인지 모든 묶음(사진첩 · 소식 · 일정 · 영상 · 설교 · 찬양)에서. 경로 검사가 `src`와 같은 규칙을 거치는지. `cover`가 사진 목록 중 하나일 때의 처리.
3. **영상 묶음** `/news/videos` · `[id]`: 정적 생성 · sitemap · canonical · 메뉴 · 404 처리, 다른 묶음과 다른 점, 접근성(키보드 · alt · 크게 보기).
4. **글꼴**: `src/app/fonts/noto-serif-kr.css` 와 preload, `next.config.ts`의 `/fonts/*` 캐시 헤더(파일 이름에 버전이 없는데 30일 캐시 — 다시 받기 스크립트가 같은 이름으로 덮을 때의 문제), OFL 표기.
5. **사진 스크립트**: EXIF · GPS 제거, 새가족소개 · 중보기도 제외가 빠짐없이 되는지, 저장소에 개인정보가 들어갈 경로가 없는지, 키 이름이 미디어 경로 규칙(`mediaPathProblem`)을 통과하는지.
6. 가능하면 실제로 실행해 확인한다(임시 사본 `CHECK_CONTENT_ROOT=<tmp> node scripts/check-content.mjs` 등 — 임시 파일은 지우고 `content/` 원본을 바꾼 채로 두지 않는다). 빌드는 돌리지 않는다(다른 작업이 같은 저장소를 쓴다).

## 결과 파일
- `docs/reviews/2026-11-27-migration-prep-codex.md` 하나만 쓴다.
- 맨 위 한 줄: `판정: 통과` 또는 `판정: 고칠 것 있음`. 그 아래 지적(심각도 · 파일:줄 · 무엇이 틀렸나 · 실패 장면 · 고치는 방향), 그리고 미확인.

## 정한 설계 (지적하지 말 것)
- R4 요청서 7(`2026-11-27-refactor-request-7.md`)의 「정한 설계」 전부.
- 옛 Vimeo 영상은 재생되지 않으므로 옮길 때 비우고, Vimeo 지원 코드는 새 영상용으로 남긴다(⑱, 사용자 결정).
- 썸네일 이름을 자동으로 짐작하지 않는다(직원이 올린 사진에는 썸네일이 없을 수 있음).
- Pretendard는 jsDelivr에서 실행 때 받는다(빌드와 무관).
- 심각도 「낮음」만 남으면 `통과`로 쓰고 낮음 항목은 목록으로 남긴다.
