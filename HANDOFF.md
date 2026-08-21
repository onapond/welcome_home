# 청파중앙교회 홈페이지 — 핸드오프 문서

> 마지막 갱신: 2026-08-21 | 다음 작업자: Claude Code

---

## 2026-08-21 세션 기록

### 검증으로 정정된 사실 (이전 메모의 추정 교체)

| 이전 메모 주장 | 실제 확인 결과 |
|---|---|
| "배포 복구 필요" | **배포는 정상**. `welcomehome-seven.vercel.app` → HTTP 200. 최신 Production 배포 128일 전 Ready |
| "chungpa21.org 502 — Vercel 확인 필요" | **Vercel과 무관**. DNS가 기존 WebChurch 서버 `116.125.124.67`을 가리키며 그 서버가 죽어 있음. 도메인은 아직 Vercel로 이전되지 않았다 |
| "npm ci 미완료로 검증 불가" | Node v24.18.0에서 `npm ci` 정상 완료 (exit 0) |
| `limit - 1` 버그 의심 | **버그 확정**. GROQ `[0...$limit]`는 exclusive end라 5 요청 시 4개 반환 |

추가로 확인된 사항:
- `.vercel` 링크가 없어 배포 불가 상태였음 → 재링크 완료
- Production 환경변수에 Sanity 3종은 있으나 `NEXT_PUBLIC_SITE_URL`과 카카오맵 키는 **없음**
- `src/app/api` 디렉토리 자체가 없음 — 폼 2개 모두 백엔드 전무
- `public/images`에는 `logo.png` 하나뿐. 6개 파일이 `ImagePlaceholder` 사용 중
- `sitemap.ts`가 **존재하지 않는 `/connect`를 등재**하고 실재하는 `/visit/service-times`는 누락

### 확정된 방침 (사용자 결정)

- **도메인**: 실제 콘텐츠(사진·설교)를 채운 뒤 `chungpa21.org`를 이전한다. 그때까지 기존 도메인은 죽은 상태로 둔다.
- **폼 백엔드**: Resend 이메일 알림 방식으로 구현한다.

### 세션 분할 계획

| 세션 | 범위 | 완료 조건 | 상태 |
|---|---|---|---|
| S0 | 의존성 설치, lint/tsc/build 검증, Vercel 재링크 | 3개 명령 통과 기록 | ✅ 완료 |
| S1 | 코드 버그 수정 (limit, SITE_URL 일원화, sitemap 경로, env명, contact metadata) | 검증 통과 + 배포 | ✅ 완료 (미배포) |
| S3 | Resend 기반 폼 백엔드 (방문신청·문의) | 실제 제출 → 담당자 수신 확인 | 🟡 코드 완료 / 키 대기 |
| S4 | Sanity Studio 운영 방식 확정 (`sanity deploy`) | 관리자 URL + 사용 절차 문서화 | ⬜ |
| S5 | 실제 콘텐츠 반영 (사진·설교 YouTube ID·주보) | ImagePlaceholder 0개 | ⬜ **교회 자료 수령 필요** |
| S2 | chungpa21.org 도메인 이전 | 도메인 HTTP 200 | ⬜ S5 이후 |
| S6 | 최종 운영 QA | QA 리포트 갱신 | ⬜ |

> S5는 교회에서 사진·설교 링크·주보를 받아야 착수 가능하다. 다른 세션과 병렬로 미리 요청해 둘 것.

### S0 — 기반 복구 (완료)

```
npm ci            → exit 0
npx tsc --noEmit  → 통과 (에러 0)
npm run lint      → 통과 (에러 0)
npm run build     → 성공, 13개 페이지 생성
vercel link       → onaponds-projects/welcome_home 연결
vercel env pull   → .env.local 생성 (Sanity 3종 확인)
```

### S1 — 코드 버그 수정 (완료, 아직 미배포)

