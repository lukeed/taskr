/*eslint-disable */
'use strict';

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

	// assign `opts` against defaults
	opts = Object.assign({every: 1, files: 1}, opts);

	const self = this;
	// update callbck reference
	func = co(func.bind(self));

	// safely attach to instance
	self[nxt] = co(function * () {
		let args = [].slice.call(arguments);
		(!args.length) && (args = {});

		// grab alias to chosen source type
		const arr = self._[opts.files ? 'files' : 'globs'];

		// wrapper; pass all arguments to plugin func
		const run = s => func.apply(self, [s].concat(args));

		// loop thru EACH if `every`, else send full source array
		yield (opts.every ? Promise.all(arr.map(run)) : run(arr));

		// send back instance; allow chain
		return self;
	});
});
