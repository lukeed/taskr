// for Uglify v3.x

// 'use strict';

// const join = require('path').join;
// const Taskr = require('taskr');
// const test = require('tape');

// const dir = join(__dirname, 'fixtures');
// const plugins = [require('../'), require('@taskr/clear')];
// const glob = `${dir}/**/*.js`;

// const tmpDir = str => join(__dirname, str);
// const create = tasks => new Taskr({ tasks, plugins });

// test('@taskr/uglify', t => {
// 	t.plan(1);
// 	const taskr = create({
// 		*foo(f) {
// 			t.true('uglify' in taskr.plugins, 'attach `uglify()` plugin to taskr');
// 		}
// 	});
// 	taskr.start('foo');
// });

// test('@taskr/uglify (default)', t => {
// 	t.plan(2);
// 	create({
// 		*foo(f) {
// 			const tmp = tmpDir('tmp-1');
// 			yield f.source(glob).uglify().target(tmp);

// 			const str = yield f.$.read(`${tmp}/a.js`, 'utf8');
// 			t.equal(str, `console.log("this is a");`, 'apply `uglify-js` to content');
// 			const arr = yield f.$.expand(`${tmp}/**/*.*`);
// 			t.equal(arr.length, 2, 'keep all files');

// 			yield f.clear(tmp);
// 		}
// 	}).start('foo');
// });

// test('@taskr/uglify (options)', t => {
// 	t.plan(1);
// 	create({
// 		*foo(f) {
// 			const tmp = tmpDir('tmp-2');
// 			const opts = { drop_console:true };
// 			yield f.source(glob).uglify({ compress:opts }).target(tmp);

// 			const str = yield f.$.read(`${tmp}/a.js`, 'utf8');
// 			t.equal(str, '', 'accepts custom config');

// 			// yield f.clear(tmp);
// 		}
// 	}).start('foo');
// });

// test('@taskr/uglify (sourceMap)', t => {
// 	t.plan(2);
// 	create({
// 		*foo(f) {
// 			const tmp = tmpDir('tmp-3');
// 			yield f.source(glob).uglify({ sourceMap:true }).target(tmp);

// 			const arr = yield f.$.expand(`${tmp}/**/*.*`);
// 			t.equal(arr.length, 4, 'creates external sourcemaps per each file');
// 			const str = yield f.$.read(`${tmp}/a.js`, 'utf8');
// 			t.true(str.indexOf('sourceMappingURL=a.js') !== -1, 'appends sourcemap link comment');

// 			yield f.clear(tmp);
// 		}
// 	}).start('foo');
// });

// test('@taskr/uglify (inline)', t => {
// 	t.plan(2);
// 	create({
// 		*foo(f) {
// 			const tmp = tmpDir('tmp-4');
// 			yield f.source(glob).uglify({ sourceMap:'inline' }).target(tmp);

// 			const arr = yield f.$.expand(`${tmp}/**/*.*`);
// 			t.equal(arr.length, 2, 'does NOT create external sourcemaps');
// 			const str = yield f.$.read(`${tmp}/a.js`, 'utf8');
// 			t.true(str.indexOf('sourceMappingURL=data:application/json') !== -1, 'appends inline sourcemap');

// 			yield f.clear(tmp);
// 		}
// 	}).start('foo');
// });

// test('@taskr/uglify (custom map)', t => {
// 	t.plan(3);
// 	create({
// 		*foo(f) {
// 			const tmp = tmpDir('tmp-5');
// 			const sourceMap = { out:'foobar.js.map' };
// 			yield f.source(glob).uglify({ sourceMap }).target(tmp);

// 			const arr = yield f.$.expand(`${tmp}/**/*.*`);
// 			t.equal(arr.length, 4, 'creates external sourcemaps');
// 			const str = yield f.$.read(`${tmp}/a.js`, 'utf8');
// 			t.true(str.indexOf(`sourceMappingURL=${sourceMap.out}`) !== -1, 'appends link to custom sourcemap');
// 			const has = yield f.$.find(`${tmp}/${sourceMap.out}`);
// 			t.true(has, 'creates external sourcemap with custom filename');
// 			// yield f.clear(tmp);
// 		}
// 	}).start('foo');
// });
