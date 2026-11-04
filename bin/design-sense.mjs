#!/usr/bin/env node
// design-sense CLI — deterministic UI lint. No network, no dependencies.
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkText, kindOf } from '../lib/detector.mjs';
import { RULES, RULE_MAP, SEVERITIES } from '../lib/rules.mjs';

const VERSION = '0.1.0';
const SKIP_DIRS = new Set(['node_modules', '.git', 'target', 'dist', 'build', '.next', 'out', 'vendor', 'coverage', '.venv']);

function usage() {
  return `design-sense ${VERSION}
Usage:
  design-sense check <paths...> [--json] [--fail-on P1] [--min P3] [--config file] [--no-color]
  design-sense rules [--json]          list rules
  design-sense explain <rule-id>       explain one rule
Exit codes: 0 = nothing at/above --fail-on (default P1), 1 = findings, 2 = usage/IO error.
Config: .design-sense.json  { "rules": { "<id>": "off" | "P0".."P3" }, "ignore": ["glob", ...] }
Inline: design-sense-disable-next-line <rule>, design-sense-disable-line, design-sense-disable <rule>, design-sense-ignore-file`;
}

function globToRe(g) {
  const s = g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*\/?/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]').replace(/\u0000/g, '.*');
  return new RegExp(`(^|/)${s}($|/)`);
}

function findConfig(start) {
  let d = resolve(start);
  try { if (!statSync(d).isDirectory()) d = dirname(d); } catch { d = process.cwd(); }
  for (;;) {
    const f = join(d, '.design-sense.json');
    if (existsSync(f)) return f;
    const p = dirname(d);
    if (p === d) return null;
    d = p;
  }
}

function loadConfig(path) {
  const cfg = { rules: {}, ignore: [] };
  if (!path) return cfg;
  const j = JSON.parse(readFileSync(path, 'utf8'));
  Object.assign(cfg.rules, j.rules || {});
  cfg.ignore.push(...(j.ignore || []));
  const ig = join(dirname(path), '.design-senseignore');
  if (existsSync(ig)) cfg.ignore.push(...readFileSync(ig, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#')));
  return cfg;
}

function collect(p, out, ignore, base) {
  let st;
  try { st = statSync(p); } catch { throw new Error(`cannot read ${p}`); }
  const rel = relative(base, p).replace(/\\/g, '/');
  if (rel && ignore.some((re) => re.test(rel))) return;
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) if (!SKIP_DIRS.has(e) && !e.startsWith('.')) collect(join(p, e), out, ignore, base);
  } else if (kindOf(p)) out.push(p);
}

const C = { P0: '\x1b[41;97m', P1: '\x1b[31m', P2: '\x1b[33m', P3: '\x1b[36m', dim: '\x1b[2m', off: '\x1b[0m' };

export function run(argv, io = { out: (s) => process.stdout.write(s + '\n'), err: (s) => process.stderr.write(s + '\n') }) {
  const args = [...argv];
  const cmd = args.shift();
  const flag = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
  const bool = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
  if (!cmd || cmd === '-h' || cmd === '--help') { io.out(usage()); return cmd ? 0 : 2; }
  if (cmd === '--version' || cmd === '-v') { io.out(VERSION); return 0; }
  if (cmd === 'rules') {
    if (bool('--json')) io.out(JSON.stringify(RULES, null, 2));
    else for (const r of RULES) io.out(`${r.severity}  ${r.id.padEnd(28)} ${r.title}`);
    return 0;
  }
  if (cmd === 'explain') {
    const r = RULE_MAP[args[0]];
    if (!r) { io.err(`unknown rule: ${args[0]}`); return 2; }
    io.out(`${r.id} (${r.severity}) — ${r.title}\nApplies to: ${r.langs.join(', ')}\nWhy: ${r.why}\nFix: ${r.fix}`);
    return 0;
  }
  if (cmd !== 'check') { io.err(usage()); return 2; }
  const json = bool('--json') || flag('--format') === 'json';
  const noColor = bool('--no-color') || !process.stdout.isTTY || process.env.NO_COLOR;
  const failOn = flag('--fail-on') || 'P1';
  const min = flag('--min') || 'P3';
  const cfgPath = flag('--config');
  if (![failOn, min].every((s) => SEVERITIES.includes(s) || s === 'none')) { io.err('severity must be P0..P3 (or none for --fail-on)'); return 2; }
  const paths = args.length ? args : ['.'];
  let files = [];
  let cfg;
  try {
    cfg = loadConfig(cfgPath || findConfig(paths[0]));
    const ignore = cfg.ignore.map(globToRe);
    for (const p of paths) collect(p, files, ignore, process.cwd());
  } catch (e) { io.err(`design-sense: ${e.message}`); return 2; }
  files = [...new Set(files)];
  const rank = (s) => SEVERITIES.indexOf(s);
  let findings = [];
  for (const f of files) {
    let text;
    try { text = readFileSync(f, 'utf8'); } catch { continue; }
    findings.push(...checkText(text, relative(process.cwd(), f).replace(/\\/g, '/') || f, { config: cfg }));
  }
  findings = findings.filter((x) => rank(x.severity) <= rank(min));
  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, findings.filter((x) => x.severity === s).length]));
  const failing = failOn === 'none' ? 0 : findings.filter((x) => rank(x.severity) <= rank(failOn)).length;
  if (json) io.out(JSON.stringify({ version: VERSION, files: files.length, counts, findings }, null, 2));
  else {
    const col = (k, s) => (noColor ? s : C[k] + s + C.off);
    let last = '';
    for (const x of findings) {
      if (x.file !== last) { io.out(`\n${x.file}`); last = x.file; }
      io.out(`  ${String(x.line).padStart(4)}:${String(x.col).padEnd(3)} ${col(x.severity, x.severity)} ${x.rule}  ${x.message}`);
      io.out(col('dim', `            fix: ${x.fix}`));
    }
    io.out(`\n${files.length} file(s), ${findings.length} finding(s): P0 ${counts.P0} · P1 ${counts.P1} · P2 ${counts.P2} · P3 ${counts.P3}`);
  }
  return failing ? 1 : 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
process.stdout.on('error', (e) => { if (e.code === 'EPIPE') process.exit(process.exitCode ?? 0); });
if (isMain) process.exitCode = run(process.argv.slice(2));
