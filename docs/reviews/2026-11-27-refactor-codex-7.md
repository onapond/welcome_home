판정: 고칠 것 있음

## ① 지난 지적 재판정

검토 범위는 `a78935a..545ad4d`다. 현재 HEAD `892696e`과 수정 끝점의 추적 파일 차이는 7차 요청서 한 개다. 아래 번호는 6차 결과의 절과 항목을 따른다.

| 지적 | 판정 | 근거 |
|---|---|---|
| ① 1. 본문 사진 경로 검사 | 고쳐짐 | `src/lib/content/load.ts:67`, `src/lib/content/load.ts:233`. 인라인 사진 경로와 참조 정의에 실제 U+0000을 넣자 두 파일 모두 파싱 전에 거부했다. |
| ① 2. 머리말·본문 사진의 공백 안내 | 고쳐짐 | `src/lib/content/schema.ts:140`, `src/lib/content/body.ts:53`. 같은 경로의 앞뒤 공백을 두 위치에 넣자 각각 필드명과 본문 사진 번호를 짚고 U+0020과 빈칸을 지우는 방법을 표시했다. |
| ① 3. 설치 시 기존 Git 훅 비활성화 | 고쳐짐 | `scripts/setup-hooks.mjs:38`, `scripts/setup-hooks.mjs:42`. 두 저장소가 쓰는 전역 훅 설정을 보존했다. 한쪽에서 설치 스크립트를 실행한 뒤에도 양쪽의 기존 훅이 이전과 같은 종료 코드 27을 반환했다. |
| ① 4. 기본 훅 폴더의 활성 훅 보존 | 고쳐짐 | `scripts/setup-hooks.mjs:49`, `scripts/setup-hooks.mjs:53`. 기본 훅 폴더의 목록 읽기 권한을 빼고 통과 권한만 주자 EACCES를 알렸다. 설정은 비어 있었고 기존 훅이 종료 코드 29로 실행됐다. |
| ① 5. 페이지 사진의 자리표시 | 고쳐짐 | `src/lib/content/pages.ts:34`, `src/lib/media.ts:40`. 홈 첫 슬라이드에 `news/{{vision}}.webp`를 넣자 `hero.slides.0.image`에서 실제 파일명을 적으라고 안내했다. |
| ① 6. 머리말 사진의 앞뒤 공백 | 고쳐짐 | `src/lib/content/schema.ts:139`, `src/lib/content/schema.ts:239`. 따옴표 안에 앞뒤 공백을 둔 값을 `images.0.src` 오류로 보고했다. |
| ① 7. 눈에 보이지 않는 문자가 든 파일명 | 고쳐짐 | `src/lib/content/load.ts:67`, `src/lib/media.ts:34`. 머리말·본문에 넣은 U+0000을 모두 거부했다. 머리말 U+200B와 본문 U+0085가 든 사진도 각각 오류로 보고했다. |
| ① 8. 읽기 오류가 다른 파일의 오류를 가림 | 고쳐짐 | `src/lib/content/load.ts:47`, `src/lib/content/load.ts:236`, `src/lib/content/load.ts:252`. 같은 폴더의 잘못된 날짜와 다른 파일의 EACCES가 한 번의 검사에 함께 나왔다. 읽기 오류에는 권한 복구 안내도 있었다. |
| ① 중간 1. 기존 훅 연결 시 작업 사본만 검사 | 고쳐짐 | `README.md:31`, `.githooks/pre-commit:34`. 안내에 따라 제품 훅을 켠 뒤, 스테이징한 2월 30일을 작업 사본에서만 28일로 고치자 Git 훅이 1로 끝났다. 수정본을 스테이징하면 0이었다. |
| ① 중간 2. 읽지 못한 훅 폴더를 빈 폴더로 처리 | 고쳐짐 | `scripts/setup-hooks.mjs:51`, `scripts/setup-hooks.mjs:65`. 목록 읽기가 거부된 폴더는 보존했고, 기본 샘플만 있는 임시 저장소에서는 자동으로 `.githooks`를 설정했다. |
| ① 낮음 3. 본문 U+0000이 대체문자로 바뀌어 통과 | 고쳐짐 | `src/lib/content/load.ts:61`, `src/lib/content/load.ts:72`. 인라인 사진과 참조 사진 모두 최초 U+0000을 원문 줄 번호와 함께 보고했다. |
| ① 낮음 4. 보조 파일만 있을 때 연결할 훅이 없음 | 고쳐짐 | `scripts/setup-hooks.mjs:58`, `scripts/setup-hooks.mjs:60`. 일반 보조 파일 하나만 둔 경우 폴더를 보존하고 저장소 설정 명령을 표시했다. |
| ② 중간 1. 공용 훅 연결이 다른 저장소의 커밋까지 막음 | 고쳐짐 | `scripts/setup-hooks.mjs:20`, `README.md:31`. 공용 훅 편집 지시가 사라졌다. 전역 훅을 공유한 두 임시 저장소에서 설치 전후 같은 훅이 실행됐다. |
| ② 중간 2. 이미 연결된 훅에 자기 호출을 넣도록 안내 | 고쳐짐 | `scripts/setup-hooks.mjs:40`, `scripts/setup-hooks.mjs:60`. 훅 파일 자체가 링크인 경우와 훅 폴더가 링크인 경우 모두 파일 편집 지시가 없었다. 두 링크 모두 스테이징 오류를 계속 검출했다. |
| ② 중간 3. 실행 권한 없는 기존 훅에서 검사 생략 | 고쳐짐 | `scripts/setup-hooks.mjs:20`, `.githooks/pre-commit:37`. 기존 훅이 0644일 때 Git이 생략했던 검사가 안내 명령 실행 후에는 잘못된 날짜를 검출하고 1로 끝났다. |
| ② 낮음 1. `.DS_Store`만 있어도 설정을 변경 | 고쳐짐 | `scripts/setup-hooks.mjs:58`. 기본 샘플 외에 `.DS_Store` 하나를 추가하자 파일명을 알리고 `core.hooksPath`를 미설정 상태로 두었다. |
| ② 낮음 2. CR 단독 줄바꿈에서 U+0000 위치가 틀림 | 고쳐짐 | `src/lib/content/load.ts:70`. CR·LF·CRLF로 각각 만든 파일에서 모두 5번째 줄을 가리켰다. 세 줄바꿈을 섞은 참조 사진 파일에서도 실제 위치인 7번째 줄을 가리켰다. |
| ② 낮음 3. `/dev/null/pre-commit`을 만들라고 안내 | 고쳐짐 | `scripts/setup-hooks.mjs:20`, `scripts/setup-hooks.mjs:40`. 저장소 로컬 설정이 `/dev/null`이면 안내 명령으로 `.githooks`가 적용됐고 잘못된 날짜도 잡았다. 작업 트리별 설정에서 같은 명령을 실행한 결과는 아래에 적었다. |

