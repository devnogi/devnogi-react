import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const checker = fileURLToPath(new URL("./format-check.mjs", import.meta.url));

test("checks changed working and staged files without shell interpolation", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "memonogi-format-test-"));
  const parentGit = (...args) => {
    const result = spawnSync("git", args, { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const commonConfig = path.resolve(
    parentGit("rev-parse", "--git-common-dir"),
    "config",
  );
  const worktreeConfig = path.resolve(
    parentGit("rev-parse", "--git-path", "config.worktree"),
  );
  const snapshot = (file) => {
    try {
      return createHash("sha256").update(readFileSync(file)).digest("hex");
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
  };
  const before = [snapshot(commonConfig), snapshot(worktreeConfig)];
  const localEnvNames = spawnSync("git", ["rev-parse", "--local-env-vars"], {
    encoding: "utf8",
  });
  assert.equal(localEnvNames.status, 0, localEnvNames.stderr);
  const localKeys = new Set(localEnvNames.stdout.trim().split(/\r?\n/));
  const hookEnv = {
    ...process.env,
    GIT_DIR: path.join(dir, "poison-parent.git"),
    GIT_WORK_TREE: parentGit("rev-parse", "--show-toplevel"),
    GIT_PREFIX: "poison/",
    GIT_INDEX_FILE: path.join(dir, "poison-index"),
  };
  const childEnv = Object.fromEntries(
    Object.entries(hookEnv).filter(
      ([key]) => !localKeys.has(key.toUpperCase()),
    ),
  );
  for (const key of [
    "GIT_DIR",
    "GIT_WORK_TREE",
    "GIT_PREFIX",
    "GIT_INDEX_FILE",
  ]) {
    assert.ok(
      localKeys.has(key),
      `${key} must be identified as repository-local`,
    );
    assert.equal(childEnv[key], undefined);
  }
  const run = (cmd, args, options = {}) =>
    spawnSync(cmd, args, {
      cwd: dir,
      encoding: "utf8",
      env: childEnv,
      ...options,
    });
  const git = (...args) => {
    const result = run("git", args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  try {
    git("init");
    git("config", "user.name", "Format Test");
    git("config", "user.email", "format-test@example.invalid");
    git("config", "core.hooksPath", ".no-hooks");
    git("config", "commit.gpgsign", "false");
    writeFileSync(path.join(dir, "space name.ts"), "export const value = 1;\n");
    writeFileSync(path.join(dir, "remove me.ts"), "export const old = 1;\n");
    git("add", "--", "space name.ts", "remove me.ts");
    git("commit", "-m", "test: create fixture");
    const base = git("rev-parse", "HEAD");
    const check = () =>
      run(process.execPath, [checker], {
        env: { ...childEnv, FORMAT_BASE_REF: base },
      });
    assert.equal(check().status, 0, "empty change list");

    writeFileSync(path.join(dir, "space name.ts"), "export const value=2;\n");
    git("add", "--", "space name.ts");
    writeFileSync(path.join(dir, "space name.ts"), "export const value = 2;\n");
    const partial = check();
    assert.equal(partial.status, 1);
    assert.match(partial.stderr, /space name\.ts \(index\)/);

    git("add", "--", "space name.ts");
    renameSync(
      path.join(dir, "space name.ts"),
      path.join(dir, "renamed ; name.ts"),
    );
    unlinkSync(path.join(dir, "remove me.ts"));
    git("add", "-A");
    assert.equal(check().status, 0, "rename, deletion and metacharacter path");

    git("commit", "-m", "test: rename fixture");
    assert.equal(check().status, 0, "committed branch changes");

    writeFileSync(
      path.join(dir, "renamed ; name.ts"),
      "export const value=3;\n",
    );
    const invalid = check();
    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /renamed ; name\.ts \(working tree\)/);

    git("add", "--", "renamed ; name.ts");
    git("commit", "--no-verify", "-m", "test: bypass fixture");
    writeFileSync(
      path.join(dir, "renamed ; name.ts"),
      "export const value = 3;\n",
    );
    const committedInvalid = check();
    assert.equal(committedInvalid.status, 1);
    assert.match(committedInvalid.stderr, /renamed ; name\.ts \(HEAD\)/);
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(tmpdir()));
    rmSync(dir, { recursive: true, force: true });
    assert.deepEqual(
      [snapshot(commonConfig), snapshot(worktreeConfig)],
      before,
      "parent Git config changed",
    );
  }
});
