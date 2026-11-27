// npm "prepare" (runs on npm ci / npm install): turn on the pre-commit content
// check (.githooks/pre-commit) by pointing core.hooksPath at .githooks — but
// only when core.hooksPath is not set yet AND the hooks folder git uses now
// (normally .git/hooks) is missing or holds nothing but *.sample files. Any
// other file there, or a folder that cannot be read, counts as an existing
// hooks setup and is left alone; a one-line notice says how to chain the
// content check into it. Always exits 0 so installing never fails.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

/** The one supported way to chain the check: call .githooks/pre-commit and fail with it. */
function chainNotice(reason, hooksDir) {
  console.log(
    `[훅] ${reason} core.hooksPath 를 바꾸지 않았습니다. 커밋 전 콘텐츠 검사를 쓰려면 ${hooksDir}/pre-commit 에 다음 줄을 넣어 주세요(파일이 없으면 만들고 실행 권한을 줍니다): "$(git rev-parse --show-toplevel)/.githooks/pre-commit" || exit 1`,
  );
}

let top;
try {
  top = git(["rev-parse", "--show-toplevel"]);
} catch {
  process.exit(0); // not a git checkout (or git missing): nothing to set up
}

let current = "";
try {
  current = git(["config", "--get", "core.hooksPath"]);
} catch {
  // exit status 1: not set
}

if (current) {
  if (path.resolve(top, current) !== path.resolve(top, ".githooks")) {
    chainNotice(`core.hooksPath 가 이미 '${current}' 입니다.`, current);
  }
  process.exit(0);
}

// --git-path prints a path relative to the current directory (or absolute).
const hooksDir = path.resolve(git(["rev-parse", "--git-path", "hooks"]));
let names;
try {
  names = fs.readdirSync(hooksDir);
} catch (e) {
  if (e?.code !== "ENOENT") {
    chainNotice(`훅 폴더(${hooksDir})를 읽지 못했습니다(${e?.code ?? "오류"}). 권한을 확인해 주세요.`, hooksDir);
    process.exit(0);
  }
  names = []; // no hooks folder at all: nothing to preserve
}

const existing = names.filter((name) => !name.endsWith(".sample") && name !== ".DS_Store");
if (existing.length) {
  chainNotice(`기존 훅 폴더에 파일(${existing.join(", ")})이 있어`, hooksDir);
  process.exit(0);
}

try {
  git(["config", "core.hooksPath", ".githooks"]);
} catch {
  console.log("[훅] core.hooksPath 를 설정하지 못했습니다. 커밋 전 콘텐츠 검사를 켜려면 git config core.hooksPath .githooks 를 실행해 주세요.");
}
