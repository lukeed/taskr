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

	const obj = {task: name};
	const task = this.tasks[name];

	if (!task) {
		return this.emit('task_not_found', obj);
	}

	let val;
	// get start time
	const start = getTime();
	// announce start
	this.emit('task_start', obj);

	try {
		// attempt to execute
		val = yield* task(opts);
		// announce completion
		obj.time = getTime() - start;
		this.emit('task_complete', obj);
	} catch (e) {
		console.error('INSIDE START ERROR', e);
		obj.error = e;
		this.emit('task_error', obj);
		throw e;
	}

	return val;
});
