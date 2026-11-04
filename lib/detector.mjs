// design-sense detector: deterministic, dependency-free, no network.
import { RULE_MAP } from './rules.mjs';
import { parseColor, contrastRatio, toHsl, COLOR_RE } from './color.mjs';

const CJK_RE = /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;
const CJK_FONTS = /jhenghei|yahei|pingfang|noto\s*(sans|serif)\s*(tc|sc|hk|jp|cjk)|source\s*han|hiragino|heiti|mingliu|pmingliu|simsun|simhei|songti|kaiti|biaukai|dfkai|lxgw|taipei\s*sans|genyo|gensen|cwtex|huninn|cjk/i;
const EMOJI_RE = /(?![\u00a9\u00ae\u2122\u2190-\u21ff\u2500-\u27bf])\p{Extended_Pictographic}/u;
const HYPE_RE = /\b(unlock the (full )?power|supercharge|seamless(ly)?|elevate your|revolutioni[sz]e|next[- ]level|cutting[- ]edge|game[- ]?chang(er|ing)|effortless(ly)?|unleash|empower your|in today's fast-paced)\b/i;

export function kindOf(file) {
  const ext = (file.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
  return ({ html: 'html', htm: 'html', css: 'css', scss: 'css', less: 'css', tsx: 'jsx', jsx: 'jsx',
    vue: 'vue', svelte: 'svelte', slint: 'slint', svg: 'svg' })[ext] || null;
}

// Replace comments with spaces (keeps offsets/line numbers stable).
function blank(s) { return s.replace(/[^\n]/g, ' '); }
function stripComments(text, kind) {
  let t = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (kind === 'html' || kind === 'vue' || kind === 'svelte' || kind === 'svg') t = t.replace(/<!--[\s\S]*?-->/g, blank);
  if (kind === 'slint' || kind === 'jsx') t = t.replace(/(^|[^:"'\\])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
  return t;
}

function lineCol(text, idx) {
  let line = 1, last = -1;
  for (let i = 0; i < idx && i < text.length; i++) if (text.charCodeAt(i) === 10) { line++; last = i; }
  return { line, col: idx - last };
}

// ---- CSS block extraction --------------------------------------------------
// Returns [{selector, body, offset}] for innermost blocks, from CSS text located at `base`.
function cssBlocks(css, base = 0) {
  const out = [];
  const re = /([^{}]*)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css))) out.push({ selector: m[1].trim(), body: m[2], offset: base + m.index + m[1].length });
  return out;
}
function decls(body) {
  const out = {};
  for (const part of body.split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    const k = part.slice(0, i).trim().toLowerCase();
    if (k) out[k] = part.slice(i + 1).trim();
  }
  return out;
}

// Collect CSS sources: whole file for css, <style> blocks + style="" attrs for markup.
function cssSources(text, kind) {
  if (kind === 'css') return { css: text, blocks: cssBlocks(text) };
  const blocks = [];
  let css = '';
  const st = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = st.exec(text))) {
    const start = m.index + m[0].indexOf('>') + 1;
    css += m[1] + '\n';
    blocks.push(...cssBlocks(m[1], start));
  }
  const sa = /<([a-zA-Z][\w-]*)\b[^>]*?\sstyle="([^"]*)"/g;
  while ((m = sa.exec(text))) { blocks.push({ selector: m[1], body: m[2], offset: m.index, inline: true }); css += m[2] + ';\n'; }
  // styled-components / css`` template literals in jsx
  if (kind === 'jsx') {
    const tl = /(?:styled\.\w+|css|createGlobalStyle)`([\s\S]*?)`/g;
    while ((m = tl.exec(text))) { css += m[1] + '\n'; blocks.push({ selector: 'styled', body: m[1].replace(/[{}]/g, ';'), offset: m.index }); }
  }
  return { css, blocks };
}

