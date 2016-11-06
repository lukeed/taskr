'use strict';

const join = require('path').join;
const Promise = require('bluebird');
const test = require('tape').test;
const touch = require('touch');
const $ = require('../lib/fn');
const Fly = require('../lib');
const co = Promise.coroutine;

const fixtures = join(__dirname, 'fixtures');

test('fly.prototype', t => {
	t.ok(Fly !== undefined, 'is defined');
	const _ = Fly.prototype;

	['source', 'target', 'emit', 'on', 'clear',
	'start', 'serial', 'parallel', 'run']
		.forEach(cmd => {
			t.equal(typeof _[cmd], 'function', `fly.${cmd} is defined`);
		});

	t.end();
});

test('fly.constructor', t => {
	const fake = {
		file: 'fake',
		pwd: fixtures,
		tasks: {a: '1'},
		plugins: [1, 2, 3]
	};

	const fly1 = new Fly();
	t.true(fly1 instanceof Fly, 'instance retains Fly classification');
	t.equal(fly1.file, undefined, '`fly.file` is `undefined` by default');
	t.equal(fly1.root, process.cwd(), '`fly.root` is `process.cwd()` by default');
	t.true($.isObject(fly1.$), '`fly.$` core utilities are attached');
	t.true($.isArray(fly1.plugins) && !fly1.plugins.length, '`fly.plugins` is an empty array by default');
	t.true($.isObject(fly1.tasks) && $.isEmptyObj(fly1.tasks), '`fly.tasks` is an empty object by default');
	t.true($.isEmptyObj(fly1._), '`fly._` is an empty object on init');

	const fly2 = new Fly(fake);
	t.equal(fly2.file, fake.file, 'accept custom `file` value');
	t.equal(fly2.plugins, fake.plugins, 'accept custom `plugins` value');
	t.equal(fly2.root, fake.pwd, 'accept custom `root` or `pwd` value');
	t.equal(fly2.tasks, fake.tasks, 'accept custom `tasks` value');

	t.end();
});

test('fly.init', co(function * (t) {
	const RDY = '_ready';
	const fly1 = new Fly({
		tasks: {
			a: function * () {
				t.equal(this, fly1, 'bind tasks to fly instance');
			}
		}
	});

	t.false(fly1[RDY], 'is not ready before `fly.init`');

	fly1.init();

	t.true(fly1[RDY], 'is ready after `fly.init`');

	fly1.tasks.a();

	const fly2 = new Fly({tasks: [1, 2, 3]});
	fly2.on('tasks_force_object', () => {
		t.pass('emit an error if `tasks` is not an object');
	});
	fly2.init();

	t.end();
}));

test('fly.source', co(function * (t) {
	t.plan(18);

	const fly = new Fly();
	const glob1 = ['*.a', '*.b', '*.c'];
	const glob2 = join(fixtures, '*.*');
	const opts1 = {ignore: 'foo'};

	fly.on('globs_no_match', (g, o) => {
		t.pass('notify when globs match no files');
		t.deepEqual(g, glob1, 'warning receives the flattened globs');
		t.deepEqual(o, opts1, 'warning receives the `globby` options');
	});

	const out = yield fly.source([[['*.a', ['*.b']]], ['*.c']], opts1);
	t.true('globs' in fly._ && 'files' in fly._, 'create `globs` and `files` keys within `fly._`');
	t.deepEqual(fly._.globs, glob1, 'flatten nested globs');
	t.deepEqual(fly._.files, [], 'return empty array if no files matched');
	t.equal(out, fly, 'returns the bound instance');

	yield fly.source(glob2);
	t.true($.isArray(fly._.globs), 'wrap a single glob string as an array');
	t.equal(fly._.globs[0], glob2, 'update internal `source` keys each time');
	t.true($.isArray(fly._.files), 'return an array of relevant files');
	t.equal(fly._.files.length, 4, 'accepts wildcard extensions; finds all files');
	const f1 = fly._.files[0];
	t.ok($.isObject(f1), 'array contents are objects');
	t.ok('data' in f1, 'add `data` key to `pathObject`');
	t.false('root' in f1, 'delete `root` key from `pathObject`');
	t.false('name' in f1, 'delete `name` key from `pathObject`');
	t.false('ext' in f1, 'delete `ext` key from `pathObject`');
	t.ok(Buffer.isBuffer(f1.data), 'file data is a `Buffer`');

	yield fly.source(glob2, {ignore: join(fixtures, 'flyfile.js')});
	t.equal(fly._.files.length, 3, 'send config options to `globby` (ignore key)');
}));

