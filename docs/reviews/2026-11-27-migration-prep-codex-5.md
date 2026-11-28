판정: 고칠 것 있음

검토 범위는 `c770a11..6c04826`의 두 커밋이다. 현재 수집 자료는 정확히 복원됐다. 다만 캐시 없이 주보를 다시 변환할 때 정상 PDF가 삭제되거나 다른 주보에 연결되는 경로가 남았다.

## ① 지난 지적 7건

| 4차 ② | 상태 | 대상 커밋의 근거와 재검증 |
|---|---|---|
| 1. 순번 변경 때 기존 주보 PDF 보존 | 덜 고쳐짐 | 같은 날짜의 B·C를 변환하고 캐시를 비운 뒤 A를 앞에 넣었다. 정상 종료하면 A는 PDF 없음, B·C는 각각 자기 원본과 바이트가 일치했다. 첫 실행의 `--replace` 유무와 관계없이 다음 오프라인 실행도 같았다. 머리말 표기와 복사 중단에 따른 실패는 ②-1·2에 적었다. `scripts/migrate/convert.py:1015`, `scripts/migrate/convert.py:1162`, `scripts/migrate/convert.py:1166` |
| 2. 구버전의 9바이트 성공 캐시 | 고쳐짐 | 기대 크기 8,000바이트에 머리글 9바이트를 돌려주어 구버전에서 성공 기록을 만들었다. 같은 캐시를 대상 버전에서 오프라인으로 읽자 정상 0건·누락 1건이었다. 성공 기록과 파일 크기가 일치해도 내용을 재검사한다. `scripts/migrate/convert.py:1044`, `scripts/migrate/convert.py:1047`, `scripts/migrate/convert.py:1087` |
| 3. 본문에 종료 표식이 있는 잘린 PDF | 덜 고쳐짐 | 한 페이지 PDF 418바이트는 정상, 본문의 `(%%EOF)` 직후에서 자른 239바이트는 누락으로 처리했다. 두 결과 모두 `pdfinfo` 판정과 일치했다. 마지막 오프셋이 일반 객체를 가리키는 손상본은 여전히 통과한다(②-3). `scripts/migrate/convert.py:1033`, `scripts/migrate/convert.py:1037`, `scripts/migrate/convert.py:1105` |
| 4. 옛 주차는 같고 발행일은 다른 주보 | 고쳐짐 | 2025년 10월 첫 주의 세 번째 발행일만 10월 6일로 바꿨다. 옛 주소 GET은 첫 상세로 308을 반환했고, 빌드한 세 상세 모두에 주보 링크 3개와 자기 PDF 링크가 있었다. 같은 10월 5일에 옛 주소 없이 추가한 새 주보 2개는 서로만 연결했다. `src/lib/legacy-redirect.ts:72`, `src/lib/legacy-redirect.ts:97`, `src/app/news/bulletin/[id]/page.tsx:45`, `src/app/news/bulletin/[id]/page.tsx:82` |
| 5. 상대 주소와 형제 주보 PDF 검사 | 덜 고쳐짐 | 두 번째 주보의 옛 주소를 상대 주소로 바꿔도 해당 주차는 통과했다. 기준 빌드에서 두 번째 PDF만 치우자 검사기가 해당 주의 세 건을 모두 실패로 판정했다(`bad 3`, 종료 1). 유효한 PDF 주소와 같은 이름의 디렉터리에 대한 오판은 ②-4·5에 적었다. `scripts/check-legacy-redirects.mjs:35`, `scripts/check-legacy-redirects.mjs:59`, `scripts/check-legacy-redirects.mjs:62` |
| 6. HTTPS 한글 사진 중복 | 덜 고쳐짐 | 머리말의 대문자 퍼센트 인코딩 경로와 본문의 한글 경로를 함께 빌드하자 해당 사진의 `img`는 1개였다. 인코딩된 구분자 `%2F`와 실제 슬래시, 쿼리 값의 `%26`과 매개변수 구분자도 구별했다. 소문자 인코딩의 중복은 ②-6에 남았다. `src/lib/content/body.ts:67`, `src/lib/content/body.ts:79`, `src/app/news/[id]/page.tsx:44` |
| 7. 복합 시각과 한국어 분 표기 | 덜 고쳐짐 | `주일 / 오후 7시 30분`의 JSON-LD는 `19:30`이었다. 한국 시간 일요일 19:10에는 당일 방문을 허용하고 19:30에는 제외했다. `11:00 또는 14:00`은 일정 없음·선택 날짜 0개·미정 허용이었다. 다만 요청서의 세 표기 밖인 `오후 7`도 여전히 19:00과 방문 날짜 6개로 확정한다. 12시간제 정규식에서 콜론·분 또는 ‘시’ 부분을 필수로 두면 된다(낮음, 기존 허용 동작). `src/lib/schedule.ts:38`, `src/lib/schedule.ts:141`, `src/lib/jsonld.tsx:81` |

