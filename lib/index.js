'use strict';

var co = require('co');
var cli = require('./cli');
var reporter = require('./reporter');
var error = require('./utils').error;
var trace = require('./utils').trace;
var notifier = require('update-notifier');
var pkg = require('../package');

co(function * () {
	// check if using latest
	notifier({pkg: pkg}).notify();

	// get command options
	var opts = cli.options();

	if (opts.help) {
		cli.help();
	} else if (opts.version) {
		cli.version(pkg);
	} else {
		var fly = yield cli.spawn(opts.file);

		if (opts.list) {
			cli.list(fly.host, {bare: opts.list === 'bare'});
		} else {
			return reporter.call(fly)
				.emit('fly_run', {path: fly.file})
				.start(opts.tasks);
		}
	}
}).catch((e) => {
	if (e.code === 'ENOENT') {
		error('No Flyfile? See the Quickstart guide → git.io/fly-quick');
	} else if (e.code === 'UNKNOWN_OPTION') {
		error('Unknown Flag: -' + e.key + '. Run fly -h to see available options.');
	} else {
		trace(e);
	}
});
