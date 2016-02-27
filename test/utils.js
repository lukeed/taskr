var co = require('co');
var path = require('path');
var test = require('tape').test;
var utils = require('../lib/utils');

var join = path.join;
var basename = path.basename;

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
			t.ok(utils[prop] !== undefined, prop +' is defined');
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

test('utils.find (path) ✈', function * (t) {
	t.plan(2);
	var src = './utils';
	var expect = 'Flyfile.js';

	var file1 = yield utils.find(join(fixtures, expected));
	console.log('HI');
	co(function () {
		console.log('FIRST');
		console.log('INSIDE HERE');
	});
		// var file2 = yield utils.find(fixtures);
		// t.equal(basename(val), expected, 'find Flyifle given a file');
		// t.equal(basename(file2), expected, 'find Flyfile given a path');
	// });
});

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
