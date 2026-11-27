// npm "prepare" (runs on npm ci / npm install): turn on the pre-commit content
// check (.githooks/pre-commit) by pointing core.hooksPath at .githooks — but
// only on a clean setup: core.hooksPath not set yet AND the hooks folder git
// uses now (normally .git/hooks) is missing or holds nothing but *.sample
// files. Any other existing hooks setup (or a folder that cannot be read) is
// left untouched, with a one-line notice that the check is off and the single
// command that turns it on for this repository. No chaining instructions:
// wiring the check into someone else's hooks is the developer's call.
// Always exits 0 so installing never fails.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

function notOnNotice(reason) {
  console.log(
    `[훅] ${reason} 설정을 바꾸지 않았습니다 — 커밋 전 콘텐츠 검사가 꺼져 있습니다. 이 저장소에서 켜려면(기존 훅 대신 이 저장소의 .githooks 를 씀): git config core.hooksPath .githooks`,
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
    notOnNotice(`core.hooksPath 가 이미 '${current}' 입니다.`);
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
    notOnNotice(`훅 폴더(${hooksDir})를 읽지 못했습니다(${e?.code ?? "오류"}).`);
    process.exit(0);
  }
  names = []; // no hooks folder at all: nothing to preserve
}

const existing = names.filter((name) => !name.endsWith(".sample"));
if (existing.length) {
  notOnNotice(`훅 폴더(${hooksDir})에 기존 파일(${existing.join(", ")})이 있어`);
  process.exit(0);
}

try {
  git(["config", "core.hooksPath", ".githooks"]);
} catch {
  console.log("[훅] core.hooksPath 를 설정하지 못했습니다. 커밋 전 콘텐츠 검사를 켜려면 git config core.hooksPath .githooks 를 실행해 주세요.");
}
