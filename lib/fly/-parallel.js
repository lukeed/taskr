'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
const READY = '_ready';

const defs = {
	src: null,
	val: null
};

module.exports = co(function * (tasks, opts) {
	// ensure is intialized first
	if (!this[READY]) {
		yield this.init();
	}

	// ensure base task options. (all receive the same)
	opts = Object.assign({}, defs, opts);

	yield Promise.all(tasks.map(t => co(this.start).apply(this, [t])));
	// @todo: emit event
	console.log('parallel chain complete!');
});