test('fly.start', co(function * (t) {
	let val;
	const RDY = '_ready';

	t.plan(14);

	const fly1 = new Fly({
		tasks: {
			a: function * () {
				val = 5;
				t.pass('execute a task programmatically');
			}
		}
	});

	t.false(fly1[RDY], 'not yet initialized');
	yield fly1.start('a');
	t.equal(val, 5, 'truly `await` a task\'s completion');
	t.true(fly1[RDY], 'ran `fly.init` because was not initialized');

	const fly2 = new Fly({
		tasks: {
			a: function * () {},
			err: function * () {
				throw new Error();
			}
		}
	});

	fly2.emit = e => {
		if (e === 'task_not_found') {
			t.pass('notify when task not found');
		} else if (e === 'task_start') {
			t.pass('notify when task starts');
		} else if (e === 'task_complete') {
			t.pass('notify when task completes');
		} else if (e === 'task_error') {
			t.pass('notify when task errors');
		}
	};

	yield fly2.start('a');
	try {
		yield fly2.start('err');
	} catch (e) {
		t.pass('task threw its own error');
	}

	const demo = {val: 5};
	const fly3 = new Fly({
		tasks: {
			a: function * (obj) {
				t.ok(obj.val === demo.val, 'pass a value to a task');
				t.ok('src' in obj, 'a `src` key always exists');
				t.ok(obj.src === null, 'the `src` key defaults to null');
				yield this.start('b');
				return obj.val;
			},
			b: function * () {
				t.pass('start a task from within a task');
				yield Promise.resolve(4);
				return 4;
			}
		}
	});

	const out = yield fly3.start('a', demo);
	t.equal(out, demo.val, 'tasks can return values directly');
}));

test('fly.parallel', co(function * (t) {
	t.plan(6);
	let int = 0;
	const order = [];
	const demo = {val: 10};

	const fly = new Fly({
		tasks: {
			a: function * (opts) {
				yield Promise.delay(9);
				t.equal(opts.val, demo.val, 'task-a got initial `opts` object');
				order.push('a');
				return int++;
			},
			b: function * (opts) {
				yield Promise.delay(6);
				t.equal(opts.val, demo.val, 'task-b got initial `opts` object');
				order.push('b');
				return int++;
			},
			c: function * (opts) {
				yield Promise.delay(3);
				t.equal(opts.val, demo.val, 'task-c got initial `opts` object');
				order.push('c');
				return int++;
			}
		}
	});

	const out = yield fly.parallel(['a', 'b', 'c'], demo);
	t.equal(out, undefined, 'chain yields no return');
	t.equal(int, 3, 'wait for the entire chain\'s completion');
	t.notDeepEqual(order, ['a', 'b', 'c'], 'execution order is random');
}));

test('fly.serial', co(function * (t) {
	t.plan(7);

	const int = 3;
	const order = [];
	const fly1 = new Fly({
		tasks: {
			a: function * (opts) {
				yield Promise.delay(2);
				t.equal(opts.val, int, 'task-a got initial `opts` object');
				order.push('a');
				return opts.val + 1;
			},
			b: function * (opts) {
				yield Promise.delay(1);
				t.equal(opts.val, int + 1, 'task-b got mutated `opts` object');
				order.push('b');
				return opts.val + 1;
			},
			c: function * (opts) {
				yield Promise.delay(0);
				t.equal(opts.val, int + 2, 'task-c got mutated `opts` object');
				order.push('c');
				return opts.val + 1;
			}
		}
	});

	const out = yield fly1.serial(['a', 'b', 'c'], {val: int});
	t.equal(out, int + 3, 'chain yields final return value');
	t.deepEqual(order, ['a', 'b', 'c'], 'execute tasks in order, regardless of delay');

	let num = 0;
	const fly2 = new Fly({
		tasks: {
			a: function * () {
				num++;
			},
			c: function * () {
				num++;
			},
			b: function * () {
				num++;
				throw new Error();
			}
		}
	});

	fly2.emit = e => (e === 'serial_error') && t.pass('notify when a task within `serial` throws');

	yield fly2.serial(['a', 'b', 'c']);
	t.equal(num, 2, 'interrupt `serial` on error; only 2 tasks ran');
}));

