# 인계 기록 — HANDOFF.md 「지금 상태」에서 옮긴 지난 항목

최신 상태는 `HANDOFF.md` 「지금 상태」. 이 파일은 지난 경과를 원문 그대로 보관한다.

## 2026-11-28 「지금 상태」 원문 (11/28 저녁 마무리 때 옮김)


**R2 연결 끝 (11/28 · 이전 m4)** — 교회 Cloudflare 계정(`chungpa21c@gmail.com`, 계정 ID `20c857021f064823e1d0369000396b98`)에 버킷 `chungpa-media`(아시아 태평양 · Standard). 사진 8,282개 · 357MB 업로드, r2.dev `https://pub-81316758abd24473bf4c850d33e94ed5.r2.dev`. Vercel Production `NEXT_PUBLIC_MEDIA_BASE_URL` 넣고 재배포(`dpl_5EBDoarUo3fR7zH5PyRvPCdKSMuX`) → 운영 갤러리 R2 사진 237개 주소 · 표본 12장 200 · 화면에서 깨진 사진 0. 자세한 것 `docs/migration-plan.md` m4
- 요금: R2에는 결제 상한이 없다 → 예산 알림 「R2 요금 발생 알림」 $1 → `chungpa21c@gmail.com`. 무료 한도(10GB · 쓰기 100만 · 읽기 1,000만/월) 안
- 업로드 키: R2 계정 토큰 `chungpa-media-upload`(이 버킷만 객체 읽기 · 쓰기, 기한 없음) → 이 맥 `aws` 프로필 `chungpa-r2`에만 있음(저장소에 없음)

