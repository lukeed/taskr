'use strict';

const runCLI = require('jest-cli').runCLI;

module.exports = function (task) {
	const rootDir = task.root;
	task.plugin('jest', { every:false }, function * (_, opts) {
		const config = Object.assign({ rootDir }, opts);
		runCLI({ config }, [rootDir]);
	});
};
