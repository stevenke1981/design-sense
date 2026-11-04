import { RULES } from '../lib/rules.mjs';
console.log('| ID | Sev | Applies to | Rule |\n|---|---|---|---|');
for (const r of RULES) console.log(`| \`${r.id}\` | ${r.severity} | ${r.langs.join(', ')} | ${r.title} |`);
