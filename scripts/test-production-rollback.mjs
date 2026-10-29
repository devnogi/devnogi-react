import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const production = readFileSync(
  new URL("../.github/workflows/push-cd-prod.yml", import.meta.url),
  "utf8",
);

test("rollback implementation stays in the pinned reusable workflow", () => {
  assert.match(
    production,
    /devnogi\/ci-workflows\/\.github\/workflows\/node-prod\.yml@[0-9a-f]{40}/,
  );
  assert.doesNotMatch(
    production,
    /ssh |scp |docker login|docker compose|latest|:prod\b/,
  );
  assert.match(production, /secrets: inherit/);
});
