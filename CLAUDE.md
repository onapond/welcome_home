# 청파중앙교회 홈페이지 리뉴얼 프로젝트

## 프로젝트 개요

청파중앙교회(대한예수교 장로회)의 홈페이지를 현대적으로 리뉴얼한다. 기존 WebChurch 템플릿 기반 사이트(chungpa21.org)를 Next.js 기반으로 전면 재구축한다.

## 교회 정보

- **교회명**: 청파중앙교회 (Chungpa Central Church)
- **교단**: 대한예수교 장로회
- **담임목사**: 김항우 목사
- **위치**: 서울특별시 용산구 청파로73길 58 (서계동)
- **연락처**: 02-714-0041~3, FAX 02-711-8166
- **비전**: "21세기 지도자를 길러내는 교회"
- **설립**: 1962년 (60년+ 역사)
- **유튜브**: https://www.youtube.com/channel/UC7Fk-mpsIQlgykLK4lW3t7g
- **청년부 인스타**: @chungpa_united
- **로고**: public/images/logo.png (붓글씨 "청" + 동심원 물결 + 교회명)
- **영문명**: Chungpa JoongAng Church

## 교회 표어 히스토리 (핵심 스토리라인)

| 년도 | 표어 | 키워드 |
|------|------|--------|
| 2024 | 우리는 한 가족입니다 | 소속감, 뿌리 |
| 2025 | 우리는 여행하는 사람들입니다 | 순례, 여정 |
| 2026 | 일어나 함께가자 | 행동, 동행 |

→ 공동체성을 강조하는 교회. "함께"가 핵심 키워드.

## 기술 스택

- **프레임워크**: Next.js 14+ (App Router)
- **스타일링**: Tailwind CSS
- **언어**: TypeScript
- **CMS**: Sanity (콘텐츠 관리용, 주보/설교/공지 등)
- **배포**: Vercel
- **지도**: Kakao Maps API
- **영상**: YouTube embed (설교 아카이브)
- **폰트**: Noto Serif KR (제목), Pretendard (본문)

## 디자인 시스템

### 브랜드 컬러 (로고 기반 — 남색+하늘색 2톤)

```css
/* 로고에서 추출한 실제 교회 컬러 */
--color-primary: #2B3A8C;        /* 남색 (로고 붓글씨, 교회명 텍스트) */
--color-primary-light: #3D4EAE;  /* 밝은 남색 (영문 텍스트) */
--color-primary-pale: #5A6AC7;   /* 페일 남색 */
--color-secondary: #6EC6E6;      /* 하늘색/시안 (로고 동심원 물결) */
--color-secondary-light: #8FD7EF;/* 밝은 하늘색 */
--color-accent: #D4A843;         /* 골드 악센트 (표어, 강조) */
--color-dark: #1A1E2C;           /* 텍스트 다크 */
--color-dark-soft: #4A5568;      /* 서브 텍스트 */
--color-bg: #F4F6FA;             /* 배경 */
--color-bg-warm: #EDF0F8;        /* 세컨드 배경 */
--color-white: #FFFFFF;
```

> **컬러 사용 원칙:**
> - 남색(primary)이 주요 색상: 네비게이션, CTA 버튼, 섹션 배경, 텍스트 강조
> - 하늘색(secondary)은 보조 색상: 호버 효과, 배지, 장식 요소, 구분선
> - 골드(accent)는 최소한으로: 표어 라벨, 특별 강조에만 사용
> - 남색+하늘색 조합이 로고의 "붓글씨+물결" 2톤을 반영

### 디자인 원칙

1. **이모지/AI 아이콘 절대 금지**: 이모지(☀️🌙🙏 등)나 AI 생성 느낌의 아이콘을 사용하지 않는다. Lucide React 또는 커스텀 SVG 아이콘만 사용한다.
2. **실제 사진 사용**: 스톡 이미지 대신 교회 실제 사진을 우선 사용한다. 사진이 없는 경우 placeholder를 넣되, 절대로 AI 생성 이미지를 사용하지 않는다.
3. **절제된 디자인**: 과도한 장식 없이 타이포그래피와 여백으로 품격을 만든다.
4. **한국형 UX**: 카카오톡 공유, 네이버 지도 연동, 모바일 퍼스트를 기본으로 한다.

### 타이포그래피

```
제목 (h1~h3): Noto Serif KR — 무게감 있고 전통적인 느낌
본문: Pretendard — 깔끔하고 가독성 좋은 한글 본문
영문: Pretendard 또는 해당 폰트의 영문 글리프
숫자/시간: Pretendard — 고정폭 느낌으로 정보 전달
```

### 로고 사용 규칙

로고 파일: `public/images/logo.png`

```
로고 구성 요소:
┌──────────────────────────────────────────┐
│  [붓글씨 "청"]  대한예수교 장로회         │
│  [동심원 물결]  청파중앙교회              │
│                 Chungpa JoongAng Church   │
└──────────────────────────────────────────┘
```

- **Header (밝은 배경)**: 원본 로고 그대로 사용
- **Header (어두운/투명 배경)**: 흰색 버전 필요 — 로고 이미지에 `brightness(0) invert(1)` 필터 또는 별도 white 버전 제작
- **Favicon**: 붓글씨 "청" 부분만 크롭해서 사용
- **최소 크기**: 높이 32px 이상
- **여백**: 로고 높이의 50% 이상 여백 확보

### 아이콘 규칙

