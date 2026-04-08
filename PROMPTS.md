# 청파중앙교회 홈페이지 — Claude Code 실행 가이드

---

## 사전 준비

### 1. 프로젝트 폴더 준비
```bash
mkdir chungpa-church && cd chungpa-church
```

### 2. 이 프로젝트 파일 복사
```
CLAUDE.md                          → 프로젝트 루트
.claude/agents/architect.md        → .claude/agents/
.claude/agents/frontend.md         → .claude/agents/
.claude/agents/cms.md              → .claude/agents/
.claude/agents/qa.md               → .claude/agents/
```

### 3. 교회 자료 준비 (images/ 폴더)
- 교회 로고 원본 파일 (PNG/SVG)
- 예배 사진 5~10장
- 담임목사 사진
- 교회 건물 외관/내부 사진
- 청년부 MT, 선교, 행사 사진

→ 사진이 준비되지 않은 채로 시작해도 됩니다. placeholder가 들어갑니다.

---

## 실행 단계

아래 프롬프트를 Claude Code에서 **순서대로** 실행하세요.

---

## Phase 0: 프로젝트 셋업 (서브에이전트)

### 프롬프트 0-1: 프로젝트 초기화
```
CLAUDE.md를 읽고 아키텍트 에이전트(.claude/agents/architect.md) 역할에 따라
프로젝트를 초기화해줘.

1. Next.js 프로젝트 생성 (TypeScript, Tailwind, App Router, src/ 디렉토리)
2. 추가 패키지 설치: lucide-react, framer-motion, @sanity/client, next-sanity
3. tailwind.config.ts에 CLAUDE.md의 브랜드 컬러를 커스텀 컬러로 추가
4. globals.css에 CSS 변수, Pretendard + Noto Serif KR 폰트 로딩 설정
5. src/types/index.ts에 Sermon, Event, Post, Gallery 타입 정의
6. src/lib/utils.ts에 cn(className 머지), formatDate 유틸 함수 작성

빌드가 통과하는지 확인해줘.
```

---

## Phase 1: 레이아웃 컴포넌트 (서브에이전트)

### 프롬프트 1-1: Header
```
프론트엔드 에이전트(.claude/agents/frontend.md) 역할에 따라 Header를 구현해줘.

src/components/layout/Header.tsx:
- 스크롤 60px 이전: 투명 배경, 흰색 텍스트/로고
- 스크롤 60px 이후: 흰색 배경, blur 효과, 그림자, 어두운 텍스트
- 좌측: 교회 로고 이미지(public/images/logo.png, next/image 사용, 높이 36px)
  - 스크롤 전(투명 배경): CSS filter brightness(0) invert(1) 로 흰색 처리
  - 스크롤 후(흰 배경): 원본 컬러 그대로 표시
  - "대한예수교 장로회" 텍스트는 로고에 포함되어 있으므로 별도 표시 불필요
- 우측: 메뉴 링크 6개 (교회소개, 예배안내, 새가족, 공동체, 설교, 소식)
- 우측 끝: "처음 오시나요?" 버튼 (primary 스타일)
- 모바일(md 미만): 햄버거 메뉴 버튼 → MobileNav 드로어
- position: fixed, z-index: 50

디자인 규칙:
- 이모지, 유니코드 심볼 사용 금지
- Lucide 아이콘만 사용 (Menu, X 등)
- Tailwind 유틸리티 클래스 사용
- 트랜지션은 transition-all duration-300
```

### 프롬프트 1-2: Footer
```
src/components/layout/Footer.tsx를 구현해줘.

- 배경: bg-dark (#1A1E2C)
- 상단: 3컬럼 레이아웃
  - 좌측: 로고 + 교회 비전 + 주소
  - 중앙~우측: "예배" / "공동체" / "미디어" 3개 컬럼 링크 목록
- SNS 아이콘: Lucide의 Youtube, Instagram, Mail 사용
- 하단: 구분선 + 저작권 표시
- 모바일: 1컬럼 스택

이모지 사용 절대 금지. Lucide 아이콘만 사용.
```

