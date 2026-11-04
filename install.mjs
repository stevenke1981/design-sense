#!/usr/bin/env node
// design-sense installer: COPIES files into a project. Shows the plan first.
// No network, no curl|bash, no global changes unless --global is given explicitly.
import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));
const ALL = ['core', 'claude', 'claude-hook', 'cursor', 'agents', 'copilot', 'gemini'];

function parse(argv) {
  const o = { target: '.', only: null, dryRun: false, yes: false, global: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run' || a === '-n') o.dryRun = true;
    else if (a === '--yes' || a === '-y') o.yes = true;
    else if (a === '--global') o.global = true;
    else if (a === '--only') o.only = argv[++i].split(',');
    else if (a === '-h' || a === '--help') o.help = true;
    else o.target = a;
  }
  return o;
}

const SNIPPET = (name) => readFileSync(join(SRC, 'adapters', `${name}.snippet.md`), 'utf8');
function upsertBlock(file, block) {
  const cur = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const re = /<!-- design-sense:start -->[\s\S]*?<!-- design-sense:end -->\n?/;
  return re.test(cur) ? cur.replace(re, block) : (cur ? cur.replace(/\n*$/, '\n\n') : '') + block;
}
function mergeHooks(file, add) {
  const cur = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
  cur.hooks ??= {};
  for (const [ev, entries] of Object.entries(add.hooks)) {
    cur.hooks[ev] ??= [];
    const already = JSON.stringify(cur.hooks[ev]).includes('design-sense');
    if (!already) cur.hooks[ev].push(...entries);
  }
  return JSON.stringify(cur, null, 2) + '\n';
}

export function plan(opts) {
  const T = resolve(opts.target);
  const parts = opts.only || ALL;
  const steps = [];
  const copy = (from, to) => steps.push({ kind: 'copy', from: join(SRC, from), to: join(T, to), label: `copy ${from} → ${to}` });
  const write = (to, content, label) => steps.push({ kind: 'write', to, content, label });
  if (parts.includes('core')) { copy('bin', '.design-sense/bin'); copy('lib', '.design-sense/lib'); copy('hooks', '.design-sense/hooks'); copy('skills', '.design-sense/skills'); copy('LICENSE', '.design-sense/LICENSE'); }
  if (parts.includes('claude')) copy('skills/design-sense', '.claude/skills/design-sense');
  if (parts.includes('claude-hook')) {
    const f = join(T, '.claude/settings.json');
    write(f, mergeHooks(f, JSON.parse(readFileSync(join(SRC, 'adapters/claude-code/settings.hooks.json'), 'utf8'))), 'merge PostToolUse hook into .claude/settings.json');
  }
  if (parts.includes('cursor')) copy('adapters/cursor/design-sense.mdc', '.cursor/rules/design-sense.mdc');
  if (parts.includes('agents')) write(join(T, 'AGENTS.md'), upsertBlock(join(T, 'AGENTS.md'), SNIPPET('AGENTS')), 'add design-sense block to AGENTS.md');
  if (parts.includes('copilot')) write(join(T, '.github/copilot-instructions.md'), upsertBlock(join(T, '.github/copilot-instructions.md'), SNIPPET('copilot-instructions')), 'add block to .github/copilot-instructions.md');
  if (parts.includes('gemini')) write(join(T, 'GEMINI.md'), upsertBlock(join(T, 'GEMINI.md'), SNIPPET('GEMINI')), 'add block to GEMINI.md');
  if (opts.global) {
    const g = join(homedir(), '.claude/skills/design-sense');
    steps.push({ kind: 'copy', from: join(SRC, 'skills/design-sense'), to: g, label: `copy skill → ${g} (GLOBAL, because --global)` });
  }
  return steps;
}

export function apply(steps) {
  for (const s of steps) {
    mkdirSync(dirname(s.to), { recursive: true });
    if (s.kind === 'copy') cpSync(s.from, s.to, { recursive: true });
    else writeFileSync(s.to, s.content);
  }
}

async function main() {
  const o = parse(process.argv.slice(2));
  if (o.help) {
    console.log(`node install.mjs [project-dir] [--dry-run] [--yes] [--only ${ALL.join(',')}] [--global]`);
    return;
  }
  const steps = plan(o);
  console.log(`design-sense will change ${resolve(o.target)}:`);
  for (const s of steps) console.log(`  ${existsSync(s.to) ? '~' : '+'} ${s.label}`);
  if (o.dryRun) { console.log('\n(dry run: nothing written)'); return; }
  if (!o.yes) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ans = (await rl.question('\nProceed? [y/N] ')).trim().toLowerCase();
    rl.close();
    if (ans !== 'y' && ans !== 'yes') { console.log('Aborted. Nothing written.'); return; }
  }
  apply(steps);
  console.log('Done. Try: node .design-sense/bin/design-sense.mjs check .');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(2); });
