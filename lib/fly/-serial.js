'use strict';

const Promise = require('bluebird');
const co = Promise.coroutine;

module.exports = co(function * (tasks) {
	for (let task of tasks)  {
		// @todo: store & apply values
		yield this.start(task);
		// @todo: try/catch
		// @todo: throw on chain error
	}
});
