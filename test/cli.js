'use strict'

var co = require('co')
var test = require('tape').test
var tlog = require('./helpers/testLog')
var Fly = require('../lib/fly')
var cli = require('../lib/cli')
var pkg = require('../package')
var join = require('path').join
var arrify = require('arrify')

var fixtures = join(process.cwd(), 'test', 'fixtures')
var flypath = join(fixtures, 'flyfile.js')

test('✈  cli', function (t) {
	t.ok(cli !== undefined, 'is defined')
	arrify('help', 'list', 'spawn', 'version').forEach(function (command) {
		t.equal(command in cli, true, command + ' is defined')
	})
	t.end()
})

function log(func) {
	const _log = console.log;
	console.log = s => s; // hijack
	const out = func(); // save output
	console.log = _log; // un-hijack
	return out; // send output
}

test('✈  cli.version', function (t) {
	tlog.call(t, function () {
		cli.version(pkg)
	}, function (actual) {
		t.equal(actual, pkg.name + ', ' + pkg.version, 'log fly version')
	})
	t.end()
})

test('✈  cli.help', t => {
	tlog.call(t, cli.help, actual => {
		t.true(/Options/gm.test(actual), 'show fly help');
	});
	t.end();
});

test('✈  cli.list', function (t) {
	var message = 'list tasks in a fly instance'
	arrify(true, false).forEach(function (bare) {
		tlog.call(t, function () {
			cli.list(require(flypath), {bare: bare})
		}, function (actual, key) {
			if (!bare && actual === '\n\x1b[2m\x1b[1mAvailable tasks\x1b[0m') {
				return true
			}
			if (key === 'a' || key === 'b') {
				return true
			} else if (key === 'c') {
				t.ok(true, 'message / bare ' + bare)
			} else {
				t.ok(false, message)
			}
		})
	})
	t.end()
})

test('✈  cli.spawn', function (t) {
	t.plan(6)

	var alt = join('test', 'fixtures', 'alt')
	var file = join('test', 'fixtures', 'alt', 'flyfile.js')

	Array.prototype.concat(alt, file).map(function (fpath) {
		return ({
			flypath: fpath,
			spawn: co.wrap(cli.spawn)(fpath)
		})
	}).forEach(function (_) {
		_.spawn.then(function (fly) {
			t.ok(fly instanceof Fly && fly.host && Array.isArray(fly.plugins),
				'spawn a fly instance using ' + _.flypath)

			t.ok(fly.plugins.length === 1 && fly.fakePlugin,
				'load plugins from package.json')

			fly.filter = function (f) {
				t.equal('ylf', f.cb('fly'),
					'add plugin function to fly instance and get expected result')
			}

			fly.fakePlugin()
		}).catch(function (e) {
			t.ok(false, e)
		})
	})
})
