'use strict';

class Emitter {
	constructor() {
		this.events = [];
	}

	/**
	 * Observe an event
	 * @param  {String}   name  The name of the event to observe
	 * @param  {Function} cb    handler
	 * @return {Emitter}
	 */
	on(name, cb) {
		(this.events[name] = this.events[name] || []).push(cb);
		return this;
	}

	/**
	* Emit an event to observers.
	* @param {String} name  The name of the event to emit.
	* @param {Object} obj   The data to send.
	*/
	emit(name, obj) {
		(this.events[name] || []).forEach(evt => evt.call(this, obj));
		return this;
	}
}

module.exports = Emitter;
