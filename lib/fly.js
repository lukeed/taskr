const resolve = require("path").resolve
const Promise = require("bluebird")
const Emitter = require("events")
const Task = require("./task")
const $ = require("./helps")

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
			return this.emit("tasks_force_object")
		}

		// nothing to do, stop
		if (!file && $.isEmptyObj(tasks)) {
			return false
		}

		const taskObjs = {}
		for (let k in tasks) {
			taskObjs[k] = {
				data: {files: [], globs: [], prevs: []},
				func: co(tasks[k])
			}
		}

		// handle plugins

		this.file = file
		this.tasks = taskObjs
		// this.plugins = taskObjs
		this.root = resolve(opts.cwd || ".")

		this.start = co(this.start).bind(this)
		this.serial = co(this.serial).bind(this)
		this.parallel = co(this.parallel).bind(this)
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
			// obj.error = e
			// this.emit("task_error", obj)
			this.emit("task_error", name, err.message)
			throw err
		}
	}

	*parallel(tasks, opts) {
		try {
			yield Promise.all(tasks.map(t => this.start(t, opts)))
		} catch (err) {
			console.info("--- parallel error", err)
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
			self.emit("serial_error", err)
		}
	}
}

module.exports = Fly
