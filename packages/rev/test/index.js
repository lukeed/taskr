'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const plugins = [require('../'), require('@taskr/clear')];
const dir = join(__dirname, 'fixtures');
const glob = `${dir}/**`;

const hash1 = '2842ed45c6';
const hash2 = 'ef68a11f24';

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/rev (all)', t => {
	t.plan(3);
	const taskr = create({
		*foo(f) {
			t.true('rev' in taskr.plugins, 'attach `rev()` plugin to taskr');
			t.true('revManifest' in taskr.plugins, 'attach `revManifest()` plugin to taskr');
			t.true('revReplace' in taskr.plugins, 'attach `revReplace()` plugin to taskr');
		}
	});
	taskr.start('foo');
});

test('@taskr/rev (rev)', t => {
	t.plan(4);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-1');
			yield f.source(glob).rev().target(tmp);

			t.false(yield f.$.find(`${tmp}/a.js`), 'rename the file');
			t.true(yield f.$.find(`${tmp}/a-${hash1}.js`), 'generate content-based hash');
			t.true(yield f.$.find(`${tmp}/b.svg`), 'ignore matching `opts.ignore` file types');
			t.true(yield f.$.find(`${tmp}/sub/c-${hash2}.js`), 'rename sub-level files');

			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/rev (revManifest)', t => {
	t.plan(10);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			yield f.source(glob).rev().revManifest({ dest:tmp }).target(tmp);

			const file = yield f.$.read(`${tmp}/rev-manifest.json`, 'utf8');
			t.true(file, 'create & place the `rev-manifest.json` file in `opts.dest`');

			const data = JSON.parse(file);
			const keys = Object.keys(data);
			t.equal(keys.length, 2, 'only contains revved files');
			t.deepEqual(keys, ['test/fixtures/a.js', 'test/fixtures/sub/c.js'], 'keys are original files\' paths');
			t.equal(data[keys[0]], `test/fixtures/a-${hash1}.js`, 'values are revved files\' paths');

			yield f.clear(tmp);
		},
		*bar(f) {
			const tmp = tmpDir('tmp-3');
			yield f.source(glob).rev().revManifest({ trim:'test' }).target(`${tmp}/sub`);

			const file = yield f.$.read(`${f.root}/rev-manifest.json`, 'utf8');
			t.true(file, 'create & place the `rev-manifest.json` file in `task.root` (default)');

			const data = JSON.parse(file);
			const keys = Object.keys(data);
			t.equal(keys[0], 'fixtures/a.js', 'pass `opts.trim` a string; modifies keys');
			t.equal(data[keys[0]], `fixtures/a-${hash1}.js`, 'pass `opts.trim` a string; modifies values');

			yield f.clear([tmp, `${f.root}/rev-manifest.json`]);
		},
		*baz(f) {
			const tmp = tmpDir('tmp-4');
			yield f.source(glob).rev().revManifest({
				dest: tmp,
				trim: s => s.replace(/test\/fixtures/i, 'sub')
			}).target(`${tmp}/sub`);

			const file = yield f.$.read(`${tmp}/rev-manifest.json`, 'utf8');
			t.true(file, 'create & place the `rev-manifest.json` file in `opts.dest`');

			const data = JSON.parse(file);
			const keys = Object.keys(data);
			t.equal(keys[0], 'sub/a.js', 'pass `opts.trim` a function; modifies keys');
			t.equal(data[keys[0]], `sub/a-${hash1}.js`, 'pass `opts.trim` a function; modifies values');

			yield f.clear(tmp);
		}
	}).serial(['foo', 'bar', 'baz']);
});

test('@taskr/rev (revReplace)', t => {
	t.plan(1);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-5');
			yield f.source(glob).rev().revManifest({ dest:tmp }).revReplace({ ignores:[] }).target(tmp);

			const rgx = new RegExp(`test/fixtures/a-${hash1}.js`, 'i');
			const svg = yield f.$.read(`${tmp}/b.svg`, 'utf8');
			t.true(rgx.test(svg), 'replace the original file path');

			yield f.clear(tmp);
		}
	}).start('foo');
});
