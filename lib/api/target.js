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
	console.log(trims);

	console.log(`target received:`, dirs, opts);

	yield Promise.all(dirs.map(d => {
		return files.map(obj => {
			// replace `source` segments with `target` dir
			for (const t of trims) {
				obj.dir = obj.dir.replace(t, d);
			}
			// create final filepath
			const str = format(obj);
			console.log('filepath: ', str);
			// write it!
			return this.$.write(str, obj.data);
		});
	}));
});
