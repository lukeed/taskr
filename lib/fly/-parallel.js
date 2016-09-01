'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
const READY = '_ready';

module.exports = co(function * (tasks) {
	// ensure is intialized first
	if (!this[READY]) {
		yield this.init();
	}

	// wrap each task as new coroutine
	yield Promise.all(tasks.map(t => co(this.start).apply(this, [t])));
	// @todo: emit event
	console.log('parallel chain complete!');
});
