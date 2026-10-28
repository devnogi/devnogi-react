import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('production deploy uses the built digest and restores the prior release', () => {
  const workflow = readFileSync(new URL('../.github/workflows/push-cd-prod.yml', import.meta.url), 'utf8');
  const compose = readFileSync(new URL('../docker-compose-prod.yml', import.meta.url), 'utf8');
  assert.match(workflow, /push:\s*\n\s*branches: \[main\]/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /steps\.image\.outputs\.digest/);
  assert.match(workflow, /\.previous-image-id/);
  assert.match(workflow, /\.previous-compose\.yml/);
  assert.match(workflow, /if: failure\(\)/);
  assert.match(workflow, /Rollback health check failed/);
  assert.doesNotMatch(workflow, /docker compose[^\n]* down/);
  assert.match(compose, /image: \$\{IMAGE_REF:\?/);
});
