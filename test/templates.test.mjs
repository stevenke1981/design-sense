import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkText } from '../lib/detector.mjs';

const root = fileURLToPath(new URL('../templates/premium/', import.meta.url));
const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) return n === 'render' ? [] : walk(p);
  return /\.(html|css|slint|svg)$/.test(n) ? [p] : [];
});

const files = walk(root);
test('premium templates exist', () => assert.ok(files.length >= 8, `found ${files.length}`));
for (const f of files) {
  test(`premium template is clean: ${f.slice(root.length)}`, () => {
    const found = checkText(readFileSync(f, 'utf8'), f);
    assert.deepEqual(found.map((x) => `${x.rule} ${x.message}`), []);
  });
}
test('premium reference is linked from SKILL.md', () => {
  const skill = readFileSync(new URL('../skills/design-sense/SKILL.md', import.meta.url), 'utf8');
  assert.match(skill, /reference\/premium-glass-metal\.md/);
});
