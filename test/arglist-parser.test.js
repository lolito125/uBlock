import { strict as assert } from 'node:assert';
import test from 'node:test';
import { ArglistParser } from '../src/js/arglist-parser.js';

await test('ArglistParser parses unquoted and quoted arguments', () => {
  const p = new ArglistParser(',');
  const s = "abc, 'd,e', `f\\`,g` , \"h,i\"";
  // Collect args using nextArg
  const args = [];
  let i = 0;
  while (i < s.length) {
    p.nextArg(s, i);
    const raw = s.slice(p.quoteBeg, p.quoteEnd);
    const value = s.slice(p.argBeg, p.argEnd);
    args.push({ raw, value, failed: p.failed });
    if (p.separatorEnd === p.argEnd) break;
    i = p.separatorEnd;
  }
  assert.deepEqual(
    args.map((a) => a.value),
    ['abc', 'd,e', 'f\\`,g', 'h,i']
  );
});

await test('ArglistParser normalizeArg respects escapes near separator', () => {
  const p = new ArglistParser('|');
  const norm = p.normalizeArg('a\\|b|c', '|');
  assert.equal(norm, 'a|b|c');
});