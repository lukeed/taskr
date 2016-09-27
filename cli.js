#!/usr/bin/env node
'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;

const cli = require('./lib/cli');
const utils = require('./lib/utils');
const reporter = require('./lib/reporter');
const notifier = require('update-notifier');
const pkg = require('./package');
const errorTypes = require('./lib/utils/errors').errorTypes;

co(function * () {
	// check if using latest
	notifier({pkg: pkg}).notify();

	// get command options
	const o = cli.options();
	const t = o._.length ? o._ : ['default'];

	if (o.help) {
		return cli.help();
	}

	if (o.version) {
		return cli.version(pkg);
	}

	const fly = yield cli.spawn(o.pwd);
	reporter.call(fly);

	if (!fly.file) {
		return fly.emit('flyfile_not_found');
	}

	if (o.list) {
		return cli.list(fly.tasks, o.list === 'bare');
	}

	fly.init();

	// announce start && run `tasks` in `mode`
	fly.emit('fly_run', {path: fly.file})[o.mode](t);
})().catch(e => {
	if (e.type === errorTypes.UnknownOption) {
		utils.error(`Unknown option ${e.key}. Run fly -h to see available options.`);
	} else if (e.type === errorTypes.InvalidKey) {
		utils.error('Invalid options!');
		utils.log('Note, options should start with -, and can not contain any special symbols, like {}*#?');
	} else {
		utils.trace(e);
	}
});

// export Fly
// module.exports = require('./fly');
