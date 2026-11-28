판정: 고칠 것 있음

## ① 지난 지적 재판정

검토 범위는 `59cef83..51ecb76`다. 현재 HEAD `84d2fff`와 수정 끝점의 추적 파일 차이는 5차 요청서 한 개다. 아래 번호는 4차 결과의 표와 행을 가리킨다. 요청서에서 제외한 ② 낮음 5는 재판정 대상에서 뺐다.

| 지적 | 판정 | 근거 |
|---|---|---|
| ① 「② 4」 본문 사진의 경로 검사 | 덜 고쳐짐 | `src/lib/content/body.ts:23`, `src/lib/content/body.ts:53`, `src/lib/content/schema.ts:139`. 앞뒤 공백을 넣은 동일 경로는 머리말과 본문 모두 거절했다. 본문에 실제 U+0000이 들어가면 파서가 먼저 글자를 바꿔 검사를 통과한다(아래 3). |
| ① 「② 3」 머리말·본문 사진 검사와 공백 안내 | 고쳐짐 | `src/lib/content/schema.ts:140`, `src/lib/media.ts:34`, `content/README.md:95`. 두 위치에 넣은 ` news/예배.webp ` 모두 U+0020과 앞뒤 빈칸을 지우라는 안내가 나왔다. 머리말에서는 필드 경로, 본문에서는 사진 번호도 표시했다. |
| ① 「② 5」 설치 시 기존 Git 훅 비활성화 | 덜 고쳐짐 | `scripts/setup-hooks.mjs:25`, `scripts/setup-hooks.mjs:35`, `scripts/setup-hooks.mjs:45`. 명시한 `team-hooks`와 일반 권한의 기본 훅은 보존했다. 기본 훅 폴더의 목록 읽기가 실패하면 여전히 경로를 바꾼다(아래 2). |
| ② 중간 1. Git 기본 폴더의 활성 훅 보존 | 덜 고쳐짐 | `scripts/setup-hooks.mjs:39`, `scripts/setup-hooks.mjs:51`, `scripts/setup-hooks.mjs:57`. 일반 권한에서는 설치 전후 같은 `pre-commit`이 실행됐다. 폴더 접근은 가능하고 목록만 읽을 수 없는 경우에는 설치 후 기존 훅이 실행되지 않았다. |
| ② 중간 2. 페이지 사진의 자리표시 | 고쳐짐 | `src/lib/content/pages.ts:34`, `src/lib/content/pages.ts:203`, `src/lib/media.ts:39`. 홈 슬라이드에 `news/{{vision}}.webp`를 넣자 치환 전에 검사가 실패했다. 오류에 `content/pages/home.yaml → hero.slides.0.image`와 실제 파일명을 적으라는 안내가 나왔다. |
| ② 낮음 3. 머리말 사진의 앞뒤 공백 | 고쳐짐 | `src/lib/content/schema.ts:139`, `src/lib/content/schema.ts:239`. 따옴표 안의 앞뒤 공백을 보존한 채 검사해 `images.0.src`에서 거절했다. |
| ② 낮음 4. 제어문자를 포함한 파일명 | 덜 고쳐짐 | `src/lib/media.ts:34`, `src/lib/content/body.ts:35`. 4차에서 보고한 U+0085와 추가로 시험한 U+200B는 머리말·본문에서 각각 코드값과 함께 거절했다. U+0000은 머리말만 거절했다(아래 3). |
| ② 낮음 6. 같은 폴더의 읽기 오류가 다른 오류를 가림 | 고쳐짐 | `src/lib/content/load.ts:47`, `src/lib/content/load.ts:219`, `src/lib/content/load.ts:222`. 같은 소식 폴더에서 앞 파일의 2월 30일 오류와 뒤 파일의 읽기 권한 오류가 한 번에 나왔다. 뒤 파일에는 경로, `EACCES`, 읽기 권한 복구 안내가 있었다. |

## ② 새 지적 및 남은 실패 장면

