'use strict';

const $ = require('../utils');
const Emitter = require('../emitter');

class Fly extends Emitter {
	constructor(opts) {
		super(); // init Emitter

		opts = opts || {};

		this.$ = $;
		this.file = opts.file;
		this.plugins = opts.plugins || [];
		this.tasks = opts.tasks || opts.file && require(opts.file) || {};
	}
}

// attach methods to Fly.prototype
Object.defineProperties(Fly.prototype, {
	init: {value: require('./-init')},
	clear: {value: require('./-clear')},
	start: {value: require('./-start')},
	serial: {value: require('./-serial')},
	parallel: {value: require('./-parallel')},
	source: {value: require('./-source')},
	target: {value: require('./-target')}
});

module.exports = Fly;
