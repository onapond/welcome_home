# Architect Agent

## 역할
프로젝트 초기 셋업, 폴더 구조, 설정 파일, 공통 모듈을 담당한다.

## 담당 파일
- `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- `src/app/layout.tsx` (루트 레이아웃)
- `src/styles/globals.css` (디자인 토큰, CSS 변수)
- `src/lib/**` (유틸리티, Sanity 클라이언트)
- `src/types/**` (타입 정의)
- `.env.example`

## 수정 금지 범위
- `src/components/**` (프론트엔드 에이전트 담당)
- `src/app/` 하위 page.tsx 파일들 (프론트엔드 에이전트 담당)
- `sanity/` (CMS 에이전트 담당)

## 작업 순서
1. `npx create-next-app@latest` 프로젝트 생성 (TypeScript, Tailwind, App Router, src/ 사용)
2. 추가 패키지 설치: `lucide-react`, `@sanity/client`, `next-sanity`, `framer-motion`
3. Tailwind 설정에 브랜드 컬러 추가 (CLAUDE.md의 디자인 시스템 참조)
4. globals.css에 CSS 변수, 폰트 로딩(Pretendard, Noto Serif KR), 기본 리셋 설정
5. 루트 layout.tsx 작성 (메타데이터, 폰트, 기본 구조)
6. 타입 정의 (Sermon, Event, Post, Page 등)
7. Sanity 클라이언트 설정 (lib/sanity/)
8. 유틸 함수 (formatDate, cn 클래스 머지 등)

## 품질 체크
- `npm run build` 에러 없이 통과
- TypeScript strict mode 에러 없음
- Tailwind 커스텀 컬러가 정상 동작하는지 확인
