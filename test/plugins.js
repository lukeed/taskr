'use strict'

// var co = require('co')
var fs = require('fs')
var path = require('path')
var test = require('tape').test
var plugins = require('../lib/plugins')
var utils = require('../lib/utils')

var fixtures = path.join(process.cwd(), 'test', 'fixtures')
var alt = path.join(fixtures, 'alt')
var pkg = path.join(alt, 'package.json')

test('fly plugins ✈', function (t) {
	t.ok(plugins !== undefined, 'plugins object is real')

	Array.prototype.concat('load', 'parse', 'readPackages').forEach(function (cmd) {
		t.ok(plugins[cmd] !== undefined, cmd + ' is defined')
	})

	t.end()
})

test('utils.find (package.json)', function (t) {
	var name = 'package.json'
	var ours = path.resolve(fixtures, '../..', name) // fly's package.json

	utils.find(name, alt).then(function (fp) {
		t.ok(fp !== undefined, 'finds a package.json file')
		t.equal(fp, pkg, 'finds the right one!')
	})

	utils.find(name, fixtures).then(function (fp) {
		t.equal(fp, ours, 'traverse upwards if not found')
		t.end()
	})
})

test('plugins.findPkg', function (t) {
	plugins.findPkg(alt).then(function (fp) {
		t.equal(fp, pkg, 'found a package.json file!')
		t.end()
	})
})

test('plugins.readPackages', function (t) {
	var expect = JSON.parse(fs.readFileSync(pkg, 'utf8'))

	plugins.readPackages(pkg).then(function (contents) {
		t.ok(contents !== undefined, 'found package.json file contents')
		t.deepEqual(contents.dependencies, expect.dependencies, 'correctly read the contents')
		t.end()
	})
})

test('plugins.parse (simple)', function (t) {
	var expect = ['fly-fake-plugin']

	plugins.readPackages(pkg).then(function (data) {
		t.deepEqual(plugins.parse(data), expect, 'returns an array of fly-* plugin names')
		t.end()
	})
})

test('plugins.parse (multiple levels)', function (t) {
	var tests = [{
		msg: 'reads all levels of  fly-* deps',
		expected: ['fly-a', 'fly-b', 'fly-c'],
		dependencies: {
			'fly-a': '*',
			'dep-a': '*'
		},
		devDependencies: {
			'dep-a': '*',
			'fly-b': '*'
		},
		peerDependencies: {
			'dep-x': '*',
			'fly-c': '*'
		}
	}, {
		msg: 'skips blacklisted deps',
		expected: ['fly-a', 'fly-b', 'fly-z'],
		blacklist: ['fly-c', 'fly-d'],
		dependencies: {
			'fly-a': '*',
			'fly-b': '*',
			'fly-c': '*',
			'fly-d': '*'
		},
		devDependencies: {
			'fly-z': '*',
			'dep-b': '*'
		}
	}, {
		msg: 'return [] for no fly-* pkg',
		expected: [],
		dependencies: {
			'dep-a': '*',
			'dep-b': '*',
			'dep-c': '*',
			'dep-d': '*'
		},
		devDependencies: {
			'dep-e': '*',
			'dep-f': '*'
		}
	}, {
		msg: 'return [] for no dep pkg',
		expected: [],
		dependencies: {},
		devDependencies: {}
	}]

	tests.forEach(function (data) {
		var blk = data.hasOwnProperty('blacklist') ? data.blacklist : []
		t.deepEqual(plugins.parse(data, blk), data.expected, data.msg)
	})

	t.end()
})
