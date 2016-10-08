'use strict';

const join = require('path').join;
const test = require('tape').test;
const Promise = require('bluebird');
const plugs = require('../lib/plugins');
const $ = require('../lib/fn');
const co = Promise.coroutine;

const fixtures = join(__dirname, 'fixtures');
const altDir = join(fixtures, 'alt');
const pkgfile = join(altDir, 'package.json');
const flyfile = join(altDir, 'flyfile.js');

test('plugins', t => {
	t.ok(Object.keys(plugs).length, 'export some methods');
	['load', 'getDependencies'].forEach(k => t.ok(plugs[k] !== undefined, `${k} is defined`));
	t.end();
});

test('plugins.getDependencies', co(function * (t) {
	const out1 = yield plugs.getDependencies();
	t.true($.isArray(out1) && out1.length === 0, 'via `null` input; returns an empty array');

	const out2 = yield plugs.getDependencies(pkgfile);
	t.true($.isArray(out2), 'via valid file; returns an array');
	t.equal(out2.length, 3, 'via valid file; find all the available dependencies');

	const out3 = yield plugs.getDependencies(join(fixtures, 'asd.json'));
	t.true($.isArray(out3) && out3.length === 0, 'via 404 file; returns an empty array');

	t.end();
}));

test('plugins.load', co(function * (t) {
	// const out1 = yield plugs.load(join('/fake123', 'flyfile.js'));
	// t.true($.isArray(out1) && out1.length === 0, 'via invalid file; returns an empty array');
		// ^^ logs error message to test; disrupts formatting

	const out = yield plugs.load(flyfile);
	t.ok($.isArray(out), 'returns an array');
	t.equal(out.length, 1, 'filters down to fly-* plugins only');
	t.ok($.isObject(out[0]), 'is an array of objects');
	t.ok('name' in out[0] && 'func' in out[0], 'objects contain `name` and `func` keys');

	t.end();
}));

// test('Fly should throws error when sealed property modified', function (t) {
// 	var pluginMock = {
// 		name: 'mock',
// 		plugin: function () {
// 			this.root = 'hacked'
// 			this.filter('transform', function () {})
// 		}
// 	}

// 	t.throws(function () {
// 		var fly = new Fly({
// 			file: 'mock.js',
// 			host: {},
// 			plugins: [pluginMock]
// 		})

// 		fly.transform()
// 	})

// 	t.end()
// })

// test('Fly should safely apply changes within plugin context', function (t) {
// 	var pluginMock = {
// 		name: 'mock',
// 		plugin: function () {
// 			this.filter('transform', function () {
// 				this.root = 'hacked'
// 			})
// 		}
// 	}

// 	t.doesNotThrow(function () {
// 		var fly = new Fly({
// 			file: 'mock.js',
// 			host: {},
// 			plugins: [pluginMock]
// 		})

// 		fly.transform()
// 		t.equal(fly.root, '.', 'fly instance not rewritten from plugin context')
// 	})

// 	t.end()
// })
