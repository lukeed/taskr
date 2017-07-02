const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const dir = join(__dirname, 'fixtures');

const plugins = [
	require('@taskr/clear'),
	require('../')
];

const tmpDir = str => join(__dirname, str);
const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/zip', t => {
	t.plan(2);
	const taskr = create({
		*foo(f) {
			t.true('zip' in f, 'attach `zip` to Task instance');
			t.true('zip' in taskr.plugins, 'attach `zip` plugin to instance');
		}
	});
	taskr.start('foo');
});

test('@taskr/zip (defaults)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			yield f.source(`${dir}/*.baz`).zip().target(tmp);
			const arr = yield f.$.expand(`${tmp}/*`);
			t.equal(arr.length, 1, 'sends one file to target');
			t.true(arr[0].indexOf('archive.zip') !== -1, 'creates `tmp/archive.zip` file');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/zip (file)', t => {
	t.plan(2);
	create({
		*foo(f) {
			const tmp = tmpDir('tmp-2');
			yield f.source(`${dir}/*.baz`).zip({ file:'foo.zip' }).target(tmp);
			const arr = yield f.$.expand(`${tmp}/*`);
			t.equal(arr.length, 1, 'sends one file to target');
			t.true(arr[0].indexOf('foo.zip') !== -1, 'creates `tmp/foo.zip` file');
			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/zip (dest)', t => {
	t.plan(3);
	create({
		*foo(f) {
			const tmp1 = tmpDir('tmp-3');
			const tmp2 = tmpDir('tmp-4');
			yield f.source(`${dir}/*.baz`).zip({ dest:tmp2 }).target(tmp1);

			const arr1 = yield f.$.expand(`${tmp1}/*`);
			const arr2 = yield f.$.expand(`${tmp2}/*`);

			t.equal(arr1.length, 2, 'sends two file to `target` dir');

			t.equal(arr2.length, 1, 'sends one file to `dest` dir');
			t.true(arr2[0].indexOf('archive.zip') !== -1, 'creates `dest/archive.zip` file');

			yield f.clear([tmp1, tmp2]);
		}
	}).start('foo');
});
