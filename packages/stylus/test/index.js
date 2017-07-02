'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const plugins = [require('../'), require('@taskr/clear')];
const dir = join(__dirname, 'fixtures');
const src = `${dir}/style.styl`;

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/stylus', t => {
	t.plan(1);
	const taskr = create({
		*foo(f) {
			t.true('stylus' in taskr.plugins, 'attach `stylus()` plugin to taskr');
		}
	});
	taskr.start('foo');
});

test('@taskr/stylus (default)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-1');
			const tar = `${tmp}/style.css`;

			const expect = yield f.$.read(`${dir}/expect.css`, 'utf8');
			yield f.source(src).stylus().target(tmp);

			t.ok(yield f.$.find(tar), 'create a `.css` file correctly');
			t.equal(yield f.$.read(tar, 'utf8'), expect, 'compile multi-tiered imports');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/stylus (sourcemap)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			yield f.source(src).stylus({ sourcemap:true }).target(tmp);

			const arr = yield f.$.expand(`${tmp}/*`);
			const str = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr.length, 2, 'creates an external sourcemap file');
			t.true(str.indexOf('sourceMappingURL=test/fixtures/style.css.map') !== -1, 'appends external sourcemap link');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/stylus (inline)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-3');
			yield f.source(src).stylus({sourcemap:{ inline:true }}).target(tmp);

			const arr = yield f.$.expand(`${tmp}/*`);
			const str = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr.length, 1, 'creates only one file');
			t.true(str.indexOf('sourceMappingURL=data:application/json') !== -1, 'appends inline sourcemap');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/stylus (no-comment)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-4');
			yield f.source(src).stylus({sourcemap:{ comment:false }}).target(tmp);

			const arr2 = yield f.$.expand(`${tmp}/*`);
			const str2 = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr2.length, 2, 'creates an external sourcemap file');
			t.true(str2.indexOf('sourceMappingURL=style.css.map') === -1, 'does NOT append external sourcemap link');
			yield f.clear(tmp);
		}
	}).start('foo');
});
