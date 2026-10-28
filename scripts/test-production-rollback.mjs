import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const bash = process.env.DEPLOY_TEST_BASH || (process.platform === 'win32' ? join(process.env.LOCALAPPDATA, 'Programs/Git/bin/bash.exe') : 'bash');
const workflow = readFileSync(new URL('../.github/workflows/push-cd-prod.yml', import.meta.url), 'utf8');
const blocks = [...workflow.matchAll(/ssh -i [^\n]+ << 'EOF'\r?\n([\s\S]*?)\r?\n\s+EOF/g)].map((match) => match[1]);
assert.equal(blocks.length, 3);

function fixture(t, scenario) {
  const root = mkdtempSync(join(tmpdir(), 'react-deploy-fixture-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, 'bin');
  mkdirSync(bin);
  for (const [name, contents] of Object.entries({
    'docker-compose-prod.yml': 'old-compose', '.env.prod': 'old-env',
    '.candidate-compose-42-2.yml': 'new-compose',
  })) writeFileSync(join(root, name), contents);
  writeFileSync(join(bin, 'docker'), `#!/bin/sh\ncase "$1 $2" in\n 'inspect --format') echo sha256:old ;;\n 'inspect --format='*) echo healthy ;;\n 'pull '* ) [ "$SCENARIO" != pull-fail ] ;;\n 'compose '* ) case "$*" in *--no-deps*) if [ "$SCENARIO" = start-fail ] && [ ! -f "$FIXTURE/start-failed" ]; then touch "$FIXTURE/start-failed"; exit 1; fi;; esac ;;\n 'ps '* ) echo container ;;\n *) exit 0 ;;\nesac\n`, { mode: 0o755 });
  writeFileSync(join(bin, 'curl'), `#!/bin/sh\nif [ "$SCENARIO" = rollback-fail ]; then exit 1; fi\ncase "$*" in *%\{http_code\}*) if [ "$SCENARIO" = smoke-fail ]; then printf 500; else printf 200; fi ;; *) printf '{"status":"ok"}' ;; esac\n`, { mode: 0o755 });
  writeFileSync(join(bin, 'sleep'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
  const body = (index) => blocks[index]
    .replace('cd ~/devnogi-react', `cd '${root.replaceAll('\\', '/')}'`)
    .replaceAll('${{ github.run_id }}', '42').replaceAll('${{ github.run_attempt }}', '2')
    .replaceAll('${{ secrets.ENV_FILE_PROD }}', 'new-env')
    .replaceAll('${{ secrets.DOCKER_USERNAME }}', 'fixture').replaceAll('${{ secrets.DOCKER_REPO }}', 'app')
    .replaceAll('${{ steps.image.outputs.digest }}', `sha256:${'a'.repeat(64)}`);
  const run = (index) => spawnSync(bash, ['-c', `if command -v cygpath >/dev/null; then FIXTURE=$(cygpath -u "$FIXTURE"); fi\nexport FIXTURE PATH="$FIXTURE/bin:$PATH"\n${body(index)}`], {
    env: { ...process.env, FIXTURE: root.replaceAll('\\', '/'), SCENARIO: scenario },
    encoding: 'utf8', timeout: 10000,
  });
  return { root, run };
}

test('rerun early failure cannot consume a previous attempt marker', (t) => {
  const { root, run } = fixture(t, 'pull-fail');
  writeFileSync(join(root, '.deployment-in-progress'), '42-1\n');
  assert.notEqual(run(0).status, 0);
  assert.equal(run(2).status, 0);
  assert.equal(readFileSync(join(root, 'docker-compose-prod.yml'), 'utf8'), 'old-compose');
});

test('start failure rolls back previous compose and environment', (t) => {
  const { root, run } = fixture(t, 'start-fail');
  assert.notEqual(run(0).status, 0);
  assert.equal(run(2).status, 0);
  assert.equal(readFileSync(join(root, 'docker-compose-prod.yml'), 'utf8'), 'old-compose');
  assert.equal(readFileSync(join(root, '.env.prod'), 'utf8'), 'old-env');
  assert.equal(existsSync(join(root, '.deployment-in-progress')), false);
});

test('rollback failure preserves the in-progress marker', (t) => {
  const { root, run } = fixture(t, 'rollback-fail');
  assert.equal(run(0).status, 0);
  assert.notEqual(run(2).status, 0);
  assert.equal(existsSync(join(root, '.deployment-in-progress')), true);
});

test('smoke failure restores the previous release', (t) => {
  const { root, run } = fixture(t, 'smoke-fail');
  assert.equal(run(0).status, 0);
  assert.notEqual(run(1).status, 0);
  assert.equal(run(2).status, 0);
  assert.equal(readFileSync(join(root, 'docker-compose-prod.yml'), 'utf8'), 'old-compose');
});

test('successful health check clears the marker', (t) => {
  const { root, run } = fixture(t, 'success');
  assert.equal(run(0).status, 0);
  assert.equal(run(1).status, 0);
  assert.equal(existsSync(join(root, '.deployment-in-progress')), false);
});
