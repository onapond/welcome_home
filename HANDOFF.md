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

---

## 디자인 시스템 (변경 금지)

```css
--color-primary: #2B3A8C;     /* 남색 — 네비/CTA/강조 */
--color-secondary: #6EC6E6;   /* 하늘색 — 호버/배지 */
--color-accent: #D4A843;      /* 골드 — 표어 라벨만 */
```

- 아이콘: Lucide React 전용 (이모지 절대 금지)
- 폰트: Noto Serif KR (제목) + Pretendard (본문)
