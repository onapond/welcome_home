판정: 고칠 것 있음

검토 범위는 `2951392..c8c6802`이다. PDF 판정 두 건은 고쳐졌다. 따옴표 키에 대한 중단 조건은 머리말 전체가 들여쓰기된 경우를 놓쳐, 캐시에 없는 주보의 유일한 PDF를 삭제한다.

## ① 지난 지적

| 7차 항목 | 판정 | 실패 장면 재실행 및 근거 |
|---|---|---|
| ②-1 · 정상 PDF의 `stream` 앞 공백 | 고쳐짐 | 교차 참조 사전의 `>>` 뒤에 줄바꿈과 공백 8칸을 둔 1페이지 PDF를 사용했다. `pdfinfo`는 1페이지로 읽었고, 수정 전 완결성 검사는 거부했으며 수정 후에는 통과했다. 모의 HTTP 200 응답과 다음 오프라인 실행에서 각각 1건을 채택했다. 실제 주보의 공개 PDF를 이 표본으로 바꾸고 해당 캐시를 비운 뒤 `--no-download --replace`를 실행해도 링크가 유지됐고 공개 파일과 복구 캐시 모두 표본과 바이트가 같았다. 사전 끝에서 원본 바이트를 직접 검사한다. `scripts/migrate/convert.py:1133`, `scripts/migrate/convert.py:1288` |
| ②-2 · 문자열을 건너뛰면서 손상 PDF 채택 | 고쳐짐 | `startxref`가 가리키는 일반 스트림의 사전에 `/Type (Catalog) /XRef 1 /Length 3`을 넣었다. 수정 전에는 완결성 검사를 통과했다. 수정 후에는 문자열 자리에 표시가 남아 두 이름이 키와 값으로 붙지 않았다. 모의 HTTP 200 응답과 다음 오프라인 실행 모두 채택 0건이었다. `scripts/migrate/convert.py:1145`, `scripts/migrate/convert.py:1147`, `scripts/migrate/convert.py:1134`, `scripts/migrate/convert.py:1252` |
| ①-1 · 따옴표로 쓴 주보 머리말 키 | 덜 고쳐짐 · 높음 | 지난 표본처럼 `'legacy':`를 줄 맨 앞에 쓰고 `pdf:`를 그 뒤로 옮기면 파일명과 해당 줄을 표시하고 종료한다. 콘텐츠·공개 PDF·캐시는 모두 그대로였다. 같은 표본에서 두 `---` 사이의 모든 줄을 두 칸씩 들여쓰면 사이트 콘텐츠 검사는 통과하지만 변환기는 머리말을 빈 매핑으로 읽는다. `2024-02-04`의 캐시 하나만 비우고 `--no-download --replace`를 실행하자 종료 코드 0으로 해당 링크와 공개 PDF가 사라졌다(141개 → 140개). 첫 키부터 공백으로 시작하면 현재 블록이 없어 모든 줄을 건너뛴다. 첫 유효 줄이 지원하는 최상위 키인지 확인하고, 지원하지 않는 들여쓰기라면 파일명과 줄을 표시한 뒤 쓰기 전에 중단해야 한다. `scripts/migrate/convert.py:1013`, `scripts/migrate/convert.py:1019`, `scripts/migrate/convert.py:1035`, `scripts/migrate/convert.py:1074`, `scripts/migrate/convert.py:596` |

## ② 새 지적

이번 변경으로 새로 생긴 문제는 확인되지 않았다. 위 들여쓰기 표본은 수정 전후의 `front_matter`가 모두 빈 매핑으로 읽어 ①-1에 포함했다.

## ③ 실행 확인과 미확인

- 대상 커밋의 임시 사본에서 `npm run check:content`, `npx tsc --noEmit`, `npm run lint`가 통과했다.
- 기본 Turbopack 빌드는 CSS 처리 중 샌드박스의 포트 바인딩 제한으로 중단됐다. 이어서 `npx next build --webpack`으로 정적 페이지 1,372개를 생성했고, 직후 `node scripts/check-legacy-redirects.mjs` 결과는 `checked 1498 bad 0`이었다.
- 실제 수집 자료의 임시 사본으로 `--no-download --replace`를 실행했다. 빈 출력 폴더에 생성된 콘텐츠 1,500개와 공개 PDF 141개는 모두 대상 커밋과 경로·바이트가 일치했다. 기존 콘텐츠를 복사한 뒤 재실행한 경우에도 `content/` 전체와 `public/bulletins/` 전체가 일치했다.
- 완결성 검사는 공개 PDF 141개와 캐시 PDF 141개 모두 통과했다. 캐시 폴더의 142번째 파일은 `state.json`이다.
- 옛 사이트의 실시간 다운로드와 운영 배포는 미확인이다.

고칠 것 있음