| 수정 | 파일 | 내용 |
|---|---|---|
| GROQ slice 버그 | `src/lib/sanity/queries.ts` | `{ limit: limit - 1 }` → `{ limit }` (2곳). 요청 개수대로 반환되도록 수정 |
| 사이트 URL 일원화 | `src/lib/site.ts` (신규) | `SITE_URL` 단일 소스 신설. `NEXT_PUBLIC_SITE_URL` 미설정 시 vercel.app 폴백 |
| 하드코딩 제거 | `layout.tsx`, `robots.ts`, `sitemap.ts` | 죽은 `chungpa21.org`를 canonical/OG/sitemap에 박아두던 것을 `SITE_URL`로 교체 |
| sitemap 경로 오류 | `src/app/sitemap.ts` | 미존재 `/connect` 제거, 누락된 `/visit/service-times` 추가 |
| env 변수명 통일 | `.env.example`, `.env.local.example` | `NEXT_PUBLIC_KAKAO_MAP_API_KEY`로 통일. 카카오 키가 **코드에서 미사용**임을 명시 |
| metadata 분리 | `src/app/contact/page.tsx` → `src/components/features/ContactClient.tsx` | 서버 페이지 + 클라이언트 폼으로 분리해 `/contact` 페이지 metadata 확보 |

### S1-b — 페이지별 canonical 분리 (완료)

첫 배포 후 라이브 검증 중 발견한 별도 버그다.

`layout.tsx`의 `alternates: { canonical: "/" }`가 모든 하위 페이지에 상속되어
**8개 페이지 전부가 홈페이지를 정규 URL로 선언**하고 있었다. 검색엔진에
하위 페이지를 홈의 중복으로 알리는 상태라, CLAUDE.md가 핵심 페이지로 지정한
`/visit`을 포함해 주요 페이지가 색인되지 않을 수 있었다.

- `layout.tsx`: 루트 canonical 제거 (재발 방지용 주석 기재)
- 7개 페이지 metadata에 각자 경로의 canonical 추가
- 홈(`src/app/page.tsx`)은 metadata export가 없어 신설

### S3 — 폼 백엔드 (코드 완료, 환경변수 대기)

두 폼이 더 이상 거짓으로 "접수되었습니다"를 표시하지 않는다.

**신규 파일**

| 파일 | 역할 |
|---|---|
| `src/lib/forms.ts` | 검증·정규화·HTML 이스케이프·허니팟 판정·한글 조사 처리 |
| `src/lib/rate-limit.ts` | IP 기반 인메모리 레이트리밋 |
| `src/lib/mail.ts` | Resend 발송 래퍼 (fetch 직접 호출, 의존성 추가 없음) |
| `src/app/api/visit/route.ts` | 방문 신청 접수 |
| `src/app/api/inquiry/route.ts` | 문의 접수 |

**동작 원칙**

- `RESEND_API_KEY` 또는 `FORM_NOTIFY_TO`가 없으면 **503 + 전화 안내**를 반환한다.
  성공을 반환하지 않는 것이 핵심이다 — 아무도 받지 못하는 접수를 접수됐다고
  알리면 신청자가 연락을 기다리다 놓친다.
- 발송이 실패해도 **502 + 전화 안내**. 어떤 경로로도 거짓 성공이 나오지 않는다.
- 실패 사유는 서버 로그에만 남기고 **개인정보는 기록하지 않는다.**

**스팸·오남용 방어**

- 허니팟(`website` 필드): 값이 차 있으면 봇으로 보고 조용히 200을 반환한다.
  탐지 사실을 알려주지 않는다.
- 레이트리밋 2단계 분리:
  - `FLOOD` 20회/10분 — 검증 실패 포함 모든 요청. 폭주만 막는다.
  - `SEND` 3회/10분 — 실제 발송만. 스팸 발송의 진짜 상한.
  - 분리하지 않으면 연락처를 두어 번 잘못 입력한 방문자가 차단된다.
- 서버측 길이 제한 및 선택지 화이트리스트 (클라이언트 제한은 우회 가능)
- 이메일 본문에 들어가는 모든 사용자 입력은 `escapeHtml`을 거친다.

**개인정보 (한국 개인정보보호법)**

이름·연락처를 수집하므로 두 폼 모두 **동의 체크박스를 필수**로 두었다.
미동의 시 접수하지 않는다.

**클라이언트**

- 실제 `fetch` 제출, 로딩 중 버튼 비활성화로 중복 제출 방지
- 서버 검증 오류는 해당 메시지를, 그 외에는 전화 안내를 표시
- 네트워크 오류 별도 처리

