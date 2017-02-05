"use strict"

const res = require("path").resolve
const Promise = require("bluebird")
const Emitter = require("events")
const wrapp = require("./wrapp")
const util = require("./utils")
const Task = require("./task")
const $ = require("./fn")

const co = Promise.coroutine

class Fly extends Emitter {
	constructor(opts) {
		super()

		opts = opts || {}

		const file = opts.file
		const plugins = opts.plugins || []
		const tasks = opts.tasks || file && require(file) || {}

		// if custom `tasks`, must be object
		if (!$.isObject(tasks)) {
			this.emit("tasks_force_object")
			return
		}

		this.file = file
		this.root = res(opts.cwd || ".")

		// construct V8 shapes
		this.tasks = {}
		this.plugins = {}
		this.plugNames = []

		this.start = co(this.start).bind(this)
		this.serial = co(this.serial).bind(this)
		this.parallel = co(this.parallel).bind(this)

		// nothing to do, stop
		if (!file && $.isEmptyObj(tasks)) {
			return
		}

		for (const k in tasks) {
			if (!(tasks[k].call)) continue
			this.tasks[k] = {
				data: {files: [], globs: [], prevs: []},
				func: co(tasks[k])
			}
		}

		let fn, i = 0
		for (; i < plugins.length; i++) {
			if (!plugins[i]) continue
			fn = plugins[i]
			if ($.isObject(fn)) {
				this.plugin(fn)
			} else if (fn.call) {
				fn.call(this, this, util)
			}
		}
	}

	plugin(name, opts, func) {
		// accept an object with all val
		if ($.isObject(name)) {
			opts = name
			name = opts.name
		}
		// check if plugin name exists
		const nxt = $.valUniq(name, this.plugNames)
		// if it did, emit event warning
		if (nxt !== name) {
			this.emit("plugin_rename", name, nxt)
		}
		// save / reserve plugin name
		this.plugNames.push(nxt)
		// safely attach to `plugins` object
		this.plugins[nxt] = wrapp(opts, func)
	}

	*start(name, opts) {
		name = name || "default"
		opts = Object.assign({src: null, val: null}, opts)

		const task = this.tasks[name]

		if (!task) {
			return this.emit("task_not_found", name)
		}

		// restore previous data, if any
		const old = task.data.prevs || []
		// new task ~> reset `data`
		task.data = {files: [], globs: [], prevs: old}

		try {
			// get start time
			const start = process.hrtime()
			// announce start
			this.emit("task_start", name)
			// attempt to execute
			const val = yield new Task(this).exec(task.func, opts, task.data)
			// announce completion
			const end = process.hrtime(start)
			this.emit("task_complete", name, end)
			// send back
			return val
		} catch (err) {
			this.emit("task_error", name, err.message)
			throw err
		}
	}

	*parallel(tasks, opts) {
		try {
			yield Promise.all(tasks.map(t => this.start(t, opts)))
		} catch (err) {
			//
		}
	}

	*serial(tasks, opts) {
		opts = opts || {}
		try {
			return yield Promise.reduce(tasks, (val, str) => {
				val && Object.assign(opts, { val })
				return this.start(str, opts)
			}, opts.val || null)
		} catch (err) {
			this.emit("serial_error")
		}
	}
}

module.exports = Fly
