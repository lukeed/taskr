const Promise = require("bluebird")
const wrapp = require("./wrapp")
const util = require("./utils")
const boot = require("./boot")
const co = Promise.coroutine

function Task(fly) {
	// construct shape
	this.$ = util
	this._ = {files: [], globs: [], prevs: []}
	// attach parent fns to Task
	this.parallel = fly.parallel
	this.serial = fly.serial
	this.start = fly.start
	this.emit = fly.emit
	// attach `fly.plugins` to prototype
	for (const k in fly.plugins) {
		this[k] = fly.plugins[k].bind(this)
	}
	// return chained methods + shared
	return boot(this)
}

Task.prototype.exec = function(fn, opts, data) {
	// cache ref to `fly.tasks[].data` values
	this._ = data
	return fn.call(this, this, opts)
}

Task.prototype.run = co(function * (opts, func) {
	return yield wrapp(opts, func).call(this)
});

Task.prototype.source = require("./task/source");
Task.prototype.target = require("./task/target");

module.exports = Task