### 프롬프트 1-3: 공통 UI 컴포넌트
```
src/components/ui/ 폴더에 공통 컴포넌트를 구현해줘.

1. Button.tsx
   - variant: "primary" | "secondary" | "ghost"
   - size: "sm" | "md" | "lg"
   - primary: bg-primary 청색, 흰 텍스트, rounded-full
   - secondary: border-primary, 투명 배경, 청색 텍스트
   - ghost: 투명 배경, 텍스트만

2. SectionHeader.tsx
   - props: label(상단 작은 텍스트), title(큰 제목), align("center" | "left")
   - label: text-xs tracking-[5px] text-primary uppercase font-semibold
   - title: font-serif text-3xl font-bold text-dark

3. ImagePlaceholder.tsx
   - props: label, aspectRatio("16/9" | "4/3" | "1/1")
   - 사진 미확보 시 사용하는 회색 placeholder
   - 중앙에 Lucide의 ImageIcon + label 텍스트
   - bg-bg-warm rounded-2xl

이모지 사용 절대 금지.
```

---

## Phase 2: 홈페이지 섹션 (서브에이전트 or 에이전트 팀)

> 💡 섹션들은 서로 독립적이므로 병렬 작업이 가능합니다.
> 에이전트 팀을 사용하려면 아래 프롬프트를 하나의 지시로 묶어서 전달하세요.

### 에이전트 팀으로 실행할 경우:
```
에이전트 팀을 구성해서 홈페이지 섹션을 병렬로 구현해줘.
각 에이전트는 .claude/agents/frontend.md의 규칙을 따르고,
CLAUDE.md의 디자인 시스템을 준수해야 해.

Teammate 1 — 히어로 + 예배시간 바:
- src/components/sections/HeroSection.tsx 구현
- src/components/sections/ServiceTimesBar.tsx 구현

Teammate 2 — 표어 여정 + 새가족 안내:
- src/components/sections/JourneyTimeline.tsx 구현
- src/components/sections/NewHereSection.tsx 구현

Teammate 3 — 설교 + 공동체 + 지도:
- src/components/sections/LatestSermonSection.tsx 구현
- src/components/sections/CommunitySection.tsx 구현
- src/components/sections/LocationSection.tsx 구현

핵심 규칙:
- 이모지 절대 금지. Lucide React 아이콘만 사용
- unsplash 등 외부 이미지 URL 하드코딩 금지. ImagePlaceholder 사용
- 각 섹션은 독립적인 컴포넌트로, props로 데이터를 받는 구조
- 반응형: 모바일 1컬럼, 데스크톱 멀티컬럼
- framer-motion으로 스크롤 진입 시 fade-in 애니메이션
```

### 서브에이전트로 순차 실행할 경우:

#### 프롬프트 2-1: HeroSection
```
src/components/sections/HeroSection.tsx를 구현해줘.

- 풀스크린(100vh) 이미지 슬라이더 (3장, 5초 간격 crossfade)
- 이미지: ImagePlaceholder 3개 사용 (label: "예배 사진 1/2/3")
- 어두운 그라데이션 오버레이
- 중앙 정렬:
  - 상단 뱃지: "2026 표어" (반투명 배경, 골드 텍스트, tracking-[4px])
  - 메인 타이틀: "일어나 함께가자" (serif, text-5xl, white)
  - 골드 구분선 (w-12 h-0.5 bg-accent mx-auto)
  - 서브텍스트: "21세기 지도자를 길러내는 교회 / 서울 용산, 함께 걸어가는 공동체"
  - CTA 2개: "예배 안내 →" (primary) + "온라인 예배" (ghost/투명)
- 하단: 슬라이더 인디케이터 (활성: w-9 primary, 비활성: w-2 반투명)
- framer-motion: AnimatePresence로 슬라이드 전환

이모지, 유니코드 심볼 사용 금지.
```

#### 프롬프트 2-2: ServiceTimesBar
```
src/components/sections/ServiceTimesBar.tsx를 구현해줘.

- 배경: bg-primary (딥 블루)
- 4개 예배 시간을 가로로 나열:
  - 주일예배 / 오전 11:00 / Lucide: Sun 아이콘
  - 수요예배 / 오후 7:30 / Lucide: Moon 아이콘
  - 금요기도 / 오후 9:00 / Lucide: Heart 아이콘
  - 새벽기도 / 오전 5:30 / Lucide: Sunrise 아이콘
- 각 항목 사이: 세로 구분선 (border-r border-white/10)
- 라벨: text-accent(골드), text-xs, tracking-widest
- 시간: text-white, text-lg, font-serif
- 모바일: 2x2 그리드
- 아이콘: Lucide React만 사용 (w-5 h-5, text-white/60)

이모지 ☀️🌙🙏🌅 등 절대 사용 금지.
```

