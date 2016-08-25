const $ = require('./utils');
const fmt = require('./fmt');

const log = $.log;
const trace = $.trace;

const evts = {
	add: 'added',
	change: 'changed',
	unlink: 'removed'
};

module.exports = function () {
	return this
		.on('fly_run', obj => {
			log(`Flying with ${fmt.path(obj.path)}...`);
		})

		.on('flyfile_not_found', () => {
			process.exitCode = 1;
			log('Flyfile not found!');
		})

		.on('fly_watch', () => {
			log(fmt.warn('Watching files...'));
		})

		.on('fly_watch_event', obj => {
			log(`File ${evts[obj.type] || obj.type.trim()}: ${fmt.warn(obj.file)}`);
		})

		.on('plugin_load', obj => {
			log(`Loading plugin ${fmt.title(obj.plugin)}`);
		})

		.on('plugin_error', obj => {
			process.exitCode = 1;
			log(`${fmt.error(obj.plugin)} failed due to ${fmt.error(obj.error)}`);
		})

		.on('tasks_force_object', obj => {
			process.exitCode = 1;
			error('Invalid Tasks!');
			log('Custom `tasks` must be an `object`.');
		})

		.on('task_error', obj => {
			process.exitCode = 1;
			trace(obj.error);
			log(`${fmt.error(obj.task)} failed due to ${fmt.error(obj.error)}`);
		})

		.on('task_start', obj => {
			log(`Starting ${fmt.title(obj.task)}`);
		})

		.on('task_complete', obj => {
			const t = formatTime(obj.duration);
			log(`Finished ${fmt.complete(obj.task)} in ${fmt.time(t)}`);
		})

		.on('task_not_found', obj => {
			process.exitCode = 1;
			log(`${fmt.error(obj.task)} not found in Flyfile.`);
		});
};

/**
 * Format the task's time duration
 * @param  {Number} time  The task's duration, in ms
 * @param  {String} unit  The unit of time measurement
 * @return {String}
 */
function formatTime(time, unit) {
	unit = unit || 'ms';

	if (time >= 1000) {
		time = Math.round((time / 1000) * 10) / 10;
		unit = 's';
	}

	return `${time}${unit}`;
}
