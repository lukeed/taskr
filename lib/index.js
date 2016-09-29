'use strict';

const Emitter = require('events');
const $ = require('./utils');

class Fly extends Emitter {
	constructor(opts) {
		super(); // init Emitter

		opts = opts || {};

		this.$ = $;
		this.file = opts.file;
		// this.root = dirname(opts.file) || process.cwd(); // need?
		this.plugins = opts.plugins || [];
		this.tasks = opts.tasks || opts.file && require(opts.file) || {};
	}
}

// attach methods to Fly.prototype
Object.defineProperties(Fly.prototype, {
	init: {value: require('./api/init')},
	clear: {value: require('./api/clear')},
	start: {value: require('./api/start')},
	serial: {value: require('./api/serial')},
	parallel: {value: require('./api/parallel')},
	source: {value: require('./api/source')},
	target: {value: require('./api/target')}
});

module.exports = Fly;