```
✅ 허용: Lucide React 아이콘 (MapPin, Clock, Phone, Users, Play, ChevronRight 등)
✅ 허용: 교회 로고 SVG (제공된 로고 파일 기반)
✅ 허용: 커스텀 SVG 아이콘 (최소한의 선형 아이콘)
❌ 금지: 이모지 (☀️🌙🙏🏠🚶🌅📍🕐👶🅿️ 등)
❌ 금지: AI 생성 아이콘/이미지
❌ 금지: Font Awesome (너무 범용적)
```

## 사이트맵

```
/ (홈)
├── /about (교회소개)
│   ├── /about/vision (비전 & 미션)
│   ├── /about/pastor (담임목사 소개)
│   ├── /about/history (교회 역사)
│   └── /about/beliefs (신앙고백)
├── /visit (새가족 안내) ★ 핵심 페이지
│   ├── /visit/first-time (처음 오시는 분)
│   ├── /visit/service-times (예배 안내)
│   ├── /visit/location (오시는 길)
│   └── /visit/kids (자녀 프로그램)
├── /sermons (설교)
│   ├── /sermons/latest (최신 설교)
│   ├── /sermons/archive (설교 아카이브)
│   └── /sermons/[series] (시리즈별)
├── /community (공동체)
│   ├── /community/youth (청년부 United)
│   ├── /community/students (청소년부)
│   ├── /community/mission (선교)
│   └── /community/groups (소그룹/구역)
├── /connect (참여하기)
│   ├── /connect/serve (봉사)
│   ├── /connect/baptism (세례)
│   ├── /connect/give (헌금)
│   └── /connect/prayer (기도 요청)
├── /news (소식)
│   ├── /news/announcements (공지사항)
│   ├── /news/calendar (교회 캘린더)
│   ├── /news/bulletin (주보)
│   └── /news/gallery (갤러리)
└── /contact (문의)
```

## 페이지별 상세 요구사항

### 홈페이지 (/)
1. **히어로 섹션**: 풀스크린 슬라이더. 교회 실제 사진 배경 + 2026 표어 "일어나 함께가자" + CTA 2개(예배 안내/온라인 예배)
2. **예배 시간 바**: 주일/수요/금요/새벽 예배 시간을 한 줄로 표시. 아이콘은 Lucide의 Sun/Moon/Heart/Sunrise 사용
3. **표어 여정 섹션**: 2024→2025→2026 3년 타임라인. 원형 노드 + 연결선
4. **새가족 안내 섹션**: 좌측 텍스트 + 우측 사진. "방문 예약하기" CTA
5. **최신 설교 섹션**: 메인 카드 1개(최신) + 사이드 리스트 4개
6. **공동체 섹션**: 청년부/청소년부/선교 카드 3개
7. **오시는 길**: 카카오맵 임베드 + 교통편 안내
8. **푸터**: 3컬럼 링크 + 교회 정보 + SNS 링크

### 새가족 페이지 (/visit)
- 가장 중요한 페이지. 미국 성장교회의 "Plan Your Visit" 패턴 적용
- FAQ 아코디언: 복장, 주차, 예배 시간, 아이 프로그램 등
- "방문 예약" 폼: 이름, 연락처, 예배 선택, 인원수

### 설교 페이지 (/sermons)
- 유튜브 채널 연동 (iframe embed)
- 시리즈별 필터링
- 검색 기능
- 날짜/본문/설교자 메타데이터

## 코딩 컨벤션

### 파일 구조
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # 홈
│   ├── about/
│   ├── visit/
│   ├── sermons/
│   ├── community/
│   ├── connect/
│   ├── news/
│   └── contact/
├── components/
│   ├── layout/             # Header, Footer, Nav
│   ├── ui/                 # Button, Card, Badge 등 공통 UI
│   ├── sections/           # 홈페이지 섹션 컴포넌트
│   └── features/           # 설교 플레이어, 지도, 폼 등
├── lib/
│   ├── sanity/             # Sanity CMS 클라이언트
│   └── utils.ts
├── styles/
│   └── globals.css         # Tailwind + 커스텀 CSS variables
└── types/
    └── index.ts
```

### 네이밍
- 컴포넌트: PascalCase (HeroSection.tsx)
- 유틸: camelCase (formatDate.ts)
- CSS 클래스: Tailwind 유틸리티 + 커스텀 클래스는 kebab-case
- 상수: UPPER_SNAKE_CASE

### 품질 기준
- Lighthouse 성능 점수 90+
- 모든 이미지 next/image 사용 (lazy loading, WebP 자동 변환)
- 시맨틱 HTML (header, nav, main, section, article, footer)
- 접근성: aria-label, alt 텍스트, 키보드 내비게이션
- SEO: 메타태그, OG 태그, 구조화된 데이터 (Church schema)
- 반응형: 모바일(~768px) / 태블릿(~1024px) / 데스크톱(1024px~)

## 에이전트 지시사항

각 에이전트는 이 CLAUDE.md를 기본 컨텍스트로 로드합니다. 에이전트별 역할과 담당 파일 범위는 `.claude/agents/` 내 개별 파일을 참조하세요.

### 핵심 규칙
1. **파일 충돌 방지**: 각 에이전트는 자신의 담당 디렉토리 내 파일만 수정한다
2. **디자인 시스템 준수**: 위에 정의된 컬러/폰트/아이콘 규칙을 반드시 따른다
3. **이모지 금지**: UI에 이모지를 절대 사용하지 않는다. Lucide React 아이콘만 사용한다
4. **한국어 우선**: 모든 UI 텍스트는 한국어. 코드 주석은 영어 가능
5. **커밋 메시지**: `[역할] 작업 내용` 형식 (예: `[frontend] 히어로 섹션 구현`)
