// var co = require('co');
var path = require('path');
var test = require('tape').test;
var utils = require('../lib/utils');
var join = path.join;

var fixtures = join(process.cwd(), 'test', 'fixtures', 'utils');

function asyncFunc(value, handler) {
	setTimeout(function () {
		return (handler(undefined, value));
	}, 100);
}

function asyncFuncWithOptions(value, options, handler) {
	setTimeout(function () {
		return (handler(undefined, value));
	}, options.time);
}

test('fly utilities ✈', function (t) {
	t.ok(utils !== undefined, 'it\'s real');

	['bind', 'defer', 'find', 'log', 'error', 'alert', 'stamp', 'trace']
		.forEach(function (prop) {
			t.ok(utils[prop] !== undefined, prop + ' is defined');
		});
	t.end();
});

test('utils.defer (asyncFunc) ✈', function (t) {
	t.plan(1);
	utils.defer(asyncFunc)(42).then(function (value) {
		t.equal(value, 42, 'promisifies an async func');
	});
});

test('utils.defer (asyncFunc /w options) ✈', function (t) {
	t.plan(1);
	utils.defer(asyncFuncWithOptions)(1985, {time: 100}).then(function (value) {
		t.equal(value, 1985, 'promisifies an async func w/ options');
	});
});

test('utils.find (flyfile) ✈', function (t) {
	var name = 'flyfile.js';
	var full = join(fixtures, name);

	utils.find(name, fixtures).then(function (fp) {
		t.ok(fp !== undefined, 'finds a flyfile, given a directory');
		t.equal(fp, full, 'finds the right one!');
	});

	var dir = join(fixtures, 'one'); // test dir
	utils.find(name, dir).then(function (fp) {
		t.equal(fp, full, 'finds a flyfile, traversing upwards');
		t.end();
	});
});

// test('utils.flatten (array) ✈', function (t) {
// 	t.deepEqual(utils.flatten([[[1],[2]],[3,4],[[[[5,6]]]],[7],[8]]),
// 		[1,2,3,4,5,6,7,8], 'flattens arrays');
// 	t.end();
// });

// test("utils.expand (pattern, options) ✈", function (t) {
// 	t.plan(4)
// 	const expected = ["a.js", "b.js", "Flyfile.js", "sample.babel.js"]

// 	utils.expand("./utils/**/*.js").then((files) => {
// 		files.map((file) => basename(file)).forEach((file) => {
// 			t.ok(!!~expected.indexOf(file), 'expands and handles globs: ' + file)
// 		})
// 	})
// })

// test("utils.expand (negated glob) ✈", function (t) {
// 	t.plan(1)

// 	const glob1 = ["./utils/**/*.js"]
// 	const glob2 = glob1.concat("!./utils/a.js")

// 	utils.expand(glob1).then(all => {
// 		const count = all.length - 1
// 		utils.expand(glob2).then(files => {
// 			t.ok(files.length === count, "handle glob file exclusions")
// 		})
// 	})
// })

// test('utils.bind (module) ✈', function (t) {
// 	const coffee = require(
// 		utils.bind(join(process.cwd(), './utils/sample.coffee'))
// 	)
// 	t.equal(coffee.getSecret(), 42, 'binds to coffee-script')

// 	// const babel = require(
// 	//   utils.bind(join(process.cwd(), "./utils/sample.babel.js"))
// 	// )
// 	// t.equal(babel.getSecret(), 42, "binds to babel")

// 	t.end()
// })
