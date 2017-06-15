'use strict';

const path = require('path');
const normalize = path.normalize;
const sep = path.sep;

module.exports = function (task) {
	task.plugin('flatten', { every:false }, function * (files, opts) {
		if (!files.length) {
			return task.emit('plugin_warning', {
				plugin: '@taskr/flatten',
				warning: 'No source files to flatten!'
			});
		}

		const levels = opts.levels || 0;

		// find shortest `dir` path; glob originated here
		const globBaseDir = files.map(o => o.dir).sort()[0];

		for (let file of files) {
			file.dir = trimmer(globBaseDir, file.dir, levels);
		}
	});
};

function trimmer(baseDir, fileDir, levels) {
	if (levels === 0) {
		return baseDir;
	}

	let dirs = fileDir.replace(baseDir, '');
	const arr = dirs.split(sep);
	const len = arr.length;

	if (levels < len) {
		dirs = arr.splice(len - levels).join(sep);
	}

	return normalize(baseDir + sep + dirs);
}
