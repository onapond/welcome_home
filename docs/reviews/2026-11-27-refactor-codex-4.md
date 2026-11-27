판정: 고칠 것 있음

## ① 지난 지적 재판정

검토 범위는 `605d16c..256af9e`다. 현재 HEAD `29b8401`과 수정 끝점의 추적 파일 차이는 4차 요청서 한 개다. 3차 표 ①에서 남은 4행과 표 ②의 7행을 원래 번호로 표시했다.

| 지난 지적 | 판정 | 근거 |
|---|---|---|
| ① Codex 8. 잘못된 자리표시와 교통편 | 고쳐짐 | `src/lib/content/tokens.ts:93`, `src/lib/content/tokens.ts:112`. 임시 홈 제목의 미등록 교통편과 닫는 괄호 누락을 각각 검사했다. 둘 다 `content/pages/home.yaml → hero.headline`과 수정할 내용을 표시했다. |
| ① Codex 10. 주보 PDF 미리보기 출처 | 고쳐짐 | `src/lib/media.ts:110`, `src/app/news/bulletin/[id]/page.tsx:55`. 정적 생성한 주보 4개 중 보관소 키와 사이트 경로에는 링크와 iframe이 있었다. 보관소와 같은 호스트의 HTTPS 주소와 다른 호스트의 HTTPS 주소에는 링크만 있었다. |
| ① ② 4. 본문 사진의 경로 검사 | 덜 고쳐짐 | `src/lib/content/body.ts:23`, `src/lib/content/body.ts:26`, `src/lib/content/schema.ts:137`. 퍼센트를 직접 쓴 사진은 본문과 머리말 모두 거절했다. 같은 경로의 앞뒤 공백은 서로 다르게 처리하며, 사진 설명에 강조가 들어가면 잘못 쓴 경로를 놓친다(아래 3·5). |
| ① ② 5. 잘못된 자리표시 노출 | 고쳐짐 | `src/lib/content/tokens.ts:112`, `src/lib/content/tokens.ts:127`. 홈 제목에 넣은 `{{{name}}}`, `{{name}}}`, `{{name}`가 모두 파일·필드 및 올바른 예시와 함께 거절됐다. 일반 괄호와 연속된 정상 토큰을 함께 쓴 문장은 통과했다. |
| ② 1. URL 해석과 주보 소유 여부의 불일치 | 고쳐짐 | `src/lib/media.ts:31`, `src/lib/media.ts:111`, `src/app/news/bulletin/[id]/page.tsx:36`. 내부 탭을 거절하고, 검증된 PDF의 임베드 판단에서 HTTPS 주소를 모두 제외한다. 생성 HTML에서도 확인했다. |
| ② 2. 기존 미디어 주소 제한 | 고쳐짐 | `src/lib/media.ts:44`, `content/README.md:94`. 이번 요청에서 정한 설계와 구현·직원 안내가 일치한다. 사이트 경로의 PDF 페이지 번호나 보관소 키의 퍼센트를 거절하는 동작은 회귀로 집계하지 않았다. |
| ② 3. 머리말·본문 사진 검사와 공백 안내 | 덜 고쳐짐 | `content/README.md:95`, `src/lib/content/body.ts:48`, `src/lib/content/schema.ts:43`. 공백을 하이픈으로 바꾸라는 안내가 생겼고, 일반 본문 사진의 내부 공백과 명시적 `%20`을 거절했다. 머리말의 앞뒤 공백과 일부 Markdown 문법은 아래 3·5처럼 남았다. |
| ② 4. 방문자 제목에 남는 여분의 괄호 | 고쳐짐 | `src/lib/content/tokens.ts:112`. 홈 제목의 삼중 괄호에서 검사 종료 코드 1과 `{{name}}` 예시를 확인했다. |
| ② 5. 설치 시 기존 Git 훅 비활성화 | 덜 고쳐짐 | `scripts/setup-hooks.mjs:22`, `scripts/setup-hooks.mjs:29`, `scripts/setup-hooks.mjs:35`. 명시적으로 설정한 `team-hooks`는 보존했고 연결 안내도 출력했다. Git 기본 폴더에 설치한 활성 훅은 안내 없이 비활성화됐다(아래 1). |
| ② 6. 파일 종류만 바뀐 커밋의 검사 누락 | 고쳐짐 | `.githooks/pre-commit:18`, `.githooks/pre-commit:22`. 실제 커밋 없이 임시 인덱스에 종류 변경(`T`) 한 건만 두었다. 훅은 해당 파일 경로와 함께 종료 코드 1을 반환했다. Git 변경 조회 실패도 별도의 한국어 오류로 중단했다. |
| ② 7. 페이지 폴더 오류가 다른 오류를 가림 | 고쳐짐 | `src/lib/content/load.ts:31`, `src/lib/content/validate.ts:28`, `src/lib/content/validate.ts:79`. 임시 사본에서 `content/pages`를 일반 파일로 바꿨을 때 폴더 복구 안내와 소식 사진의 머리말·본문 오류가 한 번에 출력됐다. |

## ② 새 지적 및 남은 실패 장면

