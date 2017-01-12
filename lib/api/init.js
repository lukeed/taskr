"use strict"

const co = require("bluebird").coroutine
const $ = require("../fn")
const READY = "_ready"

module.exports = co(function* () {
	// shorthands (no destructuring in node < 6.6)
	const file = this.file
	const tasks = this.tasks

	// if custom `tasks`, must be object
	if (!$.isObject(tasks)) {
		return this.emit("tasks_force_object")
	}

	// bind all tasks to current Fly
	for (const k in tasks) {
		// @todo v3: remove binding
		this.tasks[k] = tasks[k].bind(this)
	}

	if (!file && $.isEmptyObj(tasks)) {
		return false
	}

	this[READY] = 1
})
