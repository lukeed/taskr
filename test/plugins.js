'use strict';

const join = require('path').join;
const test = require('tape').test;
const Promise = require('bluebird');
const plugs = require('../lib/plugins');
const cli = require('../lib/cli');
const $ = require('../lib/fn');
const co = Promise.coroutine;

const fixtures = join(__dirname, 'fixtures');
const altDir = join(fixtures, 'alt');
const pkgfile = join(altDir, 'package.json');
const flyfile = join(altDir, 'flyfile.js');

test('plugins', t => {
	t.ok(Object.keys(plugs).length, 'export some methods');
	['load', 'getDependencies'].forEach(k => t.ok(plugs[k] !== undefined, `${k} is defined`));
	t.end();
});

test('plugins.getDependencies', co(function * (t) {
	const out1 = yield plugs.getDependencies();
	t.true($.isArray(out1) && out1.length === 0, 'via `null` input; returns an empty array');

	const out2 = yield plugs.getDependencies(pkgfile);
	t.true($.isArray(out2), 'via valid file; returns an array');
	t.equal(out2.length, 5, 'via valid file; find all the available dependencies');

	const out3 = yield plugs.getDependencies(join(fixtures, 'asd.json'));
	t.true($.isArray(out3) && out3.length === 0, 'via 404 file; returns an empty array');

	t.end();
}));

test('plugins.load', co(function * (t) {
	// const out1 = yield plugs.load(join('/fake123', 'flyfile.js'));
	// t.true($.isArray(out1) && out1.length === 0, 'via invalid file; returns an empty array');
		// ^^ logs error message to test; disrupts formatting

	const out = yield plugs.load(flyfile);
	t.ok($.isArray(out), 'returns an array');
	t.equal(out.length, 3, 'filters down to fly-* plugins only');
	t.ok($.isObject(out[0]), 'is an array of objects');
	t.ok('name' in out[0] && 'func' in out[0], 'objects contain `name` and `func` keys');
	t.equal(out[2].func, undefined, 'return `undefined` for faulty plugins');

	t.end();
}));

test('fly.plugins', co(function * (t) {
	const fly = yield cli.spawn(altDir);

	const ext = '*.txt';
	const src = join(fixtures, ext);
	const tar = join(fixtures, '.tmp');

	fly.tasks = {
		a: function * () {
			yield this.source(src).plugOne().target(tar);

			const out = yield Promise.all(
				[join(tar, 'foo.txt'), join(tar, 'bar.txt')].map(s => this.$.read(s))
			);

			out.forEach((buf, idx) => {
				if (idx === 0) {
					t.equal(buf.toString(), `\nrab oof`, 'reverse `foo.txt` content');
				} else {
					t.equal(buf.toString(), `\nzab rab`, 'reverse `bar.txt` content');
				}
			});

			yield this.clear(tar);
		},
		b: function * () {
			yield this.source(src).plugOne().plugTwo().target(tar);
			t.pass('custom plugins are chainable');

			const out = yield Promise.all(
				[join(tar, 'foo.txt'), join(tar, 'bar.txt')].map(s => this.$.read(s))
			);

			out.forEach((buf, idx) => {
				if (idx === 0) {
					t.equal(buf.toString(), `foo bar\n`, 'double-reverse `foo.txt` content');
				} else {
					t.equal(buf.toString(), `bar baz\n`, 'double-reverse `bar.txt` content');
				}
			});

			// relied on `plugOne` to finish first
			t.pass(`await previous plugin's completion`);
			// handle `non-every` plugins
			t.pass('handle non-looping plugins (`{every: 0}`)');

			yield this.clear(tar);
		}
	};

	yield fly.serial(['a', 'b']);

	t.end();
}));
