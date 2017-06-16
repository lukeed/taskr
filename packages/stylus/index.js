'use strict';

const p = require('path');
const stylus = require('stylus');

module.exports = function (task, utils) {
	task.plugin('stylus', {}, function * (file, opts) {
		opts = opts || {};
		opts.filename = p.format(file); // to fix inline maps
		opts.paths = [file.dir].concat(opts.paths || '.');

		const str = file.data.toString();
		const ctx = stylus(str, opts);

		const mOpts = opts.sourceMap || opts.sourcemap;
		const isInline = !!(mOpts || {}).inline;
		if (mOpts !== void 0) {
			ctx.set('sourcemap', mOpts);
		}

		// render each file's contents (utils.promisfy breaks this??)
		yield new Promise((resolve, reject) => {
			ctx.render((err, css) => {
				if (err) return reject(err);
				// rename extensions
				file.base = file.base.replace(/\.styl$/i, '.css');
				// `stylus` will include inline sourcemap if config'd
				file.data = Buffer.from(css);
				// handle external sourcemaps (only)
				if (ctx.sourcemap !== void 0 && !isInline) {
					const base = `${file.base}.map`;
					const data = JSON.stringify(ctx.sourcemap);
					// Create a new file
					this._.files.push({ base, dir:file.dir, data:Buffer.from(data) });
				}
				resolve(); // exit
			});
		});
	});
}
