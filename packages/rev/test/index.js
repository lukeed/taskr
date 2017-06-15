'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, 'tmp');
const hash1 = '2842ed45c6';
const hash2 = 'ef68a11f24';
const glob = `${dir}/**`;

const create = tasks => new Taskr({ tasks, plugins:[require('../'), require('@taskr/clear')] });

test('@taskr/rev (rev)', t => {
	t.plan(5);
	const taskr = create({
		* foo(f) {
			yield f.source(glob).rev().target(tmp);
			t.true('rev' in taskr.plugins, 'attach `rev()` plugin to taskr');
			t.false(yield f.$.find(`${tmp}/a.js`), 'rename the file');
			t.true(yield f.$.find(`${tmp}/a-${hash1}.js`), 'generate content-based hash');
			t.true(yield f.$.find(`${tmp}/b.svg`), 'ignore matching `opts.ignore` file types');
			t.true(yield f.$.find(`${tmp}/sub/c-${hash2}.js`), 'rename sub-level files');
			yield f.clear(tmp);
		}
	});
	taskr.start('foo');
});

test('@taskr/rev (revManifest)', t => {
	t.plan(11);
	const taskr = create({
		* foo(f) {
			yield f.source(glob).rev().revManifest({dest: tmp}).target(tmp);
			t.true('revManifest' in taskr.plugins, 'attach `revManifest()` plugin to taskr');
			const file = yield f.$.read(`${tmp}/rev-manifest.json`, 'utf8');
			t.true(file, 'create & place the `rev-manifest.json` file in `opts.dest`');
			const data = JSON.parse(file);
			const keys = Object.keys(data);
			t.equal(keys.length, 2, 'only contains revved files');
			t.deepEqual(keys, ['test/fixtures/a.js', 'test/fixtures/sub/c.js'], 'keys are original files\' paths');
			t.equal(data[keys[0]], `test/fixtures/a-${hash1}.js`, 'values are revved files\' paths');
			yield f.clear(tmp);
		},
		* bar(f) {
			yield f.source(glob).rev().revManifest({trim: 'test'}).target(`${tmp}/sub`);
			const file = yield f.$.read(`${f.root}/rev-manifest.json`, 'utf8');
			t.true(file, 'create & place the `rev-manifest.json` file in `this.root` (default)');
			const data = JSON.parse(file);
			const keys = Object.keys(data);
			t.equal(keys[0], 'fixtures/a.js', 'pass `opts.trim` a string; modifies keys');
			t.equal(data[keys[0]], `fixtures/a-${hash1}.js`, 'pass `opts.trim` a string; modifies values');
			yield f.clear([tmp, `${f.root}/rev-manifest.json`]);
		},
		* baz(f) {
			yield f.source(glob).rev()
				.revManifest({dest: tmp, trim: s => s.replace(/test\/fixtures/i, 'sub')})
				.target(`${tmp}/sub`);
			const file = yield f.$.read(`${tmp}/rev-manifest.json`, 'utf8');
			t.true(file, 'create & place the `rev-manifest.json` file in `opts.dest`');
			const data = JSON.parse(file);
			const keys = Object.keys(data);
			t.equal(keys[0], 'sub/a.js', 'pass `opts.trim` a function; modifies keys');
			t.equal(data[keys[0]], `sub/a-${hash1}.js`, 'pass `opts.trim` a function; modifies values');
		}
	});
	taskr.serial(['foo', 'bar', 'baz']);
});

test('@taskr/rev (revReplace)', t => {
	t.plan(2);
	const taskr = create({
		* foo(f) {
			yield f.clear(tmp);
			yield f.source(glob).rev().revManifest({dest: tmp}).revReplace({ignores: []}).target(tmp);
			t.true('revReplace' in taskr.plugins, 'attach `revReplace()` plugin to taskr');
			const rgx = new RegExp(`test/fixtures/a-${hash1}.js`, 'i');
			const svg = yield f.$.read(`${tmp}/b.svg`, 'utf8');
			t.true(rgx.test(svg), 'replace the original file path');
			yield f.clear(tmp);
		}
	});
	taskr.start('foo');
});
