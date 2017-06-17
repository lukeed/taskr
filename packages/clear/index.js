'use strict';

const Promise = require('bluebird');
const del = Promise.promisify(require('rimraf'));

const toArr = val => Array.isArray(val) ? val : (val == null) ? [] : [val];

module.exports = function (task) {
	task.plugin('clear', { every:false, files:false }, function * (_, globs, opts) {
		opts = opts || {};
		yield Promise.all(toArr(globs).map(g => del(g, opts)));
	});
};
