판정: 고칠 것 있음

## ① 지난 지적 재판정

검토 범위는 `0b40fe1..f04a974`다. 현재 HEAD `00b2b55`와 수정 끝점의 추적 파일 차이는 6차 요청서 한 개다. 아래 번호는 5차 결과의 절과 행을 가리킨다.

| 지적 | 판정 | 근거 |
|---|---|---|
| ① 1. 본문 사진 경로 검사 | 고쳐짐 | `src/lib/content/load.ts:67`, `src/lib/content/load.ts:232`. 실제 U+0000이 든 본문 사진과 참조 정의를 각각 거부했다. LF 파일에서는 문제가 있는 5번째 줄과 7번째 줄을 정확히 짚었다. |
| ① 2. 머리말·본문 사진의 공백 안내 | 고쳐짐 | `src/lib/content/schema.ts:140`, `src/lib/content/body.ts:53`, `src/lib/media.ts:37`. 앞뒤 공백을 포함한 경로를 YAML 따옴표와 Markdown의 꺾쇠 안에 각각 넣었다. 두 위치 모두 U+0020과 공백을 지우라는 안내가 나왔다. |
| ① 3. 설치 시 기존 Git 훅 비활성화 | 고쳐짐 | `scripts/setup-hooks.mjs:37`, `scripts/setup-hooks.mjs:50`. 명시한 `team-hooks`를 보존했다. 목록 읽기가 금지된 기본 폴더에서도 설치 전후 같은 훅이 실행됐다. |
| ① 4. Git 기본 폴더의 활성 훅 보존 | 고쳐짐 | `scripts/setup-hooks.mjs:48`, `scripts/setup-hooks.mjs:52`. 폴더를 통과할 수 있지만 목록을 읽을 수 없는 조건에서 설치가 EACCES를 알렸고 `core.hooksPath`는 미설정 상태로 남았다. |
| ① 5. 페이지 사진의 자리표시 | 고쳐짐 | `src/lib/content/pages.ts:34`, `src/lib/media.ts:40`. 홈 슬라이드에 `news/{{vision}}.webp`를 넣자 `hero.slides.0.image`에서 실제 파일 이름을 적으라고 안내했다. |
| ① 6. 머리말 사진의 앞뒤 공백 | 고쳐짐 | `src/lib/content/schema.ts:139`, `src/lib/content/schema.ts:239`. 따옴표로 보존한 앞뒤 공백이 `images.0.src` 오류로 나왔다. |
| ① 7. 눈에 보이지 않는 문자가 든 파일명 | 고쳐짐 | `src/lib/content/load.ts:67`, `src/lib/media.ts:34`. 머리말과 본문의 실제 U+0000을 파싱 전에 거부했다. 머리말의 U+200B와 본문의 U+0085도 각각 코드값을 표시했다. |
| ① 8. 한 파일의 읽기 오류가 다른 오류를 가림 | 고쳐짐 | `src/lib/content/load.ts:47`, `src/lib/content/load.ts:235`, `src/lib/content/load.ts:251`. 같은 소식 폴더의 2월 30일 오류와 다른 파일의 EACCES·권한 복구 안내가 한 번에 나왔다. |
| ② 중간 1. 기존 훅 연결 시 작업 사본만 검사 | 고쳐짐 | `scripts/setup-hooks.mjs:19`, `README.md:31`, `.githooks/pre-commit:34`. 안내대로 연결한 실행 가능 훅은 스테이징한 2월 30일을 작업 사본에서만 28일로 고쳤을 때 종료 코드 1, 수정본도 스테이징했을 때 0을 반환했다. 공용 훅에서의 영향은 아래 중간 1에 적었다. |
| ② 중간 2. 읽지 못한 훅 폴더를 빈 폴더로 처리 | 고쳐짐 | `scripts/setup-hooks.mjs:50`, `scripts/setup-hooks.mjs:54`. 목록 조회가 EACCES로 실패하면 권한 확인을 안내하고 종료했다. 샘플만 있는 기본 폴더에서는 정상적으로 `.githooks`를 설정했다. |
| ② 낮음 3. 본문 U+0000이 대체문자로 바뀌어 통과 | 고쳐짐 | `src/lib/content/load.ts:61`, `src/lib/content/load.ts:67`, `src/lib/content/load.ts:232`. 인라인 사진과 참조 사진 모두 원문 U+0000에서 검사에 실패했다. CR 단독 줄바꿈의 오류 위치는 아래 낮음 2에 적었다. |
| ② 낮음 4. 보조 파일만 있을 때 연결할 훅이 없음 | 고쳐짐 | `scripts/setup-hooks.mjs:19`, `scripts/setup-hooks.mjs:57`. 실행 권한 없는 일반 보조 파일만 둔 경우에도 설정을 보존하고, 만들 `pre-commit` 경로와 실행 권한을 안내했다. 보조 파일을 보존하는 것은 6차에서 정한 설계다. |

## ② 새 지적

