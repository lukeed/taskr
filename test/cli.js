'use strict';

var co = require('co');
var test = require('tape').test;
var tlog = require('./helpers/testLog');
var Fly = require('../lib/fly');
var cli = require('../lib/cli');
var pkg = require('../package');
var join = require('path').join;

var fixtures = join(process.cwd(), 'test', 'fixtures');
var flypath = join(fixtures, 'flyfile.js');

test('✈  cli', function (t) {
	t.ok(cli !== undefined, 'is defined');
	['help', 'list', 'spawn', 'version'].forEach(function (command) {
		t.equal(command in cli, true, command + ' is defined');
	});
	t.end();
});

test('✈  cli.version', function (t) {
	tlog.call(t, function () {
		cli.version(pkg);
	}, function (actual) {
		t.equal(actual, pkg.name + ', ' + pkg.version, 'log fly version');
	});
	t.end();
});

test('✈  cli.help', function (t) {
	tlog.call(t, cli.help, function (actual) {
		t.equal(actual, '\n\x1b[2m\x1b[1mUsage\x1b[0m\n  fly [options] [tasks]\n\n\x1b[2m\x1b[1mOptions\x1b[0m\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[1mh \x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[1mhelp\x1b[0m     Display this help.\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[1mf \x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[1mfile\x1b[0m     Use an alternate Flyfile.\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[1ml \x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[1mlist\x1b[0m     Display available tasks.\n  \x1b[2m\x1b[1m-\x1b[0m\x1b[1mv \x1b[0m\x1b[2m\x1b[1m --\x1b[0m\x1b[1mversion\x1b[0m  Display version.\n  ',
			'show fly help');
	});
	t.end();
});

test('✈  cli.list', function (t) {
	var message = 'list tasks in a fly instance';
	[true, false].forEach(function (bare) {
		tlog.call(t, function () {
			cli.list(require(flypath), {bare: bare});
		}, function (actual, key) {
			if (!bare && actual === '\n\x1b[2m\x1b[1mAvailable tasks\x1b[0m') {
				return true;
			}
			if (key === 'a' || key === 'b') {
				return true;
			} else if (key === 'c') {
				t.ok(true, 'message / bare ' + bare);
			} else {
				t.ok(false, message);
			}
		});
	});
	t.end();
});

test('✈  cli.spawn', function (t) {
	t.plan(6);

	Array.prototype.concat([
		join('test', 'fixtures', 'alt'),
		join('test', 'fixtures', 'alt', 'flyfile.js')
	]).map(function (fpath) {
		return ({
			flypath: fpath,
			spawn: co.wrap(cli.spawn)(fpath, function (_) {
				return _;
			})
		});
	}).forEach(function (_) {
		_.spawn.then(function (fly) {
			t.ok(fly instanceof Fly && fly.host && Array.isArray(fly.plugins),
				'spawn a fly instance using ' + _.flypath);

			t.ok(fly.plugins.length === 1 && fly.fakePlugin,
				'load plugins from package.json');

			fly.filter = function (f) {
				t.equal('ylf', f.cb('fly'),
					'add plugin function to fly instance and get expected result');
			};

			fly.fakePlugin();
		}).catch(function (e) {
			t.ok(false, e);
		});
	});
});