## ② 새 지적과 남은 실패 장면

| 번호 · 심각도 | 파일:줄 | 실패 장면 | 고칠 방향 |
|---|---|---|---|
| 1 · 높음 | `scripts/migrate/convert.py:1014`, `scripts/migrate/convert.py:1015`, `scripts/migrate/convert.py:1016`, `scripts/migrate/convert.py:596` | B의 유효한 머리말에서 PDF 경로에 YAML 작은따옴표만 붙였다. 캐시 없이 `--replace`하자 B의 PDF 연결과 정상 파일이 모두 사라졌다. 반대 사례로 B의 머리말에서 PDF를 빼고 본문의 코드 블록에 C의 PDF 경로를 한 줄 적자, 변환기가 C의 파일을 B에 연결했다. 두 표기 모두 사이트의 콘텐츠 검사를 통과한다. | 처음 두 `---` 사이의 YAML에서 최상위 `pdf`와 `legacy.seq`를 읽는다. 인식할 수 없는 기존 머리말은 해당 파일을 삭제하기 전에 오류로 알려 복구할 기회를 준다. |
| 2 · 높음 | `scripts/migrate/convert.py:596`, `scripts/migrate/convert.py:606`, `scripts/migrate/convert.py:612`, `scripts/migrate/convert.py:1461` | B·C의 캐시 없이 A를 앞에 추가하고 `--replace` 중 첫 PDF 복사에서 I/O 오류를 모의했다. 그 시점에 옛 B 파일은 삭제됐고 머리말은 이미 새 순번이었다. 임시 사본도 정리됐다. 같은 입력으로 정상 재실행하자 **B에는 C의 PDF가 연결되고 C는 PDF가 없는 상태**로 끝났다. | 기존 식별값과 PDF 사본을 새 머리말·PDF가 모두 기록될 때까지 복구 가능하게 보관한다. 쓰기가 실패하면 이전 대응을 복원하거나, 다음 실행이 보관된 대응에서 작업을 재개하도록 한다. |
| 3 · 중간 | `scripts/migrate/convert.py:1036`, `scripts/migrate/convert.py:1037`, `scripts/migrate/convert.py:1105`, `scripts/migrate/convert.py:1114` | 첫 Catalog 객체까지만 남은 74바이트 PDF에서 마지막 `startxref`가 그 일반 객체를 가리키게 했다. `pdfinfo`는 열지 못했지만 변환기는 HTTP 200 응답을 정상 1건으로 저장했고, 다음 오프라인 실행도 정상 1건이었다. 현재 조건은 모든 간접 객체 헤더를 교차 참조 스트림으로 인정한다. | 지정 위치가 독립된 `xref` 토큰인지 확인한다. 간접 객체인 경우에는 해당 객체의 사전이 `/Type /XRef`를 선언하고 실제 스트림을 여는지 확인한다. |
| 4 · 중간 | `scripts/check-legacy-redirects.mjs:41`, `scripts/check-legacy-redirects.mjs:42` | 한 주보에 유효한 HTTPS PDF 주소 `weekly.pdf?week=1&edition=2`를 선언했다. 콘텐츠 검사와 빌드는 성공했고, 생성 HTML에서 해석한 앵커의 목적지도 원문과 일치했다. 검사기는 HTML 원문의 `&amp;`를 입력의 `&`와 직접 비교해 그 주보를 실패 처리했다. | 빌드 HTML의 앵커에서 해석된 `href` 속성값을 읽어 선언한 PDF 주소와 비교한다. |
| 5 · 중간 | `scripts/check-legacy-redirects.mjs:43`, `src/lib/media.ts:91` | 한 주보에 보관소 키 `bulletins/한글.pdf`를 쓰고 로컬 기본 경로 `public/media/bulletins/한글.pdf`에 정상 파일을 뒀다. 검사기는 퍼센트 인코딩된 파일명을 찾아 실패했다. 반대로 기준 빌드의 정상 PDF를 같은 이름의 **빈 디렉터리**로 바꾸면 `bad 0`으로 통과했다. | 로컬 URL의 경로를 실제 파일명으로 대응시켜 `public/` 아래의 일반 파일인지 확인한다. 이 과정에서 인코딩된 구분자가 다른 경로로 해석되지 않게 한다. |
| 6 · 낮음 | `src/lib/content/body.ts:79`, `src/app/news/[id]/page.tsx:44` | ①-6의 머리말 경로에서 퍼센트 인코딩의 16진수만 소문자로 바꿨다. 같은 ‘예배.webp’를 가리키는 본문·갤러리 이미지가 빌드 HTML에 다시 2개 생겼다. | HTTPS 경로의 비교 키에서 유효한 `%HH`의 16진수 대소문자를 통일한다. 경로를 디코딩하거나 쿼리 내용을 바꿀 필요는 없다. |
| 7 · 낮음 | `scripts/migrate/convert.py:1021`, `scripts/migrate/convert.py:1454`, `scripts/migrate/convert.py:1457` | 캐시 없는 B·C를 보관한 뒤 읽을 `history.json`이 없는 입력으로 실행했다. 변환은 종료 코드 1로 끝났고 임시 폴더에 PDF 두 개가 남았다. 정리용 `try`는 연혁·교역자 변환이 끝난 뒤에 시작한다. | 임시 폴더를 처음 만들 수 있는 단계부터 정리 범위에 넣는다. ②-2의 쓰기 복구를 위해 보관해야 할 사본은 복구 완료 시점에 정리한다. |

## ③ 실행 확인과 미확인

- 대상 커밋의 임시 사본에서 `npm run check:content`, `npx tsc --noEmit`, `npm run lint`, `npx next build --webpack`이 통과했다. 정적 페이지 1,372개를 생성했고, 이어 실행한 리디렉션 검사는 `checked 1498 bad 0`이었다. 기본 Turbopack 빌드는 CSS 처리 중 로컬 포트 바인딩 권한 오류로 중단됐다.
- 실제 수집 캐시를 입력으로 빈 임시 폴더에 `--no-download --replace`를 실행했다. 변환 대상 콘텐츠 1,500개와 주보 PDF 141개는 대상 커밋과 파일명·바이트가 모두 일치했다. ②의 실패는 별도 표본에서 재현했다.
- 화면 관련 검증은 새로 빌드한 HTML의 앵커와 이미지 요소까지 수행했다. 헤드리스 Chromium이 샌드박스 초기화에서 종료되어 브라우저 육안 표시는 미확인이다. 다운로드 응답은 로컬 대역으로 검증했다. 옛 사이트의 현재 응답과 운영 배포 상태는 미확인이다.

고칠 것 있음
