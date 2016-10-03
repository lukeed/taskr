'use strict';

const fmt = require('./fmt');
const fmtTime = require('./-funcs').formatTime;

const evts = {
	add: 'added',
	change: 'changed',
	unlink: 'removed'
};

module.exports = function () {
	const $ = this.$;

	return this
		.on('fly_run', file => {
			$.log(`Flying with ${fmt.path(file)}`);
		})

		.on('flyfile_not_found', () => {
			process.exitCode = 1;
			$.log('Flyfile not found!');
		})

		.on('fly_watch', () => {
			$.log(fmt.warn('Watching files...'));
		})

		.on('fly_watch_event', obj => {
			$.log(`File ${evts[obj.type] || obj.type.trim()}: ${fmt.warn(obj.file)}`);
		})

		.on('plugin_load', obj => {
			$.log(`Loading plugin ${fmt.title(obj.plugin)}`);
		})

		.on('plugin_error', obj => {
			process.exitCode = 1;
			$.log(`${fmt.error(obj.plugin)} failed due to ${fmt.error(obj.error)}`);
		})

		.on('tasks_force_object', () => {
			process.exitCode = 1;
			$.error('Invalid Tasks!');
			$.log('Custom `tasks` must be an `object`.');
		})

		.on('task_error', obj => {
			process.exitCode = 1;
			$.trace(obj.error);
			$.log(`${fmt.error(obj.task)} failed due to ${fmt.error(obj.error)}`);
		})

		.on('task_start', obj => {
			$.log(`Starting ${fmt.title(obj.task)}`);
		})

		.on('task_complete', obj => {
			const t = fmtTime(obj.time);
			$.log(`Finished ${fmt.complete(obj.task)} in ${fmt.time(t)}`);
		})

		.on('task_not_found', obj => {
			process.exitCode = 1;
			$.log(`${fmt.error(obj.task)} not found in Flyfile.`);
		});
};