#### 프롬프트 2-3: JourneyTimeline
```
src/components/sections/JourneyTimeline.tsx를 구현해줘.

- SectionHeader: label="우리의 여정", title="3년의 발걸음, 하나의 이야기"
- 3개 노드 타임라인 (2024 → 2025 → 2026)
- 노드 사이 연결선: 그라데이션 (bg-warm → primary → primary-light)
- 각 노드:
  - 원형(w-14 h-14): 2026만 bg-primary fill, 나머지 bg-white + border-primary
  - 아이콘: Lucide의 Home(2024), Footprints(2025), ArrowUpRight(2026)
  - 연도: text-primary font-bold tracking-widest
  - 표어 제목: font-serif text-base font-bold
  - 부제: text-dark-soft text-sm
- 2026 노드에 ring 효과 (ring-8 ring-primary/10)
- 모바일: 세로 타임라인으로 전환 (왼쪽 연결선 + 우측 컨텐츠)
- framer-motion: 스크롤 진입 시 노드 순차 등장

이모지 🏠🚶🌅 사용 금지. Lucide 아이콘만 사용.
```

#### 프롬프트 2-4: NewHereSection
```
src/components/sections/NewHereSection.tsx를 구현해줘.

- 2컬럼 레이아웃 (텍스트 | 이미지)
- 좌측:
  - SectionHeader: label="새가족 안내", title="처음 오시는 분을 환영합니다"
  - 본문 텍스트 (교회 환영 메시지)
  - 정보 리스트 4개:
    - Lucide MapPin + "위치" + 주소
    - Lucide Clock + "주일예배" + 시간
    - Lucide Baby + "키즈" + 설명
    - Lucide ParkingSquare + "주차" + 설명
  - 각 항목: 아이콘(bg-cream, rounded-xl, w-11 h-11) + 텍스트
  - "방문 예약하기 →" Button(primary)
- 우측: ImagePlaceholder (label: "교회 사진", aspect 3/4, rounded-2xl)
  - 좌상단: 오버레이 뱃지 "WELCOME / 누구나 환영합니다"
  - 하단: 그라데이션 + 인용구 "우리는 한 가족입니다"
- 모바일: 1컬럼 (이미지 → 텍스트 순서)

이모지 📍🕐👶🅿️ 사용 금지. Lucide 아이콘만 사용.
```

#### 프롬프트 2-5: LatestSermonSection
```
src/components/sections/LatestSermonSection.tsx를 구현해줘.

- SectionHeader: label="말씀", title="최신 설교" + 우측 "전체 설교 보기 →" 링크
- 2컬럼 그리드 (1.2fr + 1fr):
  - 좌측 메인 카드:
    - bg-primary 배경 + 그라데이션 오버레이
    - 상단 Badge "최신 설교" (bg-accent text-dark)
    - 제목: "새 하늘과 새 땅" (serif, text-2xl, white)
    - 본문 정보: 요한계시록 21:1-8 · 김항우 목사
    - "설교 듣기" 버튼 (ghost + Lucide Play 아이콘)
  - 우측 리스트 4개:
    - bg-white rounded-xl p-4 각 항목
    - 제목 + 성경 구절 + 날짜
    - 우측: 재생 버튼 (원형, bg-cream, Lucide Play)
- 모바일: 1컬럼, 메인 카드 → 리스트 순서

Lucide의 Play, ChevronRight 아이콘 사용. 유니코드 ▶ 사용 금지.
```

#### 프롬프트 2-6: CommunitySection
```
src/components/sections/CommunitySection.tsx를 구현해줘.

- SectionHeader: label="공동체", title="함께 걸어가는 사람들", align="center"
- 3컬럼 카드 그리드:
  - 청년부 United: ImagePlaceholder(label:"청년부 사진") + 제목 + 설명 + "@chungpa_united" 태그
  - 청소년부: ImagePlaceholder + 제목 + 설명 + "매주 주일" 태그
  - 선교: ImagePlaceholder + 제목 + 설명 + "해외선교" 태그
- 카드 스타일: bg-bg rounded-2xl overflow-hidden border border-primary/5
- 이미지 영역: h-44
- 태그: 이미지 우하단 오버레이 (bg-primary/85 text-white rounded-full px-3 py-1)
- hover: shadow-lg 전환
- 모바일: 1컬럼 스택

이모지 사용 금지. 외부 이미지 URL 사용 금지. ImagePlaceholder 사용.
```

