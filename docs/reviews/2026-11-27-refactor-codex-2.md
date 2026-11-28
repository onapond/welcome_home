판정: 고칠 것 있음

## ① 지난 지적 재판정

수정 범위는 `4801796..0912a13`이다. 검토 시점 HEAD `cf31694`과 `0912a13` 사이의 추적 파일 차이는 이번 요청서 한 개다. 아래 번호는 두 이전 결과 파일의 지적 순서를 따른다.

| 지난 지적 | 판정 | 현재 근거 · 남은 조치 |
|---|---|---|
| Codex 1. Markdown 머리말의 파서 선택 | 고쳐짐 | `src/lib/content/load.ts:40`, `src/lib/content/load.ts:53`에서 첫 줄을 검사한 뒤 YAML CORE 스키마로만 읽는다. 임시 파일의 잘못된 첫 줄을 파서 호출 전에 파일명과 함께 거부했다. |
| Codex 2. 공개 저장소의 교역자 연락처 | 덜 고쳐짐 | `content/staff.yaml:5`에 동의 기준이 있고 `src/lib/content/schema.ts:325`가 공개 표시 없는 연락처를 거부했다. 화면도 `src/app/about/page.tsx:453`에서 표시 여부를 확인한다. 다만 `README.md:27`의 로컬 검사는 수동이고 `.github/workflows/check.yml:6`의 자동 검사는 push·PR 뒤에 돈다. 직원이 검사를 생략하면 공개 이력에 먼저 남는다. 콘텐츠를 커밋하는 직원용 절차에서 스테이징한 명단을 먼저 검사하도록 연결할 필요가 있다. |
| Codex 3. R2 호스트와 이미지 최적화 비용 · 규칙 ⑤ | 고쳐짐 | `next.config.ts:8`이 전역 최적화를 끈다. `src/app/news/[id]/page.tsx:69`의 머리말 사진에 시험용 보관소 주소를 설정하자 정적 HTML의 이미지 주소가 해당 호스트를 직접 가리켰다. |
| Codex 4. 화면에서 쓰지 않는 일정의 빌드 검증 | 고쳐짐 | `src/app/sitemap.ts:9` → `src/lib/content/validate.ts:32`에서 일정을 읽는다. 임시 사본에 시작일 없는 일정을 추가한 빌드가 `/sitemap.xml` 생성 단계에서 종료 코드 1과 `content/events/r4-review.md → start: 필수 항목이 없습니다`를 반환했다. 일정 화면 자체는 `HANDOFF.md:64`의 후속 작업이다. |
| Codex 5. 누락 폴더와 예상 밖 확장자 | 고쳐짐 | `src/lib/content/load.ts:119`, `src/lib/content/load.ts:126`. 일정 폴더 누락과 설교의 대문자 `.MD`를 각각 경로와 함께 거부했다. 빈 폴더와 문서화된 밑줄 초안은 허용한다. |
| Codex 6. 달력·KST·종료 시각 검증 | 고쳐짐 | `src/lib/content/load.ts:41`, `src/lib/content/schema.ts:85`, `src/lib/content/schema.ts:254`, `content/README.md:49`. 따옴표 없는 2월 30일, 27:65, 시간대가 붙은 문자열, 시작보다 이른 종료를 거부했다. 허용 형식의 19:30은 입력 그대로였다. |
| Codex 7. 낯선 필드·공백 제목·영문 오류 | 고쳐짐 | `src/lib/content/schema.ts:18`, `src/lib/content/schema.ts:43`, `src/lib/content/schema.ts:207`, `src/lib/content/load.ts:29`. 설교 하나의 공백 제목과 `youtub` 오타가 각각 한국어 사유와 함께 나왔다. 새 소식 사진 형식의 오류 품질은 ② 8번에 적었다. |
| Codex 8. 잘못된 자리표시와 위치 문구 치환 | 덜 고쳐짐 | `src/lib/content/pages.ts:262`, `src/lib/content/pages.ts:322`. 잘못된 표어 필드는 `hero.headline`을 지목했고 위치 문구의 도로명은 실제 교회 정보와 일치했다. 닫는 괄호 누락과 존재하지 않는 일부 교통편은 여전히 치환 검사를 통과한다(② 5번). |
| Codex 9. 공동체·예배 ID와 바닥글 링크 · 규칙 ⑦ | 고쳐짐 | `src/lib/content/schema.ts:69`, `src/lib/content/schema.ts:197`, `src/lib/content/pages.ts:104`, `src/lib/site-summary.ts:60`. 공동체 ID 중복을 두 번째 항목 위치와 함께 거부했다. 바닥글은 같은 목록의 제목과 ID로 링크를 만든다. |
| Codex 10. 미디어 출처와 주보 임베드 | 덜 고쳐짐 | `src/lib/media.ts:22`에서 프로토콜 생략 주소를 거르고 `src/lib/media.ts:37`에서 PDF 확장자를 검사한다. 그러나 임의 HTTPS 출처의 `.pdf`도 검증을 통과해 `src/app/news/bulletin/[id]/page.tsx:64`의 iframe에 들어간다. 파일명이 PDF여도 해당 서버는 다른 문서를 보낼 수 있다. 임베드는 교회가 관리하는 로컬 PDF·보관소 출처로 제한하고, 외부 자료에는 일반 링크를 제공한다. |
| Codex 11. 유튜브 주소 오인 · 규칙 ⑱ | 고쳐짐 | `src/lib/content/schema.ts:103`, `src/lib/content/schema.ts:120`. 허용 호스트·경로와 영상 ID 전체를 확인한다. 다른 호스트에 유효한 길이의 영상 번호를 붙인 주소는 거부했다. |
| Codex 12. 미노출 찬양 본문 작성 안내 | 고쳐짐 | `content/praise/_template.md:7`, `content/README.md:47`이 본문을 비워 두라고 안내한다. `src/components/features/sermons/items.ts:22`가 보내는 목록 정보와 일치한다. |
| Codex 13. 밝은 상세 화면의 고정 헤더 · 규칙 ③⑦⑯ | 고쳐짐 | `src/components/layout/Header.tsx:54`에서 상세는 처음부터 흰 헤더를 쓴다. `src/app/sermons/[id]/page.tsx:49`, `src/app/news/[id]/page.tsx:41`, `src/app/news/bulletin/[id]/page.tsx:38`, `src/app/news/gallery/[id]/page.tsx:46`에 헤더 높이를 넘는 상단 여백이 있다. 상세 첫 화면 확인 기록은 `HANDOFF.md:62`에 있다. |
| Codex 14. 상세 공유 메타데이터와 홈 Church 구조화 데이터 · 규칙 ⑧⑩ | 고쳐짐 | `src/lib/metadata.ts:40`, `src/app/page.tsx:58`. 임시 빌드의 sitemap 경로 28개 모두 정적 HTML의 canonical과 OG URL이 자기 경로와 일치했다. 홈 JSON-LD를 파싱해 유형이 Church임을 확인했다. |
| Codex 15. 목록 소개 하드코딩과 지도 개발 문구 · 규칙 ⑥ | 덜 고쳐짐 | `content/pages/lists.yaml:9`, `src/lib/content/lists.ts:55`에서 목록 머리글·설명을 편집할 수 있고 지도에는 실제 길찾기 링크가 있다. 새 네이버 지도 버튼 문구와 방문자 안내문은 각각 `src/components/sections/LocationSection.tsx:13`, `src/components/sections/LocationSection.tsx:60`에 고정돼 있다. 직원이 수정할 두 문구를 기존 카카오 버튼처럼 `location.yaml`에서 읽는다. |
| Codex 16. 영상 없는 홈 설교의 재생 안내 · 규칙 ⑱ | 고쳐짐 | `src/app/page.tsx:53`, `src/components/sections/LatestSermonSection.tsx:92`, `src/components/sections/LatestSermonSection.tsx:130`. 영상이 없으면 대표 카드는 ‘설교 보기’와 화살표, 나머지 카드도 화살표를 표시한다. |
| Codex 17. 공동체 페이지 제목 중복 | 고쳐짐 | `content/pages/community.yaml:13`, `src/app/community/page.tsx:15`, `src/app/layout.tsx:23`. 생성 HTML의 제목은 ‘공동체 \| 청파중앙교회’였다. |
| Codex 18. sitemap 수정일과 푸터 연도 · 규칙 ⑪ 관련 | 덜 고쳐짐 | `src/components/layout/Footer.tsx:16`은 하이드레이션 때 빌드 연도를 사용한다. 반면 `src/app/sitemap.ts:11`, `src/app/sitemap.ts:33`, `src/app/sitemap.ts:41`은 여전히 목록 전체에 빌드 시각, 상세에는 게시일을 넣는다. 오탈자를 고쳐 재빌드하면 손대지 않은 목록만 갱신된 것처럼 보인다. 실제 수정일을 알 수 없는 항목은 `lastModified`를 생략한다. |
| Codex 19. 새가족 배지·예배 라벨 색·본문 대체 글꼴 · 규칙 ③④⑥ | 고쳐짐 | `content/pages/home.yaml:47`은 ‘새가족’, `src/components/sections/ServiceTimesBar.tsx:45`는 보조색을 쓴다. `src/app/globals.css:29`의 본문 대체 글꼴에서 Roboto를 제거했다. |
| Codex 20. 슬라이드와 모바일 메뉴의 키보드 조작 · 규칙 ⑦⑯ | 고쳐짐 | `src/components/sections/HeroSlider.tsx:46`, `src/components/sections/HeroSlider.tsx:177`에 자동 전환 정지와 조작 버튼이 있다. `src/components/layout/MobileNav.tsx:31`이 열기·닫기 때 포커스를 옮기고 Tab 순환·Esc를 처리한다. 모바일 동작 기록은 `HANDOFF.md:62`에 있다. |
| Codex 21. 두 폼의 JSON null 처리 | 고쳐짐 | `src/app/api/inquiry/route.ts:52`, `src/app/api/visit/route.ts:56`. 두 POST 핸들러를 직접 호출해 null·배열·숫자는 각각 400, 허니팟을 채운 객체는 200을 확인했다. |
| Codex 22. 환경별 파일 무시와 전체 추가 명령 | 고쳐짐 | `.gitignore:7`, `README.md:37`. 파일명만 사용한 `git check-ignore --no-index`에서 production·development 변형 모두 제외됐고 README는 편집한 콘텐츠 경로를 지정한다. |
| Codex 23. 폐기한 운영 절차 · 규칙 ⑨⑰⑲⑳ | 고쳐짐 | `README.md:21`, `README.md:35`, `README.md:40`, `README.md:56`, `CLAUDE.md:36`, `docs/검토규칙.md:30`에서 직원 편집·커밋·배포·도메인 보류와 현재 폼 구성을 확인했다. |
| Codex 24. ‘5명 이상명’ 중복 | 고쳐짐 | `src/lib/forms.ts:143`, `src/components/features/VisitClient.tsx:267`, `src/app/api/visit/route.ts:111`이 같은 ‘5명 이상’ 표시 문자열을 쓴다. 전송값 변경에 따른 별도 회귀는 ② 2번에 적었다. |
| Codex 25. 화면 변경의 브라우저 확인 기록 · 규칙 ⑯ | 고쳐짐 | `HANDOFF.md:62`에 상세 헤더, 갤러리 화살표·Esc·포커스 복귀, 900px 모바일 메뉴, 390px 14개 화면의 확인 결과가 추가됐다. |
| 대립 1. R2 호스트와 이미지 최적화 · 규칙 ⑤ | 고쳐짐 | `next.config.ts:8`, `src/components/sections/HeroSlider.tsx:78`. 전역 비최적화 설정을 사용한다. 시험용 보관소 주소의 정적 이미지 출력은 Codex 3과 같다. |
| 대립 2. 일반 img 여섯 곳과 린트 예외 · 규칙 ⑤ | 고쳐짐 | `src/app/news/[id]/page.tsx:67`, `src/components/ui/Markdown.tsx:63`, `src/components/features/sermons/VideoCard.tsx:55`, `src/components/features/gallery/GalleryClient.tsx:59`, `src/components/features/gallery/PhotoGrid.tsx:86` 및 같은 파일 121행이 Image를 쓴다. 제품 소스에서 직접 작성한 img 태그와 해당 린트 예외를 찾지 못했다. |
| 대립 3. 본문 사진 보관소 키 해석 | 덜 고쳐짐 | `src/components/ui/Markdown.tsx:64`, `src/lib/media.ts:55`. 영문 키는 보관소를 가리킨다. 같은 한글 파일명을 머리말·본문에 넣은 빌드는 서로 다른 이미지 URL을 생성했다(② 1번). |
| 대립 4. 헤더·라이트박스 브라우저 기록 · 규칙 ⑯ | 고쳐짐 | `HANDOFF.md:62`가 두 화면의 확인 항목과 결과를 명시한다. 갤러리 포커스 복귀 구현도 `src/components/features/gallery/PhotoGrid.tsx:48`에 있다. |
| 대립 5. 소식 사진 대체 텍스트 · 규칙 ⑦ | 고쳐짐 | `src/lib/content/schema.ts:229`, `src/app/news/[id]/page.tsx:70`, `content/README.md:95`. 임시 소식에 쓴 사진 설명이 생성 HTML의 alt에 그대로 들어갔다. 기존 문자열 사진 경로도 계속 받는다. |
| 대립 6. 자리표시 사용법이 제품 소스에만 있음 | 고쳐짐 | `content/pages/home.yaml:4`, `content/README.md:62`에 직원용 이름·형식·예제가 있다. 목록 파일의 예외에 관한 안내 불일치는 ② 6번에 적었다. |

