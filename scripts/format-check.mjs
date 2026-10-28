import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import * as prettier from "prettier";

const supported = /\.(?:ts|tsx|js|mjs|css|json|md|yaml|yml)$/i;

function git(...args) {
  const result = spawnSync("git", args, {
    encoding: "buffer",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `git ${args[0]} failed: ${result.stderr?.toString().trim() || result.error?.message}`,
    );
  }
  return result.stdout;
}

function names(...args) {
  return git(...args)
    .toString("utf8")
    .split("\0")
    .filter(Boolean);
}

try {
  const root = git("rev-parse", "--show-toplevel").toString().trim();
  process.chdir(root);
  const base = process.env.FORMAT_BASE_REF || "refs/remotes/origin/main";
  const baseCommit = git(
    "rev-parse",
    "--verify",
    "--end-of-options",
    `${base}^{commit}`,
  )
    .toString()
    .trim();
  const committed = names(
    "diff",
    "--name-only",
    "-z",
    "--diff-filter=ACMRT",
    `${baseCommit}...HEAD`,
    "--",
  );
  const changed = new Set([
    ...committed,
    ...names("diff", "--name-only", "-z", "--diff-filter=ACMRT", "HEAD", "--"),
    ...names("ls-files", "--others", "--exclude-standard", "-z"),
  ]);
  const staged = names(
    "diff",
    "--cached",
    "--name-only",
    "-z",
    "--diff-filter=ACMRT",
    "--",
  );
  for (const file of staged) changed.add(file);
  const failures = [];
  const optionsFor = async (file) => ({
    ...(await prettier.resolveConfig(file)),
    filepath: file,
  });
  for (const file of changed) {
    if (!supported.test(file) || !existsSync(file)) continue;
    const info = await prettier.getFileInfo(file, {
      ignorePath: path.join(root, ".prettierignore"),
    });
    if (info.ignored) continue;
    if (
      !(await prettier.check(
        await readFile(file, "utf8"),
        await optionsFor(file),
      ))
    )
      failures.push(`${file} (working tree)`);
  }
  for (const file of staged) {
    if (!supported.test(file)) continue;
    const info = await prettier.getFileInfo(file, {
      ignorePath: path.join(root, ".prettierignore"),
    });
    if (info.ignored) continue;
    const content = git("show", `:${file}`).toString("utf8");
    if (!(await prettier.check(content, await optionsFor(file))))
      failures.push(`${file} (index)`);
  }
  for (const file of committed) {
    if (!supported.test(file)) continue;
    const info = await prettier.getFileInfo(file, {
      ignorePath: path.join(root, ".prettierignore"),
    });
    if (info.ignored) continue;
    const content = git("show", `HEAD:${file}`).toString("utf8");
    if (!(await prettier.check(content, await optionsFor(file))))
      failures.push(`${file} (HEAD)`);
  }
  if (failures.length) {
    console.error(`Prettier check failed:\n${failures.join("\n")}`);
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Prettier check passed for ${changed.size} changed paths and ${staged.length} staged paths.\n`,
    );
  }
} catch (error) {
  console.error(`Prettier check could not run: ${error.message}`);
  process.exitCode = 1;
}
