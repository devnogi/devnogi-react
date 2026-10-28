import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

import husky from "husky";

if (process.env.HUSKY !== "0") {
  const git = (...args) => spawnSync("git", args, { encoding: "utf8" });
  const dir = git("rev-parse", "--git-dir");
  const common = git("rev-parse", "--git-common-dir");
  if (dir.status === 0 && common.status === 0) {
    const existing = git("config", "--get", "core.hooksPath");
    if (existing.status === 0 && existing.stdout.trim() !== ".husky/_") {
      console.error(
        "Existing core.hooksPath is preserved; install the hooks manually after reviewing it.",
      );
      process.exit(1);
    }
    if (resolve(dir.stdout.trim()) !== resolve(common.stdout.trim())) {
      const enabled = git(
        "config",
        "--local",
        "extensions.worktreeConfig",
        "true",
      );
      if (enabled.status !== 0) throw new Error(enabled.stderr);
      const path = git("rev-parse", "--git-path", "config.worktree");
      if (path.status !== 0) throw new Error(path.stderr);
      process.env.GIT_CONFIG = resolve(path.stdout.trim());
    }
    const result = husky();
    if (result) {
      console.error(result);
      process.exit(1);
    }
  }
}
