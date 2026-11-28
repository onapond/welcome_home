# 청파중앙교회 홈페이지

서울 용산구 청파중앙교회(대한예수교 장로회) 홈페이지입니다.

- **지금 주소**: https://welcomehome-seven.vercel.app (`chungpa21.org` 연결은 도메인 이전 단계에서 한다)
- **기술 스택**: Next.js 16 · Tailwind CSS v4 · TypeScript
- **콘텐츠**: 저장소의 `content/` 파일 (설교 · 소식 · 주보 · 사진첩 · 교회 정보 · 페이지 문구). 데이터베이스·CMS 없음
- **사진**: Cloudflare R2 (`NEXT_PUBLIC_MEDIA_BASE_URL`)
- **폼**: 방문 신청 · 문의 → Resend 메일

---

## 로컬 실행

```bash
npm ci                             # 커밋 전 콘텐츠 검사(.githooks/pre-commit)도 함께 켠다
cp .env.local.example .env.local   # 값은 비워 둬도 화면은 뜬다 (폼만 503 안내)
npm run dev                        # http://localhost:3000
```

## 콘텐츠 고치기

교회 작업자는 Claude Code로 고칩니다. 처음 한 번, 작업자 컴퓨터의 Claude Code에 「https://github.com/onapond/welcome_home/blob/main/docs/worker-setup.md 읽고 이 컴퓨터에 설치해줘」라고 말하면 설치 · 로그인 안내 · 저장소 받기까지 진행합니다. 그 뒤 요청은 `.claude/skills/content-update` 규칙대로 처리됩니다.

`content/README.md`에 폴더 · 파일 이름 · 날짜 형식 · 사진 경로 규칙이 있습니다. 각 폴더의 `_template.md`를 복사해 새 항목을 만듭니다.

형식이 틀린 파일은 **빌드가 실패**하고, 어느 파일의 어느 항목이 틀렸는지 한국어로 알려 줍니다. 잘못된 내용이 사이트에 올라가지 않습니다.

```bash
npm run check:content   # 빌드 없이 content/ 전체를 몇 초 만에 검사 (빌드와 같은 규칙)
```

`content/`를 바꾼 커밋은 커밋 직전 검사(`.githooks/pre-commit`)가 **스테이징한 내용**을 같은 규칙으로 먼저 검사하고, 문제가 있으면 커밋을 멈춥니다. 공개 저장소라 공개 동의 없는 연락처 같은 내용은 커밋되는 순간 기록에 남기 때문입니다. `npm ci` · `npm install`이 `prepare` 스크립트(`scripts/setup-hooks.mjs`)로 `core.hooksPath`가 비어 있고 Git이 지금 쓰는 훅 폴더(보통 `.git/hooks`)에 `.sample` 말고 다른 파일이 없을 때만 `.githooks`로 설정합니다. 이미 훅 설정이 있는 컴퓨터는 아무것도 바꾸지 않고 「검사가 꺼져 있다」고 한 줄로 알립니다. 그때 이 저장소에서 켜려면 `git config core.hooksPath .githooks`를 실행합니다(이 저장소에서는 기존 훅 대신 `.githooks`를 씀). 다른 훅과 함께 쓰도록 연결하는 것은 개발자가 판단합니다(저장소 밖에서는 건너뜀).

켠 뒤에는 `git config --show-scope --get core.hooksPath`로 실제 적용값이 `local … .githooks`인지 확인합니다. `worktree`로 나오면 그 작업 트리에서 `git config --worktree core.hooksPath .githooks`를 실행하고, 「여러 값」 오류가 나면 `git config --local --get-all core.hooksPath`로 기존 값을 본 뒤 `git config --local --replace-all core.hooksPath .githooks`로 하나만 남깁니다.

## 점검

```bash
npx tsc --noEmit && npm run lint && npm run build
```

GitHub Actions(`.github/workflows/check.yml`)가 push · PR마다 같은 점검을 돌립니다.

## 커밋

- 고친 파일만 지정해서 올립니다(`git add content/sermons/2026-11-30.md`). `git add .` · `git add -A`를 쓰지 않습니다 — `.env.local` 같은 로컬 설정이 섞이지 않게.
- 메시지 형식: `[역할] 작업 내용` (예: `[content] 11월 30일 주일설교 추가`)

## 배포

```bash
vercel --prod --yes --scope onaponds-projects
```

지금은 이 명령이 유일한 배포 경로입니다(push는 배포하지 않음).

## 환경변수

`.env.local.example` 참고. 비밀값은 커밋하지 않습니다.

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_MEDIA_BASE_URL` | 사진 저장소(R2) 공개 주소 |
| `RESEND_API_KEY` · `FORM_NOTIFY_TO` · `FORM_NOTIFY_FROM` | 폼 알림 메일 |
| `NEXT_PUBLIC_SITE_URL` | canonical · OG · sitemap 기준 주소. 도메인 이전 전에는 등록하지 않는다 |
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | (아직 안 씀) 카카오맵 SDK를 붙일 때 |

## 폴더

```
content/            # 사이트 내용 (직원이 고치는 곳)
src/app/            # 페이지 (전부 빌드 때 정적 생성)
src/components/     # layout · sections · features · ui
src/lib/content/    # content/ 읽기 · 형식 검사(zod)
src/lib/media.ts    # 사진 주소 만들기
public/images/      # 로고 등 고정 이미지
public/fonts/       # 제목 글꼴 Noto Serif KR(OFL) — 빌드가 내려받지 않게 저장소에 둠. 갱신: node scripts/fonts/fetch-noto-serif-kr.mjs
docs/               # 검토 규칙 · 검토 기록 · 보관 문서(archive)
```
