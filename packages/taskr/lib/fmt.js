'use strict';

const k = require('kleur');

module.exports = {
	complete: k.blue().bold,
	title: k.bold().yellow,
	error: k.bold().red,
	path: k.underline().cyan,
	warn: k.bold().magenta,
	text: k.bold().white,
	time: k.green
};
