# 다섯 번째 판정 요청 — 네 번째 판정 지적 수정 확인

## 범위
- 커밋 `722744e..7298e17` (`git log --oneline 722744e..7298e17`).
- 지난 지적: `docs/reviews/2026-11-27-migration-prep-codex-4.md`의 ② 7건. 기준: `docs/검토규칙.md`, `CLAUDE.md`. 제품 코드는 고치지 않는다.

## 할 일
1. ② 1~7 각각 **고쳐짐 / 덜 고쳐짐 / 안 고쳐짐** + 근거(파일:줄). 지난번 실패 장면을 가능하면 그대로 다시 돌려 본다(임시 사본에서).
2. 고친 코드가 새로 만든 문제만 본다(범위 밖의 새 기능 제안은 하지 않는다): `scripts/migrate/convert.py`(`prior_bulletin_pdfs` · `pdf_complete` · `download_pdfs`), `src/lib/legacy-redirect.ts`(`bulletinWeekKey`), `src/app/news/bulletin/[id]/page.tsx`, `scripts/check-legacy-redirects.mjs`, `src/lib/content/body.ts`(`imageUrlKey`) · `src/app/news/[id]/page.tsx`, `src/lib/schedule.ts`(`parseTime`).
3. 가능하면 실행: `npm run check:content`, `npx tsc --noEmit && npm run lint`, 빌드(Turbopack이 막히면 `npx next build --webpack`) 뒤 `node scripts/check-legacy-redirects.mjs`. 변환기는 임시 폴더로(`--no-download --replace`, 출력이 저장소와 같아야 함). 3000번 서버는 건드리지 않는다. 임시 파일은 지우고 `content/` 원본을 바꾼 채로 두지 않는다.

## 결과 파일
- `docs/reviews/2026-11-27-migration-prep-codex-5.md` 하나만. 맨 위 `판정: 통과` 또는 `판정: 고칠 것 있음`, ① 지난 지적 표 ② 새 지적(심각도 · 파일:줄 · 실패 장면 · 고칠 방향) ③ 미확인.

## 정한 설계 (지적하지 말 것)
- 첫 ~ 네 번째 요청서의 「정한 설계」 전부.
- 이전 주보 PDF는 지금 머리말이 실제로 연결한 정상 PDF만, `legacy.seq`로 찾아 다시 쓴다. 연결 기록이 없는 남은 파일은 쓰지 않는다(`--replace` 없으면 경고 뒤 남김).
- PDF 완결성 = `%PDF-` 시작 + 끝의 `startxref N %%EOF` + N 위치에 `xref` 또는 교차 참조 스트림 객체. 판독기(pdfinfo 등)는 의존으로 넣지 않는다.
- 같은 주 묶음은 옛 주차 키(연-월-주), 옛 주소가 없는 새 주보는 같은 날짜끼리.
- 시각은 문구 전체가 한 시각일 때만 읽는다(「오전/오후 H:MM」 · 「오전/오후 H시 (M분)」 · 「HH:MM」).
- 심각도 「낮음」만 남으면 `통과`.
