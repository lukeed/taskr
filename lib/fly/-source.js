'use strict';

const Promise = require('bluebird');
const arrify = require('arrify');
const globby = require('globby');
const co = Promise.coroutine;

module.exports = co(function * (globs, opts) {
	globs = arrify(globs);

	// source ~> new beginning ~> reset `_`
	this._ = {
		globs: globs,
		files: yield globby(globs, opts)
		// files: yield this.unwrap(globs, opts)
	};

	return this;
});
