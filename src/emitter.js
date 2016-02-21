'use strict';

function Emitter () {
	this.events = [];
}

/**
 * Observe an event
 * @param  {String}   name 	The name of the event to observe
 * @param  {Function} cb   	handler
 * @return {Emitter}
 */
Emitter.prototype.on = function(name, cb) {
	(this.events[name] = this.events[name] || []).push(cb);
  return this;
};

/**
 * Emit an event to observers.
 * @param {String} name 	The name of the event to emit.
 * @param {Object} obj 		The data to send
 */
Emitter.prototype.emit = function(name, obj) {
  (this.events[name] || []).forEach((event) => event.call(this, obj));
  return this;
};

module.exports = Emitter;
