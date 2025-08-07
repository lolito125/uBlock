import { strict as assert } from 'node:assert';
import test from 'node:test';
import { JSONPath } from '../src/js/jsonpath.js';

await test('JSONPath evaluate simple queries', () => {
  const data = { store: { book: [{ author: 'A' }, { author: 'B' }], price: 10 } };
  const qp = JSONPath.create('.store.book[1].author');
  const paths = qp.evaluate(data);
  assert.equal(paths.length, 1);
  assert.deepEqual(paths[0], ['store', 'book', 1, 'author']);
});

await test('JSONPath apply assign value and delete key', () => {
  const obj = { a: { b: 1, c: 2 } };
  const set = JSONPath.create('.a.b=3');
  assert.ok(set.valid);
  const n1 = set.apply(obj);
  assert.equal(n1, 1);
  assert.equal(obj.a.b, 3);

  const del = JSONPath.create('.a.c');
  const n2 = del.apply(obj);
  assert.equal(n2, 1);
  assert.equal(Object.hasOwn(obj.a, 'c'), false);
});

await test('JSONPath toJSON escapes forward slashes', () => {
  const jp = new JSONPath();
  const s = jp.toJSON({ path: '/a/b' });
  // JSONPath.toJSON replaces / with \/
  JSON.parse(s); // ensure valid JSON
  assert.equal(s.includes('\\/a\\/b'), true);
});