#### 프롬프트 2-7: LocationSection
```
src/components/sections/LocationSection.tsx를 구현해줘.

- 배경: bg-primary
- 중앙 정렬:
  - 제목: "오시는 길" (serif, white)
  - 주소 + 교통편: 남영역 3번 출구 도보 8분
- 지도 영역: rounded-2xl, bg-white/5 border border-white/10
  - 내부에 "카카오맵 연동 영역" placeholder
  - Lucide MapPin 아이콘 + 안내 텍스트
  - (실제 구현 시 Kakao Maps JavaScript API iframe으로 교체)
- 하단: 전화번호 + FAX (Lucide Phone, Printer 아이콘 사용)
- 모바일 대응

이모지 📍 사용 금지. Lucide MapPin 사용.
```

---

## Phase 3: 홈페이지 조립

### 프롬프트 3-1: 홈페이지 페이지 조립
```
src/app/page.tsx에 모든 홈페이지 섹션을 조립해줘.

순서:
1. HeroSection
2. ServiceTimesBar
3. JourneyTimeline
4. NewHereSection
5. LatestSermonSection
6. CommunitySection
7. LocationSection

각 섹션에 임시 데이터를 props로 전달해줘.
나중에 Sanity CMS에서 데이터를 가져오는 것으로 교체할 거야.
빌드가 정상 통과하는지 확인해줘.
```

---

## Phase 4: 서브페이지 (서브에이전트)

### 프롬프트 4-1: 새가족 페이지
```
src/app/visit/page.tsx — 새가족 안내 페이지를 구현해줘.

구성:
1. 히어로 배너 (높이 40vh, 배경 primary 그라데이션, "처음 오시는 분을 환영합니다")
2. "방문 전 알아두세요" 섹션:
   - FAQ 아코디언 6개 (복장, 주차, 예배 시간, 아이 프로그램, 헌금, 식사)
   - Lucide ChevronDown으로 토글
3. "예배 안내" 섹션:
   - 4개 예배 카드 (주일/수요/금요/새벽) 상세 정보
4. "방문 예약" 폼:
   - 이름, 연락처(전화번호), 예배 선택(radio), 인원수, 메모
   - 제출 시 alert 또는 toast (실제 API 연동 전)
5. "오시는 길" (LocationSection 재사용)
```

### 프롬프트 4-2: 설교 페이지
```
src/app/sermons/page.tsx — 설교 아카이브 페이지를 구현해줘.

구성:
1. 상단: SectionHeader + 검색 바 (Lucide Search)
2. 필터: 시리즈별 / 최신순 / 설교자별 탭
3. 설교 카드 그리드:
   - 유튜브 썸네일 placeholder
   - 제목, 성경 본문, 날짜, 설교자
   - 클릭 시 상세 페이지 or 모달에서 유튜브 embed 재생
4. 페이지네이션 or 무한 스크롤
5. 임시 데이터 10개 (나중에 Sanity/YouTube API로 교체)
```

### 프롬프트 4-3: 교회소개 페이지
```
src/app/about/page.tsx — 교회소개 페이지를 구현해줘.

구성:
1. 비전 섹션: "21세기 지도자를 길러내는 교회" + 비전 설명
2. 담임목사 소개: 사진 placeholder + 이름/약력
3. 교회 역사: 1962년 설립부터 현재까지 타임라인
4. 신앙고백: 장로회 신앙고백 요약
5. 교역자 소개 카드 (placeholder)
```

---

## Phase 5: CMS 연동 (서브에이전트)

### 프롬프트 5-1: Sanity 셋업
```
CMS 에이전트(.claude/agents/cms.md) 역할에 따라 Sanity를 셋업해줘.

1. sanity/ 폴더에 Sanity Studio 프로젝트 생성
2. 스키마 구현: sermon, sermonSeries, event, bulletin, post, gallery
3. src/lib/sanity/client.ts — Sanity 클라이언트 설정
4. src/lib/sanity/queries.ts — GROQ 쿼리 모음
5. 초기 샘플 데이터 시딩 스크립트 작성
```

