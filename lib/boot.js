'use strict';

const Promise = require('bluebird');

const wrap = fn => function () {
	return fn.apply(this, arguments);
};

function deferAll(obj) {
	const o = {};
	for (const k in obj) {
		o[k] = function () {
			return this.then(() => obj[k].apply(o, arguments));
		};
	}
	return o;
}

function boot(obj) {
	// bind each proto method
	for (const k in obj) {
		if (typeof obj[k] === 'function') {
			obj[k] = wrap(obj[k]).bind(obj);
		}
	}
	// add the API
	Object.assign(Promise.prototype, deferAll(obj));
	// send back
	return obj;
}

module.exports = boot;
