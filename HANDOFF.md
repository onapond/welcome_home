# 청파중앙교회 홈페이지 — 핸드오프 문서

> 작성일: 2026-04-08 | 오픈 목표: 2026-05-01

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

## 남은 작업 (5월 1일 전)

### 1순위 — 콘텐츠 실제화
- [ ] **카카오맵 API 키 발급** → `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 환경변수 등록
  - 발급처: developers.kakao.com → 내 애플리케이션 → 앱 키 → JavaScript 키
  - Vercel에 등록: `printf "키값" | vercel env add NEXT_PUBLIC_KAKAO_MAP_API_KEY production --scope onaponds-projects`
- [ ] **실제 교회 사진 교체** → `public/images/` 에 사진 추가 후 ImagePlaceholder 컴포넌트 교체
- [ ] **실제 설교 유튜브 연동** → Sanity Studio에서 sermon 문서에 `youtubeId` 필드 입력

### 2순위 — 기능 보완
- [ ] **방문 예약 폼 백엔드** — 현재 UI만 구현 (제출해도 저장 안 됨)
  - 옵션 A: Resend + Vercel API Route (이메일 알림)
  - 옵션 B: Google Sheets 연동
- [ ] **문의 폼 백엔드** — `/contact` 도 동일 이슈

### 3순위 — 목사님 요구사항
- [ ] 수시 반영

### 마지막 — 도메인 연결
- [ ] Vercel Dashboard → 프로젝트 → Settings → Domains → `chungpa21.org` 추가
- [ ] DNS 설정: CNAME `www` → `cname.vercel-dns.com`, A레코드 → Vercel IP
- [ ] `NEXT_PUBLIC_SITE_URL` 환경변수 `https://chungpa21.org` 로 변경 후 재배포

---

## 배포 방법

```bash
# 변경사항 후 프로덕션 배포
vercel --prod --yes --scope onaponds-projects
```

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
| 방문/문의 폼 실제 저장 안 됨 | 미해결 | 백엔드 연동 필요 |
| 지도 플레이스홀더 | 미해결 | 카카오 API 키 필요 |
| 교회 사진 없음 | 미해결 | 사진 제공받아 교체 필요 |
| **/studio 관리자 페이지 작동 안 함** | **미해결** | 아래 상세 참고 |

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