### 프롬프트 5-2: CMS 데이터 연동
```
홈페이지와 서브페이지의 임시 데이터를 Sanity CMS 데이터로 교체해줘.

1. src/app/page.tsx — 최신 설교, 다가오는 행사를 Sanity에서 fetch
2. src/app/sermons/page.tsx — 설교 목록을 Sanity에서 fetch
3. src/app/news/page.tsx — 공지사항/주보를 Sanity에서 fetch
4. revalidate 설정 (ISR: 1시간 간격 재생성)
```

---

## Phase 6: QA (서브에이전트)

### 프롬프트 6-1: 전체 검증
```
QA 에이전트(.claude/agents/qa.md) 역할에 따라 전체 프로젝트를 검증해줘.

1. 디자인 시스템 위반 검출:
   - 이모지 사용 여부 grep
   - 유니코드 심볼 사용 여부 grep
   - unsplash 등 외부 이미지 하드코딩 grep
   - 금지된 폰트 사용 grep

2. 빌드 + 타입 체크:
   - npm run build
   - npx tsc --noEmit

3. 접근성 체크:
   - img alt 텍스트
   - 버튼 aria-label
   - 시맨틱 태그

4. 반응형 확인:
   - 320px, 375px, 768px, 1024px, 1440px

5. SEO:
   - 각 페이지 title, description
   - OG 태그
   - sitemap.xml

결과를 QA_REPORT.md에 기록하고, 발견된 이슈를 수정해줘.
```

---

## Phase 7: 배포

### 프롬프트 7-1: Vercel 배포 준비
```
Vercel 배포를 위한 최종 준비를 해줘.

1. .env.example에 필요한 환경변수 목록 정리
2. next.config.ts에 이미지 도메인 허용 설정
3. robots.txt 생성
4. sitemap.xml 동적 생성 (next-sitemap 또는 app router 방식)
5. 404 페이지 커스터마이징
6. 최종 빌드 확인
7. README.md 작성 (프로젝트 설명, 로컬 실행법, 배포 방법)
```

---

## 참고: 에이전트 팀 vs 서브에이전트 판단 기준

| 단계 | 방식 | 이유 |
|------|------|------|
| Phase 0 (셋업) | 서브에이전트 | 순차적, 기반 코드 |
| Phase 1 (레이아웃) | 서브에이전트 | 순차적, Header→Footer 의존성 |
| Phase 2 (홈 섹션) | **에이전트 팀** ✅ | 7개 섹션 독립적, 병렬 가능 |
| Phase 3 (조립) | 서브에이전트 | 단일 파일 수정 |
| Phase 4 (서브페이지) | **에이전트 팀** ✅ | 3개 페이지 독립적 |
| Phase 5 (CMS) | 서브에이전트 | 순차적 |
| Phase 6 (QA) | 서브에이전트 | 전체 검증 |
| Phase 7 (배포) | 서브에이전트 | 순차적 |

---

## 교회 로고 적용

로고 파일이 이미 프로젝트에 포함되어 있습니다: `청파로고.png`

```bash
# 프로젝트 시작 시 로고를 올바른 위치에 복사
mkdir -p public/images
cp 청파로고.png public/images/logo.png
```

로고 색상 (남색 #2B3A8C + 하늘색 #6EC6E6) 이 프로젝트 전체 컬러 시스템의 기준입니다.
Favicon은 붓글씨 "청" 부분을 크롭해서 별도 제작하세요.

---

## 실제 사진 적용 방법

교회 사진을 확보한 후:
```
1. public/images/ 폴더에 사진 저장:
   - hero-1.jpg, hero-2.jpg, hero-3.jpg (히어로 슬라이더)
   - pastor.jpg (담임목사)
   - church-exterior.jpg (교회 건물)
   - youth-group.jpg (청년부)
   - mission-cambodia.jpg (선교)
   등

2. Claude Code에 프롬프트:
   "모든 ImagePlaceholder를 실제 사진으로 교체해줘.
    사진 파일 목록: [파일명 나열]
    각 placeholder의 label과 매칭되는 사진을 연결해줘."
```
