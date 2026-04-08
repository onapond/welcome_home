# Frontend Agent

## 역할
모든 UI 컴포넌트, 페이지, 인터랙션을 구현한다. 디자인 시스템을 철저히 준수한다.

## 담당 파일
- `src/components/**` (모든 컴포넌트)
- `src/app/**/page.tsx` (각 페이지)
- `public/` (정적 에셋, 로고 SVG 등)

## 수정 금지 범위
- `src/lib/**` (아키텍트 에이전트 담당)
- `sanity/` (CMS 에이전트 담당)
- `tailwind.config.ts`, `next.config.ts` (아키텍트 담당)

## 핵심 규칙

### 절대 금지 사항
1. **이모지 사용 금지**: ☀️🌙🙏📍🕐👶🅿️🏠🚶🌅 등 모든 이모지를 UI에 사용하지 않는다
2. **AI 생성 아이콘 금지**: 유니코드 심볼(✝ ▶ 등)도 아이콘 대용으로 사용하지 않는다
3. **스톡 이미지 하드코딩 금지**: unsplash URL을 직접 넣지 않는다. placeholder 또는 CMS 연동

### 아이콘 사용법
```tsx
// ✅ 올바른 사용
import { MapPin, Clock, Phone, Users, Play, ChevronRight, Sun, Moon, Heart, Sunrise, Calendar, Mail, Instagram, Youtube } from 'lucide-react';

<MapPin className="w-5 h-5 text-primary" />
<Clock className="w-4 h-4 text-dark-soft" />

// ❌ 금지
<span>📍</span>
<span>☀️</span>
<div>▶</div>
```

### 이미지 처리
```tsx
// ✅ 올바른 사용 - next/image + placeholder
import Image from 'next/image';

<Image
  src="/images/hero-worship.jpg"    // 실제 교회 사진 경로
  alt="청파중앙교회 주일예배"
  fill
  className="object-cover"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."  // 블러 플레이스홀더
/>

// 사진 미확보 시 placeholder 컴포넌트 사용
<ImagePlaceholder label="예배 사진이 들어갈 자리" aspectRatio="16/9" />
```

## 작업 순서

### Phase 1: 공통 컴포넌트 (layout/)
1. `Header.tsx` — 스크롤 반응형 네비게이션 (투명→백색), 교회 로고(public/images/logo.png 사용), 메뉴, "처음 오시나요?" CTA. 스크롤 전(어두운 배경) 로고는 CSS filter로 밝게 처리
2. `Footer.tsx` — 3컬럼 링크, 교회 정보, SNS 아이콘(Lucide), 저작권
3. `MobileNav.tsx` — 햄버거 메뉴, 슬라이드 드로어

### Phase 2: UI 컴포넌트 (ui/)
4. `Button.tsx` — primary(청색)/secondary(아웃라인)/ghost 변형
5. `Card.tsx` — 이미지+텍스트 카드, 설교 카드 등
6. `Badge.tsx` — 태그/라벨
7. `ImagePlaceholder.tsx` — 사진 미확보 시 사용하는 placeholder
8. `SectionHeader.tsx` — 섹션 상단 라벨+제목 공통 패턴

### Phase 3: 홈페이지 섹션 (sections/)
9. `HeroSection.tsx` — 풀스크린 슬라이더 + 표어 + CTA
10. `ServiceTimesBar.tsx` — 예배 시간 가로 바 (Lucide 아이콘 사용)
11. `JourneyTimeline.tsx` — 3년 표어 타임라인
12. `NewHereSection.tsx` — 새가족 안내 (텍스트+사진 2컬럼)
13. `LatestSermonSection.tsx` — 최신 설교 카드 + 리스트
14. `CommunitySection.tsx` — 공동체 카드 3개
15. `LocationSection.tsx` — 카카오맵 + 교통 안내

### Phase 4: 서브페이지
16. `/visit` — 새가족 안내 (FAQ 아코디언, 방문 예약 폼)
17. `/sermons` — 설교 아카이브 (유튜브 연동, 필터)
18. `/about` — 교회소개 (비전, 목사 소개, 역사)
19. `/community` — 공동체 소개
20. `/news` — 공지사항, 주보, 갤러리
21. `/contact` — 문의 폼, 오시는 길

## 반응형 브레이크포인트
```
모바일: 기본 (< 768px) — 1컬럼, 네비게이션 햄버거
태블릿: md (768px~) — 2컬럼 그리드
데스크톱: lg (1024px~) — 3컬럼, 풀 네비게이션
와이드: xl (1280px~) — max-width 제한, 넓은 여백
```

## 애니메이션
- framer-motion 사용
- 스크롤 진입 시 fade-in + slide-up (각 섹션)
- 히어로 슬라이더: crossfade (1.5초)
- 네비게이션: 스크롤 시 배경색 전환 (0.3초)
- 과도한 애니메이션 금지. prefers-reduced-motion 존중
