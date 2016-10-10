'use strict';

const print = require('./fn').formatTime;
const fmt = require('./fmt');

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
			$.log(`File ${obj.action}: ${fmt.warn(obj.file)}`);
		})

		.on('globs_no_match', (globs, opts) => {
			let str = `${fmt.warn('Warning:')} Source did not match any files!`;
			str += `\n\t  Patterns:   ${JSON.stringify(globs)}`;
			opts && (str += `\n\t  Options:    ${JSON.stringify(opts)}`);
			$.log(str);
		})

		.on('plugin_load', obj => {
			$.log(`Loading plugin ${fmt.title(obj.plugin)}`);
		})

		.on('plugin_load_error', str => {
			$.log(`Problem loading plugin: ${fmt.title(str)}`);
		})

		.on('plugin_rename', obj => {
			$.log(`${fmt.title(obj.o)} was renamed to ${fmt.title(obj.n)} because its name was taken`);
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
			const t = print(obj.time);
			$.log(`Finished ${fmt.complete(obj.task)} in ${fmt.time(t)}`);
		})

		.on('task_not_found', obj => {
			process.exitCode = 1;
			$.log(`${fmt.error(obj.task)} not found in Flyfile.`);
		})

		.on('serial_error', e => {
			process.exitCode = 1;
			console.log('this was serials error', e);
			$.error(`Task sequence was aborted!`);
		});
};
