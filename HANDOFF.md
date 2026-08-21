# 청파중앙교회 홈페이지 — 핸드오프 문서

> 마지막 갱신: 2026-08-21 | 다음 작업자: Claude Code
>
> **여기부터 읽으세요** — 이번 세션(2026-08-21)에 구 사이트 자산 4,559건을 수집하고
> 임포트 준비를 끝냈습니다. 작업 내역은 아래 [S5-a](#s5-a--구-사이트-자산-수집--임포트-준비-완료),
> 다음에 할 일은 [CONTENT_IMPORT.md](./CONTENT_IMPORT.md)에 있습니다.
> 남은 선행 조건은 **쓰기 인증 하나**(`npx sanity login`)입니다.

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
| S5 | 실제 콘텐츠 반영 (사진·설교 링크·주보) | ImagePlaceholder 0개 | 🟡 자산 수집 완료 / 임포트 대기 → **[CONTENT_IMPORT.md](./CONTENT_IMPORT.md)** |
| S2 | chungpa21.org 도메인 이전 | 도메인 HTTP 200 | ⬜ S5 이후 |
| S6 | 최종 운영 QA | QA 리포트 갱신 | ⬜ |

> **2026-08-21 갱신 — S5 선행 작업 완료.** 구 사이트에서 자산을 직접 수집했으므로 "교회 자료 수령"은 더 이상 병목이 아니다.
> 사진 3,731장 · 설교 565건 · 주보 112개 · 영상 링크 707건 · 연혁 202건 · 교역자 12명을 `../chungpa21-crawl/`에 확보했다.
> 임포트 계획·필드 매핑·미결정 사항은 **[CONTENT_IMPORT.md](./CONTENT_IMPORT.md)** 에 정리되어 있다. 다음 세션은 그 문서에서 시작할 것.
>
> 새로 드러난 두 가지:
> - **구 사이트는 죽지 않았다.** `chungpa21.org` HTTP 200. 아래 "DNS가 죽은 서버를 가리킨다"는 기록은 2026-08-21 기준으로는 사실이 아니다. 다만 언제 다시 죽을지 모르므로 `chungpa21-crawl/`이 마지막 스냅샷일 수 있다.
> - **2016~2023년 설교 영상 331건은 Vimeo에 있고 현재 재생되지 않는다** (표본 30건 전수 403).
>
> **Vimeo 관련 결정 (2026-08-21, 사용자):** Vimeo는 **사용하지 않는다.** `vimeoId` 필드를 추가하지 않고 계정 복구도 기다리지 않는다.
> 해당 설교는 **메타데이터만 아카이브로 유지**한다(제목·날짜·설교자·성경본문·본문글을 넣고 영상은 비움).
> 찬양 88건은 **별도 `praise` 타입으로 분리**한다. 따라서 S5는 Vimeo 답을 기다리지 않고 바로 착수 가능하며,
> 남은 선행 조건은 **`SANITY_API_WRITE_TOKEN` 발급** 하나뿐이다.

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

### S5-a — 구 사이트 자산 수집 + 임포트 준비 (완료)

이번 세션의 본 작업. **Sanity에는 아무것도 쓰지 않았다.** 쓰기 인증 없이 가능한 데까지 진행한 상태다.

#### 1) 구 사이트 전수 크롤링 → `../chungpa21-crawl/`

`chungpa21.org`는 웹처치(ASP.NET) CMS다. `link_manager.js`의 `goTo()` 디스패처를 읽어
게시판 URL 규칙을 역산한 뒤 전 게시판을 페이지네이션까지 훑었다.

| 수집물 | 수량 | 기간 |
|---|---:|---|
| 설교·찬양 게시물 | 565 | 2016-01-03 ~ 2026-08-16 |
| 앨범 게시물 / 사진 | 463 / 3,731 | 2018-06-06 ~ 2026-08-05 |
| 주보 PDF | 112 | 2024-02 ~ 2026-08 |
| 영상 링크 | 707 | YouTube 330 · Vimeo 377 |
| 교회 연혁 | 202 | 1962.08.08 ~ 2025.12.25 |
| 섬기는 분들 | 12 | — |
| **다운로드 파일** | **4,559** | **1.14 GB** |

무결성: 0바이트·손상 파일 0건, PDF 112개 전부 정상(각 2쪽).
실패 4건은 구 사이트에 애초에 없던 UI 아이콘(`/img/icon_phone.png` 등).

막혔던 지점 하나 — 주보는 `ajax_weekly_V2_cate.asp`가 웹처치의 `com` 쿠키를 요구하는데,
그 값에 `&`와 `=`가 들어 있어 파이썬 `http.cookiejar`가 조용히 버린다.
`lib_fetch.py`에서 Set-Cookie를 직접 파싱해 헤더로 되돌려 실어 보내 해결했다.

#### 2) Sanity 스키마 4종 신설

| 파일 | 용도 | 이유 |
|---|---|---|
| `sanity/schemas/praise.ts` | 찬양 88건 | `sermon`은 설교자·성경본문이 required인데 찬양엔 본래 없는 값 |
| `sanity/schemas/churchHistory.ts` | 연혁 202건 | 담을 타입이 아예 없었음 |
| `sanity/schemas/staff.ts` | 섬기는 분들 12명 | 담을 타입이 아예 없었음 |
| `sanity/schemas/churchInfo.ts` | 교회 기본 정보 | dataset에는 있는데 스키마 파일이 없어 Studio에서 편집 불가였음 |

`index.ts`에 전부 등록. `sermon`은 **손대지 않았다** — Vimeo를 안 쓰기로 해서 `vimeoId`가 불필요하고,
required도 아래 3)의 복구로 전부 채워지므로 완화할 이유가 없다.