**다음 할 일 — 2차 이전 (11/28 사용자 「원사이트에서 살아있던건 다 옮겨 · 비메오 살리고 · 개인정보 다 넣어」)** — 계획 · 결정은 `docs/migration-plan.md` 「2차 이전」 절
- 저장소 비공개로 바꿈(11/28). m2 개인정보 그대로 · m4 새가족 38 · 중보기도 108(소식 분류, 사진 R2) · m3 비메오 → 유튜브 267건 연결 · 영상 없는 글 179건 삭제 · m3-2 설교 글 105건을 예배 실황 → 설교만 자른 영상으로(설교 영상이 없는 옛 글 주일 67 · 금요 71은 실황 그대로 — 사용자 「옛날 자료는 그냥 둬」) · m5 옛 고정 페이지(예배 시간 · 장소를 옛 사이트대로 고침, 소개 비전 옛 글, 문의 쪽 온라인 헌금 계좌) 끝. m6 확인 끝(고칠 것 없음). m7 Codex 1차 「고칠 것 있음」 → 중간 2 · 낮음 #3 #4 #9 #10 고침(나머지 낮음 기록만, migration-plan). Codex 재판정은 41분 멈춰 끊음(사용자 「너무 오래 걸리면 끊고 진행해」 — 원인: `codex exec`가 표준 입력을 기다림, 다음부터 `< /dev/null`) → 재판정 없이 배포 · push. 그사이 린트 오류(소식 `?category=` effect) 발견해 고침
- **m8 교역자 · CU (11/28 사용자)**: 교역자 소개를 시무 · 파송 · 은퇴로 나누고 사진을 카드 폭 세로 사진으로(`staff.yaml` `status`, 변환기 `staff_status`). 공동체를 교육위원회 관리 앱(church 프로젝트, Supabase `church_cont_project` — 브라우저 대시보드로 SELECT만) 부서 구성대로: CU(연합) · 청소년부 · 1청년 · 2청년 · CU 워십팀. 사진 = 관리 앱 부서 사진 3장(청소년부 · 1청년 · 2청년, GPS 지운 webp) + 옛 앨범 2장. 청소년부 사진은 미성년자 얼굴 — 공개 여부 운영진 확인 필요
- **배포 (11/28 오후)**: `dpl_BAhBwaZv6dYxs6gG4ndG2ucGoN6N` → 운영 확인(공동체 · 교역자 · 소식 분류 200). 저장소를 비공개로 바꾼 뒤 Vercel 무료판이 「커밋 메일이 GitHub 계정과 안 맞음」으로 막음 → 이 맥 전체 git 이름 · 메일을 `onapond` · onapond GitHub noreply 메일로 바꿈(`~/.gitconfig`, 사용자 「달밤 계정 쓰지 마」). 예전 커밋에는 옛 이름이 남아 있음(이력 재작성 안 함). `vercel` · `codex`는 `< /dev/null`로 돌린다(입력 대기로 멈춤)
- **11/28 오후 2**: 청소년부 사진 → 2026 CU 수련회 단체 사진(미성년자 얼굴이 크게 나오는 사진 안 씀). 글씨 대비 검수(19종 페이지 × 휴대폰 · PC 폭, 배경색 대비 계산) → 공동체 「참여하기」(남색 위 남색 · 검정 글씨)와 소개 번호 01~06 고침(`SectionHeader onDark`). 배포 확인. 지도: 사이트에 지도 화면이 없고 카카오 · 네이버 링크 버튼만 있음(앱 키 없음) — 지도 넣는 방법은 사용자 결정 대기
- Vercel은 개인 계정(`onaponds-projects`) 유지 — 교회 Vercel 계정은 가입만 됨, P5에서 GitHub 조직과 함께 옮긴다(사용자 동의 11/28). 비공개 조직 저장소는 Vercel 무료판 Git 연동이 안 되므로 그때 다시 정함
- **11/28 사용자 결정: 소유권 · 배포 = 교회 계정, 개발 = 개인 계정(onapond)**. 저장소 협업자로 `zenapple96@gmail.com`(GitHub `fluent44`, 파일 업로드 · 수정 담당) 초대 — 수락 대기. 지금은 push ≠ 배포라 그분 수정은 onapond가 배포해야 반영. 주의: Vercel 무료판 + 비공개 저장소는 소유자 아닌 사람의 커밋 배포를 막음(11/28 막힘과 같은 이유) → 교회 계정 이전(P5) 때 저장소 공개 여부 · 배포 방식을 함께 정한다
- **11/28 사용자 결정: 교회 계정 · fluent44 수정은 반드시 검토 거쳐 main 병합** → GitHub 브랜치 보호는 비공개면 유료 → **저장소 공개**로 결정. 공개 전 검사: 이력 전체(파일 4,139개)에 키 · 토큰 · 주민번호 · 카드번호 없음. 커밋 작성자 개인 메일(달밤 129 · Shin Yohan 12) → 사용자 승인으로 **이력 165개 작성자를 onapond로 다시 씀**(내용 트리 동일, 문서 속 옛 커밋 번호 118곳을 새 번호로). 옛 이력 백업 = `../welcome_home-이력백업-2026-11-28.bundle`. 강제 push(사용자) → **공개 전환 · main 규칙(id 28280771: PR + 승인 1 · 마지막 push 뒤 승인 · 강제 push · 삭제 금지, 관리자 onapond만 우회) 끝**. GitHub 이력 작성자 전부 onapond 확인. 교회 계정 = GitHub `chungpa21c`(`chungpa21c@gmail.com`) 협업자 초대 — 수락 대기(fluent44와 같이 쓰기 권한, main은 PR + 승인)
- **작업자 Claude 환경 (11/28 사용자 「교회 작업자가 직접 클로드로」 · 「pdf 업로드 등도」 · 「한번에 업로드」 · 「거기도 클로드를 쓰니까」)**: 전용 변환 도구는 만들지 않고 규칙 스킬 하나 — `.claude/skills/content-update/SKILL.md`(범위 · 브랜치 → `check:content` → PR · 종류별 파일 위치 · 사진 webp 1600/2400px · PDF). 작업자 사진은 R2 키가 없으니 저장소 `public/images/...`에 둔다. 다음: 작업자 초대 수락 → 실제 한 번 해 보기(홈 첫 화면 원본 사진). 작업자 컴퓨터 설치 안내 = `docs/worker-setup.md`(작업자의 Claude Code가 읽고 실행: git · Node 24 · gh 설치 → 작업자가 gh 로그인 → 초대 수락(API) → 저장소 받기 → 저장소 전용 noreply 커밋 이름 → `npm ci` · 검사). README 「콘텐츠 고치기」에 한 줄
- **main 규칙 바꿈 (11/28 사용자 「일반적인 업로드는 다 할 수 있게하고 코드단 수정만 바로 병합 못하게」)**: GitHub 경로별 push 막기는 조직 · 비공개 저장소 전용이라 못 씀(422) → PR 필수(승인 0) + 필수 검사 `scope`(`.github/workflows/scope.yml`, `pull_request_target`이라 PR이 검사 파일을 고쳐 통과시킬 수 없음). 자동 병합 · 병합 뒤 브랜치 삭제 켬. 규칙 id 28280771 갱신 끝(「main 보호 — 콘텐츠는 바로, 코드는 검토」: 삭제 · 강제 push 금지 · PR 필수 승인 0 · 필수 검사 scope). 시험 PR #1(콘텐츠만) 통과 · 병합 가능 / #2(src 1줄) 실패 · 병합 막힘 확인 후 둘 다 닫음
- **제목 크기 · CU 로고 (11/28 사용자 「메뉴에서 넘어갈 때마다 폰트 크기가 달라」 · 「cu는 cu 로고 사용해」)**: 제목 크기는 코드상 전부 같음(휴대폰 30px · PC 36px). 원인 = 명조 글꼴을 쪽마다 필요한 글자 조각만 받는데 `font-display:swap`이라 새 쪽 제목이 대체 글꼴(맥 AppleMyungjo · 아이폰 고딕)로 먼저 보였다가 바뀜 → 명조만 `block`(생성 스크립트 `FONT_DISPLAY` + CSS 124개). 배포 `dpl_3gjV8ccx79adaKiFUmM3FZo4iKU8` 확인. **CU 로고 파일 없음**(저장소 · 옛 사이트 자료 · 관리 앱 · 다운로드 폴더) → 사용자에게 파일 받기 대기. 받으면 공동체 CU 카드 · 홈 공동체 카드에 넣는다
- **보완 목록 · 도메인 (11/28 사용자 「보완 결정해야 할 것도 정리해서 교회 작업자가 할 수 있게」 · 「버셀 앱 도메인을 기존 사이트 도메인으로 연결 · 도메인만 인계받아 우리가 관리」)**: 흩어진 `TODO(교회 확인)` 18곳을 `content/CHECKLIST.md` 하나로(가 = 작업자 18개 · 나 = 교회 결정 → 개발자 3개). 작업자 스킬에 「보완 목록」 절, 설치 문서에 예시 한 줄. CU 로고는 `community.yaml` `logo` 칸(새 형식, 부서 이름 옆 · 홈 카드 사진 위) — 작업자가 파일만 넣으면 됨. 도메인 조회: 등록 기관 후이즈(Whois Corp.), DNS 웹처치(`dns.webchurch.co.kr`), 등록인 가려짐, **만료 2027-01-16**, 도메인 메일(MX) 없음 → 웹처치에 명의 · 관리 권한 인계 문의(사용자가 함). 인계받으면 Vercel 도메인 추가 · DNS · R2 커스텀 도메인 · Resend 도메인(P6)
- **작업자 인계 문서 하나로 (11/28 사용자 「아까 공유한 md 파일에 다 넣어. 파일 규칙 등, 인계사항 등등」)**: `docs/worker-setup.md`(공유한 주소 그대로) = 1부 설치 · 2부 작업 규칙(스킬 내용을 사람용으로 옮김 — 바꾸면 두 곳 같이) · 3부 인계 사항(현황 · 계정 · 보완 목록 표 · 도메인 현황과 웹처치 문의 7가지 · 앞으로 할 일). 진행 표시는 계속 `content/CHECKLIST.md`(작업자가 고칠 수 있는 범위)