**로컬 검증 완료** (dev 서버, IP를 달리해 레이트리밋 간섭 제거)

| 케이스 | 결과 |
|---|---|
| 정상 입력, 키 미설정 | 503 + 전화 안내 |
| 키 설정 + 발송 실패 | 502 + 전화 안내 (거짓 성공 없음) |
| 이름 누락 / 전화 형식 오류 / 동의 미체크 | 400 + 필드별 메시지 |
| 허용 외 선택지 | 400 |
| 허니팟 채워짐 | 200 (조용히 폐기) |
| 잘못된 JSON | 400 |
| 이름 40자 초과 | 400 |
| `+82` 국가번호 | 정상 통과 |
| 검증 실패 5회 후 정상 제출 | 통과 (발송 상한 미소진) |

**남은 작업 — 환경변수 3개만 넣으면 실동작**

```bash
printf "값" | vercel env add RESEND_API_KEY production --scope onaponds-projects
printf "값" | vercel env add FORM_NOTIFY_TO production --scope onaponds-projects
printf "값" | vercel env add FORM_NOTIFY_FROM production --scope onaponds-projects
```

- `FORM_NOTIFY_TO`: 접수 알림을 받을 실제 주소. 콤마로 여러 개 지정 가능.
  ⚠️ `church@chungpa21.org`는 기존 서버와 함께 죽었을 가능성이 있어 확인 필요.
- `FORM_NOTIFY_FROM`: Resend에서 **인증한 도메인**의 주소여야 한다.
  미설정 시 `onboarding@resend.dev`로 나가는데, 이 테스트 발신자는
  Resend 계정 소유자에게만 전달되므로 운영에는 쓸 수 없다.

**프로덕션 배포 검증 완료** (2026-08-21)

| 확인 | 결과 |
|---|---|
| `/api/visit` 정상 입력 | 503 + 전화 안내 (키 미설정 상태의 올바른 동작) |
| `/api/inquiry` 전화 형식 오류 | 400 + 필드 메시지 |
| 허니팟 | 200 조용히 폐기 |
| `/visit`·`/contact` 동의 체크박스·허니팟 렌더링 | 정상 |
| `robots.txt`의 `/api/` 차단 | 정상 |

> 현재 방문자에게는 "온라인 접수 일시 중단, 02-714-0041로 전화" 안내가 나간다.
> 거짓 접수 안내보다 낫지만 **정상 상태는 아니다.** 환경변수 3개를 넣어야 끝난다.
> 등록 후 반드시 실제 제출 → 수신 확인까지 해야 S3 완료다.

### 검증 및 배포 결과

```
tsc --noEmit  → 통과
lint          → 통과
build         → 성공 (13페이지)
vercel --prod → READY
```

라이브 확인 완료 (2026-08-21):
- 주요 경로 8개 모두 HTTP 200
- `sitemap.xml`: `/connect` 제거·`/visit/service-times` 추가·URL 교정 반영
- `robots.txt`: Sitemap URL 교정 반영
- canonical 8개 경로 전부 자기 경로로 정상 출력
- `/contact` 페이지 title·og 태그 정상 생성

`NEXT_PUBLIC_SITE_URL`은 **등록하지 않았다**. 미설정 시 `src/lib/site.ts`의
폴백(vercel.app)이 쓰이며 현재 상태에 맞다. S2 도메인 이전 시 등록할 것.

GitHub push 완료 — 로컬·`origin/main`·프로덕션이 모두 동기화됨 (`992c5e3`).

### ⚠️ 중요: 이 프로젝트는 GitHub 자동배포가 연결되어 있지 않다

`git push origin main` 후 90초간 관찰했으나 **새 배포가 생성되지 않았다.**
Vercel 프로젝트에 Git 연동이 없어 push는 배포를 트리거하지 않는다.

- 히스토리의 빈 커밋 `chore: Vercel 배포 재트리거` 2건(`b83f06d`, `c290676`)이
  연달아 있는 것은 git으로 배포를 트리거하려다 실패한 흔적으로 보인다.
- **배포는 반드시 아래 CLI 명령으로 해야 한다.** push만 하고 배포된 줄
  알면 프로덕션이 낡은 상태로 남는다.

