'use strict';

const fmt = require('../fmt');
const rgx = /@desc(.*)/;

/**
 * List available tasks within a Fly instance
 * @param {Object}  tasks  The available tasks
 * @param {Boolean} bare   Should output be unstyled?
 */
module.exports = function (tasks, bare) {
	bare = bare || false;
	tasks = tasks || {};

	if (!bare) {
		console.log('\n' + fmt.text.dim('Available tasks'));
	}

	// parse tasks' descriptions, if any
	for (let k in tasks) {
		const arr = rgx.exec(tasks[k].toString());
		const txt = arr ? arr.pop().replace(/\*\//, '') : '';
		console.log(`\t${fmt.title(k)}\t${txt}`);
		// console.log((bare ? '%s' : ' ') + fmt.title + '\t' + txt, k);
	}

	if (!bare) {
		console.log();
	}
};
