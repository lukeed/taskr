"use strict"

const res = require("path").resolve
const Emitter = require("events")
const utils = require("./utils")
const boot = require("./boot")

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
}

// attach methods to Fly.prototype
Fly.prototype.init = require("./api/init")
Fly.prototype.start = require("./api/start")
Fly.prototype.serial = require("./api/serial")
Fly.prototype.parallel = require("./api/parallel")
Fly.prototype.source = require("./api/source")
Fly.prototype.target = require("./api/target")
Fly.prototype.plugin = require("./api/plugin")
Fly.prototype.run = require("./api/run")

module.exports = Fly
