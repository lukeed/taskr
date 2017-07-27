'use strict';

const join = require('path').join;
const read = require('fs').readFileSync;
const co = require('bluebird').coroutine;
const test = require('tape');
const fn = require('../');

const file = join(__dirname, 'fixtures', 'taskfile.js');
const data = read(file, 'utf8');

const hasYield = f => /yield/i.test(f.toString());
const isGenerator = f => f.constructor.name === 'GeneratorFunction';

test('@taskr/esnext', co(function * (t) {
	t.plan(26);

	t.equal(typeof fn, 'function', 'export a function');

	const out = fn(file, data);

	t.equal(typeof out, 'object', 'return an object');
	t.equal(Object.keys(out).length, 5, 'exports all tasks');

	let func;
	['default', 'foo', 'bar', 'baz', 'bat'].forEach(k => {
		func = out[k];
		t.true(func !== void 0, `exports.${k} is defined`);
		t.equal(typeof func, 'function', `exports.${k} is a function`);
		t.true(isGenerator(func), `rewrite exports.${k} as a generator function`);
	});

	// specifics
	t.true(hasYield(out.foo), '`foo` task has `yield`');
	t.true(hasYield(out.default), '`default` task has `yield`');
	t.true(/function\* \(o\)/.test(out.bar.toString()), 'keeps one parameter');
	t.true(/function\* \(one, two\)/.test(out.baz.toString()), 'keeps two parameters (xo)');
	t.true(/function\* \(one, two\)/.test(out.bat.toString()), 'keeps two parameters (standard)');

	const val1 = yield co(out.bar)();
	t.equal(val1, 'hello: 42', 'handle `require()` & embedded values');

	const val2 = yield co(out.baz)('foo', 'bar');
	t.deepEqual(val2, {one: 'foo', two: 'bar'}, 'accepts & handles multiple parameters');

	const val3 = yield co(out.bat)();
	t.equal(val3, 'hello world', 'handles aliased import partials correctly');
}));
