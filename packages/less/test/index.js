'use strict';

const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const plugins = [require('../'), require('@taskr/clear')];
const dir = join(__dirname, 'fixtures');
const src = `${dir}/style.less`;

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/less', t => {
	t.plan(1);
	const taskr = create({
		*foo(f) {
			t.true('less' in taskr.plugins, 'attach `less()` plugin to taskr');
		}
	});
	taskr.start('foo');
});

test('@taskr/less (default)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-1');
			const tar = `${tmp}/style.css`;

			const expect = yield f.$.read(`${dir}/expect.css`, 'utf8');
			yield f.source(src).less().target(tmp);

			t.ok(yield f.$.find(tar), 'create a `.css` file correctly');
			t.equal(yield f.$.read(tar, 'utf8'), expect, 'compile multi-tiered imports');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/less (inline)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			yield f.source(src).less({ sourceMap:{sourceMapFileInline:true} }).target(tmp);

			const arr1 = yield f.$.expand(`${tmp}/*`);
			const str1 = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr1.length, 1, 'creates only one file');
			t.true(str1.indexOf('sourceMappingURL=data:application/json') !== -1, 'appends inline sourcemap');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/less (external)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-3');
			yield f.source(src).less({ sourceMap:{} }).target(tmp);

			const arr2 = yield f.$.expand(`${tmp}/*`);
			const str2 = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr2.length, 2, 'creates an external sourcemap file');
			t.true(str2.indexOf('sourceMappingURL=style.css.map') !== -1, 'appends external sourcemap link');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/less (external=true)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-4');
			yield f.source(src).less({ sourceMap:true }).target(tmp);

			const arr2 = yield f.$.expand(`${tmp}/*`);
			const str2 = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr2.length, 2, 'creates an external sourcemap file');
			t.true(str2.indexOf('sourceMappingURL=style.css.map') !== -1, 'appends external sourcemap link');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/less (custom)', t => {
	t.plan(3);
	create({
		*foo(f) {
			const map = 'out.css.map';
			const tmp = tmpDir('tmp-5');
			yield f.source(src).less({sourceMap:{ sourceMapURL:map }}).target(tmp);

			const arr3 = yield f.$.expand(`${tmp}/*`);
			const str3 = yield f.$.read(`${tmp}/style.css`, 'utf8');

			t.equal(arr3.length, 2, 'creates an external sourcemap file');
			t.ok(yield f.$.find(`${tmp}/${map}`), 'creates an external sourcemap with custom name');
			t.true(str3.indexOf(`sourceMappingURL=${map}`) !== -1, 'appends link to custom sourcemap name');
			yield f.clear(tmp);
		}
	}).start('foo');
});
