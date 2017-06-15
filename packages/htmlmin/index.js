'use strict';

const minify = require('html-minifier').minify;
const defs = require('./config');

module.exports = {
	name: 'htmlmin',
	* func(file, opts) {
		opts = Object.assign({}, defs, opts);
		const min = minify(file.data.toString(), opts);
		file.data = new Buffer(min);
	}
};
