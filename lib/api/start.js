"use strict"

const co = require("bluebird").coroutine
const READY = "_ready"

const getTime = () => Date.now()

const defs = {
	src: null,
	val: null
}

module.exports = co(function * (name, opts) {
	name = name || "default"
	opts = Object.assign({}, defs, opts)

	if (!this[READY]) {
		this.init()
	}

	const obj = {task: name}
	const task = this.tasks[name]

	if (!task) {
		return this.emit("task_not_found", obj)
	}

	let val
	// get start time
	const start = getTime()
	// announce start
	this.emit("task_start", obj)
	// check for saved `watcher` globs
	const old = this._.prevs || null
	// start() ~> new beginning ~> reset `_`
	this._ = {globs: [], files: []}
	// restore previous info, if any
	old && (this._.prevs = old)

	try {
		// attempt to execute
		val = yield* task(this, opts)
		// announce completion
		obj.time = getTime() - start
		this.emit("task_complete", obj)
	} catch (e) {
		obj.error = e
		this.emit("task_error", obj)
		throw e
	}

	return val
})
