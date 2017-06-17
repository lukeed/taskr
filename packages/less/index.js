'use strict';

const less = require('less');

module.exports = function (task) {
	task.plugin('less', {}, function * (file, opts) {
		opts = Object.assign({ paths:[file.dir] }, opts, { filename:file.base });
		const mOpts = opts.sourceMap;
		// render each file's contents
		const str = file.data.toString();
		const out = yield less.render(str, opts);
		// rename extensions
		file.base = file.base.replace(/\.less$/i, '.css');
		// `less` will include inline sourcemap if config'd
		file.data = Buffer.from(out.css);
		// handle external sourcemaps
		if (out.map !== void 0 && mOpts !== void 0 && !mOpts.sourceMapFileInline) {
			const base = mOpts.sourceMapURL || `${file.base}.map`;
			// add map link comment
			if (mOpts === true || mOpts.sourceMapURL === void 0) {
				file.data += Buffer.from(`\n/*# sourceMappingURL=${base}*/`);
			}
			// Create new file
			this._.files.push({ base, dir:file.dir, data:Buffer.from(out.map) });
		}
	});
}