`staff.ts`에는 `publishContact` 불리언을 두고 이메일·전화를 그 뒤에 숨겼다.
구 사이트가 교역자 4명의 개인 휴대폰·이메일을 그대로 노출하고 있었기 때문에 기본값은 비공개다.

#### 3) 변환 파이프라인 → `scripts/import/transform.mjs`

네트워크를 쓰지 않고 Sanity에 쓰지도 않는다. 크롤 데이터를 읽어 NDJSON과 검수용 CSV만 만든다.

```
sermon        467건    churchHistory 202건
praise         34건    staff          12건    bulletin 112건
                                              ─────────────
                                              827건 + 에셋참조 348건
```

정제 내용:
- 제목 앞 날짜 프리픽스 **275건** 제거 — `231217 - …`(주일예배)와 `2023-04-21 …`(금요예배) 두 형식
- 설교자·성경본문 **277건** 복구 — 목록에는 없고 상세 본문에 `▶ 설교자 : …` 로만 남아 있던 값
- `summary`에서 `▶ 설교일/설교자/제목/본문` 메타 줄 제거
- 앨범 카테고리 자동 분류 초안

검증 결과: 필수필드 누락 0 · `_id` 중복 0 · 날짜형식 오류 0 ·
**에셋 참조 348건 전건 실제 파일 존재 확인**.
`_id`를 소스 seq로 고정(`sermon-571`, `history-000`, `bulletin-2024-02-11`)해 재실행이 안전하다.

#### 4) 작업 중 스스로 잡은 오류

기록해 둔다. 같은 함정을 다시 밟지 않기 위해서다.

| 증상 | 원인 | 조치 |
|---|---|---|
| 앨범 분류기가 463건 중 **230건을 `etc`로** 떨굼 | 특별영상 보드(gallery 대상 아님)까지 억지로 분류 + `척사대회`·`임직식`·`김장`·`노회` 등 실제 행사어 누락 | 보드별로 분리하고 규칙 보강 → `etc` 62건(23%)으로 감소, 사진 0장 위반 0건 |
| 연혁 202건 중 **3건 누락** | `2012.07.` 처럼 일자 없이 마침표로 끝나는 형식을 정규식이 못 받음 | 3형식 모두 수용 → 202/202 |
| 제목 정제가 89건에 그침 | 금요예배는 `2023-04-21 ` 형식을 쓰는데 주일예배 형식만 처리 | 두 형식 모두 처리 → 275건 |
| 보고서에 적은 보드별 영상 보유 건수가 틀림 | 세어 보지 않고 추정해서 씀 | 실측 후 정정 (아래 표) |

실측값:

