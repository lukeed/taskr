'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;
const $ = require('../fn');
const READY = '_ready';

module.exports = co(function * () {
	// shorthands (no destructuring in node < 6.6)
	const file = this.file;
	const tasks = this.tasks;

	// if custom `tasks`, must be object
	if (!$.isObject(tasks)) {
		return this.emit('tasks_force_object');
	}

	// bind all tasks to current Fly
	for (const k in tasks) {
		this.tasks[k] = tasks[k].bind(this);
	}

	if (!file && $.isEmptyObj(tasks)) {
		return false;
	}

	/*
		// properties that should not be overwritten
		var sealedProps = $.arrayToMap([
			'plugins',
			'root',
			'file',
			'debug',
			'host',
			'log',
			'alert',
			'error',
			'tasks'
		])

		// define isolated context for plugins
		var context = $.shallowCopy({filter: this.filter}, this)

		plugins.forEach(function (el) {
			if (!el.plugin) {
				throw new Error('Did you forget to `npm i -D ' + el.name + '`?')
			}

			el.plugin.call(context, debug(el.name.replace('-', ':')), _('load %o', el.name))
		})

		// get differences between context object and main instance
		var changes = $.diff(this, context)
		applyChanges(changes, sealedProps, this)
	*/

	this[READY] = 1;
});