function classTokens(text) {
  const out = [];
  const re = /\b(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*[`"']([^`"']*)[`"']\s*\})/g;
  let m;
  while ((m = re.exec(text))) out.push({ value: m[1] ?? m[2] ?? m[3] ?? '', offset: m.index });
  return out;
}

function fontPx(v) {
  const m = String(v).match(/^(-?[\d.]+)\s*(px|rem|em|pt)?\b/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : m[2] === 'pt' ? n * (4 / 3) : m[2] === 'px' ? n : null;
}

const TEXT_SEL = /(^|[\s,>+~])(body|p|li|article|main|\.content|\.prose|td|dd|blockquote|html|:root)\b/i;

// ---- Web rules -------------------------------------------------------------
function checkWeb(text, kind, add) {
  const { css, blocks } = cssSources(text, kind);
  const hasCJK = CJK_RE.test(text.replace(/<style[\s\S]*?<\/style>/gi, '')) || /lang=["']?(zh|ja|ko)/i.test(text);
  const classes = classTokens(text);
  const allClass = classes.map((c) => c.value).join(' ');

  // fonts
  const families = [];
  for (const b of blocks) {
    const d = decls(b.body);
    const fam = d['font-family'] || (d.font && /,|"|'/.test(d.font) ? d.font.replace(/^[^"'a-z]*(?:[\d.]+\w*(?:\/[\d.]+\w*)?\s+)/i, '') : null);
    if (fam && !/^(inherit|initial|unset|var\()/i.test(fam)) families.push({ fam, offset: b.offset });
  }
  const tw = allClass.match(/font-\[['"]?([^\]'"]+)/g) || [];
  const famStr = families.map((f) => f.fam).join(' | ') + ' ' + tw.join(' ');
  if (families.length && families.every((f) => /^\s*['"]?(inter|system-ui|-apple-system)['"]?\s*(,\s*(['"]?(system-ui|-apple-system|blinkmacsystemfont|segoe ui|roboto|helvetica( neue)?|arial)['"]?|sans-serif))*\s*$/i.test(f.fam)) && /inter/i.test(famStr))
    add('slop/inter-only', families[0].offset, `font stack is only "${families[0].fam}"`);
  if (hasCJK && (families.length || tw.length) && !CJK_FONTS.test(famStr))
    add('cjk/missing-font', families[0]?.offset ?? 0, 'page contains CJK text but no font-family lists a CJK face');

  // gradients
  const gradRe = /(?:linear|radial|conic)-gradient\(([^;]*?)\)\s*(?:;|$|,\s*url|\n)/g;
  let m;
  const srcForGrad = kind === 'css' ? text : text;
  while ((m = gradRe.exec(srcForGrad))) if (isSlopGradient(m[1])) add('slop/purple-blue-gradient', m.index, 'gradient mixes violet with blue/pink');
  const twGrad = /\bfrom-(purple|violet|indigo|fuchsia)-\d+\b[^"']*?\bto-(blue|cyan|sky|pink|indigo|purple)-\d+|\bfrom-(blue|cyan|sky)-\d+\b[^"']*?\bto-(purple|violet|fuchsia|pink)-\d+/;
  for (const c of classes) if (twGrad.test(c.value)) add('slop/purple-blue-gradient', c.offset, 'Tailwind violet/blue gradient classes');
  if (/background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text|\bbg-clip-text\b/.test(text) && /gradient/.test(text))
    add('slop/gradient-text', text.search(/background-clip\s*:\s*text|bg-clip-text/), 'gradient-filled text');

  // per-block declarations
  let pills = (allClass.match(/\brounded-full\b/g) || []).length;
  let glass = (allClass.match(/\bbackdrop-blur/g) || []).length;
  let centered = (allClass.match(/\btext-center\b/g) || []).length;
  let important = (css.match(/!important/g) || []).length;
  const hexes = new Set();
  for (const b of blocks) {
    const d = decls(b.body);
    const sel = b.selector;
    for (const [k, v] of Object.entries(d)) {
      if (k === 'border-radius' && /(9{3,}|50%|[5-9]\d(\.\d+)?px|\d{3,}px)/.test(v) && /button|btn|badge|chip|tag|input|pill/i.test(sel + ' ' + b.body)) pills++;
      if (k.endsWith('backdrop-filter') && /blur/.test(v)) glass++;
      if (k === 'text-align' && v === 'center') centered++;
      if (k === 'border-left' && /^\s*[3-8]px\s+solid/.test(v)) add('slop/side-stripe', b.offset, `border-left: ${v}`);
      if (k === 'font-size') {
        const px = fontPx(v);
        if (px !== null && px > 0 && px < 12) add('type/tiny-font', b.offset, `font-size ${v} (≈${Math.round(px * 10) / 10}px)`, px < 10 ? 'P1' : undefined);
      }
      if (k === 'line-height' && /^[\d.]+$/.test(v) && TEXT_SEL.test(sel)) {
        const lh = parseFloat(v);
        if (hasCJK && lh < 1.5) add('cjk/line-height', b.offset, `line-height ${v} on "${sel}" with CJK content`);
        else if (!hasCJK && lh < 1.3) add('type/tight-line-height', b.offset, `line-height ${v} on "${sel}"`);
      }
      if (k === 'font-style' && v === 'italic' && hasCJK && !/\b(code|pre|var|cite)\b/i.test(sel)) add('cjk/italic', b.offset, `font-style: italic on "${sel}" in a CJK document`);
      if (k === 'letter-spacing' && /^-/.test(v) && hasCJK) add('cjk/negative-tracking', b.offset, `letter-spacing ${v}`);
      if (k === 'word-break' && v === 'break-all') add('cjk/break-all', b.offset, 'word-break: break-all');
      if ((k === 'outline' && /^(none|0)\b/.test(v)) && !/focus-visible|focus-within/.test(css) && !/:focus-visible/.test(sel))
        add('a11y/focus-removed', b.offset, `outline: ${v} on "${sel}" and no :focus-visible style in file`);
      if (k === 'width' && /^(\d{3,})px$/.test(v) && parseInt(v) >= 600 && !/@media|print/.test(sel)) add('layout/fixed-width', b.offset, `width: ${v}`);
      if ((k === 'height' || k === 'min-height') && /^100vh$/.test(v) && !/100dvh|100svh/.test(b.body)) add('layout/100vh', b.offset, `${k}: 100vh`);
      if (k === 'z-index' && parseInt(v) >= 9999) add('layout/z-index-war', b.offset, `z-index: ${v}`);
      if (k === 'transition' && /^all\b/.test(v)) add('perf/transition-all', b.offset, `transition: ${v}`);
      if (/color|background|border|fill|stroke|shadow/.test(k)) for (const h of v.match(/#[0-9a-f]{3,8}\b/gi) || []) if (!/^--/.test(k)) hexes.add(h.toLowerCase());
    }
    // padding on buttons
    if (/button|\.btn\b/i.test(sel) && d.padding) {
      const nums = d.padding.split(/\s+/).map(fontPx);
      if (nums.every((n) => n !== null && n <= 4)) add('layout/cramped-button', b.offset, `padding: ${d.padding} on "${sel}"`);
    }
    // contrast within one block
    const fg = parseColor(d.color);
    const bgRaw = d['background-color'] || (d.background && !/gradient|url\(|var\(/.test(d.background) ? d.background.split(/\s+/)[0] : null);
    const bg = parseColor(bgRaw);
    if (fg && bg && fg.a === 1 && bg.a === 1) {
      const ratio = contrastRatio(fg, bg);
      const px = fontPx(d['font-size'] || '') || 16;
      const large = px >= 24 || (px >= 18.66 && /bold|[6-9]00/.test(d['font-weight'] || ''));
      const need = large ? 3 : 4.5;
      if (ratio < need) add('a11y/contrast', b.offset, `${d.color} on ${bgRaw} = ${ratio.toFixed(2)}:1 (needs ${need}:1)`, ratio < 2 ? 'P0' : undefined);
      else checkGrayOnColor(fg, bg, b.offset, add);
    } else if (fg && bg) checkGrayOnColor(fg, bg, b.offset, add);
  }
  if (pills >= 6) add('slop/pill-overuse', 0, `${pills} fully-rounded elements`);
  if (glass >= 3) add('slop/glass-everywhere', 0, `${glass} elements use backdrop blur`);
  if (centered >= 8) add('slop/center-everything', 0, `${centered} centered text blocks`);
  if (important >= 10) add('css/important-overuse', 0, `${important} !important declarations`);
  if (hexes.size > 14) add('color/too-many', 0, `${hexes.size} distinct hex colors outside custom properties`);

  // Tailwind equivalents
  for (const c of classes) {
    const tiny = c.value.match(/\btext-\[(\d+(?:\.\d+)?)px\]/);
    if (tiny && +tiny[1] < 12) add('type/tiny-font', c.offset, `text-[${tiny[1]}px]`);
    if (/(^|\s)(outline-none|focus:outline-none)(\s|$)/.test(c.value) && !/focus(-visible)?:(ring|outline|border|shadow)/.test(c.value)) add('a11y/focus-removed', c.offset, 'outline-none without a focus: replacement');
    if (/(^|\s)italic(\s|$)/.test(c.value) && hasCJK) add('cjk/italic', c.offset, 'italic class in a CJK document');
  }
  const animated = /@keyframes|animation\s*:|\btransition\s*:|\banimate-(spin|bounce|pulse|ping|\[)|\btransition(-all|-transform|-opacity)?\b(?=[^"']*["'])/.test(css + ' ' + allClass) || /\banimate-|\btransition\b/.test(allClass);
  if (animated && !/prefers-reduced-motion|motion-reduce:|motion-safe:/.test(text)) add('a11y/reduced-motion', Math.max(0, text.search(/@keyframes|animation|transition|animate-/)), 'animation/transition with no reduced-motion handling');

  if (kind !== 'css') checkMarkup(text, kind, add, hasCJK);
}

function isSlopGradient(args) {
  const cols = (args.match(COLOR_RE) || []).map(parseColor).filter(Boolean).map(toHsl).filter((c) => c.s > 0.35 && c.l > 0.2 && c.l < 0.85);
  const violet = cols.some((c) => c.h >= 255 && c.h <= 300);
  const blueOrPink = cols.some((c) => (c.h >= 185 && c.h < 250) || (c.h > 300 && c.h <= 345));
  return violet && blueOrPink;
}
function checkGrayOnColor(fg, bg, offset, add) {
  const f = toHsl(fg), b = toHsl(bg);
  if (f.s < 0.08 && f.l > 0.25 && f.l < 0.8 && b.s > 0.45 && b.l > 0.2 && b.l < 0.8) add('a11y/gray-on-color', offset, 'neutral gray text on a saturated background');
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'use', 'stop', 'ellipse']);
function isCardClass(cls) {
  const t = cls.split(/\s+/);
  if (t.some((x) => x === 'card' || /[-_]card$/i.test(x) || /^[A-Z]?\w*Card$/.test(x))) return true;
  return t.some((x) => /^rounded(-(lg|xl|2xl|3xl))?$/.test(x)) && t.some((x) => /^shadow(-(sm|md|lg|xl|2xl))?$/.test(x)) && t.some((x) => /^(border|bg-white|bg-\w+-(50|100|800|900))$/.test(x));
}

function checkMarkup(text, kind, add, hasCJK) {
  let m;
  const tagRe = /<\/?([a-zA-Z][\w.-]*)((?:[^>"'{}]|"[^"]*"|'[^']*'|\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*?)(\/?)>/g;
  const stack = [];
  const headings = [];
  let iconHeading = 0;
  let firstIconHeading = -1;
  const body = text;
  while ((m = tagRe.exec(body))) {
    const raw = m[0], name = m[1].toLowerCase(), attrs = m[2] || '', idx = m.index;
    const closing = raw.startsWith('</');
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { stack.length = i; break; }
      continue;
    }
    const cls = (attrs.match(/\b(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["'`]([^"'`]*)["'`]\s*\})/) || []).slice(1).find((x) => x !== undefined) || '';
    const card = isCardClass(cls);
    if (card && stack.some((s) => s.card)) add('slop/nested-cards', idx, `<${m[1]} class="${cls.slice(0, 40)}"> inside another card`);
    if (!VOID.has(name) && !m[3] && !/^(script|style)$/.test(name)) stack.push({ name, card });
    if (/^h[1-6]$/.test(name)) headings.push({ level: +name[1], idx });
    if (name === 'img') {
      if (!/\balt\s*=/.test(attrs) && !/\{\.\.\./.test(attrs)) add('a11y/img-alt', idx, '<img> has no alt attribute');
      if (!/\bwidth\s*=/.test(attrs) || !/\bheight\s*=/.test(attrs)) if (!/aspect-|\bfill\b/.test(attrs)) add('perf/img-dimensions', idx, '<img> missing width/height');
    }
    if (/^(input|textarea|select)$/.test(name)) {
      const type = (attrs.match(/\btype\s*=\s*["']?(\w+)/) || [])[1];
      if (!/^(hidden|submit|button|reset|image)$/.test(type || '') && !/aria-label(ledby)?\s*=|\btitle\s*=|\{\.\.\./.test(attrs)) {
        const id = (attrs.match(/\bid\s*=\s*["']([^"']+)/) || [])[1];
        const linked = id && new RegExp(`(?:for|htmlFor)\\s*=\\s*["'{]\\s*["']?${id.replace(/[-.]/g, '\\$&')}["']`).test(body);
        const before = body.slice(0, idx);
        const wrapped = before.lastIndexOf('<label') > before.lastIndexOf('</label>');
        if (!linked && !wrapped) add('a11y/input-label', idx, `<${name}${type ? ` type=${type}` : ''}> has no label`);
      }
    }
    if ((name === 'div' || name === 'span' || name === 'li') && /\bon(click|Click)\s*=/.test(attrs) && !/\brole\s*=/.test(attrs)) add('a11y/click-div', idx, `<${name}> with click handler but no role`);
    if (name === 'a' && (!/\bhref\s*=/.test(attrs) || /\bhref\s*=\s*["']#["']/.test(attrs)) && !/\bname\s*=|\bid\s*=/.test(attrs)) add('a11y/empty-link', idx, '<a> without a real href');
    if (/\btabindex\s*=\s*["'{]?\s*([1-9]\d*)/i.test(attrs)) add('a11y/positive-tabindex', idx, 'tabindex > 0');
    if (name === 'meta' && /viewport/i.test(attrs) && /user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(attrs)) add('a11y/zoom-disabled', idx, 'viewport disables zoom');
    if (name === 'html' && kind === 'html' && !/\blang\s*=/.test(attrs)) add('html/lang-missing', idx, '<html> has no lang');
  }
  // headings order
  let prev = 0;
  for (const h of headings) { if (prev && h.level > prev + 1) add('a11y/heading-skip', h.idx, `h${prev} → h${h.level}`); prev = h.level; }

  // element content checks
  const contentRe = /<(button|h[1-6]|li|a|label)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  while ((m = contentRe.exec(text))) {
    const [, tag, attrs, inner] = m;
    const plain = inner.replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<[^>]+>/g, '').trim();
    if (EMOJI_RE.test(plain.slice(0, 4)) || (EMOJI_RE.test(plain) && plain.length < 40)) add('slop/emoji-icons', m.index, `emoji in <${tag}>: "${plain.slice(0, 30)}"`);
    if (tag.toLowerCase() === 'button' && !plain.replace(/\{\s*\/\*.*?\*\/\s*\}/g, '') && !/aria-label(ledby)?\s*=|\btitle\s*=/.test(attrs)) add('a11y/button-name', m.index, 'icon-only <button> with no aria-label');
    if (/^(em|i)$/i.test(tag) && CJK_RE.test(plain)) add('cjk/italic', m.index, 'CJK inside <em>/<i>');
  }
  const emRe = /<(em|i)\b[^>]*>([^<]*)<\/\1>/gi;
  while ((m = emRe.exec(text))) if (CJK_RE.test(m[2]) && !/class=/.test(m[0])) add('cjk/italic', m.index, `<${m[1]}>${m[2].slice(0, 12)}</${m[1]}> slants CJK text (unless CSS resets font-style)`, 'P2');
  const hype = text.replace(/<(style|script)[\s\S]*?<\/\1>/gi, blank).match(HYPE_RE);
  if (hype) add('slop/hype-copy', text.indexOf(hype[0]), `"${hype[0]}"`);

  // icon tile + heading pattern
  const tileRe = /<(div|span)\b[^>]*(?:class|className)=["'{][^"'}]*(icon|rounded-(lg|xl|2xl|full))[^"'}]*["'}][^>]*>\s*(?:<svg[\s\S]*?<\/svg>|<i\b[^>]*><\/i>|<img[^>]*>|[^<]{1,4})\s*<\/\1>\s*<h[2-4]/gi;
  while ((m = tileRe.exec(text))) { iconHeading++; if (firstIconHeading < 0) firstIconHeading = m.index; }
  if (iconHeading >= 3) add('slop/icon-tile-heading', firstIconHeading, `${iconHeading} icon-tile + heading blocks`);

  if (kind === 'html' && /<html\b/i.test(text) && !/<meta[^>]+name=["']viewport/i.test(text)) add('layout/viewport-missing', text.search(/<head\b|<html\b/i), 'no <meta name="viewport">');
  void hasCJK;
}

// ---- Slint -----------------------------------------------------------------
// Build a light element tree: {header, own: text at own depth, offset, children, parent}.
function slintTree(src) {
  const root = { header: '', own: '', offset: 0, children: [], parent: null };
  let cur = root, headStart = 0, i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '"') { // string, honour escapes and \{ } interpolation
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j += src[j] === '\\' ? 2 : 1;
      cur.own += src.slice(i, j + 1); i = j + 1; continue;
    }
    if (ch === '{') {
      const lastSep = Math.max(cur.own.lastIndexOf(';'), cur.own.lastIndexOf('}'), cur.own.lastIndexOf('{'));
      const header = cur.own.slice(lastSep + 1).trim();
      cur.own = cur.own.slice(0, lastSep + 1) + ' ';
      const node = { header, own: '', offset: i - header.length, children: [], parent: cur };
      cur.children.push(node); cur = node; i++; continue;
    }
    if (ch === '}') { if (cur.parent) { cur.own += ''; cur = cur.parent; cur.own += '}'; } i++; continue; }
    cur.own += ch; i++;
  }
  void headStart;
  return root;
}
function slintProps(own) {
  const props = {};
  const re = /(?:^|[;}\s])((?:in-out\s+|in\s+|out\s+)?(?:property\s*<[^>]+>\s*)?)?([a-z][\w-]*)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(own))) props[m[2]] = m[3].trim();
  return props;
}
function* walk(n) { yield n; for (const c of n.children) yield* walk(c); }
function elemName(header) {
  const h = header.replace(/^.*:=\s*/, '').replace(/^(export\s+)?component\s+\w+\s+inherits\s+/, '').trim();
  return (h.match(/([A-Z][\w]*)\s*$/) || h.match(/^([A-Z]\w*)/) || [])[1] || h;
}

function checkSlint(text, add) {
  const src = text;
  const tree = slintTree(src);
  const hasCJK = CJK_RE.test(text);
  // palette globals
  const palette = {};
  const globalSpans = [];
  for (const n of walk(tree)) {
    const g = n.header.match(/global\s+(\w+)/);
    if (g) {
      globalSpans.push(n);
      const re = /property\s*<(?:color|brush)>\s*([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
      let m;
      for (const s of [n.own, ...n.children.map((c) => c.own)]) while ((m = re.exec(s))) palette[`${g[1]}.${m[1]}`] = m[2];
    }
  }
  const inGlobal = (n) => { for (let p = n; p; p = p.parent) if (/global\s+\w+/.test(p.header)) return true; return false; };
  const resolve = (v) => { if (!v) return null; const t = v.trim(); return parseColor(t) || (palette[t] ? parseColor(palette[t]) : null); };

  let literal = 0, firstLiteral = -1;
  for (const n of walk(tree)) {
    if (n === tree) continue;
    const p = slintProps(n.own);
    const name = elemName(n.header);
    const isWindow = /inherits\s+Window\b/.test(n.header) || name === 'Window';
    if (!inGlobal(n)) for (const v of Object.values(p)) for (const h of v.match(/#[0-9a-fA-F]{3,8}\b/g) || []) { literal++; if (firstLiteral < 0) firstLiteral = n.offset; void h; }
    // tiny font
    // Desktop toolkits use logical px; 11px ≈ 8pt is common in dense toolbars, so Slint flags < 11px.
    if (p['font-size']) { const px = fontPx(p['font-size']); if (px !== null && px > 0 && px < 11) add('type/tiny-font', n.offset, `font-size: ${p['font-size']}`, px < 10 ? 'P1' : undefined); }
    if (/^true$/.test(p['font-italic'] || '') && (hasCJK)) add('cjk/italic', n.offset, 'font-italic: true in a file with CJK text');
    // contrast: Text color vs nearest ancestor background
    if (name === 'Text' && p.color) {
      const fg = resolve(p.color);
      let bgv = null;
      for (let a = n.parent; a && !bgv; a = a.parent) {
        const ap = slintProps(a.own);
        const thin = [ap.width, ap.height].some((v) => { const px = fontPx(v || ''); return px !== null && px < 8; });
        if (ap.background && !thin) bgv = ap.background; // skip 1px rules/ticks: text is not drawn on them
      }
      const bg = resolve(bgv);
      if (fg && bg && fg.a === 1 && bg.a === 1) {
        const r = contrastRatio(fg, bg);
        const px = fontPx(p['font-size'] || '') || 14;
        const need = px >= 24 ? 3 : 4.5;
        if (r < need) add('a11y/contrast', n.offset, `${p.color} on ${bgv} = ${r.toFixed(2)}:1 (needs ${need}:1)`, r < 2 ? 'P0' : undefined);
        else checkGrayOnColor(fg, bg, n.offset, add);
      }
    }
    if (p.text && EMOJI_RE.test(p.text) && /^"/.test(p.text)) add('slop/emoji-icons', n.offset, `emoji in text: ${p.text.slice(0, 30)}`);
    if (p.text && HYPE_RE.test(p.text)) add('slop/hype-copy', n.offset, p.text.slice(0, 40));
    if (p.background && /@linear-gradient|@radial-gradient/.test(p.background) && isSlopGradient(p.background)) add('slop/purple-blue-gradient', n.offset, 'violet/blue gradient');
    if (isWindow) {
      if (!/^true$/.test(p['no-frame'] || '') && !p['min-width'] && !p['min-height'] && !/min-width|min-height|preferred-width/.test(n.children.slice(0, 2).map((c) => c.own).join(''))) add('slint/window-min-size', n.offset, `${n.header.slice(0, 50)} has no min-width/min-height`);
      if (hasCJK && !p['default-font-family']) add('slint/default-font', n.offset, 'Window has CJK text but no default-font-family');
      if (/^"/.test(p['default-font-family'] || '') && hasCJK && !CJK_FONTS.test(p['default-font-family'])) add('cjk/missing-font', n.offset, `default-font-family ${p['default-font-family']} is not a CJK face`);
    }
    if (/^"/.test(p['font-family'] || '') && hasCJK && !CJK_FONTS.test(p['font-family']) && /[\u3400-\u9fff]/.test(p.text || '')) add('cjk/missing-font', n.offset, `font-family ${p['font-family']} on CJK text`);
    // icon-only buttons
    const isButtonish = /^(Button|ToolButton|IconButton|\w*Button)$/.test(name);
    if (isButtonish && (p.icon || p.source) && (!p.text || p.text === '""')) {
      const scope = n.own + n.children.map((c) => c.own).join('') + (n.parent ? n.parent.own : '');
      if (!/tooltip|tool-tip|accessible-label|accessible-description|has-hover/i.test(scope)) add('slint/icon-button-tooltip', n.offset, `${name} with icon and no text/tooltip`);
    }
    // custom clickable component: component whose tree contains TouchArea but root lacks accessible-role
    if (/^(export\s+)?component\s+\w+/.test(n.header) && !isWindow && !/inherits\s+(Button|\w*Button|LineEdit|CheckBox|Switch|Slider|ComboBox)\b/.test(n.header)) {
      const sub = [...walk(n)];
      if (sub.some((c) => elemName(c.header) === 'TouchArea' && /clicked/.test(c.own)) && !p['accessible-role']) {
        add('slint/touch-area-a11y', n.offset, `${n.header.replace(/^(export\s+)?component\s+/, '').split(/\s/)[0]} is clickable but has no accessible-role`);
      }
    }
  }
  if (literal > 8) add('slint/hardcoded-colors', firstLiteral, `${literal} color literals outside a global palette`);
}

function checkSvg(text, add) {
  const m = text.match(/<svg\b[^>]*>/i);
  if (m && !/viewBox\s*=/.test(m[0])) add('svg/no-viewbox', m.index, '<svg> without viewBox');
}

// ---- Public API ------------------------------------------------------------
export function checkText(text, file = 'input.html', opts = {}) {
  const kind = opts.kind || kindOf(file);
  if (!kind) return [];
  const clean = stripComments(text, kind);
  const findings = [];
  const seen = new Set();
  const perRule = {};
  const add = (id, offset, message, sevOverride) => {
    const rule = RULE_MAP[id];
    if (!rule || !rule.langs.includes(kind === 'svg' ? 'svg' : kind) && !(kind === 'svg' && id.startsWith('svg/'))) return;
    const { line, col } = lineCol(text, Math.max(0, offset));
    const key = `${id}:${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    perRule[id] = (perRule[id] || 0) + 1;
    if (perRule[id] > 25) return;
    findings.push({ rule: id, severity: sevOverride || rule.severity, file, line, col, message, title: rule.title, fix: rule.fix });
  };
  if (/design-sense-ignore-file/.test(text)) return [];
  if (kind === 'slint') checkSlint(clean, add);
  else if (kind === 'svg') checkSvg(clean, add);
  else checkWeb(clean, kind, add);
  return applySuppressions(findings, text, opts.config);
}

function applySuppressions(findings, text, config = {}) {
  const lines = text.split('\n');
  const fileOff = new Set();
  for (const m of text.matchAll(/design-sense-disable(?!-)\s+([\w/,\s-]+?)(?:\*\/|-->|$)/gm)) m[1].split(/[\s,]+/).filter(Boolean).forEach((r) => fileOff.add(r));
  const sevMap = config.rules || {};
  return findings.filter((f) => {
    if (fileOff.has(f.rule) || fileOff.has('*')) return false;
    const here = lines[f.line - 1] || '', prev = lines[f.line - 2] || '';
    const hit = (s, tag) => { const m = s.match(new RegExp(`design-sense-${tag}(?:\\s+([\\w/,\\s-]+?))?\\s*(?:\\*\\/|-->|$)`)); return m && (!m[1] || m[1].split(/[\s,]+/).includes(f.rule)); };
    if (hit(here, 'disable-line') || hit(prev, 'disable-next-line')) return false;
    const o = sevMap[f.rule];
    if (o === 'off') return false;
    if (/^P[0-3]$/.test(o || '')) f.severity = o;
    return true;
  }).sort((a, b) => a.line - b.line || a.col - b.col);
}