| 게시판 | 총 | YouTube | 영상 없음 |
|---|---:|---:|---:|
| 주일예배 | 405 | 128 | 277 |
| 금요예배 | 72 | 71 | 1 |
| 찬양 | 88 | 34 | 54 |

#### 5) 검증

```
npx tsc --noEmit   → exit 0
npm run lint       → 에러 0, 경고 0
```

새 스키마는 루트 `tsconfig.json`의 `exclude`에 `sanity`가 있어 프로젝트 tsc 범위 밖이다.
별도 tsconfig로 `sanity/schemas/**/*.ts`만 따로 타입체크해 통과를 확인했다.

#### 6) 남긴 문서

- `CONTENT_IMPORT.md` (신규) — 임포트 계획 전체. 필드 매핑·스키마 갭·미결정 사항·실행 명령
- `../chungpa21-crawl/README.md` — 크롤 데이터 설명과 재실행 방법

---

### S7 — 렌더링 결함 수정 (완료·배포)

브라우저로 직접 사이트를 열어보고 발견한 결함들이다. 코드·SSR 검증만으로는
드러나지 않았다.

#### 1. 어두운 배경의 흰 제목이 전부 안 보였다 — 사이트 전역

`globals.css`의 베이스 타이포그래피가 **캐스케이드 레이어 밖**에 있어
`h1,h2,h3 { color: var(--color-dark) }`가 Tailwind의 `text-white`를 눌렀다.
CSS 규칙상 **레이어 밖 스타일은 `@layer utilities` 안의 스타일을 특정도와
무관하게 이긴다.**

영향 범위 10곳: 홈 히어로, `/about`·`/community`·`/news`·`/visit`·`/contact`·
`/visit/service-times` 각 히어로, `LocationSection`, `LatestSermonSection`.
모두 어두운 배경 위에 어두운 글씨로 렌더링되어 사실상 보이지 않았다.

→ 베이스 스타일을 `@layer base`로 감쌌다. 재발 방지 주석을 남겼다.

> ⚠️ **앞으로 `globals.css`에 요소 선택자 규칙을 추가할 때는 반드시
> `@layer base` 안에 넣을 것.** 레이어 밖에 두면 Tailwind 유틸리티가 전부 무력화된다.

#### 2. framer-motion이 동작하지 않았다

`initial={{opacity:0}}` 상태로 멈춰 히어로의 표어·CTA가 계속 투명했고,
표어 타임라인은 2024 노드만 희미하게 보였다. `HeroSection` 서브트리는
**하이드레이션 자체가 되지 않았다**(슬라이더 버튼에 React 핸들러 미부착).
`/studio`가 겪는 Next.js 16 Turbopack 비호환과 같은 계열로 보인다.

→ framer-motion을 걷어내고 CSS 애니메이션으로 대체했다(사용처 3곳).
   의존성도 제거했다. `JourneyTimeline`은 서버 컴포넌트가 되었다.

> **원칙**: 화면 최상단 콘텐츠의 기본 상태를 '보임'으로 두고 등장 효과만 얹는다.
> JS가 실패해도 표어와 CTA는 항상 보여야 한다.

#### 3. 로고가 흰 사각형이었다

`public/images/logo.png`는 확장자와 달리 **1920x1080 JPEG이고 배경이 검정**이다.
알파가 없어 `brightness(0) invert(1)` 필터가 사각형 전체를 흰색으로 만들었다.

→ 검정 배경을 투명 처리하고 로고만 크롭한 `logo-mark.png`(1310x490)를 만들어
   연결했다. 원본은 보존한다.

> ⚠️ **임시 대응이다.** 교회에서 원본 벡터 또는 투명 배경 로고를 받는 것이 맞다.
> JPEG에서 복원한 것이라 경계에 압축 잡티가 남아 있을 수 있다.

#### 4. 그 외

- 죽은 푸터 앵커 2개 수정 (`/visit#location`, `/visit#service-times`)
- `error.tsx` / `loading.tsx` 신설 — 폴백 화면이 전무했다
- `main` 랜드마크 중복 제거 — 모든 문서에 `<main>`이 둘씩 있었다
- `ImagePlaceholder`에 `hideLabel` 추가

#### 도메인 상태 정정

앞선 기록의 "chungpa21.org가 죽었다"와 다른 세션의 "HTTP 200이다"는
**둘 다 절반만 맞다.**

