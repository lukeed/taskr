// 'use strict'

// // var co = require('co')
// var fs = require('fs')
// var path = require('path')
// var test = require('tape').test
// var plugins = require('../lib/plugins')
// var utils = require('../lib/utils')
// var Fly = require('../lib/fly')

// var fixtures = path.join(process.cwd(), 'test', 'fixtures')
// var alt = path.join(fixtures, 'alt')
// var pkg = path.join(alt, 'package.json')

// test('fly plugins ✈', t => {
// 	t.ok(plugins !== undefined, 'plugins object is real');

// 	['load', 'parse', 'readPackages'].forEach(str => {
// 		t.ok(plugins[str] !== undefined, `${str} is defined`);
// 	});

// 	t.end();
// });

// test('utils.find (package.json)', function (t) {
// 	var name = 'package.json'
// 	var ours = path.resolve(fixtures, '../..', name) // fly's package.json

// 	utils.find(name, alt).then(function (fp) {
// 		t.ok(fp !== undefined, 'finds a package.json file')
// 		t.equal(fp, pkg, 'finds the right one!')
// 	})

// 	utils.find(name, fixtures).then(function (fp) {
// 		t.equal(fp, ours, 'traverse upwards if not found')
// 		t.end()
// 	})
// })

// test('plugins.findPkg', function (t) {
// 	plugins.findPkg(alt).then(function (fp) {
// 		t.equal(fp, pkg, 'found a package.json file!')
// 		t.end()
// 	})
// })

// test('plugins.readPackages', function * (t) {
// 	const want = JSON.parse(fs.readFileSync(pkg, 'utf8'));
// 	const data = yield plugins.getDependencies(pkg);

// 	t.ok(data !== undefined, 'found package.json file contents');
// 	t.deepEqual(data.dependencies, want.dependencies, 'correctly read the contents');
// 	t.end();
// });

// test('plugins.parse (simple)', function (t) {
// 	var expect = ['fly-fake-plugin']

// 	plugins.readPackages(pkg).then(function (data) {
// 		t.deepEqual(plugins.parse(data), expect, 'returns an array of fly-* plugin names')
// 		t.end()
// 	})
// })

// test('plugins.parse (multiple levels)', function (t) {
// 	var tests = [{
// 		msg: 'reads all levels of  fly-* deps',
// 		expected: ['fly-a', 'fly-b', 'fly-c'],
// 		dependencies: {
// 			'fly-a': '*',
// 			'dep-a': '*'
// 		},
// 		devDependencies: {
// 			'dep-a': '*',
// 			'fly-b': '*'
// 		},
// 		peerDependencies: {
// 			'dep-x': '*',
// 			'fly-c': '*'
// 		}
// 	}, {
// 		msg: 'skips blacklisted deps',
// 		expected: ['fly-a', 'fly-b', 'fly-z'],
// 		blacklist: ['fly-c', 'fly-d'],
// 		dependencies: {
// 			'fly-a': '*',
// 			'fly-b': '*',
// 			'fly-c': '*',
// 			'fly-d': '*'
// 		},
// 		devDependencies: {
// 			'fly-z': '*',
// 			'dep-b': '*'
// 		}
// 	}, {
// 		msg: 'return [] for no fly-* pkg',
// 		expected: [],
// 		dependencies: {
// 			'dep-a': '*',
// 			'dep-b': '*',
// 			'dep-c': '*',
// 			'dep-d': '*'
// 		},
// 		devDependencies: {
// 			'dep-e': '*',
// 			'dep-f': '*'
// 		}
// 	}, {
// 		msg: 'return [] for no dep pkg',
// 		expected: [],
// 		dependencies: {},
// 		devDependencies: {}
// 	}]

// 	tests.forEach(function (data) {
// 		var blk = data.hasOwnProperty('blacklist') ? data.blacklist : []
// 		t.deepEqual(plugins.parse(data, blk), data.expected, data.msg)
// 	})

// 	t.end()
// })

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
