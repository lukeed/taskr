'use strict';

const toArr = require('arrify');
const Promise = require('bluebird');
const del = Promise.promisify(require('rimraf'));

module.exports = function (task) {
	task.plugin('clear', { every:false, files:false }, function * (_, globs, opts) {
		opts = opts || {};
		yield Promise.all(toArr(globs).map(g => del(g, opts)));
	});
};
