판정: 고칠 것 있음

`18c474d..5b2b24c`을 검토했다. 실제 수집 자료는 그대로 재생성됐다. 다만 캐시가 없는 상태에서 기존 주보를 다시 변환하면 정상 PDF를 지우거나 다른 주보에 연결하는 경우가 남았다.

## ① 지난 지적

| 5차 항목 | 상태 | 임시 사본에서 확인한 결과와 근거 |
|---|---|---|
| ②-1. 머리말에서만 기존 연결 읽기 | 덜 고쳐짐 | B의 PDF 경로에 작은따옴표를 붙여도 B·C 원본이 각각 보존됐다. B에서 PDF를 빼고 본문 코드 블록에 C의 경로를 넣자 B는 PDF 없음, C는 원본 유지였다. 블록 스칼라로 쓴 `pdf`는 삭제 전에 오류로 멈췄다. 다만 `legacy.seq` 들여쓰기를 바꾸면 조용히 삭제한다(아래 1번). `scripts/migrate/convert.py:1009`, `scripts/migrate/convert.py:1017`, `scripts/migrate/convert.py:1038` |
| ②-2. 복사 중단 뒤 재실행 | 덜 고쳐짐 | 같은 날짜의 B·C 앞에 A를 넣고 캐시 없이 `--replace`를 실행했다. 첫 공개 PDF 복사에서 오류를 내도 B·C 사본은 캐시에 남았다. 예상 크기 기록이 없을 때 재실행하면 A는 PDF 없음, B·C는 원본과 각각 일치했다. 옛 예상 크기가 남은 경우에는 동일한 복구가 실패했다(2번). `scripts/migrate/convert.py:1089`, `scripts/migrate/convert.py:1160`, `scripts/migrate/convert.py:1214` |
| ②-3. 일반 객체를 가리키는 손상 PDF | 덜 고쳐짐 | Catalog 객체만 있는 손상본은 HTTP 200 대역과 다음 오프라인 실행에서 모두 정상 0건이었다. 정상 교차 참조 스트림 표본은 두 번 모두 1건이었다. 그러나 뒤쪽 객체의 표식까지 읽거나 긴 정상 사전을 잘라 읽는다(3·4번). `scripts/migrate/convert.py:1105`, `scripts/migrate/convert.py:1109`, `scripts/migrate/convert.py:1178` |
| ②-4. HTML에서 이스케이프된 PDF 주소 | 덜 고쳐짐 | HTTPS 주소의 `?week=1&edition=2`는 빌드 HTML의 앵커에서 원문으로 해석됐고 검사도 통과했다. 작은따옴표가 든 경로는 오판한다(5번). `scripts/check-legacy-redirects.mjs:42`, `scripts/check-legacy-redirects.mjs:55` |
| ②-5. 한글 파일명과 빈 디렉터리 | 고쳐짐 | `bulletins/한글.pdf`를 선언하고 로컬 기본 경로에 정상 파일을 두자 해당 주보가 통과했다. 빌드는 그대로 두고 파일만 같은 이름의 빈 디렉터리로 바꾸자 해당 주보가 실패했다. 각 경로 조각을 디코딩한 다음 구분자를 거르고 일반 파일인지 확인한다. `scripts/check-legacy-redirects.mjs:45`, `scripts/check-legacy-redirects.mjs:46`, `scripts/check-legacy-redirects.mjs:47` |
| ②-6. HTTPS 사진의 소문자 퍼센트 인코딩 | 고쳐짐 | 머리말에 `%ec%98%88%eb%b0%b0.webp`, 본문에 `예배.webp`를 넣어 빌드했다. 해당 사진의 `img`는 1개였다. `%2F`와 경로 구분자, 쿼리 값의 `%26`과 매개변수 구분자는 서로 다른 키였다. `src/lib/content/body.ts:67`, `src/lib/content/body.ts:80`, `src/app/news/[id]/page.tsx:44` |
| ②-7. 연혁 변환 실패 시 임시 PDF 잔류 | 고쳐짐 | B·C의 캐시를 비우고 `history.json`을 치우자 변환은 연혁 단계에서 중단됐다. 두 PDF는 설계대로 복구 캐시에 남았고 공개 원본도 보존됐다. 종전의 임시 보관 폴더를 만드는 호출은 없어졌으며 시험 폴더에 `.part`도 남지 않았다. `scripts/migrate/convert.py:1085`, `scripts/migrate/convert.py:1090`, `scripts/migrate/convert.py:1522` |
| ①-7 추가. ‘오후 7’ | 고쳐짐 | ‘주일 / 오후 7’은 구조화 데이터용 시작 시각이 `null`, 방문 날짜가 0개였고 ‘미정’은 허용됐다. ‘오후 7시’는 `19:00`, ‘오후 7시 30분’은 `19:30`이었으며 둘 다 방문 날짜 6개를 반환했다. `src/lib/schedule.ts:38`, `src/lib/schedule.ts:141`, `src/lib/jsonld.tsx:72` |

## ② 새 지적과 남은 실패 장면