```
http://chungpa21.org   → 200
https://chungpa21.org  → 연결 실패
```

**구 사이트는 HTTP로만 살아 있고 HTTPS가 없다.** 브라우저가 경고를 띄우는
상태이며, 도메인 이전 시 이 점도 함께 해소된다.

#### 배운 것

코드 리뷰와 SSR HTML 검증만으로는 **CSS 캐스케이드와 하이드레이션 문제를
잡을 수 없다.** 마크업에 텍스트가 있어도 화면에는 안 보일 수 있다.
다음 세션도 변경 후에는 실제 브라우저로 열어볼 것.

---

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

**확정된 수신 설정 (사용자 결정)**

- `FORM_NOTIFY_TO` = `chungpa21@gmail.com` → **Vercel Production에 등록 완료**
- 발신 도메인은 당분간 별도로 두지 않는다 (`chungpa21.org` 미사용 방침 유지)

**Vercel Marketplace 경로는 쓸 수 없다**

`vercel integration add resend/resend-email`은 메타데이터로 **소유한 도메인을
필수 요구**한다 ("you must own a domain to be able to send").
`welcomehome-seven.vercel.app`은 DNS 레코드를 추가할 수 없어 발신 도메인으로
인증할 수 없다. 또한 플랜 선택(free/pro $20/scale $90)이 따라오므로
임의 프로비저닝하지 않았다.

→ **Resend에 직접 가입하는 경로를 쓴다.** 도메인 없이 기본 발신자
`onboarding@resend.dev`로 발송하며, `FORM_NOTIFY_FROM`은 비워 둔다.

> ⚠️ `onboarding@resend.dev`는 도메인 미인증 상태의 기본 발신자로,
> **수신처가 Resend 계정 소유자 주소로 제한될 가능성이 크다.**
> 공식 문서에서 명시 확인은 못 했으므로 실제 발송으로 판정한다.
> 어느 쪽이든 안전하도록 **Resend 계정을 `chungpa21@gmail.com`으로 생성**할 것.
> 그러면 제한이 있든 없든 수신이 성립한다.

**남은 작업 — `RESEND_API_KEY` 하나만 넣으면 실동작**

1. `resend.com`에 **`chungpa21@gmail.com`으로** 가입
2. API Keys → 키 발급 (권한 `Sending access`면 충분)
3. 등록:

```bash
printf "발급받은_키" | vercel env add RESEND_API_KEY production --scope onaponds-projects
vercel --prod --yes --scope onaponds-projects   # 환경변수 반영에 재배포 필요
```

`FORM_NOTIFY_TO`는 등록 완료. `FORM_NOTIFY_FROM`은 비워 두면
`onboarding@resend.dev`가 쓰인다.

> 도메인 인증을 붙이면 발신자를 교회 주소로 바꿀 수 있다. S2에서 `chungpa21.org`를
> 이전할 때 함께 처리하는 것이 자연스럽다.

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

프로젝트 `re13zhns` / 데이터셋 `production`

**스키마 (로컬 10종, 2026-08-21 기준 — 4종은 아직 미배포)**
```
sermon · sermonSeries · post · bulletin · gallery · event   ← 기존, 배포 완료
praise · churchHistory · staff · churchInfo                  ← 신설, 배포 필요
```

**데이터셋 내용: 문서 21건, 전부 시드 더미 (실제 콘텐츠 0건)**
```
sermon 11 · post 5 · bulletin 3 · sermonSeries 3 · churchInfo 1
```
더미인 근거 — 제목에 오타가 박혀 있고(`2026년 4웙4일 주보`, `형대 에배라 안내`),
설교 11건 모두 `youtubeId: null`이며 크롤링한 실제 설교 565건 중 같은 제목이 하나도 없다.
**임포트 전 전량 삭제 대상.** 만든 것은 `scripts/seed-sanity.ts`로 보인다.

`churchInfo`는 스키마 파일이 없어 Studio에서 편집 불가였고, 값에도 오류가 있다:
- `establishedYear: 1953` — 연혁 첫 항목·`about` 페이지·`CLAUDE.md` 셋 다 **1962**
- `youtubeUrl: youtube.com/@chungpa21` — **404**. 실제는 `channel/UC7Fk-mpsIQlgykLK4lW3t7g`

