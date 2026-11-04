import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { checkText } from '../lib/detector.mjs';
import { RULES } from '../lib/rules.mjs';
import { contrastRatio, parseColor } from '../lib/color.mjs';
import { run } from '../bin/design-sense.mjs';

const fx = (n) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');
const rules = (n) => new Set(checkText(fx(n), n).map((f) => f.rule));

const EXPECT = {
  'bad.html': ['slop/inter-only', 'slop/purple-blue-gradient', 'slop/gradient-text', 'slop/nested-cards', 'slop/icon-tile-heading',
    'slop/pill-overuse', 'slop/emoji-icons', 'slop/hype-copy', 'slop/side-stripe', 'a11y/contrast', 'type/tiny-font',
    'cjk/italic', 'cjk/line-height', 'cjk/missing-font', 'cjk/negative-tracking', 'cjk/break-all', 'html/lang-missing',
    'a11y/img-alt', 'a11y/input-label', 'a11y/button-name', 'a11y/heading-skip', 'a11y/focus-removed', 'a11y/reduced-motion',
    'a11y/click-div', 'a11y/empty-link', 'a11y/zoom-disabled', 'a11y/positive-tabindex', 'layout/cramped-button',
    'layout/fixed-width', 'layout/100vh', 'layout/z-index-war', 'perf/img-dimensions', 'perf/transition-all'],
  'bad.jsx': ['slop/purple-blue-gradient', 'slop/emoji-icons', 'slop/hype-copy', 'type/tiny-font', 'a11y/heading-skip',
    'a11y/img-alt', 'a11y/button-name', 'a11y/focus-removed', 'a11y/click-div'],
  'bad.slint': ['a11y/contrast', 'cjk/italic', 'slint/default-font', 'slint/hardcoded-colors', 'slint/icon-button-tooltip',
    'slint/window-min-size', 'slint/touch-area-a11y', 'slop/emoji-icons', 'slop/purple-blue-gradient', 'type/tiny-font'],
  'bad.svg': ['svg/no-viewbox'],
};

for (const [file, ids] of Object.entries(EXPECT)) {
  test(`${file} triggers expected rules`, () => {
    const got = rules(file);
    for (const id of ids) assert.ok(got.has(id), `${file}: expected ${id}; got ${[...got].join(', ')}`);
  });
}

for (const file of readdirSync(new URL('./fixtures/', import.meta.url)).filter((f) => f.startsWith('good.'))) {
  test(`${file} is clean`, () => assert.deepEqual(checkText(fx(file), file).map((f) => `${f.rule}:${f.line}`), []));
}

test('every rule has docs and a valid severity', () => {
  for (const r of RULES) { assert.match(r.severity, /^P[0-3]$/); assert.ok(r.why && r.fix && r.title && r.langs.length, r.id); }
  assert.equal(new Set(RULES.map((r) => r.id)).size, RULES.length);
});

test('every rule is exercised by a bad fixture', () => {
  const covered = new Set(Object.values(EXPECT).flat());
  const missing = RULES.map((r) => r.id).filter((id) => !covered.has(id) && !['a11y/gray-on-color', 'color/too-many', 'slop/glass-everywhere', 'slop/center-everything', 'css/important-overuse', 'type/tight-line-height', 'layout/viewport-missing'].includes(id));
  assert.deepEqual(missing, []);
});

test('WCAG contrast math', () => {
  assert.equal(contrastRatio(parseColor('#000'), parseColor('#fff')).toFixed(1), '21.0');
  assert.equal(contrastRatio(parseColor('#777'), parseColor('#fff')).toFixed(2), '4.48');
  assert.equal(contrastRatio(parseColor('rgb(255,255,255)'), parseColor('hsl(0, 0%, 0%)')).toFixed(0), '21');
});

test('rules that need separate snippets', () => {
  const has = (src, file, id) => assert.ok(checkText(src, file).some((f) => f.rule === id), id);
  has('.a{color:#b0b0b0;background:#1d4ed8;font-size:28px}', 'x.css', 'a11y/gray-on-color');
  has(Array.from({ length: 16 }, (_, i) => `.c${i}{color:#${(0x101010 * (i + 1)).toString(16).padStart(6, '0')}}`).join(''), 'x.css', 'color/too-many');
  has('.a,.b,.c{backdrop-filter:blur(8px)}', 'x.css', 'slop/glass-everywhere');
  has(Array.from({ length: 8 }, (_, i) => `.t${i}{text-align:center}`).join(''), 'x.css', 'slop/center-everything');
  has('.a{color:red !important;}'.repeat(10), 'x.css', 'css/important-overuse');
  has('p{line-height:1.1}', 'x.css', 'type/tight-line-height');
  has('<html lang="en"><head></head><body></body></html>', 'x.html', 'layout/viewport-missing');
});

test('suppressions and config', () => {
  const src = '.a{\n/* design-sense-disable-next-line type/tiny-font */\nfont-size:9px}';
  assert.equal(checkText('.a{font-size:9px}', 'x.css').length, 1);
  assert.equal(checkText('.a{font-size:9px} /* design-sense-disable-line */', 'x.css').length, 0);
  assert.equal(checkText('.a{font-size:9px}', 'x.css', { config: { rules: { 'type/tiny-font': 'off' } } }).length, 0);
  assert.equal(checkText('.a{font-size:9px}', 'x.css', { config: { rules: { 'type/tiny-font': 'P3' } } })[0].severity, 'P3');
  assert.equal(checkText('/* design-sense-ignore-file */ .a{font-size:9px}', 'x.css').length, 0);
  void src;
});

test('CLI exit codes and JSON', () => {
  const out = [];
  const io = { out: (s) => out.push(s), err: (s) => out.push(s) };
  const cfg = ['--config', new URL('./empty-config.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')];
  const dir = new URL('./fixtures/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
  assert.equal(run(['check', dir + 'good.html', ...cfg], io), 0);
  assert.equal(run(['check', dir + 'bad.html', ...cfg], io), 1);
  assert.equal(run(['check', dir + 'bad.html', ...cfg, '--fail-on', 'none'], io), 0);
  assert.equal(run(['check', dir + 'nope.html'], io), 2);
  out.length = 0;
  run(['check', dir + 'bad.svg', ...cfg, '--json'], io);
  const j = JSON.parse(out.join('\n'));
  assert.equal(j.findings[0].rule, 'svg/no-viewbox');
  assert.equal(run(['explain', 'cjk/italic'], io), 0);
  assert.equal(run(['explain', 'nope'], io), 2);
});
