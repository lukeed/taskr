'use strict';

const Promise = require('bluebird');
const arrify = require('arrify');
const co = Promise.coroutine;

module.exports = co(function * (dirs, opts) {
	dirs = arrify(dirs);
	console.log(`target received: ${dirs} and ${opts}`);
	yield 3;
});
