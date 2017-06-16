'use strict';

const toArr = val => Array.isArray(val) ? val : (val == null) ? [] : [val];

const types = {
	add: 'added',
	change: 'changed',
	unlink: 'removed'
};

module.exports = function (Taskr, utils) {
	Taskr.plugin('watch', { every:false, files:false }, function * (_, globs, names, opts) {
		globs = toArr(globs);
		names = toArr(names);
		opts = opts || {};

		// announce start
		Taskr.emit('task_watch');

		return require('chokidar')
			.watch(globs, {ignoreInitial: 1})
			.on('error', utils.error)
			.on('all', (event, filepath) => {
				// store previous globs (`prevs`)
				// used within `target` for `trims`
				this._.prevs = globs;
				// also update ALL chained `names` for their own `target`
				names.forEach(k => {
					Taskr.tasks[k].data.prevs = globs;
				});
				// broadcast
				Taskr.emit('task_watch_event', { action:types[event], file:filepath });
				// pass single file to task params
				opts.src = filepath;
				// re-run task chain
				return Taskr.serial(names, opts);
			});
	});
}
