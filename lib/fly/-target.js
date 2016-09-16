'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;

module.exports = co(function * (dirs, opts) {
	console.log(`target received: ${dirs} and ${opts}`);
	yield 3;
});
