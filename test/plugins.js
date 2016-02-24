'use strict';

var co = require('co');
var fs = require('fs');
var path = require('path');
var test = require('tape').test;
var plugins = require('../lib/plugins');

var fixtures = path.join(process.cwd(), 'test', 'fixtures');

test('utils.filter ({ pkg, regex, blacklist = []}) ✈', function (t) {
	// const pkgs = [
	// 	{
	// 		msg: "reads fly-* deps",
	// 		expected: ["fly-a", "fly-b", "fly-c"],
	// 		dependencies: {
	// 			"fly-a": "0.0.0",
	// 			"a": "0.0.0"
	// 		},
	// 		devDependencies: {
	// 			"a": "0.0.0",
	// 			"fly-b": "0.0.0"
	// 		},
	// 		peerDependencies: {
	// 			"x": "0.0.0",
	// 			"fly-c": "0.0.0"
	// 		}
	// 	},
	// 	{
	// 		msg: "skips blacklisted deps",
	// 		expected: ["fly-a", "fly-b", "fly-z"],
	// 		blacklist: ["fly-c", "fly-d"],
	// 		dependencies: {
	// 			"fly-a": "0.0.0",
	// 			"fly-b": "0.0.0",
	// 			"fly-c": "0.0.0",
	// 			"fly-d": "0.0.0"
	// 		},
	// 		devDependencies: {
	// 			"fly-z": "0.0.0",
	// 			"b": "0.0.0"
	// 		}
	// 	},
	// 	{
	// 		msg: "return [] for no fly-* pkg",
	// 		expected: [],
	// 		dependencies: {
	// 			"a": "0.0.0",
	// 			"b": "0.0.0",
	// 			"c": "0.0.0",
	// 			"d": "0.0.0"
	// 		},
	// 		devDependencies: {
	// 			"e": "0.0.0",
	// 			"f": "0.0.0"
	// 		}
	// 	},
	// 	{
	// 		msg: "return [] for no dep pkg",
	// 		expected: [],
	// 		dependencies: {},
	// 		devDependencies: {}
	// 	},
	// 	{
	// 		msg: "skip fly-utils by default",
	// 		expected: ["fly-utl", "fly-til", "fly-uti"],
	// 		dependencies: {
	// 			"fly-utl": "0.0.0",
	// 			"fly-til": "0.0.0",
	// 			"fly-uti": "0.0.0",
	// 			"fly-utils": "0.0.0"
	// 		},
	// 		devDependencies: {}
	// 	},
	// ];

	var alt = path.join(fixtures, 'alt');
	var data = fs.readFileSync(path.join(alt, 'package.json'), 'utf8');
	var expected = JSON.parse(data).dependencies;
	var results = plugins.find(alt);

	// t.equal(plugins.find(undefined), undefined, 'return undefined pkg');
	t.true(plugins.find(undefined) !== results, 'traverse upwards');
	t.true(results !== undefined, 'successfully find a pkg file');
	t.deepEqual(results.dependencies, expected, 'successfully find a pkg file');

	t.deepEqual(plugins.parse(undefined), [], 'return empty list for undefined pkg');
	t.deepEqual(plugins.parse({}), [], 'return empty list for undefined pkg');
	t.true(plugins.parse(results).length > 0, 'successfully return a list of fly plugins');

	// pkgs.forEach(function (pkg) {
	// 	t.deepEqual(utils.filter(pkg, function (_) {return _}, pkg.blacklist), pkg.expected, pkg.msg)
	// });

	t.end();
})
