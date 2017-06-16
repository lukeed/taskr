'use strict';

const p = require('path');
const xo = require('xo');

module.exports = function (task, utils) {
	task.plugin('xo', { every:false, files:false }, function * (globs, opts) {
		opts = Object.assign({ quiet:false }, opts);

		const report = yield xo.lintFiles(globs, opts);

		// truncate project root from paths
		let results = report.results.map(obj => {
			obj.filePath = p.relative(task.root, obj.filePath);
			return obj;
		});

		// hide warnings
		if (opts.quiet) {
			results = xo.getErrorResults(results);
		}

		if (report.errorCount > 0 || report.warningCount > 0) {
			utils.log(xo.getFormatter()(results));
		}

		if (report.errorCount > 0) {
			const num = results.filter(el => el.errorCount > 0).length;
			const end = (num > 1) ? 'files' : 'file';

			task.emit('plugin_error', {
				plugin: '@taskr/xo',
				error: `XO found ${report.errorCount} errors in ${num} ${end}!`
			});
		}
	});
};