test('fly.run', co(function * (t) {
	t.plan(9);
	const src = join(fixtures, '*.txt');
	const tar = join(fixtures, '.tmp');

	const fly = new Fly({
		tasks: {
			a: function * (o) {
				const t = o.val;
				yield this.source(src).run({}, function * (file) {
					t.true($.isObject(file), 'iterate thru each `file` by default');
					t.true('data' in file, 'entire `file` object is accessed');
					file.data = new Buffer(file.data.toString().toUpperCase());
				}).target(tar);
			},
			b: function * (o) {
				const t = o.val;
				yield this.source(src).run({every: 0}, function * (files) {
					t.true($.isArray(files), 'allow inline `run` to use `every: 0`');
				}).target(tar);
			}
		}
	});

	yield fly.start('a', {val: t});
	const arr1 = yield fly.$.expand(`${tar}/*.txt`);
	t.equal(arr1.length, 2, 'place files in target destination after `inline` method');
	const str1 = yield fly.$.read(`${tar}/foo.txt`, 'utf8');
	const str2 = yield fly.$.read(`${tar}/bar.txt`, 'utf8');
	t.equal(str1, 'FOO BAR\n', 'capitalize file contents individually');
	t.equal(str2, 'BAR BAZ\n', 'capitalize file contents individually');
	yield fly.clear(tar);

	yield fly.start('b', {val: t});
	const arr2 = yield fly.$.expand(`${tar}/*.txt`);
	t.equal(arr2.length, 2, 'place files in target destination after `inline` method');
	yield fly.clear(tar);
}));

test('fly.clear', co(function * (t) {
	const files = ['a.foo', 'b.foo', 'c.foo'].map(f => join(fixtures, f));
	const dirs = ['tmp1', 'tmp2', 'tmp3'].map(d => join(fixtures, d));
	const file = join(fixtures, 'foo.bar');
	const fly = new Fly();
	const data = 'hi';

	// prepare new fixture files
	yield fly.$.write(file, data);

	for (const d of dirs) {
		yield fly.$.write(join(d, 'foo.z'), data);
	}

	for (const f of files) {
		yield fly.$.write(f, data);
	}

	const out1 = yield fly.clear(file);
	t.ok(out1 === undefined, 'has no return value');
	t.false(yield fly.$.find(file), 'delete a single file by its full path');

	yield fly.clear(dirs);
	const out2 = yield fly.$.expand(dirs);
	t.false(out2.length, 'delete an array of directory paths');

	const glob = join(fixtures, '*.foo');
	yield fly.clear(glob);
	const out3 = yield fly.$.expand(glob);
	t.false(out3.length, 'delete a glob of matching files');

	t.end();
}));