```bash
vercel --prod --yes --scope onaponds-projects
```

> 향후 개선: Vercel 대시보드 → Settings → Git 에서 `onapond/welcome_home`을
> 연결하면 push 자동배포와 PR 프리뷰를 쓸 수 있다. 연결 여부는 별도 판단 사항.

---

## 현재 상태

**배포 URL**: https://welcomehome-seven.vercel.app  
**Vercel 프로젝트**: onaponds-projects/welcome_home  
**Sanity CMS**: 프로젝트 ID `re13zhns` (dataset: production)  
**GitHub**: github.com/onapond/welcome_home  

---

## 완료된 페이지 (7개)

| 페이지 | 경로 | 주요 기능 |
|--------|------|-----------|
| 홈 | `/` | 히어로 슬라이더, 예배시간 바, 표어 타임라인, 새가족 섹션, 최신 설교, 공동체, 오시는 길 |
| 교회소개 | `/about` | 비전/미션, 담임목사, 교회역사, 신앙고백, 교역자 소개 |
| 새가족 안내 | `/visit` | FAQ 아코디언, 예배 안내, 방문 예약 폼(#reservation), 지도 |
| 설교 | `/sermons` | Sanity 연동, 검색/필터/페이지네이션, YouTube 모달 |
| 소식 & 주보 | `/news` | Sanity 연동, 공지사항, 주요 소식, 주보 아카이브 |
| 공동체 | `/community` | 청년부 United, 청소년부, 선교, 소그룹/구역 |
| 문의 | `/contact` | 문의 폼(UI), 교회 연락처, 카카오맵 링크 |

---

## Sanity CMS 현황

- 스키마: sermon, sermonSeries, post, bulletin, gallery, event (배포 완료)
- 샘플 데이터 (라이브):
  - 설교 시리즈 3개 (요한복음, 산상수훈, 특별설교)
  - 설교 10개 (김항우 목사)
  - 소식/공지 4개
  - 주보 3개

**Sanity Studio 로컬 실행:**
```bash
cd sanity && npm run dev  # → http://localhost:3333
```

**스키마 수정 후 배포:**
```bash
cd sanity && ./node_modules/.bin/sanity schema deploy
```
> ⚠️ MCP `deploy_schema` 도구 사용 금지 — 로컬 파일과 desync됨

---

## 남은 작업 (세션별)

### S3 — 폼 백엔드 (Resend) ← 다음 세션
- [ ] `src/app/api/` 신설, 방문신청·문의 제출 엔드포인트 구현
- [ ] Resend API 키 발급 + 발신 도메인 인증 → Vercel 환경변수 등록
- [ ] 스팸 방지(허니팟/레이트리밋), 중복 제출 방지, 실패 시 사용자에게 실제 실패 표시
- [ ] 현재 두 폼은 `setSubmitted(true)`만 하고 "접수되었습니다"를 표시 — **연결 전까지 공개 도메인에 올리지 말 것**

### S4 — Sanity Studio 운영 확정
- [ ] `cd sanity && npx sanity deploy` 로 공식 호스팅 배포
- [ ] 내장 `/studio` 라우트 처리 결정 (제거 또는 리다이렉트)
- [ ] 관리자 URL·로그인 방법을 목사님/담당자용 절차로 문서화

### S5 — 실제 콘텐츠 (교회 자료 수령 필요) ⚠️ 외부 의존
- [ ] **교회 사진 수령** → `public/images/` 추가 후 `ImagePlaceholder` 교체
      (사용처 6곳: `HeroSection`, `NewHereSection`, `CommunitySection`, `about/page`, `community/page`)
- [ ] **설교 YouTube ID 수령** → Sanity `sermon` 문서에 입력
- [ ] 주보·공지 최신본 입력
- [ ] 2024/2026 고정된 표어·뉴스·폴백 날짜가 현재 콘텐츠와 맞는지 확인

### 🚫 도메인 연동 금지 (현재 방침)

**`chungpa21.org`는 S5 완료 전까지 연동하지 않는다.** 배포는 `welcomehome-seven.vercel.app` 에만 한다.

현재 안전 상태 (2026-08-21 확인):
- Vercel 계정 도메인 목록에 `chungpa21.org` 없음
- DNS는 여전히 기존 서버 `116.125.124.67` 지목
- `NEXT_PUBLIC_SITE_URL` 프로덕션 미등록 → 코드 폴백(vercel.app) 사용

> ⚠️ `src/lib/site.ts`는 `NEXT_PUBLIC_SITE_URL`이 등록되는 즉시 canonical·OG·sitemap을
> 그 값으로 바꾼다. **DNS 전환 전에 이 변수를 등록하면 사이트가 죽은 도메인을
> 정규 URL로 선언하게 된다.** S2에서 DNS 전환과 함께 등록할 것.

### S2 — 도메인 이전 (S5 완료 후, 현재 보류)
- [ ] Vercel → Settings → Domains → `chungpa21.org` 추가
- [ ] DNS를 기존 서버(`116.125.124.67`)에서 Vercel로 전환
- [ ] `NEXT_PUBLIC_SITE_URL=https://chungpa21.org` 등록 후 재배포
- [ ] 전환 후 sitemap/robots/OG의 URL이 새 도메인으로 바뀌는지 확인 (`src/lib/site.ts` 경유)

### S6 — 최종 QA
- [ ] 모바일 실기기, 폼 제출, 지도/전화 링크
- [ ] 배포 후 주요 경로 + `robots.txt`, `sitemap.xml`, 404
- [ ] Sanity 콘텐츠 미설정 시 폴백 동작

### 별도 판단 필요
- [ ] **카카오맵**: 현재 SDK 미연동(외부 링크 방식)이며 `NEXT_PUBLIC_KAKAO_MAP_API_KEY`를 읽는 코드가 없다. SDK를 붙일지 링크로 유지할지 결정
- [ ] **README 갱신**: `/community`, `/contact`, `/visit/service-times`, Studio 현황이 반영돼 있지 않음
- [ ] **Footer 이메일**: `church@chungpa21.org` — 기존 서버가 죽어 있어 메일 수신 여부 확인 필요

---

## 배포 방법

⚠️ **GitHub 자동배포가 연결되어 있지 않다. push만으로는 배포되지 않는다.**

```bash
# 변경사항 후 프로덕션 배포 (유일한 배포 경로)
vercel --prod --yes --scope onaponds-projects
```

git 자격증명은 `gh auth login` → `gh auth setup-git` 으로 설정한다.

---

## 주요 파일 위치

```
src/app/                    # 페이지 라우트
src/components/
  layout/                   # Header, Footer, MobileNav
  sections/                 # 홈페이지 섹션 컴포넌트 7개
  features/                 # SermonsClient.tsx, VisitClient.tsx
  ui/                       # Button, SectionHeader, ImagePlaceholder
src/lib/sanity/             # client.ts, queries.ts, types.ts
sanity/schemas/             # CMS 스키마 정의
public/images/              # logo.png (교체 예정 이미지들 여기에 추가)
```

---

## 알려진 이슈

| 이슈 | 상태 | 해결책 |
|------|------|--------|
| `@sanity/client@6` + `next-sanity@9` peer dep 경고 | 무시 가능 | `.npmrc` legacy-peer-deps=true 적용됨 |
| news 페이지 post.slug null 처리 | 수정됨 | `post.slug?.current ?? "#"` |
| GROQ slice가 1개 적게 반환 | **S1에서 수정** | `queries.ts` `{ limit: limit - 1 }` → `{ limit }` |
| canonical/OG/sitemap이 죽은 도메인 지목 | **S1에서 수정** | `src/lib/site.ts` `SITE_URL` 일원화 |
| sitemap에 미존재 `/connect` 등재 | **S1에서 수정** | 제거 + `/visit/service-times` 추가 |
| `/contact` 페이지 metadata 없음 | **S1에서 수정** | 서버 페이지 + `ContactClient` 분리 |
| 카카오 env 변수명 2종 불일치 | **S1에서 수정** | `NEXT_PUBLIC_KAKAO_MAP_API_KEY`로 통일 |
| 방문/문의 폼 실제 저장 안 됨 | 미해결 (S3) | Resend + API Route 연동 |
| 지도 SDK 미연동 (외부 링크) | 미해결 | 링크 유지 여부 결정 필요 |
| 교회 사진 없음 | 미해결 (S5) | 사진 제공받아 교체 |
| chungpa21.org 도메인 미이전 | 미해결 (S2) | S5 완료 후 DNS 전환 |
| **/studio 관리자 페이지 작동 안 함** | **미해결 (S4)** | 아래 상세 참고 |

---

## 🚨 미해결: /studio 관리자 페이지

### 증상
`welcomehome-seven.vercel.app/studio` 접속 시 Studio UI가 뜨지 않음.

### 근본 원인
**Next.js 16 + Turbopack + Sanity Studio v3 호환성 문제**
- Next.js 16은 Turbopack을 기본 번들러로 사용
- Sanity Studio를 SSR(서버사이드 렌더링)하면 `TypeError: createContext is not a function` 에러 발생
- `dynamic({ ssr: false })`로 우회하면 빌드는 통과하지만 Studio 내부 라우팅이 깨짐

### 시도한 방법 (모두 실패)

| 방법 | 결과 | 실패 이유 |
|------|------|-----------|
| `NextStudio` 직접 사용 | 빌드 실패 | Turbopack SSR에서 `createContext is not a function` |
| `dynamic({ ssr: false })` + `NextStudio` | 런타임 에러 | "Tool not found: studio" — Next.js 라우팅 통합 깨짐 |
| `dynamic({ ssr: false })` + 순수 `Studio` | 런타임 에러 | 동일 |
| `transpilePackages` 추가 | 빌드 실패 | 근본 해결 안 됨 |
| `serverExternalPackages` 추가 | 로컬 빌드 성공, Vercel 실패 | Vercel 런타임에서 패키지 미탑재 |
| `basePath: "/studio"` config 설정 | 효과 없음 | 라우팅 이슈 지속 |

### 현재 코드 상태
- `src/app/studio/[[...tool]]/page.tsx` — `dynamic({ ssr: false })`로 `sanity/Studio` 로드 시도
- `src/sanity.config.ts` — `basePath: "/studio"`, 스키마 정상 설정
- `src/components/layout/ClientLayout.tsx` — `/studio` 경로에서 Header/Footer 숨김

### 권장 해결책 (시도 안 해본 것)

#### 방법 A: Sanity 공식 호스팅으로 전환 (가장 간단, 즉시 가능) ⭐ 추천
```bash
cd sanity
npx sanity deploy
# → 무료, https://chungpa-central-church.sanity.studio 같은 URL 생성
```
- 코드 변경 없이 즉시 사용 가능
- 완전히 별도 URL이지만 무료이고 안정적
- 홈페이지 Footer에 관리자 링크 추가하면 됨

#### 방법 B: Next.js를 Webpack으로 빌드
Next.js 16은 Turbopack이 기본. Webpack으로 강제 전환하면 SSR 에러가 사라질 수 있음.
```ts
// next.config.ts 에 추가
experimental: {
  turbopack: false  // 유효 여부 확인 필요
}
```
또는 package.json:
```json
"build": "TURBOPACK=0 next build"
```

#### 방법 C: next-sanity 업그레이드 대기
next-sanity가 Next.js 16 Turbopack을 공식 지원하는 버전 출시 후 재시도

### 관련 파일
```
src/app/studio/[[...tool]]/page.tsx   ← Studio 라우트
src/sanity.config.ts                  ← Studio 설정 (basePath 포함)
src/components/layout/ClientLayout.tsx ← /studio 경로 헤더 제외
sanity/                               ← 독립 Sanity 프로젝트 (로컬 실행 가능)
```

### 로컬에서 Studio 사용하는 임시 방법
```bash
cd sanity && npm run dev  # → http://localhost:3333 에서 정상 작동
```

---

## 디자인 시스템 (변경 금지)

```css
--color-primary: #2B3A8C;     /* 남색 — 네비/CTA/강조 */
--color-secondary: #6EC6E6;   /* 하늘색 — 호버/배지 */
--color-accent: #D4A843;      /* 골드 — 표어 라벨만 */
```

- 아이콘: Lucide React 전용 (이모지 절대 금지)
- 폰트: Noto Serif KR (제목) + Pretendard (본문)
