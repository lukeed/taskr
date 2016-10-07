'use strict';

const res = require('path').resolve;
const Emitter = require('events');
const $ = require('./utils');

class Fly extends Emitter {
	constructor(opts) {
		super(); // init Emitter

		opts = opts || {};

		this.$ = $;
		this._ = {};
		this.file = opts.file;
		this.root = res(opts.pwd || '.');
		this.plugins = opts.plugins || [];
		this.tasks = opts.tasks || opts.file && require(opts.file) || {};
	}
}

// attach methods to Fly.prototype
Fly.prototype.init = require('./api/init');
Fly.prototype.clear = require('./api/clear');
Fly.prototype.start = require('./api/start');
Fly.prototype.serial = require('./api/serial');
Fly.prototype.parallel = require('./api/parallel');
Fly.prototype.source = require('./api/source');
Fly.prototype.target = require('./api/target');

module.exports = Fly;