| 심각도 · 항목 | 파일:줄 · 기준 | 무엇이 틀렸나 · 실패 장면 | 고치는 방향 |
|---|---|---|---|
| 중간 1. 공용 훅에 연결하면 다른 저장소의 커밋도 막힘 | `scripts/setup-hooks.mjs:19`, `scripts/setup-hooks.mjs:39`, `README.md:31` · 요청 ⑥ | 두 임시 저장소가 같은 전역 훅 폴더를 쓰게 했다. 공용 훅에 안내된 한 줄을 추가하자 다른 저장소의 `git hook run pre-commit`이 0에서 1로 바뀌었다. 그 저장소 안에도 교회 사이트용 `.githooks/pre-commit`이 있다고 가정해 파일을 찾지 못했다. | 공유 폴더에 넣는 예시는 이 저장소에서만 콘텐츠 훅을 호출하도록 범위를 한정한다. 다른 저장소에서는 원래 훅이 계속 실행되고, 이 저장소에서는 검사 실패가 그대로 전달되는지 함께 확인한다. |
| 중간 2. 이미 연결된 훅에 자기 자신을 호출하라고 안내 | `scripts/setup-hooks.mjs:38`, `scripts/setup-hooks.mjs:59`, `scripts/setup-hooks.mjs:19` · 요청 ⑥ | 기본 `.git/hooks/pre-commit`이 제품 훅의 심볼릭 링크인 경우와, 설정한 훅 폴더가 `.githooks`의 심볼릭 링크인 경우를 확인했다. 두 경우 모두 안내가 편집하라는 파일과 호출하라는 파일이 실제로 같은 파일이었다. 안내대로 수정하면 추적 중인 제품 훅에 자기 호출을 넣게 된다. | 안내를 내기 전에 기존 `pre-commit`과 제품 훅이 같은 실제 파일인지 확인한다. 이미 연결돼 있으면 추가 편집이 필요 없다고 알린다. |
| 중간 3. 실행 권한 없는 기존 훅에서는 스테이징 검사가 생략됨 | `scripts/setup-hooks.mjs:19`, `scripts/setup-hooks.mjs:57`, `README.md:31` · 요청 ③·⑥ | 기본 폴더에 실행 권한 없는 `pre-commit`(0644)이 있으면 설치를 보류한다. 안내는 새 파일을 만들 때만 실행 권한을 언급한다. 기존 파일에 안내된 줄을 넣고 잘못된 날짜를 스테이징하자 `git hook run --ignore-missing pre-commit`은 실행 권한 경고만 내고 0으로 끝났다. 콘텐츠 검사는 실행되지 않았다. | 기존 파일에도 실행 권한이 있는지 확인하도록 안내한다. 직원이 내용을 검토하고 훅을 활성화한 뒤, 실제 Git 호출에서 스테이징 오류가 검출되는지 확인하게 한다. |
| 낮음 1. `.DS_Store`만 있을 때 보존 규칙과 다르게 설정을 변경 | `scripts/setup-hooks.mjs:57`, `README.md:31`, `docs/reviews/2026-11-27-refactor-request-6.md:23` | 기본 훅 폴더에 샘플 외 파일로 `.DS_Store`만 추가하자 아무 안내 없이 `core.hooksPath=.githooks`가 설정됐다. 요청서와 README에서 명시한 유일한 예외는 `.sample`이다. | 훅 폴더의 보존 여부를 판단하는 필터에서 `.DS_Store` 예외를 제거한다. |
| 낮음 2. CR 단독 줄바꿈 파일에서 U+0000 위치를 잘못 안내 | `src/lib/content/load.ts:69`, `src/lib/content/load.ts:115` · 요청 ③ | CR로 줄을 나눈 소식 파일의 5번째 줄에 U+0000을 넣자 “1번째 줄”을 다시 입력하라고 했다. 본문 파서는 CR도 줄바꿈으로 지원하지만 새 오류 위치 계산은 LF만 센다. | 줄 번호를 계산할 때 CRLF·CR·LF를 본문 파서와 같은 기준으로 센다. |
| 낮음 3. 훅을 비활성화한 설정에서 만들 수 없는 경로를 안내 | `scripts/setup-hooks.mjs:19`, `scripts/setup-hooks.mjs:39` · 요청 ⑥ | `core.hooksPath=/dev/null`인 임시 저장소에서 설치 안내가 `/dev/null/pre-commit`을 만들라고 했다. 해당 경로 아래에는 파일을 만들 수 없다. | 훅 비활성화 설정을 알아보고 현재 상태를 설명한다. 직원이 이 저장소에서 훅을 켜기로 한 경우에 사용할 로컬 설정 방법을 안내한다. |

## ③ 미확인

원본 콘텐츠의 임시 사본 검사, TypeScript 검사, 변경된 TS·MJS 파일의 ESLint는 통과했다. 오류 입력과 훅 동작은 임시 사본·저장소에서 실행한 뒤 정리했다. 자기 호출 항목은 두 경로가 같은 파일임을 확인하는 데까지 검증했다. 실제 커밋, 전체 Next.js 빌드, 브라우저 화면과 운영 배포는 미확인이다.

고칠 것 있음
