"use strict"

const res = require("path").resolve
const Emitter = require("events")
const utils = require("./utils")
const boot = require("./boot")
const $ = require("./fn")

const READY = "_ready"

class Fly extends Emitter {
	constructor(opts) {
		super()

		opts = opts || {}

		this._ = {}
		this.$ = utils
		this[READY] = false
		this.file = opts.file
		this.root = res(opts.cwd || ".")
		this.plugins = opts.plugins || []
		this.tasks = opts.tasks || opts.file && require(opts.file) || {}

		this.plugins.forEach(obj => obj.func
			? obj.func.call(this)
			: this.emit("plugin_load_error", obj.name))

		return boot(this)
	}

	init() {
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

		this[READY] = true
	}
}

// attach methods to Fly.prototype
Fly.prototype.start = require("./api/start")
Fly.prototype.serial = require("./api/serial")
Fly.prototype.parallel = require("./api/parallel")
Fly.prototype.source = require("./api/source")
Fly.prototype.target = require("./api/target")
Fly.prototype.plugin = require("./api/plugin")
Fly.prototype.run = require("./api/run")

module.exports = Fly
