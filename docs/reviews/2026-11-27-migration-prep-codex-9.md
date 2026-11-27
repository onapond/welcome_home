판정: 통과

## ① 지난 지적

| 8차 항목 | 판정 | 실패 장면 재실행 및 근거 |
|---|---|---|
| ①-1 · 머리말 전체를 들여쓰면 공개 PDF가 삭제됨 | 고쳐짐 | `2024-02-04.md` 임시 사본에서 `'legacy':` 블록 뒤에 `pdf:`를 두고 머리말 전체를 두 칸 들여썼다. 해당 주보의 캐시 PDF 하나만 제거했다. 이 사본은 사이트 콘텐츠 검사를 통과했다. 같은 입력으로 `--no-download --replace`를 실행하자 수정 전(`f5078fb`)에는 종료 코드 0으로 링크와 공개 PDF가 사라졌다(141개 → 140개). 수정 후(`1a4a05e`)에는 파일명과 첫 줄 `'  date: 2024-02-04'`를 표시하고 종료 코드 1로 멈췄다. 실행 전후 콘텐츠·공개 PDF·수집 캐시의 파일 목록과 SHA-256이 모두 일치했다. 첫 키를 읽기 전의 들여쓰기를 거부하고, 이 검사를 캐시 처리와 파일 쓰기보다 먼저 실행한다. `scripts/migrate/convert.py:1034`, `scripts/migrate/convert.py:1036`, `scripts/migrate/convert.py:1076`, `scripts/migrate/convert.py:1289`, `scripts/migrate/convert.py:1601` |

## ② 새 지적

`f5078fb..1a4a05e`의 `front_matter` 변경에서 새 지적은 없다. 빈 줄과 들여쓴 주석으로 시작해도 첫 키가 정상 위치면 기존 PDF 경로와 `legacy.seq`를 읽었고, 첫 키를 들여쓰면 중단했다. 다른 최상위 키 아래에 들여쓴 목록이 있어도 두 값은 유지됐다. `scripts/migrate/convert.py:1015`, `scripts/migrate/convert.py:1024`, `scripts/migrate/convert.py:1034`

## ③ 실행 확인과 미확인

- 대상 커밋의 임시 사본에서 `npm run check:content`, `npx tsc --noEmit`, `npm run lint`가 통과했다.
- 실제 수집 자료의 임시 사본으로 빈 폴더에 `--no-download --replace`를 실행했다. 생성된 콘텐츠 1,500개와 공개 PDF 141개가 각각 대상 커밋의 같은 경로에 있는 파일과 바이트 단위로 일치했다. 기존 출력을 복사해 다시 실행한 경우에도 `content/`와 `public/bulletins/` 전체가 대상 커밋과 일치했다.
- 기본 Turbopack 빌드는 CSS 처리 중 샌드박스가 포트 바인딩을 거부해 완료하지 못했다. `npx next build --webpack`은 정적 페이지 1,372개를 생성했고, 이어 실행한 `node scripts/check-legacy-redirects.mjs` 결과는 `checked 1498 bad 0`이었다.
- 옛 사이트의 실시간 PDF 다운로드와 운영 배포 상태는 미확인이다.

고칠 것 없음
