# 두 번째 판정 요청 — 지적 수정 + 개선(SEO · 디자인 · CTA) + 콘텐츠 이전

## 범위
- 커밋 `32b70bf..babcecf` (`git log --oneline 32b70bf..babcecf`). 제품 코드 · 스크립트 중심: `src/**` · `scripts/**` · `next.config.ts` · `content/site.yaml` · `content/pages/*.yaml` · `content/README.md`.
- `content/` 데이터(옛 사이트 이전분 1,500개)와 `public/bulletins/` PDF는 사용자 결정대로 옛 사이트를 그대로 옮긴 것 — 개인정보 관점의 내용 지적은 하지 않는다(새 사이트에서 다시 검토). 변환기가 규칙대로 만들었는지(형식 · 경로 · legacy · 깨진 마크다운)는 본다.
- 지난 지적: `docs/reviews/2026-11-27-migration-prep-codex.md`. 개선 목록: `docs/improvement-audit-2026-11-27.md`.
- 기준: `docs/검토규칙.md`, `CLAUDE.md`(디자인 시스템 · 비용 0). 제품 코드는 고치지 않는다.

## 할 일
1. 지난 지적 11건 각각 **고쳐짐 / 덜 고쳐짐 / 안 고쳐짐** + 근거(파일:줄).
2. 새 코드의 문제: JSON-LD(유효성 · 보이는 글과 일치 · `<` 이스케이프), OG 이미지, RSS · llms.txt(이스케이프 · 인코딩), 아이콘 · manifest, 글꼴 자체 제공(Pretendard OFL · 버전 주소 · preload), 영상 facade(키보드 · 접근성 · iframe 주소), 공유 버튼, 하단 고정 버튼(가림 · 메뉴 · 포커스), 히어로 「다음 예배」(하이드레이션 · 시간대 KST), 방문 희망일(서버 검증 · 시간대), 칸별 오류(aria), `/privacy` · 동의 문구, 대비, 바로가기 · 포커스, 길찾기 주소, sitemap lastmod, `load.ts` turbopackIgnore.
3. 변환기(`scripts/migrate/convert.py`): 같은 입력에 같은 출력, 경로 규칙, 깨진 본문, legacy 값.
4. 가능하면 실행해 확인(임시 사본 `CHECK_CONTENT_ROOT=<tmp> node scripts/check-content.mjs`, 변환기를 임시 폴더로). 빌드 · `next start`는 해도 된다(지금 다른 작업 없음). 임시 파일은 지우고 `content/` 원본을 바꾼 채로 두지 않는다.

## 결과 파일
- `docs/reviews/2026-11-27-migration-prep-codex-2.md` 하나만. 맨 위 `판정: 통과` 또는 `판정: 고칠 것 있음`, ① 지난 지적 표 ② 새 지적(심각도 · 파일:줄 · 실패 장면 · 고칠 방향) ③ 미확인.

## 정한 설계 (지적하지 말 것)
- 첫 요청서(`2026-11-27-migration-prep-request.md`)의 「정한 설계」 전부.
- 옛 사이트 콘텐츠 · 주보 PDF의 개인정보는 사용자 결정으로 그대로(집 주소 · 휴대전화 가림만). 새 사이트에서 다시 검토.
- 교회 확인 전 사실(예배 · 주차 · 점심 · FAQ · geo · 우편번호 · 처리방침 보유기간 · 책임자)은 `TODO(교회 확인)` 표시로 둔다 — TODO가 있다는 것 자체는 지적하지 않는다.
- 카카오 공유 SDK · T맵 · 네이버 좌표 길찾기는 키 · 공개 주소가 없어 넣지 않았다.
- 심각도 「낮음」만 남으면 `통과`.