## ② 새 지적

| 심각도 · 항목 | 파일:줄 · 기준 | 무엇이 틀렸나 · 확인한 실패 장면 | 고치는 방향 |
|---|---|---|---|
| 중간 1. 본문 한글 사진명 이중 인코딩 | `src/components/ui/Markdown.tsx:64`, `src/lib/media.ts:55` · 요청 ③, 규칙 ⑤ | 같은 소식의 머리말과 본문에 `news/예배.webp`를 넣어 빌드했다. 같은 호스트인데 머리말 경로는 `/news/%EC%98%88%EB%B0%B0.webp`, 본문 경로는 `/news/%25EC%2598%2588%25EB%25B0%25B0.webp`였다. 실제 파일 하나를 업로드하면 본문이 다른 객체를 요청한다. | Markdown에서 정규화한 경로와 원시 저장소 키를 구분해 경로 조각을 한 번만 인코딩한다. 같은 파일의 두 최종 src가 일치하는지 검사한다. |
| 중간 2. 배포 전에 연 방문 신청서의 ‘5명 이상’ 거절 | `src/lib/forms.ts:143`, `src/app/api/visit/route.ts:20`, `src/app/api/visit/route.ts:73` · 요청 ⑥ | 이전 화면이 보내던 `5명 이상`으로 새 핸들러에 유효한 신청을 넣자 인원 오류 400이 나왔다. 다른 값을 그대로 두고 새 값 `5+`를 보내면 검증을 지나 메일 미설정 응답 503에 도달했다. 이전 탭에서 같은 선택지를 다시 골라도 제출할 수 없다. | 이전 전송값을 유지하거나 서버에서 두 값을 같은 선택지로 정규화한다. 화면과 메일의 표시 문구는 현재 공통 함수를 쓴다. |
| 중간 3. 잘못된 주보 URL에서 콘텐츠 오류 보고 중단 | `src/lib/content/schema.ts:142`, `src/lib/media.ts:38`, `src/lib/content/validate.ts:41` · 요청 ③ | 직원이 주보에 `pdf: "https://"`까지만 입력하면 전체 검사 결과가 `TypeError: Invalid URL`로 끝난다. 파일·필드·한국어 수정 안내가 사라지고 다른 콘텐츠 문제 수집도 중단된다. | URL 파싱 실패를 일반 검증 실패로 반환한다. 유효한 URL에서만 확장자를 확인하고 `content/bulletins/… → pdf`에 오류를 붙인다. |
| 중간 4. 본문 이미지가 작성 규칙을 우회 | `src/lib/content/load.ts:157`, `src/components/ui/Markdown.tsx:61`, `src/lib/media.ts:52` · 요청 ③ | 머리말 사진에서는 거절되는 HTTP 주소를 소식 본문에 넣으면 전체 검사가 성공한다. 렌더러는 해당 문자열을 `/media/http%3A//…`로 바꾼다. 직원은 빌드 성공을 보고 게시하지만 사진 주소가 틀린다. | 표시할 Markdown 본문의 이미지 목적지도 파싱해 공통 경로 규칙을 적용한다. 잘못된 사진은 원본 파일과 본문 위치를 알려 준다. |
| 중간 5. 잘못된 자리표시가 방문자 문구로 노출 | `src/lib/content/pages.ts:275`, `src/lib/content/pages.ts:286`, `src/lib/content/lists.ts:43` · 요청 ③④ | 홈 제목의 `안내 {{name}`은 괄호째 남았다. 교통편 조회는 일반 객체에서 상속된 이름까지 읽어 등록하지 않은 교통편이 함수 문자열로 바뀌었다. 두 경우 모두 페이지 로더가 성공했다. | 닫히지 않은 자리표시를 파일·필드 오류로 처리한다. 교통편은 등록된 고유 키만 조회하도록 Map 또는 자체 속성 검사를 쓴다. |
| 낮음 6. 목록 문구의 자리표시 안내 불일치 | `content/README.md:62`, `content/pages/lists.yaml:7`, `src/lib/content/lists.ts:47` · 요청 ③④ | 통합 안내는 표의 자리표시를 `pages/*.yaml`에서 쓸 수 있다고 한다. 안내대로 목록의 소식 소개에 도로명 자리표시를 넣으면 ‘목록 문구에는 {{name}}만 쓸 수 있습니다’로 빌드 검증이 실패한다. | 통합 안내에 목록 파일의 예외를 명시하거나 목록에서도 공통 치환기를 사용한다. |
| 낮음 7. 추가한 페이지 YAML의 조용한 누락 | `src/lib/content/validate.ts:23`, `src/lib/content/pages.ts:339`, `content/README.md:14` · 요청 ③ | 전체 검사는 등록된 getter만 순회한다. `content/pages/extra.yaml`을 추가해 유효하지 않은 페이지 필드를 적어도 검사가 성공했다. 직원이 기존 파일의 복사본을 편집하면 게시 내용도 경고도 달라지지 않는다. | 페이지 폴더의 실제 YAML 파일명과 지원하는 파일명을 대조하고, 예상 밖 파일에는 경로와 편집할 파일을 안내한다. |
| 낮음 8. 소식 사진 오타에 수정할 필드가 안 나옴 | `src/lib/content/schema.ts:229`, `src/lib/content/load.ts:29` · 요청 ③ | 객체 형식의 사진에서 `src`를 `scr`로 쓰면 `images.0: 잘못된 입력`만 반환한다. 필드 누락·오타의 구체적인 사유가 문자열·객체 합집합 오류 안에 묻힌다. | 문자열 경로를 먼저 객체로 정규화한 뒤 한 객체 스키마로 검사하거나, 객체 입력에 해당하는 하위 오류를 파일·필드와 함께 표시한다. |
| 낮음 9. 페이지 위치가 붙은 주보 보관소 키 | `src/lib/media.ts:37`, `src/lib/media.ts:55`, `src/app/news/bulletin/[id]/page.tsx:33` · 요청 ③ | `bulletins/file.pdf#page=2`는 PDF 검사를 통과하지만 실제 URL은 `/media/bulletins/file.pdf%23page%3D2`가 된다. 방문자는 원본 PDF의 2페이지 대신 다른 이름의 파일을 요청한다. | 보관소 키에서 쿼리·프래그먼트를 거부해 작성법을 알려 주거나, 파일 경로만 인코딩한 뒤 쿼리·프래그먼트를 다시 붙인다. |

