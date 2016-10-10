/*eslint-disable */
'use strict';

const key = require('../fn').keyUnique;
const Promise = require('bluebird');
const co = Promise.coroutine;

module.exports = co(function * (name, opts, func) {
	// check if plugin name exists
	const nxt = key(name, this.plugins);

	// if it did, emit event warning
	if (nxt !== name) {
		this.emit('plugin_rename', {o: name, n: nxt});
	}

	// assign `opts` against defaults
	opts = Object.assign({every: 1, files: 1}, opts);

	// update callbck reference
	func = co(func.bind(this));

	// safely attach to instance
	this[nxt] = conf => {
		conf = conf || {};

		// grab alias to chosen source type
		const arr = this._[opts.files ? 'files' : 'globs'];

		// loop thru EACH if `every`, else send full source array
		opts.every ? Promise.all(arr.map(a => func(a, conf))) : func(arr, conf);

		// send back instance; allow chain
		return this;
	};
});
