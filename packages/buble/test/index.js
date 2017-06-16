const join = require('path').join;
const Taskr = require('taskr');
const test = require('tape');

const plugins = [require('../'), require('@taskr/clear')];
const dir = join(__dirname, 'fixtures');
const tmp = join(__dirname, '.tmp');

const create = tasks => new Taskr({ tasks, plugins });

test('@taskr/buble (defaults)', t => {
	t.plan(10);

	const taskr = create({
		* foo(f) {
			t.true('buble' in f, 'access to `buble()` plugin within task');
			yield f.source(`${dir}/foo.js`).buble().target(tmp);

			const arr = yield f.$.expand(`${tmp}/*`);
			t.equal(arr.length, 2, 'creates two files');

			const out = yield f.$.read(`${tmp}/foo.js`, 'utf8');
			t.ok(out, 'retains the output filename');
			t.true(out.indexOf('sourceMappingURL=foo.js.map') !== -1, 'appends sourceMappingURL to file');
			t.true(/var a/.test(out), 'compiles to ES5 code');

			const map = yield f.$.read(`${tmp}/foo.js.map`, 'utf8');
			t.ok(map, 'creates an external sourcemap file');
			t.true(/"version":3/.test(map), 'stringifies V3 map');
			t.true(/"file":"foo.js"/.test(map), 'points to original filename');
			t.deepEqual(JSON.parse(map).sources, ['foo.js'], 'keeps a sources array');

			yield f.clear(tmp);
		}
	});

	t.true('buble' in taskr.plugins, 'mounts as taskr plugin');

	taskr.start('foo');
})

test('@taskr/buble (sourcemap options)', t => {
	t.plan(5);
	create({
		* foo(f) {
			yield f.source(`${dir}/foo.js`).buble({file: 'bar.js', source: 'foo/bar.js'}).target(tmp);

			const arr = yield f.$.expand(`${tmp}/*`);
			t.equal(arr.length, 2, 'creates two files');

			const out = yield f.$.read(`${tmp}/foo.js`, 'utf8');
			t.ok(out.indexOf('sourceMappingURL=bar.js.map') !== -1, 'points to custom `options.file` name');

			const map = yield f.$.read(`${tmp}/bar.js.map`, 'utf8');
			t.ok(map, 'creates a file with custom `options.file` name');
			const obj = JSON.parse(map);
			t.equal(obj.file, 'bar.js', 'keeps custom `options.file` name');
			t.equal(obj.sources[0], 'foo/bar.js', 'keeps custom `options.source` value');

			yield f.clear(tmp);
		}
	}).start('foo');
});

test('@taskr/buble (no sourcemap)', t => {
	t.plan(2);
	create({
		* foo(f) {
			yield f.source(`${dir}/foo.js`).buble({sourceMap: false}).target(tmp);

			const arr = yield f.$.expand(tmp);
			t.equal(arr.length, 1, 'creates only one file');

			const out = yield f.$.read(`${tmp}/foo.js`, 'utf8');
			t.equal(out.indexOf('sourceMappingURL=foo.js.map'), -1, 'does not append a sourceMappingURL');

			yield f.clear(tmp);
		}
	}).start('foo');
})

test('@taskr/buble (inline)', t => {
	t.plan(3);
	create({
		* foo(f) {
			yield f.source(`${dir}/foo.js`).buble({inline: true}).target(tmp);

			const arr = yield f.$.expand(tmp);
			t.equal(arr.length, 1, 'creates only one file');

			const out = yield f.$.read(`${tmp}/foo.js`, 'utf8');
			t.equal(out.indexOf('sourceMappingURL=foo.js.map'), -1, 'does not append external sourceMappingURL');
			t.ok(out.indexOf('sourceMappingURL=data:application/json;charset=utf-8;base64'), 'appends data URI instead');

			yield f.clear(tmp);
		}
	}).start('foo');
});
