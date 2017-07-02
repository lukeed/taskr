/**
 * For Uglify v3
 * --- currently sourceMaps not supported:
 * Error: `sourceMap` is not a supported option
 */

'use strict';

const extn = require('path').extname;
const minify = require('uglify-js').minify;

const errMsg = obj => `${obj.message} in \`${obj.filename}\` on line ${obj.line}`;

module.exports = function (task) {
	task.plugin('uglify', {}, function * (file, opts) {
		const ext = extn(file.base);
		const rgx = new RegExp(`\\${ext}$`, 'i');
		const filename = file.base.replace(rgx, '.js');

		let isInline = false;
		let isMapping = false;

		opts = Object.assign({ sourceMap:isMapping }, opts);

		if (opts.sourceMap === 'inline') {
			isInline = true;
			opts.sourceMap = { url:'inline' };
		} else if (opts.sourceMap !== isMapping) {
			isMapping = true;
			const url = `${filename}.map`;
			opts.sourceMap = Object.assign({ filename, url }, opts);
			// check again... just in case
			if (opts.sourceMap.url === 'inline') {
				isInline = true;
			}
		}

		const res = minify({ [file.base]:file.data.toString() }, opts);

		console.log('THIS IS RES', res);

		// check for errors
		if (res.error) {
			return task.emit('plugin_error', {
				plugin: '@taskr/uglify',
				error: errMsg(res.error)
			});
		}

		file.base = filename; // ensure always `.js`

		file.data = new Buffer(res.code); // write output

		// handle external sourcemaps (only)
		if (res.map !== void 0 && isMapping && !isInline) {
			// Uglify 3.0 will auto-write a comment link
			console.log('HAS MAP', res.map);
		}
	});
};