| 심각도 · 항목 | 파일:줄 · 기준 | 무엇이 틀렸나 · 실패 장면 | 고치는 방향 |
|---|---|---|---|
| 중간 1. Git 기본 폴더에 설치한 훅이 조용히 꺼짐 | `scripts/setup-hooks.mjs:22`, `scripts/setup-hooks.mjs:27`, `README.md:31` · 요청 ⑥ | 임시 저장소에 실행 가능한 `.git/hooks/pre-commit`을 두고 설치 스크립트를 실행했다. Git이 돌려준 훅 경로가 `.git/hooks/pre-commit`에서 `.githooks/pre-commit`으로 바뀌었고 설치 안내는 없었다. 독자적인 검사를 기본 폴더에 둔 팀은 다음 커밋부터 그 검사를 잃는다. | 경로 설정이 비었어도 Git이 현재 사용하는 훅 폴더에 활성 훅이 있는지 확인한다. 있으면 경로를 보존하고 기존 훅에 콘텐츠 검사를 연결하는 방법을 안내한다. |
| 중간 2. 페이지 사진은 자리표시 치환 뒤 경로 검사를 받지 않음 | `src/lib/content/pages.ts:34`, `src/lib/content/pages.ts:203`, `src/lib/content/pages.ts:205`, `src/lib/media.ts:31` · 요청 ③, 규칙 ⑤ | 임시 홈 슬라이드에 `news/{{vision}}.webp`를 넣었다. 전체 검사는 0으로 끝났고 페이지 로더는 `news/21세기 지도자를 길러내는 교회.webp`를 반환했다. 같은 완성 경로를 현재 경로 검사기에 주면 공백 오류가 난다. 직원이 문서의 규칙대로 하이픈을 써서 올린 사진과 화면이 요청할 파일명이 달라진다. | 자리표시를 치환한 결과의 미디어 필드에도 같은 경로 검사를 적용한다. 오류에 원래 페이지 파일, 슬라이드의 필드 위치와 치환된 경로를 표시한다. |
| 낮음 3. 머리말에서만 사진 이름의 앞뒤 공백을 지움 | `src/lib/content/schema.ts:43`, `src/lib/content/schema.ts:137`, `src/lib/content/body.ts:53`, `content/README.md:97` · 요청 ③ | 따옴표 안의 파일명을 `" news/예배.webp "`로 적은 소식 머리말은 전체 검사를 통과했다. 동일한 문자열을 본문의 꺾쇠 목적지에 적으면 공백 오류가 났다. 머리말에 붙여 넣은 공백은 직원에게 알려주지 않는다. | 미디어 필드는 앞뒤 공백을 지우기 전 원문에 경로 검사를 적용한다. |
| 낮음 4. 일부 제어문자를 파일명으로 허용함 | `src/lib/media.ts:31`, `src/lib/content/body.ts:53` · 요청 ③ | 줄바꿈 제어문자 U+0085가 ‘주일’과 ‘예배’ 사이에 있는 키를 머리말 스키마와 본문 검사기가 모두 허용했다. 눈으로는 알아보기 어려운 문자가 보관소 키에 남는다. 현재 식은 ASCII 제어문자와 공백만 잡는다. | Unicode 제어문자 범주 전체와 공백을 검사하고, 보이지 않는 글자는 오류에서 코드값으로 표시한다. |
| 낮음 5. Markdown 사진 오타와 의도한 예문을 거꾸로 분류함 | `src/lib/content/body.ts:9`, `src/lib/content/body.ts:25`, `src/lib/content/body.ts:54` · 요청 ③, 규칙 ⑤ | `![**예배**](news/주일 예배.webp)`는 전체 검사를 통과했다. 렌더링하면 강조된 글자와 경로만 남고 사진은 없다. 반대로 느낌표를 이스케이프한 예문 `\![설명](news/주일 예배.webp)`는 전체 검사를 막았다. 검사가 문법 기호를 처리한 뒤의 텍스트 노드를 하나씩 보기 때문이다. | 파서가 준 원문 위치를 이용해 문단 안의 사진 표현을 확인한다. 인라인 강조로 나뉜 설명과 명시적으로 이스케이프한 느낌표를 구별한다. |
| 낮음 6. 같은 폴더의 읽기 오류가 먼저 찾은 오류를 가림 | `src/lib/content/load.ts:189`, `src/lib/content/load.ts:191`, `src/lib/content/load.ts:208`, `src/lib/content/validate.ts:75` · 요청 ③ | 임시 소식 폴더에 날짜가 2월 30일인 파일과, 그 뒤에 정렬되는 읽기 권한 없는 파일을 두었다. 검사는 뒤 파일의 `EACCES` 한 건만 출력했다. 앞 파일의 날짜 오류는 권한을 고친 다음에야 볼 수 있다. 권한 오류 안내도 파일 위치만 확인하라고 한다. | 파일을 읽는 위치에서 오류를 경로와 함께 수집하고 다음 항목을 계속 검사한다. `EACCES`에는 읽기 권한을 확인하라는 안내를 붙인다. |

## ③ 미확인

- 원본 콘텐츠 검사, TypeScript 검사, 변경된 TypeScript·JavaScript 파일의 ESLint는 통과했다. 임시 사본에서 글꼴 응답을 시험값으로 대체한 `next build --webpack`은 정적 페이지 40/40을 생성했다. 주보의 링크·iframe과 소식 머리말·본문의 동일한 한글 사진 URL을 생성 HTML에서 확인했다.
- 실제 브라우저 화면과 PDF 열기·내려받기는 미확인이다(규칙 ⑯). 로컬 헤드리스 Chromium이 페이지를 열기 전에 종료됐고, 내장 브라우저는 셸의 임시 HTML을 열 수 없다. 기본 Turbopack 빌드, 실제 글꼴, R2 파일 응답, 운영 배포는 이번 확인 범위에 포함하지 않았다.

고칠 것 있음
