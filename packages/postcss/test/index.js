const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');
const plugins = [require('../'), require('@taskr/clear')];

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/postcss', t => {
	t.plan(2);
	const taskr = create({
		*foo(f) {
			t.true('postcss' in f, 'attach `postcss()` plugin to internal task');
		}
	});
	t.true('postcss' in taskr.plugins, 'attach `postcss()` plugin to taskr');
	taskr.start('foo');
});

test('@taskr/postcss (plugins)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-1');

			yield f.source(`${dir}/*.css`).postcss({
				plugins: [require('autoprefixer')]
			}).target(tmp);

			const arr = yield f.$.expand(`${tmp}/*.*`);
			t.equal(arr.length, 1, 'write one file to target');

			const str = yield f.$.read(`${tmp}/foo.css`, 'utf8');
			t.true(/-webkit-box/.test(str), 'applies `autoprefixer` plugin transform');

			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/postcss (options)', t => {
	t.plan(4);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			const parser = require('postcss-scss');

			yield f.source(`${dir}/*.scss`).postcss({
				plugins: [ require('autoprefixer') ],
				options: { parser }
			}).target(tmp);

			const arr = yield f.$.expand(`${tmp}/*.*`);
			t.equal(arr.length, 1, 'write one file to target');

			const str = yield f.$.read(`${tmp}/bar.scss`, 'utf8');
			t.true(str.indexOf('-ms-flexbox') !== -1, 'applies prefixer to CSS lookalike');
			t.true(str.indexOf('-webkit-box-flex: val') !== -1, 'applies prefixer to SCSS mixin');
			t.ok(str, 'retains `.scss` file extension');

			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/postcss (postcssrc)', t => {
	t.plan(2);
	const taskr = new Taskr({
		plugins,
		cwd: join(dir, 'sub1'),
		tasks: {
			*foo(f) {
				const tmp = tmpDir('tmp-3');
				yield f.source(`${dir}/*.css`).postcss().target(tmp);

				const arr = yield f.$.expand(`${tmp}/*.*`);
				t.equal(arr.length, 1, 'write one file to target');

				const str = yield f.$.read(`${tmp}/foo.css`, 'utf8');
				t.true(/-webkit-box/.test(str), 'applies `autoprefixer` plugin transform');

				yield f.clear(tmp);
			}
		}
	});
	taskr.start('foo');
});

test('@taskr/postcss (package.json)', t => {
	t.plan(2);
	const taskr = new Taskr({
		plugins,
		cwd: join(dir, 'sub2'),
		tasks: {
			*foo(f) {
				const tmp = tmpDir('tmp-4');
				yield f.source(`${dir}/*.css`).postcss().target(tmp);

				const arr = yield f.$.expand(`${tmp}/*.*`);
				t.equal(arr.length, 1, 'write one file to target');

				const str = yield f.$.read(`${tmp}/foo.css`, 'utf8');
				t.true(/-webkit-box/.test(str), 'applies `autoprefixer` plugin transform');

				yield f.clear(tmp);
			}
		}
	});
	taskr.start('foo');
});

test('@taskr/postcss (postcss.config.js)', t => {
	t.plan(2);
	const taskr = new Taskr({
		plugins,
		cwd: join(dir, 'sub3'),
		tasks: {
			*foo(f) {
				const tmp = tmpDir('tmp-5');
				yield f.source(`${dir}/*.css`).postcss().target(tmp);

				const arr = yield f.$.expand(`${tmp}/*.*`);
				t.equal(arr.length, 1, 'write one file to target');

				const str = yield f.$.read(`${tmp}/foo.css`, 'utf8');
				t.true(/-webkit-box/.test(str), 'applies `autoprefixer` plugin transform');

				yield f.clear(tmp);
			}
		}
	});
	taskr.start('foo');
});

test('@taskr/postcss (.postcssrc.js)', t => {
	t.plan(2);
	const taskr = new Taskr({
		plugins,
		cwd: join(dir, 'sub4'),
		tasks: {
			*foo(f) {
				const tmp = tmpDir('tmp-6');
				yield f.source(`${dir}/*.css`).postcss().target(tmp);

				const arr = yield f.$.expand(`${tmp}/*.*`);
				t.equal(arr.length, 1, 'write one file to target');

				const str = yield f.$.read(`${tmp}/foo.css`, 'utf8');
				t.true(/-webkit-box/.test(str), 'applies `autoprefixer` plugin transform');

				yield f.clear(tmp);
			}
		}
	});
	taskr.start('foo');
});

test('@taskr/postcss (plugins<Array> + options<String>)', t => {
	t.plan(4);
	const taskr = new Taskr({
		plugins,
		cwd: join(dir, 'sub5'),
		tasks: {
			*foo(f) {
				const tmp = tmpDir('tmp-7');
				yield f.source(`${dir}/*.scss`).postcss().target(tmp);

				const arr = yield f.$.expand(`${tmp}/*.*`);
				t.equal(arr.length, 1, 'write one file to target');

				const str = yield f.$.read(`${tmp}/bar.scss`, 'utf8');
				t.true(str.indexOf('-ms-flexbox') !== -1, 'applies prefixer to CSS lookalike');
				t.true(str.indexOf('-webkit-box-flex: val') !== -1, 'applies prefixer to SCSS mixin');
				t.ok(str, 'retains `.scss` file extension');

				yield f.clear(tmp);
			}
		}
	});
	taskr.start('foo');
});

// test('@taskr/postcss (inline)', t => {
// 	t.plan(2);
// 	create({
// 		*foo(f) {
// 			const tmp = tmpDir('tmp-3');

// 			yield f.source(`${dir}/*.css`).postcss({
// 				plugins: [ require('autoprefixer') ],
// 				options: {
// 					map: { inline:true }
// 				}
// 			}).target(tmp);

// 			const arr = yield f.$.expand(`${tmp}/*.*`);
// 			t.equal(arr.length, 1, 'write one file to target');

// 			const str = yield f.$.read(`${tmp}/foo.css`, 'utf8');
// 			t.true(/sourceMappingURL=data:application/.test(str), 'appends inline sourcemap');

// 			yield f.clear(tmp);
// 		}
// 	}).start('foo');
// });
