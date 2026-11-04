import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { plan, apply } from '../install.mjs';

test('installer: dry plan writes nothing; apply is idempotent', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-'));
  writeFileSync(join(dir, 'AGENTS.md'), '# mine\n');
  const steps = plan({ target: dir });
  assert.ok(steps.length >= 10);
  assert.ok(!existsSync(join(dir, '.design-sense')));
  assert.ok(steps.every((s) => s.to.startsWith(dir)), 'no writes outside the project without --global');
  apply(steps);
  apply(plan({ target: dir }));
  const agents = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(agents.startsWith('# mine'));
  assert.equal(agents.match(/design-sense:start/g).length, 1);
  const s = JSON.parse(readFileSync(join(dir, '.claude/settings.json'), 'utf8'));
  assert.equal(s.hooks.PostToolUse.length, 1);
  assert.ok(existsSync(join(dir, '.cursor/rules/design-sense.mdc')));
});
