# CMS Agent

## 역할
Sanity CMS 스키마 설계, 콘텐츠 모델링, API 연동을 담당한다. 교회 담당자가 코드 없이 콘텐츠를 관리할 수 있게 한다.

## 담당 파일
- `sanity/` (Sanity Studio 전체)
- `sanity/schemas/**` (콘텐츠 스키마)
- `src/lib/sanity/**` (쿼리, 클라이언트 설정)

## 수정 금지 범위
- `src/components/**` (프론트엔드 담당)
- `src/app/**/page.tsx` (프론트엔드 담당)

## 콘텐츠 스키마

### sermon (설교)
```ts
{
  title: string           // 설교 제목
  date: date              // 날짜
  pastor: string          // 설교자
  scripture: string       // 성경 본문
  series: reference       // 시리즈 참조
  youtubeId: string       // 유튜브 영상 ID
  summary: text           // 요약 (선택)
  thumbnail: image        // 썸네일 (선택)
}
```

### sermonSeries (설교 시리즈)
```ts
{
  title: string           // 시리즈명
  description: text       // 설명
  thumbnail: image        // 대표 이미지
  startDate: date
  endDate: date
}
```

### event (행사/일정)
```ts
{
  title: string
  date: datetime
  endDate: datetime       // 선택
  location: string
  description: block      // 리치 텍스트
  image: image
  category: string        // 예배, 교육, 행사, 선교
  registrationUrl: url    // 등록 링크 (선택)
}
```

### bulletin (주보)
```ts
{
  date: date              // 주보 날짜
  pdfFile: file           // PDF 업로드
  announcements: block    // 교회 소식 리치 텍스트
}
```

### post (공지사항/블로그)
```ts
{
  title: string
  slug: slug
  date: datetime
  category: string        // 공지, 소식, 간증
  body: block             // 리치 텍스트
  images: array<image>
  featured: boolean
}
```

### gallery (갤러리)
```ts
{
  title: string
  date: date
  description: text
  images: array<{
    image: image
    caption: string
  }>
  category: string        // MT, 선교, 행사, 예배
}
```

### page (정적 페이지)
```ts
{
  title: string
  slug: slug
  body: block
  seo: {
    metaTitle: string
    metaDescription: text
    ogImage: image
  }
}
```

## GROQ 쿼리 패턴

```groq
// 최신 설교 5개
*[_type == "sermon"] | order(date desc) [0...5] {
  title, date, pastor, scripture, youtubeId,
  "seriesTitle": series->title
}

// 이번 주 주보
*[_type == "bulletin"] | order(date desc) [0] {
  date, announcements,
  "pdfUrl": pdfFile.asset->url
}

// 다가오는 행사
*[_type == "event" && date >= now()] | order(date asc) [0...5] {
  title, date, location, category,
  "imageUrl": image.asset->url
}
```

## 작업 순서
1. `npx create-sanity@latest` 으로 Sanity Studio 생성
2. 위 스키마들을 `sanity/schemas/`에 구현
3. `src/lib/sanity/client.ts` — Sanity 클라이언트 설정
4. `src/lib/sanity/queries.ts` — 주요 GROQ 쿼리 모음
5. `src/lib/sanity/types.ts` — 쿼리 결과 타입 정의
6. Sanity Studio 커스터마이징 (한국어 UI, 프리뷰 설정)
7. 초기 샘플 데이터 시딩 스크립트
