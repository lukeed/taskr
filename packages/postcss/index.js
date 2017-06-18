'use strict';

const extn = require('path').extname;
const postcss = require('postcss');

module.exports = function (task) {
	task.plugin('postcss', {}, function * (file, opts) {
		opts = Object.assign({ plugins:[], options:{} }, opts);

		try {
			const ctx = postcss(opts.plugins);
			const out = yield ctx.process(file.data.toString(), opts);
			file.data = Buffer.from(out.css); // write new data
		} catch (error) {
			task.emit('plugin_error', {
				plugin: '@taskr/postcss',
				error: error.message
			});
		}
	})
}
