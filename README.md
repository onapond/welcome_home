# 청파중앙교회 홈페이지

서울 용산구 청파중앙교회(대한예수교 장로회)의 공식 홈페이지입니다.

- **사이트**: https://chungpa21.org
- **기술 스택**: Next.js 16 · Tailwind CSS v4 · TypeScript · Sanity CMS
- **배포**: Vercel

---

## 로컬 실행

### 요구사항

- Node.js 20+
- npm 10+

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/onapond/welcome_home.git
cd welcome_home

# 2. 패키지 설치
npm install

# 3. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일을 열어 값 채우기 (아래 환경변수 섹션 참고)

# 4. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

---

## 환경변수

`.env.local` 파일에 아래 변수를 입력합니다. (`.env.local.example` 참고)

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ | Sanity 프로젝트 ID |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ | 기본값: `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | ✅ | 기본값: `2024-01-01` |
| `SANITY_API_READ_TOKEN` | — | Draft 미리보기용 Sanity 토큰 |
| `SANITY_API_WRITE_TOKEN` | — | 시딩 스크립트 전용 토큰 |
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | — | 카카오맵 JavaScript 앱 키 |
| `NEXT_PUBLIC_SITE_URL` | — | 배포 도메인 (기본: `https://chungpa21.org`) |

> **Sanity 미설정 시:** 폴백 데이터로 UI가 정상 표시됩니다. 실제 콘텐츠 편집을 위해서는 Sanity 설정이 필요합니다.

---

## Sanity CMS 설정

### 1. Sanity 프로젝트 생성

```bash
# sanity.io/get-started 에서 프로젝트 생성 후
# Project ID를 .env.local에 입력
```

### 2. Sanity Studio 실행 (로컬)

```bash
cd sanity
npm install
npm run dev
# → http://localhost:3333
```

### 3. 샘플 데이터 시딩

```bash
# 루트 디렉토리에서
npm install -D tsx
npx tsx scripts/seed-sanity.ts
```

---

## Vercel 배포

### 1. GitHub에 푸시

```bash
git init
git add .
git commit -m "초기 커밋"
git branch -M main
git remote add origin https://github.com/onapond/welcome_home.git
git push -u origin main
```

### 2. Vercel 연결

1. [vercel.com](https://vercel.com) 로그인
2. **Add New Project** → GitHub 저장소 선택
3. **Framework Preset**: Next.js (자동 감지)
4. **Environment Variables** 탭에서 환경변수 입력:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION` = `2024-01-01`
   - `SANITY_API_READ_TOKEN`
   - `NEXT_PUBLIC_KAKAO_MAP_API_KEY`
5. **Deploy** 클릭

### 3. 커스텀 도메인 연결

Vercel Dashboard → 프로젝트 → Settings → Domains → `chungpa21.org` 추가

---

## 프로젝트 구조

```
welcome_home/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx            # 홈 (ISR 1h)
│   │   ├── about/page.tsx      # 교회소개
│   │   ├── visit/page.tsx      # 새가족 안내
│   │   ├── sermons/page.tsx    # 설교 아카이브 (ISR 1h)
│   │   ├── news/page.tsx       # 소식 (ISR 1h)
│   │   ├── not-found.tsx       # 404 페이지
│   │   ├── sitemap.ts          # /sitemap.xml 자동 생성
│   │   └── robots.ts           # /robots.txt 자동 생성
│   ├── components/
│   │   ├── layout/             # Header, Footer, MobileNav
│   │   ├── sections/           # 홈페이지 섹션 컴포넌트
│   │   ├── features/           # SermonsClient, VisitClient
│   │   └── ui/                 # Button, SectionHeader, ImagePlaceholder
│   └── lib/
│       └── sanity/             # client.ts, queries.ts, types.ts
├── sanity/                     # Sanity Studio (별도 실행)
│   └── schemas/                # sermon, event, bulletin, post, gallery
├── scripts/
│   └── seed-sanity.ts          # 초기 데이터 시딩
├── public/
│   └── images/
│       └── logo.png            # 교회 로고
└── .env.local.example          # 환경변수 예시
```

---

## 페이지 목록

| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/` | 홈 | ISR 1h |
| `/about` | 교회소개 | 정적 |
| `/visit` | 새가족 안내 | 정적 |
| `/sermons` | 설교 아카이브 | ISR 1h |
| `/news` | 소식 & 주보 | ISR 1h |

---

## 디자인 시스템

브랜드 컬러는 교회 로고(`public/images/logo.png`)에서 추출한 **남색 + 하늘색 2톤**입니다.

| 변수 | 값 | 용도 |
|------|----|------|
| `--color-primary` | `#2B3A8C` | 네비게이션, CTA, 섹션 배경 |
| `--color-secondary` | `#6EC6E6` | 호버, 배지, 장식 |
| `--color-accent` | `#D4A843` | 표어 라벨, 특별 강조 |

> **아이콘**: Lucide React만 사용. 이모지/Font Awesome 금지.

---

## 로컬 스크립트

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```