**막힌 것 · 담당자 답 대기**
- ~~Resend 키~~ 11/28 끝: Resend 계정 = 교회 메일(`chungpa21c@gmail.com`), Vercel `RESEND_API_KEY` 넣음 · `FORM_NOTIFY_TO` = 교회 메일(도메인 등록 전에는 Resend가 가입 메일로만 보냄). 운영 문의 폼 테스트 1건 `ok:true`. 다른 주소로도 받으려면 Resend에 도메인 등록(P6). Sanity 환경 변수 3개 삭제(11/28 사용자 승인) — Vercel 변수는 `FORM_NOTIFY_TO` · `RESEND_API_KEY` · `NEXT_PUBLIC_MEDIA_BASE_URL` 셋만
- 교회 확인 사실: (예배 시간 · 장소 · 헌금 계좌는 11/28 옛 사이트 그림대로 넣음) 주차 · 점심 · FAQ · 목사 소개 · 신앙고백 · 우편번호 · 좌표 · 큰 담임목사 사진(교회 메일은 `chungpa21c@gmail.com`으로 바꿈, 사용자 11/27)

**옛 사이트 이전 (`docs/migration-plan.md`)**: m1 스키마 · m2 변환기 · m3 사진 · m5 옛 주소 · **m6 확인 · m4 R2 업로드(11/28) 끝** — 이전 완료.
- 이전 준비 Codex 판정 9번째 통과(`docs/reviews/2026-11-27-migration-prep-codex-9.md`). 검토 종료 기준 = `docs/검토규칙.md` ㉑(변환기 지적 중 git으로 되돌릴 수 있는 것은 「낮음」 기록만)
- m6(11/27 저녁): 브라우저 표본 21쪽 이상 없음, 옛 글 1,357건 · 사진 키 7,961개 전부 있음. Codex 1차 「고칠 것 있음」(설교 제목이 본문 「▶ 설교제목」으로 바뀜 · 다른 설교일이 지워짐) → 변환기 고쳐 다시 변환(`27ab74c` · `fca9693`), **2차 판정 통과**(`docs/reviews/2026-11-27-m6-codex-2.md`). 낮음 3건 기록만(m6 절)
- 변환기를 다시 돌린 뒤에는 `git status -- content public/bulletins`로 바뀐 것만 확인하고 커밋(`scripts/migrate/README.md`)


