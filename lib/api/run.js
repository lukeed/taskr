'use strict';

const wrap = require('../plugins').wrapper;
const co = require('bluebird').coroutine;

module.exports = co(function * (opts, func) {
	// wrap / determine func behavior
	func = wrap.apply(this, [opts, func]);
	// now run it
	return yield func();
});
