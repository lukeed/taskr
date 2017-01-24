const Promise = require("bluebird")
const boot = require("./boot")
const co = Promise.coroutine

function Task(fly) {
	// construct shape
	this._ = {files: [], globs: [], prevs: []}
	// attach parent fns to Task
	this.parallel = fly.parallel
	this.serial = fly.serial
	this.start = fly.start
	this.emit = fly.emit
	// return chained methods + shared
	return boot(this)
}

Task.prototype.exec = function(fn, opts, data) {
	this._ = data
	return fn.call(this, this, opts)
}

Task.prototype.source = co(function * (obj) {
	// use Object.assign to write into original var
	// ~> will also write as `fly.tasks[].data` value
	Object.assign(this._, obj)
	yield Promise.delay(1)
})

module.exports = Task