## 2026-11-27 「지금 상태」 원문 (11/27 저녁 마무리 때 옮김)

**다음 할 일 (11/28)** — 사용자 「내가 직접해야할 건, 내일 할거니까」
1. 사용자: Cloudflare R2 켜기(카드) → 버킷 `chungpa-media` → r2.dev 공개 주소 허용 → 버킷 한정 「객체 읽기 및 쓰기」 API 토큰 → `! aws configure --profile chungpa-r2`(region `auto`, 키는 Claude에게 안 보임) → r2.dev 주소 · 계정 ID 전달
2. Claude: `aws s3 sync ../chungpa21-crawl/media/out s3://chungpa-media --endpoint-url https://<계정ID>.r2.cloudflarestorage.com --profile chungpa-r2`(8,282개 · 357MB) → Vercel Production `NEXT_PUBLIC_MEDIA_BASE_URL` = r2.dev 주소
3. Claude: **14:30 이후** `vercel --prod --yes --archive=tgz --scope onaponds-projects`(11/27 Hobby 하루 업로드 5,000개 한도에 걸림)
4. ~~이전 준비 Codex 판정~~ — **아홉 번째에서 통과**(11/27 저녁, `docs/reviews/2026-11-27-migration-prep-codex-9.md`). 3~8번째 「고칠 것 있음」은 모두 고침
4-1. **m6 확인 끝**(11/27 저녁) — 브라우저 표본 21쪽 이상 없음, 옛 글 1,357건 전부 옮겨짐, 사진 키 전부 있음. 유튜브 비공개 · 삭제 영상 21건은 옛 사이트와 같아 그대로(목록은 `docs/migration-plan.md` m6). Codex 1차 「고칠 것 있음」(설교 제목 · 설교일) → 변환기 고쳐 다시 변환, **2차 판정 통과**(`docs/reviews/2026-11-27-m6-codex-2.md`) · 그 낮음 1건도 고침. 이전 m1~m6 중 남은 것은 m4 R2 업로드(내일)뿐
5. 교회 확인 사실 모으기(예배 시간 · 주차 · 점심 · 헌금 계좌 · 우편번호 · 좌표 · 큰 목사 사진). 교회 메일은 `chungpa21c@gmail.com`으로 바꿈(사용자 11/27)
6. Vercel에 `RESEND_API_KEY` 없음 → 폼 메일이 안 감. 사용자가 Resend 키를 넣어야 함

