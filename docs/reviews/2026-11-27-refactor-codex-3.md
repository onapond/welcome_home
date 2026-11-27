판정: 고칠 것 있음

## ① 지난 지적 재판정

수정 범위는 `436839f..3cf428a`다. 검토한 HEAD `84d3f85`와 수정 끝점의 추적 파일 차이는 이번 요청서 한 개다. 지난 결과의 ‘덜 고쳐짐’ 6건과 ‘새 지적’ 9건 중 11건은 고쳐졌고 4건은 덜 고쳐졌다. 두 표에 겹쳐 있던 지적은 원래 번호를 유지했다.

| 지난 지적 | 판정 | 근거 |
|---|---|---|
| ① Codex 2. 공개 동의 없는 교역자 연락처의 커밋 전 검사 | 고쳐짐 | `.githooks/pre-commit:13`, `.githooks/pre-commit:15`, `src/lib/content/schema.ts:333`. 임시 인덱스에 공개 표시 없는 시험용 이메일을 올리고 작업 파일에서 지웠을 때 훅이 `content/staff.yaml → 0.email`과 함께 종료 코드 1을 반환했다. 인덱스만 정상이고 작업 파일만 잘못된 반대 경우는 0이었다. 훅 설치와 변경 감지의 별도 문제는 아래에 적었다. |
| ① Codex 8. 잘못된 자리표시와 위치 문구 | 덜 고쳐짐 | `src/lib/content/tokens.ts:93`, `src/lib/content/tokens.ts:108`. 닫는 괄호가 빠진 홈 제목과 등록하지 않은 교통편은 각각 파일·필드 오류가 됐다. 여분의 괄호가 치환 결과에 남는 경우가 있다(② 4). |
| ① Codex 10. 주보 PDF의 임베드 출처 | 덜 고쳐짐 | `src/lib/media.ts:110`, `src/app/news/bulletin/[id]/page.tsx:55`. 생성 HTML에서 일반 외부 PDF에는 링크만, 보관소 키에는 링크와 iframe이 있었다. 다만 소유 여부를 원문 문자열로 판단해 최종 URL의 출처와 다르게 분류할 수 있다(② 1). |
| ① Codex 15. 지도 버튼과 방문자 안내문 하드코딩 | 고쳐짐 | `content/pages/location.yaml:10`, `src/components/sections/LocationSection.tsx:13`, `src/components/sections/LocationSection.tsx:58`. 직원이 네이버 지도 버튼, 길찾기 제목과 본문을 같은 YAML에서 고칠 수 있고 화면은 세 값을 읽는다. |
| ① Codex 18. sitemap 수정일과 푸터 연도 | 고쳐짐 | `src/app/sitemap.ts:33`, `src/app/sitemap.ts:39`, `src/components/layout/Footer.tsx:16`. 목록·상세를 포함한 생성 sitemap 전체에 `lastmod`가 없었다. 푸터의 첫 렌더링은 기존과 같이 빌드 연도를 사용한다. |
| ① 대립 3. 본문 사진의 보관소 키 | 고쳐짐 | `src/components/ui/Markdown.tsx:67`, `src/lib/media.ts:101`. 같은 소식의 머리말과 본문에 넣은 `news/예배.webp`가 생성 HTML에서 같은 보관소 URL을 가리켰다. |
| ② 1. 한글 사진명 이중 인코딩 | 고쳐짐 | `src/lib/media.ts:81`, `src/lib/media.ts:94`. 두 이미지 모두 경로가 `/news/%EC%98%88%EB%B0%B0.webp`였다. |
| ② 2. 배포 전에 연 방문 신청서의 ‘5명 이상’ | 고쳐짐 | `src/lib/forms.ts:155`, `src/app/api/visit/route.ts:74`. 같은 신청서로 로컬 POST 핸들러를 호출했다. 이전 값 `5명 이상`과 현재 값 `5+`는 인원 검사를 지나 메일 미설정 응답 503에 도달했고, 선택지에 없는 `9`는 400이었다. |
| ② 3. 불완전한 주보 주소가 다른 오류를 가림 | 고쳐짐 | `src/lib/media.ts:30`, `src/lib/content/schema.ts:138`, `src/lib/content/validate.ts:66`. `pdf: "https://"`는 주보 파일과 `pdf` 필드, 주소 전체를 붙이라는 안내로 보고됐다. 같은 검사에서 소식·다른 주보·페이지 파일의 오류도 모두 나왔다. |
| ② 4. 본문 사진의 경로 검사 | 덜 고쳐짐 | `src/lib/content/body.ts:27`, `src/lib/content/load.ts:178`. 본문 HTTP 사진은 파일과 사진 순번을 붙여 거절했다. 직원이 직접 입력한 퍼센트 인코딩은 머리말과 본문에서 검사 결과가 다르다(② 3). |
| ② 5. 잘못된 자리표시 노출 | 덜 고쳐짐 | `src/lib/content/tokens.ts:93`, `src/lib/content/tokens.ts:112`. 기존 두 실패 사례는 각각 `hero.headline`과 `news.intro`를 지목했다. 삼중 괄호는 페이지 로더가 그대로 통과시킨다(② 4). |
| ② 6. 목록 문구의 자리표시 안내 | 고쳐짐 | `content/README.md:66`, `src/lib/content/lists.ts:51`. 임시 `lists.yaml`의 소식 소개에 `{{address.road}}`를 넣어 전체 검사를 통과했고, 생성된 소식 목록 HTML에서 도로명 치환을 확인했다. |
| ② 7. 추가 페이지 YAML의 조용한 누락 | 고쳐짐 | `src/lib/content/validate.ts:26`, `src/lib/content/validate.ts:35`. 추가한 `content/pages/extra.yaml`의 경로와 실제로 편집할 수 있는 파일 8개가 함께 표시됐고 검사가 실패했다. |
| ② 8. 소식 사진 필드 오타 | 고쳐짐 | `src/lib/content/schema.ts:234`, `src/lib/content/load.ts:30`. 사진 객체의 `scr` 오타에서 `images.0.src: 필수 항목이 없습니다`와 `알 수 없는 항목 'scr'`가 함께 나왔다. |
| ② 9. 보관소 키에 붙은 PDF 페이지 번호 | 고쳐짐 | `src/lib/media.ts:39`, `src/lib/content/schema.ts:143`. `bulletins/file.pdf#page=2`를 `pdf` 오류로 거절하고 파일 경로만 적으라고 안내했다. 같은 제한이 기존 사이트 내부 URL에도 적용되는 회귀는 ② 2에 적었다. |

