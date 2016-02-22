'use strict';

var fmt = require('../fmt');

// @todo: do something better here...
module.exports = function () {
	console.log(
		'\nUsage\n  fly [options] [tasks]\n\nOptions\n  -h  --help      Display this help.\n  -f  --file      Use an alternate Flyfile.\n  -l  --list      Display available tasks.\n  -v  --version   Display version.\n  '
			.replace(/(\s--)(.*?)\s/g, '' + fmt.dim.bold('$1') + fmt.bold('$2'))
			.replace(/(-)(.\s)/g, '' + fmt.dim.bold('$1') + fmt.bold('$2'))
			.replace(/(^Options|^Usage)/gm, '' + fmt.dim.bold('$1'))
			.replace(/([_\/\\]|[_,])/gm, '' + fmt.dim.bold('$1'))
	);
};