**끝난 것 (11/27 오후)**: 머리글 설명 대비 · 모바일 방문 단계 세로선(`8444e7a`), **m5 옛 주소 연결**(`67e0645` — `/modu/*` 라우트 핸들러, 게시물 1,498건 308, 검사 `node scripts/check-legacy-redirects.mjs`). 「3년의 발걸음」 섹션 흐림은 전체 캡처 착시(실제 정상).

**목표 (사용자 11/27)**: 리팩토링해 실제로 쓸 수 있는 수준으로 만든 뒤, **교회 관리자가 Claude Code로 내용을 고치게** 한다. 관리자는 GitHub 팀으로 초대하고, Supabase · Vercel 등은 결국 교회 계정에서 관리한다.
- 계정: 지금은 사용자 개인 계정 여러 곳에 섞여 있음(`onapond` 아래 `church` 청년부 교적 · `onfamily` 전교인 출석 등). **우선 사용자 계정으로 작업**하고, 정리 · 이전은 나중에 한 곳으로 몰아서 한다. 함께 작업할 사람 = 교회 직원 계정 1 + 교회 직원 개인 계정 1.
- **배포 단계에 비용이 생기면 안 된다**(사용자 11/27).

**사용자 결정 (11/27)**
- Sanity CMS는 걷어낸다. Vercel + Supabase 안에서만 운영한다.
- **콘텐츠(설교 · 공지 · 일정 · 주보)는 저장소 파일(`content/`)** 로 둔다 — Claude Code가 직접 고치고 git이 이력 · 되돌리기를 맡는다.

- **저장소 공개 OK · 홈페이지는 Supabase 안 씀**(폼 = Resend 메일). 소유권은 교회(교회 계정이 GitHub 조직 · Vercel · Supabase 생성), 개발 주도권은 개발자, 직원 1명은 콘텐츠 업데이트 자동화만. Vercel Pro는 필요하면 올리는 선택지(사용자 11/27) — CLAUDE.md 「운영 모델」 절

- **옛 사이트(`www.chungpa21.org`, 11/27 다시 응답 200)를 전부 옮긴다. 옛날 사진도 볼 수 있어야 한다.**
- **사진 = Cloudflare R2**(10GB 무료 · 전송료 0 · 카드 등록 필요). 정식 공개 주소는 R2 커스텀 도메인이라 `chungpa21.org` DNS를 Cloudflare로 옮겨야 함(`r2.dev`는 속도 제한 · 운영 금지) → P6 도메인 전환 때 함께. 사진은 올릴 때 줄여서(썸네일 + 1600px webp) Vercel 이미지 최적화 사용량을 쓰지 않는다.
- **주보 PDF = 저장소 + 올릴 때 압축.**

**비용 제약 조사 (11/27 웹 확인)**
- Vercel Hobby: **비공개 저장소**는 커밋 작성자가 Hobby 팀 주인일 때만 배포된다. 조직 소유 비공개 저장소는 Hobby에서 배포 불가. 공개 저장소이거나 Pro($)여야 함 → 직원 2명이 커밋하려면 **저장소 공개**가 무료 조건.
- Supabase Free: 활성 프로젝트 **2개 한도**(주인 · 관리자인 조직 전체 합산), 1주 활동 없으면 일시정지. `church` · `onfamily`가 이미 있으면 홈페이지용 새 프로젝트 자리가 없을 수 있다.
- → 채택: 홈페이지는 Supabase 없이 — 콘텐츠 · 사진은 저장소, 폼은 기존 Resend 메일(S3 코드 있음). 교적 · 출석 DB와 공개 홈페이지를 한 프로젝트에 섞지 않는다.

**이 폴더 상태**
- git: origin `onapond/welcome_home`, main 추적 · push 완료(`3f17c06`까지). 배포는 여전히 CLI뿐(Git 연동 없음).
- `node_modules` 설치됨. `.env.local` 없음.
- 이 문서가 가리키는 `CONTENT_IMPORT.md` · `scripts/import/` · `../chungpa21-crawl/`(구 사이트 자산 1.14GB)은 **이 컴퓨터에도 원격에도 없다** — 8/21 작업한 다른 컴퓨터에만 있을 수 있음. 다시 만들기 전에 그쪽부터 찾을 것.

