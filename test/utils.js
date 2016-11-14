'use strict';

const join = require('path').join;
const co = require('bluebird').coroutine;
const clear = require('../lib/api/clear');
const test = require('tape').test;
const $ = require('../lib/utils');

const fixtures = join(__dirname, 'fixtures', 'utils');

test('utils', t => {
	t.ok($ !== undefined, 'are exported');

	['find', 'read', 'write', 'expand',
	'error', 'alert', 'trace', 'log',
	'promisify', 'coroutine']
		.forEach(prop => {
			t.true($[prop] !== undefined, `utils.${prop} exists`);
		});

	t.end();
});

test('utils.find', co(function * (t) {
	const file = 'flyfile.js';
	const full = join(fixtures, file);

	const out1 = yield $.find(file, fixtures);
	t.true(out1.length && typeof out1 === 'string', 'if found; returns a string');
	t.equal(out1, full, `via directory path; finds the correct flyfile`);

	const out2 = yield $.find(full);
	t.equal(out2, full, `via file path; finds the correct flyfile`);

	const subdir = join(fixtures, 'sub'); // test dir
	const out3 = yield $.find(file, subdir);
	t.equal(out3, full, `via sub-directory path; finds the correct flyfile`);

	const out4 = yield $.find(file, '/fakedir123');
	t.equal(out4, null, 'if not found; returns `null`');

	t.end();
}));

test('utils.read', co(function * (t) {
	const file = join(fixtures, 'a.js');
	const out1 = yield $.read(file);
	const out2 = yield $.read(file, 'utf8');
	const out3 = yield $.read(file, {encoding: 'utf8'});
	const out4 = yield $.read(fixtures);

	t.true(out1 instanceof Buffer, 'returns a Buffer by default');
	t.equal(typeof out2, 'string', 'accepts `encoding` string as options');
	t.equal(typeof out3, 'string', 'accepts object as options');
	t.equal(out3, 'const pi = 3.14\n', `reads file's contents correctly`);
	t.true(out4 === null, 'does not attempt to read directory paths');

	t.end();
}));

test('utils.write', co(function * (t) {
	const nest = join(fixtures, 'nested');
	const file = join(nest, 'deeply', 'test.js');
	const demo = '\nhello\n';

	const done = yield $.write(file, demo);
	t.equal(done, undefined, 'returns nothing');

	yield $.write(nest, demo);
	const nada = yield $.read(nest);
	t.equal(nada, null, 'does not attempt to write to directory');

	const seek = yield $.find(file);
	t.true(seek && seek.length, 'creates the file, including sub-dirs');

	const data = yield $.read(file, 'utf8');
	t.equal(data, demo, 'writes the content to file correctly');

	yield clear(nest);

	t.end();
}));

test('utils.expand', co(function * (t) {
	const glob1 = join(fixtures, '*.html');
	const glob2 = join(fixtures, '**', '*.js');
	const glob3 = join(fixtures, '*.zzz');

	const out1 = yield $.expand(glob1);
	const out2 = yield $.expand(glob2);
	const out3 = yield $.expand(glob2, {ignore: '**/*.babel.js'});
	const out4 = yield $.expand(glob3);
	const out5 = yield $.expand([glob1, glob2]);

	t.true(out1 && out1.length === 1, 'matches shallow globs');
	t.true(out2 && out2.length === 4, 'matches deep/super globs');
	t.true(out3 && out3.length === 3, 'accepts `options` object');
	t.true(Array.isArray(out4) && !out4.length, 'return empty array on no-match');
	t.true(out5 && out5.length === 5, 'expands multiple globs');

	t.end();
}));