| 번호 · 심각도 | 파일:줄 | 실패 장면 | 고칠 방향 |
|---|---|---|---|
| 1 · 높음 | `scripts/migrate/convert.py:1017`, `scripts/migrate/convert.py:1024`, `scripts/migrate/convert.py:1066`, `scripts/migrate/convert.py:596` | 기존 B 주보의 `legacy` 자식 세 줄 들여쓰기만 2칸에서 4칸으로 바꿨다. 이 YAML은 사이트 콘텐츠 검사를 통과한다. 캐시 없이 `--no-download --replace`를 실행하면 변환기는 `seq`를 생략된 값으로 취급해 정상 종료하고 B의 PDF 연결과 파일을 모두 지운다. | `legacy` 매핑의 들여쓰기를 인식하거나, 지원하지 않는 표기를 만나면 해당 파일과 키를 밝히고 쓰기 전에 중단한다. 읽을 수 없는 키와 실제로 생략된 키를 구별한다. |
| 2 · 높음 | `scripts/migrate/convert.py:1089`, `scripts/migrate/convert.py:1158`, `scripts/migrate/convert.py:1160`, `scripts/migrate/convert.py:1214` | B·C의 공개 PDF는 정상이고 캐시는 비어 있다. `binaries.json`의 옛 예상 크기를 실제보다 7바이트 크게 두고 A를 앞에 추가했다. 첫 공개 PDF 복사에서 중단된 직후, 복구 캐시의 B·C는 모두 원본과 일치했다. 재실행은 옛 크기를 적용해 두 캐시를 거부하고, 이미 바뀐 머리말을 따라 C의 공개 파일로 B 캐시를 덮어썼다. **B는 C의 PDF에 연결되고 C는 PDF가 없으며 B 원본은 캐시에서도 사라졌다.** | 공개 출력을 바꾸기 전에 복구 사본과 그 URL·실제 크기 또는 해시를 함께 확정한다. 재시도에서는 이 기록으로 온전한 복구 사본을 알아보고, 부분적으로 갱신된 공개 출력에서 다시 복구해 덮어쓰는 일을 막는다. |
| 3 · 중간 | `scripts/migrate/convert.py:1109`, `scripts/migrate/convert.py:1110`, `scripts/migrate/convert.py:1178` | 마지막 `startxref`가 일반 Catalog 객체를 가리키고 **다음 객체**에 `/Type /XRef`와 `stream`이 있는 손상본을 넣었다. 정규식이 첫 객체의 `endobj`를 넘어 다음 객체까지 읽었다. `pdfinfo`는 열지 못했지만 변환기는 모의 HTTP 200에서 정상 1건으로 저장했고 다음 오프라인 실행도 정상 1건이었다. | 지정 오프셋에서 시작한 객체의 최상위 사전 안에서 `/Type /XRef`를 확인하고, 그 사전 바로 뒤의 스트림 시작만 인정한다. |
| 4 · 높음 | `scripts/migrate/convert.py:1105`, `scripts/migrate/convert.py:1109`, `scripts/migrate/convert.py:1066`, `scripts/migrate/convert.py:596` | 교차 참조 스트림 사전에 긴 문자열이 있는 5,346바이트 PDF를 만들었다. `pdfinfo`는 정상 1페이지로 읽었다. 변환기는 지정 오프셋부터 4,096바이트에서 잘라 `stream`을 보지 못해 정상 0건으로 처리했다. 이 파일이 기존 머리말에 연결된 유일한 공개 사본일 때, 캐시 없이 `--replace`하자 연결과 파일이 모두 삭제됐다. | 고정된 4,096바이트 안에서 검색하는 대신 해당 객체 사전의 끝까지 읽어 스트림 시작을 확인한다. 판정을 끝낼 수 없다면 기존 연결 사본을 삭제하기 전에 중단한다. |
| 5 · 중간 | `scripts/check-legacy-redirects.mjs:42`, `scripts/check-legacy-redirects.mjs:55` | `https://example.org/pastor's.pdf`는 콘텐츠 검사와 빌드를 통과했다. 빌드 HTML에는 작은따옴표가 `&#x27;`로 기록됐고, 앵커에서 해석한 목적지는 선언과 일치했다. 검사기만 이 주보를 실패 처리했다(`checked 1498 bad 1`). | 빌드 HTML의 앵커에서 문자 참조를 해석한 `href`를 읽어 비교한다. |

## ③ 실행 확인과 미확인

- 대상 커밋의 임시 사본에서 콘텐츠 검사, TypeScript 검사, ESLint, webpack 빌드가 통과했다. 정적 페이지 1,372개를 생성했고 이어 실행한 리디렉션 검사는 `checked 1498 bad 0`이었다. 기본 Turbopack 빌드는 CSS 처리 중 샌드박스의 포트 바인딩 권한 오류로 중단됐다.
- 실제 수집 자료와 캐시의 사본에 `--no-download --replace`를 실행했다. 빈 출력 폴더에 생성된 콘텐츠 1,500개와 주보 PDF 141개가 대상 커밋의 변환 대상과 파일명·바이트까지 일치했다. 복구 표본의 보고서에도 기존 사본 사용 2건·PDF 없음 0건, B의 본문에만 C의 PDF 경로를 둔 표본에는 각각 1건·1건으로 기록됐다.
- 링크 목적지와 이미지 수는 새로 빌드한 HTML에서 확인했다. 헤드리스 Chromium이 macOS 샌드박스 초기화 중 종료돼 브라우저 화면은 미확인이다. HTTP 다운로드 실패·성공 처리는 로컬 대역으로 시험했고 옛 사이트의 실시간 응답과 운영 배포는 미확인이다.

고칠 것 있음
