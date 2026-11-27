# 옛 사이트 이전 계획 (2026-11-27)

자료: 저장소 밖 `../chungpa21-crawl/` (수집기 `scripts/migrate/crawl.py`, 수치 `inventory.md`).
원칙: 공개 저장소 — 한 번 커밋한 내용은 지워도 기록에 남는다. 개인정보는 변환 단계에서 걸러 낸 뒤 커밋한다.

## 게시판 → 새 콘텐츠

| 옛 게시판 | 건수 | 새 위치 | 비고 |
|---|---|---|---|
| 주일예배 `media_1` | 415 | `content/sermons/` · `kind: 주일예배` | 본문(chapter) · 설교자(author) · 영상 |
| 금요예배 `media_2` | 72 | `content/sermons/` · `kind: 금요기도회` | |
| 찬양 `media_3` | 94 | `content/praise/` | |
| 특별영상 `s_board_3` | 210 | 새 묶음 `content/videos/`(갤러리 「영상」) | 행사 · 수련회 · 칸타타 등. 설교가 아님 |
| 청파앨범 `s_board_1` | 238 · 사진 3,764 | `content/albums/` | 분류는 제목 낱말로 추정, 모르면 「기타」 |
| 교회 일정 `s_board_5` | 58 | `content/events/` | 제목 앞 `YY-MM-DD`가 실제 날짜 |
| 교회소식 `s_board_6` | 270 | `content/news/` · `category: 소식` | 전화번호 형태 12건은 가림 |
| 주보 `weekly` | 141 · PDF 36.7MB | `content/bulletins/` + PDF는 저장소 | 평균 260KB라 압축하지 않음 |
| 교회연혁 `history` | 202 | `content/history.yaml` | |
| 섬기는 분 `staff` | 12 | `content/staff.yaml` | 연락처는 `publishContact: false`(비공개 기본) |
| 새가족소개 `s_board_2` | 38 | **옮기지 않음** | 사용자 결정 11/27 |
| 중보기도 `s_board_4` | 108 | **옮기지 않음** | 사용자 결정 11/27 |

모든 항목에 `legacy: { board, seq, url }`을 남긴다(옛 주소 연결 · 다시 가져오기). 작성자 IP · 작성자 아이디는 버린다.

## 순서 (m 단위)

1. **m1 스키마 (끝 · 11/27)** — `video:`(유튜브 · 비메오) · `thumb:` · `content/videos/`(`/news/videos`).
2. **m2 변환기** `scripts/migrate/convert.py` — `boards/*.json` → `content/` 파일. 사진은 m3 목록(`../chungpa21-crawl/media/manifest.json`)의 키(`<묶음>/<board>-<seq>/<nnn>.webp`, 썸네일 `…-480.webp` → `thumb:`)로만 적는다. `sameFileAs`가 있는 실패 항목은 건너뛴다. Vimeo 영상은 `video:`를 비운다(⑱). 개인정보 거르기(IP 제거, 전화번호 가림, 연락처 비공개) 후 `npm run check:content` 통과.
3. **m3 사진 (끝 · 11/27)** — 4,141장 받음(1,030MB), 1600px 271MB + 480px 86MB, EXIF · GPS 전부 제거 확인. 결과 `../chungpa21-crawl/media/out/`, 목록 `media/manifest.json`. 스크립트 `scripts/migrate/photos.py` · `resize.mjs`.
4. **m4 R2 업로드** — 사용자 Cloudflare 계정 필요(R2 켜기 · 버킷 · API 토큰 · `aws configure --profile chungpa-r2`는 사용자). **결정(사용자 11/27)**: 정식 사이트가 아닌 지금은 r2.dev 임시 주소로 먼저 연결(`NEXT_PUBLIC_MEDIA_BASE_URL` = r2.dev 주소, Production). r2.dev는 속도 제한이 있어 P6 DNS 전환 때 R2 커스텀 도메인으로 환경 변수만 바꾼다. 업로드 = `aws s3 sync ../chungpa21-crawl/media/out s3://<버킷> --endpoint-url https://<계정ID>.r2.cloudflarestorage.com --profile chungpa-r2`.
   - 랜딩용 사진(히어로 · 새가족 · 공동체 · 담임목사 8장)은 저장소 `public/images/site/`에 둔다(11/27).
5. **m5 옛 주소 연결 — 끝 (11/27)** — `/modu/*`에만 걸리는 라우트 핸들러(`src/app/modu/[...path]/route.ts` + `src/lib/legacy-redirect.ts`). 옛 주소는 쿼리로 글을 가려 설정 리디렉션이면 글마다 규칙 1개(약 1,500개, Vercel 경로 한도 근처)라 함수로 했다. 일반 페이지 요청에는 돌지 않고, 응답은 CDN이 캐시(308 = 1년 · 302 = 1시간)해 같은 옛 링크는 함수 호출이 다시 생기지 않는다.
   - 게시물 1,498건 전부 308 → 자기 새 페이지(설교 487 · 찬양 94 → 찬양 목록 · 앨범 238 · 영상 210 · 소식 270 · 일정 58 → 소식 목록 · 주보 141 → 그 주 첫 주보). 검사 = `npm run build` 뒤 `node scripts/check-legacy-redirects.mjs`(불일치 0).
   - 게시판 목록 · 메뉴(소개 및 비전 · 예배시간 · 오시는길 · 온라인헌금 → 문의 · 교회연혁 → `/about#history` · 섬기는 분들 → `/about#staff` · 개인정보) 308. 옮기지 않은 게시판: 새가족소개 → `/visit`, 중보기도 → `/contact`.
   - 대응 못 하는 것: 없는 글 번호 → 그 게시판 목록 302, 모르는 `/modu/` 주소(방명록 등 옛 사이트에도 없던 모듈) → 홈 302. `/modu/` 밖의 옛 주소(`/file/CHUNGPA21/…` 사진 직접 링크 등)와 대문자 `/MODU/`는 404.
6. **m6 확인** — 브라우저로 게시판별 표본 확인, Codex 판정.

## 사용자 확인이 필요한 것

- ~~교회소식 · 연혁 · 특별영상 안의 개인 이름 — 그대로 옮길지~~ → **결정(사용자 11/27)**: 개인 이름(교인 동정 · 세례자 명단 · 특송자)은 그대로 옮긴다. 집 주소만 뺀다(`(주소 생략)`, m2에서 13건). 그 밖의 개인정보 검토는 새 사이트에서 나중에 한다.
- R2 계정 · 버킷 — m4 전에.
