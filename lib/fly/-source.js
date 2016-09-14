'use strict';

const Promise = require('bluebird');
const arrify = require('arrify');
const globby = require('globby');
const co = Promise.coroutine;

module.exports = co(function * (globs, opts) {
	globs = arrify(globs);

	// update internal's sources
	this._.globs = globs;
	this._.files = yield this.$.expand(globs, opts);

	return this;
});
