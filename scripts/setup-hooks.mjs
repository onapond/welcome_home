// npm "prepare" (runs on npm ci / npm install): turn on the pre-commit content
// check (.githooks/pre-commit) by pointing core.hooksPath at .githooks — but
// only when core.hooksPath is not set yet AND the hooks folder git uses now
// (normally .git/hooks) holds no active hook. An existing hooks setup (a team
// or personal hooks folder, or hooks installed in .git/hooks) is never
// switched off; a one-line notice says how to add the content check to it.
// Always exits 0 so installing never fails.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
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

/** Executable, non-.sample files in the hooks folder git uses right now. */
function activeDefaultHooks() {
  try {
    // --git-path prints a path relative to the current directory (or absolute).
    const dir = path.resolve(git(["rev-parse", "--git-path", "hooks"]));
    return fs.readdirSync(dir).filter((name) => {
      if (name.endsWith(".sample")) return false;
      try {
        const st = fs.statSync(path.join(dir, name));
        return st.isFile() && (st.mode & 0o111) !== 0;
      } catch {
        return false;
      }
    });
  } catch {
    return []; // no hooks folder (or unreadable): nothing to preserve
  }
}

const existing = current ? [] : activeDefaultHooks();

if (!current && existing.length) {
  console.log(
    `[훅] 기존 훅(${existing.join(", ")})이 있어 core.hooksPath 를 설정하지 않았습니다. 커밋 전 콘텐츠 검사를 쓰려면 기존 pre-commit 에서 npm run check:content 또는 이 저장소의 .githooks/pre-commit 을 실행하도록 추가해 주세요.`,
  );
} else if (!current) {
  try {
    git(["config", "core.hooksPath", ".githooks"]);
  } catch {
    console.log("[훅] core.hooksPath 를 설정하지 못했습니다. 커밋 전 콘텐츠 검사를 켜려면 git config core.hooksPath .githooks 를 실행해 주세요.");
  }
} else if (path.resolve(top, current) !== path.resolve(top, ".githooks")) {
  console.log(
    `[훅] core.hooksPath 가 이미 '${current}' 라서 바꾸지 않았습니다. 커밋 전 콘텐츠 검사를 쓰려면 그 폴더의 pre-commit 에서 이 저장소의 .githooks/pre-commit 을 실행하도록 추가해 주세요.`,
  );
}
