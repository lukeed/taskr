'use strict';

const c = require('chalk');

module.exports = {
	complete: c.blue.bold,
	start: c.bold.yellow,
	title: c.bold.yellow,
	error: c.bold.red,
	path: c.underline.cyan,
	warn: c.bold.magenta
};
// secs: c.green('%d %s')
