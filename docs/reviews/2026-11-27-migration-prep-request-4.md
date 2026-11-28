# 네 번째 판정 요청 — 세 번째 판정 지적 수정 확인

## 범위
- 커밋 `947d188..0ffebd8` (`git log --oneline 947d188..0ffebd8`).
- 지난 지적: `docs/reviews/2026-11-27-migration-prep-codex-3.md`의 ② 8건(+ 덜 고쳐진 두 번째 판정 3 · 8). 기준: `docs/검토규칙.md`, `CLAUDE.md`. 제품 코드는 고치지 않는다.

## 할 일
1. ② 1~8 각각 **고쳐짐 / 덜 고쳐짐 / 안 고쳐짐** + 근거(파일:줄). 지난번에 만든 실패 장면을 가능하면 그대로 다시 돌려 본다(임시 사본에서).
2. 고친 코드가 새로 만든 문제만 본다(범위 밖의 새 기능 제안은 하지 않는다): `src/lib/legacy-redirect.ts`, `src/lib/content/schema.ts`(legacy.url 검사), `src/app/news/bulletin/[id]/page.tsx`(같은 주 주보), `src/lib/content/body.ts` · `src/app/news/[id]/page.tsx`(사진 중복), `src/lib/schedule.ts` · `src/lib/jsonld.tsx`(요일 · 시각), `scripts/migrate/convert.py`(주보 PDF 재사용 · 완결성), `scripts/check-legacy-redirects.mjs`.
3. 가능하면 실행: `npm run check:content`, `npx tsc --noEmit && npm run lint`, 빌드(Turbopack이 막히면 `npx next build --webpack`) 뒤 `node scripts/check-legacy-redirects.mjs`. 변환기는 임시 폴더로(`--no-download --replace`, 출력이 저장소와 같아야 함). 3000번 서버는 건드리지 않는다. 임시 파일은 지우고 `content/` 원본을 바꾼 채로 두지 않는다.

## 결과 파일
- `docs/reviews/2026-11-27-migration-prep-codex-4.md` 하나만. 맨 위 `판정: 통과` 또는 `판정: 고칠 것 있음`, ① 지난 지적 표 ② 새 지적(심각도 · 파일:줄 · 실패 장면 · 고칠 방향) ③ 미확인.

## 정한 설계 (지적하지 말 것)
- 첫 ~ 세 번째 요청서의 「정한 설계」 전부.
- 요일 · 시각을 못 읽는 예배는 방문 희망일이 「아직 정하지 않았어요」만 남고, 검색엔진 일정(Schedule)에서 요일 · 시각이 빠진다 — 의도된 동작.
- 같은 주 주보는 옛 주소 → 그 주 첫 주보(id 순), 그 페이지가 같은 주 전부를 「주보 1 · 2 · 3」로 잇는다.
- 심각도 「낮음」만 남으면 `통과`.
