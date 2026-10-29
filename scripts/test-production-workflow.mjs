import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(
    /\r\n/g,
    "\n",
  );
const revision = "5c46d7aff8ce452b72ad8f6c18bcb5a09828384d";
const ci = read(".github/workflows/pr-verify.yml");
const production = read(".github/workflows/push-cd-prod.yml");

test("PR verification preserves existing checks and adds the pinned shared React workflow", () => {
  assert.match(
    ci,
    /pull_request:\n    branches: \[main\]\n  workflow_dispatch:/,
  );
  assert.match(ci, new RegExp(`node-ci\\.yml@${revision}`));
  assert.match(ci, /permissions:\n  contents: read/);
  assert.match(ci, /\n  secret-scan:\n/);
  assert.match(ci, /\n  verify:\n/);
  assert.match(ci, /\n  common-verification:\n/);
  assert.doesNotMatch(ci, /node-prod\.yml|\bpush:/);
});

test("production uses the pinned shared workflow only on main push or dispatch", () => {
  assert.match(
    production,
    /push:\n    branches: \[main\]\n  workflow_dispatch:/,
  );
  assert.doesNotMatch(production, /pull_request:/);
  assert.match(production, /github\.ref == 'refs\/heads\/main'/);
  assert.match(production, new RegExp(`node-prod\\.yml@${revision}`));
  assert.match(production, /permissions:\n  contents: write/);
  for (const input of [
    "service-name: react",
    "dockerfile: Dockerfile",
    "compose-file: docker-compose-prod.yml",
    'health-timeout: "600"',
    "platform: linux/amd64",
    "secrets: inherit",
  ]) {
    assert.ok(production.includes(input), input);
  }
});

test("production Compose requires the immutable image reference", () => {
  assert.match(read("docker-compose-prod.yml"), /image: \$\{IMAGE_REF:\?/);
});
