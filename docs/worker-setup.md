# 작업자 컴퓨터 설치 — Claude Code가 읽고 실행하는 문서

이 문서는 **교회 작업자 컴퓨터의 Claude Code**가 읽고 그대로 따라 하는 설치 순서다. 작업자는 Claude Code에 이렇게만 말한다.

> https://github.com/onapond/welcome_home/blob/main/docs/worker-setup.md 읽고 이 컴퓨터에 설치해줘

## Claude에게 — 진행 원칙

- 작업자는 개발자가 아니다. 쉬운 한국어로, 한 단계씩 무엇을 하는지 한 줄로 말하고 진행한다.
- **비밀번호 · 인증 코드는 직접 입력하지 않는다.** 컴퓨터 비밀번호(설치 권한), GitHub 로그인은 작업자가 한다. 필요한 순간에 무엇을 어디에 입력하는지 정확히 알려 준다.
- 이미 설치된 것은 건너뛴다(버전만 확인). 실패하면 오류 한 줄과 다음 할 일을 말한다.
- 이 문서 밖의 프로그램은 설치하지 않는다. 작업자의 다른 폴더 · 설정은 건드리지 않는다.

## 1. 운영체제 확인

`uname -s`(Mac = `Darwin`) 또는 Windows(PowerShell)인지 확인하고 아래에서 맞는 명령을 쓴다.

## 2. 프로그램 설치 — git · Node.js 24 · GitHub CLI(gh)

확인: `git --version` · `node -v`(v24 이상) · `gh --version`

**Mac**
- Homebrew가 없으면(`brew -v` 실패) 작업자에게 「터미널(응용 프로그램 → 유틸리티 → 터미널)」을 열어 아래 한 줄을 붙여 넣고 컴퓨터 비밀번호를 입력하라고 안내한다(비밀번호는 화면에 보이지 않는 게 정상):
  `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
  끝나면 안내문 마지막의 `eval ...` 두 줄도 같은 창에서 실행하게 한다.
- `brew install git node@24 gh` → `node -v`가 24가 아니면 `brew link --overwrite --force node@24`.

**Windows**
- `winget install --id Git.Git -e` · `winget install --id OpenJS.NodeJS -e` · `winget install --id GitHub.cli -e`
- 설치 뒤 새 터미널에서 다시 확인한다(경로가 새로 잡혀야 한다).

## 3. GitHub 로그인 — 작업자가 한다

작업자의 GitHub 계정: 교회 계정 `chungpa21c` 또는 협업자 `fluent44`. 다른 계정이면 개발자에게 먼저 초대를 받아야 한다.

- 확인: `gh auth status`가 그 계정으로 로그인돼 있으면 건너뛴다.
- 로그인은 입력을 주고받아야 하므로 작업자에게 **별도 터미널 창**에서 아래를 실행하게 한다:
  `gh auth login --hostname github.com --git-protocol https --web`
  → 화면의 8자리 코드를 복사 → Enter → 열린 브라우저에서 해당 GitHub 계정으로 로그인하고 코드 붙여 넣기 → 승인.
- 끝나면 `gh auth status`로 확인하고 `gh auth setup-git` 실행.

## 4. 저장소 초대 수락

- `gh api user/repository_invitations --jq '.[] | select(.repository.full_name=="onapond/welcome_home") | .id'`
- id가 나오면 `gh api -X PATCH user/repository_invitations/<id>`로 수락한다. 아무것도 안 나오면 이미 수락했거나 초대가 없다 → `gh api repos/onapond/welcome_home --jq .permissions.push`가 `true`인지 확인. `false`면 「개발자에게 초대를 다시 요청」하고 멈춘다(초대는 7일 뒤 만료).

## 5. 저장소 받기

- 위치: 작업자 문서 폴더 아래 `welcome_home` (Mac `~/Documents/welcome_home`, Windows `%USERPROFILE%\Documents\welcome_home`). 이미 있으면 그 폴더에서 `git pull`만 한다.
- `gh repo clone onapond/welcome_home <위치>`

## 6. 커밋 이름 — 개인 메일을 드러내지 않게

저장소가 공개라 커밋의 이름 · 메일이 누구에게나 보인다. 이 저장소에만(전역 아님) GitHub noreply 메일로 설정한다:

```
cd <위치>
git config user.name  "$(gh api user --jq .login)"
git config user.email "$(gh api user --jq '"\(.id)+\(.login)@users.noreply.github.com"')"
```

## 7. 준비 · 확인

- `npm ci` — 설치하면서 커밋 전 콘텐츠 검사도 켜진다. 「검사가 꺼져 있다」는 안내가 나오면 `git config core.hooksPath .githooks`.
- `npm run check:content` → 「콘텐츠 검사 통과」가 나오면 끝.

## 8. 작업자에게 마무리 안내

이렇게 알려 준다:

- 앞으로는 Claude Code를 **`welcome_home` 폴더에서** 열고 말로 시키면 된다. 예:
  - 「이번 주 주보 올려줘」 + PDF 파일
  - 「이 사진들로 수련회 사진첩 만들어줘」 + 사진 여러 장
  - 「설교 올려줘 — 유튜브 주소, 제목, 본문」
  - 「홈 첫 화면 사진 이 3장으로 바꿔줘」
- 여러 파일을 한꺼번에 줘도 된다. 내용 · 사진 · 주보는 바로 반영 준비가 되고(GitHub에 병합), 화면 모양 · 기능처럼 코드가 바뀌는 일은 개발자 검토가 필요하다고 안내가 나온다.
- 홈페이지 화면에 나타나는 것(배포)은 지금은 개발자가 한다.

작업 방법의 자세한 규칙은 저장소의 `.claude/skills/content-update/SKILL.md`(Claude가 알아서 따른다).
