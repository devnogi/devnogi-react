import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(
    /\r\n/g,
    "\n",
  );
const ci = read(".github/workflows/pr-verify.yml");
const production = read(".github/workflows/push-cd-prod.yml");

test("PR verification is delegated to a full-SHA shared React workflow", () => {
  assert.match(
    ci,
    /pull_request:\n    branches: \[main\]\n  workflow_dispatch:/,
  );
  assert.match(
    ci,
    /devnogi\/ci-workflows\/\.github\/workflows\/node-ci\.yml@[0-9a-f]{40}/,
  );
  assert.match(ci, /permissions:\n  contents: read/);
  assert.match(ci, /\n  workflow-contract:\n/);
  assert.match(ci, /\n  ci:\n\s+needs: workflow-contract\n/);
  assert.doesNotMatch(ci, /node-prod\.yml|\bpush:/);
});

test("production uses the pinned shared workflow only on main push or dispatch", () => {
  assert.match(
    production,
    /push:\n    branches: \[main\]\n  workflow_dispatch:/,
  );
  assert.doesNotMatch(production, /pull_request:/);
  assert.match(production, /github\.ref == 'refs\/heads\/main'/);
  assert.match(
    production,
    /devnogi\/ci-workflows\/\.github\/workflows\/node-prod\.yml@[0-9a-f]{40}/,
  );
  assert.match(production, /permissions:\n  contents: write/);
  assert.match(
    production,
    /concurrency:\n  group: react-production\n  cancel-in-progress: false/,
  );
  assert.match(production, /\n  workflow-contract:\n/);
  assert.match(production, /\n  production:\n\s+needs: workflow-contract\n/);
  for (const input of [
    "service-name: react",
    "deployment-target: prod2",
    "public-origin: https://www.memonogi.com",
    "dockerfile: Dockerfile",
    "compose-file: docker-compose-prod.yml",
    "platform: linux/amd64",
    "secrets: inherit",
  ]) {
    assert.ok(production.includes(input), input);
  }
  assert.match(production, /health-timeout: ["']600["']/);
});

test("production Compose requires the immutable image reference", () => {
  assert.match(read("docker-compose-prod.yml"), /image: \$\{IMAGE_REF:\?/);
});

test("package and lockfile agree on the next release version", () => {
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(pkg.version, "1.0.2");
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
});
