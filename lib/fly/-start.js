'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
const READY = '_ready';

const getTime = () => Date.now();

const defs = {
	src: null,
	val: null
};

module.exports = co(function * (name, opts) {
	name = name || 'default';
	opts = Object.assign({}, defs, opts);

	if (!this[READY]) {
		yield this.init();
	}

	let val;
	const task = this.tasks[name];

	if (!task) {
		return this.emit('task_not_found', {task: name});
	}

	try {
		// get start time
		const start = getTime();
		// announce start
		this.emit('task_start', {task: name});
		// attempt execute
		val = yield* task(opts);
		// announce completion
		this.emit('task_complete', {
			task: name,
			time: getTime() - start
		});
	} catch (e) {
		return this.emit('task_error', {
			task: name,
			error: e
		});
	}

	return val;
});