## ③ 미확인

- **기본 프로덕션 빌드와 CI**. 기본 `next build`는 격리 환경에서 Google Fonts의 Noto Serif KR를 받지 못해 완료되지 않았다. 같은 제품 소스에 로컬 글꼴 응답을 제공한 Webpack 빌드는 정적 생성 35/35를 완료했다. TypeScript와 제품 소스·Next 설정 ESLint도 종료 코드 0이었다. GitHub Actions의 해당 커밋 실행 결과는 미확인이다.
- **브라우저와 배포 환경**. 브라우저 판정은 `HANDOFF.md:62`의 기존 확인 기록을 대조했다. 이번 검토에서 직접 확인한 것은 생성 HTML, 이미지 URL, 콘텐츠 로더, 폼 핸들러까지다. R2 실물·과금, 메일 실발송, 운영 함수·DNS, 기기별 화면과 Lighthouse는 미확인이다. 두 API의 로컬 빌드 추적 목록에는 필요한 `site.yaml`, `pages/contact.yaml`, `pages/location.yaml`이 포함됐다(`next.config.ts:12`).
- **샘플과 공개 이력**. 샘플 설교에 설교자 이름이 남아 있고 `HANDOFF.md:56`은 이 파일들을 이전 때 교체할 샘플로 명시한다. 해당 설교의 실제 설교자·공개 승인, 저장소 전체 이력의 비밀값 유무는 미확인이다.

고칠 것 있음