| 심각도 · 항목 | 파일:줄 · 기준 | 무엇이 틀렸나 · 실패 장면 | 고치는 방향 |
|---|---|---|---|
| 중간 1. 기존 훅 연결 안내대로 하면 스테이징한 오류를 놓침 | `scripts/setup-hooks.mjs:53`, `README.md:31`, `scripts/check-content.mjs:14`, `.githooks/pre-commit:34` · 요청 ③·⑥ | 설치 안내는 기존 훅에서 `npm run check:content`를 직접 실행해도 된다고 한다. 임시 저장소에 2월 30일로 적힌 소식을 스테이징하고 작업 사본에서만 2월 28일로 고쳤다. 첫 번째 안내대로 연결한 훅은 종료 코드 0이었다. 같은 인덱스에서 `.githooks/pre-commit`으로 연결하자 스테이징한 날짜 오류를 짚고 1로 끝났다. 공개 저장소에 올리기 전 검사하는 대상이 안내 선택에 따라 달라진다. | 설치 메시지와 README의 기존 훅 연결 방법을 `.githooks/pre-commit` 호출로 통일하고, 호출이 실패하면 기존 훅도 실패하도록 안내한다. |
| 중간 2. 목록을 읽을 수 없는 훅 폴더를 빈 폴더로 처리 | `scripts/setup-hooks.mjs:35`, `scripts/setup-hooks.mjs:45`, `scripts/setup-hooks.mjs:57` · 요청 ⑥ | 임시 저장소에서 훅 폴더에 접근 권한을 주고 목록 읽기 권한을 뺐다. 설치 전 `git hook run pre-commit`은 기존 훅의 확인 문구를 출력했다. 설치 스크립트는 목록 조회 실패를 빈 배열로 바꿔 아무 안내 없이 `core.hooksPath=.githooks`를 설정했다. 설치 후 같은 명령에서 기존 훅은 호출되지 않았다. | 폴더가 실제로 없는 경우와 권한 문제로 확인할 수 없는 경우를 구분한다. 후자에서는 기존 경로를 보존하고 권한 확인과 수동 연결 방법을 안내한다. |
| 낮음 3. 본문 사진 경로의 U+0000이 다른 글자로 바뀌어 통과 | `src/lib/content/body.ts:23`, `src/lib/content/body.ts:35`, `src/lib/content/body.ts:53`, `src/components/ui/Markdown.tsx:67` · 요청 ③, 규칙 ⑤ | 소식 본문에서 사진 파일명 ‘주일’과 ‘예배’ 사이에 실제 U+0000을 넣자 전체 검사가 0으로 끝났다. 같은 Markdown 파서의 이미지 노드에는 이미 U+FFFD(�)가 들어 있었고 렌더링한 주소에도 그 글자의 인코딩인 `%EF%BF%BD`가 남았다. 같은 문자를 넣은 YAML 머리말은 U+0000 오류를 냈다. | 본문 사진과 참조 정의의 경로는 파서가 글자를 바꾸기 전 원문 위치에서도 확인하고, 해당 사진 번호와 U+0000을 알려 준다. |
| 낮음 4. 실행 가능한 보조 파일을 활성 Git 훅으로 오인 | `scripts/setup-hooks.mjs:35`, `scripts/setup-hooks.mjs:39`, `scripts/setup-hooks.mjs:53` · 요청 ⑥ | 임시 기본 훅 폴더에 실행 가능한 `format-helper`만 추가했다. 설치 스크립트는 이를 기존 훅으로 보고 콘텐츠 훅 설치를 건너뛰었다. 이후 `git hook run pre-commit`은 훅을 찾지 못했다. 안내에서 연결하라는 기존 `pre-commit`도 없었다. | Git이 호출하는 훅 이름과 보조 파일을 구분한다. 다른 종류의 활성 훅만 있는 경우에는 같은 폴더에 `pre-commit`을 만들어 연결하는 방법을 안내한다. |

## ③ 미확인

원본 콘텐츠의 임시 사본은 전체 검사를 통과했다. TypeScript 검사와 변경된 TypeScript·JavaScript 파일의 ESLint도 통과했다. 잘못된 콘텐츠와 훅 동작은 임시 사본·저장소에서 각각 실행해 확인했고 임시 파일은 정리했다. 전체 Next.js 빌드, 브라우저에서의 실제 사진·PDF 열기, R2 응답과 운영 배포 상태는 이번 검토에서 미확인이다.

고칠 것 있음