## ② 새 지적

두 항목은 직원이 설치 안내에 따라 직접 검사를 켜는 단계에서 재현했다. 임시 저장소에는 제품 훅과 검사기를 두고, 2월 30일인 소식을 스테이징한 뒤 작업 사본에서만 28일로 고쳤다.

| 심각도 · 지적 | 파일:줄 · 기준 | 무엇이 틀렸나 · 실패 장면 | 고치는 방향 |
|---|---|---|---|
| 중간 1. 활성화 명령이 성공해도 스테이징 검사가 계속 꺼져 있음 | `README.md:31`, `scripts/setup-hooks.mjs:20`, `scripts/setup-hooks.mjs:33` · 원 요청 ③·⑥ | `extensions.worktreeConfig=true`이고 작업 트리별 `core.hooksPath=/dev/null`인 경우다. 안내 명령은 종료 코드 0을 반환하고 저장소 로컬 값을 바꿨지만 Git이 실제로 사용한 경로는 여전히 `/dev/null`이었다. `git hook run --ignore-missing pre-commit`도 0으로 끝나 잘못된 날짜를 통과시켰다. | README에 명령 실행 후 `git config --show-scope --get core.hooksPath`로 실제 적용값을 확인하는 방법을 적는다. 결과가 `worktree`이면 그 작업 트리에서 켜는 명령은 `git config --worktree core.hooksPath .githooks`다. 이 명령을 적용하자 같은 스테이징 오류가 검출돼 훅이 1로 끝났다. |
| 낮음 2. 로컬 훅 경로가 두 번 등록되어 있으면 활성화 명령이 실패 | `README.md:31`, `scripts/setup-hooks.mjs:20` · 원 요청 ③·⑥ | 저장소 로컬 설정에 `core.hooksPath`가 두 개 있으면 Git은 마지막 값을 사용한다. 안내 명령을 실행하자 Git이 여러 값을 덮어쓸 수 없다는 오류와 종료 코드 5를 반환했다. 기존 경로가 유지돼 스테이징 오류도 통과했다. | README에 이 오류가 나면 `git config --local --get-all core.hooksPath`로 기존 값을 확인하도록 적는다. 해당 경로들을 제품 훅 하나로 교체하기로 한 경우 `git config --local --replace-all core.hooksPath .githooks`로 값 하나만 남는 것을 확인했다. |

## ③ 미확인

원본 콘텐츠의 임시 사본 검사, TypeScript 검사, 변경된 TS·MJS 파일의 ESLint는 통과했다. 훅은 임시 저장소에서 Git으로 직접 실행했다. 실제 커밋, 전체 Next.js 빌드, 운영 배포는 미확인이다.

고칠 것 있음
