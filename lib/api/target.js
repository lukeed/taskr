'use strict';

const format = require('path').format;
const Promise = require('bluebird');
const flatten = require('flatten');
const arrify = require('arrify');
const co = Promise.coroutine;
const sep = /[\\|\/]/g;

module.exports = co(function * (dirs, opts) {
	dirs = flatten(arrify(dirs));
	opts = opts || {};

	const files = this._.files;
	// using `watcher`? original globs passed as `prevs`
	// non-wildcard glob segments that should be trimmed!
	const trims = (this._.prevs || this._.globs).map(g => {
		let seg = g.split(sep);
		const idx = seg.findIndex(str => str.includes('*'));
		(idx === -1) ? seg.pop() : (seg = seg.slice(0, idx));
		return seg.join('/');
	});

	return yield Promise.all(
		flatten(
			files.map(obj => {
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
			})
		)
	);
});
