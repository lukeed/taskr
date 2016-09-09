'use strict';

const Emitter = require('../emitter');

class Fly extends Emitter {
	constructor(opts) {
		super(); // init Emitter

		opts = opts || {};

		this.file = opts.file;
		this.plugins = opts.plugins || [];
		this.tasks = opts.tasks || opts.file && require(opts.file) || {};
	}
}

// attach methods to Fly.prototype
Object.defineProperties(Fly.prototype, {
	init: {value: require('./-init')},
	start: {value: require('./-start')},
	serial: {value: require('./-serial')},
	parallel: {value: require('./-parallel')},
	source: {value: require('./-source')}
	// target: {value: require('./-target')},
});

module.exports = Fly;
