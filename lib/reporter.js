var fmt = require('./fmt')
var log = require('./utils').log
var trace = require('./utils').trace

var evts = {
	add: 'added',
	change: 'changed',
	unlink: 'removed'
}

module.exports = function () {
	return this
		.on('fly_run', function (obj) {
			log('Flying with ' + fmt.path + '...', obj.path)
		})

		.on('flyfile_not_found', function () {
			process.exitCode = 1
			log('Flyfile not found')
		})

		.on('fly_watch', function () {
			log(fmt.warn.toString(), 'Watching files...')
		})

		.on('fly_watch_event', function (obj) {
			log('File ' + (evts[obj.type] || obj.type.trim()) + ': ' + fmt.warn, obj.file)
		})

		.on('plugin_load', function (obj) {
			log('Loading plugin ' + fmt.title, obj.plugin)
		})

		.on('plugin_error', function (obj) {
			process.exitCode = 1
			log(
				fmt.error + ' failed due to ' + fmt.error,
				obj.plugin, obj.error
			)
		})

		.on('task_error', function (obj) {
			process.exitCode = 1
			trace(obj.error)
			log(
				fmt.error + ' failed due to ' + fmt.error,
				obj.task, obj.error
			)
		})

		.on('task_start', function (obj) {
			log('Starting ' + fmt.start, obj.task)
		})

		.on('task_complete', function (obj) {
			var time = formatTime(obj.duration)
			log(
				'Finished ' + fmt.complete + ' in ' + fmt.secs,
				obj.task, time.duration, time.scale
			)
		})

		.on('task_not_found', function (obj) {
			process.exitCode = 1
			log(fmt.error + ' not found in Flyfile.', obj.task)
		})
}

/**
 * Format the task's time duration
 * @param  {Integer}  time    The task's duration, in ms
 * @param  {String}   unit    The unit of time measurement
 * @return {Object}
 */
function formatTime(time, unit) {
	unit = unit || 'ms'

	if (time >= 1000) {
		time = Math.round((time / 1000) * 10) / 10
		unit = 's'
	}

	return {
		duration: time,
		scale: unit
	}
}
