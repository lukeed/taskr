'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;

module.exports = co(function * (tasks, opts) {
	const self = this;
	opts = opts || {};

	try {
		return yield Promise.reduce(tasks, co(function * (val, str) {
			val && Object.assign(opts, {val});
			return yield self.start(str, opts);
		}), opts.val || null);
	} catch (e) {
		self.emit('serial_error', e);
	}
});
