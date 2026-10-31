import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8").replace(
    /\r\n/g,
    "\n",
  );
// prettier-ignore
const pin = 'c5b33bfa84762986d47037f5ce3eca14a1c516ca';
const ci = read(".github/workflows/pr-verify.yml");
const production = read(".github/workflows/push-cd-prod.yml");

test("PR caller targets the approved reusable React CI", () => {
  assert.match(
    ci,
    /pull_request:\n    branches: \[main\]\n  workflow_dispatch:/,
  );
  assert.match(ci, new RegExp(`node-ci\\.yml@${pin}`));
  assert.doesNotMatch(ci, /node-prod\.yml|\bpush:/);
  assert.match(ci, /node --test scripts\/workflow-contract\.test\.mjs/);
  assert.match(ci, /ci:\s*\n\s*needs: workflow-contract/);
});

test("production caller only permits main push or manual dispatch", () => {
  assert.match(
    production,
    /push:\n    branches: \[main\]\n  workflow_dispatch:/,
  );
  assert.doesNotMatch(production, /pull_request:/);
  assert.match(
    production,
    /if: github\.ref == 'refs\/heads\/main' && \(github\.event_name == 'push' \|\| github\.event_name == 'workflow_dispatch'\)/,
  );
  assert.match(production, new RegExp(`node-prod\\.yml@${pin}`));
  assert.match(production, /permissions:\n  contents: write/);
  assert.match(
    production,
    /concurrency:\n  group: react-production\n  cancel-in-progress: false/,
  );
  assert.match(production, /production:\s*\n\s*needs: workflow-contract/);
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

test("release version and immutable image contract are fixed", () => {
  assert.match(
    read("scripts/workflow-contract.test.mjs"),
    /const pin = '[0-9a-f]{40}';/,
  );
  const pkg = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(pkg.version, "1.0.2");
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
  assert.match(
    read("docker-compose-prod.yml"),
    /nextjs-app:\s*[\s\S]*?image: \$\{IMAGE_REF:\?IMAGE_REF is required\}/,
  );
  assert.match(
    read("Dockerfile"),
    /FROM node:20-alpine AS runner\s+ARG APP_REVISION\s+ENV APP_REVISION=\$\{APP_REVISION\}/,
  );
});
