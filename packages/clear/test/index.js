const join = require('path').join;
const exists = require('fs').existsSync;
const co = require('bluebird').coroutine;
const Taskr = require('taskr');
const test = require('tape');
const fn = require('../');

const dir1 = join(__dirname, 'tmp1');
const dir2 = join(__dirname, 'tmp2');
const plugins = [require('../')];

const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/clear: filepath (task)', co(function * (t) {
	t.plan(2);
	yield create({
		* a(f) {
			const src = `${dir1}/foo`;
			yield f.$.write(src);
			t.true('clear' in f, 'attach `clear` to task instance');
			yield f.clear(src);
			t.false(exists(src), 'file was deleted');
		}
	}).start('a');
}));

test('@taskr/clear: directory', co(function * (t) {
	t.plan(1);
	yield create({
		* a(f) {
			const src = `${dir1}/foo`;
			yield f.$.write(src);
			yield f.clear(dir1);
			t.false(exists(src), 'directory was deleted');
		}
	}).start('a');
}));

test('@taskr/clear: filepath array', co(function * (t) {
	t.plan(2);
	yield create({
		* a(f) {
			const src1 = `${dir1}/foo`;
			const src2 = `${dir1}/bar`;
			yield f.$.write(src1);
			yield f.$.write(src2);
			yield f.clear([src1, src2]);
			t.false(exists(src1), 'file1 was deleted');
			t.false(exists(src2), 'file2 was deleted');
		}
	}).start('a');
}));

test('@taskr/clear: directory array', co(function * (t) {
	t.plan(2);
	yield create({
		* a(f) {
			const src1 = `${dir1}/foo`;
			const src2 = `${dir2}/bar`;
			yield f.$.write(src1);
			yield f.$.write(src2);
			yield f.clear([dir1, dir2]);
			t.false(exists(src1), 'dir1 was deleted');
			t.false(exists(src2), 'dir2 was deleted');
		}
	}).start('a');
}));

test('@taskr/clear: directory glob', co(function * (t) {
	t.plan(4);
	yield create({
		* a(f) {
			const src1 = `${dir1}/foo`;
			const src2 = `${dir2}/bar/baz`;
			const src3 = `${dir2}/bar/bat`;
			yield f.$.write(src1);
			yield f.$.write(src2);
			yield f.$.write(src3);
			yield f.clear([dir1, `${dir2}/bar/*`]);
			t.false(exists(src1), 'dir1 was deleted');
			t.false(exists(src2), 'dir2/file1 was deleted');
			t.false(exists(src3), 'dir2/file2 was deleted');
			t.true(exists(`${dir2}/bar`), 'dir2/bar still exists');
			yield f.clear(dir2);
		}
	}).start('a');
}));

test('@taskr/clear: with `rimraf` options', co(function * (t) {
	t.plan(2);
	yield create({
		* a(f) {
			const src1 = `${dir1}/bar/baz`;
			const src2 = `${dir1}/bar/bat`;
			yield f.$.write(src1);
			yield f.$.write(src2);
			yield f.clear(`${dir1}/bar/*`, {glob: false});
			t.true(exists(src1), 'file1 still exists');
			t.true(exists(src2), 'file2 still exists');
			yield f.clear(dir1);
		}
	}).start('a');
}));
