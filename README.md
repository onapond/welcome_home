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
npm ci
cp .env.local.example .env.local   # 값은 비워 둬도 화면은 뜬다 (폼만 503 안내)
npm run dev                        # http://localhost:3000
```

## 콘텐츠 고치기

`content/README.md`에 폴더 · 파일 이름 · 날짜 형식 · 사진 경로 규칙이 있습니다. 각 폴더의 `_template.md`를 복사해 새 항목을 만듭니다.

형식이 틀린 파일은 **빌드가 실패**하고, 어느 파일의 어느 항목이 틀렸는지 한국어로 알려 줍니다. 잘못된 내용이 사이트에 올라가지 않습니다.

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
docs/               # 검토 규칙 · 검토 기록 · 보관 문서(archive)
```
