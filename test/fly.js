'use strict';

const join = require('path').join;
const Promise = require('bluebird');
const test = require('tape').test;
const $ = require('../lib/fn');
const Fly = require('../lib');
const co = Promise.coroutine;

const fixtures = join(__dirname, 'fixtures');
// const flyfile = join(fixtures, 'flyfile.js');

test('fly.prototype', t => {
	t.ok(Fly !== undefined, 'is defined');
	const _ = Fly.prototype;

	['source', 'target', 'emit', 'on', 'clear',
	'start', 'serial', 'parallel']
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
	t.true(fly1.file === undefined, '`fly.file` is `undefined` by default');
	t.true(fly1.root === process.cwd(), '`fly.root` is `process.cwd()` by default');
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
	const fly = new Fly();
	const out = yield fly.source([[['*.a', ['*.b']]], ['*.c']]);
	t.true('globs' in fly._ && 'files' in fly._, 'create `globs` and `files` keys within `fly._`');
	t.deepEqual(fly._.globs, ['*.a', '*.b', '*.c'], 'flatten nested globs');
	t.deepEqual(fly._.files, [], 'return empty array if no files matched');
	t.equal(out, fly, 'returns the bound instance');

	const txt = join(fixtures, '*.txt');
	yield fly.source(txt);
	t.true($.isArray(fly._.globs), 'convert single source string to an array');
	t.equal(fly._.globs[0], txt, 'update internal `source` keys each time');
	t.true($.isArray(fly._.files) && fly._.files.length, 'return an array of relevant files');
	t.equal(fly._.files[0], join(fixtures, 'foo.txt'), 'find the correct files');

	t.end();
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
	const fly1 = new Fly();

	console.log(fly1);

	t.end();
}));

// test('fly.watch', co(function * (t) {}));

// // test('fly.watch', t => {
// // 	t.plan(6)
// // 	var glob = 'flyfile.js'
// // 	var file = flyfile

// // 	var fly = new Fly({
// // 		file: file,
// // 		host: {
// // 			default: function * (data) {
// // 				t.pass('run tasks at least once')
// // 				t.equal(data, 42, 'pass options into task via start')
// // 			}
// // 		}
// // 	})

// // 	fly.emit = function (event) {
// // 		if (event === 'fly_watch') {
// // 			t.pass('notify watch event to observers')
// // 		}
// // 		return fly
// // 	}

// //	fly.watch(glob, 'default', {value: 42}).then(function (watcher) {
// //		t.ok(watcher.unwatch !== undefined, 'watch promise resolves to a watcher')
// //		setTimeout(function () {
// //			// hijack the task to test the watcher runs default when the glob changes
// //			fly.host.default = function (data) {
// //				watcher.unwatch(glob)
// //				t.pass('run given tasks when glob changes')
// //				t.equal(data, glob, 'pass options into task via start on change')
// //			}
// //			touch(file)
// //		}, 100)
// //	})
// // })

// test('fly.target', t => {
// 	t.plan(1)

// 	co(function * () {
// 		var fly = new Fly()

// 		yield fly.source(fixtures + '/*.txt').filter(function (data) {
// 			return data.toString().toUpperCase()
// 		}).target(fixtures)

// 		yield fly.source(fixtures + '/*.txt').filter(function (data) {
// 			t.ok(data.toString() === 'FOO BAR\n', 'resolve source, filters and writers')
// 			return data.toString().toLowerCase()
// 		}).target(fixtures)
// 	})
// })
