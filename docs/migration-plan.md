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

1. **m1 스키마** — Vimeo 영상 · 썸네일 필드(진행 중), `videos` 묶음 추가, 표본 콘텐츠 삭제 목록 확정.
2. **m2 변환기** `scripts/migrate/convert.py` — `boards/*.json` → `content/` 파일. 사진은 보관소 키(`albums/<seq>/<nnn>.webp`)로만 적는다. 개인정보 거르기(IP 제거, 전화번호 가림, 연락처 비공개) 후 `npm run check:content` 통과.
3. **m3 사진** — 옛 사이트에서 내려받아(약 1GB, 저장소 밖) `sharp`로 긴 변 1600px webp + 썸네일. 결과도 저장소 밖.
4. **m4 R2 업로드** — 사용자 Cloudflare 계정 필요(버킷 생성 · 인증은 사용자). `NEXT_PUBLIC_MEDIA_BASE_URL`은 R2 커스텀 도메인이 생긴 뒤(P6 DNS 전환 때) 등록.
5. **m5 옛 주소 연결** — `legacy`로 옛 게시판 주소 → 새 주소. 방식은 m2 뒤 건수를 보고 정한다(설정 리디렉션 한도 · 함수 호출 비용 확인).
6. **m6 확인** — 브라우저로 게시판별 표본 확인, Codex 판정.

## 사용자 확인이 필요한 것

- 교회소식 · 연혁 · 특별영상 안의 개인 이름(세례 · 등록 명단, 「○○ 권사님 소식」, 청년 소개)은 옛 사이트에 공개돼 있던 내용이다. 그대로 옮길지 — m2 결과를 보여 주고 묻는다.
- R2 계정 · 버킷 — m4 전에.
