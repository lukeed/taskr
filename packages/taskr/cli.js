#!/usr/bin/env node
'use strict';

const Promise = require('bluebird');
const reporter = require('./lib/reporter');
const utils = require('./lib/utils');
const cli = require('./lib/cli');
const pkg = require('./package');
const co = Promise.coroutine;

co(function* () {
	// get command options
	const o = cli.options();
	const t = o.tasks.length ? o.tasks : ['default'];

	if (o.help) {
		return cli.help();
	}

	if (o.version) {
		return cli.version(pkg);
	}

	const taskr = yield cli.spawn(o.cwd);
	reporter.call(taskr);

	if (!taskr.file) {
		return taskr.emit('taskfile_not_found');
	}

	if (o.list) {
		return cli.list(taskr.tasks, o.list === 'bare');
	}

	// announce start
	taskr.emit('task_run', taskr.file);
	// run `tasks` in `mode`
	taskr[o.mode](t);

})().catch(err => {
	if (err.type === 'cli') {
		utils.error(`CLI Error! ${err.message}`);
	} else {
		console.error(utils.trace(err.stack));
	}
});
