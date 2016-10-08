/*eslint-disable */
'use strict';

const co = require('bluebird').coroutine;
const key = require('../fn').keyUnique;

const defs = {
	content: 1,
	yields: 1,
	every: 1,
	file: 1
};

// file ? 'files' : 'globs'
// content ? $.read each
//
// await + every = Promise.all
// await + !every = Promise.one
//

module.exports = co(function * (name, opts, func) {
	// check if plugin name exists
	const nxt = key(name, this.plugins);

	// if it did, emit event warning
	if (nxt !== name) {
		this.emit('plugin_rename', {o: name, n: nxt});
	}

	// safely attach to instance
	this[nxt] = () => {
		// assign `opts` against defaults
		opts = Object.assign({}, defs, opts);
		console.log('these were my plugin options', opts);
		// throw/exit if trying to read every glob
		if (opts.content && !opts.file) {
			return this.emit('plugin_illegal', name);
		}
		// grab alias to chosen source type
		const s = opts.file ? 'files' : 'globs';
		return co(func.bind(this, s, {a: 'hi'}))();
	}
	/*
		// if in need of content
		// if (opts.content) {
			// this._[s] = yield this._[s].map();
		// }
		console.log('PLUGIN', this._.files);
		for (const x of this._[s]) {
			func.apply(this);
		}
		// 4. wrap & bind `func` based on `opts` combo
		// 5. return this + value
	*/
});

/* demo plugin */
// module.exports = function () {
// 	this.plugin('demo', {
// 		filter: 1,
// 		await: 1
// 		glob: 1
// 	}, function * (d, o) {

// 	});
// }
