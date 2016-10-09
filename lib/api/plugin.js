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

	// safely attach to instance
	this[nxt] = conf => {
		conf = conf || {};

		// assign `opts` against defaults
		opts = Object.assign({every: 1, files: 1}, opts);

		// grab alias to chosen source type
		const arr = this._[opts.files ? 'files' : 'globs'];

		// update callbck reference
		func = co(func.bind(this));

		if (opts.every) {
			return Promise.all(arr.map(a => func(a, conf)));
		}

		return func(arr, conf);
	}
});