test('fly.target', co(function * (t) {
	const glob1 = join(fixtures, 'one', 'two', '*.md');
	const glob2 = join(fixtures, 'one', '*.md');
	const glob3 = join(fixtures, '**', '*.md');
	const glob4 = join(fixtures, 'one', '**', '*.md');

	const dest1 = join(fixtures, '.tmp1');
	const dest2 = join(fixtures, '.tmp2');
	const dest3 = join(fixtures, '.tmp3');
	const dest4 = join(fixtures, '.tmp4');
	const dest5 = join(fixtures, '.tmp5');
	const dest6 = join(fixtures, '.tmp6');

	const fly = new Fly({
		plugins: [{
			name: 'fakeConcat',
			func: function () {
				this.plugin('fakeConcat', {every: 0}, function * (all) {
					this._.files = [{dir: all[0].dir, base: 'fake.foo', data: new Buffer('bar')}];
				});
			}
		}]
	});

	// clean slate
	yield fly.clear([dest1, dest2, dest3, dest4, dest5]);

	// test #1
	yield fly.source(glob1).target(dest1);
	t.pass('allow method chains!');
	const val1 = join(dest1, 'two', 'two-1.md');
	const str1 = yield fly.$.find(val1);
	const arr1 = yield fly.$.expand(join(dest1, '*.md'));
	t.equal(arr1.length, 2, 'via `src/one/two/*.md`; write all files');
	t.ok(str1 && str1 !== val1, 'via `src/one/two/*.md`; did not create sub-dir if unwanted');

	// test #2
	yield fly.source(glob2).target(dest2);
	const arr2 = yield fly.$.expand(join(dest2, '*.md'));
	const str2 = yield fly.$.find(join(dest2, 'one.md'));
	t.equal(arr2.length, 1, 'via `src/one/*.md`; write all files');
	t.ok(str2.length, 'via `src/one/*.md`; write to correct tier');

	// test #3
	yield fly.source(glob3).target(dest3);
	const arr3 = yield fly.$.expand(join(dest3, '**', '*.md'));
	const str3 = yield fly.$.find(join(dest3, 'one', 'two', 'two-1.md'));
	t.ok(str3.length, 'via `src/**/*.md`; create the (nested) child directory');
	t.equal(arr3.length, 3, 'via `src/**/*.md`; write all files');

	// test #4
	yield fly.source(glob4).target([dest4, dest5]);
	const str4 = yield fly.$.find(join(dest4, 'two', 'two-1.md'));
	const str5 = yield fly.$.find(join(dest5, 'two', 'two-1.md'));
	t.true(str4.length && str5.length, 'write to multiple targets');

	yield fly.source(glob4).target(dest6).fakeConcat().target(`${dest6}/sub`);
	t.pass('allow `target()` to be chained');
	const str6 = yield fly.$.find(join(dest6, 'two', 'two-1.md'));
	const str7 = yield fly.$.find(join(dest6, 'sub', 'fake.foo'));
	t.true(str6.length && str7.length, 'perform all actions in double-target chain');

	// clean up
	yield fly.clear([dest1, dest2, dest3, dest4, dest5, dest6]);

	t.end();
}));

test('fly.watch', co(function * (t) {
	t.plan(15);

	const glob = join(fixtures, '*.js');
	const file = join(fixtures, 'flyfile.js');
	const want = ['b', 'a'];

	let val = 10;
	let order = [];

	const fly = new Fly({
		tasks: {
			a: function * (o) {
				order.push('a');
				t.pass('execute tasks when `watch` starts');
				t.equal(o.val, val, 'retain `serial` options behavior');
				return ++val;
			},
			b: function * (o) {
				order.push('b');
				t.equal(o.val, val, 'pass (initial) options to tasks on init');
				return ++val;
			}
		}
	});

	fly.emit = function (e, obj) {
		if (e === 'fly_watch') {
			t.pass('notify when `watch` starts');
		}

		if (e === 'fly_watch_event') {
			t.pass('notify when `watch` events occur');
			t.equal(obj.action, 'changed', 'receive the correct event `type`');
			t.equal(obj.file, file, 'receive the relevant `file` for given event');
			t.true('prevs' in fly._, 'add the `prevs` key to `fly._` internals');
			t.true($.isArray(fly._.prevs), 'the `fly._.prevs` key is an array');
			t.equal(fly._.prevs[0], glob, 'save the previous `glob` to `fly._.prevs`');
		}
	};

	const ctx = yield fly.watch(glob, want, {val: val});
	t.deepEqual(order, want, 'run `watch` task chain in `serial` mode');
	t.equal(val, 12, 'truly `await` for chain completion');

	// reset
	order = [];

	// hijack / overwrite tasks
	fly.tasks = {
		a: function * (o) {
			order.push('a');
			t.equal(o.src, file, 'receives new `src` key after `watch_event`');
			t.deepEqual(order, want, 're-run chain in correct order');
			// stop watching.
			ctx.unwatch(glob);
			ctx.close();
		},
		b: function * (o) {
			order.push('b');
			t.equal(o.src, file, 'receive new `src` key after `watch_event`');
		}
	};

	// force trigger
	setTimeout(() => touch(file), 100);
}));
