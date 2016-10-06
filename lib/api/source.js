'use strict';

const Promise = require('bluebird');
const flatten = require('flatten');
const arrify = require('arrify');
const co = Promise.coroutine;

module.exports = co(function * (globs, opts) {
	globs = flatten(arrify(globs));
	const files = yield this.$.expand(globs, opts);

	if (globs.length && !files.length) {
		this.emit('globs_no_match', globs);
	}

	// update internal's sources
	this._.globs = globs;
	this._.files = files;

	return this;
});
