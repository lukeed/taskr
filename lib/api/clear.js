'use strict';

const Promise = require('bluebird');
const del = Promise.promisify(require('rimraf'));
const arrify = require('arrify');
const co = Promise.coroutine;

module.exports = co(function * (globs) {
	globs = arrify(globs);
	yield Promise.all(globs.map(g => del(g)));
});
