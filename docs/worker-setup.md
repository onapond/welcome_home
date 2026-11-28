# 교회 작업자 인계 문서 — 설치 · 작업 규칙 · 인계 사항

이 문서 하나에 교회 작업자가 홈페이지를 맡는 데 필요한 것을 모두 담았다.

- **1부 설치** — 작업자 컴퓨터의 Claude Code가 읽고 그대로 실행한다.
- **2부 작업 규칙** — 파일 위치 · 이름 · 사진 · PDF 규칙과 올리는 순서.
- **3부 인계 사항** — 사이트 현황, 계정 · 권한, 보완 목록, 도메인 인계, 앞으로 할 일.

작업자는 Claude Code에 이렇게만 말한다.

> https://github.com/onapond/welcome_home/blob/main/docs/worker-setup.md 읽고 이 컴퓨터에 설치해줘

---

# 1부 설치

## Claude에게 — 진행 원칙

- 작업자는 개발자가 아니다. 쉬운 한국어로, 한 단계씩 무엇을 하는지 한 줄로 말하고 진행한다.
- **비밀번호 · 인증 코드는 직접 입력하지 않는다.** 컴퓨터 비밀번호(설치 권한), GitHub 로그인은 작업자가 한다. 필요한 순간에 무엇을 어디에 입력하는지 정확히 알려 준다.
- 이미 설치된 것은 건너뛴다(버전만 확인). 실패하면 오류 한 줄과 다음 할 일을 말한다.
- 이 문서 밖의 프로그램은 설치하지 않는다. 작업자의 다른 폴더 · 설정은 건드리지 않는다.

## 1. 운영체제 확인

`uname -s`(Mac = `Darwin`) 또는 Windows(PowerShell)인지 확인하고 아래에서 맞는 명령을 쓴다.

## 2. 프로그램 설치 — git · Node.js 24 · GitHub CLI(gh)

확인: `git --version` · `node -v`(v24 이상) · `gh --version`

