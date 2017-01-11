'use strict';

const bb = require('bluebird');
const arrify = require('arrify');
const rimraf = bb.promisify(require('rimraf'));

/**
 * `fly-clear` stub
 * serves as test-util only
 */
const del = bb.coroutine(function * (src) {
	yield bb.all(arrify(src).map(g => rimraf(g)));
});

exports.del = del;
module.exports = del;
