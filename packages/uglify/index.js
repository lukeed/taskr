'use strict';

const extname = require('path').extname;
const minify = require('uglify-js').minify;

module.exports = function (task) {
	task.plugin('uglify', {}, function * (file, opts) {
		opts = Object.assign({}, opts, { fromString:true });

		const ext = extname(file.base);
		const rgx = new RegExp(`\\${ext}$`, 'i');
		// replace extension with `.js`
		file.base = file.base.replace(rgx, '.js');

		const out = minify(file.data.toString(), opts);

		// write output
		file.data = new Buffer(out.code);
	});
};
