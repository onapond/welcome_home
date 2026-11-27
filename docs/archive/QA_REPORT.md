# QA 리포트 — 2026-04-08 (최종)

## 1. 디자인 시스템 ✅

| 검사 항목 | 결과 |
|-----------|------|
| 이모지 사용 | ✅ 0건 |
| 유니코드 심볼 | ✅ 0건 |
| 외부 이미지 URL (unsplash 등) | ✅ 0건 |
| raw `<img>` 태그 | ✅ 0건 (next/image + ImagePlaceholder만 사용) |
| Lucide React 아이콘만 사용 | ✅ Font Awesome / Bootstrap Icons 0건 |

**허용된 예외:** `globals.css:30` — `Roboto`는 CSS 폰트 폴백 스택 (실제 로드 없음)

---

## 2. 빌드 & 타입 ✅

| 검사 | 결과 |
|------|------|
| `npm run build` | ✅ 10페이지 정적 생성 성공 |
| `npx tsc --noEmit` | ✅ 오류 0건 |
| ESLint | ✅ 오류 0건 (수정: `about/page.tsx` 따옴표 이스케이프) |

---

## 3. 접근성 (a11y) ✅

### 수정 완료
- **`aria-controls` 추가** — FAQ 아코디언 버튼에 `aria-controls="faq-content-{i}"` + 패널에 `id`, `role="region"`, `aria-hidden` 추가 (`VisitClient.tsx`)
- **폼 `<label htmlFor>` 연결** — `name`, `phone`, `count`, `memo` 입력 필드 모두 `id`와 `htmlFor`로 명시적 연결
- **`<fieldset>` + `<legend>` 적용** — 예배 선택 라디오 그룹을 `<fieldset>`으로 묶어 스크린리더 그룹 이름 제공
- **`role="status"` 추가** — 폼 제출 완료 메시지에 live region 적용 (스크린리더 즉시 읽기)
- **`aria-hidden="true"`** — 장식용 아이콘에 적용 (`Icon`, `Clock`, `MapPin` 등)

### 검증 결과
| 항목 | 결과 |
|------|------|
| `<img>` alt 텍스트 | ✅ Header/Footer 로고에 `alt="청파중앙교회"` |
| `ImagePlaceholder` | ✅ `role="img"` + `aria-label` 적용 |
| 버튼 aria-label | ✅ 19개+ (슬라이드, 닫기, 페이지네이션, 메뉴 등) |
| 시맨틱 태그 | ✅ `<main>`, `<header>`, `<footer>`, `<nav>`, `<section>`, `<article>`, `<ol>` |
| 폼 접근성 | ✅ label 연결, fieldset/legend, required 표시 |
| 아코디언 패턴 | ✅ `aria-expanded` + `aria-controls` + `role="region"` |

---

## 4. 반응형 ✅

| 브레이크포인트 | 레이아웃 패턴 | 판정 |
|----------------|--------------|------|
| 320px | 단일 컬럼, `px-4`, `text-sm`, `clamp()` 폰트 | ✅ |
| 375px (iPhone SE) | Hero h1 `clamp(2.5rem, 6vw, 4rem)` | ✅ |
| 768px (태블릿) | ServiceTimesBar 2→4열, 카드 그리드 전환 | ✅ |
| 1024px (데스크톱) | NewHereSection 1→2열, LatestSermon 1→[1.2fr_1fr] | ✅ |
| 1440px (와이드) | `max-w-7xl` 컨테이너 상한 고정 | ✅ |

**반응형 클래스 사용:** `src/app/` 39개, `src/components/` 51개 breakpoint 클래스 확인

---

## 5. SEO ✅

### 수정 완료

#### 페이지별 metadata
| 페이지 | title | description | OG | 수정 |
|--------|-------|-------------|-----|------|
| `/` (layout) | ✅ | ✅ | ✅ | layout.ts에 `metadataBase`, Twitter 카드 추가 |
| `/about` | ✅ | ✅ | ✅ | **신규 추가** — `export const metadata` |
| `/visit` | ✅ | ✅ | ✅ | **신규 추가** — Server wrapper 분리 후 metadata |
| `/sermons` | ✅ | ✅ | — | 기존 유지 |
| `/news` | ✅ | ✅ | — | 기존 유지 |

#### 신규 생성 파일
| 파일 | 경로 | 설명 |
|------|------|------|
| `sitemap.ts` | `src/app/sitemap.ts` | 8개 URL, priority/changeFrequency 설정 |
| `robots.ts` | `src/app/robots.ts` | `/studio/`, `/api/` 크롤 차단 |

#### 빌드 라우트 확인
```
/robots.txt   ✅ 정적 생성
/sitemap.xml  ✅ 정적 생성
```

---

## 잔여 권고 사항 🟡 (빌드 차단 없음)

| 우선순위 | 항목 | 설명 | 담당 |
|----------|------|------|------|
| 🟡 중간 | **OG 이미지 없음** | 실제 교회 사진 준비 후 `opengraph-image.png` 추가 | content |
| 🟡 중간 | **카카오맵 미연동** | `NEXT_PUBLIC_KAKAO_MAP_API_KEY` 설정 필요 | frontend |
| 🟡 중간 | **Sanity 미설정** | `.env.local`에 Project ID 입력 필요 | cms |
| 🟢 낮음 | **JSON-LD 구조화 데이터** | Church / VideoObject schema 미적용 | frontend |
| 🟢 낮음 | **실제 교회 사진** | `ImagePlaceholder` → 실제 사진 교체 | content |
| 🟢 낮음 | **Active nav 스타일링** | 현재 페이지 Header 링크 강조 없음 | frontend |

---

## 검증 요약

| 영역 | 상태 | 수정 건수 |
|------|------|----------|
| 디자인 시스템 | ✅ PASS | 0 |
| 빌드/TypeScript/ESLint | ✅ PASS | 1 (따옴표) |
| 접근성 (a11y) | ✅ PASS | 6 (aria-controls, htmlFor, fieldset 등) |
| 반응형 | ✅ PASS | 0 |
| SEO | ✅ PASS | 4 (metadata 2 + sitemap + robots) |

**총 수정: 11건 / 빌드 차단 이슈: 0건**

---

*검증 환경: Next.js 16.2.2 · TypeScript strict · Windows 11 · 2026-04-08*
