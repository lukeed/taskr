'use strict';

const format = require('path').format;
const Promise = require('bluebird');
const flatten = require('flatten');
const arrify = require('arrify');
const co = Promise.coroutine;

module.exports = co(function * (dirs, opts) {
	dirs = flatten(arrify(dirs));
	opts = opts || {};

	const files = this._.files;
	// non-wildcard glob segments that should be trimmed!
	// @todo: no `*` on 'watch' update
	const trims = this._.globs.map(g => {
		const idx = g.indexOf('*') - 1;
		return g.slice(0, idx);
	});

	yield Promise.all(files.map(obj => {
		const data = obj.data; // store it, no longer changes
		delete obj.data; // no need to clone it

		return dirs.map(d => {
			// clone `pathObject`
			const o = Object.assign({}, obj);
			// replace `source` segments with `target` dir
			for (const t of trims) {
				o.dir = obj.dir.replace(t, d);
			}
			// create final filepath & write to it!
			return this.$.write(format(o), data);
		});
	}));
});