**끝난 것: 하네스 셋업 (11/27)**
- `.claude/harness.conf` — 인계 = 이 절(`HANDOFF_SECTION=지금 상태`), CHECK = `npx tsc --noEmit && npm run lint && npm run build`
- `docs/검토규칙.md` — 21개 규칙(㉑ 검토 종료 기준 11/27 추가)(디자인 시스템 · 도메인/URL · S7 렌더링 · 운영), 전부 출처 표기. Sanity 의존 추가 금지 포함
- CHECK 첫 실행: tsc 0 · lint 0 · build 성공(15페이지)
- 마지막 대립 검토 = 없음

**끝난 것: P0 정리 (11/27)**
- 옛 에이전트 문서(`architect` · `cms` · `frontend` · `qa` · `PROMPTS` · `QA_REPORT`)를 `docs/archive/`로. 루트 중복 로고(`청파로고.png` = `public/images/logo.png` 동일 해시) 삭제
- CLAUDE.md: 기술 스택 콘텐츠 줄 · 「에이전트 지시사항」→「운영 모델」

**로드맵**: P0 정리 → P1 콘텐츠를 `content/` 파일로 + Sanity 제거 → P2 폼 저장 → P3 실제 콘텐츠 · 빠진 페이지 → P4 관리자 작업 환경(안내 문서 · 명령 · 범위 제한 · 자동 점검 · Git 연동 배포) → P5 계정 이전 · 직원 초대 → P6 QA · `chungpa21.org` 전환

**사용자 지시 (11/27)**: 「지금 구조 그대로 가지 않는다. 변경할 것을 먼저 바꾸고 마이그레이션한다. 리팩토링은 검수한다. 병렬로 가능한 것은 바로 진행.」

