var fmt = require('./fmt');
var log = require('./utils').log;
var trace = require('./utils').trace;

module.exports = function () {
	return this
		.on('fly_run', function (obj) {
			log('Flying with ' + fmt.path + '...', obj.path);
		})

		.on('flyfile_not_found', function (obj) {
			log('No Flyfile Error: ' + fmt.error, obj.error);
		})

		.on('fly_watch', function () {
			log(fmt.warn, 'Watching files...');
		})

		.on('plugin_load', function (obj) {
			log('Loading plugin ' + fmt.title, obj.plugin);
		})

		.on('plugin_error', function (obj) {
			log(
				fmt.error + ' failed due to ' + fmt.error,
				obj.plugin, obj.error
			);
		})

		.on('task_error', function (obj) {
			trace(obj.error);
			log(
				fmt.error + ' failed due to ' + fmt.error,
				obj.task, obj.error
			);
		})

		.on('task_start', function (obj) {
			log('Starting ' + fmt.start, obj.task);
		})

		.on('task_complete', function (obj) {
			var time = timeInfo(obj.duration);
			log(
				'Finished ' + fmt.complete + ' in ' + fmt.secs,
				obj.task, time.duration, time.scale
			);
		})

		.on('task_not_found', function (obj) {
			log(fmt.error + ' not found in Flyfile.', obj.task);
		});
};

/**
	Conditionally format task duration.
	@param  {Number} duration The task's duration, in ms
	@param  {String} scale    The time scale for output
	@return {Object}
*/
function timeInfo(duration, scale) {
	scale = scale || 'ms';

	if (duration >= 1000) {
		duration = Math.round((duration / 1000) * 10) / 10;
		scale = 's';
	}

	return {
		duration: duration,
		scale: scale
	};
}
