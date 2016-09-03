'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
const assign = Object.assign;

const defs = {
	src: null,
	val: null
};

module.exports = co(function * (tasks, opts) {
	const self = this;
	opts = assign({}, defs, opts);

	try {
		return yield Promise.reduce(tasks, co(function * (val, str) {
			val && assign(opts, {val: val});
			return yield self.start(str, opts);
		}), opts.val);
	} catch (e) {
		console.error("SERIAL ERROR", e);
		// self.emit('serial_error');
	}
});
