'use strict'

function Emitter() {
	this.events = []
}

/**
 * Observe an event
 * @param  {String}   name  The name of the event to observe
 * @param  {Function} cb    handler
 * @return {Emitter}
 */
Emitter.prototype.on = function (name, cb) {
	(this.events[name] = this.events[name] || []).push(cb)
	return this
}

/**
 * Emit an event to observers.
 * @param {String} name   The name of the event to emit.
 * @param {Object} obj    The data to send
 */
Emitter.prototype.emit = function (name, obj) {
	var self = this
	var evts = self.events[name] || []

	evts.forEach(function (event) {
		event.call(self, obj)
	})

	return self
}

module.exports = Emitter
