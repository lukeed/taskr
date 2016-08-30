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

	// @todo try/catch
	// @todo throw on chain error
	return yield Promise.reduce(tasks, co(function * (val, str) {
		val && assign(opts, {val: val});
		return yield self.start(str, opts);
	}), opts.val);
});
