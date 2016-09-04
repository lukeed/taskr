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

	try {
		// attempt to spawn all
		yield Promise.all(tasks.map(t => this.start(t, opts)));
		// @todo: emit event
		console.log('parallel chain complete!');
	} catch (e) {
		console.info('--- parallel knew there was an error, do nothing');
	}
});
