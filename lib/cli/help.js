'use strict';

const fmt = require('../fmt');

// @todo: do something better here...
module.exports = function () {
	const one = `${fmt.text.dim('$1')}`;
	const two = `${fmt.text('$2')}`;
	const str = `
Usage
  fly [options] [tasks]

Options
  -h  --help      Display this help message.
  -f  --file      Use an alternate Flyfile.
  -l  --list      Display available tasks.
  -v  --version   Display Fly version.
	`;

	console.log(str
		.replace(/(\s--)(.*?)\s/g, `${one}${two}`)
		.replace(/(-)(.\s)/g, `${one}${two}`)
		.replace(/(^Options|^Usage)/gm, one)
		.replace(/([_\/\\]|[_,])/gm, one)
	);
};
