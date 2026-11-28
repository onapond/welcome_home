판정: 고칠 것 있음

`b2be93f..416214b`에서 6차의 실패 장면 다섯 가지는 모두 바로잡혔다. 다만 기존 주보의 유일한 PDF를 지우는 경우가 머리말 처리에 남았고, 교차 참조 스트림 검사에서 정상 파일 거부와 손상 파일 수용이 각각 새로 재현됐다.

## ① 지난 지적

| 6차 항목 | 상태 | 임시 사본에서 재실행한 결과와 근거 |
|---|---|---|
| 1. 머리말 들여쓰기 변경 시 PDF 삭제 | 덜 고쳐짐 | `legacy:` 자식 세 줄만 4칸으로 들여쓰자 파일명과 `legacy`를 표시하고 쓰기 전에 멈췄다. 머리말과 공개 PDF가 모두 보존됐다. 다만 같은 매핑의 키를 `'legacy':`로 쓰고 `pdf:`를 그 뒤에 두면 사이트 콘텐츠 검사는 통과하지만 변환기는 `seq`가 생략됐다고 판단한다. 실제 수집본 사본에서 해당 캐시 하나만 비우고 `--no-download --replace`를 실행하자 PDF가 141개에서 140개로 줄고 그 주보의 연결도 사라졌다. 이 경우는 수정 전에도 발생했다. 지원하지 않는 최상위 키 표기에서도 `legacy`임을 식별해 파일명과 키를 표시하고 중단해야 한다. `scripts/migrate/convert.py:1017`, `scripts/migrate/convert.py:1028`, `scripts/migrate/convert.py:1070`, `scripts/migrate/convert.py:596` |
| 2. 복사 중단 뒤 B·C 주보 뒤바뀜 | 고쳐짐 | 같은 날짜의 B·C 앞에 A를 추가하고 옛 예상 크기를 각각 7바이트 크게 설정했다. 첫 공개 PDF 복사에서 중단했을 때 B·C의 복구 캐시는 원본과 바이트가 일치했고 `state.json`에도 각각 실제 크기가 있었다. 오프라인 재실행 뒤 A에는 PDF가 없고 B·C는 각자 원본에 연결됐다. `scripts/migrate/convert.py:1104`, `scripts/migrate/convert.py:1107`, `scripts/migrate/convert.py:1221` |
| 3. 다음 객체의 표식을 읽어 손상 PDF 수용 | 고쳐짐 | `startxref`는 Catalog 객체를 가리키고 바로 다음 객체에만 `/Type /XRef`와 `stream`이 있는 손상본을 사용했다. 모의 HTTP 200 응답과 이어진 오프라인 실행에서 모두 채택 0건이었다. 첫 사전 바로 뒤에서 스트림 시작을 확인한다. 같은 사전 안에서의 별도 오판은 ②-2에 적었다. `scripts/migrate/convert.py:1128`, `scripts/migrate/convert.py:1129`, `scripts/migrate/convert.py:1157` |
| 4. 긴 사전을 가진 정상 PDF 삭제 | 고쳐짐 | 교차 참조 사전에 5,000바이트 이상의 문자열이 든 1페이지 PDF를 사용했다. `pdfinfo`가 열었고 모의 HTTP 200과 다음 오프라인 실행에서 각각 1건 채택됐다. 유일한 공개 사본으로 두고 캐시 없이 재변환해도 연결과 파일 바이트가 보존됐다. 사전 뒤 공백에 관한 별도 회귀는 ②-1에 적었다. `scripts/migrate/convert.py:1128`, `scripts/migrate/convert.py:1142`, `scripts/migrate/convert.py:1158` |
| 5. 작은따옴표가 든 HTTPS PDF 주소 오판 | 고쳐짐 | 실제 주보 한 건의 PDF를 `https://example.org/pastor's.pdf`로 바꿔 빌드했다. 생성된 앵커에는 `&#x27;`가 적혔고 HTML 파서로 읽은 목적지는 선언과 일치했다. 검사기 결과도 `checked 1498 bad 0`이었다. `scripts/check-legacy-redirects.mjs:44`, `scripts/check-legacy-redirects.mjs:47`, `scripts/check-legacy-redirects.mjs:60` |

## ② 새 지적

| 심각도 | 파일:줄 | 실패 장면 | 고칠 방향 |
|---|---|---|---|
| 1 · 높음 | `scripts/migrate/convert.py:1129`, `scripts/migrate/convert.py:1073`, `scripts/migrate/convert.py:596` | 정상 교차 참조 사전의 끝 `>>`과 `stream` 사이에 줄바꿈과 공백 8칸을 뒀다. `pdfinfo`는 1페이지로 열었고 수정 전 검사도 통과했다. 수정 후에는 12바이트만 잘라 읽어 `stream`의 끝을 보지 못한다. 해당 PDF가 유일한 공개 사본일 때 캐시 없이 `--replace`하면 정상 종료하면서 연결과 파일을 모두 지운다. | 사전 끝 오프셋을 시작 위치로 지정해 원본 바이트에서 공백과 `stream`을 검사한다. 고정 길이로 자르는 부분을 없애면 된다. |
| 2 · 중간 | `scripts/migrate/convert.py:1140`, `scripts/migrate/convert.py:1151`, `scripts/migrate/convert.py:1130` | `startxref`가 가리키는 일반 스트림의 사전에 `/Type (Catalog) /XRef 1 /Length 3`을 넣었다. 문자열을 건너뛰고 나머지 바이트를 이어 붙여 실제로 없는 키·값 쌍 `/Type /XRef`를 만든다. 수정 전 검사는 거부했고 `pdfinfo`도 열지 못했다. 수정 후에는 모의 HTTP 200 응답을 정상으로 저장했고 이어진 오프라인 실행에서도 1건 채택했다. | 최상위 `/Type` 바로 다음 값이 이름 토큰 `/XRef`인지 확인한다. 문자열 등 다른 값이 있으면 그 뒤에 나오는 키를 `/Type`의 값으로 사용하지 않는다. |

## ③ 실행 확인과 미확인

- 대상 커밋의 임시 사본에서 `npm run check:content`, `npx tsc --noEmit`, `npm run lint`가 통과했다. 기본 Turbopack 빌드는 CSS 처리 중 샌드박스의 포트 바인딩 제한으로 중단됐다. webpack 빌드는 정적 페이지 1,372개를 생성했고, 직후 리디렉션 검사는 `checked 1498 bad 0`이었다.
- 실제 수집 자료 사본에서 `--no-download --replace`로 빈 폴더에 생성한 콘텐츠 1,500개와 공개 PDF 141개의 경로 및 바이트가 대상 커밋과 모두 일치했다. 공개 PDF 141개와 캐시 PDF 141개는 완결성 검사도 전부 통과했다. 요청서의 캐시 142개는 현재 디렉터리의 전체 파일 수와 일치한다. 그중 1개는 `state.json`이며 상태 기록은 141건이다.
- 옛 사이트의 실시간 HTTP 응답과 운영 배포는 미확인이다. 다운로드 경로는 로컬 응답 대역으로, 주보 링크는 빌드 HTML의 앵커와 검사기로 확인했다.

고칠 것 있음
