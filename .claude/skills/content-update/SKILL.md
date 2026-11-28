---
name: content-update
description: 교회 작업자가 홈페이지 내용을 바꿀 때 — 주보 PDF · 설교 · 소식/공지 · 일정 · 사진첩 · 영상 · 찬양 · 페이지 문구 · 홈 첫 화면 사진 올리기, 여러 파일 한꺼번에 올리기. 브랜치 → PR → 범위 검사 통과하면 바로 병합(코드 변경은 개발자 검토).
---

# 홈페이지 내용 바꾸기 (교회 작업자용)

작업자는 개발자가 아니다. 쉬운 한국어로 말하고, 명령어 · 파일 경로는 꼭 필요할 때만 보여 준다.

## 범위

- 고칠 수 있는 곳: `content/` · `public/images/` · `public/bulletins/` 만.
- `src/` · 설정 파일 · `scripts/` 등은 고치지 않는다. 요청이 화면 모양 · 기능 변경이면 「개발자에게 요청할 일」이라고 말하고 멈춘다.
- 작성 규칙(파일 이름 · 날짜 · 사진 경로 · 항목)은 `content/README.md`와 각 폴더의 `_template.md`가 원본이다. 먼저 읽는다.

## 흐름 — 요청 하나(여러 파일이어도) = PR 하나, 검사 통과하면 바로 병합

main에는 PR로만 들어간다. PR마다 GitHub 「범위 검사」(scope)가 돌아 `content/` · `public/images/` · `public/bulletins/`만 바뀌었으면 통과하고, 통과한 PR은 작업자가 바로 병합한다. 코드 파일이 섞이면 검사가 실패해 개발자(onapond)만 병합할 수 있다.

1. **준비**: `git switch main && git pull`. 처음이면 `npm ci`(커밋 전 검사가 켜짐). 고치지 않은 변경이 남아 있으면 작업자에게 먼저 묻는다.
2. **브랜치**: `content/날짜-짧은-영문-설명` (예: `content/2026-11-30-bulletin`). main에서 바로 고치지 않는다.
3. **파일 받기**: 작업자가 여러 파일(PDF · 사진 · 글)을 한꺼번에 주면 종류별로 나눠 아래 표대로 한 번에 처리한다. 무엇이 어디에 들어갈지 애매하면(어느 소식 사진인지, 날짜가 무엇인지) 한 번에 모아서 묻는다.
4. **고치기**: 아래 표.
5. **검사**: `npm run check:content` 통과. 틀리면 고쳐서 다시.
6. **올리기**: 커밋 메시지 `[content] 무엇을 바꿈` → `git push -u origin 브랜치` → `gh pr create`(제목 · 바뀐 것 목록을 한국어로) → `gh pr merge --squash --auto --delete-branch`(범위 검사가 통과하면 자동 병합).
7. **확인**: `gh pr checks --watch`로 검사를 기다린다. 병합되면 `git switch main && git pull`. 검사가 실패하면(범위 밖 파일) 작업자에게 「코드가 바뀌어 개발자 검토가 필요합니다」라고 PR 주소와 함께 알린다.
8. **알리기**: 「올렸습니다. 홈페이지 반영(배포)은 개발자가 합니다.」 — 배포는 아직 개발자 계정에서만 한다.

## 종류별

| 할 일 | 파일 | 사진 · PDF 놓는 곳 |
|---|---|---|
| 주보 | `content/bulletins/YYYY-MM-DD.md` (주일 날짜), `pdf: /bulletins/YYYY-MM-DD.pdf` | `public/bulletins/YYYY-MM-DD.pdf` |
| 설교 | `content/sermons/YYYY-MM-DD.md` — 유튜브 주소, 본문, 설교자 | 없음 |
| 소식 · 공지 | `content/news/영문-이름.md` | `public/images/news/파일이름/` |
| 사진첩 | `content/albums/YYYY-MM-DD-영문-이름.md` | `public/images/albums/파일이름/` |
| 일정 | `content/events/` | `public/images/events/` |
| 영상 · 찬양 | `content/videos/` · `content/praise/` | `public/images/videos/파일이름/` |
| 페이지 문구 · 예배 시간 · 연락처 | `content/pages/*.yaml` · `content/site.yaml` | — |
| 홈 첫 화면 사진 | `content/pages/home.yaml` 의 `hero.slides` | `public/images/site/` |

- 사진 경로는 `/images/...`(앞에 `/`)로 적는다. 보관소 경로(`albums/...`처럼 `/` 없는 것)는 R2에 올려야 해서 작업자 컴퓨터에서는 쓰지 않는다.

## 사진 · PDF 규칙

- **사진은 줄여서 webp로**: 긴 변 1600px(홈 첫 화면은 2400px), 품질 80 정도, 위치(GPS) 등 정보는 지운다. 목록에 나오는 사진은 긴 변 480px 작은 사진(`-480.webp`)도 만들어 `thumb`에 적는다. 원본(수 MB)을 그대로 커밋하지 않는다.
- 원본이 너무 작으면(홈 첫 화면에 2400px 미만) 흐리게 보인다고 작업자에게 알린다. 사진을 AI로 키우거나 만들지 않는다.
- 파일 이름: 영문 소문자 · 숫자 · 하이픈. 공백 금지.
- **PDF**: 그대로 넣되 10MB가 넘으면 작업자에게 알리고 줄인 판을 받는다.

## 하지 않는 것

- main에 바로 push · 강제 push · `--no-verify` (main은 GitHub 규칙으로도 막혀 있다). 범위 검사를 우회하려고 파일을 옮기거나 `.github/`를 고치지 않는다.
- 배포(`vercel`) — 개발자가 한다.
- 교인 개인 연락처 · 주소를 동의 없이 넣기. 미성년자 얼굴이 크게 나오는 사진은 작업자에게 한 번 확인한다.
- 범위 밖 파일 지우기 · 옮기기.