**리팩토링 R** — 이전보다 먼저
- R0 ✅ `642efec` 콘텐츠 계층 `src/lib/content/` · `src/lib/media.ts` · `content/site.yaml` (+ `5cfa116` 하위 라우트와 겹치는 id 거부)
- R1 ✅ `e5ba9f7` 설교 · 찬양 · 소식 · 주보 · 갤러리 라우트 content 기반 정적 생성, `src/lib/sanity` 삭제. 샘플 파일은 이전 때 지울 것(`content/*/` 중 `_template.md` 외 전부 샘플)
- R2 ✅ W2 합침: 교회 정보 → `site.yaml`, 페이지 문구 → `content/pages/*.yaml`(home · location · about · community · visit · service-times · contact), `history.yaml` · `staff.yaml`, `src/lib/{pages는 content/pages.ts, icons, nav, site-summary}.ts`, `SiteProvider`. 연혁은 /about 안 10년 단위 접이식. `TODO(이전)` 표시 = 옛 사이트 확인 전 문구
- R3 ✅ Sanity 패키지 5개 · `sanity/` · `/studio` · 시딩 스크립트 · `ClientLayout` 삭제, env 예시에 `NEXT_PUBLIC_MEDIA_BASE_URL`. `6f11f51` GitHub Actions 점검
- R4 검수 진행: Codex · 대립 검토 둘 다 「고칠 것 있음」(`docs/reviews/2026-11-27-refactor-{codex,reviewer}.md`) → A(콘텐츠 검증 · 이미지 · 폼 · `content/README.md`) · B(헤더 · 메타데이터 · 목록 문구 `content/pages/lists.yaml` · 접근성) 병렬 수정 후 합침. 문서 `82fc43b`
  - 주요 변경: gray-matter 제거(자체 머리말 분리), YAML `CORE_SCHEMA`(날짜 문자열 유지 · 달력 검사 · KST), strict 스키마 + 한국어 오류, 빌드 때 `validateAllContent()`(sitemap.ts에서) 전부 검사, `images.unoptimized: true`, 직원 연락처는 `publishContact: true` 없으면 오류
  - 점검: tsc 0 · lint 0 · build 35페이지 · 17경로 200/404 · 폼 API null 본문 400
  - **브라우저 확인(11/27)**: 상세 페이지 흰 헤더 · 갤러리 확대 보기(화살표 · Esc · 포커스 복귀) · 900px 모바일 메뉴(포커스 이동 · Esc · 스크롤 잠금) · 390px 14페이지 가로 넘침 없음 · 콘솔 오류 없음 · 소식 사진(머리말 + 본문) 표시 · 푸터 공동체 링크
  - 재판정 2차(`-codex-2.md`) · 3차(`-codex-3.md`) 지적 수정 합침(`3cf428a` · `ab27cb3`): 커밋 전 콘텐츠 검사(`.githooks/pre-commit` · `npm run check:content` · `scripts/setup-hooks.mjs`는 hooksPath가 비었을 때만 설정), 경로에 공백 · 제어문자 · `?#%` 거부(하이픈 사용), 주보 iframe은 보관소 키 · `/`경로 PDF만(https PDF는 링크), `{{ }}` 여분 괄호 오류, 폴더 자리 파일은 한국어 오류
  - 4차(`-codex-4.md`, 중간 2 · 낮음 4) 수정 합침: 기존 `.git/hooks` 훅이 있으면 hooksPath를 바꾸지 않음, 미디어 경로에 `{ }` · 앞뒤 공백 · 유니코드 제어 · 공백 문자 금지(오류에 U+XXXX), 폴더 안 읽기 오류를 파일별로 수집. 알려진 한계: 사진 설명에 굵게 · 기울임을 쓰면 잘못된 경로를 놓침(직원 안내서에 금지로 적음)
  - 5~7차(`-codex-5.md` ~ `-codex-7.md`): 훅 설치를 「깨끗한 환경에서만 `.githooks` 켜기, 그 밖에는 바꾸지 않고 켜는 명령만 알림」으로 단순화, 콘텐츠 파일의 U+0000 거부(줄 번호 CR · CRLF 기준). 7차에서 지난 18건 모두 고쳐짐, 남은 2건(작업 트리별 · 중복 hooksPath)은 README에 확인 명령을 적어 마감
  - **R4 검수 마감(11/27)**. 알려진 한계: 사진 설명 안 굵게 · 기울임(안내서에 금지로 적음)
  - 빌드가 Google Fonts 내려받기 실패로 가끔 깨짐(11/27 약 6회 중 2회, 재시도하면 통과) → `next/font/local`로 글꼴을 저장소에 두는 것을 제안함(사용자 결정 전)
  - **옛 사이트 목록 수집 끝(11/27)**: 수집기 `scripts/migrate/crawl.py`(이어 받기 · 캐시, 사진은 HEAD로 크기만), 자료는 저장소 밖 `../chungpa21-crawl/`(`inventory.md` · `notes.md` · `boards/*.json` · `binaries.json`, 51MB — 개인정보가 있어 저장소에 넣지 않음)
    - 게시판 12개: 주일예배 415 · 금요예배 72 · 찬양 94 · 앨범 238(사진 3,764) · 새가족소개 38 · 특별영상 210 · 중보기도 108 · 일정 58 · 소식 270 · 주보 141(PDF 36.7MB) · 연혁 202 · 섬기는 분 12
    - 영상 YouTube 365 · Vimeo 433. 파일 4,350개 약 1.03GB(사진 중앙값 166KB, 긴 변 중앙값 1000px)
    - 개인정보: 섬기는 분 전화 · 메일(4명), 작성자 IP(922건), 새가족 사진 · 이름, 중보기도 내용, 소식 12건에 전화번호 형태, 연혁 · 소식의 세례 · 등록 명단
    - 8/21 수치와 어긋나는 것(앨범 글 수 · 영상 · 파일 수)은 `notes.md`에 미확인으로 적힘
  - **사용자 결정(11/27)**: 중보기도 · 새가족소개는 옮기지 않음(원본은 저장소 밖 보관만, 작성자 IP는 버림, 섬기는 분 연락처는 비공개 기본값 유지) · Vimeo 재생 지원 추가 · 글꼴을 저장소에 넣음(`next/font/local`) · push 완료
  - 글꼴 저장소화 합침: `public/fonts/noto-serif-kr/`(범위별 woff2 124개 · OFL, 약 6.6MB) + `src/app/fonts/noto-serif-kr.css`, 다시 받기 `scripts/fonts/fetch-noto-serif-kr.mjs`, `/fonts/*` 30일 캐시(`next.config.ts`). 빌드가 구글 글꼴에 의존하지 않음. Pretendard는 실행 때 jsDelivr에서 받음(빌드 무관)
  - Vimeo 지원 합침: 설교 · 찬양에 `video:`(유튜브 · 비메오 주소), 선택 `thumbnail:`(없으면 남색 기본 표지 + Play), 예전 `youtube:`도 유지
  - m1(영상 묶음 `/news/videos` · `thumb:` 필드) · m3(사진 4,141장 → 1600px + 480px, EXIF · GPS 제거, 저장소 밖 `../chungpa21-crawl/media/`) 끝
  - **Vimeo 재결정(11/27)**: 표본 20건 지금도 전부 403 → 사용자 「글만 옮기고 코드는 둠」. 검토규칙 ⑱ 갱신
  - **m2 끝(11/27)**: `scripts/migrate/convert.py`로 옛 게시판 → `content/` 이전 커밋. 설교 487(주일 415 · 금요 72) · 찬양 94 · 영상 210 · 앨범 238 · 일정 58 · 소식 270 · 주보 141(PDF 141건 `public/bulletins/`) · 연혁 202 · 섬기는 분 12. 샘플 파일은 지움. 보고서는 저장소 밖 `../chungpa21-crawl/convert-report.md`
    - **사용자 결정(11/27)**: 개인 이름(교인 동정 · 세례자 명단 · 특송자)은 그대로 옮김. 집 주소만 `(주소 생략)`으로 뺌 — 13건(소식 9개 글, 판단 불확실 1건 포함), 행사 장소 주소 15건은 둠. 전화 가림 · IP · 작성자 아이디 버림 · 직원 연락처 생략은 그대로. 그 밖의 개인정보 검토는 새 사이트에서 나중에(계좌 모양 14 · 차량번호 모양 3은 세기만 함)
    - **주보 PDF 23건**: OCR로 개인 휴대전화(22) · 집 주소(1)가 보였지만 사용자 결정(11/27) 「그대로 넣음 · 개인정보는 새 사이트에서 다시 검토」 → 141건 전부 커밋. `convert.py` `PDF_HOLD`는 빈 목록(필요하면 id를 넣어 뺌)
  - **두 번째 판정 지적 수정 합침(11/27, `9bbcce1` · `0f1f82d`)**: 방문일 서버 검증(KST) · 동의 문구 · 대비 · llms.txt · 시각 갱신 · sitemap lastmod · favicon · IP 삭제 / 변환기 PDF 캐시(오프라인 재실행에도 PDF 유지) · 태그 깊이 · 소식 대표 사진 · 임시 파일 · sameFileAs · 상대 링크. 세 번째 판정 아직
  - **랜딩 실제 사진(11/27)**: 옛 사이트 앨범에서 골라 `public/images/site/`(저장소, 8장 · 약 0.6MB)에 둠 — 히어로 3(몽골 비전트립 · 전교인수련회 · 부활절 칸타타) · 새가족 · 공동체 3 · 담임목사(185×219 작음, 큰 사진 받으면 교체). 앨범 · 소식 · 섬기는 분 사진(보관소 키)은 R2 연결 전까지 깨져 보임
  - **배포 막힘(11/27 14:20)**: Vercel Hobby CLI 하루 업로드 파일 5,000개 한도 초과(첫 시도에 `.vercelignore` 없이 올림) → 24시간 뒤 `vercel --prod --yes --archive=tgz --scope onaponds-projects`. `.vercelignore` = 허용 목록(빌드에 필요한 것만)
  - **개선 점검 · 적용(11/27)**: `docs/improvement-audit-2026-11-27.md`. SEO(OG 이미지 · JSON-LD · RSS · llms.txt · 아이콘 · 글꼴 자체 제공 · 영상 facade) · 디자인(keep-all · 대비 · 바로가기 · 하단 고정 버튼 · 길찾기 · 공유 · /visit 단계 · 방문 희망일 · `/privacy`) 합침. 교회 확인 TODO: 예배 · 주차 · 점심 · FAQ 문구, geo · 우편번호, 처리방침 보유기간 · 책임자 · 시행일, 헌금 계좌, 카카오톡 채널
  - 다음: m4 R2 업로드(사용자 Cloudflare 계정 필요) · m5 옛 주소 연결(legacy → 새 주소) · m6 브라우저 확인
- 라우트는 전부 정적(`dynamicParams=false`). 사진은 next/image 최적화 안 씀. 「다가오는 일정」은 클라이언트에서 거를 것

