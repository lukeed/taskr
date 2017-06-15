'use strict';

const resolve = require('path').resolve;
const Concat = require('concat-with-sourcemaps');

const defs = {
	sep: '',
	map: false,
	base: '',
	output: null
};

module.exports = function (task) {
	const notify = (str, obj) => task.emit(`plugin_${str}`, Object.assign(obj, { plugin:'@taskr/concat' }));
	const warning = str => notify('warning', { warning:str });
	const error = str => notify('error', { error:str });

	task.plugin('concat', { every:false }, function * (arr, o) {
		if (typeof o === 'string') {
			o = { output:o };
		}

		o = Object.assign({}, defs, o);

		if (!o.output) {
			return error('Must receive an `output` filename.');
		}

		if (!arr.length) {
			return warning('No source files to concatenate!');
		}

		const bundle = new Concat(o.map, o.output, o.sep);

		for (const file of arr) {
			bundle.add(file.base, file.data, file.map || file.sourceMap);
		}

		// if did not specify a `base`, assume first file's location
		const dir = o.base ? resolve(task.root, o.base) : arr[0].dir;
		// concat'd content
		let data = bundle.content;

		// reset
		this._.files = [];

		if (o.map && bundle.sourceMap) {
			const mapFile = o.output.concat('.map');
			// add link to sourcemap file
			data += new Buffer(`\n//# sourceMappingURL=${mapFile}`);
			// add sourcemap file definition
			this._.files.push({
				dir: dir,
				base: mapFile,
				data: bundle.sourceMap
			});
		}

		// always add the concat'd file
		this._.files.push({
			dir: dir,
			base: o.output,
			data: data
		});
	});
};
