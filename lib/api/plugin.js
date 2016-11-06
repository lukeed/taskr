'use strict';

const wrap = require('../plugins').wrapper;
const uniq = require('../fn').valUniq;
const Promise = require('bluebird');
const co = Promise.coroutine;

module.exports = co(function * (name, opts, func) {
	this.plugs = this.plugs || [];

	// check if plugin name exists
	const nxt = uniq(name, this.plugs);

	// if it did, emit event warning
	if (nxt !== name) {
		this.emit('plugin_rename', {o: name, n: nxt});
	}

	// save / reserve plugin name
	this.plugs = this.plugs.concat(nxt);

	// safely attach to instance
	this[nxt] = wrap.apply(this, [opts, func]);
});