## ② 새 지적

| 심각도 · 항목 | 파일:줄 · 기준 | 무엇이 틀렸나 · 실패 장면 | 고치는 방향 |
|---|---|---|---|
| 중간 1. 주보 소유 여부와 브라우저의 URL 해석이 다름 | `src/lib/media.ts:28`, `src/lib/media.ts:79`, `src/lib/media.ts:110`, `src/app/news/bulletin/[id]/page.tsx:36` · 요청 ③⑥ | 로컬 경로 판별과 iframe 허용 여부를 원문 접두사로 정한다. 코드상 내부 제어문자가 섞인 사이트 경로는 검증을 통과하고 원문 그대로 iframe에 들어갈 수 있다. 브라우저가 제어문자를 제거하면 다른 출처를 가리킬 수 있다. 반대 방향의 오판도 로컬 함수에서 확인했다. 같은 HTTPS 보관소의 표준 포트 443을 명시한 PDF는 정규화한 origin이 같은데도 미리보기에서 제외됐다. | 제어문자를 입력 단계에서 거절한다. 실제 렌더링할 URL을 사이트 기준으로 해석한 뒤 사이트·보관소의 정규화된 origin을 비교한다. 보관소 기본 주소에 하위 경로가 있으면 정규화한 경로 경계도 확인한다. |
| 중간 2. 정상적으로 열리던 기존 미디어 주소가 빌드를 막음 | `src/lib/media.ts:39`, `src/lib/media.ts:42`, `src/lib/media.ts:79` · 요청 ③ | 수정 전후 함수를 같은 입력으로 비교했다. 사이트 내부 주소 `/docs/november.pdf#page=2`는 이전에 페이지 번호를 보존했다. 보관소의 실제 파일명 `news/100%.webp`도 이전에 `100%25.webp`로 정확히 변환됐다. 새 검사는 둘 다 거절한다. 해당 파일을 쓰던 직원은 무관한 소식을 편집해도 전체 콘텐츠 검사에서 막힌다. | 사이트 URL의 검색·페이지 위치와 원시 보관소 파일명을 구분한다. 내부 PDF의 프래그먼트는 보존하고 원시 키에 포함된 문자 그대로의 퍼센트는 한 번만 인코딩한다. |
| 낮음 3. 같은 경로의 본문·머리말 검사 결과와 공백 작성 안내가 다름 | `src/lib/content/body.ts:14`, `src/lib/content/body.ts:28`, `content/README.md:95` · 요청 ③, 규칙 ⑤ | `news/예배%20안내.webp`는 머리말에서 거절하지만 본문은 디코딩 뒤 검사해 통과시킨다. 반대로 안내대로 공백을 그대로 넣은 `![주일](news/주일 예배.webp)`도 검사에 통과했지만 렌더링 결과는 사진 없이 입력 문장만 있는 단락이었다. | 원본 Markdown의 이미지 목적지에서 작성 규칙을 검사하고 렌더링용 인코딩은 한 번만 한다. 공백이 든 이름은 실제로 사진이 생성된 `![주일](<news/주일 예배.webp>)` 형태로 직원 안내에 예시를 둔다. |
| 낮음 4. 여분의 괄호가 방문자 제목에 남음 | `src/lib/content/tokens.ts:102`, `src/lib/content/tokens.ts:108` · 요청 ③④ | 홈의 `hero.headline`에 `{{{name}}}`를 적었더니 로더가 `{청파중앙교회}`를 반환했다. 완성된 토큰을 먼저 지운 뒤 남은 **두 개 연속** 괄호만 검사해서 바로 붙은 여분 한 개를 놓친다. | 토큰 양끝에 연속된 괄호 수를 확인하고, 형식이 어긋나면 해당 파일·필드와 `{{name}}` 예시를 표시한다. 일반 문장에서 쓰는 단일 괄호는 허용한다. |
| 중간 5. 설치할 때 기존 Git 훅 경로를 덮어씀 | `package.json:11`, `README.md:31` · 요청 ⑥ | 기존 훅 경로가 `team-hooks`인 임시 저장소에서 실제 `npm run prepare`를 실행했다. 종료 코드 0과 함께 설정이 `.githooks`로 바뀌었다. 이후 Git은 종전의 팀 훅을 찾지 않으며, 새 폴더에는 콘텐츠용 pre-commit만 있다. | 기존 훅 설정을 먼저 확인한다. 기존 경로를 사용하는 저장소에서는 그 체인에 콘텐츠 검사를 연결하고, 연결하지 못한 경우 설치 결과와 필요한 조치를 알린다. |
| 중간 6. 콘텐츠 파일 종류만 바뀐 커밋은 검사 대상에서 빠짐 | `.githooks/pre-commit:7`, `.githooks/pre-commit:13` · 요청 ③⑥ | 변경 감지 필터에 Git의 파일 종류 변경(`T`)이 없다. 콘텐츠의 일반 파일이 심볼릭 링크로 바뀌는 변경만 있으면 스테이징 검사를 호출하지 않고 훅이 성공한다. 변경 조회 자체가 실패해도 현재 파이프라인은 검사할 파일이 없을 때와 같은 분기로 간다. 코드 대조로 확인했다. | `content/`의 모든 스테이징 변경을 확인하고, 변경 없음과 Git 오류의 종료 상태를 구분한다. 스테이징된 콘텐츠 파일의 종류도 검증한다. |
| 낮음 7. 페이지 폴더가 파일로 바뀌면 다른 콘텐츠 오류까지 사라짐 | `src/lib/content/validate.ts:28`, `src/lib/content/validate.ts:30`, `src/lib/content/validate.ts:66` · 요청 ③ | 임시 사본에서 `content/pages`를 일반 파일로 바꾸고 소식 사진에도 오류를 뒀다. 전체 검사가 `ENOTDIR: not a directory, scandir`와 호출 스택으로 끝났고, 먼저 수집한 사진 오류와 직원용 수정 안내가 출력되지 않았다. | 디렉터리 여부를 확인하고 파일 종류가 다르면 `content/pages 폴더를 복구해 주세요`라는 `ContentError`로 수집한다. 다른 파일의 오류도 함께 출력한다. |

## ③ 미확인

- **빌드와 화면.** 임시 콘텐츠 3건을 더하고 Google Fonts 응답을 로컬 시험값으로 대체한 `next build --webpack`에서 TypeScript 검사와 정적 생성 38/38이 완료됐다. 사진 주소·주보 링크와 iframe·목록 문구·sitemap은 생성 파일에서 확인했다. 기본 Turbopack 빌드, 실제 글꼴·PDF가 보이는 브라우저 화면, 이번 주보 분기의 규칙 ⑯ 확인 기록은 미확인이다. `HANDOFF.md:62`는 이전 수정의 화면 기록이다.
- **운영 환경.** 실제 R2 객체·사용량, 외부 PDF 서버의 응답·리디렉션, 메일 발송, GitHub Actions와 배포 결과는 미확인이다. 연락처 훅 검증에는 가상 명단과 임시 Git 인덱스를 사용했다.

고칠 것 있음
