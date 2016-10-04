'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
const READY = '_ready';

module.exports = co(function * (tasks, opts) {
	// ensure is intialized first
	if (!this[READY]) {
		yield this.init();
	}

	try {
		// attempt to spawn all
		yield Promise.all(tasks.map(t => this.start(t, opts)));
	} catch (e) {
		console.info('--- parallel knew there was an error, do nothing');
	}
});
