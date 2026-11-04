import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { handle } from '../hooks/post-edit.mjs';

const hook = fileURLToPath(new URL('../hooks/post-edit.mjs', import.meta.url));
const bad = fileURLToPath(new URL('./fixtures/bad.slint', import.meta.url));
const good = fileURLToPath(new URL('./fixtures/good.slint', import.meta.url));

test('hook reports findings for a bad file as additionalContext', async () => {
  const out = await handle(JSON.stringify({ hook_event_name: 'PostToolUse', tool_name: 'Edit', tool_input: { file_path: bad } }));
  assert.equal(out.hookSpecificOutput.hookEventName, 'PostToolUse');
  assert.match(out.hookSpecificOutput.additionalContext, /a11y\/contrast/);
});

test('hook is silent for clean or non-UI files', async () => {
  assert.equal(await handle(JSON.stringify({ tool_input: { file_path: good } })), null);
  assert.equal(await handle(JSON.stringify({ tool_input: { file_path: '/etc/hostname' } })), null);
});

test('hook fails open: garbage, missing file, empty stdin → exit 0', () => {
  for (const input of ['not json', '', JSON.stringify({ tool_input: { file_path: '/nope/x.html' } })]) {
    const r = spawnSync(process.execPath, [hook], { input, encoding: 'utf8' });
    assert.equal(r.status, 0);
  }
  const r = spawnSync(process.execPath, [hook], { input: JSON.stringify({ tool_input: { file_path: bad } }), encoding: 'utf8' });
  assert.equal(r.status, 0);
  assert.ok(JSON.parse(r.stdout).hookSpecificOutput.additionalContext.includes('design-sense'));
});
