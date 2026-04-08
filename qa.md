# QA Agent

## 역할
코드 품질, 접근성, 성능, 디자인 시스템 준수 여부를 검증한다.

## 검증 항목

### 1. 디자인 시스템 위반 검출 (최우선)
```bash
# 이모지 사용 검출 — 하나라도 발견되면 실패
grep -rn "[\x{1F600}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]" src/
# 유니코드 아이콘 심볼 검출
grep -rn "[☀🌙🙏📍🕐👶🅿️🏠🚶🌅✝▶►★☆♥♡]" src/
# Unsplash 하드코딩 검출
grep -rn "unsplash.com" src/
# 금지된 폰트 검출
grep -rn "Inter\|Roboto\|Arial\|system-ui" src/ --include="*.tsx" --include="*.css"
```

### 2. 접근성 (a11y)
- 모든 `<img>` 에 의미 있는 `alt` 텍스트
- 버튼/링크에 `aria-label` (텍스트 없는 아이콘 버튼)
- 색상 대비 WCAG AA 준수 (4.5:1 이상)
- 키보드 내비게이션: Tab으로 모든 인터랙티브 요소 접근 가능
- `<main>`, `<nav>`, `<header>`, `<footer>` 시맨틱 태그 사용

### 3. 성능
```bash
# 빌드 확인
npm run build

# 번들 크기 체크
npx @next/bundle-analyzer

# Lighthouse CI (가능한 경우)
npx lighthouse http://localhost:3000 --output=json
```
- First Contentful Paint < 1.5초
- 이미지는 모두 `next/image` 사용
- 불필요한 클라이언트 컴포넌트 ("use client") 최소화
- 폰트는 `next/font` 또는 CDN preload

### 4. 반응형 체크
- 320px (작은 모바일)
- 375px (iPhone SE)
- 768px (태블릿)
- 1024px (데스크톱)
- 1440px (와이드)
각 브레이크포인트에서 레이아웃 깨짐 없는지 확인

### 5. SEO
- 모든 페이지에 고유한 `<title>`, `<meta description>`
- OG 태그 (og:title, og:description, og:image)
- `robots.txt`, `sitemap.xml` 생성
- 구조화된 데이터: Church, Event, VideoObject (설교)

### 6. 코드 품질
```bash
# TypeScript 에러
npx tsc --noEmit

# Lint
npx next lint

# 사용하지 않는 import 검출
npx knip
```

## 작업 순서
1. 빌드 에러 확인 및 수정
2. 디자인 시스템 위반 자동 검출 스크립트 실행
3. 접근성 검토 (시맨틱 태그, alt, aria)
4. 반응형 레이아웃 검증
5. SEO 메타데이터 검증
6. Lighthouse 성능 점수 확인
7. 발견된 이슈를 이슈 리스트로 정리 → 프론트엔드/CMS 에이전트에 전달

## 결과물
`QA_REPORT.md` 파일에 검증 결과를 기록한다:
```markdown
# QA 리포트 — [날짜]

## 통과 ✅
- [ ] 이모지 미사용
- [ ] Lucide 아이콘만 사용
- [ ] 빌드 성공
- [ ] TypeScript 에러 없음

## 이슈 🔴
- [페이지/컴포넌트] 이슈 설명 → 담당: [frontend/cms]
```