**쓰기 인증: 없음.** `.env.local`에 `SANITY_API_WRITE_TOKEN`도 `SANITY_API_READ_TOKEN`도 없다.
다만 `sanity` CLI가 `node_modules/.bin/`에 있고 `sanity dataset import`는 토큰이 아니라
CLI 로그인 세션을 쓴다 → `npx sanity login` 한 번이면 임포트 가능. 자세한 건 `CONTENT_IMPORT.md` G섹션.

**Sanity Studio 로컬 실행:**
```bash
cd sanity && npm install && npm run dev  # → http://localhost:3333
```
> `sanity/node_modules`가 없는 상태다. `npm install`을 먼저 해야 한다.

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

### S5 — 실제 콘텐츠 → **자료 수령 불필요해짐. 계획서: [CONTENT_IMPORT.md](./CONTENT_IMPORT.md)**

구 사이트에서 직접 수집해 "교회 자료 수령"은 더 이상 병목이 아니다. S5-a(위 세션 기록)가 준비를 끝냈다.

**S5-b — 인증 후 실행**
- [ ] `npx sanity login` (또는 `SANITY_API_WRITE_TOKEN` 발급)
- [ ] 시드 문서 21건 백업 후 삭제
- [ ] 신설 스키마 4종 배포 → `cd sanity && npx sanity schema deploy`
- [ ] `sanity dataset import ... --replace` 로 827건 + 에셋 348건 투입
      (가장 작은 `staff.ndjson` 12건부터 넣고 Studio에서 확인할 것)
- [ ] `churchInfo` 값 교정 — 설립연도 1953→1962, youtubeUrl 채널ID 형식

**S5-c — 인증 없이도 가능한 화면 작업**
- [ ] `about/page.tsx` `HISTORY[]` 하드코딩 9개 → `churchHistory` 쿼리로 교체
      (현재 "1970s 성장과 부흥" 같은 **근거 없이 지어낸 내용**이 올라가 있다)
- [ ] `about/page.tsx` `STAFF[]` `{name:"교역자"}` 플레이스홀더 → `staff` 쿼리
- [ ] `ImagePlaceholder` 5개소 → 실제 사진
- [ ] `SermonsClient` 폴백 문구 교체 — 현재 "유튜브 영상 연동 예정…"이라는 개발용 문구가
      영상 없는 설교 **278건 전부**에 뜨게 된다. 그 설교들은 연동 예정이 아니라 영상이 없다
- [ ] 재생 가능/불가 목록에서 구분 (재생 버튼이 `youtubeId` 무관하게 항상 표시됨)
- [ ] `thumbnail` 렌더링 — 스키마·타입·GROQ에 다 있는데 **어느 컴포넌트도 쓰지 않는다**.
      썸네일 327장을 올려도 화면에 안 나온다
- [ ] `getAllGalleries`·`getUpcomingEvents`·`getPostBySlug` 등 **미사용 쿼리 6종** 배선

**S5-d — 결정 대기**
- [ ] 앨범 카테고리 `etc` 62건 수동 분류 (`scripts/import/out/review-album.csv`)
- [ ] 특별영상 193건을 어느 타입에 둘지 (gallery 부적합)
- [ ] 교역자 개인 연락처 공개 범위 — 당사자 동의 확인
- [ ] 예배시간·헌금계좌 문안 — 구 사이트가 이미지 1장이라 텍스트가 없다

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
sanity/schemas/             # CMS 스키마 10종
public/images/              # logo.png (교체 예정 이미지들 여기에 추가)

CONTENT_IMPORT.md           # 콘텐츠 임포트 계획 (S5)
scripts/import/transform.mjs # 크롤 데이터 → NDJSON 변환 (읽기 전용)
scripts/import/out/          # 생성물 — .gitignore의 out/ 규칙에 걸려 커밋 안 됨
  *.ndjson                   #   임포트 페이로드 827건
  review-*.csv               #   검수용 표

../chungpa21-crawl/         # 구 사이트 자산 4,559건 / 1.14 GB (별도 디렉터리)
  README.md                  #   수집 내역과 보존 상태
  data/*.json                #   구조화 데이터
  assets/                    #   사진·주보PDF·썸네일 실물
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