**Mac**
- Homebrew가 없으면(`brew -v` 실패) 작업자에게 「터미널(응용 프로그램 → 유틸리티 → 터미널)」을 열어 아래 한 줄을 붙여 넣고 컴퓨터 비밀번호를 입력하라고 안내한다(비밀번호는 화면에 보이지 않는 게 정상):
  `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  끝나면 안내문 마지막의 `eval ...` 두 줄도 같은 창에서 실행하게 한다.
- `brew install git node@24 gh` → `node -v`가 24가 아니면 `brew link --overwrite --force node@24`.

**Windows**
- `winget install --id Git.Git -e` · `winget install --id OpenJS.NodeJS -e` · `winget install --id GitHub.cli -e`
- 설치 뒤 새 터미널에서 다시 확인한다(경로가 새로 잡혀야 한다).

## 3. GitHub 로그인 — 작업자가 한다

작업자의 GitHub 계정: 교회 계정 `chungpa21c` 또는 협업자 `fluent44`. 다른 계정이면 개발자에게 먼저 초대를 받아야 한다.

- 확인: `gh auth status`가 그 계정으로 로그인돼 있으면 건너뛴다.
- 로그인은 입력을 주고받아야 하므로 작업자에게 **별도 터미널 창**에서 아래를 실행하게 한다:
  `gh auth login --hostname github.com --git-protocol https --web`
  → 화면의 8자리 코드를 복사 → Enter → 열린 브라우저에서 해당 GitHub 계정으로 로그인하고 코드 붙여 넣기 → 승인.
- 끝나면 `gh auth status`로 확인하고 `gh auth setup-git` 실행.

## 4. 저장소 초대 수락

- `gh api user/repository_invitations --jq '.[] | select(.repository.full_name=="onapond/welcome_home") | .id'`
- id가 나오면 `gh api -X PATCH user/repository_invitations/<id>`로 수락한다. 아무것도 안 나오면 이미 수락했거나 초대가 없다 → `gh api repos/onapond/welcome_home --jq .permissions.push`가 `true`인지 확인. `false`면 「개발자에게 초대를 다시 요청」하고 멈춘다(초대는 7일 뒤 만료).

## 5. 저장소 받기

- 위치: 작업자 문서 폴더 아래 `welcome_home` (Mac `~/Documents/welcome_home`, Windows `%USERPROFILE%\Documents\welcome_home`). 이미 있으면 그 폴더에서 `git pull`만 한다.
- `gh repo clone onapond/welcome_home <위치>`

## 6. 커밋 이름 — 개인 메일을 드러내지 않게

저장소가 공개라 커밋의 이름 · 메일이 누구에게나 보인다. 이 저장소에만(전역 아님) GitHub noreply 메일로 설정한다:

```
cd <위치>
git config user.name  "$(gh api user --jq .login)"
git config user.email "$(gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"')"
```

## 7. 준비 · 확인

- `npm ci` — 설치하면서 커밋 전 콘텐츠 검사도 켜진다. 「검사가 꺼져 있다」는 안내가 나오면 `git config core.hooksPath .githooks`.
- `npm run check:content` → 「콘텐츠 검사 통과」가 나오면 끝.

## 8. 작업자에게 마무리 안내

이렇게 알려 준다:

- 앞으로는 Claude Code를 **`welcome_home` 폴더에서** 열고 말로 시키면 된다. 예:
  - 「이번 주 주보 올려줘」 + PDF 파일
  - 「이 사진들로 수련회 사진첩 만들어줘」 + 사진 여러 장
  - 「설교 올려줘 — 유튜브 주소, 제목, 본문」
  - 「홈 첫 화면 사진 이 3장으로 바꿔줘」
  - 「보완 목록 보여줘」 — 교회가 확인해 줘야 할 임시 문구 · 사진 목록(`content/CHECKLIST.md`)을 하나씩 처리
- 여러 파일을 한꺼번에 줘도 된다. 내용 · 사진 · 주보는 바로 반영 준비가 되고(GitHub에 병합), 화면 모양 · 기능처럼 코드가 바뀌는 일은 개발자 검토가 필요하다고 안내가 나온다.
- 홈페이지 화면에 나타나는 것(배포)은 지금은 개발자가 한다.

---

# 2부 작업 규칙

Claude Code는 같은 규칙을 저장소의 `.claude/skills/content-update/SKILL.md`에서 자동으로 읽어 따른다. 이 절은 사람이 볼 수 있게 옮긴 것이다(규칙을 바꿀 때는 두 곳을 같이 고친다).

## 고칠 수 있는 곳

- `content/`(글 · 문구) · `public/images/`(사진) · `public/bulletins/`(주보 PDF) **세 곳만**.
- 그 밖의 파일(`src/` 화면 코드, 설정, `scripts/` 등)은 고치지 않는다. 화면 모양 · 기능을 바꾸는 일은 개발자에게 요청한다.
- 파일마다 쓰는 법은 `content/README.md`와 각 폴더의 `_template.md`에 있다.

## 올리는 순서 — 요청 하나 = PR 하나

1. **준비** — `main`을 최신으로 받는다(`git switch main && git pull`). 처음이면 `npm ci`.
2. **브랜치** — `content/날짜-짧은-영문-설명` (예: `content/2026-11-30-bulletin`). `main`에서 바로 고치지 않는다.
3. **고치기** — 여러 파일(PDF · 사진 · 글)을 한꺼번에 줘도 종류별로 나눠 한 번에 처리한다.
4. **검사** — `npm run check:content`가 통과해야 한다.
5. **올리기** — 커밋 `[content] 무엇을 바꿈` → 브랜치 push → PR → 자동 병합 설정.
6. **범위 검사** — GitHub가 PR마다 `scope` 검사를 돌린다. 세 곳만 바뀌었으면 통과해 바로 `main`에 병합된다. 코드가 섞이면 실패하고, 개발자가 검토한 뒤에만 병합된다.
7. **반영** — 병합된 내용이 홈페이지에 나타나는 것(배포)은 지금은 개발자가 한다.

## 종류별 파일 위치

| 할 일 | 글 파일 | 사진 · PDF 놓는 곳 |
|---|---|---|
| 주보 | `content/bulletins/YYYY-MM-DD.md` (주일 날짜), 안에 `pdf: /bulletins/YYYY-MM-DD.pdf` | `public/bulletins/YYYY-MM-DD.pdf` |
| 설교 | `content/sermons/YYYY-MM-DD.md` — 유튜브 주소 · 본문 · 설교자 | 없음 |
| 소식 · 공지 | `content/news/영문-이름.md` | `public/images/news/파일이름/` |
| 사진첩 | `content/albums/YYYY-MM-DD-영문-이름.md` | `public/images/albums/파일이름/` |
| 일정 | `content/events/` | `public/images/events/` |
| 영상 · 찬양 | `content/videos/` · `content/praise/` | `public/images/videos/파일이름/` |
| 페이지 문구 · 예배 시간 · 연락처 | `content/pages/*.yaml` · `content/site.yaml` | — |
| 교역자 | `content/staff.yaml` | `public/images/staff/` |
| 홈 첫 화면 사진 | `content/pages/home.yaml`의 `hero.slides` | `public/images/site/` |
| 공동체 사진 · 로고 | `content/pages/community.yaml`의 `image` · `logo` | `public/images/site/` |

## 파일 · 사진 · PDF 규칙

- **파일 이름**: 영문 소문자 · 숫자 · 하이픈(`-`)만. 공백 · 한글 금지. 날짜는 `YYYY-MM-DD`.
- **사진 경로**는 `/images/...`처럼 `/`로 시작해 적는다. `/` 없이 시작하는 경로(`albums/...`)는 옛 사이트에서 옮긴 사진 보관소(R2) 주소라 작업자 컴퓨터에서는 새로 쓰지 않는다.
- **사진은 줄여서 webp로**: 긴 변 1600px(홈 첫 화면은 2400px), 품질 80 정도. 위치(GPS) 같은 정보는 지운다. 목록에 나오는 사진은 긴 변 480px 작은 사진(`-480.webp`)도 만들어 `thumb`에 적는다. 수 MB짜리 원본을 그대로 올리지 않는다.
- **원본이 작으면**(홈 첫 화면에 가로 2400px 미만) 흐리게 보인다고 알리고 더 큰 원본을 받는다. 사진을 AI로 키우거나 만들지 않는다.
- **로고**: 받은 파일 그대로(투명 배경 PNG · SVG). 새로 그리거나 고쳐 그리지 않는다.
- **PDF**: 그대로 넣는다. 10MB가 넘으면 줄인 판을 받는다.

## 하지 않는 것

- `main`에 바로 push · 강제 push · 검사 건너뛰기(`--no-verify`). 범위 검사를 피하려고 파일을 옮기거나 `.github/`를 고치지 않는다.
- 배포(`vercel` 명령) — 개발자가 한다.
- 교인 개인 연락처 · 주소를 본인 동의 없이 넣기. 미성년자 얼굴이 크게 나오는 사진은 올리기 전에 한 번 더 확인한다.
- 비밀번호 · 인증 코드 · 키를 파일이나 PR에 적기.

---

# 3부 인계 사항 (2026-11-28 기준)

## 사이트 현황

- **새 홈페이지**: https://welcomehome-seven.vercel.app (임시 주소 — 도메인 연결 전)
- **옛 사이트**: https://www.chungpa21.org (웹처치). 살아 있던 글 · 사진은 모두 새 사이트로 옮겼다.
- **옮긴 내용**: 설교 406 · 소식/공지 417(새가족 소개 · 중보기도 포함) · 사진첩 239 · 주보 142 · 영상 136 · 찬양 73 · 일정 59.
- 옛 사진 약 8천 장은 교회 Cloudflare 계정의 사진 보관소(R2 `chungpa-media`)에 있다. 새로 올리는 사진은 저장소 `public/images/`에 둔다.

## 계정 · 권한

| 무엇 | 누가 | 비고 |
|---|---|---|
| GitHub 저장소 `onapond/welcome_home` (공개) | 개발자 `onapond` 소유 | 교회 계정 `chungpa21c` · 작업자 `fluent44`는 쓰기 권한(초대 수락 필요) |
| `main` 규칙 | — | PR로만 들어감. 콘텐츠만 바뀌면 바로 병합, 코드가 섞이면 개발자 검토 |
| 배포(Vercel) | 개발자 | 지금은 개발자 계정에서 배포. 나중에 교회 계정으로 옮김 |
| 사진 보관소(Cloudflare R2) | 교회 계정 `chungpa21c@gmail.com` | 요금 알림 $1 설정. 무료 한도 안에서 사용 중 |
| 문의 · 방문 예약 메일(Resend) | 교회 계정 | 홈페이지 양식으로 들어온 문의가 `chungpa21c@gmail.com`으로 온다 |
| 유튜브 · 인스타그램 | 교회 | 설교 영상은 유튜브 주소만 적으면 홈페이지에 나온다 |

- 소유권 · 배포는 교회 계정, 개발(코드)은 개발자 계정이 맡는다(2026-11-28 결정).
- 계정 비밀번호는 교회가 보관한다. 저장소 · 문서 · 대화에 적지 않는다.

## 보완 목록 — 교회가 확인해 줘야 할 것

지금 홈페이지 문구 중 일부는 교회 확인 없이 임시로 써 둔 것이다. 목록과 진행 표시는 **`content/CHECKLIST.md`** 에 있고, Claude Code에 「보완 목록 보여줘」라고 하면 하나씩 묻고 고친다.

**작업자가 할 수 있는 일(가)** — 교회에 물어 답 · 파일만 받으면 된다

| | 할 일 | 고칠 곳 |
|---|---|---|
| 가1 | 홈 첫 화면 큰 사진 3장(지금 1000px라 흐림, 2400px 이상) | `pages/home.yaml` |
| 가2 | 담임목사 큰 사진(지금 185×219px) | `pages/about.yaml` |
| 가3 | CU 로고 파일 | `pages/community.yaml` CU `logo` |
| 가4 | 청소년부 사진 공개 여부(미성년자 얼굴) | `pages/community.yaml` |
| 가5 | 새가족 질문 답(복장 · 주차 · 예배 시간 · 아이 · 헌금 · 식사) | `pages/visit.yaml` |
| 가6 | 처음 오시면 진행 순서(안내 위원 · 새가족 등록 · 식사) | `pages/visit.yaml` |
| 가7 | 주차 지원 문구가 사실인지 | `site.yaml` |
| 가8 | 예배별 설명 · 안내 문구 | `site.yaml` · `pages/service-times.yaml` |
| 가9 | 담임목사 소개 · 약력 · 인사말 | `pages/about.yaml` |
| 가10 | 신앙고백 | `pages/about.yaml` |
| 가11 | 공동체 소개 · 인원 · 문의 번호(청소년부 02-714-0042) | `pages/community.yaml` |
| 가12 | 사무실 운영 시간 | `pages/contact.yaml` |
| 가13 | 지하철 · 버스 · 주차 안내 | `pages/location.yaml` · `pages/home.yaml` |
| 가14 | 우편번호 | `site.yaml` |
| 가15 | 교회 위치 좌표(지도에서 확인, 짐작 금지) | `site.yaml` |
| 가16~18 | 개인정보처리방침: 보호책임자 · 보관 기간 · 시행일 | `pages/privacy.yaml` |

**교회가 정하고 개발자가 할 일(나)** — 정한 내용을 `content/CHECKLIST.md` 「정한 것」 줄에 적어 두면 개발자가 이어서 한다

- 나1. 도메인 연결(아래 절)
- 나2. 지도 화면을 페이지 안에 넣을지(교회 카카오 계정으로 지도 앱 키 발급 필요)
- 나3. GitHub · Vercel을 교회 계정으로 옮기는 시점

## 도메인 인계 — `chungpa21.org`를 새 홈페이지로

**지금 상태 (2026-11-28 조회)**

- 교회는 웹처치에 맡겨 관리 중. 실제 등록 기관은 **후이즈(Whois Corp., whois.co.kr)**, DNS는 웹처치 서버(`dns.webchurch.co.kr` · `dns2.webchurch.co.kr`).
- 등록일 2024-01-16 · **만료일 2027-01-16** · 상태 정상. 등록인(명의자)은 공개 조회에서 가려져 있다.
- 도메인으로 쓰는 메일은 없다(교회 메일은 Gmail) — 도메인을 옮겨도 메일이 끊기지 않는다.

**웹처치에 문의할 내용**

1. `chungpa21.org`의 등록 기관(후이즈 맞는지)과 등록인 명의(교회 · 웹처치 · 개인 중 누구인지).
2. 교회가 직접 관리하도록 도메인만 넘겨받고 싶다 — 방법 두 가지 중 가능한 것:
   - 가) 후이즈 안에서 교회 계정으로 **소유자 · 관리 계정 변경**, 또는
   - 나) 다른 등록 기관으로 옮길 수 있게 **이전 인증 코드(EPP/Auth Code)** 발급과 이전 잠금 해제.
3. 등록인 정보를 교회 명의(청파중앙교회 · 교회 메일 `chungpa21c@gmail.com`)로 바꿔 달라.
4. 만료일(2027-01-16) 확인과 연장 비용 · 명의 변경 수수료 · 남은 계약 기간 정산 여부.
5. 웹처치 DNS에 지금 설정된 기록 전체 목록(A · CNAME · MX · TXT) — 옮기기 전에 보관한다.
6. 도메인을 넘긴 뒤 웹처치 홈페이지 호스팅 계약은 언제 끝낼 수 있는지, 옛 사이트를 얼마 동안 남겨 둘 수 있는지.
7. 도메인 연결을 옮기는 날 웹처치 쪽에서 해야 할 일(네임서버 변경 협조 등)과 연락 담당자.

**넘겨받은 뒤 개발자가 할 일**

Vercel에 도메인 추가 → DNS 변경(새 홈페이지로) → 옛 주소가 새 주소로 잘 넘어가는지 확인 → 사진 보관소(R2)를 교회 도메인 주소로 → 문의 메일(Resend)에 도메인 등록(교회 메일 외 다른 주소로도 받기).

## 앞으로 할 일 · 연락

1. 작업자 · 교회 계정 GitHub 초대 수락 → 이 문서 1부대로 설치 → 「보완 목록 보여줘」로 시작.
2. 웹처치에 도메인 인계 문의 → 답을 받으면 개발자에게 전달(만료일 전에).
3. 도메인 연결과 함께 GitHub · Vercel을 교회 계정으로 이전.

막히거나 코드가 바뀌어야 하는 일은 개발자(`onapond`)에게 PR 주소와 함께 알린다.
