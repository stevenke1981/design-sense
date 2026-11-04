#!/usr/bin/env node
// design-sense post-edit hook. Local-only, read-only, FAIL-OPEN:
// it never blocks the agent, never writes files, never touches the network.
// Input: hook JSON on stdin (Claude Code PostToolUse, Cursor afterFileEdit, or {"file_path": "..."}).
// Output: for Claude Code, JSON with hookSpecificOutput.additionalContext so the agent sees findings.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 512 * 1024;
const SHOW = new Set(['P0', 'P1', 'P2']);

export async function handle(raw, { cwd = process.cwd() } = {}) {
  let input = {};
  try { input = raw ? JSON.parse(raw) : {}; } catch { return null; }
  const ti = input.tool_input || input.toolInput || {};
  const candidates = [ti.file_path, ti.path, ti.filePath, input.file_path, input.filePath].filter((x) => typeof x === 'string');
  const files = [...new Set(candidates)];
  if (!files.length) return null;
  const { checkText, kindOf } = await import('../lib/detector.mjs');
  const root = input.cwd || cwd;
  const lines = [];
  for (const f of files) {
    const abs = isAbsolute(f) ? f : resolve(root, f);
    if (!kindOf(abs) || !existsSync(abs) || statSync(abs).size > MAX_BYTES) continue;
    const rel = relative(root, abs).replace(/\\/g, '/') || abs;
    const findings = checkText(readFileSync(abs, 'utf8'), rel).filter((x) => SHOW.has(x.severity)).slice(0, 15);
    for (const x of findings) lines.push(`- ${x.severity} ${x.rule} ${rel}:${x.line} — ${x.message}. Fix: ${x.fix}`);
  }
  if (!lines.length) return null;
  const text = `design-sense found ${lines.length} UI issue(s) in the file you just edited. Fix them if they are in scope (or suppress with a design-sense-disable-next-line comment if intentional):\n${lines.join('\n')}`;
  return { hookSpecificOutput: { hookEventName: input.hook_event_name || 'PostToolUse', additionalContext: text } };
}

async function main() {
  let raw = '';
  try {
    for await (const chunk of process.stdin) { raw += chunk; if (raw.length > 4 * 1024 * 1024) break; }
    const out = await handle(raw);
    if (out) process.stdout.write(JSON.stringify(out));
  } catch { /* fail open */ }
  process.exit(0);
}

const self = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === resolve(self)) {
  const timer = setTimeout(() => process.exit(0), 5000); // never hang the agent
  timer.unref();
  main();
}
